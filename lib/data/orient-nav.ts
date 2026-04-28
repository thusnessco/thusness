import "server-only";

import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

const ORIENT_NAV_KEY = "orient_nav";

function parseVisible(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return true;
  const o = raw as Record<string, unknown>;
  return typeof o.visible === "boolean" ? o.visible : true;
}

/** Public read for whether Orient should appear in nav/home links. */
export async function getOrientNavVisible(): Promise<boolean> {
  const supabase = createPublicSupabase();
  if (!supabase) return true;
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", ORIENT_NAV_KEY)
    .maybeSingle();
  return parseVisible(data?.content_json);
}

/** Admin read with server client. */
export async function getOrientNavVisibleForAdmin(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", ORIENT_NAV_KEY)
    .maybeSingle();
  return parseVisible(data?.content_json);
}

export { ORIENT_NAV_KEY };
