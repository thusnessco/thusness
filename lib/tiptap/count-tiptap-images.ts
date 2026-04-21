import type { JSONContent } from "@tiptap/core";

export function countTiptapImages(node: JSONContent | null | undefined): number {
  if (!node) return 0;
  let n = node.type === "image" ? 1 : 0;
  if (node.content) {
    for (const c of node.content) n += countTiptapImages(c);
  }
  return n;
}
