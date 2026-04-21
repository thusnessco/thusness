import { TiptapHtml } from "@/components/TiptapHtml";
import { getSiteContentJsonOrEmpty } from "@/lib/data/site-content";
import { createPublicSupabase } from "@/lib/supabase/public-server";
import { tiptapJsonToHtml } from "@/lib/tiptap/to-html";

export const dynamic = "force-dynamic";

function textFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default async function Home() {
  const supabase = createPublicSupabase();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-16 md:py-24 font-sans">
        <div className="max-w-3xl mx-auto space-y-10 text-center">
          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white">
              Thusness
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-400 tracking-wide">
              ~As it is
            </p>
          </header>
          <p className="text-sm text-gray-500 leading-relaxed">
            Add{" "}
            <code className="text-gray-400">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            to load editable content from Supabase.
          </p>
        </div>
      </main>
    );
  }

  const [introDoc, weeklyDoc] = await Promise.all([
    getSiteContentJsonOrEmpty("home_intro"),
    getSiteContentJsonOrEmpty("weekly_sessions"),
  ]);

  const introHtml = tiptapJsonToHtml(introDoc);
  const weeklyHtml = tiptapJsonToHtml(weeklyDoc);
  const weeklyVisible = textFromHtml(weeklyHtml).length > 0;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16 md:py-24 font-sans">
      <div className="max-w-3xl mx-auto space-y-16 md:space-y-20">
        <section className="text-center">
          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white">
              Thusness
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-400 tracking-wide">
              ~As it is
            </p>
          </header>
        </section>

        <article className="space-y-12 md:space-y-14 border-t border-white/10 pt-16 md:pt-20 text-left">
          <TiptapHtml
            html={introHtml}
            className="text-base md:text-lg leading-relaxed"
          />
        </article>

        {weeklyVisible ? (
          <section className="border-t border-white/10 pt-16 md:pt-20 text-left">
            <TiptapHtml
              html={weeklyHtml}
              className="text-base md:text-lg leading-relaxed text-gray-300"
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
