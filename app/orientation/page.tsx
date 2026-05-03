import Link from "next/link";
import { notFound } from "next/navigation";

import { OrientArticle } from "@/components/thusness/OrientArticle";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import Wordmark from "@/components/thusness/Wordmark";
import { getOrientInfographicsBundle } from "@/lib/data/orient-infographics";
import { getPublishedNoteBySlug } from "@/lib/data/notes-public";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

const ORIENTATION_SLUG = "orientation";

export default async function OrientationPage() {
  const [note, orientNavVisible, orientIg] = await Promise.all([
    getPublishedNoteBySlug(ORIENTATION_SLUG),
    getOrientNavVisible(),
    getOrientInfographicsBundle(),
  ]);
  if (!note) notFound();
  const html = tiptapJsonToHtml(note.content_json);

  return (
    <div className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <div className="bg-[var(--thusness-bg)] px-6 py-4 sm:px-10">
        <div className="mx-auto max-w-[1080px]">
          <Link
            href="/"
            className="inline-block transition-opacity hover:opacity-70"
            aria-label="Thusness home"
          >
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
        </div>
      </div>

      <OrientArticle html={html} embedContent={orientIg.content} />
      <div className="mx-auto max-w-[1080px] px-6 pb-12 lg:px-10">
        <SiteFooter showOrientLink={orientNavVisible} />
      </div>
    </div>
  );
}
