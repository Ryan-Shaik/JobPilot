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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);

  const getResumeName = () => {
    if (!profile?.resume_pdf_key) return undefined;
    const parts = profile.resume_pdf_key.split("/");
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

    if (!fileToExtract && !profile?.resume_pdf_url) {
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
        existingResumeUrl={profile?.resume_pdf_url ?? undefined}
        onExtract={handleExtract}
        isExtracting={isExtracting}
      />
      
      <ProfileForm 
        profile={profile} 
        onSave={handleSave} 
        isSaving={isSaving}
        extractedData={extractedData}
      />
    </div>
  );
}
