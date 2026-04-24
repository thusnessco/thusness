import "server-only";

import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

export type HomepagePin =
  | { source: "week" }
  | { source: "note"; slug: string };

export function parseHomepagePin(raw: unknown): HomepagePin {
  if (!raw || typeof raw !== "object") return { source: "week" };
  const o = raw as Record<string, unknown>;
  if (o.source === "note" && typeof o.slug === "string") {
    const slug = o.slug.trim();
    if (slug) return { source: "note", slug };
  }
  return { source: "week" };
}

/** Public read: which body drives `/` — current week or a published note. */
export async function getHomepagePin(): Promise<HomepagePin> {
  const supabase = createPublicSupabase();
  if (!supabase) return { source: "week" };

  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", "homepage_pin")
    .maybeSingle();

  return parseHomepagePin(data?.content_json);
}

/** Admin: same pin (server client can read draft notes separately). */
export async function getHomepagePinForAdmin(): Promise<HomepagePin> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", "homepage_pin")
    .maybeSingle();

  return parseHomepagePin(data?.content_json);
}
