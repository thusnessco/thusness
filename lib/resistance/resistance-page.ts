export const READINGS_RESISTANCE_SITE_KEY = "readings_resistance";

export const RESISTANCE_GLYPH_KEYS = [
  "include",
  "widen",
  "appreciation",
  "turning",
  "pair",
] as const;

export type ResistanceGlyphKey = (typeof RESISTANCE_GLYPH_KEYS)[number];

export function isResistanceGlyphKey(s: string): s is ResistanceGlyphKey {
  return (RESISTANCE_GLYPH_KEYS as readonly string[]).includes(s);
}

export type ResistanceRuleRow = {
  label: string;
  body: string;
};

export type ResistancePremise = {
  label: string;
  paragraphs: string[];
  pull: string;
};

export type ResistanceRules = {
  label: string;
  rows: ResistanceRuleRow[];
};

export type ResistanceTool = {
  num: string;
  glyph: ResistanceGlyphKey;
  name: string;
  /** Optional facilitator context; hidden when empty. */
  when?: string;
  script: string;
  why: string;
  wide?: boolean;
};

export type ResistanceFooter = {
  credit: string;
};

export type ResistancePageContent = {
  v: 1;
  wordmark: string;
  kicker: string;
  title: string;
  sub: string;
  premise: ResistancePremise;
  rules: ResistanceRules;
  toolsLabel: string;
  tools: ResistanceTool[];
  footer: ResistanceFooter;
};

const W = 200;
const TITLE = 200;
const SUB = 400;
const BLOCK = 4000;
const ROW = 4000;
const TOOL_NAME = 200;
const NUM = 8;
const CREDIT = 200;

function slice(s: string, max: number): string {
  return s.trim().slice(0, max);
}

export function defaultResistancePageContent(): ResistancePageContent {
  return {
    v: 1,
    wordmark: "thusness",
    kicker: "~ A field guide",
    title: "What to do when there's tension.",
    sub: "for the person sitting beside it",
    premise: {
      label: "~ The premise",
      paragraphs: [
        "Resistance is a quiet *no* to what's already here. What if the no were simply *noticed*, as part of what's here, or alongside everything else that's here?",
      ],
      pull: "Never fight resistance.\nAlways include or expand.",
    },
    rules: {
      label: "~ Clean rules",
      rows: [
        {
          label: "~ Notice",
          body:
            '[avoid]"Relax it,"[/avoid] [avoid]"let it go,"[/avoid] and [avoid]"release it"[/avoid] are all instructions to push. They tend to create more resistance.',
        },
        {
          label: "~ Instead",
          body: "Include, or widen. With *gentle curiosity*. The work is quieter than effort.",
        },
        {
          label: "~ Fallback",
          body:
            'If you blank out: *"What happens if it\'s just noticed, with a bit of gentle curiosity, and allowed to be part of what\'s here?"*',
        },
      ],
    },
    toolsLabel: "~ Five tools",
    tools: [
      {
        num: "01",
        glyph: "include",
        name: "Include it",
        script:
          "What happens if the tension is met, just as it is? Where in the body might it be living right now? What if nothing needed to change? Could it be part of what's already here?",
        why: "Resistance is pushing away. You quietly remove the push.",
      },
      {
        num: "02",
        glyph: "widen",
        name: "Widen",
        script:
          "Where might attention be resting? Does it stay with the tension? Or could sounds, sensations, the visual field also be included? What happens if attention relaxes its grip?",
        why: "Breaks narrow fixation. The tension stops being the whole world.",
      },
      {
        num: "03",
        glyph: "appreciation",
        name: "Soften",
        script:
          "Is there anything here that's already okay? Not fixing the difficulty. Just wondering what doesn't fight back. The breath still moving. The chair holding. What if the grip loosened by noticing what's already not a problem?",
        why: "Replaces force with openness. The grip loosens on its own.",
      },
      {
        num: "04",
        glyph: "turning",
        name: "Notice what's noticing",
        script:
          "The tension is noticed. What if attention traced back to its source, to what's looking? What qualities are there? Could there be a resting as that? Could the awareness and the tension be noticed together?",
        why: "Awareness and tension can be noticed together. The one resisting and the resistance arrive in the same field.",
      },
      {
        num: "05",
        glyph: "pair",
        name: "Both",
        wide: true,
        script:
          "What if the resistance stayed where it is?\nIs there quiet here too?\nNot trading one for the other.\nCould both be here?\nWhat deepens on its own?",
        why:
          "The mind often tries to replace tension with peace.\nThis lets both be noticed together.\nThe conflict softens because nothing has to win.",
      },
    ],
    footer: {
      credit: "thusness.co · field notes",
    },
  };
}

function parseGlyph(raw: unknown, fallback: ResistanceGlyphKey): ResistanceGlyphKey {
  if (typeof raw === "string" && isResistanceGlyphKey(raw.trim())) {
    return raw.trim() as ResistanceGlyphKey;
  }
  return fallback;
}

function parseRuleRow(
  row: unknown,
  fallback: ResistanceRuleRow | undefined
): ResistanceRuleRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const label =
    typeof r.label === "string" ? slice(r.label, W) : (fallback?.label ?? "");
  const body =
    typeof r.body === "string" ? slice(r.body, ROW) : (fallback?.body ?? "");
  if (!label || !body) return null;
  return { label, body };
}

function parsePremise(
  raw: unknown,
  fb: ResistancePremise
): ResistancePremise {
  if (!raw || typeof raw !== "object") return fb;
  const o = raw as Record<string, unknown>;
  const label =
    typeof o.label === "string" ? slice(o.label, W) : fb.label;
  const pull = typeof o.pull === "string" ? slice(o.pull, BLOCK) : fb.pull;
  const paragraphs: string[] = [];
  if (Array.isArray(o.paragraphs)) {
    for (const p of o.paragraphs) {
      if (typeof p === "string" && p.trim()) paragraphs.push(slice(p, BLOCK));
    }
  }
  const kept = paragraphs.length > 0 ? paragraphs : [...fb.paragraphs];
  return {
    label: label || fb.label,
    paragraphs: kept,
    pull: pull || fb.pull,
  };
}

function parseRules(raw: unknown, fb: ResistanceRules): ResistanceRules {
  if (!raw || typeof raw !== "object") return fb;
  const o = raw as Record<string, unknown>;
  const label =
    typeof o.label === "string" ? slice(o.label, W) : fb.label;
  const rows: ResistanceRuleRow[] = [];
  if (Array.isArray(o.rows)) {
    let i = 0;
    for (const row of o.rows) {
      const fr = fb.rows[i];
      const parsed = parseRuleRow(row, fr);
      if (parsed) rows.push(parsed);
      i++;
    }
  }
  return {
    label: label || fb.label,
    rows: rows.length > 0 ? rows : [...fb.rows],
  };
}

function parseTool(
  row: unknown,
  fallback: ResistanceTool | undefined
): ResistanceTool | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const num =
    typeof r.num === "string" ? slice(r.num, NUM) : (fallback?.num ?? "");
  const glyph = parseGlyph(r.glyph, fallback?.glyph ?? "include");
  const name =
    typeof r.name === "string"
      ? slice(r.name, TOOL_NAME)
      : (fallback?.name ?? "");
  const script =
    typeof r.script === "string"
      ? slice(r.script, BLOCK)
      : (fallback?.script ?? "");
  const why =
    typeof r.why === "string" ? slice(r.why, BLOCK) : (fallback?.why ?? "");
  const when =
    typeof r.when === "string" ? slice(r.when, BLOCK) : fallback?.when;
  const wide = typeof r.wide === "boolean" ? r.wide : fallback?.wide;
  if (!num || !name || !script || !why) return null;
  const t: ResistanceTool = { num, glyph, name, script, why };
  if (when?.trim()) t.when = when;
  if (wide === true) t.wide = true;
  return t;
}

export function parseResistancePageContent(raw: unknown): ResistancePageContent {
  const base = defaultResistancePageContent();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const o = raw as Record<string, unknown>;
  if (o.v !== undefined && o.v !== 1) return base;

  const wordmark =
    typeof o.wordmark === "string" ? slice(o.wordmark, W) : base.wordmark;
  const kicker =
    typeof o.kicker === "string" ? slice(o.kicker, W) : base.kicker;
  const title =
    typeof o.title === "string" ? slice(o.title, TITLE) : base.title;
  const sub = typeof o.sub === "string" ? slice(o.sub, SUB) : base.sub;
  const premise = parsePremise(o.premise, base.premise);
  const rules = parseRules(o.rules, base.rules);
  const toolsLabel =
    typeof o.toolsLabel === "string"
      ? slice(o.toolsLabel, W)
      : base.toolsLabel;

  const tools: ResistanceTool[] = [];
  if (Array.isArray(o.tools)) {
    let i = 0;
    for (const row of o.tools) {
      const fb = base.tools[i];
      const t = parseTool(row, fb);
      if (t) tools.push(t);
      i++;
    }
  }

  let footer = base.footer;
  if (o.footer && typeof o.footer === "object") {
    const f = o.footer as Record<string, unknown>;
    const credit =
      typeof f.credit === "string" ? slice(f.credit, CREDIT) : base.footer.credit;
    footer = { credit: credit || base.footer.credit };
  }

  return {
    v: 1,
    wordmark: wordmark || base.wordmark,
    kicker: kicker || base.kicker,
    title: title || base.title,
    sub: sub || base.sub,
    premise,
    rules,
    toolsLabel: toolsLabel || base.toolsLabel,
    tools: tools.length > 0 ? tools : [...base.tools],
    footer,
  };
}

export function normalizeResistancePageContent(
  input: ResistancePageContent
): ResistancePageContent {
  const cloned = JSON.parse(JSON.stringify(input)) as unknown;
  return parseResistancePageContent(cloned);
}
