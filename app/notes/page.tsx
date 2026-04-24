import type { Metadata } from "next";
import Link from "next/link";

import SectionMark from "@/components/thusness/SectionMark";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { formatPublishedDate, getPublishedNotes } from "@/lib/data/notes-public";
import { createPublicSupabase } from "@/lib/supabase/public-server";

export const metadata: Metadata = {
  title: "Notes",
  description: "Session notes archive.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotesIndexPage() {
  if (!createPublicSupabase()) {
    return (
      <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
        <ThusnessPageShell headerAside="~ archive">
          <p className="mx-auto max-w-[620px] text-sm italic text-[var(--thusness-muted)]">
            Notes are unavailable until Supabase is configured.
          </p>
          <SiteFooter />
        </ThusnessPageShell>
      </main>
    );
  }

  const sorted = await getPublishedNotes();

  return (
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell headerAside="~ archive">
        <SectionMark label="~ Notes" />

        {sorted.length === 0 ? (
          <p className="mx-auto max-w-[620px] text-sm italic text-[var(--thusness-muted)]">
            Nothing published yet.
          </p>
        ) : (
          <ol className="mx-auto max-w-[620px] list-none p-0">
            {sorted.map((note, i) => (
              <li
                key={note.id}
                className="flex gap-5 border-t border-[var(--thusness-rule)] py-3.5 last:border-b last:border-[var(--thusness-rule)]"
              >
                <span className="min-w-[26px] shrink-0 pt-0.5 text-[13px] italic tabular-nums text-[var(--thusness-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/notes/${note.slug}`}
                  className="group min-w-0 flex-1 text-[var(--thusness-ink)] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--thusness-ink)]"
                >
                  <time
                    dateTime={note.published_at}
                    className="block text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]"
                  >
                    {formatPublishedDate(note.published_at)}
                  </time>
                  <span className="mt-1 block text-base font-medium leading-snug text-[var(--thusness-ink)]">
                    {note.title}
                  </span>
                  {note.excerpt ? (
                    <span className="mt-2 block text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
                      {note.excerpt}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        )}

        <SiteFooter />
      </ThusnessPageShell>
    </main>
  );
}
