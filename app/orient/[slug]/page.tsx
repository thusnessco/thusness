import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TiptapHtml } from "@/components/TiptapHtml";
import { OrientDiagramEmbed } from "@/components/orient/OrientDiagramEmbed";
import RedDot from "@/components/thusness/RedDot";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientBookletConfig } from "@/lib/data/orient-booklet-config";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getBookletPage, ORIENT_BOOKLET_PAGES } from "@/lib/orient/booklet-pages";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

type Params = { slug: string };

export const dynamic = "force-dynamic";

function neighbors(slug: string) {
  const i = ORIENT_BOOKLET_PAGES.findIndex((p) => p.slug === slug);
  if (i < 0) {
    return { prev: null, next: null };
  }
  const prev =
    i === 0
      ? { href: "/orient", label: "back to the map" }
      : {
          href: `/orient/${ORIENT_BOOKLET_PAGES[i - 1].slug}`,
          label: ORIENT_BOOKLET_PAGES[i - 1].label,
        };
  const next =
    i === ORIENT_BOOKLET_PAGES.length - 1
      ? { href: "/orient", label: "back to the map" }
      : {
          href: `/orient/${ORIENT_BOOKLET_PAGES[i + 1].slug}`,
          label: ORIENT_BOOKLET_PAGES[i + 1].label,
        };
  return { prev, next };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getBookletPage(slug);
  if (!meta) return { title: "Orient" };
  return {
    title: `${meta.label} — Thusness · Orient`,
    robots: { index: false, follow: false },
  };
}

export default async function OrientSectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = getBookletPage(slug);
  if (!page) notFound();

  const [cfg, infographics, note] = await Promise.all([
    getOrientBookletConfig(),
    getOrientInfographicsBundle(),
    getPublishedNoteBySlug(page.noteSlug),
  ]);
  if (!cfg.pagesVisible[page.slug]) notFound();
  if (!note) notFound();

  const html = (
    <TiptapHtml
      html={tiptapJsonToHtml(note.content_json)}
      className=""
    />
  );

  const nav = neighbors(page.slug);

  return (
    <div className="orient-page">
      <div className="orient-shell">
        <header className="orient-top">
          <Link href="/" className="orient-wordmark-link inline-block transition-opacity hover:opacity-70">
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
          <div className="orient-dateline">WK 03 OF 08 · APR 2026</div>
        </header>

        <div className="orient-context">
          part of{" "}
          <Link href="/orient" className="underline underline-offset-2">
            the orientation
          </Link>
          {" · "}
          {String(page.index).padStart(2, "0")} of 06
        </div>

        <div className="orient-section-mark">
          <span className="orient-section-mark-rule" aria-hidden />
          <span>
            ~ {String(page.index).padStart(2, "0")} of 06 · {page.label}
          </span>
          <span className="orient-section-mark-rule" aria-hidden />
        </div>

        <div className="orient-diagram-frame">
          <OrientDiagramEmbed diagram={page.diagram} content={infographics.content} />
        </div>

        <section className="orient-prose">{html}</section>

        <nav className="orient-prevnext" aria-label="Booklet navigation">
          <div>
            <span className="orient-prevnext-kicker">← previous</span>
            <Link href={nav.prev?.href ?? "/orient"} className="orient-prevnext-link">
              {nav.prev?.label ?? "back to the map"}
            </Link>
          </div>
          <div className="text-right">
            <span className="orient-prevnext-kicker">next →</span>
            <Link href={nav.next?.href ?? "/orient"} className="orient-prevnext-link">
              {nav.next?.label ?? "back to the map"}
            </Link>
          </div>
        </nav>

        {cfg.showFooterLinks ? (
          <nav className="site-footer-nav" aria-label="Site sections">
            {cfg.footerOrient ? <Link href="/orient" className="site-footer-link">~ orient</Link> : null}
            {cfg.footerOrient && (cfg.footerReadings || cfg.footerNotes) ? <span className="site-footer-sep">·</span> : null}
            {cfg.footerReadings ? <Link href="/readings" className="site-footer-link">~ readings</Link> : null}
            {cfg.footerReadings && cfg.footerNotes ? <span className="site-footer-sep">·</span> : null}
            {cfg.footerNotes ? <Link href="/notes" className="site-footer-link">~ notes</Link> : null}
          </nav>
        ) : null}
        <div className="orient-signature">
          <RedDot />
          <span>thusness.co</span>
        </div>
      </div>
    </div>
  );
}
