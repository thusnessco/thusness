import type { JSONContent } from "@tiptap/core";

const PROGRAM_CARD = "thusnessProgramCard";
const PROGRAM_ROW = "thusnessProgramRow";

const CURRENT_ROWS = [
  ["Week 5", "Guided Noticing", "Wed · May 27"],
  ["Week 5", "Guided Noticing", "Fri · May 29"],
  ["Week 6", "Guided Noticing", "Wed · Jun 03"],
  ["Week 6", "Guided Noticing", "Fri · Jun 05"],
] as const;

const CURRENT_TITLE = "A 6-week noticing is underway.";
const CURRENT_PROGRESS = "week 5 of 6";

function textNode(text: string): JSONContent {
  return { type: "text", text };
}

function paragraph(text: string): JSONContent {
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

function isFourWeekNoticingCard(node: JSONContent): boolean {
  if (node.type !== PROGRAM_CARD || !Array.isArray(node.content)) return false;
  return JSON.stringify(node).includes("A 4-week noticing");
}

function normalizeCard(node: JSONContent): JSONContent {
  if (!isFourWeekNoticingCard(node)) return node;

  const content = node.content ?? [];
  const beforeRows = [content[0], titleNode(content[1])].filter(Boolean);
  const afterRows = content.slice(3).filter((child) => child.type !== PROGRAM_ROW);
  const rows = CURRENT_ROWS.map(([week, title, date]) => programRow(week, title, date));

  return {
    ...node,
    content: [...beforeRows, progressNode(content[2]), ...rows, ...afterRows],
  };
}

/**
 * Keep the public homepage program card current even when the pinned TipTap note
 * still has stale schedule JSON in Supabase.
 */
export function withCurrentHomepageProgramCard(doc: JSONContent): JSONContent {
  if (doc.type !== "doc" || !Array.isArray(doc.content)) return doc;

  return {
    ...doc,
    content: doc.content.map(normalizeCard),
  };
}
