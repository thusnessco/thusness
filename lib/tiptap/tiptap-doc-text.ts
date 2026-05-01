import type { JSONContent } from "@tiptap/core";

/** True if the doc contains any non-whitespace text node (ignores marks-only structure). */
export function tiptapDocHasNonWhitespaceText(
  doc: JSONContent | null | undefined
): boolean {
  if (!doc) return false;
  let found = false;
  const walk = (node: JSONContent) => {
    if (found) return;
    if (node.type === "text") {
      const t = (node as { text?: string }).text ?? "";
      if (t.replace(/\s/g, "").length > 0) found = true;
    }
    const c = node.content;
    if (Array.isArray(c)) for (const child of c) walk(child);
  };
  walk(doc);
  return found;
}
