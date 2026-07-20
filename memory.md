# Memory — AI Extraction Warning Fix & Header Dynamic Sign Out

Last updated: 2026-07-20T15:06:00+06:00

## What was built

- **AI Extraction Warning Fix**:
  - Sanitized the raw AI output returned by `google/gemini-3.1-flash-lite` in `components/profile/ProfileForm.tsx`.
  - Coerced null fields (like `startMonth`, `startYear`, `endMonth`, `endYear`) to `""` before updating the `workExperiences` state, eliminating the React warning `value prop on select should not be null`.

- **Navbar & Header Dynamic Sign Out**:
  - Replaced the "Start for free" login link in `components/layout/Navbar.tsx` with a dynamic CTA.
  - Added a `checkAuthAction` server action in `app/actions/auth.ts` to bypass client-side domain isolation issues for cookies.
  - Shows **Sign Out** button when authenticated; shows **Login** button when unauthenticated.
  - Removed the duplicate **Sign Out** button from the profile page header in `components/profile/ProfileClient.tsx`.

## Decisions made

- **Null Coercion at state ingestion**: AI extraction returns raw JSON that can contain nulls for missing values; we always sanitize it to safe empty-string values before binding to controlled select inputs.
- **Server Action for auth checks client-side**: Because cookie storage is hosted on the Next.js app domain, CSR-based direct API calls to the InsForge backend subdomain lack credentials. Checking auth via a Server Action resolves this.

## Problems solved

- **React Select Null Warnings**: Fixed console noise/runtime warnings on select components during AI resume extraction.
- **Header Auth State Mismatch**: Fixed Navbar showing "Login" on authenticated pages (and "Sign Out" on unauthenticated homepages) by checking user session status server-side via Server Actions.

## Current state

- All Phase 1 & Phase 2 features (up to Feature 07) are complete.
- Project builds and runs without console warnings on resume extraction.
- Sign Out and Login button toggle dynamically based on actual auth state.

## Next session starts with

- **Feature 08 — Resume PDF Generation from Profile**:
  - Implement `/api/resume/generate` endpoint.
  - Read profile data from DB, rewrite details/bullets using LLM (`gemini-3.1-flash-lite`), render single-page PDF with `@react-pdf/renderer` buffer, upload it to the InsForge `resumes` bucket, and update the profile table.

## Open questions

- Confirm any specific styling rules or layout preferences for the generated resume PDF layout.
