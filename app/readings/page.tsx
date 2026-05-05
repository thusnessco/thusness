import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { getResistancePageBundle } from "@/lib/data/resistance-page";
import { getReadingsPublicRows } from "@/lib/data/readings-public";
import { formatPublishedDate } from "@/lib/data/notes-public";
import { notePageHref } from "@/lib/site/note-pages";

export const metadata: Metadata = {
  title: "Readings",
  description: "Short guides and curated links from Thusness.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReadingsPage() {
  const [rows, resistanceBundle] = await Promise.all([
    getReadingsPublicRows(),
    getResistancePageBundle(),
  ]);
  const resistance = resistanceBundle.content;
  const curatedRows = rows.filter(
    (r) => !(r.kind === "link" && r.href === "/readings/resistance")
  );

  const linkClassName =
    "block px-5 py-7 text-[var(--thusness-ink)] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--thusness-ink)] sm:px-6";

  return (
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell>
        <h1 className="mt-1 max-w-[620px] text-[22px] font-medium tracking-tight text-[var(--thusness-ink)]">
          Readings
        </h1>

        <section className="mt-10" aria-label="Readings list">
          <ol className="m-0 max-w-[620px] list-none divide-y divide-[var(--thusness-rule)] overflow-hidden rounded-sm border border-[var(--thusness-rule)] p-0">
            <li>
              <Link href="/readings/resistance" className={linkClassName}>
                <span className="text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
                  {resistance.kicker}
                </span>
                <span className="mt-2 block text-[22px] font-medium leading-tight text-[var(--thusness-ink)]">
                  {resistance.title}
                </span>
                {resistance.sub.trim() ? (
                  <span className="mt-2 block text-base italic leading-snug text-[var(--thusness-ink-soft)]">
                    {resistance.sub}
                  </span>
                ) : null}
              </Link>
            </li>
            {curatedRows.map((row, i) => (
              <li
                key={
                  row.kind === "note"
                    ? `n-${row.slug}-${i}`
                    : `l-${row.href}-${i}`
                }
              >
                {row.kind === "note" ? (
                  <Link
                    href={notePageHref(row.slug)}
                    className={linkClassName}
                  >
                    <span className="text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
                      {formatPublishedDate(row.published_at)}
                    </span>
                    <span className="mt-2 block text-[22px] font-medium leading-tight text-[var(--thusness-ink)]">
                      {row.title || "Untitled"}
                    </span>
                    {row.excerpt ? (
                      <span className="mt-2 block text-base italic leading-snug text-[var(--thusness-ink-soft)]">
                        {row.excerpt}
                      </span>
                    ) : null}
                  </Link>
                ) : row.href.startsWith("/") ? (
                  <Link href={row.href} className={linkClassName}>
                    <span className="text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
                      Link
                    </span>
                    <span className="mt-2 block text-[22px] font-medium leading-tight text-[var(--thusness-ink)]">
                      {row.label}
                    </span>
                    <span className="mt-2 block text-sm text-[var(--thusness-ink-soft)]">
                      {row.href}
                    </span>
                  </Link>
                ) : (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    <span className="text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
                      External
                    </span>
                    <span className="mt-2 block text-[22px] font-medium leading-tight text-[var(--thusness-ink)]">
                      {row.label}
                    </span>
                    <span className="mt-2 block text-sm text-[var(--thusness-ink-soft)]">
                      {row.href}
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>

        <SiteFooter />
      </ThusnessPageShell>
    </main>
  );
}
