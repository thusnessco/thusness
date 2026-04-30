import "server-only";

import { createPublicSupabase } from "@/lib/supabase/public-server";

import {
  READINGS_INDEX_SITE_KEY,
  parseReadingsIndex,
  type ReadingsIndexConfig,
} from "@/lib/readings/readings-index";

export type ReadingsPublicRow =
  | {
      kind: "note";
      slug: string;
      title: string;
      excerpt: string | null;
      published_at: string;
    }
  | { kind: "link"; label: string; href: string };

/** Ordered rows for `/readings` (skips unpublished or missing notes). */
export async function getReadingsPublicRows(): Promise<ReadingsPublicRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];

  const { data: row } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", READINGS_INDEX_SITE_KEY)
    .maybeSingle();

  const cfg: ReadingsIndexConfig = parseReadingsIndex(row?.content_json);
  if (cfg.items.length === 0) return [];

  const noteIds = cfg.items
    .filter((i) => i.type === "note")
    .map((i) => i.note_id);

  const noteById = new Map<
    string,
    { slug: string; title: string; excerpt: string | null; published_at: string }
  >();

  if (noteIds.length > 0) {
    const { data: notes } = await supabase
      .from("notes")
      .select("id, slug, title, excerpt, published_at")
      .in("id", noteIds)
      .eq("published", true);

    for (const n of notes ?? []) {
      if (!n?.id || typeof n.slug !== "string") continue;
      noteById.set(String(n.id), {
        slug: n.slug,
        title: typeof n.title === "string" ? n.title : "",
        excerpt: typeof n.excerpt === "string" ? n.excerpt : null,
        published_at:
          typeof n.published_at === "string" ? n.published_at : "",
      });
    }
  }

  const out: ReadingsPublicRow[] = [];
  for (const item of cfg.items) {
    if (item.type === "link") {
      out.push({
        kind: "link",
        label: item.label,
        href: item.href,
      });
      continue;
    }
    const n = noteById.get(item.note_id);
    if (!n) continue;
    out.push({ kind: "note", ...n });
  }
  return out;
}
