export const INQUIRY_SITE_KEY = "inquiry";

export type InquiryStep = {
  id: string;
  title: string;
  prompt: string;
  placeholder: string;
  summaryTemplate: string;
  enabled: boolean;
  sortOrder: number;
};

export type InquiryContent = {
  v: 1;
  pageTitle: string;
  pageSubtitle: string;
  introText: string;
  sidePanelTitle: string;
  sidePanelEmptyMessage: string;
  finalReflection: string;
  finalReflectionSecondary: string;
  steps: InquiryStep[];
};

const TITLE_MAX = 120;
const SUBTITLE_MAX = 220;
const INTRO_MAX = 2000;
const SIDE_MAX = 120;
const SIDE_EMPTY_MAX = 400;
const FINAL_MAX = 2000;
const STEP_FIELD_MAX = 2000;

export function defaultInquiryContent(): InquiryContent {
  return {
    v: 1,
    pageTitle: "Inquiry",
    pageSubtitle: "A simple way of looking.",
    introText: "Bring something small, charged, or unclear. Move gently.",
    sidePanelTitle: "Seen so far",
    sidePanelEmptyMessage:
      "As you move through the inquiry, simple things noticed will appear here.",
    finalReflection:
      "This still appears. It can still matter. It just may not be as separate or fixed as it first seemed.",
    finalReflectionSecondary:
      "From here, ordinary life can continue with a little less grip.",
    steps: [
      {
        id: "start",
        title: "Start",
        prompt: "You might notice what feels a bit heavy or important right now.",
        placeholder: "Example: I need approval.",
        summaryTemplate: "Looking at: “{answer}.”",
        enabled: true,
        sortOrder: 1,
      },
      {
        id: "look",
        title: "Look",
        prompt: "You might look and see what is actually here.",
        placeholder: "Example: a tight feeling, a thought, an image.",
        summaryTemplate: "It shows up as: {answer}",
        enabled: true,
        sortOrder: 2,
      },
      {
        id: "check",
        title: "Check",
        prompt: "You may check… apart from these pieces, is it there on its own?",
        placeholder: "Example: not really, just the pieces.",
        summaryTemplate: "Not clearly found on its own: {answer}",
        enabled: true,
        sortOrder: 3,
      },
      {
        id: "notice",
        title: "Notice",
        prompt: "You might notice what it seems to depend on.",
        placeholder:
          "Example: thoughts, memory, body feeling, someone else's opinion.",
        summaryTemplate: "It seems to depend on: {answer}",
        enabled: true,
        sortOrder: 4,
      },
      {
        id: "see",
        title: "See",
        prompt: "Separate… or only there with these?",
        placeholder: "Example: only there with them.",
        summaryTemplate: "Not clearly separate: {answer}",
        enabled: true,
        sortOrder: 5,
      },
      {
        id: "soften",
        title: "Soften",
        prompt: "Fixed… or a bit more loose?",
        placeholder: "Example: a bit more loose.",
        summaryTemplate: "A little less fixed: {answer}",
        enabled: true,
        sortOrder: 6,
      },
      {
        id: "still-here",
        title: "Still here",
        prompt: "Not there on its own… still appearing.",
        placeholder: "Example: yes, it still appears, just less solid.",
        summaryTemplate:
          "Still appearing, without being found on its own: {answer}",
        enabled: true,
        sortOrder: 7,
      },
      {
        id: "move",
        title: "Move",
        prompt: "From here, you might notice a simple next step.",
        placeholder: "Example: respond normally, but with less grip.",
        summaryTemplate: "A simple next step: {answer}",
        enabled: true,
        sortOrder: 8,
      },
    ],
  };
}

function slice(s: string, max: number): string {
  return s.trim().slice(0, max);
}

function parseStepRow(
  row: unknown,
  fallback: InquiryStep | undefined
): InquiryStep | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const id =
    typeof r.id === "string" && r.id.trim() ? slice(r.id, 64) : fallback?.id ?? "";
  if (!id) return null;
  const title =
    typeof r.title === "string"
      ? slice(r.title, TITLE_MAX)
      : (fallback?.title ?? id);
  const prompt =
    typeof r.prompt === "string"
      ? slice(r.prompt, STEP_FIELD_MAX)
      : (fallback?.prompt ?? "");
  const placeholder =
    typeof r.placeholder === "string"
      ? slice(r.placeholder, STEP_FIELD_MAX)
      : (fallback?.placeholder ?? "");
  const summaryTemplate =
    typeof r.summaryTemplate === "string"
      ? slice(r.summaryTemplate, STEP_FIELD_MAX)
      : (fallback?.summaryTemplate ?? "{answer}");
  const enabled =
    typeof r.enabled === "boolean" ? r.enabled : (fallback?.enabled ?? true);
  const sortOrderRaw = r.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
      ? Math.max(0, Math.min(999, Math.round(sortOrderRaw)))
      : (fallback?.sortOrder ?? 99);
  return {
    id,
    title: title || fallback?.title || id,
    prompt,
    placeholder,
    summaryTemplate,
    enabled,
    sortOrder,
  };
}

/** Merge stored JSON with defaults (by step id). */
export function parseInquiryContent(raw: unknown): InquiryContent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.type === "doc") return null;
  if (o.v !== undefined && o.v !== 1) return null;

  const base = defaultInquiryContent();
  const pageTitle =
    typeof o.pageTitle === "string" ? slice(o.pageTitle, TITLE_MAX) : base.pageTitle;
  const pageSubtitle =
    typeof o.pageSubtitle === "string"
      ? slice(o.pageSubtitle, SUBTITLE_MAX)
      : base.pageSubtitle;
  const introText =
    typeof o.introText === "string"
      ? slice(o.introText, INTRO_MAX)
      : base.introText;
  const sidePanelTitle =
    typeof o.sidePanelTitle === "string"
      ? slice(o.sidePanelTitle, SIDE_MAX)
      : base.sidePanelTitle;
  const sidePanelEmptyMessage =
    typeof o.sidePanelEmptyMessage === "string"
      ? slice(o.sidePanelEmptyMessage, SIDE_EMPTY_MAX)
      : base.sidePanelEmptyMessage;
  const finalReflection =
    typeof o.finalReflection === "string"
      ? slice(o.finalReflection, FINAL_MAX)
      : base.finalReflection;
  const finalReflectionSecondary =
    typeof o.finalReflectionSecondary === "string"
      ? slice(o.finalReflectionSecondary, FINAL_MAX)
      : base.finalReflectionSecondary;

  const defaultById = new Map(base.steps.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const merged: InquiryStep[] = [];

  if (Array.isArray(o.steps)) {
    for (const row of o.steps) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const idGuess =
        typeof r.id === "string" && r.id.trim() ? slice(r.id, 64) : "";
      const fb = idGuess ? defaultById.get(idGuess) : undefined;
      const step = parseStepRow(row, fb);
      if (!step || seen.has(step.id)) continue;
      seen.add(step.id);
      merged.push({
        ...step,
        title: step.title || fb?.title || step.id,
        prompt: step.prompt || fb?.prompt || "",
        placeholder: step.placeholder || fb?.placeholder || "",
        summaryTemplate:
          step.summaryTemplate || fb?.summaryTemplate || "{answer}",
        sortOrder: step.sortOrder ?? fb?.sortOrder ?? merged.length + 1,
      });
    }
  }

  for (const def of base.steps) {
    if (!seen.has(def.id)) merged.push({ ...def });
  }

  merged.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  return {
    v: 1,
    pageTitle: pageTitle || base.pageTitle,
    pageSubtitle: pageSubtitle || base.pageSubtitle,
    introText: introText || base.introText,
    sidePanelTitle: sidePanelTitle || base.sidePanelTitle,
    sidePanelEmptyMessage: sidePanelEmptyMessage || base.sidePanelEmptyMessage,
    finalReflection: finalReflection || base.finalReflection,
    finalReflectionSecondary:
      finalReflectionSecondary || base.finalReflectionSecondary,
    steps: merged.length > 0 ? merged : [...base.steps],
  };
}

export function normalizeInquiryContent(input: InquiryContent): InquiryContent {
  const cloned = JSON.parse(JSON.stringify(input)) as unknown;
  const parsed = parseInquiryContent(cloned);
  return parsed ?? defaultInquiryContent();
}

export function visibleInquirySteps(content: InquiryContent): InquiryStep[] {
  return content.steps
    .filter((s) => s.enabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

export function formatInquirySummary(template: string, answer: string): string {
  return template.replace(/\{answer\}/g, answer.trim());
}
