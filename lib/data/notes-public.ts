import type { NoteCategory } from "@/lib/notes/category";
import { createPublicSupabase, type NoteRow } from "@/lib/supabase/public-server";

export type GetPublishedNoteOptions = {
  /** @deprecated No longer used; published templates are always returned when slug matches. */
  allowTemplate?: boolean;
};

/** Decode path segment, trim, reject traversal / extra path segments. */
export function normalizePublishedNoteSlugParam(slug: string): string {
  let s = String(slug ?? "");
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(s.replace(/\+/g, " "));
      if (next === s) break;
      s = next;
    } catch {
      return "";
    }
  }
  s = s.replace(/\u00a0/g, " ").trim();
  if (!s || s.includes("..") || s.includes("/") || s.includes("\\")) {
    return "";
  }
  return s.normalize("NFC");
}

export type GetPublishedNotesOptions = {
  /** When set, only notes in this category (still excludes templates). */
  category?: NoteCategory;
};

export async function getPublishedNotes(
  options?: GetPublishedNotesOptions
): Promise<NoteRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];

  let q = supabase
    .from("notes")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (options?.category) {
    q = q.eq("category", options.category);
  }

  const { data, error } = await q;

  if (error || !data) return [];
  return (data as NoteRow[]).filter((n) => n.is_template !== true);
}

export async function getPublishedNoteBySlug(
  slug: string,
  options?: GetPublishedNoteOptions
): Promise<NoteRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const client = supabase;

  const normalized = normalizePublishedNoteSlugParam(slug);
  if (!normalized) return null;

  async function fetchOne(eqSlug: string) {
    const { data, error } = await client
      .from("notes")
      .select("*")
      .eq("slug", eqSlug)
      .eq("published", true)
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return (data as NoteRow | null) ?? null;
  }

  let row = await fetchOne(normalized);
  if (!row && normalized !== normalized.toLowerCase()) {
    row = await fetchOne(normalized.toLowerCase());
  }
  if (!row) return null;
  /** Published template notes are hidden from `/notes` but reachable at `/notes/[slug]` (unlisted pages). */
  return row;
}

export function formatPublishedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
