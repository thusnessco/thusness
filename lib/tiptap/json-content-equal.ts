import type { JSONContent } from "@tiptap/core";

/** Shallow structural compare for TipTap docs (RSC vs action response). */
export function jsonContentEqual(a: JSONContent, b: JSONContent): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
