import OnePage from "@/components/thusness/OnePage";
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
    return <OnePage />;
  }

  const [introDoc, weeklyDoc] = await Promise.all([
    getSiteContentJsonOrEmpty("home_intro"),
    getSiteContentJsonOrEmpty("weekly_sessions"),
  ]);

  const invitationHtml = tiptapJsonToHtml(introDoc);
  const weeklySessionsHtml = tiptapJsonToHtml(weeklyDoc);

  return (
    <OnePage
      invitationHtml={
        textFromHtml(invitationHtml).length > 0 ? invitationHtml : undefined
      }
      weeklySessionsHtml={
        textFromHtml(weeklySessionsHtml).length > 0 ? weeklySessionsHtml : undefined
      }
    />
  );
}
