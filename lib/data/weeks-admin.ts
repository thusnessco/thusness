import "server-only";

import type { JSONContent } from "@tiptap/core";

import { createServerSupabase } from "@/lib/supabase/server";

import type { WeekDocument } from "./weeks-types";

type WeekRow = {
  id: string;
  slug: string;
  week_of: string;
  theme_title: string;
  question: string;
  body_json: JSONContent;
  updated_at: string;
};

function mapWeek(r: WeekRow): WeekDocument {
  return {
    id: r.id,
    slug: r.slug,
    weekOf: r.week_of,
    themeTitle: r.theme_title ?? "",
    question: r.question ?? "",
    bodyJson: r.body_json,
    updatedAt: r.updated_at,
  };
}

export async function getAllWeeksForAdmin(): Promise<WeekDocument[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("weeks")
    .select("id, slug, week_of, theme_title, question, body_json, updated_at")
    .order("week_of", { ascending: false });

  if (error || !data) return [];
  return (data as WeekRow[]).map(mapWeek);
}
