import type { Metadata } from "next";
import Link from "next/link";

import { GiantMasterBooklet } from "@/components/orient/GiantMasterBooklet";
import { OrientDiagramSheetFooter } from "@/components/orient/OrientDiagramSheetFooter";
import { ThusnessSiteBottomNav } from "@/components/thusness/ThusnessSiteBottomNav";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientBookletConfig } from "@/lib/data/orient-booklet-config";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
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
  const [orientIg, bookletConfig] = await Promise.all([
    getOrientInfographicsBundle(),
    getOrientBookletConfig(),
  ]);
  const visiblePages = ORIENT_BOOKLET_PAGES.filter((p) => bookletConfig.pagesVisible[p.slug]);
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
        </header>
        <main>
        <header className="orient-index-hero">
          <div className="orient-kicker">{bookletConfig.copy.indexKicker}</div>
          <h1 className="orient-h1">{bookletConfig.copy.indexTitle}</h1>
          <p className="orient-intro">
            {bookletConfig.copy.indexIntro}
          </p>
        </header>
        <div className="orient-diagram-frame">
          <GiantMasterBooklet
            content={orientIg.content}
            pillarsKicker={bookletConfig.copy.mapPillarsKicker}
            pillarsHint={bookletConfig.copy.mapPillarsHint}
          />
        </div>
        <OrientDiagramSheetFooter label={bookletConfig.copy.diagramFooterLabel} />
        <nav className="orient-toc">
          <div className="orient-toc-divider">── {bookletConfig.copy.tocSequenceLabel} ──</div>
          {sections.map((p) => (
            <Link key={p.slug} href={`/orient/${p.slug}`} className="orient-toc-row">
              <span className="orient-toc-num">{String(p.index).padStart(2, "0")}</span>
              <span className="orient-toc-label">{p.label}</span>
              <span className="orient-toc-arrow">→</span>
            </Link>
          ))}
          {aside ? (
            <>
              <div className="orient-toc-divider orient-toc-divider--aside">── {bookletConfig.copy.tocAsideLabel} ──</div>
              <Link href={`/orient/${aside.slug}`} className="orient-toc-row">
                <span className="orient-toc-num">{String(aside.index).padStart(2, "0")}</span>
                <span className="orient-toc-label">{aside.label}</span>
                <span className="orient-toc-arrow">→</span>
              </Link>
            </>
          ) : null}
        </nav>
        <div className="orient-signature orient-signature--text-only">
          <span>{bookletConfig.copy.signatureLabel}</span>
        </div>
        <div className="orient-bottom-site-nav">
          <ThusnessSiteBottomNav />
        </div>
        </main>
      </div>
    </div>
  );
}
