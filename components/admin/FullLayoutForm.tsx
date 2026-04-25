"use client";

import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

import {
  createDraftNoteFromHomepageTemplate,
  resetHomepagePinToDefaultLayout,
  saveHomepageSiteTemplate,
} from "@/app/admin/actions";
import type { FullDescriptionFields } from "@/lib/homepage/site-templates";
import type { NoteRow } from "@/lib/supabase/public-server";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSmall,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";
import { SessionSlotFieldsEditor } from "./SessionSlotFields";

type Props = {
  full: FullDescriptionFields;
  setFull: Dispatch<SetStateAction<FullDescriptionFields>>;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
  isLiveAtRoot: boolean;
  onDraftNoteCreated?: (note: NoteRow) => void;
};

export function FullLayoutForm({
  full,
  setFull,
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
            value={full.heroQuestion}
            onChange={(e) =>
              setFull((f) => ({ ...f, heroQuestion: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Hero subtitle</span>
          <input
            className={adminFieldInput}
            value={full.heroSubtitle}
            onChange={(e) =>
              setFull((f) => ({ ...f, heroSubtitle: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Section theme line (~ Theme · …)</span>
          <input
            className={adminFieldInput}
            value={full.sectionTheme}
            onChange={(e) =>
              setFull((f) => ({ ...f, sectionTheme: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Intro paragraph</span>
          <textarea
            className={`${adminFieldInput} min-h-[6rem] resize-y`}
            value={full.introParagraph}
            onChange={(e) =>
              setFull((f) => ({ ...f, introParagraph: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Pull quote</span>
          <textarea
            className={`${adminFieldInput} min-h-[5rem] resize-y`}
            value={full.pullQuote}
            onChange={(e) => setFull((f) => ({ ...f, pullQuote: e.target.value }))}
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Benefits list title</span>
          <input
            className={adminFieldInput}
            value={full.benefitsTitle}
            onChange={(e) =>
              setFull((f) => ({ ...f, benefitsTitle: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Benefits lines (one per line)</span>
          <textarea
            className={`${adminFieldInput} min-h-[6rem] resize-y font-mono text-[13px]`}
            value={full.benefitLines.join("\n")}
            onChange={(e) =>
              setFull((f) => ({
                ...f,
                benefitLines: e.target.value.split("\n"),
              }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Itinerary list title</span>
          <input
            className={adminFieldInput}
            value={full.itineraryTitle}
            onChange={(e) =>
              setFull((f) => ({ ...f, itineraryTitle: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Itinerary lines (one per line)</span>
          <textarea
            className={`${adminFieldInput} min-h-[8rem] resize-y font-mono text-[13px]`}
            value={full.itineraryLines.join("\n")}
            onChange={(e) =>
              setFull((f) => ({
                ...f,
                itineraryLines: e.target.value.split("\n"),
              }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Pillar line</span>
          <input
            className={adminFieldInput}
            value={full.pillarLine}
            onChange={(e) =>
              setFull((f) => ({ ...f, pillarLine: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Sit together section mark</span>
          <input
            className={adminFieldInput}
            value={full.sectionSitTogether}
            onChange={(e) =>
              setFull((f) => ({ ...f, sectionSitTogether: e.target.value }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Sit together intro</span>
          <textarea
            className={`${adminFieldInput} min-h-[4rem] resize-y`}
            value={full.sitTogetherIntro}
            onChange={(e) =>
              setFull((f) => ({ ...f, sitTogetherIntro: e.target.value }))
            }
          />
        </label>
        <SessionSlotFieldsEditor
          label="Session I"
          value={full.session1}
          onChange={(session1) => setFull((f) => ({ ...f, session1 }))}
        />
        <SessionSlotFieldsEditor
          label="Session II"
          value={full.session2}
          onChange={(session2) => setFull((f) => ({ ...f, session2 }))}
        />
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Join / booking URL</span>
          <input
            className={adminFieldInput}
            value={full.zoomUrl}
            onChange={(e) => setFull((f) => ({ ...f, zoomUrl: e.target.value }))}
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Closing line</span>
          <input
            className={adminFieldInput}
            value={full.zoomClosing}
            onChange={(e) =>
              setFull((f) => ({ ...f, zoomClosing: e.target.value }))
            }
          />
        </label>
      </div>

      <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-6">
        <p className={adminFieldLabel}>Homepage</p>
        <p className="text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          Saving writes these fields to the built-in Full layout and sets{" "}
          <span className="italic">/</span> to use it.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            className={adminBtnPrimary}
            onClick={() => {
              startTransition(async () => {
                const res = await saveHomepageSiteTemplate(
                  "full_description",
                  full
                );
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage("Full layout is now live at /.");
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
                  template: "full_description",
                  fields: full,
                });
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage(`Draft note created (${res.note.slug}).`);
                  onDraftNoteCreated?.(res.note);
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
              !isLiveAtRoot ? "Full is not what / shows right now." : undefined
            }
            className={adminBtnGhost}
            onClick={() => {
              if (
                !window.confirm(
                  "Reset / to the default Simple layout? You can pin a note or another layout afterward."
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
