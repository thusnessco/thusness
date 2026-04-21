/**
 * Public Supabase client config.
 * Prefer the new publishable key (Supabase Connect / dashboard "Publishable key");
 * fall back to legacy anon JWT for older projects.
 */
export function getSupabasePublicConfig(): {
  url: string;
  anonKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
