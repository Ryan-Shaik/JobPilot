"use client";

import React, { useState } from "react";
import { FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface JobDescriptionProps {
  description?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  sourceUrl?: string | null;
  companyName?: string;
}

export function JobDescription({
  description,
  responsibilities = [],
  requirements = [],
  sourceUrl,
  companyName = "Employer",
}: JobDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawDescription = (description || "").trim();
  const isTruncatedSnippet =
    rawDescription.endsWith("…") ||
    rawDescription.endsWith("...") ||
    rawDescription.endsWith("..") ||
    rawDescription.includes("…");

  // Clean description text without abrupt broken ending character for cleaner display
  const cleanedDescription = rawDescription.replace(/(\s*[.…]+)+$/, "").trim();

  const isLongDescription = cleanedDescription.length > 500;
  const hasResponsibilities = responsibilities.length > 0;
  const hasRequirements = requirements.length > 0;
  const hasContent = !!cleanedDescription || hasResponsibilities || hasRequirements;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-text-muted" />
          <h2 className="text-base font-bold text-text-primary">
            Job Description
          </h2>
        </div>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark transition-colors"
          >
            <span>Original Posting</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Description Body */}
      {cleanedDescription ? (
        <div className="flex flex-col gap-3">
          <div
            className={`text-sm text-text-primary leading-relaxed whitespace-pre-line transition-all duration-300 ${
              isLongDescription && !isExpanded && !isTruncatedSnippet
                ? "line-clamp-6"
                : ""
            }`}
          >
            {cleanedDescription}
            {isTruncatedSnippet && (
              <span className="text-text-muted font-normal italic">…</span>
            )}
          </div>

          {/* Toggle for long full descriptions */}
          {isLongDescription && !isTruncatedSnippet && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-dark transition-colors self-start cursor-pointer mt-1"
            >
              <span>{isExpanded ? "Show Less" : "Show Full Description"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Truncated Snippet Callout Banner */}
          {isTruncatedSnippet && (
            <div className="mt-2 p-3.5 rounded-xl bg-surface-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-text-secondary">
                This preview was clipped from the job feed. View the full, unabridged description on the host site.
              </p>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-tertiary text-xs font-semibold text-text-primary transition-colors shrink-0 shadow-sm"
                >
                  <span>Read Full Post at {companyName}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        !hasContent && (
          <p className="text-sm text-text-muted">
            No detailed description provided for this job. Check the external job post for more information.
          </p>
        )
      )}

      {/* Responsibilities if structured */}
      {hasResponsibilities && (
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Responsibilities
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-text-primary leading-relaxed">
            {responsibilities.map((resp, i) => (
              <li key={`resp-${i}`}>{resp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements if structured */}
      {hasRequirements && (
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Requirements
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-text-primary leading-relaxed">
            {requirements.map((req, i) => (
              <li key={`req-${i}`}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
