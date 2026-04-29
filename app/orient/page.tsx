import type { Metadata } from "next";
import Link from "next/link";

import { GiantMasterBooklet } from "@/components/orient/GiantMasterBooklet";
import RedDot from "@/components/thusness/RedDot";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientBookletConfig } from "@/lib/data/orient-booklet-config";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
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
  const [orientIg, bookletConfig, publishedPages] = await Promise.all([
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
  const sections = visiblePages.filter((p) => p.slug !== "nihilism");
  const aside = visiblePages.find((p) => p.slug === "nihilism") ?? null;

  return (
    <div className="orient-page">
      <div className="orient-shell">
        <header className="orient-top">
          <Link
            href="/"
            className="orient-wordmark-link inline-block transition-opacity hover:opacity-70"
            aria-label="Thusness home"
          >
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
          <div className="orient-dateline">WK 03 OF 08 · APR 2026</div>
        </header>
        <main>
        <header className="orient-index-hero">
          <div className="orient-kicker">~ Orientation</div>
          <h1 className="orient-h1">A map of the practice.</h1>
          <p className="orient-intro">
            Stages of peace, three pillars, the seeing that follows. Read in order, or out of it.
          </p>
        </header>
        <div className="orient-diagram-frame">
          <GiantMasterBooklet content={orientIg.content} />
        </div>
        <nav className="orient-toc">
          <div className="orient-toc-divider">── In sequence ──</div>
          {sections.map((p) => (
            <Link key={p.slug} href={`/orient/${p.slug}`} className="orient-toc-row">
              <span className="orient-toc-num">{String(p.index).padStart(2, "0")}</span>
              <span className="orient-toc-label">{p.label}</span>
              <span className="orient-toc-arrow">→</span>
            </Link>
          ))}
          {aside ? (
            <>
              <div className="orient-toc-divider orient-toc-divider--aside">── Aside ──</div>
              <Link href={`/orient/${aside.slug}`} className="orient-toc-row">
                <span className="orient-toc-num">{String(aside.index).padStart(2, "0")}</span>
                <span className="orient-toc-label">{aside.label}</span>
                <span className="orient-toc-arrow">→</span>
              </Link>
            </>
          ) : null}
        </nav>
        <nav className="site-footer-nav" aria-label="Site sections">
          {bookletConfig.footerOrient ? <Link href="/orient" className="site-footer-link">~ orient</Link> : null}
          {bookletConfig.footerOrient && (bookletConfig.footerReadings || bookletConfig.footerNotes) ? <span className="site-footer-sep">·</span> : null}
          {bookletConfig.footerReadings ? <Link href="/readings" className="site-footer-link">~ readings</Link> : null}
          {bookletConfig.footerReadings && bookletConfig.footerNotes ? <span className="site-footer-sep">·</span> : null}
          {bookletConfig.footerNotes ? <Link href="/notes" className="site-footer-link">~ notes</Link> : null}
        </nav>
        <div className="orient-signature">
          <RedDot />
          <span>thusness.co</span>
        </div>
        </main>
      </div>
    </div>
  );
}
