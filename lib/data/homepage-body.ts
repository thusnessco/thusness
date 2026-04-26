import "server-only";

import type { JSONContent } from "@tiptap/core";

import { getHomepagePin } from "@/lib/data/homepage-source";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { buildSiteTemplateDoc } from "@/lib/homepage/site-templates";

export type HomepageBodyResult =
  | { ok: true; doc: JSONContent; showBackgroundCircle?: boolean }
  | { ok: false; reason: "no_home_content" };

/** Resolves the TipTap document that should render on `/`. */
export async function getHomepageTipTapDoc(): Promise<HomepageBodyResult> {
  const pin = await getHomepagePin();

  if (pin.source === "note") {
    const note = await getPublishedNoteBySlug(pin.slug, { allowTemplate: true });
    if (note)
      return {
        ok: true,
        doc: note.content_json,
        showBackgroundCircle: note.show_background_circle ?? false,
      };
    return { ok: false, reason: "no_home_content" };
  }

  return {
    ok: true,
    doc: buildSiteTemplateDoc(pin.template, pin.fields),
  };
}
