import Link from "next/link";

import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getHomepageTipTapDoc } from "@/lib/data/homepage-body";
import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [body, orientNavVisible] = await Promise.all([
    getHomepageTipTapDoc(),
    getOrientNavVisible(),
  ]);
  if (body.ok) {
    const html = tiptapJsonToHtml(body.doc);
    return (
      <HomePageFromTipTap
        html={html}
        showBackgroundCircle={body.showBackgroundCircle === true}
        showOrientLink={orientNavVisible}
      />
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--thusness-bg)] px-6 font-sans text-[var(--thusness-ink-soft)]"
      style={{
        fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <p className="max-w-md text-center text-sm leading-relaxed">
        Nothing is available for the public home yet. Sign in to{" "}
        <span className="italic">Admin</span> to set a homepage layout or publish
        a note and pin it to <span className="italic">/</span>.
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
