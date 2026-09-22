"use client";

import { useState } from "react";
import { CompletionIndicator } from "./CompletionIndicator";
import { ResumeUpload } from "./ResumeUpload";
import { ProfileForm } from "./ProfileForm";
import { saveProfileAction } from "@/app/actions/profile";

type Props = {
  profile: any;
};

export function ProfileClient({ profile }: Props) {
  const [profileState, setProfileState] = useState(profile);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);

  const getResumeName = () => {
    if (!profileState?.resume_pdf_key) return undefined;
    const parts = profileState.resume_pdf_key.split("/");
    return parts[parts.length - 1];
  };

  const calculateCompleteness = (prof: any) => {
    if (!prof) {
      return {
        percentage: 0,
        missing: ["FULL_NAME", "PHONE", "LOCATION", "CURRENT_TITLE", "EXPERIENCE_LEVEL", "YEARS_EXPERIENCE", "SKILLS", "INDUSTRIES", "JOB_TITLES_SEEKING", "EDUCATION"]
      };
    }

    const missing: string[] = [];
    if (!prof.full_name) missing.push("FULL_NAME");
    if (!prof.phone) missing.push("PHONE");
    if (!prof.location) missing.push("LOCATION");
    if (!prof.current_title) missing.push("CURRENT_TITLE");
    if (!prof.experience_level) missing.push("EXPERIENCE_LEVEL");
    if (prof.years_experience === null || isNaN(prof.years_experience)) missing.push("YEARS_EXPERIENCE");
    if (!prof.skills || prof.skills.length === 0) missing.push("SKILLS");
    if (!prof.industries || prof.industries.length === 0) missing.push("INDUSTRIES");
    if (!prof.job_titles_seeking || prof.job_titles_seeking.length === 0) missing.push("JOB_TITLES_SEEKING");

    const edu = prof.education || {};
    const isEduFilled = edu.highestDegree && 
      edu.highestDegree !== "none" && 
      edu.institutionName && 
      edu.fieldOfStudy;
    if (!isEduFilled) missing.push("EDUCATION");

    const total = 10;
    const percentage = Math.round(((total - missing.length) / total) * 100);
    return { percentage, missing };
  };

  const [completeness, setCompleteness] = useState(() => calculateCompleteness(profile));

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    setSaveStatus(null);

    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      const result = await saveProfileAction(formData);
      if (result.success && result.data) {
        setSaveStatus({ success: true, message: "Profile saved successfully!" });
        setResumeFile(null); // Clear local file state after success
        setProfileState(result.data.profile);
        setCompleteness({
          percentage: result.data.completionPercentage,
          missing: result.data.missingFields,
        });
      } else {
        setSaveStatus({ success: false, message: result.error || "Failed to save profile." });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred.";
      setSaveStatus({ success: false, message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtract = async () => {
    // Determine the PDF source: prefer the newly selected local file, fall back to existing stored resume
    const fileToExtract = resumeFile;

    if (!fileToExtract && !profileState?.resume_pdf_url) {
      setSaveStatus({ success: false, message: "Please upload a resume first." });
      return;
    }

    setIsExtracting(true);
    setSaveStatus(null);

    try {
      const formData = new FormData();

      if (fileToExtract) {
        formData.append("resume", fileToExtract);
      }

      const response = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setExtractedData(result.data);
        setSaveStatus({
          success: true,
          message: "Profile fields extracted! Review the pre-filled data below, then save your profile.",
        });
      } else {
        setSaveStatus({ success: false, message: result.error || "Extraction failed. Please try again." });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred during extraction.";
      setSaveStatus({ success: false, message });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveStatus(null);

    try {
      // Gather current in-memory form values
      const formElement = document.getElementById("profile-form") as HTMLFormElement | null;
      let payload: any = {};

      if (formElement) {
        const fd = new FormData(formElement);
        const parseJson = (key: string, fallback: any) => {
          try {
            const raw = fd.get(key) as string;
            return raw ? JSON.parse(raw) : fallback;
          } catch {
            return fallback;
          }
        };

        const parseList = (key: string) => {
          try {
            const raw = fd.get(key) as string;
            if (!raw) return [];
            if (raw.startsWith("[")) return JSON.parse(raw);
            return raw.split(",").map((s) => s.trim()).filter(Boolean);
          } catch {
            return [];
          }
        };

        const yearsExpRaw = fd.get("years_experience");
        const yearsExperience = yearsExpRaw ? parseInt(yearsExpRaw as string, 10) : null;

        payload = {
          full_name: (fd.get("full_name") as string) || profileState?.full_name || "",
          phone: (fd.get("phone") as string) || profileState?.phone || "",
          location: (fd.get("location") as string) || profileState?.location || "",
          current_title: (fd.get("current_title") as string) || profileState?.current_title || "",
          experience_level: (fd.get("experience_level") as string) || profileState?.experience_level || null,
          years_experience: yearsExperience !== null && !isNaN(yearsExperience) ? yearsExperience : profileState?.years_experience,
          linkedin_url: (fd.get("linkedin_url") as string) || profileState?.linkedin_url || null,
          portfolio_url: (fd.get("portfolio_url") as string) || profileState?.portfolio_url || null,
          work_authorization: (fd.get("work_authorization") as string) || profileState?.work_authorization || null,
          remote_preference: (fd.get("remote_preference") as string) || profileState?.remote_preference || "any",
          salary_expectation: (fd.get("salary_expectation") as string) || profileState?.salary_expectation || null,
          cover_letter_tone: (fd.get("cover_letter_tone") as string) || profileState?.cover_letter_tone || "formal",
          skills: parseJson("skills", profileState?.skills || []),
          industries: parseJson("industries", profileState?.industries || []),
          work_experience: parseJson("work_experience", profileState?.work_experience || []),
          education: parseJson("education", profileState?.education || {}),
          job_titles_seeking: parseList("job_titles_seeking"),
          preferred_locations: parseList("preferred_locations"),
        };
      } else {
        payload = profileState || {};
      }

      if (!payload.full_name || !payload.full_name.trim()) {
        setSaveStatus({
          success: false,
          message: "Please provide your Full Name in the form before generating a resume.",
        });
        setIsGenerating(false);
        return;
      }

      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success && result.url) {
        setProfileState((prev: any) => ({
          ...prev,
          ...result.data?.profile,
          resume_pdf_url: result.url,
          resume_pdf_key: result.key,
        }));
        if (result.data) {
          setCompleteness({
            percentage: result.data.completionPercentage,
            missing: result.data.missingFields,
          });
        }
        setResumeFile(null);
        setSaveStatus({
          success: true,
          message: "Resume generated successfully! Your profile has been updated with the new PDF.",
        });
      } else {
        setSaveStatus({
          success: false,
          message: result.error || "Failed to generate resume.",
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred during resume generation.";
      setSaveStatus({ success: false, message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <p className="text-xs text-text-secondary mt-1">
          Manage your personal details and resume files.
        </p>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-xl border ${saveStatus.success ? 'bg-success-lightest border-success text-success-foreground' : 'bg-[#FEF2F2] border-red-200 text-error'}`}>
          <p className="text-sm font-medium">{saveStatus.message}</p>
        </div>
      )}

      <CompletionIndicator 
        completionPercentage={completeness.percentage} 
        missingFields={completeness.missing} 
      />
      
      <ResumeUpload 
        file={resumeFile} 
        setFile={setResumeFile} 
        existingResumeName={getResumeName()}
        existingResumeUrl={profileState?.resume_pdf_url ?? undefined}
        onExtract={handleExtract}
        isExtracting={isExtracting}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
      
      <ProfileForm 
        profile={profileState} 
        onSave={handleSave} 
        isSaving={isSaving}
        extractedData={extractedData}
      />
    </div>
  );
}
