import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TiptapHtml } from "@/components/TiptapHtml";
import {
  formatPublishedDate,
  getPublishedNoteBySlug,
} from "@/lib/data/notes-public";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!createPublicSupabase()) {
    return { title: "Note" };
  }
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);
  if (!note) return { title: "Note" };
  return {
    title: note.title,
    description: note.excerpt ?? note.title,
    robots: { index: false, follow: false },
  };
}

export default async function NotePage({ params }: Props) {
  if (!createPublicSupabase()) {
    notFound();
  }

  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);
  if (!note) notFound();

  const bodyHtml = tiptapJsonToHtml(note.content_json);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 md:py-28 font-sans">
      <div className="max-w-xl mx-auto">
        <nav className="mb-16 md:mb-20" aria-label="Archive">
          <Link
            href="/notes"
            className="text-xs tracking-[0.2em] uppercase text-gray-500 transition-colors hover:text-gray-400"
          >
            Notes
          </Link>
        </nav>

        <article>
          <header className="mb-14 md:mb-16 border-b border-white/[0.08] pb-12 md:pb-14">
            <time
              dateTime={note.published_at}
              className="text-xs font-normal tracking-[0.18em] uppercase text-gray-500 tabular-nums"
            >
              {formatPublishedDate(note.published_at)}
            </time>
            <h1 className="mt-5 text-3xl md:text-[2rem] font-light tracking-tight text-white leading-snug">
              {note.title}
            </h1>
          </header>

          <TiptapHtml
            html={bodyHtml}
            className="text-base md:text-lg leading-[1.75] text-gray-300"
          />
        </article>
      </div>
    </main>
  );
}
