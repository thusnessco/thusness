import type { JSONContent } from "@tiptap/core";

const PROGRAM_CARD = "thusnessProgramCard";
const PROGRAM_ROW = "thusnessProgramRow";

/** Wed/Fri rows from the next upcoming session (Fri Jun 12, 2026). */
const CURRENT_ROWS = [
  ["Week 7", "Guided Noticing", "Fri · Jun 12"],
  ["Week 7", "Guided Noticing", "Wed · Jun 17"],
  ["Week 8", "Guided Noticing", "Fri · Jun 19"],
  ["Week 8", "Guided Noticing", "Wed · Jun 24"],
] as const;

const CURRENT_TITLE = "An 8-week noticing is underway.";
const CURRENT_PROGRESS = "week 7 of 8";

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

function isGuidedNoticingProgramCard(node: JSONContent): boolean {
  if (node.type !== PROGRAM_CARD || !Array.isArray(node.content)) return false;
  const blob = JSON.stringify(node);
  return (
    blob.includes("noticing is underway") ||
    blob.includes("Guided Noticing") ||
    blob.includes("thusnessProgramRow")
  );
}

function normalizeCard(node: JSONContent): JSONContent {
  if (!isGuidedNoticingProgramCard(node)) return node;

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
