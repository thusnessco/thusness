import { createPublicSupabase, type NoteRow } from "@/lib/supabase/public-server";

export async function getPublishedNotes(): Promise<NoteRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("id, slug, title, excerpt, content_json, published, published_at, updated_at")
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

  const { data, error } = await supabase
    .from("notes")
    .select("id, slug, title, excerpt, content_json, published, published_at, updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as NoteRow;
}

export function formatPublishedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
