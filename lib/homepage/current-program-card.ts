import type { JSONContent } from "@tiptap/core";

const PROGRAM_CARD = "thusnessProgramCard";
const PROGRAM_ROW = "thusnessProgramRow";
const HERO = "thusnessHero";

/** Wed/Fri rows from the next upcoming session (Wed Sep 16, 2026). */
const CURRENT_ROWS = [
  ["Next session", "Motivation and Equality", "Wed · Sep 16"],
  ["", "Awareness of Death", "Fri · Sep 18"],
  ["", "Facing Horror", "Wed · Sep 23"],
  ["", "Lifetimes", "Fri · Sep 25"],
] as const;

const CURRENT_TITLE = "The Compassion Experiment is underway.";
const CURRENT_PROGRESS = "Wednesdays · Fridays";
const CURRENT_HERO_QUESTION = "What if compassion deepens?";

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
    blob.includes("On hiatus until") ||
    blob.includes("Guided Noticing") ||
    blob.includes("Deconditioning") ||
    blob.includes("thusnessProgramRow")
  );
}

function normalizeCard(node: JSONContent): JSONContent {
  if (!isHomepageProgramCard(node)) return node;

  const content = node.content ?? [];
  const beforeRows = [content[0], titleNode(content[1])].filter(Boolean);
  const afterRows = content.slice(3).filter((child) => child.type !== PROGRAM_ROW);
  const rows = CURRENT_ROWS.map(([week, title, date]) => programRow(week, title, date));

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
export function withCurrentHomepageProgramCard(doc: JSONContent): JSONContent {
  if (doc.type !== "doc" || !Array.isArray(doc.content)) return doc;

  return {
    ...doc,
    content: doc.content.map((node) => normalizeHero(normalizeCard(node))),
  };
}
