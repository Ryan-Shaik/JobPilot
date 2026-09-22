import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { searchJobs, AdzunaJob } from "@/lib/adzuna";
import { batchScoreJobsAgainstProfile, UserProfileContext } from "@/lib/agent/scoring";
import { getPostHogClient } from "@/lib/posthog-server";

function formatSalary(job: AdzunaJob): string | null {
  if (job.salary_min && job.salary_max) {
    const minK = Math.round(job.salary_min / 1000);
    const maxK = Math.round(job.salary_max / 1000);
    return minK === maxK ? `$${minK}k` : `$${minK}k - $${maxK}k`;
  }
  if (job.salary_min) {
    return `$${Math.round(job.salary_min / 1000)}k+`;
  }
  return null;
}

function mapJobType(contractType?: string, contractTime?: string): "fulltime" | "parttime" | "contract" | null {
  const typeStr = (contractType || contractTime || "").toLowerCase();
  if (typeStr.includes("part")) return "parttime";
  if (typeStr.includes("contract") || typeStr.includes("temp")) return "contract";
  if (typeStr.includes("full") || typeStr.includes("perm")) return "fulltime";
  return null;
}

export async function POST(req: NextRequest) {
  let runId: string | null = null;
  const cookieStore = await cookies();
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = userData.user.id;

  try {
    const body = await req.json();
    const jobTitle = (body.jobTitle || "").trim();
    const location = (body.location || "").trim();

    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: "Job title or search keyword is required." },
        { status: 400 }
      );
    }

    // 1. Fetch user's profile for matching context
    const { data: profileData } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const userProfile = profileData as UserProfileContext | null;

    // 2. Initialize agent run in DB
    const { data: runData, error: runError } = await client.database
      .from("agent_runs")
      .insert([
        {
          user_id: userId,
          status: "running",
          job_title_searched: jobTitle,
          location_searched: location || null,
          jobs_found: 0,
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (runError || !runData) {
      console.error("[agent/find] Failed to initialize agent run:", runError);
      return NextResponse.json(
        { success: false, error: "Failed to initialize search run." },
        { status: 500 }
      );
    }

    runId = runData.id;

    // 3. Track PostHog event: job_search_started
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: userId,
        event: "job_search_started",
        properties: {
          job_title: jobTitle,
          location: location || "Any / Remote",
          run_id: runId,
        },
      });
    } catch (phErr) {
      console.warn("[agent/find] PostHog tracking error (job_search_started):", phErr);
    }

    // 4. Fetch jobs from Adzuna across all categories
    let adzunaJobs: AdzunaJob[] = [];
    try {
      adzunaJobs = await searchJobs(jobTitle, location);
    } catch (adzunaErr) {
      console.error("[agent/find] Adzuna search failed:", adzunaErr);
      await client.database
        .from("agent_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      await client.database.from("agent_logs").insert([
        {
          run_id: runId,
          user_id: userId,
          message: `Adzuna search failed: ${adzunaErr instanceof Error ? adzunaErr.message : String(adzunaErr)}`,
          level: "error",
        },
      ]);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to search job listings. Please check your query or try again.",
        },
        { status: 502 }
      );
    }

    if (adzunaJobs.length === 0) {
      // Mark run as completed with 0 results
      await client.database
        .from("agent_runs")
        .update({
          status: "completed",
          jobs_found: 0,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      await client.database.from("agent_logs").insert([
        {
          run_id: runId,
          user_id: userId,
          message: `Search completed with 0 listings found for "${jobTitle}".`,
          level: "info",
        },
      ]);

      return NextResponse.json({
        success: true,
        runId,
        jobsFound: 0,
        strongMatchesCount: 0,
        jobs: [],
        message: `No active jobs found for "${jobTitle}". Try adjusting your keywords.`,
      });
    }

    // 5. Batch score jobs against profile via AI (OpenRouter / Gemini)
    const scoresMap = await batchScoreJobsAgainstProfile(adzunaJobs, userProfile);

    // 6. Map to database jobs table schema
    const jobRecords = adzunaJobs.map((job) => {
      const scoreData = scoresMap.get(String(job.id)) || {
        id: String(job.id),
        matchScore: 75,
        matchReason: `Matches requirements for ${job.title}.`,
        matchedSkills: [],
        missingSkills: [],
      };

      return {
        run_id: runId,
        user_id: userId,
        source: "search" as const,
        source_url: job.redirect_url,
        external_apply_url: job.redirect_url,
        title: job.title,
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || (location || "Not specified"),
        salary: formatSalary(job),
        job_type: mapJobType(job.contract_type, job.contract_time),
        about_role: job.description || null,
        responsibilities: [],
        requirements: [],
        nice_to_have: [],
        benefits: [],
        about_company: null,
        match_score: scoreData.matchScore,
        match_reason: scoreData.matchReason,
        matched_skills: scoreData.matchedSkills,
        missing_skills: scoreData.missingSkills,
        found_at: new Date().toISOString(),
      };
    });

    // 7. Bulk insert jobs into InsForge database
    const { data: insertedJobs, error: jobsInsertError } = await client.database
      .from("jobs")
      .insert(jobRecords)
      .select();

    if (jobsInsertError) {
      console.error("[agent/find] Error saving jobs to database:", jobsInsertError);
      await client.database
        .from("agent_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      return NextResponse.json(
        { success: false, error: "Failed to persist discovered jobs." },
        { status: 500 }
      );
    }

    const savedJobs = insertedJobs || [];
    const strongMatches = savedJobs.filter((j: { match_score: number }) => j.match_score >= 80);

    // 8. Update agent_run record to completed
    await client.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: savedJobs.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    // 9. Insert completion log into agent_logs
    await client.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        message: `Successfully discovered and scored ${savedJobs.length} live jobs (${strongMatches.length} strong matches).`,
        level: "success",
      },
    ]);

    // 10. PostHog tracking: job_found for discovered jobs
    try {
      const posthog = getPostHogClient();
      for (const job of savedJobs) {
        posthog.capture({
          distinctId: userId,
          event: "job_found",
          properties: {
            job_id: job.id,
            title: job.title,
            company: job.company,
            match_score: job.match_score,
            source: "search",
            run_id: runId,
          },
        });
      }
    } catch (phErr) {
      console.warn("[agent/find] PostHog tracking error (job_found):", phErr);
    }

    return NextResponse.json({
      success: true,
      runId,
      jobsFound: savedJobs.length,
      strongMatchesCount: strongMatches.length,
      jobs: savedJobs,
      message: `Found ${savedJobs.length} jobs and saved ${strongMatches.length} strong matches.`,
    });
  } catch (error) {
    console.error("[agent/find] Unexpected error:", error);

    if (runId) {
      try {
        await client.database
          .from("agent_runs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId);
      } catch {}
    }

    return NextResponse.json(
      { success: false, error: "Internal server error occurred while searching jobs." },
      { status: 500 }
    );
  }
}
