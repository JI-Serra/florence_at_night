# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Florence at Night** — a nightclub event platform with three parts:
1. **Marketing website** (`index.html` + `main.js`) — static site built with Vite, served by Express
2. **Classic admin panel** (`admin/index.html`) — single-file HTML app for managing media and text
3. **Next.js admin panel** (`nightclub-admin/`) — work-in-progress replacement for the classic admin, not yet deployed

## Commands

### Marketing website + backend
```bash
npm run dev         # Vite dev server (frontend only, no backend)
npm run dev:server  # Express server in watch mode (serves /admin + API)
npm run build       # Build frontend to dist/
npm start           # Run production server (requires dist/ to exist)
```

### Next.js admin panel (nightclub-admin/)
```bash
cd nightclub-admin
npm run dev         # Next.js dev server
npm run build       # Production build
npm run lint        # ESLint
```

> **Note on Next.js version:** `nightclub-admin` uses Next.js 16 which has breaking API changes vs earlier versions. Read `nightclub-admin/node_modules/next/dist/docs/` before writing Next.js code — see `nightclub-admin/AGENTS.md`.

## Architecture

### Request flow (production)
All traffic goes through `server.js` (Express on port 3000):
- `GET /` → serves `dist/index.html` (built Vite output)
- `GET /admin` → serves `admin/index.html` (classic admin panel)
- `GET /api/*` → Express API routes
- Static files: `uploads/` takes precedence over `dist/` (so admin-uploaded media overrides build defaults)

### Media slot system
`server.js` defines 13 hardcoded media slots (lines 54–212):
- `mainevent` — hero image
- `LUNES`–`SABADO` — booking flyers (JPEG, one per day)
- `video-lunes`–`video-sabado` — weekly agenda videos (MP4)

Upload endpoint `POST /api/upload/:slotId` saves files to `uploads/` (or `uploads/videos weekly/` for video slots). Delete restores the slot to its default in `dist/`.

### Dynamic content
`data/texts.json` stores editable text fields (currently just `artist_name`). The website fetches this from `GET /api/texts` on load.

### Authentication
Session-based auth via `express-session`. Credentials come from `.env` (`ADMIN_USER`, `ADMIN_PASS`). All write API routes are protected by the `requireAuth` middleware in `server.js`.

### Frontend interactivity (`main.js`)
- **Lenis** handles smooth scrolling; all scroll-based effects (parallax, anchor navigation) hook into Lenis callbacks — not native scroll events.
- GSAP handles reveal animations via `IntersectionObserver`.
- The VIP booking form builds a WhatsApp `wa.me/` URL and opens it directly (no server-side form processing).

### Next.js admin (`nightclub-admin/`)
- `basePath: '/admin'` in `next.config.mjs` — all routes are prefixed
- TypeScript path alias: `@/*` → `./src/*`
- Supabase client in `src/lib/supabase.ts` — requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- DB schema is defined but not yet deployed: `supabase-setup.sql`

## Key files

| File | Purpose |
|------|---------|
| `server.js` | Express backend — all API routes, auth, media slots, static serving |
| `main.js` | Frontend entry point (Vite module) |
| `vite.config.js` | Multi-entry build: `index.html` + `booking.html` |
| `admin/index.html` | Monolithic admin panel (login + dashboard in one file) |
| `data/texts.json` | Editable text content (persists across deploys — do not delete) |
| `uploads/` | Admin-uploaded media (persists across deploys — do not delete) |
| `HOSTINGER_DEPLOY.md` | Step-by-step production deployment guide |

## Environment variables (`.env`)

```
ADMIN_USER=
ADMIN_PASS=
SESSION_SECRET=
PORT=3000
```

## Deployment notes

- Run `npm run build` before deploying; only `dist/`, `server.js`, `package.json`, `.env`, `admin/`, `uploads/`, and `data/` are needed on the server.
- The `nightclub-admin/` directory is **not** deployed — the classic `admin/index.html` is the active admin panel.
- Recommended media dimensions: header image 800×800px, booking flyers 1080×1920px, weekly videos 1080×1920px MP4 (max 50MB).
