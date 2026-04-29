import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TiptapHtml } from "@/components/TiptapHtml";
import { OrientDiagramEmbed } from "@/components/orient/OrientDiagramEmbed";
import { SiteFooter } from "@/components/thusness/SiteFooter";
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
      ? { href: "/orient", label: "Back to the map" }
      : {
          href: `/orient/${ORIENT_BOOKLET_PAGES[i - 1].slug}`,
          label: ORIENT_BOOKLET_PAGES[i - 1].label,
        };
  const next =
    i === ORIENT_BOOKLET_PAGES.length - 1
      ? { href: "/orient", label: "Back to the map" }
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
  if (!note) {
    return (
      <div className="min-h-screen bg-[var(--thusness-bg)] px-6 py-10 text-[var(--thusness-ink-soft)] sm:px-10">
        <div className="mx-auto max-w-[1080px]">
          <Wordmark size={20} tagline="~ as it is" />
          <p className="mt-10 text-sm">
            This page is enabled, but no published note exists for slug{" "}
            <code>{page.noteSlug}</code>.
          </p>
        </div>
      </div>
    );
  }

  const html = (
    <TiptapHtml
      html={tiptapJsonToHtml(note.content_json)}
      className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]"
    />
  );

  const nav = neighbors(page.slug);

  return (
    <div className="min-h-screen bg-[var(--thusness-bg)] px-6 py-5 sm:px-10">
      <div className="mx-auto max-w-[1080px]">
        <header className="mb-6 flex items-start justify-between gap-6">
          <Link href="/" className="inline-block transition-opacity hover:opacity-70">
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
          <p className="text-[11px] uppercase tracking-[2.2px] text-[var(--thusness-muted)]">
            Orient · {String(page.index).padStart(2, "0")} of 06
          </p>
        </header>

        <p className="mb-4 text-xs italic text-[var(--thusness-muted)]">
          part of the orientation ·{" "}
          <Link href="/orient" className="underline underline-offset-2">
            the orientation
          </Link>
        </p>
        <p className="mb-8 text-[11px] uppercase tracking-[2.3px] text-[var(--thusness-muted)]">
          ── ~ {String(page.index).padStart(2, "0")} of 06 · {page.label} ──
        </p>

        <div className="mx-auto mb-10 w-full max-w-[1100px]">
          <OrientDiagramEmbed diagram={page.diagram} content={infographics.content} />
        </div>

        <section className="mb-12">{html}</section>

        <nav className="mb-10 grid grid-cols-2 gap-4 border-t border-[var(--thusness-rule)] pt-4 text-sm">
          <Link href={nav.prev?.href ?? "/orient"} className="hover:opacity-70">
            ← {nav.prev?.label ?? "Back"}
          </Link>
          <Link
            href={nav.next?.href ?? "/orient"}
            className="justify-self-end text-right hover:opacity-70"
          >
            {nav.next?.label ?? "Back"} →
          </Link>
        </nav>

        {cfg.showFooterLinks ? (
          <div className="mb-8 text-center text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
            <span>~ </span>
            {cfg.footerOrient ? <Link href="/orient">orient</Link> : null}
            {cfg.footerOrient && (cfg.footerReadings || cfg.footerNotes) ? " · " : null}
            {cfg.footerReadings ? <Link href="/readings">readings</Link> : null}
            {cfg.footerReadings && cfg.footerNotes ? " · " : null}
            {cfg.footerNotes ? <Link href="/notes">notes</Link> : null}
          </div>
        ) : null}
        <SiteFooter />
      </div>
    </div>
  );
}
