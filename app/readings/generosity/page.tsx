import type { Metadata } from "next";
import Link from "next/link";

import { GenerosityReadingView } from "@/components/readings/GenerosityReadingView";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { getGenerosityReadingBundle } from "@/lib/data/generosity-reading";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getGenerosityReadingBundle();
  const title = `${content.title.replace(/\.$/, "")} · Readings · Thusness`;
  const description =
    content.sub.trim() || "A field note on miserliness, generosity, and relational giving.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: content.title,
      description,
      url: "/readings/generosity",
      siteName: "Thusness",
      type: "article",
    },
  };
}

export default async function GenerosityReadingPage() {
  const bundle = await getGenerosityReadingBundle();

  return (
    <main className="min-h-screen bg-[var(--thusness-bg)] font-sans text-[var(--thusness-ink)]">
      <ThusnessPageShell
        headerAside={
          <Link href="/readings" className="transition-opacity hover:opacity-70">
            ← Readings
          </Link>
        }
      >
        <p className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
          ~ readings
        </p>
        <GenerosityReadingView content={bundle.content} />
        <SiteFooter />
      </ThusnessPageShell>
    </main>
  );
}
