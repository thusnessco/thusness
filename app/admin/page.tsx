import type { JSONContent } from "@tiptap/core";
import { unstable_noStore as noStore } from "next/cache";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAllNotesForAdmin } from "@/lib/data/notes-admin";
import { emptyDoc } from "@/lib/tiptap/empty-doc";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  noStore();

  if (!getSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-[var(--thusness-ink-soft)]">
        <h1 className="text-lg font-medium tracking-tight text-[var(--thusness-ink)]">
          Admin
        </h1>
        <p className="mt-4 text-sm leading-relaxed">
          Set{" "}
          <code className="text-[var(--thusness-muted)]">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="text-[var(--thusness-muted)]">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>{" "}
          (or{" "}
          <code className="text-[var(--thusness-muted)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          ) in the environment, then redeploy.
        </p>
      </div>
    );
  }

  const supabase = await createServerSupabase();

  const { data: siteRow } = await supabase
    .from("site_content")
    .select("content_json, updated_at")
    .eq("key", "home_page")
    .maybeSingle();

  const homePage =
    (siteRow?.content_json as JSONContent | undefined) ?? emptyDoc();
  const homePageKey = siteRow?.updated_at ?? "home_page";

  const notes = await getAllNotesForAdmin();

  return (
    <AdminDashboard homePage={homePage} homePageKey={homePageKey} notes={notes} />
  );
}
