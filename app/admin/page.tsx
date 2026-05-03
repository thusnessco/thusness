import { unstable_noStore as noStore } from "next/cache";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getHomepagePinForAdmin } from "@/lib/data/homepage-source";
import { getOrientBookletConfigForAdmin } from "@/lib/data/orient-booklet-config";
import { getResistancePageBundleForAdmin } from "@/lib/data/resistance-page";
import { getReadingsIndexBundleForAdmin } from "@/lib/data/readings-index";
import { getOrientInfographicsBundleForAdmin } from "@/lib/data/orient-infographics";
import { getInquiryConfigBundle } from "@/lib/data/inquiry-config";
import { getSinkInConfigBundle } from "@/lib/data/sinkin-config";
import { getAllNotesForAdmin } from "@/lib/data/notes-admin";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

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

  const [
    notes,
    homepagePin,
    sinkInBundle,
    inquiryBundle,
    orientBookletConfig,
    orientIg,
    readingsBundle,
    resistanceBundle,
  ] =
    await Promise.all([
      getAllNotesForAdmin(),
      getHomepagePinForAdmin(),
      getSinkInConfigBundle(),
      getInquiryConfigBundle(),
      getOrientBookletConfigForAdmin(),
      getOrientInfographicsBundleForAdmin(),
      getReadingsIndexBundleForAdmin(),
      getResistancePageBundleForAdmin(),
    ]);

  return (
    <AdminDashboard
      notes={notes}
      homepagePin={homepagePin}
      sinkInConfig={sinkInBundle.config}
      sinkInUpdatedAt={sinkInBundle.updatedAt}
      inquiryContent={inquiryBundle.content}
      inquiryUpdatedAt={inquiryBundle.updatedAt}
      orientBookletConfig={orientBookletConfig}
      orientInfographics={orientIg.content}
      orientInfographicsUpdatedAt={orientIg.updatedAt}
      readingsIndex={readingsBundle.config}
      readingsUpdatedAt={readingsBundle.updatedAt}
      resistanceContent={resistanceBundle.content}
      resistanceUpdatedAt={resistanceBundle.updatedAt}
    />
  );
}
