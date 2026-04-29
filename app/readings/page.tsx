import Link from "next/link";

import { SiteFooter } from "@/components/thusness/SiteFooter";
import Wordmark from "@/components/thusness/Wordmark";

export const dynamic = "force-dynamic";

export default function ReadingsPage() {
  return (
    <div className="min-h-screen bg-[var(--thusness-bg)] px-6 py-6 sm:px-10">
      <div className="mx-auto max-w-[880px]">
        <header className="mb-10">
          <Link href="/" className="inline-block transition-opacity hover:opacity-70">
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
        </header>
        <main className="mx-auto max-w-[620px]">
          <h1 className="text-2xl text-[var(--thusness-ink)]">Readings</h1>
          <p className="mt-3 text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]">
            Readings return soon.
          </p>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
