import { SINK_IN_STEPS } from "./sink-in-script";

export type SinkInStep = {
  id: string;
  label: string;
  body: string;
  /** Single word or very short anchor shown after full text fades (low-distraction). */
  keyword: string;
};

/** What to show during a step (keep most off for a calmer screen). */
export type SinkInUiV1 = {
  showProgramTitle: boolean;
  showProgress: boolean;
  showSectionLabel: boolean;
  showRestHint: boolean;
  showFooter: boolean;
};

export type SinkInConfigV1 = {
  v: 1;
  /** Seconds between tones (next passage). */
  intervalSec: number;
  /** Seconds to show full text before fading to the keyword (last step skips fade). */
  focusAfterSec: number;
  /** When false, full text stays until the next tone (no keyword beat). */
  focusPhaseEnabled: boolean;
  ui: SinkInUiV1;
  steps: SinkInStep[];
};

export const SINKIN_SITE_KEY = "sinkin";

const INTERVAL_MIN = 30;
const INTERVAL_MAX = 720;
const FOCUS_MIN = 3;
const FOCUS_MAX = 90;

/** Default: almost everything off so the session stays visually quiet. */
export const defaultSinkInUi: SinkInUiV1 = {
  showProgramTitle: false,
  showProgress: false,
  showSectionLabel: false,
  showRestHint: false,
  showFooter: false,
};

/** One anchor word per bundled step (editable in Admin). */
const DEFAULT_STEP_KEYWORDS = [
  "breathe",
  "notice",
  "textures",
  "stillness",
  "rest",
  "feel",
  "allow",
  "warmth",
  "open",
  "ease",
  "unfold",
  "depth",
  "curious",
  "allow",
  "shift",
  "receive",
  "wonder",
  "meaning",
  "ease",
  "whole",
  "here",
  "soften",
  "open",
] as const;

export function defaultSinkInConfig(): SinkInConfigV1 {
  return {
    v: 1,
    intervalSec: 60,
    focusAfterSec: 12,
    focusPhaseEnabled: true,
    ui: { ...defaultSinkInUi },
    steps: SINK_IN_STEPS.map((s, i) => ({
      ...s,
      keyword: DEFAULT_STEP_KEYWORDS[i] ?? "notice",
    })),
  };
}

function clampInterval(n: number): number {
  if (!Number.isFinite(n)) return 60;
  return Math.min(INTERVAL_MAX, Math.max(INTERVAL_MIN, Math.round(n)));
}

function clampFocus(n: number): number {
  if (!Number.isFinite(n)) return 12;
  return Math.min(FOCUS_MAX, Math.max(FOCUS_MIN, Math.round(n)));
}

function mergeUi(raw: unknown): SinkInUiV1 {
  const d = defaultSinkInUi;
  if (!raw || typeof raw !== "object") return { ...d };
  const o = raw as Record<string, unknown>;
  const b = (v: unknown, def: boolean) =>
    typeof v === "boolean" ? v : def;
  return {
    showProgramTitle: b(o.showProgramTitle, d.showProgramTitle),
    showProgress: b(o.showProgress, d.showProgress),
    showSectionLabel: b(o.showSectionLabel, d.showSectionLabel),
    showRestHint: b(o.showRestHint, d.showRestHint),
    showFooter: b(o.showFooter, d.showFooter),
  };
}

function isPlainStep(o: unknown): o is { id: string; label: string; body: string; keyword?: string } {
  if (!o || typeof o !== "object") return false;
  const r = o as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.label === "string" &&
    typeof r.body === "string"
  );
}

/** Accepts stored `site_content.content_json` for key `sinkin`. */
export function parseSinkInConfig(raw: unknown): SinkInConfigV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.type === "doc") return null;
  if (o.v !== 1) return null;
  if (!Array.isArray(o.steps)) return null;
  const steps: SinkInStep[] = [];
  for (let i = 0; i < o.steps.length; i++) {
    const row = o.steps[i];
    if (!isPlainStep(row)) continue;
    const id = row.id.trim().slice(0, 64);
    const label = row.label.trim();
    const body = row.body.trim();
    if (!body) continue;
    const kw =
      typeof row.keyword === "string" && row.keyword.trim()
        ? row.keyword.trim().slice(0, 80)
        : DEFAULT_STEP_KEYWORDS[i] ?? "notice";
    steps.push({
      id: id || `step-${steps.length + 1}`,
      label: label || `Step ${steps.length + 1}`,
      body,
      keyword: kw,
    });
  }
  if (steps.length === 0) return null;
  const focusPhaseEnabled =
    typeof o.focusPhaseEnabled === "boolean" ? o.focusPhaseEnabled : true;
  const focusAfterSec = clampFocus(
    typeof o.focusAfterSec === "number" ? o.focusAfterSec : 12
  );
  return {
    v: 1,
    intervalSec: clampInterval(
      typeof o.intervalSec === "number" ? o.intervalSec : 60
    ),
    focusAfterSec,
    focusPhaseEnabled,
    ui: mergeUi(o.ui),
    steps,
  };
}

/** Normalize client/editor payload before save. */
export function normalizeSinkInConfig(input: SinkInConfigV1): SinkInConfigV1 {
  const steps = input.steps
    .map((s, i) => ({
      id: (s.id || `step-${i + 1}`).trim().slice(0, 64) || `step-${i + 1}`,
      label: (s.label || `Step ${i + 1}`).trim(),
      body: s.body.trim(),
      keyword: (s.keyword || "notice").trim().slice(0, 80) || "notice",
    }))
    .filter((s) => s.body.length > 0);
  const safe = steps.length > 0 ? steps : defaultSinkInConfig().steps;
  return {
    v: 1,
    intervalSec: clampInterval(input.intervalSec),
    focusAfterSec: clampFocus(input.focusAfterSec),
    focusPhaseEnabled: Boolean(input.focusPhaseEnabled),
    ui: mergeUi(input.ui),
    steps: safe,
  };
}
