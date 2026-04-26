import { createClient } from "@supabase/supabase-js";
import type { JSONContent } from "@tiptap/core";
import { getSupabasePublicConfig } from "./config";

/** Anonymous Supabase client (respects RLS). Safe for public server reads. */
export function createPublicSupabase() {
  const cfg = getSupabasePublicConfig();
  if (!cfg) return null;
  return createClient(cfg.url, cfg.anonKey);
}

export type SiteContentRow = {
  key: string;
  title: string | null;
  content_json: JSONContent;
  updated_at: string;
};

export type NoteRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_json: JSONContent;
  published: boolean;
  published_at: string;
  updated_at: string;
  /** Thin decorative circle behind the body on public note pages (and / when pinned). */
  show_background_circle?: boolean;
  /** Reusable layout: spawn drafts from Admin; hidden from public /notes index. */
  is_template?: boolean;
};
