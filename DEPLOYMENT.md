# Deploying WorkMitra

This guide walks through deploying the full stack for free: MongoDB Atlas (database), Render (backend), and Vercel (frontend).

## 1. MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com) (or reuse an existing one — WorkMitra just needs its own database name inside it).
2. Under **Database Access**, create a user with a username/password that contains only letters and numbers (avoids URL-encoding headaches).
3. Under **Network Access**, add `0.0.0.0/0` so Render can connect (fine for a portfolio project).
4. Under **Connect → Drivers**, copy the connection string. Add `/workmitra` before the `?` so it looks like:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/workmitra?retryWrites=true&w=majority
   ```

## 2. Cloudinary (image uploads)

1. Sign up free at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.

## 3. Backend on Render

1. Push this repo to GitHub.
2. On [render.com](https://render.com), click **New → Web Service**, connect your repo.
3. Render should auto-detect `render.yaml` at the repo root. If not, set manually:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables (Render will prompt for the ones marked `sync: false` in `render.yaml`):
   - `MONGO_URI` — from step 1
   - `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` — generate with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
     (run twice, once per secret)
   - `CLIENT_URL` — your Vercel URL (set this *after* step 4, then redeploy)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from step 2
   - `SMTP_USER` / `SMTP_PASS` — optional; if using Gmail, this is an [App Password](https://myaccount.google.com/apppasswords), not your regular password
5. Deploy. Note your backend URL, e.g. `https://workmitra-api.onrender.com`.

Note: Render's free tier spins down after inactivity, so the first request after idle time can take 30-60 seconds to wake up — this is normal, not a bug.

## 4. Frontend on Vercel

1. On [vercel.com](https://vercel.com), import the same repo.
2. Set root directory to `client`.
3. Add environment variable:
   - `VITE_API_URL` = `https://workmitra-api.onrender.com/api` (your Render URL + `/api`)
4. Deploy. Note your frontend URL, e.g. `https://workmitra.vercel.app`.

## 5. Connect them

Go back to Render → your backend service → environment variables → set `CLIENT_URL` to your Vercel URL (e.g. `https://workmitra.vercel.app`) and redeploy. This is required for CORS and for the refresh-token cookie to work correctly in production (it uses `sameSite: 'none'` + `secure: true` when `NODE_ENV=production`, which requires HTTPS on both ends — which Render and Vercel provide by default).

## 6. Verify

Visit your Vercel URL, register an account, and confirm:
- Registration/login works
- A page refresh keeps you logged in
- Searching for workers returns results (once a worker account has set a profile)
- Real-time chat connects (check the browser console for socket connection errors if not)

## Local development

This all still works locally exactly as before — `npm run dev` in both `server/` and `client/`, with `.env` pointing at the same Atlas cluster (or a local MongoDB if you prefer) and `VITE_API_URL` left unset (it defaults to `http://localhost:5000/api`).
