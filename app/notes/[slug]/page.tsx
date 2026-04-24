import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
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
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell
        headerAside={
          <Link
            href="/notes"
            className="transition-opacity hover:opacity-70"
          >
            ~ notes
          </Link>
        }
      >
        <article className="mx-auto max-w-[620px]">
          <header className="mb-14 border-b border-[var(--thusness-rule)] pb-12 md:mb-16 md:pb-14">
            <p className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
              ~ note
            </p>
            <time
              dateTime={note.published_at}
              className="mt-4 block text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)] tabular-nums"
            >
              {formatPublishedDate(note.published_at)}
            </time>
            <h1 className="mt-4 text-3xl font-medium leading-snug tracking-tight text-[var(--thusness-ink)] md:text-[2rem]">
              {note.title}
            </h1>
          </header>

          <TiptapHtml
            html={bodyHtml}
            className="text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]"
          />
        </article>

        <SiteFooter />
      </ThusnessPageShell>
    </main>
  );
}
