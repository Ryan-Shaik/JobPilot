"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 px-6 bg-surface-secondary">
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

      <div className="relative max-w-[1440px] mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary max-w-4xl leading-tight">
          Job hunting is hard.
          <span className="block mt-2">Your tools shouldn&apos;t be.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed">
          Stop applying blind. JobPilot finds the jobs, researches the companies, and
          gives you everything you need to stand out.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            onClick={() => posthog.capture("cta_clicked", { label: "get_started", location: "hero" })}
            className="inline-flex items-center justify-center rounded-md bg-overlay px-6 py-3 text-sm font-medium text-white hover:bg-overlay-dark transition-colors shadow-sm"
          >
            Get Started
          </Link>
          <Link
            href="/find-jobs"
            onClick={() => posthog.capture("cta_clicked", { label: "find_first_match", location: "hero" })}
            className="inline-flex items-center justify-center rounded-md bg-surface border border-border px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-sm"
          >
            Find Your First Match
          </Link>
        </div>

        {/* Browser Mockup / Screenshot */}
        <div className="mt-16 w-full max-w-5xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
          {/* Browser Header */}
          <div className="bg-surface-secondary border-b border-border px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-error inline-block" />
              <span className="w-3 h-3 rounded-full bg-warning inline-block" />
              <span className="w-3 h-3 rounded-full bg-success inline-block" />
            </div>
            <div className="mx-auto bg-surface border border-border rounded-md px-8 py-0.5 text-xs text-text-secondary select-none">
              app.jobpilot.ai/dashboard
            </div>
          </div>
          {/* Screenshot Content */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/images/dashboard-demo.png"
              alt="JobPilot Dashboard Overview"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
