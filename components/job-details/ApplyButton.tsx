import React from "react";

interface ApplyButtonProps {
  company: string;
  applyUrl?: string | null;
}

export function ApplyButton({ company, applyUrl }: ApplyButtonProps) {
  return (
    <a
      href={applyUrl || "#"}
      target={applyUrl ? "_blank" : undefined}
      rel={applyUrl ? "noopener noreferrer" : undefined}
      className="w-full py-3.5 px-6 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold text-sm text-center flex items-center justify-center transition-colors shadow-sm cursor-pointer"
    >
      Apply Now at {company}
    </a>
  );
}
