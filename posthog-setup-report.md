<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into JobPilot. Here is a summary of every change made:

- **`instrumentation-client.ts`** (new) — Client-side PostHog initialization using the Next.js 15.3+ `instrumentation-client.ts` pattern. Calls `posthog.init()` with the reverse proxy path (`/ingest`), exception autocapture enabled, and debug mode in development.
- **`components/PostHogProvider.tsx`** (updated) — Removed the `posthog.init()` call (now handled by `instrumentation-client.ts`). The provider still wraps children in `PHProvider` and captures `$pageview` on route changes.
- **`next.config.ts`** (updated) — Added rewrites to proxy PostHog ingestion through `/ingest/*` (avoids ad blockers), plus `skipTrailingSlashRedirect: true`.
- **`lib/posthog-server.ts`** (new) — Server-side PostHog client using `posthog-node`, with `flushAt: 1` / `flushInterval: 0` for serverless-friendly immediate flushing.
- **`app/login/page.tsx`** (updated) — Captures `sign_in_started` (with `provider`) when a user clicks Google/GitHub, and `sign_in_failed` (with `provider` + `error_message`) on OAuth error.
- **`app/callback/page.tsx`** (updated) — Captures `sign_in_error` (with `reason`) for missing code, missing verifier, and exchange failures. Captures `sign_in_completed` and calls `posthog.identify(userId)` on success.
- **`components/homepage/Hero.tsx`** (updated) — Added `"use client"` directive and captures `cta_clicked` (with `label` and `location: "hero"`) on both CTA buttons.
- **`components/homepage/BottomCTA.tsx`** (updated) — Added `"use client"` directive and captures `cta_clicked` (with `label` and `location: "bottom_cta"`) on both CTA buttons.
- **`components/layout/Navbar.tsx`** (updated) — Captures `nav_cta_clicked` (with `label: "start_for_free"`) on the top-nav CTA.
- **`.env.local`** (updated) — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` written with correct values.

## Events tracked

| Event name | Description | File |
|---|---|---|
| `sign_in_started` | User clicked a social sign-in button (Google or GitHub) on the login page | `app/login/page.tsx` |
| `sign_in_failed` | OAuth sign-in attempt failed and an error was shown to the user | `app/login/page.tsx` |
| `sign_in_completed` | OAuth code exchange succeeded and the user was authenticated | `app/callback/page.tsx` |
| `sign_in_error` | OAuth callback failed due to missing code, missing verifier, or exchange error | `app/callback/page.tsx` |
| `cta_clicked` | User clicked a primary CTA button (Get Started or Find Your First Match) on the homepage | `components/homepage/Hero.tsx` |
| `cta_clicked` | User clicked a primary CTA button (Get Started or Find Your First Match) in the bottom CTA section | `components/homepage/BottomCTA.tsx` |
| `nav_cta_clicked` | User clicked the 'Start for free' CTA in the top navigation bar | `components/layout/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/487331/dashboard/1828393)
- [Sign-in funnel](https://us.posthog.com/project/487331/insights/q4VplUFJ) — Conversion from `sign_in_started` → `sign_in_completed`
- [Sign-in attempts by provider](https://us.posthog.com/project/487331/insights/UHRZwco6) — Google vs GitHub breakdown over time
- [Sign-in errors over time](https://us.posthog.com/project/487331/insights/7mOi1p24) — Auth failures broken down by failure reason
- [CTA clicks by location](https://us.posthog.com/project/487331/insights/HZQK8bne) — Hero, BottomCTA, and Navbar CTA engagement
- [Daily active users](https://us.posthog.com/project/487331/insights/qLA1ZLFD) — Unique successful sign-ins per day

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/deployment secrets so collaborators know what to set.
- [ ] Wire source-map upload (`npx posthog-cli sourcemap` or equivalent) into CI so production stack traces de-minify in PostHog Error Tracking.
- [ ] Confirm the returning-visitor path also calls `posthog.identify()` — currently identification only fires on fresh OAuth callback. If the app loads a session from cookies on page refresh, add `identify()` there too so returning sessions are not left on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
