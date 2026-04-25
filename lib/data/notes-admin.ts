import { createServerSupabase } from "@/lib/supabase/server";
import type { NoteRow } from "@/lib/supabase/public-server";

export async function getAllNotesForAdmin(): Promise<NoteRow[]> {
  const supabase = await createServerSupabase();
  // Use `*` so reads still work if optional columns (e.g. show_background_circle)
  // exist only after newer migrations — an explicit missing column would error and
  // return no rows here, which looks like “all notes disappeared.”
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data as NoteRow[];
}
