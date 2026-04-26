"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { setHomepagePinToNoteSlug } from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { NoteRow } from "@/lib/supabase/public-server";

import type { ContentKey } from "./homepage-helpers";
import { adminBtnPrimary, adminFieldInput, adminFieldLabel } from "./admin-ui";

export function SwitchRootToNote({
  homepagePin,
  notes,
  isPending,
  startTransition,
  onMessage,
  setContentKey,
}: {
  homepagePin: HomepagePin;
  notes: NoteRow[];
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
  setContentKey: (k: ContentKey) => void;
}) {
  const router = useRouter();
  const published = notes.filter((n) => n.published);
  const [slug, setSlug] = useState("");

  if (published.length === 0) return null;

  return (
    <div className="space-y-3">
      {homepagePin.source === "note" ? (
        <p className="text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          Homepage is already a published note. Choose another note here to
          replace it, or open the current homepage note and turn off{" "}
          <span className="italic">Same note at / (homepage)</span>.
        </p>
      ) : (
        <p className="text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          Pick a published note to use as <span className="italic">/</span> instead
          of the built-in Simple or Full layout.
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="block min-w-[min(100%,14rem)] flex-1 space-y-1.5">
        <span className={adminFieldLabel}>Pin homepage to note</span>
        <select
          className={adminFieldInput}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        >
          <option value="">Choose a published note…</option>
          {published.map((n) => (
            <option key={n.id} value={n.slug}>
              {(n.title || n.slug).slice(0, 88)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={isPending || !slug}
        className={adminBtnPrimary}
        onClick={() => {
          const s = slug.trim();
          if (!s) return;
          startTransition(async () => {
            const res = await setHomepagePinToNoteSlug(s);
            if (!res.ok) onMessage(res.message);
            else {
              onMessage("Homepage is now that note.");
              setSlug("");
              const hit = notes.find((x) => x.slug === s);
              if (hit) setContentKey(`n:${hit.id}`);
              router.refresh();
            }
          });
        }}
      >
        Apply
      </button>
      </div>
    </div>
  );
}
