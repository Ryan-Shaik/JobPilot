import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { researchCompany, ResearchJobContext, ResearchCandidateProfile } from "@/agent/research";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
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
    const jobId = (body.jobId || "").trim();

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // 1. Fetch job record
    const { data: job, error: jobError } = await client.database
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .maybeSingle();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // 2. Fetch candidate profile
    const { data: profile } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const jobContext: ResearchJobContext = {
      id: job.id,
      company: job.company,
      title: job.title,
      about_role: job.about_role,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      external_apply_url: job.external_apply_url,
      source_url: job.source_url,
      matched_skills: job.matched_skills,
      missing_skills: job.missing_skills,
    };

    const candidateProfile: ResearchCandidateProfile | null = profile
      ? {
          full_name: profile.full_name,
          current_title: profile.current_title,
          experience_level: profile.experience_level,
          years_experience: profile.years_experience,
          skills: profile.skills,
          industries: profile.industries,
          work_experience: profile.work_experience,
        }
      : null;

    // 3. Execute research workflow
    const dossier = await researchCompany(jobContext, candidateProfile);

    // 4. Persist structured dossier to jobs table
    const { error: updateError } = await client.database
      .from("jobs")
      .update({
        company_research: dossier,
      })
      .eq("id", jobId)
      .eq("user_id", userId);

    if (updateError) {
      // Non-fatal, return the synthesized dossier
      console.error("Failed to update company_research in database:", updateError);
    }

    // 5. Track PostHog event
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: userId,
        event: "company_researched",
        properties: {
          jobId: job.id,
          company: job.company,
          hasSources: Boolean(dossier.sources && dossier.sources.length > 0),
        },
      });
      await posthog.shutdown();
    } catch {
      // Ignore analytics failures
    }

    return NextResponse.json({
      success: true,
      dossier,
    });
  } catch (error: any) {
    console.error("Error in company research API route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while researching the company.",
      },
      { status: 500 }
    );
  }
}
