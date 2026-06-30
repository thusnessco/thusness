import "server-only";

import {
  defaultGenerosityEssayContent,
  parseGenerosityEssayContent,
  READINGS_GENEROSITY_SITE_KEY,
  type GenerosityEssayContent,
} from "@/lib/readings/generosity-essay";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

export type GenerosityReadingBundle = {
  content: GenerosityEssayContent;
  updatedAt: string | null;
};

export { READINGS_GENEROSITY_SITE_KEY };

export async function getGenerosityReadingBundle(): Promise<GenerosityReadingBundle> {
  const fallback: GenerosityReadingBundle = {
    content: defaultGenerosityEssayContent(),
    updatedAt: null,
  };
  try {
    const supabase = createPublicSupabase();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from("site_content")
      .select("content_json, updated_at")
      .eq("key", READINGS_GENEROSITY_SITE_KEY)
      .maybeSingle();

    if (error || data?.content_json == null) return fallback;

    return {
      content: parseGenerosityEssayContent(data.content_json),
      updatedAt: (data.updated_at as string | null) ?? null,
    };
  } catch {
    return fallback;
  }
}

export async function getGenerosityReadingBundleForAdmin(): Promise<GenerosityReadingBundle> {
  const fallback: GenerosityReadingBundle = {
    content: defaultGenerosityEssayContent(),
    updatedAt: null,
  };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", READINGS_GENEROSITY_SITE_KEY)
    .maybeSingle();

  if (error || data?.content_json == null) {
    return fallback;
  }

  return {
    content: parseGenerosityEssayContent(data.content_json),
    updatedAt: (data.updated_at as string | null) ?? null,
  };
}
