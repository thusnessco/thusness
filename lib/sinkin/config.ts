import { SINK_IN_STEPS } from "./sink-in-script";

export type SinkInStep = {
  id: string;
  label: string;
  body: string;
  /** Legacy / unused on public hero UI; kept for stored JSON. */
  keyword: string;
  /** Seconds until the next tone for this step (30–720). */
  holdSec: number;
};

/** Harmonic color for sink-in tones (C root, equal temperament). */
export type SinkInChimeHarmonyV1 =
  | "octave"
  | "fifth"
  | "major"
  | "add9"
  | "maj7";

/** Stable order for Admin radios. */
export const SINKIN_CHIME_HARMONY_ORDER: readonly SinkInChimeHarmonyV1[] = [
  "octave",
  "fifth",
  "major",
  "add9",
  "maj7",
];

export const SINKIN_CHIME_HARMONY_LABELS: Record<
  SinkInChimeHarmonyV1,
  { title: string; hint: string }
> = {
  octave: {
    title: "Octave",
    hint: "Low C with the octave above — open, minimal.",
  },
  fifth: {
    title: "Perfect fifth",
    hint: "Low C with G (no third) — bright, still ambiguous major/minor.",
  },
  major: {
    title: "Major triad",
    hint: "C, E, and G — clearly major, a little fuller.",
  },
  add9: {
    title: "Major add 9",
    hint: "C, E, G, and D — gospel sparkle, still open.",
  },
  maj7: {
    title: "Major 7th",
    hint: "C, E, G, and B — luminous, “angelic” color.",
  },
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
  /** Line under the wordmark when “Program title” is visible (editable). */
  programTitle: string;
  /** Intro copy above “Begin” on /sinkin (editable). */
  introBlurb: string;
  /** Copy below the last step’s body after the final tone (editable). */
  closingMessage: string;
  /** Default seconds for new steps & fallback when a step omits holdSec. */
  intervalSec: number;
  /** Legacy fields; ignored by simplified /sinkin UI. */
  focusAfterSec: number;
  focusPhaseEnabled: boolean;
  /** Dissolve out / in between steps (ms), e.g. 600–2000. */
  crossfadeMs: number;
  /**
   * During a long step, soft pulse every this many seconds (0 = off).
   * Ignored if step hold is not longer than this interval + a short buffer.
   */
  midToneIntervalSec: number;
  /** Harmonic blend for chimes and mid-step pulses. */
  chimeHarmony: SinkInChimeHarmonyV1;
  ui: SinkInUiV1;
  steps: SinkInStep[];
};

export const SINKIN_SITE_KEY = "sinkin";

/** Shown when “Program title” is on; sentence case reads more softly than all-caps. */
export const DEFAULT_PROGRAM_TITLE =
  "Sinking in, deepening — one continuous read";

export const SINKIN_PROGRAM_TITLE_MAX = 200;

/** Shown on /sinkin before “Begin” (plain text; line breaks allowed). */
export const DEFAULT_INTRO_BLURB =
  "Close your eyes between each part. A soft tone marks when to open your eyes and read the next passage. After a short while the words fade to a single anchor you can rest with.";

export const SINKIN_INTRO_BLURB_MAX = 2000;

/** Shown under the final step’s passage on /sinkin (plain text; line breaks allowed). */
export const DEFAULT_CLOSING_MESSAGE =
  "This was the last passage. Stay as long as you like. Thank you for sitting with this.";

export const SINKIN_CLOSING_MESSAGE_MAX = 1200;

const INTERVAL_MIN = 30;
const INTERVAL_MAX = 720;
const FOCUS_MIN = 3;
const FOCUS_MAX = 90;
const CROSSFADE_MIN = 200;
const CROSSFADE_MAX = 5000;
const MID_TONE_MIN = 60;
const MID_TONE_MAX = 600;

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
    programTitle: DEFAULT_PROGRAM_TITLE,
    introBlurb: DEFAULT_INTRO_BLURB,
    closingMessage: DEFAULT_CLOSING_MESSAGE,
    intervalSec: 60,
    focusAfterSec: 12,
    focusPhaseEnabled: false,
    crossfadeMs: 900,
    midToneIntervalSec: 120,
    chimeHarmony: "octave",
    ui: { ...defaultSinkInUi },
    steps: SINK_IN_STEPS.map((s, i) => ({
      ...s,
      keyword: DEFAULT_STEP_KEYWORDS[i] ?? "notice",
      holdSec: 60,
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

function clampCrossfadeMs(n: number): number {
  if (!Number.isFinite(n)) return 900;
  return Math.min(CROSSFADE_MAX, Math.max(CROSSFADE_MIN, Math.round(n)));
}

/** 0 = off; otherwise seconds between mid-step pulses (60–600). */
function clampMidToneIntervalSec(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MID_TONE_MAX, Math.max(MID_TONE_MIN, Math.round(n)));
}

function parseChimeHarmony(raw: unknown): SinkInChimeHarmonyV1 {
  if (
    raw === "fifth" ||
    raw === "major" ||
    raw === "octave" ||
    raw === "add9" ||
    raw === "maj7"
  ) {
    return raw;
  }
  return "octave";
}

function parseProgramTitle(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().slice(0, SINKIN_PROGRAM_TITLE_MAX);
  }
  return DEFAULT_PROGRAM_TITLE;
}

function parseIntroBlurb(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().slice(0, SINKIN_INTRO_BLURB_MAX);
  }
  return DEFAULT_INTRO_BLURB;
}

function parseClosingMessage(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().slice(0, SINKIN_CLOSING_MESSAGE_MAX);
  }
  return DEFAULT_CLOSING_MESSAGE;
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

function isPlainStep(
  o: unknown
): o is { id: string; label: string; body: string; keyword?: string; holdSec?: number } {
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
  const intervalDefault = clampInterval(
    typeof o.intervalSec === "number" ? o.intervalSec : 60
  );
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
    const holdSec = clampInterval(
      typeof row.holdSec === "number" ? row.holdSec : intervalDefault
    );
    steps.push({
      id: id || `step-${steps.length + 1}`,
      label: label || `Step ${steps.length + 1}`,
      body,
      keyword: kw,
      holdSec,
    });
  }
  if (steps.length === 0) return null;
  const focusPhaseEnabled =
    typeof o.focusPhaseEnabled === "boolean" ? o.focusPhaseEnabled : false;
  const focusAfterSec = clampFocus(
    typeof o.focusAfterSec === "number" ? o.focusAfterSec : 12
  );
  const crossfadeMs = clampCrossfadeMs(
    typeof o.crossfadeMs === "number" ? o.crossfadeMs : 900
  );
  const midToneIntervalSec = clampMidToneIntervalSec(
    typeof o.midToneIntervalSec === "number" ? o.midToneIntervalSec : 120
  );
  const chimeHarmony = parseChimeHarmony(o.chimeHarmony);
  return {
    v: 1,
    programTitle: parseProgramTitle(o.programTitle),
    introBlurb: parseIntroBlurb(o.introBlurb),
    closingMessage: parseClosingMessage(o.closingMessage),
    intervalSec: clampInterval(
      typeof o.intervalSec === "number" ? o.intervalSec : 60
    ),
    focusAfterSec,
    focusPhaseEnabled,
    crossfadeMs,
    midToneIntervalSec,
    chimeHarmony,
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
      holdSec: clampInterval(
        typeof s.holdSec === "number" ? s.holdSec : input.intervalSec
      ),
    }))
    .filter((s) => s.body.length > 0);
  const safe = steps.length > 0 ? steps : defaultSinkInConfig().steps;
  const title =
    typeof input.programTitle === "string"
      ? input.programTitle.trim().slice(0, SINKIN_PROGRAM_TITLE_MAX)
      : "";
  const intro =
    typeof input.introBlurb === "string"
      ? input.introBlurb.trim().slice(0, SINKIN_INTRO_BLURB_MAX)
      : "";
  const closing =
    typeof input.closingMessage === "string"
      ? input.closingMessage.trim().slice(0, SINKIN_CLOSING_MESSAGE_MAX)
      : "";
  return {
    v: 1,
    programTitle: title || DEFAULT_PROGRAM_TITLE,
    introBlurb: intro || DEFAULT_INTRO_BLURB,
    closingMessage: closing || DEFAULT_CLOSING_MESSAGE,
    intervalSec: clampInterval(input.intervalSec),
    focusAfterSec: clampFocus(input.focusAfterSec),
    focusPhaseEnabled: Boolean(input.focusPhaseEnabled),
    crossfadeMs: clampCrossfadeMs(
      typeof input.crossfadeMs === "number" ? input.crossfadeMs : 900
    ),
    midToneIntervalSec: clampMidToneIntervalSec(
      typeof input.midToneIntervalSec === "number"
        ? input.midToneIntervalSec
        : 120
    ),
    chimeHarmony: parseChimeHarmony(input.chimeHarmony),
    ui: mergeUi(input.ui),
    steps: safe,
  };
}
