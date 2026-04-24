import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { cache } from "react";

const WEEKS_DIR = path.join(process.cwd(), "content", "weeks");

const DEFAULT_ZOOM_URL = "https://zoom.us/j/97461285343";
const DEFAULT_ZOOM_LABEL = "zoom.us/j/97461285343";

export type WeekHero = { kind: "circle" | "text-only"; image?: string };

export type Week = {
  slug: string;
  weekOf: string;
  themeIndex?: string;
  themeTitle: string;
  question: string;
  pullQuote: string;
  benefits: string[];
  itinerary: string[];
  pillar: string;
  zoomUrl: string;
  zoomLabel: string;
  proseMarkdown: string;
  hero?: WeekHero;
  /** e.g. "Week of April 24, 2026" */
  dateLabel: string;
};

function utcDayStart(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function weekOfUtc(weekOf: string): number {
  const [y, mo, day] = weekOf.split("-").map(Number);
  if (!y || !mo || !day) return NaN;
  return Date.UTC(y, mo - 1, day);
}

function formatDateLabel(weekOf: string): string {
  const t = weekOfUtc(weekOf);
  if (Number.isNaN(t)) return `Week of ${weekOf}`;
  const d = new Date(t);
  const inner = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Week of ${inner}`;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return [];
}

function normalizeHero(v: unknown): WeekHero | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const kind = o.kind;
  if (kind === "circle" || kind === "text-only") {
    return {
      kind,
      image: typeof o.image === "string" ? o.image : undefined,
    };
  }
  return undefined;
}

async function readWeekFile(absPath: string, fileBase: string): Promise<Week | null> {
  const raw = await fs.readFile(absPath, "utf8");
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  const slug = String(d.slug ?? fileBase.replace(/\.mdx?$/i, "")).trim();
  const weekOf = String(d.weekOf ?? "").trim();
  if (!slug || !weekOf) return null;

  const themeTitle = String(d.themeTitle ?? "").trim();
  const question = String(d.question ?? "").trim();
  if (!themeTitle || !question) return null;

  const zoomUrl = String(d.zoomUrl ?? DEFAULT_ZOOM_URL).trim() || DEFAULT_ZOOM_URL;
  const zoomLabel =
    String(d.zoomLabel ?? DEFAULT_ZOOM_LABEL).trim() || DEFAULT_ZOOM_LABEL;

  const themeIndexRaw = d.themeIndex;
  const themeIndex =
    themeIndexRaw === undefined || themeIndexRaw === null
      ? undefined
      : String(themeIndexRaw).trim() || undefined;

  const pullQuote = String(d.pullQuote ?? "").trim();

  return {
    slug,
    weekOf,
    themeIndex,
    themeTitle,
    question,
    pullQuote,
    benefits: asStringArray(d.benefits),
    itinerary: asStringArray(d.itinerary),
    pillar: String(d.pillar ?? "").trim(),
    zoomUrl,
    zoomLabel,
    proseMarkdown: String(content ?? "").trim(),
    hero: normalizeHero(d.hero),
    dateLabel: formatDateLabel(weekOf),
  };
}

export const getAllWeeks = cache(async (): Promise<Week[]> => {
  let names: string[] = [];
  try {
    names = await fs.readdir(WEEKS_DIR);
  } catch {
    return [];
  }

  const files = names.filter(
    (n) => (n.endsWith(".mdx") || n.endsWith(".md")) && !n.startsWith("_")
  );

  const weeks: Week[] = [];
  for (const name of files) {
    const w = await readWeekFile(path.join(WEEKS_DIR, name), name);
    if (w) weeks.push(w);
  }

  weeks.sort((a, b) => weekOfUtc(b.weekOf) - weekOfUtc(a.weekOf));
  return weeks;
});

export async function getCurrentWeek(): Promise<Week | null> {
  const all = await getAllWeeks();
  if (all.length === 0) return null;

  const today = utcDayStart(new Date());
  const eligible = all.filter((w) => weekOfUtc(w.weekOf) <= today);
  return eligible[0] ?? all[0];
}

export async function getArchivedWeeks(): Promise<Week[]> {
  const all = await getAllWeeks();
  const current = await getCurrentWeek();
  if (!current) return all;
  return all.filter((w) => w.slug !== current.slug);
}

export async function getWeekBySlug(slug: string): Promise<Week | null> {
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
