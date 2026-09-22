"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

interface JobFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
}

export function JobFilterBar({
  searchQuery = "",
  onSearchChange,
  selectedFilter = "all",
  onFilterChange,
  selectedSort = "match_score",
  onSortChange,
}: JobFilterBarProps) {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filterLabels: Record<string, string> = {
    all: "All Matches",
    high: "High Match (≥70%)",
    low: "Low Match (<70%)",
  };

  const sortLabels: Record<string, string> = {
    match_score: "Match Score",
    newest: "Newest",
    oldest: "Oldest",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-3 px-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 w-full flex items-center">
        <Search className="w-4 h-4 text-text-muted mr-3 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full bg-transparent border-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Match Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => {
              setFilterDropdownOpen(!filterDropdownOpen);
              setSortDropdownOpen(false);
            }}
            className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-secondary flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{filterLabels[selectedFilter] || "All Matches"}</span>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>

          {filterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-20">
              <button
                type="button"
                onClick={() => {
                  if (onFilterChange) onFilterChange("all");
                  setFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedFilter === "all"
                    ? "text-accent font-semibold bg-accent-muted"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
              >
                All Matches
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onFilterChange) onFilterChange("high");
                  setFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedFilter === "high"
                    ? "text-accent font-semibold bg-accent-muted"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
              >
                High Match (≥70%)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onFilterChange) onFilterChange("low");
                  setFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedFilter === "low"
                    ? "text-accent font-semibold bg-accent-muted"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
              >
                Low Match (&lt;70%)
              </button>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => {
              setSortDropdownOpen(!sortDropdownOpen);
              setFilterDropdownOpen(false);
            }}
            className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-secondary flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{sortLabels[selectedSort] || "Match Score"}</span>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>

          {sortDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-20">
              <button
                type="button"
                onClick={() => {
                  if (onSortChange) onSortChange("match_score");
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedSort === "match_score"
                    ? "text-accent font-semibold bg-accent-muted"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
              >
                Match Score
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSortChange) onSortChange("newest");
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedSort === "newest"
                    ? "text-accent font-semibold bg-accent-muted"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
              >
                Newest
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSortChange) onSortChange("oldest");
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedSort === "oldest"
                    ? "text-accent font-semibold bg-accent-muted"
                    : "text-text-primary hover:bg-surface-secondary"
                }`}
              >
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
