# Thusness

Public site and admin for **thusness.co** — Next.js (App Router), Supabase, TipTap.

## Scripts

```bash
npm install
npm run dev          # local dev
npm run build        # generates RedDot favicons, then production build
npm run generate:icons  # only regenerate app/public favicon assets
npm run lint
```

## Content

- **Weeks** live in Supabase (`weeks`); `/` uses the current week or a pinned published note.
- **Notes** are TipTap documents in `notes`; published notes appear on `/notes`.

Design reference lives under `design_handoff_thusness/` (not served by the app).
