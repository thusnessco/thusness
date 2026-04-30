# Handoff: Thusness — Visual Identity & Site Redesign

This bundle contains everything needed to implement the Thusness visual identity across `thusness.co`, including design tokens, the logo system, ready-to-paste CSS, a React component for the single-page layout, and SVG assets.

**Requesting new pages from Claude (or another agent):** use **`HANDOFF_REQUEST_TEMPLATE.md`** — copy the fenced block into a new chat so the output is structured (`content.json`, runnable prototype, `INTEGRATION.md`, token discipline) and stays flexible as copy and blocks evolve.

**Claude Design export (2026-04-29):** `handoff_2026-04-29/` (`README_HANDOFF.md`, `INTEGRATION.md`, `content/home.json`) plus **`Orient - fix list.md`** — diagram parity checklist vs `prototype/site/orient.jsx`. The full HTML/JSX prototypes from that export live under your machine’s **`/Users/colin/Downloads/thusness/project/`** (e.g. `Orient pages.html`, `design_handoff_thusness/prototype/`, `site/orient.jsx`); copy those in if you want them under version control here.

## About the design files

The files in this bundle are **design references** — an HTML/React prototype showing the intended look and behavior, plus production-ready CSS and assets. The prototype uses inline styles for iteration speed; for shipping, prefer the tokenized CSS in `tokens.css` and the component pattern in `components/`.

**`prototype/Thusness-standalone.html`** — Claude-exported single file (~1.2MB) that unpacks the bundled UI in the browser (open locally; needs JavaScript). Use it as the latest shared snapshot alongside `prototype/Thusness.html` + `site/onepage.jsx`.

Your task is to **apply this identity across the existing Next.js site**, using the codebase's established patterns. The CSS tokens and SVG assets are drop-in. The component code is a reference — port it to match your existing file conventions (CSS Modules, Tailwind, styled-components, etc.).

## Fidelity

**High fidelity.** Exact colors, type, spacing, and glyph usage are specified. Match them precisely. The identity is intentionally spare — every line, glyph, and space is load-bearing.

---

## 1. The system in one paragraph

Thusness is set in **Helvetica italic** on a **warm cream ground** (`#efece1`) with **near-black ink** (`#1a1915`). There is one structural glyph — the **tilde `~`** — which appears in the wordmark, as section markers, and as list bullets. There is one accent color — a **muted red dot** (`#c23a2a`) — which appears **once per page**, in the footer, as a signature, and as the **favicon** on the live site. Separations are done primarily with **whitespace**; secondarily with **hairline rules** (`#c7c2b0`, 1px). No gradients, no drop shadows, no emoji, no icon libraries. Centered composition is preferred for focal moments (the week's question, "Pillar of Success"); left-aligned for reading prose.

---

## 2. Design tokens

See `tokens.css` for drop-in CSS variables. The full palette, type, and spacing scale:

### Colors

| Token | Hex | Purpose |
|---|---|---|
| `--bg` | `#efece1` | Page background. Warm cream. |
| `--ink` | `#1a1915` | Primary text, headings. Near-black, warm. |
| `--ink-soft` | `#3d3a2f` | Body prose. |
| `--muted` | `#8a8672` | Secondary labels, dates, captions. |
| `--rule` | `#c7c2b0` | Hairline rules, card borders. |
| `--red` | `#c23a2a` | Signature dot. Used **once per page**, in the footer. |

**Dark mode** (optional, future): `--bg: #0e0e0d`, `--ink: #f1efe9`. Don't use pure `#000` or `#fff` — keep the warm cast.

### Type

- **Family**: `Helvetica, "Helvetica Neue", Arial, sans-serif` — system stack, no webfont.
- **Body**: 17px / 1.7 line-height, `--ink-soft`.
- **Prose max-width**: 620px.
- **Question (hero)**: 54px, weight 500, letter-spacing -0.8px, line-height 1.1, max-width 20ch.
- **Section label (caps)**: 11px, letter-spacing 2.4px, `text-transform: uppercase`, `--muted`.
- **Italic pull-quote**: 22px italic, line-height 1.45, max-width 34ch.
- **Wordmark**: italic, letter-spacing 0.2em, see § 3.

### Spacing scale

`8, 16, 24, 32, 48, 64, 72, 88, 120` px. Prefer generous vertical rhythm — 72–120px between sections, 48px above section labels.

### Layout

- Page shell: `max-width: 880px; padding: 48px 40px 96px`.
- Prose & lists: 620px inner max-width, centered.
- Sessions block: 760px.

---

## 3. The logo system

### Wordmark

Set the word "Thusness" in **Helvetica italic, regular weight, letter-spacing 0.2em**, with a **hairline rule** (1px, `--muted` at 60% opacity, length ≈ 3.8× font-size) below it, and the **tagline "~ as it is"** below the rule (size ≈ 0.52× wordmark, letter-spacing 2px, `--muted`).

In web contexts the tagline may be replaced with `thusness.co`.

See `assets/wordmark.svg` for a vector version sized for headers. See `components/Wordmark.tsx` for the parametric React component used in the prototype.

### Tilde glyph

The **italic tilde `~`** is the secondary mark. Used for:

- **Favicon** (live site: generated RedDot ICO; handoff: `assets/reddot.svg` or legacy `assets/favicon.svg` tilde)
- **Social avatar** (same construction, square)
- **Section markers** — prefixes a centered small-caps label, e.g. `~  Itinerary`
- **Bullets** — inline in lists, replacing `•`
- **Pillar of Success heading** — standalone at 32px italic, `--muted`, centered

### Red dot

Small filled red circle (`--red`) with a tiny hollow center. Size ≈ 12px. Appears **once per page**, in the footer, opposite the URL. It is a signature — do not use it as a bullet, indicator, or decoration elsewhere. If it shows up twice on a page, the page is wrong.

See `assets/reddot.svg`.

---

## 4. Structural rules

- **Section labels** use either (a) a centered label flanked by hairline rules, OR (b) just a centered label. Both are in `components/`. Prefer (a) for the main rhythm; use (b) when two labels sit close together.
- **Lists** (benefits, itinerary) are single-column, with thin top/bottom rules between items. Index each item with a two-digit italic number (`01`, `02`, …) in `--muted`.
- **Pull-quotes** are centered italic, bounded top and bottom by a 1px `--rule`, generous vertical padding (28–32px).
- **Cards** (session blocks, note previews): 1px `--rule` border, 32–36px padding, no border-radius, no shadow.
- **Links**: inline links get a 1px solid `--ink` underline with ~4px padding-bottom; no color change. No default browser blue anywhere.

---

## 5. Tone

- **Lower-case for labels**, title-case for section names, sentence case for prose.
- **Em-dashes** are used freely. Italic for emphasis, never bold.
- **Nothing promised that isn't there.** If a section's content isn't ready (e.g. notes archive), don't link to it. The site says what's true today.
- **No marketing copy.** Descriptions are factual and quiet: "A quiet hour of guided noticing" — not "Transform your practice."

---

## 6. What to implement

Apply the identity across the existing site. At minimum:

1. **Swap the current theme** for the tokens in `tokens.css` (load globally — in Next.js, in `app/layout.tsx` or `_app.tsx`).
2. **Replace the current wordmark** with `assets/wordmark.svg` (or the `<Wordmark />` component).
3. **Favicon:** use the RedDot (`assets/reddot.svg`) or generate ICO/PNG for `/favicon.ico` (see repo `scripts/generate-favicons.mjs`).
4. **Rebuild the home page** from `components/OnePage.tsx` as the reference. Port to your project's conventions. Content is hardcoded in the prototype — wire it up to your existing content source (MDX, CMS, whatever you're using).
5. **Style the Notes index and individual note pages** using the same tokens, even though they're not currently shown. Use hairline rules, section markers with `~`, prose at 17px/1.7, prose max-width 620px.
6. **The red dot** goes in the site footer, once, opposite the URL/domain.

---

## 7. Files in this bundle

```
design_handoff_thusness/
├── README.md                  ← this file
├── BRAND.md                   ← shorter brand guide (tone, do's/don'ts)
├── tokens.css                 ← drop-in CSS custom properties
├── assets/
│   ├── wordmark.svg           ← the full wordmark with hairline + tagline
│   ├── wordmark-url.svg       ← variant with "thusness.co" tagline
│   ├── tilde-glyph.svg        ← standalone italic tilde
│   ├── reddot.svg             ← signature dot (favicon motif on live site)
│   ├── favicon.svg            ← legacy tilde-on-dark (optional)
│   ├── favicon-light.svg      ← light-mode variant
│   └── reddot.svg             ← the signature dot
├── components/
│   ├── Wordmark.tsx           ← parametric React wordmark
│   ├── OnePage.tsx            ← reference home page (current prototype, ported)
│   ├── SectionMark.tsx        ← centered label with flanking rules
│   └── RedDot.tsx             ← the signature
├── reference.html             ← static HTML+CSS version of the home page,
│                                no React dependency; paste-able for testing
└── prototype/
    ├── Thusness.html          ← original React prototype
    └── site/onepage.jsx       ← the prototype's main component
```

---

## 8. Implementation notes for Next.js

- Drop `tokens.css` into `app/globals.css` (or import it there).
- Put raster favicons at `app/favicon.ico` and `public/apple-touch-icon.png` (Next wires `/favicon.ico` automatically; Safari needs PNG/ICO, not SVG-only).
- For the wordmark, either inline the SVG in a server component or use `next/image` with the SVG file.
- **Do not** import a webfont. The system Helvetica stack is intentional — it's part of the identity.
- **Do not** add Tailwind utilities that override the hairline weights (`border` defaults vary by framework). Set borders explicitly to `1px solid var(--rule)`.

---

## 9. What to avoid

- ❌ Gradients, glows, drop shadows
- ❌ Emoji in UI copy
- ❌ Icon libraries (Heroicons, Lucide, etc.) — if you need an icon, ask first
- ❌ Rounded corners above 2px
- ❌ The red accent anywhere except the footer dot
- ❌ Replacing Helvetica with "similar" fonts (Inter, Geist, etc.) — the identity depends on Helvetica's specific italic
- ❌ Adding filler sections ("Features", "Testimonials") — the site is what it is

---

## 10. Questions to resolve before shipping

- The prototype hardcodes this week's theme. Wire it up to whatever backing store the site uses (MDX in the repo, a Supabase row, etc.) so the week advances without a code change.
- Confirm where the "Theme XVII" counter comes from. If it's just cosmetic, keep it hardcoded; if it's tied to a weekly index, derive from date.
- Confirm Zoom link stability — it's hardcoded in the prototype.
