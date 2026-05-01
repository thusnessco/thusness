# Resistance — Cursor handoff

## Implemented in this repo (TipTap note)

The field guide ships as a **published note** with **Reusable template** on (`is_template`), so it does **not** appear on `/notes` but is fully editable in **Admin** and visible at **`/notes/working-with-resistance`**. TipTap body is seeded by migration `012_working_with_resistance_note.sql` (regenerate with `node scripts/gen-resistance-note-migration.mjs > supabase/migrations/012_working_with_resistance_note.sql` after editing `content/resistance.json`).

---

A standalone page for `/resistance` (or `/working-with-resistance`). One route, one component, content in JSON. Adapt to your stack — Next.js App Router, Astro, etc. — the contracts are what matter.

## Done when

- [ ] `/resistance` renders the page using tokens from `tokens.css` (already in repo from prior handoffs)
- [ ] All copy comes from `content/resistance.json`, not hard-coded in the component
- [ ] Page uses cream `#efece1` ground, ink `#1a1915`, red `#c54637` (existing brand tokens)
- [ ] Helvetica italic for kickers/marks; Times-style serif for body and headlines (use existing site typography)
- [ ] Footer matches the rest of the site (wordmark, nav, red dot)
- [ ] Linked from main nav as **"Resistance"** or **"Working with resistance"**
- [ ] No prototype JSX runtime (`react@18.3.1` UMD, Babel standalone) ships to production — port the source to your component system

## Files

```
content/resistance.json     ← all visible strings, edit here for copy changes
prototype/Resistance.tsx    ← reference component (React, full layout)
prototype/resistance.html   ← runnable preview (open in browser)
```

## Page anatomy

Top to bottom:

1. **Header** — wordmark, "Field Notes · No. 02" eyebrow, kicker "~ working with"
2. **Hero** — title "Resistance.", lede paragraph
3. **Premise** — one-paragraph framing
4. **Strategy panels** — five numbered strategies (`Soften`, `Widen`, `Pivot`, `Befriend`, `Pause`), each with glyph + when-to-use + script + why-it-works
5. **Decision tree** — linear hairline rows, six rows, "if/then" routing to a strategy
6. **Pair field** — two facing fields (Resistance / Peace) with a hairline between, then an invitation
7. **Footer** — wordmark, "thusness.co · field notes", red dot

All sections use hairline `1px solid var(--rule)` borders and consistent 32–48px padding.

## Content shape

`content/resistance.json` keys map 1:1 to component props. Authors edit this file; never hand-edit prose in the TSX.

```ts
type ResistanceContent = {
  eyebrow: string;          // "Field Notes · No. 02"
  kicker: string;           // "~ working with"
  title: string;            // "Resistance."
  lede: string;             // single paragraph
  premise: string;          // single paragraph
  strategies: Array<{
    num: string;            // "01"
    name: string;           // "Soften"
    glyph: 'soften' | 'widen' | 'pivot' | 'befriend' | 'pause';
    when: string;           // when to reach for it
    script: string;         // the inner-talk
    why: string;            // why it works
    wide?: boolean;         // optional double-width panel
  }>;
  decisionTree: Array<{
    q: string;              // "Are they overwhelmed?"
    yes: string;            // "Widen"
    tag: string;            // "Strategy 2"
  }>;
  pair: {
    resistance: { label: string; lines: string[] };
    peace:      { label: string; lines: string[] };
    invitation: string;
  };
  footer: { credit: string };
};
```

## Component contract

```tsx
import content from '@/content/resistance.json';
import { Resistance } from '@/components/Resistance';

export default function Page() {
  return <Resistance content={content} />;
}
```

The `<Resistance>` component takes the full content blob and renders the whole page. No props beyond `content`.

## Glyph component

Five SVG glyphs, each ~64×64, hairline-stroke (`var(--muted)`) with one filled red dot accent where it earns its place:

- `soften` — concentric squares dissolving outward
- `widen` — single dot, three widening rings
- `pivot` — two arrows meeting at a hinge
- `befriend` — open hand or cupped curve
- `pause` — vertical hairline with a tilde break

Source SVG paths are in `prototype/Resistance.tsx` under `<Glyph kind={...} />`. Lift them verbatim.

## Visual rhythm

- All borders: `1px solid var(--rule)` (cream-on-cream hairline)
- Panel padding: 32px desktop, 24px mobile
- Section gap: 96px desktop, 64px mobile
- Max content width: 1080px, centered
- Strategy panel grid: 3 columns desktop (one panel `wide:true` spans 2), 1 column mobile
- Numbers (`01`, `02`) are Helvetica italic, large, muted
- The red dot appears once in the header eyebrow and once in the footer — never gratuitously

## What NOT to ship

- The `react@18.3.1` UMD bundles and `@babel/standalone` script tags in `prototype/resistance.html` — those are preview-only
- The inline `<script type="text/babel">` block — port the JSX to your component system
- The `Object.assign(window, { Resistance })` and auto-mount block at the bottom of `Resistance.tsx`

## Linked nav

Add to existing nav (likely `components/SiteFooterNav.tsx` from prior handoffs):

```tsx
{ label: 'Resistance', href: '/resistance' }
```

Place between "Orient" and "Notes" or wherever fits the existing flow.
