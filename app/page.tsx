import Link from "next/link";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getHomepagePin } from "@/lib/data/homepage-source";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getCurrentWeek } from "@/lib/weeks";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pin = await getHomepagePin();
  if (pin.source === "note") {
    const note = await getPublishedNoteBySlug(pin.slug);
    if (note) {
      const html = tiptapJsonToHtml(note.content_json);
      return <HomePageFromTipTap html={html} />;
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
          No weeks in the database yet. Sign in to{" "}
          <span className="italic">Admin</span>, create a week, and set its{" "}
          <span className="italic">week of</span> date so it can appear here. You
          can also publish a note and set it as the public home from Admin.
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
