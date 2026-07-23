# Penmozhi Client — Women's Health App

Next.js frontend for the Penmozhi women's health platform. Connects to the Flask API (`penmozhi-api`) for cycle tracking, symptom logging, medication reminders, AI assistant, PCOS status, education, and community forum features.

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- axios, react-hook-form, zod, sonner, recharts

## Setup

1. Copy environment file:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server (API must be running on port 5000):

```bash
npm run dev
```

4. Verify the client can reach the API:

```bash
npm run verify:api
```

Open [http://localhost:3000](http://localhost:3000).

### Connect API + client locally

**Terminal 1 — API**

```bash
cd penmozhi-api
python scripts/apply_manual_migrations.py   # first time / after schema updates
python run.py
```

**Terminal 2 — Client**

```bash
cd penmozhi-client
cp .env.example .env.local   # if not done yet
npm run dev
npm run verify:api
```

Browser requests go to `/backend/*` and Next.js proxies them to `http://127.0.0.1:5000`.

**Demo login:** `user@penmozhi.com` / `User123!` (run `python manage_db.py seed` in the API if needed).

## Environment

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend URL for Next.js server rewrites (not exposed to the browser) |
| `NEXT_PUBLIC_API_URL` | Client API base URL; use `/backend` to proxy through Next.js |

Copy `.env.example` to `.env.local` for local development.

## Deploy to Vercel

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com/new), import the repository.
3. Set **Root Directory** to `penmozhi-client` (the repo has both client and API).
4. Framework preset should auto-detect **Next.js** (see `vercel.json`).
5. Add environment variables under **Settings → Environment Variables**:

   | Name | Value (production) |
   |------|--------------------|
   | `API_URL` | Your deployed Flask API URL, e.g. `https://your-api.example.com` |
   | `NEXT_PUBLIC_API_URL` | `/backend` |

6. Deploy. Vercel runs `npm run build` and serves the app.

The `/backend` rewrite in `next.config.ts` forwards browser API calls to `API_URL`, so you do not need to expose the backend URL to the client or change CORS for the Vercel domain.

**CLI (optional):**

```bash
cd penmozhi-client
npx vercel
npx vercel --prod
```

## Routes

**Public:** `/`, `/education`, `/education/[id]`, `/auth/login`, `/auth/register`

**User dashboard:** `/dashboard`, `/dashboard/cycle`, `/dashboard/symptoms`, `/dashboard/reminders`, `/dashboard/ai-assistant`, `/dashboard/pcos-status`, `/dashboard/forum`, `/dashboard/profile`

**Admin:** `/admin/dashboard`, `/admin/education`, `/admin/education/new`, `/admin/education/edit/[id]`, `/admin/forum/moderation`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
