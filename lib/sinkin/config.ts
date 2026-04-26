import { SINK_IN_STEPS } from "./sink-in-script";

export type SinkInStep = {
  id: string;
  label: string;
  body: string;
};

export type SinkInConfigV1 = {
  v: 1;
  /** Seconds between tones (next passage). */
  intervalSec: number;
  steps: SinkInStep[];
};

export const SINKIN_SITE_KEY = "sinkin";

const INTERVAL_MIN = 30;
const INTERVAL_MAX = 720;

export function defaultSinkInConfig(): SinkInConfigV1 {
  return {
    v: 1,
    intervalSec: 60,
    steps: SINK_IN_STEPS.map((s) => ({ ...s })),
  };
}

function clampInterval(n: number): number {
  if (!Number.isFinite(n)) return 60;
  return Math.min(INTERVAL_MAX, Math.max(INTERVAL_MIN, Math.round(n)));
}

function isPlainStep(o: unknown): o is SinkInStep {
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
  for (const row of o.steps) {
    if (!isPlainStep(row)) continue;
    const id = row.id.trim().slice(0, 64);
    const label = row.label.trim();
    const body = row.body.trim();
    if (!body) continue;
    steps.push({
      id: id || `step-${steps.length + 1}`,
      label: label || `Step ${steps.length + 1}`,
      body,
    });
  }
  if (steps.length === 0) return null;
  return {
    v: 1,
    intervalSec: clampInterval(
      typeof o.intervalSec === "number" ? o.intervalSec : 60
    ),
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
    }))
    .filter((s) => s.body.length > 0);
  const safe = steps.length > 0 ? steps : defaultSinkInConfig().steps;
  return {
    v: 1,
    intervalSec: clampInterval(input.intervalSec),
    steps: safe,
  };
}
