import { defaultOrientInfographics } from "./default-content";
import type {
  MovementItem,
  OrientContent,
  PillarItem,
  StageItem,
} from "./types";

export const ORIENT_INFOGRAPHICS_SITE_KEY = "orient_infographics";

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function strArr(v: unknown, fallback: string[], len: number): string[] {
  if (!Array.isArray(v)) return fallback.slice(0, len);
  const out = v.map((x) => (typeof x === "string" ? x : "")).filter(Boolean);
  if (out.length >= len) return out.slice(0, len);
  const pad = [...out];
  for (let i = pad.length; i < len; i++) pad.push(fallback[i] ?? "");
  return pad;
}

function stageItems(v: unknown, d: StageItem[]): StageItem[] {
  if (!Array.isArray(v)) return d;
  const take = v.slice(0, 3);
  return d.map((def, i) => {
    const o = take[i];
    if (!o || typeof o !== "object") return def;
    const r = o as Record<string, unknown>;
    return {
      scope: str(r.scope, def.scope),
      name: str(r.name, def.name),
      gloss: str(r.gloss, def.gloss),
    };
  });
}

function pillarItems(v: unknown, d: PillarItem[]): PillarItem[] {
  if (!Array.isArray(v)) return d;
  const take = v.slice(0, 3);
  return d.map((def, i) => {
    const o = take[i];
    if (!o || typeof o !== "object") return def;
    const r = o as Record<string, unknown>;
    return {
      name: str(r.name, def.name),
      sub: str(r.sub, def.sub),
      gloss: str(r.gloss, def.gloss),
    };
  });
}

function movementItems(v: unknown, d: MovementItem[]): MovementItem[] {
  if (!Array.isArray(v)) return d;
  const take = v.slice(0, 3);
  return d.map((def, i) => {
    const o = take[i];
    if (!o || typeof o !== "object") return def;
    const r = o as Record<string, unknown>;
    return {
      name: str(r.name, def.name),
      gloss: str(r.gloss, def.gloss),
    };
  });
}

function box(
  v: unknown,
  d: { title: string; points: string[] }
): { title: string; points: string[] } {
  if (!v || typeof v !== "object") return d;
  const r = v as Record<string, unknown>;
  return {
    title: str(r.title, d.title),
    points: strArr(r.points, d.points, 4),
  };
}

function triBox(
  v: unknown,
  d: { name: string; quote: string; body: string }
): { name: string; quote: string; body: string } {
  if (!v || typeof v !== "object") return d;
  const r = v as Record<string, unknown>;
  return {
    name: str(r.name, d.name),
    quote: str(r.quote, d.quote),
    body: str(r.body, d.body),
  };
}

/** Normalize DB / API payload into a complete `OrientContent`. */
export function parseOrientInfographics(raw: unknown): OrientContent {
  const d = defaultOrientInfographics();
  if (!raw || typeof raw !== "object") return d;
  const r = raw as Record<string, unknown>;

  const giantIn = r.giant;
  const giant =
    giantIn && typeof giantIn === "object"
      ? (() => {
          const g = giantIn as Record<string, unknown>;
          return {
            kicker: str(g.kicker, d.giant.kicker),
            title: str(g.title, d.giant.title),
            sub: str(g.sub, d.giant.sub),
            transition: str(g.transition, d.giant.transition),
            tagline: str(g.tagline, d.giant.tagline),
            footer: str(g.footer, d.giant.footer),
          };
        })()
      : d.giant;

  const stagesIn = r.stages;
  const stages =
    stagesIn && typeof stagesIn === "object"
      ? (() => {
          const s = stagesIn as Record<string, unknown>;
          return {
            kicker: str(s.kicker, d.stages.kicker),
            title: str(s.title, d.stages.title),
            sub: str(s.sub, d.stages.sub),
            items: stageItems(s.items, d.stages.items),
          };
        })()
      : d.stages;

  const recIn = r.recognition;
  const recognition =
    recIn && typeof recIn === "object"
      ? (() => {
          const x = recIn as Record<string, unknown>;
          return {
            kicker: str(x.kicker, d.recognition.kicker),
            title: str(x.title, d.recognition.title),
            sub: str(x.sub, d.recognition.sub),
            background: box(x.background, d.recognition.background),
            felt: box(x.felt, d.recognition.felt),
            trap: str(x.trap, d.recognition.trap),
          };
        })()
      : d.recognition;

  const pilIn = r.pillars;
  const pillars =
    pilIn && typeof pilIn === "object"
      ? (() => {
          const x = pilIn as Record<string, unknown>;
          return {
            kicker: str(x.kicker, d.pillars.kicker),
            title: str(x.title, d.pillars.title),
            sub: str(x.sub, d.pillars.sub),
            items: pillarItems(x.items, d.pillars.items),
            footer: str(x.footer, d.pillars.footer),
          };
        })()
      : d.pillars;

  const movIn = r.movement;
  const movement =
    movIn && typeof movIn === "object"
      ? (() => {
          const x = movIn as Record<string, unknown>;
          return {
            kicker: str(x.kicker, d.movement.kicker),
            title: str(x.title, d.movement.title),
            sub: str(x.sub, d.movement.sub),
            items: movementItems(x.items, d.movement.items),
            footer: str(x.footer, d.movement.footer),
          };
        })()
      : d.movement;

  const thIn = r.themes;
  const themes =
    thIn && typeof thIn === "object"
      ? (() => {
          const x = thIn as Record<string, unknown>;
          const listRaw = x.list;
          const list = Array.isArray(listRaw)
            ? listRaw
                .map((t) => (typeof t === "string" ? t.trim() : ""))
                .filter(Boolean)
                .slice(0, 8)
            : d.themes.list;
          return {
            kicker: str(x.kicker, d.themes.kicker),
            title: str(x.title, d.themes.title),
            sub: str(x.sub, d.themes.sub),
            list: list.length ? list : d.themes.list,
            footer: str(x.footer, d.themes.footer),
          };
        })()
      : d.themes;

  const nihIn = r.nihilism;
  const nihilism =
    nihIn && typeof nihIn === "object"
      ? (() => {
          const x = nihIn as Record<string, unknown>;
          return {
            kicker: str(x.kicker, d.nihilism.kicker),
            title: str(x.title, d.nihilism.title),
            sub: str(x.sub, d.nihilism.sub),
            trap: triBox(x.trap, d.nihilism.trap),
            view: triBox(x.view, d.nihilism.view),
            footer: str(x.footer, d.nihilism.footer),
          };
        })()
      : d.nihilism;

  return {
    giant,
    stages,
    recognition,
    pillars,
    movement,
    themes,
    nihilism,
  };
}
