"use server";

import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveProfileAction(formData: FormData) {
  const cookieStore = await cookies();
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = userData.user.id;

  // Handle Resume Upload if present
  let resumePdfUrl = formData.get("resume_pdf_url") as string || null;
  let resumePdfKey = formData.get("resume_pdf_key") as string || null;
  const resumeFile = formData.get("resume") as File | null;

  if (resumeFile && resumeFile.size > 0 && resumeFile.name) {
    // Delete the old resume from storage if one exists
    const oldKey = formData.get("resume_pdf_key") as string | null;
    if (oldKey) {
      const { error: removeError } = await client.storage
        .from("resumes")
        .remove(oldKey);
      if (removeError) {
        // Non-fatal: log and continue — the upload will still succeed
        console.warn("Failed to remove old resume:", removeError.message);
      }
    }

    // Use the original filename so storage reflects what the user uploaded
    const safeFileName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${userId}/${safeFileName}`;

    const { data: uploadData, error: uploadError } = await client.storage
      .from("resumes")
      .upload(key, resumeFile);

    if (uploadError) {
      console.error("Resume Upload Error:", uploadError);
      return { success: false, error: `Failed to upload resume: ${uploadError.message}` };
    }

    if (uploadData) {
      resumePdfUrl = uploadData.url;
      resumePdfKey = uploadData.key;
    }
  }

  // Extract other fields
  const fullName = formData.get("full_name") as string || null;
  const phone = formData.get("phone") as string || null;
  const location = formData.get("location") as string || null;
  const currentTitle = formData.get("current_title") as string || null;
  const experienceLevel = formData.get("experience_level") as string || null;
  
  const yearsExpRaw = formData.get("years_experience");
  const yearsExperience = yearsExpRaw ? parseInt(yearsExpRaw as string, 10) : null;

  const linkedinUrl = formData.get("linkedin_url") as string || null;
  const portfolioUrl = formData.get("portfolio_url") as string || null;
  const workAuthorization = formData.get("work_authorization") as string || null;
  
  const remotePreference = formData.get("remote_preference") as string || null;
  const salaryExpectation = formData.get("salary_expectation") as string || null;
  const coverLetterTone = formData.get("cover_letter_tone") as string || null;

  // Parse JSON-serialized arrays/objects
  let skills: string[] = [];
  try {
    const raw = formData.get("skills") as string;
    if (raw) skills = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse skills:", e);
  }

  let industries: string[] = [];
  try {
    const raw = formData.get("industries") as string;
    if (raw) industries = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse industries:", e);
  }

  let jobTitlesSeeking: string[] = [];
  try {
    const raw = formData.get("job_titles_seeking") as string;
    if (raw) {
      try {
        jobTitlesSeeking = JSON.parse(raw);
      } catch {
        jobTitlesSeeking = raw.split(",").map(t => t.trim()).filter(Boolean);
      }
    }
  } catch (e) {
    console.error("Failed to parse job_titles_seeking:", e);
  }

  let preferredLocations: string[] = [];
  try {
    const raw = formData.get("preferred_locations") as string;
    if (raw) {
      try {
        preferredLocations = JSON.parse(raw);
      } catch {
        preferredLocations = raw.split(",").map(l => l.trim()).filter(Boolean);
      }
    }
  } catch (e) {
    console.error("Failed to parse preferred_locations:", e);
  }

  let workExperience: any[] = [];
  try {
    const raw = formData.get("work_experience") as string;
    if (raw) workExperience = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse work_experience:", e);
  }

  let education: any = {};
  try {
    const raw = formData.get("education") as string;
    if (raw) education = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse education:", e);
  }

  // Calculate completeness & missing fields
  const missingFields: string[] = [];
  
  if (!fullName) missingFields.push("FULL_NAME");
  if (!phone) missingFields.push("PHONE");
  if (!location) missingFields.push("LOCATION");
  if (!currentTitle) missingFields.push("CURRENT_TITLE");
  if (!experienceLevel) missingFields.push("EXPERIENCE_LEVEL");
  if (yearsExperience === null || isNaN(yearsExperience)) missingFields.push("YEARS_EXPERIENCE");
  if (skills.length === 0) missingFields.push("SKILLS");
  if (industries.length === 0) missingFields.push("INDUSTRIES");
  if (jobTitlesSeeking.length === 0) missingFields.push("JOB_TITLES_SEEKING");
  
  const isEducationFilled = education && 
    education.highestDegree && 
    education.highestDegree !== "none" && 
    education.institutionName && 
    education.fieldOfStudy;
  if (!isEducationFilled) missingFields.push("EDUCATION");

  const totalCoreFields = 10;
  const missingCount = missingFields.length;
  const completionPercentage = Math.round(((totalCoreFields - missingCount) / totalCoreFields) * 100);
  const isComplete = completionPercentage === 100;

  // Profiles Payload
  const profilePayload = {
    id: userId,
    full_name: fullName,
    email: userData.user.email,
    phone,
    location,
    current_title: currentTitle,
    experience_level: experienceLevel || null,
    years_experience: yearsExperience !== null && !isNaN(yearsExperience) ? yearsExperience : null,
    skills,
    industries,
    work_experience: workExperience,
    education,
    job_titles_seeking: jobTitlesSeeking,
    remote_preference: remotePreference || "any",
    preferred_locations: preferredLocations,
    salary_expectation: salaryExpectation,
    cover_letter_tone: coverLetterTone || "formal",
    linkedin_url: linkedinUrl,
    portfolio_url: portfolioUrl,
    work_authorization: workAuthorization || null,
    resume_pdf_url: resumePdfUrl,
    resume_pdf_key: resumePdfKey,
    is_complete: isComplete,
    updated_at: new Date().toISOString(),
  };

  // Check if profile exists
  const { data: existingProfile, error: getProfileError } = await client.database
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  let saveResult;
  if (existingProfile) {
    saveResult = await client.database
      .from("profiles")
      .update(profilePayload)
      .eq("id", userId)
      .select()
      .single();
  } else {
    saveResult = await client.database
      .from("profiles")
      .insert([profilePayload])
      .select()
      .single();
  }

  if (saveResult.error) {
    console.error("Profile DB Save Error:", saveResult.error);
    return { success: false, error: `Failed to save profile: ${saveResult.error.message}` };
  }

  revalidatePath("/profile");

  return { 
    success: true, 
    data: {
      profile: saveResult.data,
      completionPercentage,
      missingFields,
    } 
  };
}
