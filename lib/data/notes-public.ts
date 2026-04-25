import { createPublicSupabase, type NoteRow } from "@/lib/supabase/public-server";

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

export async function getPublishedNotes(): Promise<NoteRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data as NoteRow[];
}

export async function getPublishedNoteBySlug(
  slug: string
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
  if (row) return row;

  if (normalized !== normalized.toLowerCase()) {
    row = await fetchOne(normalized.toLowerCase());
    if (row) return row;
  }

  return null;
}

export function formatPublishedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
