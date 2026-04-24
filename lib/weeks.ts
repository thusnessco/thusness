import "server-only";

import { cache } from "react";

import { createPublicSupabase } from "@/lib/supabase/public-server";

import type { WeekDocument } from "@/lib/data/weeks-types";

export type { WeekDocument } from "@/lib/data/weeks-types";

type WeekRow = {
  id: string;
  slug: string;
  week_of: string;
  theme_title: string;
  question: string;
  body_json: unknown;
  updated_at: string;
};

function mapWeek(r: WeekRow): WeekDocument {
  return {
    id: r.id,
    slug: r.slug,
    weekOf: r.week_of,
    themeTitle: r.theme_title ?? "",
    question: r.question ?? "",
    bodyJson: r.body_json as WeekDocument["bodyJson"],
    updatedAt: r.updated_at,
  };
}

function utcDayStart(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function weekOfUtc(weekOf: string): number {
  const [y, mo, day] = weekOf.split("-").map(Number);
  if (!y || !mo || !day) return NaN;
  return Date.UTC(y, mo - 1, day);
}

export const getAllWeeks = cache(async (): Promise<WeekDocument[]> => {
  const supabase = createPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("weeks")
    .select("id, slug, week_of, theme_title, question, body_json, updated_at")
    .order("week_of", { ascending: false });

  if (error || !data) return [];
  return (data as WeekRow[]).map(mapWeek);
});

export async function getCurrentWeek(): Promise<WeekDocument | null> {
  const all = await getAllWeeks();
  if (all.length === 0) return null;

  const today = utcDayStart(new Date());
  const eligible = all.filter((w) => weekOfUtc(w.weekOf) <= today);
  return eligible[0] ?? all[0];
}

export async function getArchivedWeeks(): Promise<WeekDocument[]> {
  const all = await getAllWeeks();
  const current = await getCurrentWeek();
  if (!current) return all;
  return all.filter((w) => w.slug !== current.slug);
}

export async function getWeekBySlug(slug: string): Promise<WeekDocument | null> {
  const all = await getAllWeeks();
  return all.find((w) => w.slug === slug) ?? null;
}

export function formatWeekListDate(weekOf: string): string {
  const t = weekOfUtc(weekOf);
  if (Number.isNaN(t)) return weekOf;
  return new Date(t).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
