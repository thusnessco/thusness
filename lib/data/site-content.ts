import type { JSONContent } from "@tiptap/core";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { emptyDoc } from "@/lib/tiptap/empty-doc";

export async function getSiteContentJson(
  key: string
): Promise<JSONContent | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", key)
    .maybeSingle();

  if (error || !data?.content_json) return null;
  return data.content_json as JSONContent;
}

export async function getSiteContentJsonOrEmpty(key: string): Promise<JSONContent> {
  const doc = await getSiteContentJson(key);
  return doc ?? emptyDoc();
}
