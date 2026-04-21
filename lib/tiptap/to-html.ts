import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { getTiptapExtensions } from "./extensions";
import { stripRedundantOrderedListPrefixes } from "./strip-ordered-list-prefixes";

export function tiptapJsonToHtml(doc: JSONContent | null | undefined): string {
  if (!doc || doc.type !== "doc") return "";
  const extensions = getTiptapExtensions();
  try {
    const cleaned = stripRedundantOrderedListPrefixes(doc);
    return generateHTML(cleaned, extensions);
  } catch {
    return "";
  }
}
