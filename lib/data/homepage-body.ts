import "server-only";

import type { JSONContent } from "@tiptap/core";

import { getHomepagePin } from "@/lib/data/homepage-source";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { buildSiteTemplateDoc } from "@/lib/homepage/site-templates";
import { getCurrentWeek } from "@/lib/weeks";

export type HomepageBodyResult =
  | { ok: true; doc: JSONContent }
  | { ok: false; reason: "no_week" };

/** Resolves the TipTap document that should render on `/`. */
export async function getHomepageTipTapDoc(): Promise<HomepageBodyResult> {
  const pin = await getHomepagePin();

  if (pin.source === "note") {
    const note = await getPublishedNoteBySlug(pin.slug);
    if (note) return { ok: true, doc: note.content_json };
  }

  if (pin.source === "site_template") {
    return {
      ok: true,
      doc: buildSiteTemplateDoc(pin.template, pin.fields),
    };
  }

  const week = await getCurrentWeek();
  if (!week) return { ok: false, reason: "no_week" };
  return { ok: true, doc: week.bodyJson };
}
