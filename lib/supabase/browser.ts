"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

export function createBrowserSupabase() {
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(cfg.url, cfg.anonKey);
}
