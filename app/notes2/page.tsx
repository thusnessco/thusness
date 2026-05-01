import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import {
  formatPublishedDate,
  getPublishedNotes,
} from "@/lib/data/notes-public";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import {
  NOTE_CATEGORIES,
  NOTE_CATEGORY_LABELS,
  parseNoteCategory,
} from "@/lib/notes/category";
import { NOTE_PAGES_BASE } from "@/lib/site/note-pages";

export const metadata: Metadata = {
  title: "Notes",
  description: "Published notes.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ category?: string }> };

export default async function Notes2IndexPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const categoryFilter = parseNoteCategory(
    typeof sp.category === "string" ? sp.category : undefined
  );
  const [notes, orientNavVisible] = await Promise.all([
    getPublishedNotes(categoryFilter ? { category: categoryFilter } : undefined),
    getOrientNavVisible(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell
        headerAside={
          orientNavVisible ? (
            <nav className="flex items-center justify-end gap-4" aria-label="Top navigation">
              <Link href="/orient" className="transition-opacity hover:opacity-70">
                Orient
              </Link>
            </nav>
          ) : null
        }
      >
        <h1 className="mt-1 text-[22px] font-medium tracking-tight text-[var(--thusness-ink)]">
          Notes
        </h1>

        <section className="mt-14">
          <p className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
            ~ published
          </p>
          <nav
            aria-label="Filter by category"
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-[var(--thusness-rule)] pb-5 text-[11px] uppercase tracking-[2px]"
          >
            <Link
              href={NOTE_PAGES_BASE}
              className={
                !categoryFilter
                  ? "text-[var(--thusness-ink)]"
                  : "text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
              }
            >
              All
            </Link>
            {NOTE_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`${NOTE_PAGES_BASE}?category=${c}`}
                className={
                  categoryFilter === c
                    ? "text-[var(--thusness-ink)]"
                    : "text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
                }
              >
                {NOTE_CATEGORY_LABELS[c]}
              </Link>
            ))}
          </nav>
          {notes.length === 0 ? (
            <p className="mt-6 text-base italic text-[var(--thusness-muted)]">
              {categoryFilter
                ? "No published notes in this category."
                : "No published notes yet. Draft and publish them in Admin."}
            </p>
          ) : (
            <ol className="m-0 mt-8 max-w-[620px] list-none p-0">
              {notes.map((n) => {
                const cat = parseNoteCategory(n.category);
                return (
                  <li
                    key={n.id}
                    className="border-t border-[var(--thusness-rule)] py-6 last:border-b last:border-[var(--thusness-rule)]"
                  >
                    <Link
                      href={`${NOTE_PAGES_BASE}/${n.slug}`}
                      className="block text-[var(--thusness-ink)] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--thusness-ink)]"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
                        <span>{formatPublishedDate(n.published_at)}</span>
                        {cat ? (
                          <span className="normal-case tracking-normal text-[var(--thusness-ink-soft)]">
                            · {NOTE_CATEGORY_LABELS[cat]}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-2 block text-[22px] font-medium leading-tight text-[var(--thusness-ink)]">
                        {n.title || "Untitled"}
                      </span>
                      {n.excerpt ? (
                        <span className="mt-2 block text-base italic leading-snug text-[var(--thusness-ink-soft)]">
                          {n.excerpt}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <SiteFooter />
      </ThusnessPageShell>
    </main>
  );
}
