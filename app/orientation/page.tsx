import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

const ORIENTATION_SLUG = "orientation";

export async function generateMetadata(): Promise<Metadata> {
  const note = await getPublishedNoteBySlug(ORIENTATION_SLUG);
  if (!note) return { title: "Orientation" };
  return {
    title: note.title || "Orientation",
    description: note.excerpt ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function OrientationPage() {
  const note = await getPublishedNoteBySlug(ORIENTATION_SLUG);
  if (!note) notFound();

  const html = tiptapJsonToHtml(note.content_json);

  return (
    <div>
      <div className="border-b border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-[880px] justify-end">
          <nav
            aria-label="Top navigation"
            className="flex items-center gap-4 text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]"
            style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
          >
            <Link href="/notes" className="transition-opacity hover:opacity-70">
              Notes
            </Link>
            <Link href="/orientation" className="transition-opacity hover:opacity-70">
              Orientation
            </Link>
          </nav>
        </div>
      </div>
      <HomePageFromTipTap
        html={html}
        showBackgroundCircle={note.show_background_circle === true}
      />
    </div>
  );
}
