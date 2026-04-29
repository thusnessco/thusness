import type { Metadata } from "next";
import Link from "next/link";

import { GiantMasterBooklet } from "@/components/orient/GiantMasterBooklet";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientBookletConfig } from "@/lib/data/orient-booklet-config";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { ORIENT_BOOKLET_PAGES } from "@/lib/orient/booklet-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Orient",
    description: "A map of the practice.",
    robots: { index: false, follow: false },
  };
}

export default async function OrientPage() {
  const [orientNavVisible, orientIg, bookletConfig, publishedPages] = await Promise.all([
    getOrientNavVisible(),
    getOrientInfographicsBundle(),
    getOrientBookletConfig(),
    Promise.all(
      ORIENT_BOOKLET_PAGES.map(async (p) => ({
        slug: p.slug,
        exists: Boolean(await getPublishedNoteBySlug(p.noteSlug)),
      }))
    ),
  ]);
  const publishedSet = new Set(
    publishedPages.filter((p) => p.exists).map((p) => p.slug)
  );
  const visiblePages = ORIENT_BOOKLET_PAGES.filter(
    (p) => bookletConfig.pagesVisible[p.slug] && publishedSet.has(p.slug)
  );

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

      <main className="mx-auto max-w-[1280px] px-4 pb-12 pt-6 sm:px-6 lg:px-10">
        <div className="mx-auto mb-10 w-full max-w-[1200px]">
          <GiantMasterBooklet content={orientIg.content} />
        </div>

        <section className="mx-auto mb-12 max-w-[680px] border-t border-[var(--thusness-rule)] pt-5">
          <p className="mb-2 text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
            ~ Orientation
          </p>
          <p className="mb-3 text-[11px] uppercase tracking-[2.2px] text-[var(--thusness-muted)]">
            In sequence
          </p>
          <ol className="space-y-2">
            {visiblePages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/orient/${p.slug}`}
                  className="text-[15px] text-[var(--thusness-ink-soft)] transition-opacity hover:opacity-70"
                >
                  {String(p.index).padStart(2, "0")} · {p.label} →
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <SiteFooter />
      </main>
    </div>
  );
}
