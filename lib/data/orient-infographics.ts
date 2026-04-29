import "server-only";

import {
  defaultOrientInfographics,
} from "@/lib/orient-infographics/default-content";
import {
  ORIENT_INFOGRAPHICS_SITE_KEY,
  parseOrientInfographics,
} from "@/lib/orient-infographics/parse";
import type { OrientContent } from "@/lib/orient-infographics/types";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

export type OrientInfographicsBundle = {
  content: OrientContent;
  updatedAt: string | null;
};

export { ORIENT_INFOGRAPHICS_SITE_KEY };

export async function getOrientInfographicsBundle(): Promise<OrientInfographicsBundle> {
  const fallback: OrientInfographicsBundle = {
    content: defaultOrientInfographics(),
    updatedAt: null,
  };
  try {
    const supabase = createPublicSupabase();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from("site_content")
      .select("content_json, updated_at")
      .eq("key", ORIENT_INFOGRAPHICS_SITE_KEY)
      .maybeSingle();

    if (error || data?.content_json == null) {
      return fallback;
    }

    return {
      content: parseOrientInfographics(data.content_json),
      updatedAt: (data.updated_at as string | null) ?? null,
    };
  } catch {
    return fallback;
  }
}

export async function getOrientInfographicsBundleForAdmin(): Promise<OrientInfographicsBundle> {
  const fallback: OrientInfographicsBundle = {
    content: defaultOrientInfographics(),
    updatedAt: null,
  };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", ORIENT_INFOGRAPHICS_SITE_KEY)
    .maybeSingle();

  if (error || data?.content_json == null) {
    return fallback;
  }

  return {
    content: parseOrientInfographics(data.content_json),
    updatedAt: (data.updated_at as string | null) ?? null,
  };
}
