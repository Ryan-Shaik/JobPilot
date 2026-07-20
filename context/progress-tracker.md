# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 07 AI Profile Extraction from Resume
**Next:** 08 Resume PDF Generation from Profile

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
- [ ] 08 Resume PDF Generation from Profile

- [ ] 09 Find Jobs Page  —  Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

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

---

## Notes

- Feature 4 created `profiles`, `agent_runs`, `jobs`, and `agent_logs` tables with owner-scoped RLS policies and indexes.
- Created private `resumes` storage bucket and storage RLS policies scoped to object keys whose first path segment is the authenticated user ID.
- Resume object keys should use `{user_id}/resume.pdf` inside the `resumes` bucket; the older wording `resumes/{user_id}/resume.pdf` refers to bucket plus key together.


