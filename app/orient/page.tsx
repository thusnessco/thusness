import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrientDiagramsSection } from "@/components/orient/OrientDiagramsSection";
import { OrientArticle } from "@/components/thusness/OrientArticle";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { docHasOrientDiagramEmbeds } from "@/lib/tiptap/orient-diagram-embed";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

const ORIENTATION_SLUG = "orientation";

export async function generateMetadata(): Promise<Metadata> {
  const note = await getPublishedNoteBySlug(ORIENTATION_SLUG);
  if (!note) return { title: "Orient" };
  return {
    title: note.title || "Orient",
    description: note.excerpt ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function OrientPage() {
  const [note, orientNavVisible, orientIg] = await Promise.all([
    getPublishedNoteBySlug(ORIENTATION_SLUG),
    getOrientNavVisible(),
    getOrientInfographicsBundle(),
  ]);
  if (!note) notFound();
  const html = tiptapJsonToHtml(note.content_json);
  const hasDiagramEmbeds = docHasOrientDiagramEmbeds(note.content_json);

  return (
    <div className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <div className="bg-[var(--thusness-bg)] px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-[1080px] items-start justify-between gap-8">
          <Link
            href="/"
            className="inline-block transition-opacity hover:opacity-70"
            aria-label="Thusness home"
          >
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
          <nav
            aria-label="Top navigation"
            className="flex items-center gap-4 text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]"
            style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
          >
            {orientNavVisible ? (
              <Link href="/orient" className="transition-opacity hover:opacity-70">
                Orient
              </Link>
            ) : null}
          </nav>
        </div>
      </div>

      <OrientArticle html={html} embedContent={orientIg.content} />
      {!hasDiagramEmbeds ? (
        <OrientDiagramsSection content={orientIg.content} />
      ) : null}
      <div className="mx-auto max-w-[1080px] px-6 pb-12 lg:px-10">
        <SiteFooter />
      </div>
    </div>
  );
}
