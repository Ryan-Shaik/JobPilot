"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

type Props = {
  completionPercentage?: number;
  missingFields?: string[];
};

export function CompletionIndicator({
  completionPercentage = 70,
  missingFields = ["PHONE", "LOCATION", "EDUCATION"],
}: Props) {
  const isComplete = completionPercentage === 100;

  // SVG Circle parameters for circular progress
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 ${isComplete ? "text-success" : "text-error"}`}>
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {isComplete ? "Profile complete" : "Profile needs attention"}
            </h2>
            <p className="text-sm font-medium text-text-secondary mt-1">
              {isComplete
                ? "Your profile is fully complete! We have all the details needed to find matches and generate resumes."
                : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
            </p>
          </div>
          {!isComplete && missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="bg-[#FEF2F2] text-error border border-red-100 rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wider"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-border-light"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground Progress */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={isComplete ? "stroke-success" : "stroke-error"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xl font-bold text-text-primary">
          {completionPercentage}%
        </span>
      </div>
    </div>
  );
}
