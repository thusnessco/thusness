import "server-only";

import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

import {
  defaultOrientBookletConfig,
  ORIENT_BOOKLET_CONFIG_KEY,
  parseOrientBookletConfig,
  type OrientBookletConfig,
} from "@/lib/orient/booklet-config";

export async function getOrientBookletConfig(): Promise<OrientBookletConfig> {
  const supabase = createPublicSupabase();
  if (!supabase) return defaultOrientBookletConfig();
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", ORIENT_BOOKLET_CONFIG_KEY)
    .maybeSingle();
  return parseOrientBookletConfig(data?.content_json);
}

export async function getOrientBookletConfigForAdmin(): Promise<OrientBookletConfig> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", ORIENT_BOOKLET_CONFIG_KEY)
    .maybeSingle();
  return parseOrientBookletConfig(data?.content_json);
}
