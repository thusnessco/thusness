import type { JSONContent } from "@tiptap/core";

const PROGRAM_CARD = "thusnessProgramCard";
const PROGRAM_ROW = "thusnessProgramRow";

/** Public card is on hiatus — no schedule rows until sessions resume. */
const CURRENT_TITLE = "On hiatus until Aug. 19";

function textNode(text: string): JSONContent {
  return { type: "text", text };
}

function paragraph(text: string): JSONContent {
  return { type: "paragraph", content: text ? [textNode(text)] : undefined };
}

function titleNode(source: JSONContent | undefined): JSONContent {
  return {
    ...(source ?? { type: "paragraph" }),
    type: "paragraph",
    content: [{ type: "text", text: CURRENT_TITLE }],
  };
}

function emptyProgress(source: JSONContent | undefined): JSONContent {
  return {
    ...(source ?? { type: "paragraph" }),
    type: "paragraph",
    content: [],
  };
}

function isHomepageProgramCard(node: JSONContent): boolean {
  if (node.type !== PROGRAM_CARD || !Array.isArray(node.content)) return false;
  const blob = JSON.stringify(node);
  return (
    blob.includes("noticing is underway") ||
    blob.includes("deconditioning is underway") ||
    blob.includes("On hiatus until") ||
    blob.includes("Guided Noticing") ||
    blob.includes("Deconditioning") ||
    blob.includes("thusnessProgramRow")
  );
}

function normalizeCard(node: JSONContent): JSONContent {
  if (!isHomepageProgramCard(node)) return node;

  const content = node.content ?? [];
  const beforeRows = [content[0], titleNode(content[1]), emptyProgress(content[2])].filter(
    Boolean
  );
  const afterRows = content
    .slice(3)
    .filter((child) => child.type !== PROGRAM_ROW);

  return {
    ...node,
    attrs: { ...node.attrs, hiatus: true },
    content: [...beforeRows, ...afterRows],
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
