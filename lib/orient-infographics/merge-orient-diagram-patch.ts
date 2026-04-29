import type {
  MovementItem,
  OrientContent,
  PillarItem,
  StageItem,
} from "./types";

import type { OrientDiagramId } from "@/lib/tiptap/orient-diagram-embed";

function mergePointList(base: string[], patch: unknown): string[] {
  if (!Array.isArray(patch)) return base;
  return base.map((b, i) => {
    const v = patch[i];
    return typeof v === "string" ? v : b;
  });
}

function mergeItems<T extends Record<string, unknown>>(
  base: T[],
  patch: unknown,
  mergeOne: (b: T, p: Record<string, unknown>) => T
): T[] {
  if (!Array.isArray(patch)) return base;
  return base.map((row, i) => {
    const p = patch[i];
    if (!p || typeof p !== "object" || Array.isArray(p)) return row;
    return mergeOne(row, p as Record<string, unknown>);
  });
}

function mergeStageItem(b: StageItem, p: Record<string, unknown>): StageItem {
  return {
    scope: typeof p.scope === "string" ? p.scope : b.scope,
    name: typeof p.name === "string" ? p.name : b.name,
    gloss: typeof p.gloss === "string" ? p.gloss : b.gloss,
  };
}

function mergePillarItem(b: PillarItem, p: Record<string, unknown>): PillarItem {
  return {
    name: typeof p.name === "string" ? p.name : b.name,
    sub: typeof p.sub === "string" ? p.sub : b.sub,
    gloss: typeof p.gloss === "string" ? p.gloss : b.gloss,
  };
}

function mergeMovementItem(b: MovementItem, p: Record<string, unknown>): MovementItem {
  return {
    name: typeof p.name === "string" ? p.name : b.name,
    gloss: typeof p.gloss === "string" ? p.gloss : b.gloss,
  };
}

function mergeStages(
  base: OrientContent["stages"],
  patch: Record<string, unknown>
): OrientContent["stages"] {
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    items: mergeItems(base.items, patch.items, mergeStageItem),
  };
}

function mergeRecognition(
  base: OrientContent["recognition"],
  patch: Record<string, unknown>
): OrientContent["recognition"] {
  const bg = patch.background;
  const felt = patch.felt;
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    background:
      bg && typeof bg === "object" && !Array.isArray(bg)
        ? {
            title:
              typeof (bg as Record<string, unknown>).title === "string"
                ? ((bg as Record<string, unknown>).title as string)
                : base.background.title,
            points: mergePointList(
              base.background.points,
              (bg as Record<string, unknown>).points
            ),
          }
        : base.background,
    felt:
      felt && typeof felt === "object" && !Array.isArray(felt)
        ? {
            title:
              typeof (felt as Record<string, unknown>).title === "string"
                ? ((felt as Record<string, unknown>).title as string)
                : base.felt.title,
            points: mergePointList(base.felt.points, (felt as Record<string, unknown>).points),
          }
        : base.felt,
    trap: typeof patch.trap === "string" ? patch.trap : base.trap,
  };
}

function mergePillars(
  base: OrientContent["pillars"],
  patch: Record<string, unknown>
): OrientContent["pillars"] {
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    items: mergeItems(base.items, patch.items, mergePillarItem),
    footer: typeof patch.footer === "string" ? patch.footer : base.footer,
  };
}

function mergeMovement(
  base: OrientContent["movement"],
  patch: Record<string, unknown>
): OrientContent["movement"] {
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    items: mergeItems(base.items, patch.items, mergeMovementItem),
    footer: typeof patch.footer === "string" ? patch.footer : base.footer,
  };
}

function mergeThemes(
  base: OrientContent["themes"],
  patch: Record<string, unknown>
): OrientContent["themes"] {
  const list =
    Array.isArray(patch.list) && patch.list.length
      ? (patch.list as unknown[])
          .map((x) => (typeof x === "string" ? x.trim() : ""))
          .filter(Boolean)
          .slice(0, 8)
      : base.list;
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    list: list.length ? list : base.list,
    footer: typeof patch.footer === "string" ? patch.footer : base.footer,
  };
}

function mergeTri(
  base: { name: string; quote: string; body: string },
  patch: unknown
): { name: string; quote: string; body: string } {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return base;
  const p = patch as Record<string, unknown>;
  return {
    name: typeof p.name === "string" ? p.name : base.name,
    quote: typeof p.quote === "string" ? p.quote : base.quote,
    body: typeof p.body === "string" ? p.body : base.body,
  };
}

function mergeNihilism(
  base: OrientContent["nihilism"],
  patch: Record<string, unknown>
): OrientContent["nihilism"] {
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    trap: mergeTri(base.trap, patch.trap),
    view: mergeTri(base.view, patch.view),
    footer: typeof patch.footer === "string" ? patch.footer : base.footer,
  };
}

function mergeGiantBlock(
  base: OrientContent["giant"],
  patch: Record<string, unknown>
): OrientContent["giant"] {
  return {
    kicker: typeof patch.kicker === "string" ? patch.kicker : base.kicker,
    title: typeof patch.title === "string" ? patch.title : base.title,
    sub: typeof patch.sub === "string" ? patch.sub : base.sub,
    transition:
      typeof patch.transition === "string" ? patch.transition : base.transition,
    tagline: typeof patch.tagline === "string" ? patch.tagline : base.tagline,
    footer: typeof patch.footer === "string" ? patch.footer : base.footer,
  };
}

/** Merge site infographics with per-block patch for public / preview render. */
export function applyOrientDiagramPatch(
  site: OrientContent,
  diagram: OrientDiagramId,
  patch: Record<string, unknown> | null
): OrientContent {
  if (!patch) return site;
  switch (diagram) {
    case "giant": {
      let out = { ...site, giant: mergeGiantBlock(site.giant, patch) };
      if (patch.stages && typeof patch.stages === "object" && !Array.isArray(patch.stages)) {
        out = { ...out, stages: mergeStages(out.stages, patch.stages as Record<string, unknown>) };
      }
      if (patch.movement && typeof patch.movement === "object" && !Array.isArray(patch.movement)) {
        out = {
          ...out,
          movement: mergeMovement(out.movement, patch.movement as Record<string, unknown>),
        };
      }
      if (patch.pillars && typeof patch.pillars === "object" && !Array.isArray(patch.pillars)) {
        out = { ...out, pillars: mergePillars(out.pillars, patch.pillars as Record<string, unknown>) };
      }
      if (patch.themes && typeof patch.themes === "object" && !Array.isArray(patch.themes)) {
        out = { ...out, themes: mergeThemes(out.themes, patch.themes as Record<string, unknown>) };
      }
      return out;
    }
    case "stages":
      return { ...site, stages: mergeStages(site.stages, patch) };
    case "recognition":
      return { ...site, recognition: mergeRecognition(site.recognition, patch) };
    case "pillars":
      return { ...site, pillars: mergePillars(site.pillars, patch) };
    case "movement":
      return { ...site, movement: mergeMovement(site.movement, patch) };
    case "themes":
      return { ...site, themes: mergeThemes(site.themes, patch) };
    case "nihilism":
      return { ...site, nihilism: mergeNihilism(site.nihilism, patch) };
    default:
      return site;
  }
}
