"use client";

import React, { useState, useMemo } from "react";
import { SearchControls } from "./SearchControls";
import { JobFilterBar } from "./JobFilterBar";
import { JobsTable, JobItem } from "./JobsTable";
import { MATCH_THRESHOLD } from "@/lib/utils";

interface FindJobsClientProps {
  initialJobs?: JobItem[];
}

const PAGE_SIZE = 20;

export function FindJobsClient({ initialJobs = [] }: FindJobsClientProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [jobsList, setJobsList] = useState<JobItem[]>(initialJobs);

  const [filterQuery, setFilterQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("match_score");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle filter changes and reset page to 1
  const handleQueryChange = (query: string) => {
    setFilterQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  const filteredJobs = useMemo(() => {
    let result = [...jobsList];

    // Filter by query (company or role)
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      result = result.filter(
        (job) =>
          job.company.toLowerCase().includes(q) ||
          job.role.toLowerCase().includes(q)
      );
    }

    // Filter by match score using MATCH_THRESHOLD
    if (selectedFilter === "high") {
      result = result.filter((job) => job.matchScore >= MATCH_THRESHOLD);
    } else if (selectedFilter === "low") {
      result = result.filter((job) => job.matchScore < MATCH_THRESHOLD);
    }

    // Sort with robust tiebreaking
    if (selectedSort === "match_score") {
      result.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        const timeA = a.foundAt ? new Date(a.foundAt).getTime() : 0;
        const timeB = b.foundAt ? new Date(b.foundAt).getTime() : 0;
        return timeB - timeA;
      });
    } else if (selectedSort === "newest") {
      result.sort((a, b) => {
        const timeA = a.foundAt ? new Date(a.foundAt).getTime() : 0;
        const timeB = b.foundAt ? new Date(b.foundAt).getTime() : 0;
        if (timeB !== timeA) {
          return timeB - timeA;
        }
        return b.matchScore - a.matchScore;
      });
    } else if (selectedSort === "oldest") {
      result.sort((a, b) => {
        const timeA = a.foundAt ? new Date(a.foundAt).getTime() : 0;
        const timeB = b.foundAt ? new Date(b.foundAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return b.matchScore - a.matchScore;
      });
    }

    return result;
  }, [jobsList, filterQuery, selectedFilter, selectedSort]);

  const handleSearch = async (searchedTitle: string, searchedLocation: string) => {
    setJobTitle(searchedTitle);
    setLocation(searchedLocation);
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: searchedTitle,
          location: searchedLocation,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to search jobs. Please try again.");
        return;
      }

      if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
        const formattedJobs: JobItem[] = data.jobs.map((j: {
          id: string;
          company: string;
          title: string;
          match_score: number;
          salary: string | null;
          source: "search" | "url";
          found_at?: string;
        }) => ({
          id: j.id,
          company: j.company,
          role: j.title,
          matchScore: j.match_score,
          salaryEst: j.salary || "Competitive",
          dateFound: "Just now",
          foundAt: j.found_at || new Date().toISOString(),
          source: j.source || "search",
        }));

        setJobsList(formattedJobs);
        setResultMessage(
          `Found ${data.jobsFound} jobs and saved ${data.strongMatchesCount} strong matches for "${searchedTitle}".`
        );
        setCurrentPage(1);
      } else {
        setResultMessage(
          data.message || `No active jobs found for "${searchedTitle}". Try adjusting your keywords.`
        );
      }
    } catch (err) {
      console.error("[FindJobsClient] Search error:", err);
      setErrorMessage("Network or server error while finding jobs.");
    } finally {
      setIsSearching(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Top Search Controls Card */}
      <SearchControls
        initialJobTitle={jobTitle}
        initialLocation={location}
        onSearch={handleSearch}
        resultMessage={resultMessage}
        errorMessage={errorMessage}
        isLoading={isSearching}
      />

      {/* 2. Filter & Sort Bar */}
      <JobFilterBar
        searchQuery={filterQuery}
        onSearchChange={handleQueryChange}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />

      {/* 3. Jobs Table & Pagination */}
      <JobsTable
        jobs={filteredJobs}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={filteredJobs.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
