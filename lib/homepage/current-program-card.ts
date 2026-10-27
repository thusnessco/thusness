import type { JSONContent } from "@tiptap/core";

const PROGRAM_CARD = "thusnessProgramCard";
const PROGRAM_ROW = "thusnessProgramRow";
const HERO = "thusnessHero";
const PACIFIC = "America/Los_Angeles";

type Sitting = { title: string; date: string };

/**
 * Full upcoming series (ISO dates in Pacific). The public card shows the next
 * VISIBLE_COUNT sittings that have not yet aged off — each row drops on the
 * Pacific calendar day after it occurs, and later entries slide in.
 */
const SCHEDULE: Sitting[] = [
  { title: "Compassion and Emptiness", date: "2026-10-28" },
  { title: "Our Common Equality", date: "2026-10-30" },
  { title: "Motivation for Compassion", date: "2026-11-04" },
  { title: "Awareness of Death", date: "2026-11-06" },
  { title: "Ill Deeds", date: "2026-11-11" },
  { title: "Facing Horror", date: "2026-11-13" },
  { title: "Lifetimes", date: "2026-11-18" },
  { title: "Everyone as a Friend", date: "2026-11-20" },
  { title: "Making Progress", date: "2026-11-25" },
  { title: "Valuing Others", date: "2026-11-27" },
  { title: "Ways Others are Kind", date: "2026-12-02" },
  {
    title: "Reciprocating on your Own Terms (Readiness to Respond)",
    date: "2026-12-04",
  },
  { title: "Meditating Love", date: "2026-12-09" },
  { title: "Overview of Compassion", date: "2026-12-11" },
  { title: "Seeing Evanescent Beings", date: "2026-12-16" },
];

const VISIBLE_COUNT = 4;

const CURRENT_TITLE = "A Truthful Heart Compassion Practice is underway.";
const CURRENT_PROGRESS = "Wednesdays · Fridays";
const CURRENT_HERO_QUESTION = "What if compassion widens and strengthens?";

function pacificYmd(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

function formatCardDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const at = new Date(Date.UTC(year, month - 1, day, 12));
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(at);
  const mon = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(at);
  const d = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "UTC",
  }).format(at);
  return `${weekday} · ${mon} ${d}`;
}

/** Keep a sitting through its Pacific calendar day; drop it the day after. */
function currentRows(now: Date): Array<[string, string, string]> {
  const today = pacificYmd(now);
  const upcoming = SCHEDULE.filter((sitting) => today <= sitting.date).slice(
    0,
    VISIBLE_COUNT
  );

  if (upcoming.length === 0) {
    return [["", "—", ""]];
  }

  return upcoming.map((sitting, index) => [
    index === 0 ? "Next session" : "",
    sitting.title,
    formatCardDate(sitting.date),
  ]);
}

function textNode(text: string): JSONContent {
  return { type: "text", text };
}

function paragraph(text: string): JSONContent {
  if (!text) return { type: "paragraph" };
  return { type: "paragraph", content: [textNode(text)] };
}

function programRow(week: string, title: string, date: string): JSONContent {
  return {
    type: PROGRAM_ROW,
    content: [paragraph(week), paragraph(title), paragraph(date)],
  };
}

function progressNode(source: JSONContent | undefined): JSONContent {
  return {
    ...(source ?? { type: "paragraph" }),
    type: "paragraph",
    content: [
      {
        type: "text",
        text: CURRENT_PROGRESS,
        marks: source?.content?.[0]?.marks ?? [{ type: "italic" }],
      },
    ],
  };
}

function titleNode(source: JSONContent | undefined): JSONContent {
  return {
    ...(source ?? { type: "paragraph" }),
    type: "paragraph",
    content: [{ type: "text", text: CURRENT_TITLE }],
  };
}

function heroQuestionNode(source: JSONContent | undefined): JSONContent {
  return {
    ...(source ?? { type: "paragraph" }),
    type: "paragraph",
    content: [{ type: "text", text: CURRENT_HERO_QUESTION }],
  };
}

function isHomepageProgramCard(node: JSONContent): boolean {
  if (node.type !== PROGRAM_CARD || !Array.isArray(node.content)) return false;
  const blob = JSON.stringify(node);
  return (
    blob.includes("noticing is underway") ||
    blob.includes("deconditioning is underway") ||
    blob.includes("Heart Sutra") ||
    blob.includes("Compassion Experiment") ||
    blob.includes("Truthful Heart") ||
    blob.includes("On hiatus until") ||
    blob.includes("Guided Noticing") ||
    blob.includes("Deconditioning") ||
    blob.includes("thusnessProgramRow")
  );
}

function normalizeCard(node: JSONContent, now: Date): JSONContent {
  if (!isHomepageProgramCard(node)) return node;

  const content = node.content ?? [];
  const beforeRows = [content[0], titleNode(content[1])].filter(Boolean);
  const afterRows = content.slice(3).filter((child) => child.type !== PROGRAM_ROW);
  const rows = currentRows(now).map(([week, title, date]) =>
    programRow(week, title, date)
  );

  return {
    ...node,
    content: [...beforeRows, progressNode(content[2]), ...rows, ...afterRows],
  };
}

function normalizeHero(node: JSONContent): JSONContent {
  if (node.type !== HERO || !Array.isArray(node.content) || node.content.length === 0) {
    return node;
  }

  const [, ...rest] = node.content;
  return {
    ...node,
    content: [heroQuestionNode(node.content[0]), ...rest],
  };
}

/**
 * Keep the public homepage program card (and hero question) current even when
 * the pinned TipTap note still has stale JSON in Supabase.
 */
export function withCurrentHomepageProgramCard(
  doc: JSONContent,
  now: Date = new Date()
): JSONContent {
  if (doc.type !== "doc" || !Array.isArray(doc.content)) return doc;

  return {
    ...doc,
    content: doc.content.map((node) =>
      normalizeHero(normalizeCard(node, now))
    ),
  };
}
