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
- Classes: `sticky top-0 z-50 w-full border-b border-border bg-surface px-6 h-16 flex items-center justify-between`, `flex items-center max-w-[1440px] w-full mx-auto justify-between`, `h-[36px] w-[36px] rounded-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#4A2EC5]`, `text-[19px] font-bold text-text-darkest leading-[28px]`, `hidden md:flex items-center gap-8`, `text-sm font-medium transition-colors`, `inline-flex items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium text-white hover:bg-overlay-dark transition-colors`

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


