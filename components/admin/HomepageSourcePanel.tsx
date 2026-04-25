"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  clearHomepagePinToWeek,
  createDraftNoteFromHomepageTemplate,
  saveHomepageSiteTemplate,
} from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type {
  FullDescriptionFields,
  SessionSlotFields,
  SimpleContemplationFields,
} from "@/lib/homepage/site-templates";
import {
  DEFAULT_FULL_FIELDS,
  DEFAULT_SIMPLE_FIELDS,
} from "@/lib/homepage/site-templates";

const fieldLabel =
  "text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]";
const fieldInput =
  "w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm text-[var(--thusness-ink)] outline-none focus:border-[var(--thusness-ink)]";
const btnSmall =
  "self-start border border-[var(--thusness-rule)] px-3 py-1.5 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40";
const btnPrimary =
  "border border-[var(--thusness-ink)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:opacity-70 disabled:opacity-40";

function SessionSlotFieldsEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SessionSlotFields;
  onChange: (next: SessionSlotFields) => void;
}) {
  const row = (key: keyof SessionSlotFields, sub: string) => (
    <label key={key} className="block space-y-1">
      <span className={fieldLabel}>{sub}</span>
      <input
        className={fieldInput}
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <fieldset className="space-y-2 border border-[var(--thusness-rule)] px-3 py-3">
      <legend className={`px-1 ${fieldLabel}`}>{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {row("kicker", "Kicker")}
        {row("day", "Day")}
        {row("time", "Time")}
        {row("zone", "Zone")}
      </div>
    </fieldset>
  );
}

export function HomepageSourcePanel({
  homepagePin,
  onMessage,
  onDraftNoteCreated,
}: {
  homepagePin: HomepagePin;
  onMessage: (msg: string) => void;
  onDraftNoteCreated?: (noteId: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [simple, setSimple] = useState<SimpleContemplationFields>(
    DEFAULT_SIMPLE_FIELDS
  );
  const [full, setFull] = useState<FullDescriptionFields>(DEFAULT_FULL_FIELDS);

  const pinSyncKey = useMemo(() => JSON.stringify(homepagePin), [homepagePin]);

  useEffect(() => {
    if (homepagePin.source !== "site_template") return;
    if (homepagePin.template === "simple_contemplation") {
      const next = homepagePin.fields;
      setSimple((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    } else if (homepagePin.template === "full_description") {
      const next = homepagePin.fields;
      setFull((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    }
    // pinSyncKey is JSON.stringify(homepagePin); avoids redundant setState when unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinSyncKey]);

  const status =
    homepagePin.source === "week"
      ? "Scheduled week (latest week-of on or before today)."
      : homepagePin.source === "note"
        ? `Pinned published note: /notes/${homepagePin.slug}`
        : homepagePin.template === "simple_contemplation"
          ? "Simple Contemplation template (hero + sessions + Zoom)."
          : "Full Description template (sections, lists, pillar, sessions, Zoom).";

  return (
    <div className="border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-4 py-5 sm:px-5">
      <p className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
        Public homepage
      </p>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-ink-soft)]">
        {status}
      </p>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-muted)]">
        <span className="font-medium text-[var(--thusness-ink)]">Scheduled week</span>{" "}
        uses the current week&apos;s TipTap body.{" "}
        <span className="font-medium text-[var(--thusness-ink)]">Templates</span>{" "}
        are fill-in-the-blank layouts.{" "}
        <span className="font-medium text-[var(--thusness-ink)]">Pinned note</span>{" "}
        is freeform — open a note below and choose &ldquo;Use as public home&rdquo;.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || homepagePin.source === "week"}
          className={btnSmall}
          onClick={() => {
            startTransition(async () => {
              const res = await clearHomepagePinToWeek();
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Homepage uses the scheduled week.");
                router.refresh();
              }
            });
          }}
        >
          Use scheduled week
        </button>
        <button
          type="button"
          disabled={isPending}
          className={btnSmall}
          onClick={() => {
            startTransition(async () => {
              const res = await saveHomepageSiteTemplate(
                "simple_contemplation",
                simple
              );
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Homepage set to Simple Contemplation.");
                router.refresh();
              }
            });
          }}
        >
          Use Simple Contemplation
        </button>
        <button
          type="button"
          disabled={isPending}
          className={btnSmall}
          onClick={() => {
            startTransition(async () => {
              const res = await saveHomepageSiteTemplate(
                "full_description",
                full
              );
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Homepage set to Full Description.");
                router.refresh();
              }
            });
          }}
        >
          Use Full Description
        </button>
      </div>

      {homepagePin.source === "site_template" &&
      homepagePin.template === "simple_contemplation" ? (
        <div className="mt-8 space-y-4 border-t border-[var(--thusness-rule)] pt-8">
          <p className={fieldLabel}>Edit Simple Contemplation — then save</p>
          <label className="block space-y-1">
            <span className={fieldLabel}>Hero question</span>
            <textarea
              className={`${fieldInput} min-h-[4rem] resize-y`}
              value={simple.heroQuestion}
              onChange={(e) =>
                setSimple((s) => ({ ...s, heroQuestion: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Hero subtitle</span>
            <input
              className={fieldInput}
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
            <span className={fieldLabel}>Zoom URL</span>
            <input
              className={fieldInput}
              value={simple.zoomUrl}
              onChange={(e) =>
                setSimple((s) => ({ ...s, zoomUrl: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Closing line</span>
            <input
              className={fieldInput}
              value={simple.zoomClosing}
              onChange={(e) =>
                setSimple((s) => ({ ...s, zoomClosing: e.target.value }))
              }
            />
          </label>
        </div>
      ) : null}

      {homepagePin.source === "site_template" &&
      homepagePin.template === "full_description" ? (
        <div className="mt-8 space-y-4 border-t border-[var(--thusness-rule)] pt-8">
          <p className={fieldLabel}>Edit Full Description — then save</p>
          <label className="block space-y-1">
            <span className={fieldLabel}>Hero question</span>
            <textarea
              className={`${fieldInput} min-h-[4rem] resize-y`}
              value={full.heroQuestion}
              onChange={(e) =>
                setFull((f) => ({ ...f, heroQuestion: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Hero subtitle</span>
            <input
              className={fieldInput}
              value={full.heroSubtitle}
              onChange={(e) =>
                setFull((f) => ({ ...f, heroSubtitle: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Section theme line (~ Theme · …)</span>
            <input
              className={fieldInput}
              value={full.sectionTheme}
              onChange={(e) =>
                setFull((f) => ({ ...f, sectionTheme: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Intro paragraph</span>
            <textarea
              className={`${fieldInput} min-h-[6rem] resize-y`}
              value={full.introParagraph}
              onChange={(e) =>
                setFull((f) => ({ ...f, introParagraph: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Pull quote</span>
            <textarea
              className={`${fieldInput} min-h-[5rem] resize-y`}
              value={full.pullQuote}
              onChange={(e) =>
                setFull((f) => ({ ...f, pullQuote: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Benefits list title</span>
            <input
              className={fieldInput}
              value={full.benefitsTitle}
              onChange={(e) =>
                setFull((f) => ({ ...f, benefitsTitle: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Benefits lines (one per line)</span>
            <textarea
              className={`${fieldInput} min-h-[6rem] resize-y font-mono text-[13px]`}
              value={full.benefitLines.join("\n")}
              onChange={(e) =>
                setFull((f) => ({
                  ...f,
                  benefitLines: e.target.value
                    .split("\n")
                    .map((s) => s.trimEnd()),
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Itinerary list title</span>
            <input
              className={fieldInput}
              value={full.itineraryTitle}
              onChange={(e) =>
                setFull((f) => ({ ...f, itineraryTitle: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Itinerary lines (one per line)</span>
            <textarea
              className={`${fieldInput} min-h-[8rem] resize-y font-mono text-[13px]`}
              value={full.itineraryLines.join("\n")}
              onChange={(e) =>
                setFull((f) => ({
                  ...f,
                  itineraryLines: e.target.value
                    .split("\n")
                    .map((s) => s.trimEnd()),
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Pillar line</span>
            <input
              className={fieldInput}
              value={full.pillarLine}
              onChange={(e) =>
                setFull((f) => ({ ...f, pillarLine: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Sit together section mark</span>
            <input
              className={fieldInput}
              value={full.sectionSitTogether}
              onChange={(e) =>
                setFull((f) => ({ ...f, sectionSitTogether: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Sit together intro</span>
            <textarea
              className={`${fieldInput} min-h-[4rem] resize-y`}
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
            <span className={fieldLabel}>Zoom URL</span>
            <input
              className={fieldInput}
              value={full.zoomUrl}
              onChange={(e) =>
                setFull((f) => ({ ...f, zoomUrl: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>Closing line</span>
            <input
              className={fieldInput}
              value={full.zoomClosing}
              onChange={(e) =>
                setFull((f) => ({ ...f, zoomClosing: e.target.value }))
              }
            />
          </label>
        </div>
      ) : null}

      {homepagePin.source === "site_template" ? (
        <div className="mt-8 space-y-3 border-t border-[var(--thusness-rule)] pt-8">
          <p className={fieldLabel}>Template actions</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isPending}
              className={btnPrimary}
              onClick={() => {
                const template = homepagePin.template;
                const fields =
                  template === "simple_contemplation" ? simple : full;
                startTransition(async () => {
                  const res = await saveHomepageSiteTemplate(template, fields);
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage("Homepage template saved.");
                    router.refresh();
                  }
                });
              }}
            >
              Save
            </button>
            <button
              type="button"
              disabled={isPending}
              className={btnSmall}
              onClick={() => {
                const template = homepagePin.template;
                const fields =
                  template === "simple_contemplation" ? simple : full;
                startTransition(async () => {
                  const res = await createDraftNoteFromHomepageTemplate({
                    template,
                    fields,
                  });
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage(
                      `Draft note created (${res.slug}). Open it in TipTap below.`
                    );
                    onDraftNoteCreated?.(res.id);
                    router.refresh();
                  }
                });
              }}
            >
              Save to notes
            </button>
            <button
              type="button"
              disabled={isPending}
              className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] italic transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40"
              onClick={() => {
                if (
                  !window.confirm(
                    "Stop using this homepage template? The public site will show the scheduled week until you choose a template or pin a note again."
                  )
                ) {
                  return;
                }
                startTransition(async () => {
                  const res = await clearHomepagePinToWeek();
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage("Homepage template cleared.");
                    router.refresh();
                  }
                });
              }}
            >
              Delete
            </button>
          </div>
          <p className="max-w-2xl text-[10px] leading-relaxed text-[var(--thusness-muted)]">
            <span className="font-medium text-[var(--thusness-ink)]">Save</span>{" "}
            updates the live homepage.{" "}
            <span className="font-medium text-[var(--thusness-ink)]">
              Save to notes
            </span>{" "}
            copies the layout into a new <span className="italic">draft</span>{" "}
            note for TipTap editing.{" "}
            <span className="font-medium text-[var(--thusness-ink)]">Delete</span>{" "}
            removes the template from the homepage (scheduled week returns).
          </p>
        </div>
      ) : null}
    </div>
  );
}
