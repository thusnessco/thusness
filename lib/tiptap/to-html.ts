import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { getTiptapExtensions } from "./extensions";

export function tiptapJsonToHtml(doc: JSONContent | null | undefined): string {
  if (!doc || doc.type !== "doc") return "";
  const extensions = getTiptapExtensions();
  try {
    return generateHTML(doc, extensions);
  } catch {
    return "";
  }
}
