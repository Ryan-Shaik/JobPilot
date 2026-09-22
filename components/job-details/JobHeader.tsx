import React from "react";
import { Building2, ExternalLink } from "lucide-react";

interface JobHeaderProps {
  title: string;
  company: string;
  matchScore: number;
  viewPostUrl?: string | null;
}

export function JobHeader({
  title,
  company,
  matchScore,
  viewPostUrl,
}: JobHeaderProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      {/* Left Details */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center text-text-secondary shrink-0">
          <Building2 className="w-7 h-7 text-text-muted" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm font-semibold text-text-secondary">
              {company}
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-lightest text-success border border-success-light/40">
              {matchScore}% Match Score
            </span>
          </div>
        </div>
      </div>

      {/* Right Action */}
      {viewPostUrl && (
        <a
          href={viewPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-primary text-sm font-semibold transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <ExternalLink className="w-4 h-4 text-text-secondary" />
          <span>View Job Post</span>
        </a>
      )}
    </div>
  );
}
