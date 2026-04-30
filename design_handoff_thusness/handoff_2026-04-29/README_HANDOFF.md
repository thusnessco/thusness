# Thusness — Site Implementation Handoff

**Feature:** Replace all current pages on `thusness.co` with the new design system pages built in this project. Archive existing pages — do not delete.

**Date:** 2026-04-29
**Stack:** Next.js (App Router) on Vercel
**Fidelity:** Match the runnable reference exactly. Pixel fidelity *and* content correctness both matter.

---

## Routes (final map)

| Route | Surface | Source artifact |
|---|---|---|
| `/`                       | Home — week's question, schedule card, theme, sessions, pillar | `prototype/site/onepage.jsx` |
| `/orient`                 | Orient booklet index — giant master + TOC | `prototype/site/orient-pages.jsx` (`OrientIndex`) |
| `/orient/stages`          | 01 · Stages of peace          | `prototype/site/orient.jsx` (`StagesOfPeace`) + booklet shell |
| `/orient/recognition`     | 02 · Two kinds of peace       | `RecognitionDiagram` + booklet shell |
| `/orient/pillars`         | 03 · Three pillars            | `PillarsDiagram` + booklet shell |
| `/orient/movement`        | 04 · Movement & progression   | `MovementDiagram` + booklet shell |
| `/orient/themes`          | 05 · Aspects of exploration   | `ThemesDiagram` + booklet shell |
| `/orient/nihilism`        | 06 · Aside · Empty & dependent | `NihilismDiagram` + booklet shell |
| `/notes`                  | Notes index (stub for now: *"Notes return soon."*) | — |
| `/notes/working-with-resistance` | Facilitator field note — Working with Resistance | `prototype/site/resistance.jsx` |
| `/notes/the-live-flow`    | Facilitator field note — The Live Flow | `prototype/site/flow.jsx` |
| `/readings`               | Readings index (stub for now: *"Coming."*) | — |

The site footer (every page) shows: `~ orient · readings · notes`.

---

## Run the reference

```bash
# From the repo root after copying this folder in:
open design_handoff_thusness/handoff_2026-04-29/reference/index.html
```

`reference/index.html` is a single self-contained HTML file. It loads React + Babel from CDN and renders **every route above** stacked in order, each in its own framed sheet with a route label at the top so you can see exactly what `/orient/pillars` is supposed to look like vs. `/notes/the-live-flow`. This is your visual contract for spacing, type, color, hairline weights, and composition.

> The reference is not the production code. Use it to verify your output. Source of truth for the *drawing code* (SVGs, geometry) is the `prototype/site/*.jsx` files.

---

## Source-of-truth rule (when things conflict)

Conflicts get resolved in this fixed order:

1. **`tokens.css` + `BRAND.md`** win on any color, type size, spacing, or glyph-usage decision.
2. **`reference/index.html`** wins on layout, composition, and visual rhythm.
3. **`content/*.json`** wins on every user-visible string. If the prototype JSX hardcodes copy, the JSON value supersedes.
4. **`prototype/site/*.jsx`** wins on diagram geometry (SVG paths, x/y coordinates, dot positions). Treat the prototype as the layout truth for the SVG content of each diagram.
5. The older handoff docs (`Orient booklet`, `Orient infographics`, `Resistance`, `Schedule card`, original `README.md`) are **superseded** by this folder. Read them only for additional context. If anything in them disagrees with this README or `INTEGRATION.md`, follow this folder.

---

## Replace strategy

1. Move every existing page/route under the new tree to `_archive/2026-04-29/<route>` (preserve folder structure). Do not delete.
2. Implement the new routes per `INTEGRATION.md`.
3. After the new routes pass the Done-when checklist, redirect any prior URLs that don't match the new map (use Next's `redirects()` config).

---

## Done when (numbered checklist)

1. **Tokens loaded.** `design_handoff_thusness/tokens.css` is imported globally; no Inter, Geist, or webfonts are loaded site-wide.
2. **All routes above resolve.** No 404s on `/`, `/orient`, the six `/orient/*` pages, `/notes`, the two notes, `/readings`.
3. **Archive exists.** Every page that previously lived at any of those URLs is preserved under `_archive/2026-04-29/`.
4. **Content is JSON-driven.** Every user-visible string on the new pages comes from a file in `content/` (one JSON per feature — `home.json`, `orient.json`, `notes-resistance.json`, `notes-flow.json`). Authors can change copy without a code change.
5. **Diagrams pixel-match the reference.** Open `reference/index.html` next to your built site at desktop width — the seven Orient diagrams and the Resistance/Flow blocks line up to the eye.
6. **Red-dot rule holds.** Exactly one red dot per page, in the footer signature. Zero on stub pages is fine.
7. **Footer nav appears on every page** with working links to `/orient`, `/readings`, `/notes`. The wordmark in every header links to `/`.
8. **Mobile.** At ≤ 720px every page reads cleanly with no horizontal scroll. Diagrams scale to fit the viewport (see § Responsive in `INTEGRATION.md`).
9. **No Tweaks panel** is shipped to production. The prototype's `tweaks-panel.jsx` is for design only.
10. **Verifier pass.** Build a Playwright (or Chromatic) snapshot of each route at 1280px width and confirm it matches `reference/index.html` for that route within ~2px tolerance.

---

## What's in this folder

```
handoff_2026-04-29/
├── README_HANDOFF.md          ← this file
├── INTEGRATION.md             ← routes, data wiring, TipTap rules, responsive, motion
├── TOKEN_ADDENDUM.md          ← any new tokens (currently: none)
├── reference/
│   └── index.html             ← single self-contained file: every route in order
├── content/
│   ├── home.json              ← /
│   ├── orient.json            ← /orient + 6 sub-pages (diagram copy + section prose)
│   ├── notes-resistance.json  ← /notes/working-with-resistance
│   └── notes-flow.json        ← /notes/the-live-flow
└── prototype/                 ← drawing code (don't ship as-is — port to TSX)
    └── (the .jsx files referenced above, copied at handoff time)
```

The components/ folder one level up (`design_handoff_thusness/components/`) contains TSX scaffolding from the prior handoff (Wordmark, RedDot, OrientLayout, ScaledDiagram, etc.). Reuse those — they're already correct. Don't duplicate.
