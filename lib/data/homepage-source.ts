import "server-only";

import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import { defaultHomepagePin, parseHomepagePin } from "@/lib/homepage/homepage-pin";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

export type { HomepagePin, SiteTemplateId } from "@/lib/homepage/homepage-pin";

/** Public read: which body drives `/` — a published note or a site template (default Simple). */
export async function getHomepagePin(): Promise<HomepagePin> {
  const supabase = createPublicSupabase();
  if (!supabase) return defaultHomepagePin();

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
