import React from "react";
import { DollarSign, MapPin, Briefcase, Calendar } from "lucide-react";

interface JobInfoCardsProps {
  salary?: string | null;
  location?: string | null;
  jobType?: string | null;
  dateFound?: string | null;
}

export function JobInfoCards({
  salary,
  location,
  jobType,
  dateFound,
}: JobInfoCardsProps) {
  const displaySalary = salary || "Competitive";
  const displayLocation = location || "Remote";
  const displayJobType =
    jobType === "fulltime"
      ? "Full-time"
      : jobType === "parttime"
      ? "Part-time"
      : jobType === "contract"
      ? "Contract"
      : jobType || "—";
  const displayDateFound = dateFound || "Recently";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Salary Card */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-11 h-11 rounded-xl bg-success-lightest text-success flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary truncate">
            {displaySalary}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
            SALARY EST.
          </span>
        </div>
      </div>

      {/* 2. Location Card */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-11 h-11 rounded-xl bg-info-lightest text-info-foreground flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary truncate">
            {displayLocation}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
            LOCATION
          </span>
        </div>
      </div>

      {/* 3. Job Type Card */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-11 h-11 rounded-xl bg-accent-muted text-accent flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary truncate">
            {displayJobType}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
            JOB TYPE
          </span>
        </div>
      </div>

      {/* 4. Date Found Card */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-11 h-11 rounded-xl bg-surface-secondary text-text-secondary flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary truncate">
            {displayDateFound}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
            DATE FOUND
          </span>
        </div>
      </div>
    </div>
  );
}
