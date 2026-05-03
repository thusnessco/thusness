import type { Metadata } from "next";

import { ResistancePageView } from "@/components/resistance/ResistancePageView";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { getResistancePageBundle } from "@/lib/data/resistance-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getResistancePageBundle();
  const title = `${content.title.replace(/\.$/, "")} · Readings · Thusness`;
  const description = content.sub.trim() || "Field notes on working with tension.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: content.title,
      description,
      url: "/readings/resistance",
      siteName: "Thusness",
      type: "article",
    },
  };
}

export default async function ResistanceReadingPage() {
  const bundle = await getResistancePageBundle();

  return (
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell>
        <p className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
          ~ readings
        </p>
        <ResistancePageView content={bundle.content} />
        <SiteFooter />
      </ThusnessPageShell>
    </main>
  );
}
