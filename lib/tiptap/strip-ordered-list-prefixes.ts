import type { JSONContent } from "@tiptap/core";

/** Matches "1. ", "2) ", etc. at the start of manual numbering inside list items. */
const LEADING_ITEM_ENUM = /^\s*\d{1,3}[.)]\s+/;

/**
 * Removes redundant manual "1. " / "2) " prefixes inside ordered-list items.
 *
 * Tailwind preflight hides list markers in the admin editor, so authors only see
 * their typed numbers. Public `.tiptap-html` restores `list-style-type: decimal`,
 * which would otherwise show both the marker and the same number in the text.
 */
export function stripRedundantOrderedListPrefixes(doc: JSONContent): JSONContent {
  const root = structuredClone(doc) as JSONContent;

  function stripFirstParagraphPrefix(listItem: JSONContent) {
    if (listItem.type !== "listItem" || !listItem.content?.length) return;
    const first = listItem.content[0];
    if (first.type !== "paragraph" || !first.content?.length) return;
    const firstText = first.content.find((n) => n.type === "text" && typeof n.text === "string");
    if (!firstText?.text) return;
    firstText.text = firstText.text.replace(LEADING_ITEM_ENUM, "");
  }

  function walk(node: JSONContent) {
    if (node.type === "orderedList" && node.content) {
      for (const child of node.content) {
        if (child.type === "listItem") stripFirstParagraphPrefix(child);
      }
    }
    if (node.content) node.content.forEach(walk);
  }

  walk(root);
  return root;
}
