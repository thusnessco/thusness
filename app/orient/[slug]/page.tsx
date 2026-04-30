import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrientDiagramEmbed } from "@/components/orient/OrientDiagramEmbed";
import { OrientDiagramSheetFooter } from "@/components/orient/OrientDiagramSheetFooter";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientBookletConfig } from "@/lib/data/orient-booklet-config";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getBookletPage, ORIENT_BOOKLET_PAGES } from "@/lib/orient/booklet-pages";
import { infographicHeadForDiagram } from "@/lib/orient/infographic-head";

type Params = { slug: string };

export const dynamic = "force-dynamic";

function neighbors(slug: string) {
  const i = ORIENT_BOOKLET_PAGES.findIndex((p) => p.slug === slug);
  if (i < 0) {
    return { prev: null, next: null };
  }
  const prev =
    i === 0
      ? { href: "/orient", label: null }
      : {
          href: `/orient/${ORIENT_BOOKLET_PAGES[i - 1].slug}`,
          label: ORIENT_BOOKLET_PAGES[i - 1].label,
        };
  const next =
    i === ORIENT_BOOKLET_PAGES.length - 1
      ? { href: "/orient", label: null }
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

  const [cfg, infographics] = await Promise.all([
    getOrientBookletConfig(),
    getOrientInfographicsBundle(),
  ]);
  if (!cfg.pagesVisible[page.slug]) notFound();

  const proseOverride = cfg.copy.proseOverrides[page.slug].trim();
  const proseParas = proseOverride
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasProse = proseParas.length > 0;
  const proseBody: ReactNode = hasProse
    ? proseParas.map((p, i) => <p key={i}>{p}</p>)
    : null;

  const footerLabel = cfg.copy.diagramFooterLabel.trim();
  const showDiagramFooter = footerLabel.length > 0;
  const prevNextNoTopRule = !hasProse && showDiagramFooter;

  const nav = neighbors(page.slug);
  const sheetHead = infographicHeadForDiagram(page.diagram, infographics.content);

  return (
    <div className="orient-page">
      <div className="orient-shell">
        <header className="orient-top">
          <Link href="/" className="orient-wordmark-link inline-block transition-opacity hover:opacity-70">
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
          <div className="orient-sheet-index" aria-label="Position in orient booklet">
            {cfg.copy.sectionSheetIndexPrefix} · {String(page.index).padStart(2, "0")} of 06
          </div>
        </header>

        <div className="orient-context">
          {cfg.copy.sectionContextPrefix}{" "}
          <Link href="/orient" className="underline underline-offset-2">
            {cfg.copy.sectionContextLinkLabel}
          </Link>
          {" · "}
          {String(page.index).padStart(2, "0")} of 06
        </div>

        {sheetHead ? (
          <header className="orient-infographic-hero">
            <p className="orient-infographic-hero-kicker">{sheetHead.kicker}</p>
            <h1 className="orient-infographic-hero-title">{sheetHead.title}</h1>
            <p className="orient-infographic-hero-sub">{sheetHead.sub}</p>
          </header>
        ) : null}

        <div className="orient-diagram-frame">
          <OrientDiagramEmbed diagram={page.diagram} content={infographics.content} />
        </div>
        {showDiagramFooter ? <OrientDiagramSheetFooter label={footerLabel} /> : null}

        {hasProse ? <section className="orient-prose">{proseBody}</section> : null}

        <nav
          className={
            prevNextNoTopRule
              ? "orient-prevnext orient-prevnext--no-top-rule"
              : "orient-prevnext"
          }
          aria-label="Booklet navigation"
        >
          <div>
            <span className="orient-prevnext-kicker">← {cfg.copy.prevKicker}</span>
            <Link href={nav.prev?.href ?? "/orient"} className="orient-prevnext-link">
              {nav.prev?.label ?? cfg.copy.backToMapLabel}
            </Link>
          </div>
          <div className="text-right">
            <span className="orient-prevnext-kicker">{cfg.copy.nextKicker} →</span>
            <Link href={nav.next?.href ?? "/orient"} className="orient-prevnext-link">
              {nav.next?.label ?? cfg.copy.backToMapLabel}
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
        <div className="orient-signature orient-signature--text-only">
          <span>{cfg.copy.signatureLabel}</span>
        </div>
      </div>
    </div>
  );
}
