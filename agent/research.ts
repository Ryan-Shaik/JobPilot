import OpenAI from "openai";
import { fetchRenderedPage, extractTextAndSublinks } from "@/lib/browserless";
import { CompanyResearchDossier } from "@/components/job-details/CompanyResearch";

export interface ResearchCandidateProfile {
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
}

export interface ResearchJobContext {
  id: string;
  company: string;
  title?: string | null;
  about_role?: string | null;
  responsibilities?: string[] | null;
  requirements?: string[] | null;
  external_apply_url?: string | null;
  source_url?: string | null;
  matched_skills?: string[] | null;
  missing_skills?: string[] | null;
}

/**
 * Resolves the company homepage URL by inspecting the redirect URL or normalizing the company name.
 */
export async function resolveCompanyHomepageUrl(
  redirectUrl?: string | null,
  companyName: string = ""
): Promise<string> {
  const cleanCompanyName = companyName
    .replace(/\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation|Company|Co\.?|Group|Technologies|Tech)\b.*$/gi, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const fallbackUrl = `https://www.${cleanCompanyName || "company"}.com`;

  if (!redirectUrl) {
    return fallbackUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(redirectUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const finalUrl = response.url;
    if (finalUrl && !finalUrl.includes("adzuna.")) {
      const parsed = new URL(finalUrl);
      const hostParts = parsed.hostname.split(".");
      if (hostParts.length >= 2) {
        // Extract root domain (e.g. jobs.stripe.com -> stripe.com, careers.google.co.uk -> google.co.uk)
        const rootDomain =
          hostParts.length > 2 && ["co", "com", "org", "gov", "net"].includes(hostParts[hostParts.length - 2])
            ? hostParts.slice(-3).join(".")
            : hostParts.slice(-2).join(".");

        return `https://${rootDomain}`;
      }
      return `${parsed.protocol}//${parsed.hostname}`;
    }
  } catch {
    // If redirect resolution fails, use fallback URL
  }

  return fallbackUrl;
}

/**
 * Researches a company using Browserless web scraping and synthesizes a structured briefing with Gemini.
 */
export async function researchCompany(
  job: ResearchJobContext,
  profile: ResearchCandidateProfile | null
): Promise<CompanyResearchDossier> {
  const targetApplyUrl = job.external_apply_url || job.source_url || null;
  const homepageUrl = await resolveCompanyHomepageUrl(targetApplyUrl, job.company);

  const sources: string[] = [];
  const scrapedSections: string[] = [];

  // 1. Fetch homepage with Browserless
  try {
    const homepageHtml = await fetchRenderedPage(homepageUrl, 15000);
    sources.push(homepageUrl);
    const { text, sublinks } = extractTextAndSublinks(homepageHtml, homepageUrl);
    if (text) {
      scrapedSections.push(`[Homepage Content (${homepageUrl})]:\n${text}`);
    }

    // 2. Fetch top 2 sub-pages (About, Team, Engineering, etc.)
    if (sublinks.length > 0) {
      const topSublinks = sublinks.slice(0, 2);
      const subpageResults = await Promise.allSettled(
        topSublinks.map((subUrl) => fetchRenderedPage(subUrl, 12000))
      );

      subpageResults.forEach((res, index) => {
        const subUrl = topSublinks[index];
        if (res.status === "fulfilled" && res.value) {
          sources.push(subUrl);
          const { text: subText } = extractTextAndSublinks(res.value, subUrl);
          if (subText) {
            scrapedSections.push(`[Sub-page Content (${subUrl})]:\n${subText}`);
          }
        }
      });
    }
  } catch {
    // Web fetching failure: proceed gracefully to synthesis with DB context alone
  }

  // 3. Prepare AI synthesis prompt
  const companyWebContent = scrapedSections.join("\n\n---\n\n").trim();
  const jobInfoFormatted = [
    `Title: ${job.title || "Software Professional"}`,
    `Company: ${job.company}`,
    `Description: ${job.about_role || ""}`,
    job.responsibilities?.length ? `Responsibilities:\n- ${job.responsibilities.join("\n- ")}` : "",
    job.requirements?.length ? `Requirements:\n- ${job.requirements.join("\n- ")}` : "",
    job.matched_skills?.length ? `Matched Skills: ${job.matched_skills.join(", ")}` : "",
    job.missing_skills?.length ? `Missing / Gap Skills: ${job.missing_skills.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const candidateProfileFormatted = profile
    ? [
        `Candidate Title: ${profile.current_title || "Developer"}`,
        `Experience Level: ${profile.experience_level || "Not specified"} (${profile.years_experience || 0} years)`,
        `Skills: ${(profile.skills || []).join(", ") || "General software development"}`,
        profile.work_experience?.length
          ? `Work History:\n${profile.work_experience.map((w) => `- ${w.jobTitle || "Role"} at ${w.company || "Company"}: ${w.responsibilities || ""}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "Candidate profile not yet filled.";

  const systemPrompt = `You are an elite career strategist and executive interview coach preparing a candidate for a role at ${job.company}.
You are provided with:
1. Public website research collected from the company's website (if available).
2. The job posting details and requirements.
3. The candidate's background, skills, and work history.

Your goal is to produce a concrete, high-impact candidate briefing dossier that gives this candidate a distinct competitive advantage.

Rules:
- Ground every claim in the company's real products, stack, and mission. If web research is limited, infer carefully and logically from the job description and company domain.
- "yourEdge" MUST connect the candidate's actual skills and experience directly to what this company needs.
- "gapsToAddress" MUST reframe any missing skills into positive positioning strategies (e.g. adjacent knowledge, rapid learning curves).
- "smartQuestions" MUST be insightful, non-generic questions demonstrating in-depth homework on the company and role.
- Keep every point concise, crisp, and actionable.

Return ONLY a valid JSON object matching this exact schema:
{
  "companyOverview": "Concise paragraph explaining what the company builds, who their customers are, and their market positioning.",
  "techStack": ["Specific technologies, frameworks, infrastructure, and tools used or requested"],
  "culture": ["3-5 concrete bullet points on values, working style, team philosophy, and environment"],
  "whyThisRole": "Clear explanation of why this role exists and its impact on the team/company.",
  "yourEdge": ["3-4 specific bullet points linking this candidate's strengths to company problems"],
  "gapsToAddress": ["2-3 strategic talking points to address missing skills with adjacent experience"],
  "smartQuestions": ["3-4 sharp, high-level questions to ask interviewers about architecture, team, or strategy"],
  "interviewPrep": ["3-4 key technical or behavioral focus areas to review prior to interviewing"],
  "sources": ["List of source URLs analyzed, e.g. company homepage"]
}`;

  const userPrompt = `COMPANY RESEARCH (from public pages):
${companyWebContent || "(No direct web pages scraped - synthesize from job context)"}

JOB POSTING DETAILS:
${jobInfoFormatted}

CANDIDATE BACKGROUND:
${candidateProfileFormatted}`;

  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (apiKey) {
    try {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });

      const completion = await openai.chat.completions.create({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.35,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (content) {
        const parsed = JSON.parse(content);
        return {
          companyOverview: parsed.companyOverview || `${job.company} is actively hiring for the ${job.title || "open"} role.`,
          techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
          culture: Array.isArray(parsed.culture) ? parsed.culture : [],
          whyThisRole: parsed.whyThisRole || `To scale and build key initiatives within ${job.company}.`,
          yourEdge: Array.isArray(parsed.yourEdge) ? parsed.yourEdge : [],
          gapsToAddress: Array.isArray(parsed.gapsToAddress) ? parsed.gapsToAddress : [],
          smartQuestions: Array.isArray(parsed.smartQuestions) ? parsed.smartQuestions : [],
          interviewPrep: Array.isArray(parsed.interviewPrep) ? parsed.interviewPrep : [],
          sources: sources.length > 0 ? sources : (Array.isArray(parsed.sources) && parsed.sources.length > 0 ? parsed.sources : [homepageUrl]),
        };
      }
    } catch {
      // Fallback below if LLM request encounters an issue
    }
  }

  // Graceful fallback dossier if LLM is unavailable
  return {
    companyOverview: `${job.company} is hiring for ${job.title || "this position"}. This role is focused on expanding their technical capabilities and driving core product outcomes.`,
    techStack: job.matched_skills && job.matched_skills.length > 0 ? job.matched_skills : ["Modern Web Technologies", "Cloud Infrastructure"],
    culture: [
      "Collaborative and problem-solving focused environment",
      "High ownership over technical deliverables and feature quality",
      "Emphasis on continuous learning and modern best practices",
    ],
    whyThisRole: `This role is responsible for architecting and executing key initiatives supporting ${job.company}'s growth.`,
    yourEdge: (job.matched_skills || []).map(
      (s) => `Proven experience in ${s} matches core responsibilities for this role.`
    ),
    gapsToAddress: (job.missing_skills || []).map(
      (s) => `Highlight rapid onboarding ability and related tooling experience to bridge ${s}.`
    ),
    smartQuestions: [
      `What are the most critical milestones for this role during the first 90 days?`,
      `How does the engineering team prioritize technical debt versus feature velocity?`,
      `What architectural challenges is ${job.company} preparing for over the next year?`,
    ],
    interviewPrep: [
      "Prepare system design and architecture examples from recent projects",
      "Review past technical trade-offs and decision-making frameworks",
      `Be ready to discuss core requirements: ${(job.matched_skills || []).slice(0, 3).join(", ") || "key skills"}`,
    ],
    sources: sources.length > 0 ? sources : [homepageUrl],
  };
}
