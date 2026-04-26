# Tubil (Private MVP)

Tubil is a web-first fuel intelligence app for Bohol (including Dauis and Panglao).
This implementation is optimized for private daily use and local testing.

## Stack

- Frontend: React + TypeScript + MUI + Leaflet
- Backend: Node.js + Express + TypeScript
- Database: MySQL (Laragon) via Prisma ORM
- Auth: Email/password (Google optional later)

## Implemented MVP Modules

- Interactive map with color-coded station prices
- Bohol-scoped station listing API (nearby/radius)
- Price logging endpoint with points increment
- Vehicle garage (add/list)
- Trip cost estimator (save estimate history)
- Refuel logging and history
- Email/password register/login with JWT
- OSM/Overpass station import script (Bohol bounding box)

## Local Setup

1. Create database in phpMyAdmin (Laragon): `tubil`
2. Configure backend env:
   - Copy `backend/.env.example` to `backend/.env`
   - Set `DATABASE_URL` and `JWT_SECRET`
3. Run Prisma migration to create tables:
   - `cd backend`
   - `npm.cmd run prisma:migrate -- --name init`
4. Generate Prisma client (if needed):
   - `npm.cmd run prisma:generate`
5. Seed Bohol stations from Overpass:
   - `npm.cmd run seed:stations`

## Run Dev Servers

Backend:

```powershell
cd backend
npm.cmd run dev
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

## API Base URL

Frontend points to:

- `http://localhost:4000/api`

For deployment, use `VITE_API_BASE_URL` in the frontend environment.

## Publish For Phone Access

Use this setup for a free/public link that works on phone:

1. Push code to GitHub
2. Deploy backend + database on Railway (or Render + managed MySQL)
3. Deploy frontend on Vercel

Important: GitHub Pages alone is not enough for this app, because the frontend needs a live backend API and database.

### 1) Push To GitHub

From project root:

```powershell
git init
git add .
git commit -m "Initial Tubil MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/tubil.git
git push -u origin main
```

### 2) Deploy Backend + MySQL

Use `backend` as service root.

Environment variables:

- `DATABASE_URL` = managed MySQL connection string
- `JWT_SECRET` = long random secret
- `FRONTEND_URLS` = frontend URL list for CORS
   - Example: `https://tubil.vercel.app,http://localhost:5173`

Build/start:

- Build: `npm run build`
- Start: `npm run start`

After deploy, test health check:

- `https://your-backend-domain/api/health`

### 3) Deploy Frontend On Vercel

Use `frontend` as project root.

Environment variable:

- `VITE_API_BASE_URL` = `https://your-backend-domain/api`

Build settings:

- Build command: `npm run build`
- Output directory: `dist`

Note: `frontend/vercel.json` is included so React routes work on refresh.

### 4) Use It On Your Phone

1. Open your Vercel URL in Chrome on phone.
2. Login and verify API features (stations, vehicles, trips).

### 5) Make It Searchable In Chrome/Google

1. Connect a custom domain in Vercel (example: `tubil.app`).
2. Add that domain to `FRONTEND_URLS` on backend.
3. Add your site to Google Search Console and submit indexing.

Notes:

- Search discovery takes time (often days), not instant.
- The direct URL works immediately after deployment.
- HTTPS hosting is required for reliable geolocation on mobile.

## Next Build Targets

- Add verify/upvote system for submitted prices
- Add admin-only station import endpoint hardening
- Add Google sign-in as optional auth provider
- Add profile card + QR and gamification leaderboard UI
