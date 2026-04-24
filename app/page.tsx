import Link from "next/link";

import OnePage from "@/components/thusness/OnePage";
import { getCurrentWeek } from "@/lib/weeks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const week = await getCurrentWeek();
  if (!week) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--thusness-bg)] px-6 font-sans text-[var(--thusness-ink-soft)]"
        style={{
          fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <p className="max-w-md text-center text-sm leading-relaxed">
          No week files found. Add an MDX file under{" "}
          <code className="text-[var(--thusness-muted)]">content/weeks/</code>{" "}
          and deploy.
        </p>
        <Link
          href="/notes"
          className="text-xs uppercase tracking-[2px] text-[var(--thusness-muted)] underline decoration-[var(--thusness-ink)] decoration-1 underline-offset-4"
        >
          Notes
        </Link>
      </main>
    );
  }
  return <OnePage week={week} mode="home" />;
}
