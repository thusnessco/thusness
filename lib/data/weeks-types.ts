import type { JSONContent } from "@tiptap/core";

/** One week row: TipTap body is the full public page for that week. */
export type WeekDocument = {
  id: string;
  slug: string;
  weekOf: string;
  themeTitle: string;
  question: string;
  bodyJson: JSONContent;
  updatedAt: string;
};
