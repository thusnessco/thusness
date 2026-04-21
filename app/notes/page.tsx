import type { Metadata } from "next";
import Link from "next/link";

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
      <main className="min-h-screen bg-black text-white px-6 py-20 md:py-28 font-sans">
        <div className="max-w-xl mx-auto text-sm text-gray-500">
          Notes are unavailable until Supabase is configured.
        </div>
      </main>
    );
  }

  const sorted = await getPublishedNotes();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 md:py-28 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="mb-20 md:mb-28">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white">
            Notes
          </h1>
          <div className="mt-8 h-px w-12 bg-white/20" aria-hidden />
        </header>

        <ul className="divide-y divide-white/[0.08]">
          {sorted.map((note) => (
            <li key={note.id} className="py-10 first:pt-0 last:pb-0">
              <Link
                href={`/notes/${note.slug}`}
                className="group block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/40"
              >
                <time
                  dateTime={note.published_at}
                  className="text-xs font-normal tracking-[0.18em] uppercase text-gray-500 tabular-nums"
                >
                  {formatPublishedDate(note.published_at)}
                </time>
                <h2 className="mt-3 text-lg md:text-xl font-light text-white transition-colors group-hover:text-gray-200">
                  {note.title}
                </h2>
                {note.excerpt ? (
                  <p className="mt-4 text-sm leading-relaxed text-gray-500 transition-colors group-hover:text-gray-400">
                    {note.excerpt}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
