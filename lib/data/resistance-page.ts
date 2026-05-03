import "server-only";

import {
  defaultResistancePageContent,
  parseResistancePageContent,
  READINGS_RESISTANCE_SITE_KEY,
  type ResistancePageContent,
} from "@/lib/resistance/resistance-page";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { createServerSupabase } from "@/lib/supabase/server";

export type ResistancePageBundle = {
  content: ResistancePageContent;
  updatedAt: string | null;
};

export { READINGS_RESISTANCE_SITE_KEY };

export async function getResistancePageBundle(): Promise<ResistancePageBundle> {
  const fallback: ResistancePageBundle = {
    content: defaultResistancePageContent(),
    updatedAt: null,
  };
  try {
    const supabase = createPublicSupabase();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from("site_content")
      .select("content_json, updated_at")
      .eq("key", READINGS_RESISTANCE_SITE_KEY)
      .maybeSingle();

    if (error || data?.content_json == null) return fallback;

    return {
      content: parseResistancePageContent(data.content_json),
      updatedAt: (data.updated_at as string | null) ?? null,
    };
  } catch {
    return fallback;
  }
}

export async function getResistancePageBundleForAdmin(): Promise<ResistancePageBundle> {
  const fallback: ResistancePageBundle = {
    content: defaultResistancePageContent(),
    updatedAt: null,
  };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", READINGS_RESISTANCE_SITE_KEY)
    .maybeSingle();

  if (error || data?.content_json == null) {
    return fallback;
  }

  return {
    content: parseResistancePageContent(data.content_json),
    updatedAt: (data.updated_at as string | null) ?? null,
  };
}
