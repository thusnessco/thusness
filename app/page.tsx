import { HomePageFromTipTap } from "@/components/thusness/HomePageFromTipTap";
import { getHomepageTipTapDoc } from "@/lib/data/homepage-body";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

export default async function Home() {
  const body = await getHomepageTipTapDoc();
  if (body.ok) {
    const html = tiptapJsonToHtml(body.doc);
    return (
      <HomePageFromTipTap
        html={html}
        showBackgroundCircle={body.showBackgroundCircle === true}
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
    </main>
  );
}
