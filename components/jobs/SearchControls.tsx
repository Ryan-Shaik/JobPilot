"use client";

import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchControlsProps {
  initialJobTitle?: string;
  initialLocation?: string;
  onSearch?: (jobTitle: string, location: string) => void;
  resultMessage?: string | null;
  errorMessage?: string | null;
  isLoading?: boolean;
}

export function SearchControls({
  initialJobTitle = "",
  initialLocation = "",
  onSearch,
  resultMessage = "Found 8 jobs and saved 4 strong matches.",
  errorMessage = null,
  isLoading = false,
}: SearchControlsProps) {
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [location, setLocation] = useState(initialLocation);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && !isLoading) {
      onSearch(jobTitle, location);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-end gap-4 w-full">
        {/* Job Title Input */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <label
            htmlFor="job-title-input"
            className="text-xs font-bold text-text-dark tracking-wider uppercase"
          >
            JOB TITLE
          </label>
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
            <input
              id="job-title-input"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Frontend Engineer"
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <label
            htmlFor="location-input"
            className="text-xs font-bold text-text-dark tracking-wider uppercase"
          >
            LOCATION
          </label>
          <div className="relative flex items-center w-full">
            <input
              id="location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote, New York..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Find Jobs Button */}
        <button
          type="submit"
          disabled={isLoading || !jobTitle.trim()}
          className="h-[42px] px-6 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-white" />
              <span>Find Jobs</span>
            </>
          )}
        </button>
      </form>

      {/* Success / Alert Banner */}
      {resultMessage && !errorMessage && (
        <div className="bg-success-lightest border border-success-light rounded-xl px-4 py-3 flex items-center gap-2.5 mt-1">
          <Sparkles className="w-4 h-4 text-success shrink-0" />
          <p className="text-sm font-medium text-success-foreground">
            {resultMessage}
          </p>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-danger-lightest border border-danger-light rounded-xl px-4 py-3 flex items-center gap-2.5 mt-1">
          <p className="text-sm font-medium text-danger-foreground">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}
