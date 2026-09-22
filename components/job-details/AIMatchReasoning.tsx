import React from "react";
import { Sparkles } from "lucide-react";

interface AIMatchReasoningProps {
  reason: string;
}

export function AIMatchReasoning({ reason }: AIMatchReasoningProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-success-lightest flex items-center justify-center text-success-alt shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-success-alt" />
        </div>
        <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">
          AI MATCH REASONING
        </span>
      </div>

      {/* Reasoning Text */}
      <p className="text-sm text-text-primary leading-relaxed">
        {reason || "No match reasoning available for this job."}
      </p>
    </div>
  );
}
