import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatNoteDate,
  getAllSlugs,
  getNoteBySlug,
} from "@/lib/notes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return { title: "Note" };
  return {
    title: note.title,
    description: note.excerpt ?? note.title,
    robots: { index: false, follow: false },
  };
}

function NoteBody({ content }: { content: string }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-7 text-base md:text-lg leading-[1.75] text-gray-300">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) notFound();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 md:py-28">
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
              dateTime={note.date}
              className="text-xs font-normal tracking-[0.18em] uppercase text-gray-500 tabular-nums"
            >
              {formatNoteDate(note.date)}
            </time>
            <h1 className="mt-5 text-3xl md:text-[2rem] font-light tracking-tight text-white leading-snug">
              {note.title}
            </h1>
          </header>

          <NoteBody content={note.content} />
        </article>
      </div>
    </main>
  );
}
