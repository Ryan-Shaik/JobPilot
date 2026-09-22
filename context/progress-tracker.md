# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** 17 Analytics Charts — PostHog Data
**Next:** All 17 Features Completed (Full Project Build Complete)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page  —  Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- Feature 4 database schema was created through the InsForge CLI migration workflow, not ad hoc app code.
- Added `profiles.resume_pdf_key` alongside `resume_pdf_url` because current InsForge Storage SDK docs require saving both the returned URL and key for future download/delete operations.
- Feature 06 uses a single `saveProfileAction` Server Action (not an API route) to handle both profile upsert and resume upload in one round-trip.
- Resume validation (PDF MIME check) is done server-side in the Server Action — not relying on browser `accept` attribute.
- Profile completion percentage is calculated server-side on every save and stored in the DB; `CompletionIndicator` reads it as a prop.
- Work experience dates are stored as `startMonth`/`startYear`/`endMonth`/`endYear` fields inside the `work_experience` JSONB column (split from old `startDate`/`endDate` string format). A `parseDateString()` helper provides backward compatibility.
- Resume PDF preview uses `URL.createObjectURL` client-side for newly selected files; falls back to the stored `resume_pdf_url` for previously saved resumes.
- Fixed React "value prop on select should not be null" warnings during AI extraction by coercing null date fields to empty strings.
- Replaced the "Start for free" navbar link with a "Sign Out" button, and removed the duplicate "Sign Out" button from the profile page header.
- Feature 08 accepts current in-memory profile form state in `POST /api/resume/generate` so users can generate a PDF directly from unsubmitted edits; the endpoint refines content with `google/gemini-3.1-flash-lite`, renders an ATS-friendly single-page PDF with `@react-pdf/renderer` via `renderToBuffer()`, uploads it to InsForge Storage (`resumes/{user_id}/resume.pdf`), and syncs the updated profile to the DB in one atomic call.
- Feature 10 built universal job discovery via Adzuna API (omitting category restrictions to search across any industry/domain matching user resumes) with structured batch AI match scoring via `google/gemini-3.1-flash-lite` on OpenRouter, persistent tracking in `agent_runs`, `jobs`, and `agent_logs`, PostHog telemetry (`job_search_started`, `job_found`), and responsive UI loading/results states in `SearchControls` and `FindJobsClient`.
- Feature 11 implemented real database client filtering, multi-criteria sorting (Match Score, Newest, Oldest with chronological tiebreakers), case-insensitive text search over company name and job role, click-outside dropdown dismissals, design-token score indicators, and 20-items-per-page pagination with smart page numbering. Centralized `MATCH_THRESHOLD = 70` into `lib/utils.ts`.
- Feature 12 built the complete Job Details page (`/find-jobs/[id]`) matching the design specifications with `JobHeader` (company icon, title, company name, score pill, external post link), 4-card `JobInfoCards` grid (Salary Est., Location, Job Type, Date Found), `AIMatchReasoning` card, `SkillsComparison` card (matched and missing skills with status badges), `JobDescription` card, `CompanyResearch` card with empty state & dossier support, and full-width `ApplyButton`.
- Feature 13 implemented the Company Research Agent using Browserless `/content` scraping and Gemini AI synthesis via OpenRouter. Discovers root company domain from redirect URLs or company name, extracts homepage + sub-page text with `extractTextAndSublinks()`, fuses company signals with user profile and job posting into a 9-field dossier (`companyOverview`, `techStack`, `culture`, `whyThisRole`, `yourEdge`, `gapsToAddress`, `smartQuestions`, `interviewPrep`, `sources`), persists to `jobs.company_research` in InsForge DB, fires PostHog `company_researched` events, and displays live interactive states in `CompanyResearch.tsx`.
- Feature 13 UI Enhancement: replaced the plain loading spinner in `CompanyResearch.tsx` with a 5-step animated loading card (`ResearchLoadingCard`). Steps advance on staggered timers (2.5 s / 8 s / 5 s) capped at step 4 while the fetch is in flight; step 5 ("Saving dossier") appears on fetch resolution for 900 ms before the dossier renders. Active step row uses `bg-accent-muted` highlight + `Loader2` spin; completed steps use `CheckCircle2` green + `line-through`; pending steps use `Circle` muted. Accent progress bar fills proportionally. Research button is hidden while loading (locked in, no cancel).
- Feature 13 Dossier UI: replaced flat `list-disc pl-5` bullet lists with `flex items-start gap-2.5` icon-rows throughout the 9-section dossier. Each section heading now has a small `w-4 h-4 text-text-secondary` icon anchor. Item icons: culture → tiny `bg-accent` dot; your edge → `CheckCircle2 text-success`; gaps → `ShieldAlert text-warning`; smart questions → `bg-info-lightest` numbered badge (`01`, `02`…); interview prep → `Square text-text-muted`. Section spacing changed from `pt-6` to `py-5` / `pb-5` for consistent `divide-y` rhythm.
- Feature 14 Dashboard UI: implemented full dashboard layout matching `context/designs/dashboard.png` with top navigation, 4-card stats bar (`Total Jobs Found`, `Avg. Match Rate`, `Companies Researched`, `Jobs This Week`), 5-item `Recent Activity` timeline with semantic colored status dots (`accent`, `info`, `success`) and vertical guide line, 7-day `Company Research Activity` bar chart (`#61A8FF` bars with rounded top corners and dashed gridlines), 7-day `Jobs Found Over Time` smooth spline area curve (`#7C5CFC` stroke with gradient area fill), 5-bucket `Match Score Distribution` bar chart (`#10B981` emerald bars), and conditional incomplete profile alert banner. Updated `Navbar.tsx` to render `public/logo.png` (matching `context/designs/logo.png`) and right-aligned navigation items (`Dashboard`, `Find Jobs`, `Profile`) with active tab underline.
- Feature 15 Stats Bar Real Data: wired the 4 dashboard stat cards in `app/dashboard/page.tsx` directly to the InsForge `jobs` table filtered by `user_id = current_user`. Computes `totalJobs` count, `avgMatchRate` average, `researchedCount` (jobs with non-null `company_research`), and `jobsThisWeek` (jobs discovered within the last 7 days). Calculates weekly rate trends (`vs last week`) comparing the 7-day rolling window to the preceding 7-day period with graceful zero-state fallbacks and positive/negative trend badge styling.
- Feature 16 Recent Activity Real Data: wired the `RecentActivity` timeline to real InsForge `agent_runs` and `jobs` (where `company_research` is populated) records for the active user. Merged search runs ("Found X jobs for [jobTitle]") and research actions ("Researched [company]"), sorted chronologically by execution timestamp with `formatRelativeTime()` ("10 mins ago", "1 hour ago", "Yesterday"), assigned semantic dot indicators (`green` for jobs discovered, `purple` for zero-match runs, `blue` for company research dossiers), and provided an empty state with Clock icon for fresh accounts.
- Feature 17 Analytics Charts Real Data: built dual-source analytics service in `lib/posthog-analytics.ts` that queries PostHog HogQL API (`job_found` and `company_researched` events) when `POSTHOG_PERSONAL_API_KEY` is present, with seamless fallback to InsForge `jobs` records. Enhanced all three chart components (`JobsOverTimeChart`, `MatchScoreDistributionChart`, and `CompanyResearchChart`) with dynamic Y-axis scaling, intelligent date decimation, and contextual empty states with design-token icons (`TrendingUp`, `Target`, `Building2`).

---

## Notes

- Feature 4 created `profiles`, `agent_runs`, `jobs`, and `agent_logs` tables with owner-scoped RLS policies and indexes.
- Created private `resumes` storage bucket and storage RLS policies scoped to object keys whose first path segment is the authenticated user ID.
- Resume object keys should use `{user_id}/resume.pdf` inside the `resumes` bucket; the older wording `resumes/{user_id}/resume.pdf` refers to bucket plus key together.
