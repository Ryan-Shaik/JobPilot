"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import posthog from "posthog-js";
import { loginWithOAuthAction } from "@/app/actions/auth"; // 1. Import the action

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    setError(null);

    posthog.capture("sign_in_started", { provider });

    // 2. Call the Server Action instead of running createAuthActions here!
    const result = await loginWithOAuthAction(provider);

    if (result.error) {
      posthog.capture("sign_in_failed", { provider, error_message: result.error });
      setError(result.error);
      setLoadingProvider(null);
      return;
    }

    // 3. Redirect the browser to Google/GitHub using the URL returned from the server
    if (result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.2] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 w-full px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={118}
            height={40}
            priority
            className="h-8 md:h-9 w-auto object-contain"
          />
        </Link>
      </header>

      {/* Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[420px]">
          {/* Glow */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-[360px] h-[360px] rounded-full bg-accent/10 blur-[80px]" />
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="/icon.png"
                  alt="JobPilot"
                  width={48}
                  height={48}
                  priority
                  className="h-12 w-12 rounded-xl shadow-md object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-text-darkest tracking-tight">
                Welcome to JobPilot
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Sign in to start finding jobs tailored to you
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <svg
                  className="w-4 h-4 text-error mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-3">
              {/* Google */}
              <button
                id="btn-google-oauth"
                onClick={() => handleOAuth("google")}
                disabled={loadingProvider !== null}
                className="relative w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary hover:border-border-muted transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loadingProvider === "google" ? (
                  <Spinner />
                ) : (
                  <GoogleIcon />
                )}
                <span>Continue with Google</span>
              </button>

              {/* GitHub */}
              <button
                id="btn-github-oauth"
                onClick={() => handleOAuth("github")}
                disabled={loadingProvider !== null}
                className="relative w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-overlay px-4 py-3 text-sm font-medium text-white hover:bg-overlay-dark transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loadingProvider === "github" ? (
                  <Spinner light />
                ) : (
                  <GitHubIcon />
                )}
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider note */}
            <p className="mt-8 text-center text-xs text-text-muted leading-relaxed">
              By continuing, you agree to JobPilot&apos;s{" "}
              <span className="underline cursor-pointer hover:text-text-secondary">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline cursor-pointer hover:text-text-secondary">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {/* Back to home */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link
              href="/"
              className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <svg
      className={`w-5 h-5 animate-spin shrink-0 ${light ? "text-white/70" : "text-text-muted"}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
