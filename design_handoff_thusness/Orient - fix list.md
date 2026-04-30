# Orient — fix list (read this, then `prototype/Orient pages.html`)

The booklet structure is correct. The diagrams are not. **All six diagrams
must come from `prototype/site/orient.jsx` exactly.** Stop redrawing them.

## How to do this in one pass

1. Open `prototype/Orient pages.html` in a browser. There are seven artboards.
   Each artboard is the **only** correct rendering of that page.
2. Open `prototype/site/orient.jsx`. It exports six diagram components:
   `StagesOfPeace`, `RecognitionDiagram`, `PillarsDiagram`, `MovementDiagram`,
   `ThemesDiagram`, `NihilismDiagram`, plus `GiantMaster`.
3. **Port each one to TSX with one transformation only:** strip the outer
   `<OSheet kicker={…} title={…} sub={…} dateline=… footer=…>` wrapper.
   Render only the children of `OSheet`. Everything else — every SVG, every
   inline-styled div, every dot, every hairline — copy verbatim.

That's the whole job for the diagrams. No re-imagining. No new copy.

---

## Specific failures observed in the live build

### Stages of peace
- ❌ Three identical empty rings on a baseline.
- ✅ Should be three discs with **different interiors**, in this order:
  - 01 Recognition: a single small filled dot at the center.
  - 02 Perpetuation: a translucent gray disc + faint outer ring (the lens).
  - 03 Integration: a Vogel/sunflower spiral of ~260 dots filling the disc.
- ✅ Hairline arrows between discs.
- ❌ Title "From background, to foreground, to pervasion." — invented copy,
  remove. Title is `t.stagesTitle` = "Background, foreground, integration."
- ❌ "ORIENT · 02 OF 07" upper-right — stale OSheet chrome, must be removed.
  The page chrome is the dateline (`WK 03 OF 08 · APR 2026`) plus the section
  mark `── ~ 01 of 06 · Stages of peace ──`. **Six** sections, not seven.

### Recognition (two kinds of peace)
- ❌ Two tiny cells with small body text floating inside the diagram frame.
- ✅ Should be two **closed bordered rectangles** (1px hairline on all four
  sides) sitting side-by-side and **filling the diagram frame** (max 1100px).
- ❌ Stale OSheet header above the cells (kicker, title, sub, "ORIENT · 03 OF 07").
  Strip it.

### Pillars
- ❌ Three orphan vertical lines hanging in space with sparse text.
- ✅ Should be **three closed bordered cells** in a horizontal row, padded
  ~36px×32px, each containing kicker, name, sub, gloss. Borders on all four
  sides — `borderTop`, `borderBottom`, `borderLeft`, `borderRight`, all 1px
  hairline. (See `PillarsDiagram` line ~277 of `orient.jsx`.)
- ❌ "PILLARS OF SUCCESS" / "Three rails that run the whole length" — invented
  copy. Use `t.pillarKicker`, `t.pillarTitle`, `t.pillarSub`, etc. The word
  "rails" must not appear anywhere.

### Movement
- ❌ Two stacked diagrams: the new shell + a second old artifact ("A second arc,
  after recognition stabilizes" with "Deconstruction · Reconstruction · Fluidity
  & Synthesis").
- ✅ One diagram only: the `MovementDiagram` from `orient.jsx`.
- 🚮 **Delete every file/component containing:** `"A second arc"`,
  `"Deconstruction"`, `"Reconstruction"`, `"Fluidity & Synthesis"`,
  `"recognition stabilizes"`, `"of 07"`, `"OF 07"`. These are from a
  deprecated first sketch. **The current spec has six sections, not seven.**

### Themes
- Should be a constellation: ~8 italic theme labels (Thought, Mind, Time,
  Identity, Emptiness, Energy, Infinity, Existence) scattered with their dots,
  hairline edges connecting some pairs into a loose graph. Currently rendering
  the labels in a list, no graph. Port `ThemesDiagram` verbatim.

### Nihilism (the aside)
- ❌ Two small chip-cells with ~12px text floating in a wide empty frame.
- ✅ Two **closed bordered cells** filling the diagram frame (max ~1100px
  wide), each with `minHeight: 320px` and `padding: 32px 30px`. Inside each
  cell, in this order:
  - Kicker (12px, letter-spacing 2.6, uppercase). Left cell shows a small
    **red dot** before the kicker text "~ The trap"; right cell shows
    "~ The dependent view" in muted gray.
  - Name (24px, weight 500).
  - Italic quote (15px, line-height 1.6).
  - A `flex: 1` spacer.
  - A body paragraph (14px, line-height 1.55) **with a 1px hairline
    `borderTop` and 12px `paddingTop` above it.**
- ✅ Below the two cells, a closing italic block centered, `maxWidth: 620`,
  16px italic, with both a `borderTop` and `borderBottom` hairline. Currently
  this is rendered as a tiny two-line caption with no rules.
- ❌ "ORIENT · 07 OF 07" upper-right + "~ ONE TRAP TO KNOW" + title/sub block
  above the cells — stale OSheet chrome. Strip it. Page chrome is the
  booklet's own header + section mark `── ~ 06 of 06 · Emptiness ≠ non-existence ──`.

### Stale chrome (applies to ALL section pages)
Anywhere a diagram renders its own kicker + title + sub block above the
content, with a "ORIENT · NN OF 07" dateline upper-right — **that's the old
`OSheet` wrapper.** It must not appear on any section page. The booklet pages
have their own header (wordmark + dateline) and section mark; the diagram
sits cleanly under those without its own outer header.

---

## Sanity check before shipping

For each of `/orient/stages`, `/orient/recognition`, `/orient/pillars`,
`/orient/movement`, `/orient/themes`, `/orient/nihilism`:

- [ ] Exactly one diagram on the page (not two, not zero).
- [ ] No copy on the page contains "of 07", "OF 07", or "of 7".
- [ ] No second header block above the diagram (only the page's own
      wordmark + section mark + context line).
- [ ] The diagram visually matches its artboard in `prototype/Orient pages.html`.

If any check fails, the diagram has been re-implemented instead of ported.
Go back and copy the JSX directly from `orient.jsx`, minus the `OSheet`
wrapper. Nothing else.
