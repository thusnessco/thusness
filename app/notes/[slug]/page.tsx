import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getWeekBySlug } from "@/lib/weeks";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const week = await getWeekBySlug(slug);
  if (!week) return { title: "Note" };
  return {
    title: week.themeTitle,
    description: week.question,
    robots: { index: false, follow: false },
  };
}

export default async function ArchivedWeekPage({ params }: Props) {
  const { slug } = await params;
  const week = await getWeekBySlug(slug);
  if (!week) notFound();

  const html = tiptapJsonToHtml(week.bodyJson);

  return (
    <div>
      <div className="border-b border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-[880px] justify-end">
          <Link
            href="/notes"
            className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
            style={{
              fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            ~ notes
          </Link>
        </div>
      </div>
      <HomePageFromTipTap html={html} />
    </div>
  );
}
