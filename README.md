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

- **Homepage** is driven by `site_content.homepage_pin`: a **published note** slug, or a **Simple / Full** structured layout stored with that pin. Legacy `{ "source": "week" }` rows are treated as the default Simple layout.
- **Notes** are TipTap documents in `notes`; published notes appear on `/notes` and can be pinned to `/`.

Design reference lives under `design_handoff_thusness/` (not served by the app).
