import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrientArticle } from "@/components/thusness/OrientArticle";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientBookletConfig } from "@/lib/data/orient-booklet-config";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { ORIENT_BOOKLET_PAGES } from "@/lib/orient/booklet-pages";
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
  const [note, orientNavVisible, orientIg, bookletConfig] = await Promise.all([
    getPublishedNoteBySlug(ORIENTATION_SLUG),
    getOrientNavVisible(),
    getOrientInfographicsBundle(),
    getOrientBookletConfig(),
  ]);
  if (!note) notFound();
  const html = tiptapJsonToHtml(note.content_json);

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
      <div className="mx-auto max-w-[1080px] px-6 pb-12 lg:px-10">
        <section className="mx-auto mb-12 max-w-[640px] border-t border-[var(--thusness-rule)] pt-5">
          <p className="mb-3 text-[11px] uppercase tracking-[2.2px] text-[var(--thusness-muted)]">
            In sequence
          </p>
          <ol className="space-y-2">
            {ORIENT_BOOKLET_PAGES.filter((p) => bookletConfig.pagesVisible[p.slug]).map(
              (p) => (
                <li key={p.slug}>
                  <Link
                    href={`/orient/${p.slug}`}
                    className="text-[15px] text-[var(--thusness-ink-soft)] transition-opacity hover:opacity-70"
                  >
                    {String(p.index).padStart(2, "0")} · {p.label}
                  </Link>
                </li>
              )
            )}
          </ol>
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
