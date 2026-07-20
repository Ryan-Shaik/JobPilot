"use client";

import { useState, useEffect } from "react";
import { Plus, X, PlusCircle, Loader2 } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

/** Parse a saved "Month Year" string into parts, e.g. "January 2022" */
function parseDateString(dateStr: string): { month: string; year: string } {
  if (!dateStr) return { month: "", year: "" };
  const parts = dateStr.trim().split(" ");
  if (parts.length === 2 && MONTHS.includes(parts[0]) && /^\d{4}$/.test(parts[1])) {
    return { month: parts[0], year: parts[1] };
  }
  return { month: "", year: "" };
}

type WorkExperience = {
  company: string;
  jobTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  responsibilities: string;
};

type Education = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

type ExtractedProfile = {
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  current_title?: string | null;
  experience_level?: string | null;
  years_experience?: number | null;
  skills?: string[];
  industries?: string[];
  work_experience?: WorkExperience[];
  education?: Education;
  work_authorization?: string | null;
};

type Props = {
  profile: any;
  onSave: (formData: FormData) => void;
  isSaving: boolean;
  extractedData?: ExtractedProfile | null;
};

export function ProfileForm({ profile, onSave, isSaving, extractedData }: Props) {
  // Skills state
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Industries state
  const [industries, setIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState("");

  // Work experience state
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);

  // Education state
  const [education, setEducation] = useState<Education>({
    highestDegree: "none",
    fieldOfStudy: "",
    institutionName: "",
    graduationYear: "",
  });

  // formKey forces re-mount of the form when extracted data arrives so
  // defaultValue inputs pick up the merged values
  const [formKey, setFormKey] = useState(0);

  // Merged profile — base profile overridden by AI extraction on demand
  const [mergedProfile, setMergedProfile] = useState<any>(profile);

  // Pre-populate controlled state from DB profile on load
  useEffect(() => {
    if (profile) {
      if (profile.skills) setSkills(profile.skills);
      if (profile.industries) setIndustries(profile.industries);
      if (profile.work_experience) {
        setWorkExperiences(
          profile.work_experience.map((exp: any) => {
            // Support both old string format and new month/year split format
            const start = parseDateString(exp.startDate ?? "");
            const end = parseDateString(exp.endDate ?? "");
            return {
              company: exp.company ?? "",
              jobTitle: exp.jobTitle ?? "",
              startMonth: exp.startMonth ?? start.month,
              startYear: exp.startYear ?? start.year,
              endMonth: exp.endMonth ?? end.month,
              endYear: exp.endYear ?? end.year,
              isCurrent: exp.isCurrent ?? false,
              responsibilities: exp.responsibilities ?? "",
            };
          })
        );
      }
      if (profile.education) {
        setEducation({
          highestDegree: profile.education.highestDegree || "none",
          fieldOfStudy: profile.education.fieldOfStudy || "",
          institutionName: profile.education.institutionName || "",
          graduationYear: profile.education.graduationYear || "",
        });
      }
      setMergedProfile(profile);
    } else {
      // Default initial states for new profile
      setSkills(["React", "TypeScript", "Next.js", "Tailwind CSS"]);
      setWorkExperiences([
        {
          company: "",
          jobTitle: "",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          isCurrent: false,
          responsibilities: "",
        },
      ]);
    }
  }, [profile]);

  // When AI extraction completes, merge extracted data into controlled state
  // and bump formKey so defaultValue inputs re-render with new values
  useEffect(() => {
    if (!extractedData) return;

    setMergedProfile((prev: any) => ({ ...prev, ...extractedData }));

    if (extractedData.skills && extractedData.skills.length > 0) {
      setSkills(extractedData.skills);
    }
    if (extractedData.industries && extractedData.industries.length > 0) {
      setIndustries(extractedData.industries);
    }
    if (extractedData.work_experience && extractedData.work_experience.length > 0) {
      setWorkExperiences(
        extractedData.work_experience.map((exp) => ({
          company: exp.company ?? "",
          jobTitle: exp.jobTitle ?? "",
          startMonth: exp.startMonth ?? "",
          startYear: exp.startYear ?? "",
          endMonth: exp.endMonth ?? "",
          endYear: exp.endYear ?? "",
          isCurrent: exp.isCurrent ?? false,
          responsibilities: exp.responsibilities ?? "",
        }))
      );
    }
    if (extractedData.education) {
      setEducation({
        highestDegree: extractedData.education.highestDegree || "none",
        fieldOfStudy: extractedData.education.fieldOfStudy || "",
        institutionName: extractedData.education.institutionName || "",
        graduationYear: extractedData.education.graduationYear || "",
      });
    }

    // Re-mount form so defaultValue inputs pick up the merged profile
    setFormKey((k) => k + 1);
  }, [extractedData]);

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const addIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (industryInput.trim() && !industries.includes(industryInput.trim())) {
      setIndustries([...industries, industryInput.trim()]);
      setIndustryInput("");
    }
  };

  const removeIndustry = (industryToRemove: string) => {
    setIndustries(industries.filter((ind) => ind !== industryToRemove));
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        company: "",
        jobTitle: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        isCurrent: false,
        responsibilities: "",
      },
    ]);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (
    index: number,
    field: keyof WorkExperience,
    value: string | boolean
  ) => {
    const updated = [...workExperiences];
    updated[index] = {
      ...updated[index],
      [field]: value,
    } as WorkExperience;
    setWorkExperiences(updated);
  };

  const handleEducationChange = (field: keyof Education, value: string) => {
    setEducation({
      ...education,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave(formData);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-8">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          Profile Information
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Hidden inputs for serialized states */}
        <input type="hidden" name="skills" value={JSON.stringify(skills)} />
        <input type="hidden" name="industries" value={JSON.stringify(industries)} />
        <input type="hidden" name="work_experience" value={JSON.stringify(workExperiences)} />
        <input type="hidden" name="education" value={JSON.stringify(education)} />
        <input type="hidden" name="resume_pdf_url" value={profile?.resume_pdf_url || ""} />
        <input type="hidden" name="resume_pdf_key" value={profile?.resume_pdf_key || ""} />

        {/* --- Personal Info --- */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-text-primary border-b border-border pb-2">
            Personal Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                required
                defaultValue={mergedProfile?.full_name || ""}
                placeholder="E.g. Faizan Ali"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                defaultValue={mergedProfile?.email || ""}
                disabled
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-md text-sm text-text-muted cursor-not-allowed outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                required
                defaultValue={mergedProfile?.phone || ""}
                placeholder="E.g. +1 (555) 000-0000"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                name="location"
                required
                defaultValue={mergedProfile?.location || ""}
                placeholder="E.g. San Francisco, CA"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                LinkedIn URL
              </label>
              <input
                type="text"
                name="linkedin_url"
                defaultValue={mergedProfile?.linkedin_url || ""}
                placeholder="E.g. https://linkedin.com/in/username"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Portfolio / GitHub
              </label>
              <input
                type="text"
                name="portfolio_url"
                defaultValue={mergedProfile?.portfolio_url || ""}
                placeholder="E.g. https://github.com/username"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Work Authorization
              </label>
              <select
                name="work_authorization"
                defaultValue={mergedProfile?.work_authorization || "citizen"}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              >
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa_required">Visa Required</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Professional Info --- */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-text-primary border-b border-border pb-2">
            Professional Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Current/Recent Job Title
              </label>
              <input
                type="text"
                name="current_title"
                required
                defaultValue={mergedProfile?.current_title || ""}
                placeholder="E.g. Frontend Engineer"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Experience Level
              </label>
              <select
                name="experience_level"
                defaultValue={mergedProfile?.experience_level || "mid"}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Years of Experience
              </label>
              <input
                type="number"
                name="years_experience"
                required
                min="0"
                defaultValue={mergedProfile?.years_experience || ""}
                placeholder="E.g. 3"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>

            {/* Skills Tag Input */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-grow px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text-secondary bg-surface hover:bg-surface-secondary transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-[#F3F4F6] text-text-slate px-3 py-1 rounded-md text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Industries worked in */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Industries Worked In (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="E.g. FinTech, Healthcare"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  className="flex-grow px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                />
                <button
                  type="button"
                  onClick={addIndustry}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text-secondary bg-surface hover:bg-surface-secondary transition-colors"
                >
                  Add
                </button>
              </div>
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {industries.map((ind) => (
                    <span
                      key={ind}
                      className="inline-flex items-center gap-1 bg-[#F3F4F6] text-text-slate px-3 py-1 rounded-md text-xs font-medium"
                    >
                      {ind}
                      <button
                        type="button"
                        onClick={() => removeIndustry(ind)}
                        className="text-text-muted hover:text-text-primary"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Work Experience --- */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-text-primary">
              Work Experience
            </h3>
            <button
              type="button"
              onClick={addWorkExperience}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add role
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {workExperiences.map((exp, idx) => (
              <div
                key={idx}
                className="relative flex flex-col gap-4 p-4 border border-border rounded-xl bg-surface-secondary"
              >
                {workExperiences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorkExperience(idx)}
                    className="absolute top-4 right-4 text-text-muted hover:text-error transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        handleExperienceChange(idx, "company", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        handleExperienceChange(idx, "jobTitle", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                    />
                  </div>
                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                      Start Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={exp.startMonth}
                        onChange={(e) => handleExperienceChange(idx, "startMonth", e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={exp.startYear}
                        onChange={(e) => handleExperienceChange(idx, "startYear", e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                      >
                        <option value="">Year</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                        End Date
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id={`current-${idx}`}
                          checked={exp.isCurrent}
                          onChange={(e) =>
                            handleExperienceChange(idx, "isCurrent", e.target.checked)
                          }
                          className="w-3.5 h-3.5 text-accent border-border rounded focus:ring-accent"
                        />
                        <label
                          htmlFor={`current-${idx}`}
                          className="text-xs font-medium text-text-slate-medium select-none cursor-pointer"
                        >
                          Currently working here
                        </label>
                      </div>
                    </div>
                    {exp.isCurrent ? (
                      <div className="px-3 py-2 bg-surface-secondary border border-border rounded-md text-sm text-text-muted">
                        Present
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={exp.endMonth}
                          onChange={(e) => handleExperienceChange(idx, "endMonth", e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                        >
                          <option value="">Month</option>
                          {MONTHS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={exp.endYear}
                          onChange={(e) => handleExperienceChange(idx, "endYear", e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                        >
                          <option value="">Year</option>
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                      Key Responsibilities
                    </label>
                    <textarea
                      rows={3}
                      value={exp.responsibilities}
                      onChange={(e) =>
                        handleExperienceChange(
                          idx,
                          "responsibilities",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Education --- */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-text-primary border-b border-border pb-2">
            Education
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Highest Degree
              </label>
              <select
                value={education.highestDegree}
                onChange={(e) => handleEducationChange("highestDegree", e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              >
                <option value="none">Select Degree</option>
                <option value="high_school">High School</option>
                <option value="bachelors">Bachelor's</option>
                <option value="masters">Master's</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Field of Study
              </label>
              <input
                type="text"
                value={education.fieldOfStudy}
                onChange={(e) => handleEducationChange("fieldOfStudy", e.target.value)}
                placeholder="E.g. Computer Science"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Institution Name
              </label>
              <input
                type="text"
                value={education.institutionName}
                onChange={(e) => handleEducationChange("institutionName", e.target.value)}
                placeholder="E.g. State University"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Graduation Year
              </label>
              <input
                type="text"
                value={education.graduationYear}
                onChange={(e) => handleEducationChange("graduationYear", e.target.value)}
                placeholder="E.g. 2024"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* --- Job Preferences --- */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-text-primary border-b border-border pb-2">
            Job Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Job Titles Seeking
              </label>
              <input
                type="text"
                name="job_titles_seeking"
                required
                defaultValue={mergedProfile?.job_titles_seeking?.join(", ") || ""}
                placeholder="E.g. Frontend Engineer, React Developer"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Remote Preference
              </label>
              <select
                name="remote_preference"
                defaultValue={mergedProfile?.remote_preference || "any"}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              >
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Salary Expectation (Optional)
              </label>
              <input
                type="text"
                name="salary_expectation"
                defaultValue={mergedProfile?.salary_expectation || ""}
                placeholder="E.g. $120k+"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Preferred Locations (Optional)
              </label>
              <input
                type="text"
                name="preferred_locations"
                defaultValue={mergedProfile?.preferred_locations?.join(", ") || ""}
                placeholder="E.g. New York, London"
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-dark uppercase tracking-wider">
                Cover Letter Tone
              </label>
              <select
                name="cover_letter_tone"
                defaultValue={mergedProfile?.cover_letter_tone || "formal"}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent-dark transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isSaving ? "Saving Profile..." : "Save Profile"}</span>
        </button>
      </form>
    </div>
  );
}
