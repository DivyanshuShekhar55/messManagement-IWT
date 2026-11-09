# PlateMate setup

## Local development
1. Run `npm install`.
2. Create a MongoDB Atlas cluster and database. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` to your MongoDB connection string, `JWT_SECRET` to a long random value, and `ADMIN_EMAILS` to one or more comma-separated college emails.
4. In one terminal run `node backend/index.js`; in another run `npm run dev`. Vite proxies `/api` to the local Express server on port 3000.

Vercel deployment handles the `/api` route automatically through the small adapter in `api/index.js`.

## Vercel deployment
1. Import the repository into Vercel.
2. Keep the build command as `npm run build`; Vite outputs the frontend to `dist`.
3. Add `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_EMAILS` under Project Settings → Environment Variables.
4. Deploy. No payment gateway is used: fees are recorded and marked paid offline by an admin.

The first registration whose email is included in `ADMIN_EMAILS` receives the admin role. All other `@iiit-bh.ac.in` registrations are students.
