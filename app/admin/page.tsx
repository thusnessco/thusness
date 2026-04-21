import type { JSONContent } from "@tiptap/core";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAllNotesForAdmin } from "@/lib/data/notes-admin";
import { emptyDoc } from "@/lib/tiptap/empty-doc";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!getSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-gray-300">
        <h1 className="text-lg font-light text-white">Admin</h1>
        <p className="mt-4 text-sm leading-relaxed">
          Set{" "}
          <code className="text-gray-400">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-gray-400">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (or{" "}
          <code className="text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>){" "}
          in the environment, then redeploy.
        </p>
      </div>
    );
  }

  const supabase = await createServerSupabase();

  const { data: siteRows } = await supabase
    .from("site_content")
    .select("key, content_json, updated_at")
    .in("key", ["home_intro", "weekly_sessions"]);

  const siteMap = Object.fromEntries(
    (siteRows ?? []).map((r) => [
      r.key,
      { json: r.content_json as JSONContent, updated_at: r.updated_at as string },
    ])
  );

  const homeIntro = siteMap.home_intro?.json ?? emptyDoc();
  const weeklySessions = siteMap.weekly_sessions?.json ?? emptyDoc();
  const homeIntroKey = siteMap.home_intro?.updated_at ?? "home_intro";
  const weeklySessionsKey =
    siteMap.weekly_sessions?.updated_at ?? "weekly_sessions";

  const notes = await getAllNotesForAdmin();

  return (
    <AdminDashboard
      homeIntro={homeIntro}
      weeklySessions={weeklySessions}
      homeIntroKey={homeIntroKey}
      weeklySessionsKey={weeklySessionsKey}
      notes={notes}
    />
  );
}
