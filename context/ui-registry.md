# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### [Navbar](file:///c:/Users/Shaik/Desktop/jobpilot/components/layout/Navbar.tsx)
- Classes: `sticky top-0 z-50 w-full border-b border-border bg-surface px-6 h-16 flex items-center justify-between`, `flex items-center max-w-[1440px] w-full mx-auto justify-between h-full`, `h-8 md:h-9 w-auto object-contain` (logo Image), `flex items-center gap-6 md:gap-8 h-full`, `relative flex items-center gap-2 text-sm font-medium transition-colors h-full`, `text-accent`, `text-text-secondary hover:text-text-primary`, `absolute bottom-0 left-0 right-0 h-[2px] bg-accent` (active bottom indicator), `inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-text-secondary bg-surface hover:bg-surface-secondary hover:text-error hover:border-error/30 transition-colors`

### [Footer](file:///c:/Users/Shaik/Desktop/jobpilot/components/layout/Footer.tsx)
- Classes: `w-full border-t border-border bg-surface py-8 px-6 mt-auto`, `flex flex-col md:flex-row items-center justify-between max-w-[1440px] w-full mx-auto gap-4`, `flex flex-col items-center md:items-start gap-1`, `text-[19px] font-bold text-text-darkest leading-[28px]`, `text-xs text-text-muted leading-4`, `flex items-center gap-6 flex-wrap justify-center`, `text-xs text-text-secondary hover:text-text-primary transition-colors font-medium leading-4`

### [Hero](file:///c:/Users/Shaik/Desktop/jobpilot/components/homepage/Hero.tsx)
- Classes: `relative overflow-hidden py-20 px-6 bg-surface-secondary`, `absolute inset-0 opacity-[0.25] pointer-events-none`, `relative max-w-[1440px] mx-auto flex flex-col items-center text-center`, `text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary max-w-4xl leading-tight`, `mt-6 text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed`, `mt-8 flex flex-col sm:flex-row gap-4`, `inline-flex items-center justify-center rounded-md bg-overlay px-6 py-3 text-sm font-medium text-white hover:bg-overlay-dark transition-colors shadow-sm`, `inline-flex items-center justify-center rounded-md bg-surface border border-border px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-sm`, `mt-16 w-full max-w-5xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden`, `bg-surface-secondary border-b border-border px-4 py-3 flex items-center gap-2`, `flex gap-1.5`, `w-3 h-3 rounded-full bg-error inline-block`, `w-3 h-3 rounded-full bg-warning inline-block`, `w-3 h-3 rounded-full bg-success inline-block`, `mx-auto bg-surface border border-border rounded-md px-8 py-0.5 text-xs text-text-secondary select-none`, `relative w-full aspect-[16/9]`, `object-cover`

### [Capabilities](file:///c:/Users/Shaik/Desktop/jobpilot/components/homepage/Capabilities.tsx)
- Classes: `py-24 px-6 bg-surface`, `max-w-[1440px] mx-auto`, `text-center mb-16`, `text-xs font-semibold uppercase tracking-wider text-accent leading-5`, `mt-3 text-3xl md:text-4xl font-bold text-text-primary`, `grid grid-cols-1 md:grid-cols-3 gap-8`, `flex flex-col bg-surface border border-border rounded-2xl p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:shadow-md duration-300`, `w-12 h-12 rounded-xl flex items-center justify-center mb-6`, `text-base font-semibold text-text-primary mb-3`, `text-sm font-medium text-text-secondary leading-relaxed`

### [Testimonial](file:///c:/Users/Shaik/Desktop/jobpilot/components/homepage/Testimonial.tsx)
- Classes: `relative overflow-hidden py-24 px-6 bg-gradient-to-br from-[#E0F2FE] via-[#F3E8FF] to-[#EFF6FF]`, `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#7C5CFC]/10 to-[#61A8FF]/10 blur-3xl pointer-events-none`, `relative max-w-4xl mx-auto flex flex-col items-center text-center`, `text-[120px] font-serif font-black text-accent/20 select-none leading-none h-[60px]`, `mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-text-primary leading-snug max-w-3xl`, `mt-8 flex flex-col items-center`, `relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md`, `mt-4`, `not-italic text-sm font-semibold text-text-primary block`, `text-xs font-medium text-text-secondary`

### [BottomCTA](file:///c:/Users/Shaik/Desktop/jobpilot/components/homepage/BottomCTA.tsx)
- Classes: `relative overflow-hidden py-24 px-6 bg-surface-secondary`, `absolute inset-0 opacity-[0.25] pointer-events-none`, `relative max-w-4xl mx-auto flex flex-col items-center text-center`, `text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary max-w-2xl leading-tight`, `mt-6 text-base md:text-lg text-text-secondary max-w-xl leading-relaxed`, `mt-8 flex flex-col sm:flex-row gap-4`

### [CompletionIndicator](file:///c:/Users/Shaik/Desktop/jobpilot/components/profile/CompletionIndicator.tsx)
- Classes: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-6`, `text-error mt-0.5`, `bg-[#FEF2F2] text-error border border-red-100 rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wider`, `stroke-border-light`, `stroke-error`

### [ResumeUpload](file:///c:/Users/Shaik/Desktop/jobpilot/components/profile/ResumeUpload.tsx)
- Classes: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-6`, `border border-dashed border-border-muted rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-surface-secondary`, `w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center text-accent`, `px-4 py-2 border border-border rounded-md text-sm font-medium text-text-secondary bg-surface hover:bg-surface-secondary transition-colors`, `inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent-dark transition-colors text-sm font-medium`

### [ProfileForm](file:///c:/Users/Shaik/Desktop/jobpilot/components/profile/ProfileForm.tsx)
- Classes: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-8`, `flex flex-col md:flex-row gap-6`, `flex-1 flex flex-col gap-2`

### [SearchControls](file:///c:/Users/Shaik/Desktop/jobpilot/components/jobs/SearchControls.tsx)
- Classes: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-4`, `text-xs font-bold text-text-dark tracking-wider uppercase`, `w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all`, `h-[42px] px-6 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer`, `bg-success-lightest border border-success-light rounded-xl px-4 py-3 flex items-center gap-2.5 mt-1`, `text-sm font-medium text-success-foreground`

### [JobFilterBar](file:///c:/Users/Shaik/Desktop/jobpilot/components/jobs/JobFilterBar.tsx)
- Classes: `bg-surface border border-border rounded-2xl p-3 px-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4`, `w-full bg-transparent border-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none`, `px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-secondary flex items-center gap-2 transition-colors cursor-pointer`, `text-accent font-semibold bg-accent-muted`

### [JobsTable](file:///c:/Users/Shaik/Desktop/jobpilot/components/jobs/JobsTable.tsx)
- Classes: `bg-surface border border-border rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col`, `py-4 px-6 text-xs font-bold text-text-secondary tracking-wider uppercase`, `hover:bg-surface-secondary/60 transition-colors group cursor-pointer`, `w-9 h-9 rounded-lg bg-surface-secondary border border-border flex items-center justify-center text-text-secondary`, `w-28 h-1.5 rounded-full bg-border-light overflow-hidden flex`, `border-accent/40 bg-accent-muted text-accent font-semibold`, `bg-success`, `bg-warning`, `bg-text-muted`

### [JobHeader](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/JobHeader.tsx)

File: `components/job-details/JobHeader.tsx`  
Last updated: 2026-08-22

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (card), `rounded-2xl` (logo icon box), `rounded-xl` (action button), `rounded-full` (pill) |
| Text — primary   | `text-text-primary` (`text-2xl font-bold leading-tight`) |
| Text — secondary | `text-text-secondary` (`text-sm font-semibold`), `text-text-muted` |
| Spacing          | `p-6` (card padding), `gap-5` (flex items gap), `px-4 py-2` (button) |
| Hover state      | `hover:bg-surface-secondary` |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `bg-success-lightest text-success border border-success-light/40` |

**Pattern notes:**
Main banner for individual job posting. Displays company icon box, bold role title, company name, match score pill, and an external "View Job Post" action.

### [JobInfoCards](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/JobInfoCards.tsx)

File: `components/job-details/JobInfoCards.tsx`  
Last updated: 2026-08-22

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface`, `bg-success-lightest`, `bg-info-lightest`, `bg-accent-muted`, `bg-surface-secondary` |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (cards), `rounded-xl` (icon containers) |
| Text — primary   | `text-text-primary` (`text-sm font-bold truncate`) |
| Text — secondary | `text-text-muted` (`text-[10px] font-bold tracking-wider uppercase`) |
| Spacing          | `p-4`, `gap-3.5`, `grid gap-4` |
| Hover state      | none |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | Contextual icon color tokens: `text-success`, `text-info-foreground`, `text-accent`, `text-text-secondary` |

**Pattern notes:**
4-column grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`) for quick key metadata (Salary Est., Location, Job Type, Date Found).

### [AIMatchReasoning](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/AIMatchReasoning.tsx)

File: `components/job-details/AIMatchReasoning.tsx`  
Last updated: 2026-08-22

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface`, `bg-success-lightest` (icon badge) |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (card), `rounded-lg` (icon badge) |
| Text — primary   | `text-text-primary` (`text-sm leading-relaxed`) |
| Text — secondary | `text-text-secondary` (`text-xs font-bold tracking-wider uppercase`) |
| Spacing          | `p-6`, `gap-3.5` |
| Hover state      | none |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `text-success-alt` (sparkles icon) |

**Pattern notes:**
Highlights AI reasoning explaining why the profile matches the job requirements.

### [SkillsComparison](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/SkillsComparison.tsx)

File: `components/job-details/SkillsComparison.tsx`  
Last updated: 2026-08-22

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface`, `bg-success-lightest` (matched skill pill), `bg-accent-muted` (gap skill pill) |
| Border           | `border border-border`, `border-success-light/40` (matched), `border-accent-light/40` (gap) |
| Border radius    | `rounded-2xl` (card), `rounded-full` (skill badges) |
| Text — primary   | `text-success-foreground` (matched skill), `text-accent` (gap skill) |
| Text — secondary | `text-text-secondary` (`text-xs font-semibold`), `text-text-muted` |
| Spacing          | `p-6`, `gap-4`, `gap-2` (badges wrap), `px-3 py-1` (skill badge padding) |
| Hover state      | none |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `text-success` (check icon), `text-accent` (cross icon & gap skill badge) |

**Pattern notes:**
Two-tier skills breakdown contrasting candidate strengths ("You have") against "Gap skills".

### [JobDescription](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/JobDescription.tsx)

File: `components/job-details/JobDescription.tsx`  
Last updated: 2026-08-22

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface`, `bg-surface-secondary` (clipped excerpt banner), `bg-surface` (banner action button) |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (card), `rounded-xl` (excerpt banner), `rounded-lg` (banner action button) |
| Text — primary   | `text-text-primary` (`text-base font-bold` heading, `text-sm leading-relaxed whitespace-pre-line` body) |
| Text — secondary | `text-text-secondary` (`text-xs font-bold uppercase tracking-wider`), `text-text-muted` |
| Spacing          | `p-6`, `gap-4`, `p-3.5` (banner), `px-3 py-1.5` (button) |
| Hover state      | `hover:text-accent-dark`, `hover:bg-surface-tertiary` |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `text-accent` (header link and expand button) |

**Pattern notes:**
Includes truncation detection, clean excerpt rendering, expandable long description view, and an in-card CTA linking to the full external posting.

### [CompanyResearch](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/CompanyResearch.tsx)

File: `components/job-details/CompanyResearch.tsx`  
Last updated: 2026-09-04

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface`, `bg-accent-muted` (icon box + active loading step row), `bg-accent` (CTA button + progress bar fill), `bg-surface-secondary` (empty icon box & tech tags), `bg-info-lightest` (question number badge) |
| Border           | `border border-border`, `divide-y divide-border`, `bg-border-light` (progress bar track) |
| Border radius    | `rounded-2xl` (card), `rounded-xl` (buttons, icon containers, loading step rows), `rounded-full` (tags, progress bar, culture dot), `rounded-md` (question number badge) |
| Text — primary   | `text-text-primary` (`text-base font-bold` heading, `text-sm font-bold` active loading step, `text-sm leading-relaxed` body), `text-accent-foreground` (button) |
| Text — secondary | `text-text-secondary` (`text-xs font-bold uppercase tracking-wider` section headings), `text-text-muted` (pending steps, `Square` prep icon, sources section) |
| Spacing          | `p-6`, `gap-6` (card), `pb-5` / `py-5` / `pt-5` (dossier section padding), `gap-2` (section inner), `gap-2.5` (flex icon-rows), `gap-3` (smart questions), `px-4 py-2` (button), `px-3 py-2.5` (loading step row) |
| Hover state      | `hover:bg-accent-dark` (CTA button) |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `text-accent` / `bg-accent` (button, culture dot `bg-accent`), `text-success` (edge heading + item icon), `text-warning` (gaps heading + item icon), `text-info-foreground` / `bg-info-lightest` (question badge), `text-border-muted` (loading pending circle) |

**Pattern notes:**
Three rendering states: (1) **Empty state** — centered icon + copy. (2) **Multi-step loading card** — 5-step list with timer-driven advancement, `bg-accent-muted` active row, accent progress bar, button hidden while loading (locked in). (3) **Dossier view** — 9 `divide-y divide-border` sections, each with a small `w-4 h-4 text-text-secondary` icon beside the heading. List items use `flex items-start gap-2.5` rows with semantic icons instead of `list-disc`: culture → `w-1.5 h-1.5 rounded-full bg-accent` dot; your edge → `CheckCircle2 text-success`; gaps → `ShieldAlert text-warning`; smart questions → numbered `bg-info-lightest` badge (`01`, `02`…); interview prep → `Square text-text-muted`. Tech stack remains pill tags. Sources remain compact URL chips.



### [ApplyButton](file:///c:/Users/Shaik/Desktop/jobpilot/components/job-details/ApplyButton.tsx)

File: `components/job-details/ApplyButton.tsx`  
Last updated: 2026-08-22

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-accent` |
| Border           | none |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-white font-semibold text-sm` |
| Text — secondary | none |
| Spacing          | `w-full py-3.5 px-6` |
| Hover state      | `hover:bg-accent-dark` |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent` |

**Pattern notes:**
Full-width primary action button at the bottom of the job details view linking out to the employer application page.

### [StatsBar](file:///c:/Users/Shaik/Desktop/jobpilot/components/dashboard/StatsBar.tsx)

File: `components/dashboard/StatsBar.tsx`  
Last updated: 2026-09-05

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface`, `bg-[#ECFDF5]` (positive trend), `bg-[#FEF2F2]` (negative trend) |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (cards), `rounded-[4px]` (trend badge) |
| Text — primary   | `text-text-primary` (`text-[30px] font-semibold leading-[36px] tracking-tight`) |
| Text — secondary | `text-text-secondary` (`text-sm font-medium`), `text-text-muted` (`text-xs leading-4`), `text-[#009966]` (positive), `text-error` (negative) |
| Spacing          | `p-6` (card padding), `gap-6` (grid), `gap-2` (trend gap), `mt-1.5`, `mt-4` |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |

**Pattern notes:**
4-column stats row displaying Total Jobs Found, Avg. Match Rate, Companies Researched, and Jobs This Week wired to real InsForge database metrics with dynamic trend styling.

### [RecentActivity](file:///c:/Users/Shaik/Desktop/jobpilot/components/dashboard/RecentActivity.tsx)

File: `components/dashboard/RecentActivity.tsx`  
Last updated: 2026-09-05

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` |
| Border           | `border border-border`, `w-[1px] bg-border-light` (timeline line) |
| Border radius    | `rounded-2xl` (card), `rounded-full` (timeline dot) |
| Text — primary   | `text-text-primary` (`text-base font-semibold` title, `text-sm font-medium` item title) |
| Text — secondary | `text-text-muted` (`text-xs leading-none` timestamp) |
| Spacing          | `p-6`, `gap-4`, `pb-6` / `pb-1`, `mb-6` |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `bg-accent ring-[#F3E8FF]`, `bg-info ring-[#DBEAFE]`, `bg-success ring-[#D0FAE5]` |

**Pattern notes:**
Vertical timeline card showing recent user and agent activities connected with a subtle vertical line and color-coded status dots (`purple` for search runs, `green` for jobs found, `blue` for company research). Includes an elegant empty state with Clock icon when no activities exist yet.

### [CompanyResearchChart](file:///c:/Users/Shaik/Desktop/jobpilot/components/dashboard/CompanyResearchChart.tsx)

File: `components/dashboard/CompanyResearchChart.tsx`  
Last updated: 2026-09-05

| Property         | Class / SVG Attributes |
| ---------------- | ----- |
| Background       | `bg-surface` |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (card), `rx="3" ry="3"` (bars) |
| Text — primary   | `text-text-primary` (`text-base font-semibold` heading) |
| Text — secondary | `#9CA3AF`, 12px Inter (axis labels) |
| Gridlines        | `#E7EAF3` dashed (`strokeDasharray="4 4"`) |
| Bars             | `#61A8FF` (info blue) |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Empty state      | Building2 icon in `bg-info/10`, text-text-secondary prompt |

**Pattern notes:**
Weekly vertical bar chart showing daily company research frequency with dashed horizontal gridlines, dynamic Y-axis scaling, and rounded bar tops. Displays a clean empty state card when 0 company dossiers exist for the user.

### [JobsOverTimeChart](file:///c:/Users/Shaik/Desktop/jobpilot/components/dashboard/JobsOverTimeChart.tsx)

File: `components/dashboard/JobsOverTimeChart.tsx`  
Last updated: 2026-09-05

| Property         | Class / SVG Attributes |
| ---------------- | ----- |
| Background       | `bg-surface` |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (card) |
| Text — primary   | `text-text-primary` (`text-base font-semibold` heading) |
| Text — secondary | `#9CA3AF`, 12px Inter (axis labels) |
| Line stroke      | `#7C5CFC` (`--color-accent`), 3px stroke, smooth cubic bezier spline |
| Area fill        | Gradient from `rgba(124, 92, 252, 0.25)` to transparent |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Empty state      | TrendingUp icon in `bg-accent/10`, text-text-secondary prompt |
| Interaction      | Interactive crosshair hairline, glowing highlight dot, and dark floating SVG tooltip card (`#1E1B4B`) displaying exact date and job count |

**Pattern notes:**
Smooth clamped area spline curve chart tracking 30-day jobs discovered over time with purple accent gradient fill, dynamic Y-axis tick calculation, intelligent X-axis date label decimation, baseline-clamped Catmull-Rom cubic bezier math (no dips below zero), static dots only on non-zero days, full-width mouse tracking with an interactive vertical crosshair, and an aligned floating SVG tooltip. Displays a centered empty state when no jobs have been discovered.

### [MatchScoreDistributionChart](file:///c:/Users/Shaik/Desktop/jobpilot/components/dashboard/MatchScoreDistributionChart.tsx)

File: `components/dashboard/MatchScoreDistributionChart.tsx`  
Last updated: 2026-09-05

| Property         | Class / SVG Attributes |
| ---------------- | ----- |
| Background       | `bg-surface` |
| Border           | `border border-border` |
| Border radius    | `rounded-2xl` (card), `rx="3" ry="3"` (bars) |
| Text — primary   | `text-text-primary` (`text-base font-semibold` heading) |
| Text — secondary | `#9CA3AF`, 12px Inter (axis labels) |
| Gridlines        | `#E7EAF3` dashed (`strokeDasharray="4 4"`) |
| Bars             | `#10B981` (emerald green / `--color-success`) |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Empty state      | Target icon in `bg-success/10`, text-text-secondary prompt |

**Pattern notes:**
Vertical bar chart visualizing match score distribution across 5 buckets (50-60% through 90-100%) with dynamic scaling and a clean empty state card.

### [DashboardClient](file:///c:/Users/Shaik/Desktop/jobpilot/components/dashboard/DashboardClient.tsx)

File: `components/dashboard/DashboardClient.tsx`  
Last updated: 2026-09-05

| Property         | Class |
| ---------------- | ----- |
| Layout           | `flex flex-col gap-6 w-full` |
| Incomplete Banner| `bg-surface border border-warning/30 rounded-2xl p-4 shadow-sm`, `bg-warning/10 text-warning`, `bg-accent text-accent-foreground rounded-xl` |
| Middle Grid      | `grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch` |
| Bottom Grid      | `grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch` (`lg:col-span-2`, `lg:col-span-1`) |

**Pattern notes:**
Master client component orchestrating the 3-tier dashboard layout matching `context/designs/dashboard.png` with optional profile attention banner support.

