"use client";

import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

import {
  createDraftNoteFromHomepageTemplate,
  resetHomepagePinToDefaultLayout,
  saveHomepageSiteTemplate,
} from "@/app/admin/actions";
import type { SimpleContemplationFields } from "@/lib/homepage/site-templates";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSmall,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";
import { SessionSlotFieldsEditor } from "./SessionSlotFields";

type Props = {
  simple: SimpleContemplationFields;
  setSimple: Dispatch<SetStateAction<SimpleContemplationFields>>;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
  /** Whether Simple is what `/` shows right now. */
  isLiveAtRoot: boolean;
  onDraftNoteCreated?: (id: string) => void;
};

export function SimpleLayoutForm({
  simple,
  setSimple,
  isPending,
  startTransition,
  onMessage,
  isLiveAtRoot,
  onDraftNoteCreated,
}: Props) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className={adminFieldLabel}>Fields</p>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Hero question</span>
          <textarea
            className={`${adminFieldInput} min-h-[4rem] resize-y`}
            value={simple.heroQuestion}
            onChange={(e) =>
              setSimple((s) => ({ ...s, heroQuestion: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Hero subtitle</span>
          <input
            className={adminFieldInput}
            value={simple.heroSubtitle}
            onChange={(e) =>
              setSimple((s) => ({ ...s, heroSubtitle: e.target.value }))
            }
          />
        </label>
        <SessionSlotFieldsEditor
          label="Session I"
          value={simple.session1}
          onChange={(session1) => setSimple((s) => ({ ...s, session1 }))}
        />
        <SessionSlotFieldsEditor
          label="Session II"
          value={simple.session2}
          onChange={(session2) => setSimple((s) => ({ ...s, session2 }))}
        />
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Zoom URL</span>
          <input
            className={adminFieldInput}
            value={simple.zoomUrl}
            onChange={(e) => setSimple((s) => ({ ...s, zoomUrl: e.target.value }))}
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Closing line</span>
          <input
            className={adminFieldInput}
            value={simple.zoomClosing}
            onChange={(e) =>
              setSimple((s) => ({ ...s, zoomClosing: e.target.value }))
            }
          />
        </label>
      </div>

      <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-6">
        <p className={adminFieldLabel}>Homepage</p>
        <p className="text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          Saving writes these fields to the built-in Simple layout and sets{" "}
          <span className="italic">/</span> to use it. To use a TipTap note at{" "}
          <span className="italic">/</span> instead, pick it in the bar above.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            className={adminBtnPrimary}
            onClick={() => {
              startTransition(async () => {
                const res = await saveHomepageSiteTemplate(
                  "simple_contemplation",
                  simple
                );
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage("Simple layout is now live at /.");
                  router.refresh();
                }
              });
            }}
          >
            Save and use on /
          </button>
          <button
            type="button"
            disabled={isPending}
            className={adminBtnSmall}
            onClick={() => {
              startTransition(async () => {
                const res = await createDraftNoteFromHomepageTemplate({
                  template: "simple_contemplation",
                  fields: simple,
                });
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage(`Draft note created (${res.slug}).`);
                  onDraftNoteCreated?.(res.id);
                  router.refresh();
                }
              });
            }}
          >
            Copy to new note
          </button>
          <button
            type="button"
            disabled={isPending || !isLiveAtRoot}
            title={
              !isLiveAtRoot
                ? "Simple is not what / shows right now."
                : undefined
            }
            className={adminBtnGhost}
            onClick={() => {
              if (
                !window.confirm(
                  "Reset / to the default Simple layout? You can pin a note or Full layout afterward."
                )
              ) {
                return;
              }
              startTransition(async () => {
                const res = await resetHomepagePinToDefaultLayout();
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage("Homepage reset to default Simple.");
                  router.refresh();
                }
              });
            }}
          >
            Reset /
          </button>
        </div>
      </div>
    </div>
  );
}
