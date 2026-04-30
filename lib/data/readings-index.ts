import "server-only";

import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

import {
  defaultReadingsIndex,
  READINGS_INDEX_SITE_KEY,
  parseReadingsIndex,
  type ReadingsIndexConfig,
} from "@/lib/readings/readings-index";

export type ReadingsIndexBundle = {
  config: ReadingsIndexConfig;
  updatedAt: string | null;
};

export async function getReadingsIndexBundle(): Promise<ReadingsIndexBundle> {
  const supabase = createPublicSupabase();
  if (!supabase) {
    return { config: defaultReadingsIndex(), updatedAt: null };
  }
  const { data } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", READINGS_INDEX_SITE_KEY)
    .maybeSingle();
  return {
    config: parseReadingsIndex(data?.content_json),
    updatedAt: (data?.updated_at as string | null) ?? null,
  };
}

export async function getReadingsIndexBundleForAdmin(): Promise<ReadingsIndexBundle> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", READINGS_INDEX_SITE_KEY)
    .maybeSingle();
  return {
    config: parseReadingsIndex(data?.content_json),
    updatedAt: (data?.updated_at as string | null) ?? null,
  };
}
