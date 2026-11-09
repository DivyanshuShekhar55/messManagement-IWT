# PlateMate — IIIT-BH Mess

## Progress
- [x] Reorganized the app into `frontend/` and `backend/` folders while retaining the Vercel API adapter.
- [x] Built the clean lilac/black/white responsive dashboard inspired by the supplied reference.
- [x] Added college-email login and registration (`@iiit-bh.ac.in`) with student/admin roles.
- [x] Added overview dashboard with daily meal summary and quick actions.
- [x] Added daily and weekly menu views with veg/non-veg markers, nutrition, allergens, and announcements.
- [x] Added offline-only fee statements, payment history, and admin mark-as-paid workflow.
- [x] Added quality, hygiene, meal rating, anonymous feedback, and complaint status tracking.
- [x] Added admin tools for meals, announcements, fees, and feedback replies.
- [x] Added Vercel-friendly MongoDB API adapter and setup documentation.
- [ ] Add seed script for a sample week menu.
- [ ] Add edit/delete meal UI and richer admin filtering.
- [ ] Add production hardening: rate limiting, email verification, password reset, and loading/error toasts.

## Validation
- [x] `npm run build` passes and emits the Vercel-ready root `dist/` folder.
- [x] `git diff --check` passes.
