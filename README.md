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

Open [http://localhost:3000](http://localhost:3000).

## Environment

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
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
