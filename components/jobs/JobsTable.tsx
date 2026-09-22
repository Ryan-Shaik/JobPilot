"use client";

import React from "react";
import { Building2 } from "lucide-react";
import Link from "next/link";

export interface JobItem {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salaryEst: string;
  dateFound: string;
  foundAt?: string;
  source?: string;
}

interface JobsTableProps {
  jobs?: JobItem[];
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function JobsTable({
  jobs = [],
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  pageSize = 20,
  onPageChange,
}: JobsTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-text-muted";
  };

  const startIdx = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalResults);

  // If jobs passed in has more items than pageSize, slice to current page
  const displayedJobs =
    jobs.length > pageSize
      ? jobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : jobs;

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="py-4 px-6 text-xs font-bold text-text-secondary tracking-wider uppercase">
                COMPANY
              </th>
              <th className="py-4 px-6 text-xs font-bold text-text-secondary tracking-wider uppercase">
                ROLE
              </th>
              <th className="py-4 px-6 text-xs font-bold text-text-secondary tracking-wider uppercase">
                MATCH SCORE
              </th>
              <th className="py-4 px-6 text-xs font-bold text-text-secondary tracking-wider uppercase">
                SALARY EST.
              </th>
              <th className="py-4 px-6 text-xs font-bold text-text-secondary tracking-wider uppercase">
                DATE FOUND
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayedJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-text-muted">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-text-primary text-base">No jobs found</p>
                    <p className="text-sm text-text-secondary max-w-md leading-relaxed">
                      {totalResults === 0
                        ? "Enter a job title and location above and click \"Find Jobs\" to discover live opportunities matched with your resume."
                        : "No jobs match your current filter and search criteria. Try adjusting your query or filters."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-surface-secondary/60 transition-colors group cursor-pointer"
                >
                  {/* Company */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-secondary border border-border flex items-center justify-center text-text-secondary shrink-0 group-hover:border-border-muted transition-colors">
                        <Building2 className="w-4 h-4 text-text-secondary" />
                      </div>
                      <span className="font-bold text-text-primary text-sm">
                        {job.company}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="text-sm font-medium text-text-primary hover:text-accent transition-colors block"
                    >
                      {job.role}
                    </Link>
                  </td>

                  {/* Match Score */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-1.5 rounded-full bg-border-light overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreColor(
                            job.matchScore
                          )}`}
                          style={{ width: `${job.matchScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {job.matchScore}%
                      </span>
                    </div>
                  </td>

                  {/* Salary Est */}
                  <td className="py-4 px-6 text-sm text-text-secondary font-medium">
                    {job.salaryEst}
                  </td>

                  {/* Date Found */}
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {job.dateFound}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalResults > 0 && (
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-bold text-text-primary">{startIdx}</span> to{" "}
            <span className="font-bold text-text-primary">{endIdx}</span> of{" "}
            <span className="font-bold text-text-primary">{totalResults}</span> results
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? "text-text-muted cursor-not-allowed bg-surface"
                  : "text-text-secondary hover:bg-surface-secondary cursor-pointer"
              }`}
            >
              Previous
            </button>

            {/* Page Buttons */}
            {getPageNumbers().map((page, idx) =>
              typeof page === "string" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-text-muted text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange && onPageChange(page)}
                  className={`w-8 h-8 rounded-lg border text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === page
                      ? "border-accent/40 bg-accent-muted text-accent"
                      : "border-border text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1.5 rounded-lg border border-border text-sm font-medium transition-colors ${
                currentPage >= totalPages
                  ? "text-text-muted cursor-not-allowed bg-surface"
                  : "text-text-primary hover:bg-surface-secondary cursor-pointer"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
