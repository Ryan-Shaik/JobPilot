import OpenAI from "openai";
import { AdzunaJob } from "@/lib/adzuna";

export interface JobMatchScore {
  id: string;
  matchScore: number; // 0 - 100
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface UserProfileContext {
  full_name?: string | null;
  current_title?: string | null;
  experience_level?: string | null;
  years_experience?: number | null;
  skills?: string[];
  industries?: string[];
  work_experience?: Array<{
    company?: string;
    jobTitle?: string;
    responsibilities?: string;
  }>;
  education?: {
    highestDegree?: string;
    fieldOfStudy?: string;
    institutionName?: string;
  };
  job_titles_seeking?: string[];
  remote_preference?: string | null;
  preferred_locations?: string[];
}

/**
 * Evaluates a batch of Adzuna job listings against a candidate's profile in a single LLM request.
 */
export async function batchScoreJobsAgainstProfile(
  jobs: AdzunaJob[],
  profile: UserProfileContext | null
): Promise<Map<string, JobMatchScore>> {
  const scoresMap = new Map<string, JobMatchScore>();
  if (!jobs || jobs.length === 0) {
    return scoresMap;
  }

  // Provide baseline scores if no profile is available yet
  if (!profile) {
    for (const job of jobs) {
      scoresMap.set(job.id, {
        id: job.id,
        matchScore: 75,
        matchReason: "General match based on search keyword. Complete your profile for personalized AI scoring.",
        matchedSkills: [],
        missingSkills: [],
      });
    }
    return scoresMap;
  }

  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    console.warn("[scoring] OPENROUTER_API_KEY is not configured, applying heuristic scoring.");
    for (const job of jobs) {
      scoresMap.set(job.id, {
        id: job.id,
        matchScore: 80,
        matchReason: "Heuristic match for " + job.title,
        matchedSkills: profile.skills?.slice(0, 3) || [],
        missingSkills: [],
      });
    }
    return scoresMap;
  }

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "JobPilot",
    },
  });

  const profileSummary = {
    current_title: profile.current_title ?? "Not specified",
    experience_level: profile.experience_level ?? "Not specified",
    years_experience: profile.years_experience ?? "Not specified",
    skills: profile.skills ?? [],
    industries: profile.industries ?? [],
    job_titles_seeking: profile.job_titles_seeking ?? [],
    work_experience: (profile.work_experience || []).slice(0, 3).map((w) => ({
      title: w.jobTitle,
      company: w.company,
      responsibilities: (w.responsibilities || "").substring(0, 200),
    })),
    education: profile.education ?? {},
  };

  const jobsToScore = jobs.map((j) => ({
    id: String(j.id),
    title: j.title,
    company: j.company?.display_name || "Unknown Company",
    location: j.location?.display_name || "Unknown Location",
    description: (j.description || "").substring(0, 500),
  }));

  const prompt = `You are an expert career advisor and ATS matching engine. 
Compare the candidate's profile against each of the following job listings and evaluate how well they match.

CANDIDATE PROFILE:
${JSON.stringify(profileSummary, null, 2)}

JOBS TO EVALUATE:
${JSON.stringify(jobsToScore, null, 2)}

TASK:
Score each job from 0 to 100 based on alignment of skills, experience level, domain/industry, and role requirements.
Return a valid JSON array of objects with the exact schema below for every job (matching the provided job id):

[
  {
    "id": "job_id_as_string",
    "matchScore": integer (0 to 100),
    "matchReason": "1-2 concise sentences explaining why this job is or isn't a great match.",
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"]
  }
]

CRITICAL RULES:
- Return ONLY the raw JSON array. No markdown code fences, no extra commentary.
- Every job in the input list must have a corresponding item in the array with the exact same id.
- matchScore must be an integer between 0 and 100.
- matchedSkills should be specific skills from the user's profile that are relevant to the job.
- missingSkills should be key skills or qualifications the job requires that are not listed in the candidate's profile.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-3.1-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = (completion.choices[0]?.message?.content ?? "").trim();
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Array<{
      id: string | number;
      matchScore: number;
      matchReason: string;
      matchedSkills?: string[];
      missingSkills?: string[];
    }>;

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const jobIdStr = String(item.id);
        const score = Math.max(0, Math.min(100, Math.round(Number(item.matchScore) || 70)));
        scoresMap.set(jobIdStr, {
          id: jobIdStr,
          matchScore: score,
          matchReason: item.matchReason || "Match evaluated based on your profile and skills.",
          matchedSkills: Array.isArray(item.matchedSkills) ? item.matchedSkills : [],
          missingSkills: Array.isArray(item.missingSkills) ? item.missingSkills : [],
        });
      }
    }
  } catch (error) {
    console.error("[scoring] Error during batch scoring:", error);
  }

  // Fallback for any job that was missing or failed in parsing
  for (const job of jobs) {
    const idStr = String(job.id);
    if (!scoresMap.has(idStr)) {
      scoresMap.set(idStr, {
        id: idStr,
        matchScore: 75,
        matchReason: `Matches role criteria for ${job.title}.`,
        matchedSkills: profile.skills?.slice(0, 3) || [],
        missingSkills: [],
      });
    }
  }

  return scoresMap;
}
