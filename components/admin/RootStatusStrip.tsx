import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { NoteRow } from "@/lib/supabase/public-server";

import { adminFieldLabel } from "./admin-ui";
import { describeLiveHomepage } from "./homepage-helpers";

export function RootStatusStrip({
  homepagePin,
  notes,
}: {
  homepagePin: HomepagePin;
  notes: NoteRow[];
}) {
  return (
    <div className="border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-4 py-3">
      <p className={adminFieldLabel}>Site root · /</p>
      <p className="mt-1 text-sm text-[var(--thusness-ink)]">
        {describeLiveHomepage(homepagePin, notes)}
      </p>
    </div>
  );
}
