import Link from "next/link";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import OnePage from "@/components/thusness/OnePage";
import { getSiteContentJsonOrEmpty } from "@/lib/data/site-content";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { getCurrentWeek } from "@/lib/weeks";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

function textFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default async function Home() {
  const supabase = createPublicSupabase();
  if (supabase) {
    const homePageDoc = await getSiteContentJsonOrEmpty("home_page");
    const homePageHtml = tiptapJsonToHtml(homePageDoc);
    if (textFromHtml(homePageHtml).length > 0) {
      return <HomePageFromTipTap html={homePageHtml} />;
    }
  }

  const week = await getCurrentWeek();
  if (!week) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--thusness-bg)] px-6 font-sans text-[var(--thusness-ink-soft)]"
        style={{
          fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <p className="max-w-md text-center text-sm leading-relaxed">
          No home page in admin yet and no week files in the repo. Add content
          under <span className="italic">Admin → Public home page</span>, or add
          MDX under{" "}
          <code className="text-[var(--thusness-muted)]">content/weeks/</code>.
        </p>
        <Link
          href="/notes"
          className="text-xs uppercase tracking-[2px] text-[var(--thusness-muted)] underline decoration-[var(--thusness-ink)] decoration-1 underline-offset-4"
        >
          Notes
        </Link>
      </main>
    );
  }

  return <OnePage week={week} mode="home" />;
}
