# Setup
1. `npm i` then `npm i -g vercel`
2. MongoDB Atlas: create free cluster > Database Access user > Network Access allow 0.0.0.0/0 > Connect > copy URI (add db name, e.g. /mess)
3. Copy `.env.example` to `.env`, paste URI, set JWT_SECRET, set ADMIN_EMAILS (your mail = admin on register)
4. `vercel dev` (runs frontend + API together) and open the URL shown
5. Deploy: push to GitHub > import in Vercel > add the 3 env vars in Project Settings > Deploy
