"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { setHomepagePinToNoteSlug } from "@/app/admin/actions";
import type { NoteRow } from "@/lib/supabase/public-server";

import type { ContentKey } from "./homepage-helpers";
import { adminBtnPrimary, adminFieldInput, adminFieldLabel } from "./admin-ui";

export function SwitchRootToNote({
  notes,
  isPending,
  startTransition,
  onMessage,
  setContentKey,
}: {
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
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="block min-w-[min(100%,14rem)] flex-1 space-y-1.5">
        <span className={adminFieldLabel}>Use a note at / instead</span>
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
  );
}
