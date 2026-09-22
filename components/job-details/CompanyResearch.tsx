"use client";

import React, { useState } from "react";
import {
  Building2,
  Sparkles,
  Loader2,
  Globe,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Circle,
  Users2,
  Target,
  BookOpen,
  Square,
  Cpu,
} from "lucide-react";

export interface CompanyResearchDossier {
  companyOverview?: string;
  techStack?: string[];
  culture?: string[];
  whyThisRole?: string;
  yourEdge?: string[];
  gapsToAddress?: string[];
  smartQuestions?: string[];
  interviewPrep?: string[];
  sources?: string[];
}

interface CompanyResearchProps {
  jobId: string;
  company: string;
  initialResearch?: CompanyResearchDossier | null;
  onResearchClick?: () => void;
  isLoading?: boolean;
}

// ─── Step definitions ────────────────────────────────────────────────────────

const RESEARCH_STEPS = [
  { id: 1, label: "Resolving company website" },
  { id: 2, label: "Scraping public pages" },
  { id: 3, label: "Analysing culture & tech stack" },
  { id: 4, label: "Building candidate briefing" },
  { id: 5, label: "Saving dossier" },
] as const;

// How long (ms) each step takes before auto-advancing to the next.
// Steps 1–4 are timer-driven; step 5 only activates after fetch resolves.
const STEP_DURATIONS = [2500, 8000, 5000, 6000]; // step 1→2, 2→3, 3→4, 4 stays

// ─── Loading card ─────────────────────────────────────────────────────────────

function ResearchLoadingCard({ company, currentStep }: { company: string; currentStep: number }) {
  const progress = Math.round((currentStep / RESEARCH_STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Card header */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" />
          Researching {company}…
        </p>
        <p className="text-xs text-text-secondary pl-6">
          This usually takes 20–40 seconds. Hang tight.
        </p>
      </div>

      {/* Step list */}
      <ol className="flex flex-col gap-1">
        {RESEARCH_STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <li
              key={step.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                isActive ? "bg-accent-muted" : "bg-transparent"
              }`}
            >
              {/* Step icon */}
              <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                ) : (
                  <Circle className="w-4 h-4 text-border-muted" />
                )}
              </span>

              {/* Step label */}
              <span
                className={`text-sm transition-all duration-200 ${
                  isDone
                    ? "text-text-muted line-through"
                    : isActive
                    ? "text-text-primary font-semibold"
                    : "text-text-muted"
                }`}
              >
                {step.label}
              </span>

              {/* Active badge */}
              {isActive && (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-accent">
                  In progress
                </span>
              )}
              {isDone && (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-success">
                  Done
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-1.5 rounded-full bg-border-light overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-text-muted text-right">{progress}%</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CompanyResearch({
  jobId,
  company,
  initialResearch,
  onResearchClick,
  isLoading = false,
}: CompanyResearchProps) {
  const [research, setResearch] = useState<CompanyResearchDossier | null>(
    initialResearch || null
  );
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1–5 = steps, 0 again after done
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isResearching = currentStep >= 1;
  const hasResearch =
    !!research && Object.keys(research).length > 0 && !!research.companyOverview;

  const handleResearch = async () => {
    if (onResearchClick) {
      onResearchClick();
      return;
    }

    setCurrentStep(1);
    setErrorMessage(null);

    // Schedule automatic step advancement capped at step 4
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    STEP_DURATIONS.forEach((delay, i) => {
      cumulative += delay;
      const t = setTimeout(() => {
        // Only auto-advance up to step 4; step 5 is triggered by fetch resolution
        const nextStep = i + 2;
        if (nextStep <= 4) {
          setCurrentStep(nextStep);
        }
      }, cumulative);
      timers.push(t);
    });

    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      // Clear pending step timers — we control the pace from here
      timers.forEach(clearTimeout);

      // Show step 5 briefly before revealing results
      setCurrentStep(5);
      await new Promise<void>((r) => setTimeout(r, 900));

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to research company.");
      }

      setResearch(data.dossier);
      setCurrentStep(0);
    } catch (err: any) {
      timers.forEach(clearTimeout);
      setCurrentStep(0);
      setErrorMessage(err.message || "An error occurred during research.");
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-muted flex items-center justify-center text-accent shrink-0">
            <Building2 className="w-5 h-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-text-primary">
              Company Research
            </h2>
            <span className="text-xs text-text-secondary">
              AI-powered briefing from public web presence
            </span>
          </div>
        </div>

        {/* Research CTA Button — hidden while loading card is active */}
        {!isResearching && (
          <button
            type="button"
            onClick={handleResearch}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold transition-all shadow-sm ${
              isLoading
                ? "opacity-80 cursor-wait"
                : "hover:bg-accent-dark cursor-pointer active:scale-[0.98]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{hasResearch ? "Re-research Company" : "Research Company"}</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive-muted/30 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Body: Loading Card | Empty State | Dossier */}
      {isResearching ? (
        /* Multi-step loading card */
        <ResearchLoadingCard company={company} currentStep={currentStep} />
      ) : !hasResearch ? (
        /* Empty State */
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-text-muted mb-3 mx-auto">
            <Building2 className="w-6 h-6 text-text-muted" />
          </div>
          <h3 className="text-sm font-bold text-text-primary mb-1">
            No research yet
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Click &ldquo;Research Company&rdquo; to let the AI browse {company}&apos;s public pages and build a tailored candidate briefing.
          </p>
        </div>
      ) : (
        /* Structured Dossier View */
        <div className="flex flex-col divide-y divide-border">
          {/* 1. Company Overview */}
          {research.companyOverview && (
            <div className="flex flex-col gap-2 pb-5">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Company Overview
                </span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {research.companyOverview}
              </p>
            </div>
          )}

          {/* 2. Tech Stack */}
          {research.techStack && research.techStack.length > 0 && (
            <div className="flex flex-col gap-2.5 py-5">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Tech Stack &amp; Infrastructure
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {research.techStack.map((tech, i) => (
                  <span
                    key={`tech-${i}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-secondary text-text-primary border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Culture */}
          {research.culture && research.culture.length > 0 && (
            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Culture &amp; Working Style
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-0.5">
                {research.culture.map((c, i) => (
                  <div key={`culture-${i}`} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <span className="text-sm text-text-primary leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Why This Role */}
          {research.whyThisRole && (
            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Why This Role
                </span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {research.whyThisRole}
              </p>
            </div>
          )}

          {/* 5. Your Edge */}
          {research.yourEdge && research.yourEdge.length > 0 && (
            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Your Competitive Edge
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-0.5">
                {research.yourEdge.map((edge, i) => (
                  <div key={`edge-${i}`} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-text-primary leading-relaxed">{edge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Gaps to Address */}
          {research.gapsToAddress && research.gapsToAddress.length > 0 && (
            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-warning" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Gaps Strategy &amp; Positioning
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-0.5">
                {research.gapsToAddress.map((gap, i) => (
                  <div key={`gap-${i}`} className="flex items-start gap-2.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                    <span className="text-sm text-text-primary leading-relaxed">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Smart Questions */}
          {research.smartQuestions && research.smartQuestions.length > 0 && (
            <div className="flex flex-col gap-3 py-5">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-info-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Smart Questions to Ask
                </span>
              </div>
              <div className="flex flex-col gap-2.5 mt-0.5">
                {research.smartQuestions.map((q, i) => (
                  <div key={`q-${i}`} className="flex items-start gap-3">
                    <span className="text-[11px] font-bold text-info-foreground bg-info-lightest rounded-md px-1.5 py-0.5 shrink-0 mt-0.5 min-w-[24px] text-center tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-text-primary leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Interview Prep */}
          {research.interviewPrep && research.interviewPrep.length > 0 && (
            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Interview Prep
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-0.5">
                {research.interviewPrep.map((item, i) => (
                  <div key={`prep-${i}`} className="flex items-start gap-2.5">
                    <Square className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                    <span className="text-sm text-text-primary leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Sources */}
          {research.sources && research.sources.length > 0 && (
            <div className="flex flex-col gap-2 pt-5">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Sources Researched
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {research.sources.map((src, i) => (
                  <a
                    key={`src-${i}`}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <span>{src}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
