"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function BottomCTA() {
  return (
    <section className="relative overflow-hidden py-24 px-6 bg-surface-secondary">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary max-w-2xl leading-tight">
          Your next job search can feel a lot less overwhelming.
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-text-secondary max-w-xl leading-relaxed">
          Join 10,000+ professionals using AI to land their dream roles at
          top-tier companies.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            onClick={() => posthog.capture("cta_clicked", { label: "get_started", location: "bottom_cta" })}
            className="inline-flex items-center justify-center rounded-md bg-overlay px-6 py-3 text-sm font-medium text-white hover:bg-overlay-dark transition-colors shadow-sm"
          >
            Get Started
          </Link>
          <Link
            href="/find-jobs"
            onClick={() => posthog.capture("cta_clicked", { label: "find_first_match", location: "bottom_cta" })}
            className="inline-flex items-center justify-center rounded-md bg-surface border border-border px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-sm"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}
