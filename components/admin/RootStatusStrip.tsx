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
  const isNoteRoot = homepagePin.source === "note";

  return (
    <div className="border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className={adminFieldLabel}>Site root · /</p>
        {isNoteRoot ? (
          <span
            className="border border-[var(--thusness-red,#c23a2a)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--thusness-red,#c23a2a)]"
            title="What visitors see at the site root"
          >
            Live
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-snug text-[var(--thusness-ink)]">
        {describeLiveHomepage(homepagePin, notes)}
      </p>
      {isNoteRoot ? (
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          To change it: open that note and use{" "}
          <span className="text-[var(--thusness-ink-soft)]">
            Same note at /
          </span>
          , or pick another note under Simple/Full below.
        </p>
      ) : null}
    </div>
  );
}
