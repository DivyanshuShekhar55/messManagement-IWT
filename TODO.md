# IIIT-BH Mess – Progress
## Done
- [x] Vite + React + Tailwind v4 scaffold, Vercel config (SPA + /api rewrite)
- [x] Express API as Vercel function (api/index.js), Mongo via MONGODB_URI placeholder
- [x] Auth: @iiit-bh.ac.in only, bcrypt + JWT, roles (admin via ADMIN_EMAILS env)
- [x] Daily menu (tabs) + weekly grid, veg/non-veg marks, calories/protein, allergens, announcements
- [x] Fees: student pending/paid + history (offline only); admin creates fees, marks paid
- [x] Complaints: quality/hygiene/meal rating/feedback, anonymous option, status + admin reply
- [x] Admin panel: add meals, announcements, fees, complaints
## Not done yet
- [ ] Split App.jsx into components/pages
- [ ] Edit/delete meal UI (DELETE /api/menu/:id exists)
- [ ] Seed script for a sample week menu
- [ ] Fee/complaint filters, search, pagination
- [ ] Rate limiting, email verification, password reset
- [ ] Skeleton loaders, toasts, dark mode
