import Link from "next/link";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getCurrentWeek } from "@/lib/weeks";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

export default async function Home() {
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
          No weeks in the database yet. Sign in to{" "}
          <span className="italic">Admin</span>, create a week, and set its{" "}
          <span className="italic">week of</span> date so it can appear here.
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

  const html = tiptapJsonToHtml(week.bodyJson);
  return <HomePageFromTipTap html={html} />;
}
