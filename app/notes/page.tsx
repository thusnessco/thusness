import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { formatWeekListDate, getArchivedWeeks } from "@/lib/weeks";

export const metadata: Metadata = {
  title: "Notes",
  description: "Archive of past weeks.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotesIndexPage() {
  const weeks = await getArchivedWeeks();

  return (
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell headerAside="~ archive">
        <p className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
          ~ past weeks
        </p>
        <h1 className="mt-4 text-[22px] font-medium tracking-tight text-[var(--thusness-ink)]">
          Notes
        </h1>

        {weeks.length === 0 ? (
          <p className="mt-12 text-base italic text-[var(--thusness-muted)]">
            No archived weeks yet—the current week is the only entry.
          </p>
        ) : (
          <ol className="m-0 mt-12 max-w-[620px] list-none p-0">
            {weeks.map((w) => (
              <li
                key={w.slug}
                className="border-t border-[var(--thusness-rule)] py-6 last:border-b last:border-[var(--thusness-rule)]"
              >
                <Link
                  href={`/notes/${w.slug}`}
                  className="block text-[var(--thusness-ink)] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--thusness-ink)]"
                >
                  <span className="block text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
                    {formatWeekListDate(w.weekOf)}
                  </span>
                  <span className="mt-2 block text-[22px] font-medium leading-tight text-[var(--thusness-ink)]">
                    {w.themeTitle}
                  </span>
                  <span className="mt-2 block text-base italic leading-snug text-[var(--thusness-ink-soft)]">
                    {w.question}
                  </span>
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
