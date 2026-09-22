import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { renderToBuffer, DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { ResumeDocument, ResumePDFData } from "@/lib/pdf/ResumePDF";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const client = createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      cookies: cookieStore,
    });

    const { data: userData, error: userError } =
      await client.auth.getCurrentUser();
    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email || "";

    // Parse body for client-provided form data (fallback to DB profile if missing)
    let bodyData: any = null;
    try {
      bodyData = await req.json();
    } catch {
      // Empty or non-JSON body is acceptable — we will read from DB
    }

    // Fetch existing profile from DB
    const { data: existingProfile } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // Merge body with existing DB data
    const profile = {
      full_name: bodyData?.full_name ?? existingProfile?.full_name ?? "",
      email: userEmail,
      phone: bodyData?.phone ?? existingProfile?.phone ?? "",
      location: bodyData?.location ?? existingProfile?.location ?? "",
      current_title: bodyData?.current_title ?? existingProfile?.current_title ?? "",
      experience_level: bodyData?.experience_level ?? existingProfile?.experience_level ?? null,
      years_experience: bodyData?.years_experience ?? existingProfile?.years_experience ?? null,
      skills: bodyData?.skills ?? existingProfile?.skills ?? [],
      industries: bodyData?.industries ?? existingProfile?.industries ?? [],
      work_experience: bodyData?.work_experience ?? existingProfile?.work_experience ?? [],
      education: bodyData?.education ?? existingProfile?.education ?? null,
      job_titles_seeking: bodyData?.job_titles_seeking ?? existingProfile?.job_titles_seeking ?? [],
      remote_preference: bodyData?.remote_preference ?? existingProfile?.remote_preference ?? "any",
      preferred_locations: bodyData?.preferred_locations ?? existingProfile?.preferred_locations ?? [],
      salary_expectation: bodyData?.salary_expectation ?? existingProfile?.salary_expectation ?? null,
      cover_letter_tone: bodyData?.cover_letter_tone ?? existingProfile?.cover_letter_tone ?? "formal",
      linkedin_url: bodyData?.linkedin_url ?? existingProfile?.linkedin_url ?? null,
      portfolio_url: bodyData?.portfolio_url ?? existingProfile?.portfolio_url ?? null,
      work_authorization: bodyData?.work_authorization ?? existingProfile?.work_authorization ?? null,
    };

    if (!profile.full_name || profile.full_name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your Full Name in the profile before generating a resume.",
        },
        { status: 400 }
      );
    }

    // Call Gemini 3.1 Flash Lite via OpenRouter to polish summary and work bullets
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY!,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "JobPilot",
      },
    });

    const aiPrompt = `You are an elite executive resume writer. Generate polished, professional resume content for the candidate profile below.

CANDIDATE DETAILS:
- Name: ${profile.full_name}
- Title / Target: ${profile.current_title || "Professional"}
- Experience Level: ${profile.experience_level || "Not specified"} (${profile.years_experience ?? 0} years)
- Skills: ${(profile.skills || []).join(", ")}
- Industries: ${(profile.industries || []).join(", ")}
- Work Experience:
${JSON.stringify(profile.work_experience || [], null, 2)}
- Education:
${JSON.stringify(profile.education || {}, null, 2)}

TASK:
1. Write a 2-3 sentence executive summary highlighting key strengths, domain expertise, and core value proposition.
2. For each work experience entry provided, transform their raw responsibilities/notes into 2-3 crisp, action-oriented bullet points starting with strong past-tense verbs (e.g., "Architected", "Spearheaded", "Engineered", "Optimized", "Scaled"). If responsibilities were empty, generate realistic, industry-standard bullet points matching the job title and company.

Return ONLY valid JSON matching this exact structure:
{
  "summary": string,
  "workExperience": [
    {
      "company": string,
      "jobTitle": string,
      "bullets": string[]
    }
  ]
}`;

    let aiSummary = "";
    let aiWorkExperience: Array<{ company: string; jobTitle: string; bullets: string[] }> = [];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3.1-flash-lite",
        temperature: 0.5,
        messages: [{ role: "user", content: aiPrompt }],
      });

      const responseText = (completion.choices[0]?.message?.content ?? "").trim();
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      aiSummary = parsed.summary || "";
      aiWorkExperience = Array.isArray(parsed.workExperience) ? parsed.workExperience : [];
    } catch (err) {
      console.warn("[resume/generate] AI refinement fallback triggered:", err);
      // Fallback summary if AI fails
      aiSummary = `${profile.full_name} is an experienced ${profile.current_title || "professional"} with a background in ${(profile.industries || []).join(", ") || "technology"}. Proven track record in ${(profile.skills || []).slice(0, 4).join(", ") || "problem solving and execution"}.`;
    }

    // Merge AI generated bullets back with original dates & metadata
    const finalWorkExperience = (profile.work_experience || []).map((exp: any, index: number) => {
      const aiMatch = aiWorkExperience[index] || aiWorkExperience.find(
        (a) => a.company?.toLowerCase() === exp.company?.toLowerCase()
      );
      const bullets = aiMatch?.bullets?.length
        ? aiMatch.bullets
        : exp.responsibilities
        ? exp.responsibilities.split("\n").map((b: string) => b.replace(/^[-*•]\s*/, "").trim()).filter(Boolean)
        : [`Contributed as ${exp.jobTitle || "team member"} at ${exp.company || "organization"}.`];

      return {
        company: exp.company || "",
        jobTitle: exp.jobTitle || "",
        startMonth: exp.startMonth || "",
        startYear: exp.startYear || "",
        endMonth: exp.endMonth || "",
        endYear: exp.endYear || "",
        isCurrent: Boolean(exp.isCurrent),
        bullets,
      };
    });

    const resumePDFData: ResumePDFData = {
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      currentTitle: profile.current_title,
      linkedinUrl: profile.linkedin_url,
      portfolioUrl: profile.portfolio_url,
      summary: aiSummary,
      workExperience: finalWorkExperience,
      education: profile.education,
      skills: profile.skills || [],
      industries: profile.industries || [],
    };

    // Render PDF buffer using @react-pdf/renderer
    const pdfElement = React.createElement(ResumeDocument, {
      data: resumePDFData,
    }) as unknown as React.ReactElement<DocumentProps>;
    const pdfBuffer = await renderToBuffer(pdfElement);

    // Convert Buffer to File for InsForge Storage upload
    const fileName = "resume.pdf";
    const storageKey = `${userId}/${fileName}`;
    const pdfFile = new File([new Uint8Array(pdfBuffer)], fileName, {
      type: "application/pdf",
    });

    // Remove old resume if exists
    if (existingProfile?.resume_pdf_key) {
      const { error: removeError } = await client.storage
        .from("resumes")
        .remove(existingProfile.resume_pdf_key);
      if (removeError) {
        console.warn("[resume/generate] Old file removal non-fatal:", removeError.message);
      }
    }

    // Upload newly generated PDF
    const { data: uploadData, error: uploadError } = await client.storage
      .from("resumes")
      .upload(storageKey, pdfFile);

    if (uploadError || !uploadData) {
      console.error("[resume/generate] Storage upload error:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to store generated PDF: ${uploadError?.message || "Storage error"}`,
        },
        { status: 500 }
      );
    }

    const resumePdfUrl = uploadData.url;
    const resumePdfKey = uploadData.key;

    // Calculate completeness
    const missingFields: string[] = [];
    if (!profile.full_name) missingFields.push("FULL_NAME");
    if (!profile.phone) missingFields.push("PHONE");
    if (!profile.location) missingFields.push("LOCATION");
    if (!profile.current_title) missingFields.push("CURRENT_TITLE");
    if (!profile.experience_level) missingFields.push("EXPERIENCE_LEVEL");
    if (profile.years_experience === null || isNaN(profile.years_experience)) missingFields.push("YEARS_EXPERIENCE");
    if (!profile.skills || profile.skills.length === 0) missingFields.push("SKILLS");
    if (!profile.industries || profile.industries.length === 0) missingFields.push("INDUSTRIES");
    if (!profile.job_titles_seeking || profile.job_titles_seeking.length === 0) missingFields.push("JOB_TITLES_SEEKING");

    const isEducationFilled =
      profile.education &&
      profile.education.highestDegree &&
      profile.education.highestDegree !== "none" &&
      profile.education.institutionName &&
      profile.education.fieldOfStudy;
    if (!isEducationFilled) missingFields.push("EDUCATION");

    const totalCoreFields = 10;
    const missingCount = missingFields.length;
    const completionPercentage = Math.round(((totalCoreFields - missingCount) / totalCoreFields) * 100);
    const isComplete = completionPercentage === 100;

    // Update/upsert profile in DB
    const profilePayload = {
      id: userId,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone || null,
      location: profile.location || null,
      current_title: profile.current_title || null,
      experience_level: profile.experience_level || null,
      years_experience: profile.years_experience,
      skills: profile.skills,
      industries: profile.industries,
      work_experience: profile.work_experience,
      education: profile.education,
      job_titles_seeking: profile.job_titles_seeking,
      remote_preference: profile.remote_preference || "any",
      preferred_locations: profile.preferred_locations,
      salary_expectation: profile.salary_expectation,
      cover_letter_tone: profile.cover_letter_tone || "formal",
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      work_authorization: profile.work_authorization,
      resume_pdf_url: resumePdfUrl,
      resume_pdf_key: resumePdfKey,
      is_complete: isComplete,
      updated_at: new Date().toISOString(),
    };

    if (existingProfile) {
      await client.database
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);
    } else {
      await client.database
        .from("profiles")
        .insert([profilePayload]);
    }

    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      url: resumePdfUrl,
      key: resumePdfKey,
      data: {
        profile: profilePayload,
        completionPercentage,
        missingFields,
      },
    });
  } catch (error) {
    console.error("[resume/generate] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
