import React from "react";
import { Check, X } from "lucide-react";

interface SkillsComparisonProps {
  matchedSkills?: string[];
  missingSkills?: string[];
}

export function SkillsComparison({
  matchedSkills = [],
  missingSkills = [],
}: SkillsComparisonProps) {
  const hasMatched = matchedSkills.length > 0;
  const hasMissing = missingSkills.length > 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-4">
      {/* Title */}
      <h2 className="text-xs font-bold tracking-wider text-text-secondary uppercase">
        REQUIRED SKILLS VS YOUR PROFILE
      </h2>

      {/* You have */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-text-secondary">
          You have
        </span>
        <div className="flex flex-wrap gap-2">
          {hasMatched ? (
            matchedSkills.map((skill, index) => (
              <span
                key={`matched-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-lightest text-success-foreground border border-success-light/40"
              >
                <Check className="w-3.5 h-3.5 text-success" />
                <span>{skill}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-text-muted">
              No direct matching skills recorded.
            </span>
          )}
        </div>
      </div>

      {/* Gap skills */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-xs font-semibold text-text-secondary">
          Gap skills
        </span>
        <div className="flex flex-wrap gap-2">
          {hasMissing ? (
            missingSkills.map((skill, index) => (
              <span
                key={`missing-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-muted text-accent border border-accent-light/40"
              >
                <X className="w-3.5 h-3.5 text-accent" />
                <span>{skill}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-text-muted">
              No skill gaps identified for your profile!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
