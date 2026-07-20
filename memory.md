# Memory — AI Extraction Warning Fix & Header Sign Out Relocation

Last updated: 2026-07-20T14:45:00+06:00

## What was built

- **AI Extraction Warning Fix**:
  - Sanitized the raw AI output returned by `google/gemini-3.1-flash-lite` in `components/profile/ProfileForm.tsx`.
  - Coerced null fields (like `startMonth`, `startYear`, `endMonth`, `endYear`) to `""` before updating the `workExperiences` state, eliminating the React warning `value prop on select should not be null`.

- **Navbar & Header UX Redesign**:
  - Removed "Start for free" login link from `components/layout/Navbar.tsx` and replaced it with a **Sign Out** button (wired to `signOutAction()` and calling `posthog.reset()`).
  - Removed the duplicate **Sign Out** button from the profile page header in `components/profile/ProfileClient.tsx`.

## Decisions made

- **Null Coercion at state ingestion**: AI extraction returns raw JSON that can contain nulls for missing values; we always sanitize it to safe empty-string values before binding to controlled select inputs.
- **Unified Sign Out**: The Sign Out action should be globally accessible in the main navigation Header/Navbar rather than localized on the profile details page.

## Problems solved

- **React Select Null Warnings**: Fixed console noise/runtime warnings on select components during AI resume extraction.
- **Double Sign Out buttons**: Cleaned up the layout by consolidating sign-out behavior to the header.

## Current state

- All Phase 1 & Phase 2 features (up to Feature 07) are complete.
- Project builds without console warnings on resume extraction.
- Sign Out works from the primary Navbar.

## Next session starts with

- **Feature 08 — Resume PDF Generation from Profile**:
  - Implement `/api/resume/generate` endpoint.
  - Read profile data from DB, rewrite details/bullets using LLM (GPT-4o or Gemini), render single-page PDF with `@react-pdf/renderer` buffer, upload it to the InsForge `resumes` bucket, and update the profile table.

## Open questions

- Confirm any specific styling rules or layout preferences for the generated resume PDF layout.
