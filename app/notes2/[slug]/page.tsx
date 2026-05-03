import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);
  if (!note) return { title: "Note" };
  return {
    title: note.title || "Note",
    description: note.excerpt ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function Note2Page({ params }: Props) {
  const { slug } = await params;

  const note = await getPublishedNoteBySlug(slug);
  if (!note) notFound();

  const html = tiptapJsonToHtml(note.content_json);

  return (
    <HomePageFromTipTap
      html={html}
      showBackgroundCircle={note.show_background_circle === true}
    />
  );
}
