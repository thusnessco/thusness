import {
  defaultSinkInConfig,
  parseSinkInConfig,
  SINKIN_SITE_KEY,
  type SinkInConfigV1,
} from "@/lib/sinkin/config";
import { createPublicSupabase } from "@/lib/supabase/public-server";

export type SinkInConfigBundle = {
  config: SinkInConfigV1;
  /** Row timestamp when present; use as React `key` after saves. */
  updatedAt: string | null;
};

export async function getSinkInConfigBundle(): Promise<SinkInConfigBundle> {
  const supabase = createPublicSupabase();
  if (!supabase) {
    return { config: defaultSinkInConfig(), updatedAt: null };
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", SINKIN_SITE_KEY)
    .maybeSingle();

  if (error || !data?.content_json) {
    return { config: defaultSinkInConfig(), updatedAt: null };
  }

  const parsed = parseSinkInConfig(data.content_json);
  return {
    config: parsed ?? defaultSinkInConfig(),
    updatedAt: (data.updated_at as string | null) ?? null,
  };
}
