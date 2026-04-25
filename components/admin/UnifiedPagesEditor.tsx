"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearHomepagePinToWeek,
  createDraftNoteFromHomepageTemplate,
  saveHomepageSiteTemplate,
} from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { WeekDocument } from "@/lib/data/weeks-types";
import type { NoteRow } from "@/lib/supabase/public-server";
import type {
  FullDescriptionFields,
  SessionSlotFields,
  SimpleContemplationFields,
} from "@/lib/homepage/site-templates";
import {
  DEFAULT_FULL_FIELDS,
  DEFAULT_SIMPLE_FIELDS,
} from "@/lib/homepage/site-templates";

import { NoteEditorPanel } from "./NoteEditorPanel";
import type { TiptapEditorFieldHandle } from "./TiptapEditorField";

export type PageKey = "week" | "tpl:simple" | "tpl:full" | `n:${string}`;

export function parseNoteId(pk: PageKey): string | null {
  return pk.startsWith("n:") ? pk.slice(2) : null;
}

export function initialPageKey(
  pin: HomepagePin,
  notes: NoteRow[]
): PageKey {
  if (pin.source === "week") return "week";
  if (pin.source === "site_template") {
    return pin.template === "simple_contemplation" ? "tpl:simple" : "tpl:full";
  }
  const n = notes.find((x) => x.slug === pin.slug);
  if (n) return `n:${n.id}`;
  return notes[0] ? `n:${notes[0].id}` : "week";
}

function liveBadge(hp: HomepagePin, key: PageKey, notes: NoteRow[]): boolean {
  if (key === "week") return hp.source === "week";
  if (key === "tpl:simple") {
    return hp.source === "site_template" && hp.template === "simple_contemplation";
  }
  if (key === "tpl:full") {
    return hp.source === "site_template" && hp.template === "full_description";
  }
  const id = parseNoteId(key);
  if (!id || hp.source !== "note") return false;
  const n = notes.find((x) => x.id === id);
  return Boolean(n && n.slug === hp.slug);
}

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
  const row = (k: keyof SessionSlotFields, sub: string) => (
    <label key={k} className="block space-y-1">
      <span className={fieldLabel}>{sub}</span>
      <input
        className={fieldInput}
        value={value[k]}
        onChange={(e) => onChange({ ...value, [k]: e.target.value })}
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

type Props = {
  notes: NoteRow[];
  homepagePin: HomepagePin;
  currentWeek: WeekDocument | null;
  pageKey: PageKey;
  setPageKey: (k: PageKey) => void;
  onMessage: (msg: string) => void;
  onNewNote: () => void;
  noteBodyRef: RefObject<TiptapEditorFieldHandle | null>;
  selectedForEditor: NoteRow | null;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onNoteBodySaved?: (
    id: string,
    doc: import("@tiptap/core").JSONContent,
    updatedAt: string
  ) => void;
};

export function UnifiedPagesEditor({
  notes,
  homepagePin,
  currentWeek,
  pageKey,
  setPageKey,
  onMessage,
  onNewNote,
  noteBodyRef,
  selectedForEditor,
  isPending,
  startTransition,
  onNoteBodySaved,
}: Props) {
  const router = useRouter();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinSyncKey]);

  const navBtn = (active: boolean) =>
    `block w-full border px-2 py-2 text-left text-sm transition-colors ${
      active
        ? "border-[var(--thusness-ink)] text-[var(--thusness-ink)]"
        : "border-transparent text-[var(--thusness-muted)] hover:border-[var(--thusness-rule)] hover:text-[var(--thusness-ink)]"
    }`;

  const templateLive =
    homepagePin.source === "site_template" &&
    ((pageKey === "tpl:simple" &&
      homepagePin.template === "simple_contemplation") ||
      (pageKey === "tpl:full" &&
        homepagePin.template === "full_description"));

  return (
    <section className="space-y-6 border-t border-[var(--thusness-rule)] pt-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
            Pages &amp; notes
          </h2>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--thusness-ink-soft)]">
            Pick a row to edit. <span className="italic">Live on /</span> marks
            what visitors see at the site root. TipTap notes can be drafts or
            published to <span className="italic">/notes</span>.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={onNewNote}
          className={btnSmall}
        >
          New note
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <nav
          aria-label="Pages and notes"
          className="space-y-1 border-b border-[var(--thusness-rule)] pb-8 lg:border-b-0 lg:border-r lg:border-[var(--thusness-rule)] lg:pb-0 lg:pr-8"
        >
          <p className={`${fieldLabel} mb-2`}>Homepage types</p>
          <button
            type="button"
            className={navBtn(pageKey === "week")}
            onClick={() => setPageKey("week")}
          >
            <span className="block truncate">Scheduled week</span>
            {liveBadge(homepagePin, "week", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live on /
              </span>
            ) : (
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                {currentWeek?.themeTitle ?? "No week"}
              </span>
            )}
          </button>
          <button
            type="button"
            className={navBtn(pageKey === "tpl:simple")}
            onClick={() => setPageKey("tpl:simple")}
          >
            <span className="block truncate">Simple Contemplation</span>
            {liveBadge(homepagePin, "tpl:simple", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live on /
              </span>
            ) : (
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                Template
              </span>
            )}
          </button>
          <button
            type="button"
            className={navBtn(pageKey === "tpl:full")}
            onClick={() => setPageKey("tpl:full")}
          >
            <span className="block truncate">Full Description</span>
            {liveBadge(homepagePin, "tpl:full", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live on /
              </span>
            ) : (
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                Template
              </span>
            )}
          </button>

          <p className={`${fieldLabel} mb-2 mt-8`}>Notes</p>
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              className={navBtn(pageKey === `n:${n.id}`)}
              onClick={() => setPageKey(`n:${n.id}`)}
            >
              <span className="block truncate">{n.title || "Untitled"}</span>
              <span className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                {!n.published ? <span>Draft</span> : null}
                {n.published ? <span>On /notes</span> : null}
                {liveBadge(homepagePin, `n:${n.id}`, notes) ? (
                  <span className="text-[var(--thusness-red,#c23a2a)]">Live on /</span>
                ) : null}
              </span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-6">
          {pageKey === "week" ? (
            <div className="space-y-4">
              <p className={fieldLabel}>Scheduled week</p>
              <p className="text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
                {currentWeek ? (
                  <>
                    <span className="font-medium text-[var(--thusness-ink)]">
                      {currentWeek.themeTitle}
                    </span>
                    <span className="text-[var(--thusness-muted)]"> · </span>
                    {currentWeek.question}
                  </>
                ) : (
                  "No week rows yet. Add one in Weeks above."
                )}
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--thusness-muted)]">
                The TipTap body for this week is edited in the{" "}
                <span className="italic">Weeks</span> section at the top of this page.
              </p>
              <button
                type="button"
                disabled={isPending || homepagePin.source === "week"}
                className={btnPrimary}
                onClick={() => {
                  startTransition(async () => {
                    const res = await clearHomepagePinToWeek();
                    if (!res.ok) onMessage(res.message);
                    else {
                      onMessage("Homepage now uses the scheduled week.");
                      router.refresh();
                    }
                  });
                }}
              >
                Use scheduled week for homepage
              </button>
              {homepagePin.source === "week" ? (
                <p className="text-sm italic text-[var(--thusness-ink-soft)]">
                  This week is already what visitors see at /.
                </p>
              ) : null}
            </div>
          ) : null}

          {pageKey === "tpl:simple" ? (
            <div className="space-y-4">
              <p className={fieldLabel}>Simple Contemplation</p>
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

          {pageKey === "tpl:full" ? (
            <div className="space-y-4">
              <p className={fieldLabel}>Full Description</p>
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

          {parseNoteId(pageKey) && selectedForEditor ? (
            <NoteEditorPanel
              key={selectedForEditor.id}
              note={selectedForEditor}
              homepagePin={homepagePin}
              noteBodyRef={noteBodyRef}
              isPending={isPending}
              startTransition={startTransition}
              router={router}
              onMessage={onMessage}
              onNoteBodySaved={onNoteBodySaved}
            />
          ) : parseNoteId(pageKey) ? (
            <p className="text-sm text-[var(--thusness-muted)]">
              This note is not available. Choose another row.
            </p>
          ) : null}

          {(pageKey === "tpl:simple" || pageKey === "tpl:full") ? (
            <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-8">
              <p className={fieldLabel}>Template actions</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  className={btnPrimary}
                  onClick={() => {
                    const template =
                      pageKey === "tpl:simple"
                        ? ("simple_contemplation" as const)
                        : ("full_description" as const);
                    const fields = template === "simple_contemplation" ? simple : full;
                    startTransition(async () => {
                      const res = await saveHomepageSiteTemplate(template, fields);
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage("Homepage saved (live on /).");
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
                    const template =
                      pageKey === "tpl:simple"
                        ? ("simple_contemplation" as const)
                        : ("full_description" as const);
                    const fields = template === "simple_contemplation" ? simple : full;
                    startTransition(async () => {
                      const res = await createDraftNoteFromHomepageTemplate({
                        template,
                        fields,
                      });
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage(
                          `Draft note created (${res.slug}). Open it in the list.`
                        );
                        setPageKey(`n:${res.id}`);
                        router.refresh();
                      }
                    });
                  }}
                >
                  Save to notes
                </button>
                <button
                  type="button"
                  disabled={isPending || !templateLive}
                  title={
                    !templateLive
                      ? "This template is not live on /. Save first to make it live."
                      : undefined
                  }
                  className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] italic transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Remove this template from the homepage? Visitors will see the scheduled week until you pick something else."
                      )
                    ) {
                      return;
                    }
                    startTransition(async () => {
                      const res = await clearHomepagePinToWeek();
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage("Template removed from homepage.");
                        setPageKey("week");
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
                writes these fields and sets this layout as the live site root.{" "}
                <span className="font-medium text-[var(--thusness-ink)]">
                  Save to notes
                </span>{" "}
                copies into a new draft for TipTap.{" "}
                <span className="font-medium text-[var(--thusness-ink)]">Delete</span>{" "}
                only applies when this template is currently live.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
