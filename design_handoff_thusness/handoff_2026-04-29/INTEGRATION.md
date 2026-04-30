# INTEGRATION — Thusness site

How to wire up the new pages. ~1 page. Nothing more is needed than this + the runnable reference + the JSON.

---

## 1 · File layout to add

```
src/app/
  layout.tsx                      ← imports tokens.css, renders <SiteFooter/>
  page.tsx                        ← /
  orient/
    page.tsx                      ← /orient (index)
    [slug]/page.tsx               ← /orient/{stages|recognition|pillars|movement|themes|nihilism}
  notes/
    page.tsx                      ← /notes (stub list)
    [slug]/page.tsx               ← /notes/{working-with-resistance|the-live-flow}
  readings/page.tsx               ← /readings (stub)

src/components/
  Wordmark.tsx                    ← reuse from design_handoff_thusness/components/
  RedDot.tsx                      ← reuse
  SectionMark.tsx                 ← reuse
  SiteFooterNav.tsx               ← reuse — appears on every page
  ScheduleCard.tsx                ← see Schedule card handoff (optional — only if /

  home/
    Home.tsx                      ← from prototype/site/onepage.jsx

  orient/
    OrientLayout.tsx              ← reuse
    OrientIndex.tsx               ← reuse
    OrientSectionPage.tsx         ← reuse
    ScaledDiagram.tsx             ← reuse
    diagrams/
      GiantMaster.tsx
      StagesOfPeace.tsx
      Recognition.tsx
      Pillars.tsx
      Movement.tsx
      Themes.tsx
      Nihilism.tsx

  notes/
    NoteLayout.tsx
    Resistance.tsx                ← from prototype/site/resistance.jsx
    LiveFlow.tsx                  ← from prototype/site/flow.jsx

src/content/
  home.json
  orient.json
  notes-resistance.json
  notes-flow.json
```

Drop the four JSON files from this handoff's `content/` folder into `src/content/`.

---

## 2 · Where data lives

**Static JSON, checked into the repo.** That's it. One file per feature, imported at build time. No Supabase, no TipTap for v1. Reasoning:

- The volume of editable copy is small (~80 strings total).
- The author wants control over visual placement of every label, including labels embedded in diagrams.
- Adding a CMS now creates more risk than benefit; it can be added later without changing the rendering pipeline (just swap the import for a fetch).

If editing-without-deploy becomes a pain point later, promote each JSON file to a Supabase row keyed by feature. The component contract — `<Component content={…} />` — does not change.

**TipTap rule (when added later):** allow only `paragraph`, `text`, `italic`, `link`. No bold, no lists, no headings, no images. The page layout provides all structural elements.

---

## 3 · Diagrams — how they ship

Copy each diagram component from `prototype/site/orient.jsx` into a TSX file under `components/orient/diagrams/`. Per file:

1. Replace inline color literals (`'#efece1'` etc.) with `var(--thusness-*)` references.
2. Replace the `t.foo` tweak-key reads with reads from a typed `content` prop.
3. **Keep all SVG geometry verbatim** — viewBox, x/y, paths. The drawing is the design.
4. The text inside each SVG (or absolute-positioned HTML overlay) reads from `content`, so authors control responsive copy without touching geometry.

The Giant master needs the full `OrientContent` (it composes stages + pillars + themes). Every other diagram takes only its own slice.

**Mapping table** (which JSON path drives which prototype tweak key) is in the older `Orient infographics - Cursor handoff.md` § 4 if you need it.

---

## 4 · Responsive behavior

Diagrams are designed at 1280×900 (Orient sections) or 1280×1080 (Giant). Wrap each in `<ScaledDiagram>` (already in `components/`). It uses ResizeObserver to compute a `transform: scale(N)` so the SVG fits the column at any viewport.

Page chrome (header, prose, footers, schedule card, resistance cards) reflows with normal CSS:

- Page shell: `max-width: 880px; padding: 48px 40px 96px;`
- At ≤ 720px: page padding tightens to `32px 20px 64px`. Two-column blocks (Recognition, Resistance Strategy grid) collapse to single column.
- At ≤ 480px: section labels shorten naturally (the JSON values fit within budget). Hero question type drops from 54px → 40px.

Don't reflow SVG content. Scale the whole thing.

---

## 5 · Motion

Static. No scroll-triggered animation, no diagram animation. The only motion: link hover (opacity 0.7) and prev/next focus states. Keeps the brand quiet.

---

## 6 · Per-route specifics

**`/`** — Renders `<Home content={home} />`. The schedule card is optional (only renders if `home.program` is present). See the older `Schedule card - Cursor handoff.md` for the schema if you need to extend it.

**`/orient`** — `<OrientIndex content={orient.index} GiantMaster={…} sections={…} aside={…} />`. The TOC is a list of `<a>`s to `/orient/{slug}`. The "aside" row (Nihilism) is set apart by a second hairline divider with a different label.

**`/orient/[slug]`** — Generates statically for the six known slugs. Each renders `<OrientSectionPage>` with:
- Section diagram component (driven by `orient[slug]` from the JSON)
- Section prose (`orient.prose[slug]` — array of `{kind, text}` blocks)
- Prev/Next strip (hardcoded ORDER list of slugs; first goes back to `/orient`, last goes back to `/orient`)
- Site footer nav

**`/notes/[slug]`** — Generates statically for the two known slugs. Renders the prototype's note components. No prev/next on notes — they're independent.

**`/notes` and `/readings`** — Stub pages. Same chrome as everything else. Body is a single italic line: *"Notes return soon."* / *"Coming."* Footer with red dot.

---

## 7 · Cross-page links

- Wordmark in every page's top-left → `/`
- Site footer nav (every page): `~ orient · readings · notes`
- Home page has one block referencing the booklet: kicker `~ Orientation`, italic line linking to `/orient` ("→ a map of the practice"). Place above the page footer.
- Each Orient section's prev/next strip wraps within `/orient/*` only — it never escapes to home or notes.
- Notes do not link to each other in v1.

---

## 8 · Done when (mirror of README)

1. Tokens loaded; no third-party fonts.
2. All routes above resolve; no 404s.
3. Existing pages archived to `_archive/2026-04-29/`.
4. Every visible string sourced from JSON.
5. Diagrams pixel-match `reference/index.html`.
6. One red dot per page, in the footer signature.
7. Site footer nav present on every page.
8. Mobile clean ≤ 720px, no horizontal scroll.
9. No Tweaks panel in production.
10. Snapshot test (Playwright/Chromatic) covers each route at 1280px and matches the reference.
