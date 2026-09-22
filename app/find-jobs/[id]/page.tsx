import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobInfoCards } from "@/components/job-details/JobInfoCards";
import { AIMatchReasoning } from "@/components/job-details/AIMatchReasoning";
import { SkillsComparison } from "@/components/job-details/SkillsComparison";
import { JobDescription } from "@/components/job-details/JobDescription";
import { CompanyResearch, CompanyResearchDossier } from "@/components/job-details/CompanyResearch";
import { ApplyButton } from "@/components/job-details/ApplyButton";

export const dynamic = "force-dynamic";

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user) {
    redirect("/login");
  }

  const { data: job, error: jobError } = await client.database
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (jobError || !job) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow max-w-[1000px] w-full mx-auto px-6 py-12 flex flex-col gap-6 items-center justify-center text-center">
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm max-w-md w-full flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold text-text-primary">Job Not Found</h2>
            <p className="text-sm text-text-secondary">
              The job you are looking for may have been removed or does not exist.
            </p>
            <Link
              href="/find-jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Find Jobs</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const dateFoundFormatted = formatRelativeTime(job.found_at);
  const targetApplyUrl = job.external_apply_url || job.source_url || null;
  const researchDossier = (job.company_research as CompanyResearchDossier | null) || null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-[1000px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link
            href="/find-jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Link>
        </div>

        {/* 1. Job Header Card */}
        <JobHeader
          title={job.title}
          company={job.company}
          matchScore={job.match_score}
          viewPostUrl={targetApplyUrl}
        />

        {/* 2. Info Cards (Salary, Location, Job Type, Date Found) */}
        <JobInfoCards
          salary={job.salary}
          location={job.location}
          jobType={job.job_type}
          dateFound={dateFoundFormatted}
        />

        {/* 3. AI Match Reasoning */}
        <AIMatchReasoning reason={job.match_reason} />

        {/* 4. Required Skills vs Your Profile */}
        <SkillsComparison
          matchedSkills={job.matched_skills || []}
          missingSkills={job.missing_skills || []}
        />

        {/* 5. Job Description */}
        <JobDescription
          description={job.about_role}
          responsibilities={job.responsibilities || []}
          requirements={job.requirements || []}
          sourceUrl={targetApplyUrl}
          companyName={job.company}
        />

        {/* 6. Company Research Card */}
        <CompanyResearch
          jobId={job.id}
          company={job.company}
          initialResearch={researchDossier}
        />

        {/* 7. Bottom Apply Button */}
        <ApplyButton
          company={job.company}
          applyUrl={targetApplyUrl}
        />
      </main>

      <Footer />
    </div>
  );
}
