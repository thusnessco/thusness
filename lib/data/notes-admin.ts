import { createServerSupabase } from "@/lib/supabase/server";
import type { NoteRow } from "@/lib/supabase/public-server";

export async function getAllNotesForAdmin(): Promise<NoteRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, slug, title, excerpt, content_json, published, published_at, updated_at, show_background_circle"
    )
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data as NoteRow[];
}
