import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { SiteHeaderNav } from "@/components/thusness/SiteHeaderNav";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);
  if (!note) return { title: "Note" };
  return {
    title: note.title || "Note",
    description: note.excerpt ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function Note2Page({ params }: Props) {
  const { slug } = await params;

  const [note, orientNavVisible] = await Promise.all([
    getPublishedNoteBySlug(slug),
    getOrientNavVisible(),
  ]);
  if (!note) notFound();

  const html = tiptapJsonToHtml(note.content_json);

  return (
    <div>
      <div className="border-b border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-[880px] justify-end text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
          <SiteHeaderNav showOrientLink={orientNavVisible} />
        </div>
      </div>
      <HomePageFromTipTap
        html={html}
        showBackgroundCircle={note.show_background_circle === true}
        showOrientLink={orientNavVisible}
      />
    </div>
  );
}
