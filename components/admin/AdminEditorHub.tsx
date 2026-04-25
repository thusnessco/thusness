"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import {
  clearHomepagePinToWeek,
  createDraftNoteFromHomepageTemplate,
  createWeek,
  deleteWeek,
  saveHomepageSiteTemplate,
  saveWeek,
  setHomepagePinToNoteSlug,
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

import {
  TiptapEditorField,
  type TiptapEditorFieldHandle,
} from "./TiptapEditorField";
import { NoteEditorPanel } from "./NoteEditorPanel";

export type ContentKey = `w:${string}` | `n:${string}` | "tpl:simple" | "tpl:full";

export function parseNoteId(pk: ContentKey): string | null {
  return pk.startsWith("n:") ? pk.slice(2) : null;
}

export function parseWeekId(pk: ContentKey): string | null {
  return pk.startsWith("w:") ? pk.slice(2) : null;
}

export function initialContentKey(
  pin: HomepagePin,
  notes: NoteRow[],
  currentWeek: WeekDocument | null,
  weeks: WeekDocument[]
): ContentKey {
  if (pin.source === "week") {
    if (currentWeek?.id) return `w:${currentWeek.id}`;
    if (weeks[0]?.id) return `w:${weeks[0].id}`;
    if (notes[0]) return `n:${notes[0].id}`;
    return "tpl:simple";
  }
  if (pin.source === "site_template") {
    return pin.template === "simple_contemplation" ? "tpl:simple" : "tpl:full";
  }
  const n = notes.find((x) => x.slug === pin.slug);
  if (n) return `n:${n.id}`;
  if (notes[0]) return `n:${notes[0].id}`;
  if (currentWeek?.id) return `w:${currentWeek.id}`;
  if (weeks[0]?.id) return `w:${weeks[0].id}`;
  return "tpl:simple";
}

function liveOnHome(hp: HomepagePin, key: ContentKey, notes: NoteRow[]): boolean {
  const wid = parseWeekId(key);
  if (wid) return hp.source === "week";
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
const checkRow =
  "flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]";
const checkHint = "text-[10px] leading-relaxed text-[var(--thusness-muted)]";

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
  weeks: WeekDocument[];
  notes: NoteRow[];
  homepagePin: HomepagePin;
  currentWeek: WeekDocument | null;
  contentKey: ContentKey;
  setContentKey: (k: ContentKey) => void;
  onMessage: (msg: string) => void;
  onNewNote: () => void;
  editorRef: RefObject<TiptapEditorFieldHandle | null>;
  selectedNoteForEditor: NoteRow | null;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onNoteBodySaved?: (
    id: string,
    doc: JSONContent,
    updatedAt: string
  ) => void;
};

export function AdminEditorHub({
  weeks,
  notes,
  homepagePin,
  currentWeek,
  contentKey,
  setContentKey,
  onMessage,
  onNewNote,
  editorRef,
  selectedNoteForEditor,
  isPending,
  startTransition,
  onNoteBodySaved,
}: Props) {
  const router = useRouter();
  const [simple, setSimple] = useState<SimpleContemplationFields>(
    DEFAULT_SIMPLE_FIELDS
  );
  const [full, setFull] = useState<FullDescriptionFields>(DEFAULT_FULL_FIELDS);

  const selectedWeekId = parseWeekId(contentKey);
  const selectedWeek = useMemo(
    () => (selectedWeekId ? weeks.find((w) => w.id === selectedWeekId) ?? null : null),
    [weeks, selectedWeekId]
  );

  const [weekDraft, setWeekDraft] = useState({
    slug: "",
    weekOf: "",
    themeTitle: "",
    question: "",
  });
  const previousSlugRef = useRef("");

  useEffect(() => {
    if (!selectedWeek) {
      setWeekDraft({ slug: "", weekOf: "", themeTitle: "", question: "" });
      previousSlugRef.current = "";
      return;
    }
    setWeekDraft({
      slug: selectedWeek.slug,
      weekOf: selectedWeek.weekOf,
      themeTitle: selectedWeek.themeTitle,
      question: selectedWeek.question,
    });
    previousSlugRef.current = selectedWeek.slug;
  }, [selectedWeek?.id, selectedWeek?.updatedAt]);

  const [notePublished, setNotePublished] = useState(false);
  useEffect(() => {
    if (selectedNoteForEditor) setNotePublished(selectedNoteForEditor.published);
  }, [selectedNoteForEditor?.id, selectedNoteForEditor?.published]);

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

  const isCurrentWeekRow =
    Boolean(selectedWeek && currentWeek && selectedWeek.id === currentWeek.id);

  const templateLive =
    homepagePin.source === "site_template" &&
    ((contentKey === "tpl:simple" &&
      homepagePin.template === "simple_contemplation") ||
      (contentKey === "tpl:full" &&
        homepagePin.template === "full_description"));

  const noteHomepageChecked =
    selectedNoteForEditor &&
    homepagePin.source === "note" &&
    homepagePin.slug === selectedNoteForEditor.slug;

  const weekHomepageChecked =
    selectedWeek && homepagePin.source === "week" && isCurrentWeekRow;

  const tplHomepageChecked =
    (contentKey === "tpl:simple" || contentKey === "tpl:full") && templateLive;

  function firstWeekKey(): ContentKey {
    return weeks[0]?.id ? `w:${weeks[0].id}` : "tpl:simple";
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
            Site content
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-ink-soft)]">
            One editor for weeks, notes, and homepage layouts. Use{" "}
            <span className="italic">Homepage</span> for the site root,{" "}
            <span className="italic">Notes</span> and{" "}
            <span className="italic">Published</span> for the public{" "}
            <span className="italic">/notes</span> index (drafts off), and{" "}
            <span className="italic">Simple / Full / Custom</span> for structured
            layouts vs TipTap blocks.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <nav
          aria-label="Weeks, notes, and homepage"
          className="space-y-1 border-b border-[var(--thusness-rule)] pb-8 lg:border-b-0 lg:border-r lg:border-[var(--thusness-rule)] lg:pb-0 lg:pr-8"
        >
          <div className="mb-4 flex flex-col gap-2">
            <p className={fieldLabel}>Weeks</p>
            <button
              type="button"
              disabled={isPending}
              className={btnSmall}
              onClick={() => {
                startTransition(async () => {
                  const res = await createWeek();
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage("New week created.");
                    setContentKey(`w:${res.id}`);
                    router.refresh();
                  }
                });
              }}
            >
              New week
            </button>
          </div>
          {weeks.map((w) => (
            <button
              key={w.id}
              type="button"
              className={navBtn(contentKey === `w:${w.id}`)}
              onClick={() => setContentKey(`w:${w.id}`)}
            >
              <span className="block truncate font-medium">
                {w.themeTitle || w.slug}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                {w.weekOf}
                {currentWeek?.id === w.id ? (
                  <span className="text-[var(--thusness-ink)]"> · Scheduled</span>
                ) : null}
              </span>
              {liveOnHome(homepagePin, `w:${w.id}`, notes) ? (
                <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                  Live on /
                </span>
              ) : null}
            </button>
          ))}

          <p className={`${fieldLabel} mb-2 mt-8`}>Notes</p>
          <button
            type="button"
            disabled={isPending}
            onClick={onNewNote}
            className={`${btnSmall} mb-2 w-full`}
          >
            New note
          </button>
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              className={navBtn(contentKey === `n:${n.id}`)}
              onClick={() => setContentKey(`n:${n.id}`)}
            >
              <span className="block truncate">{n.title || "Untitled"}</span>
              <span className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                {!n.published ? <span>Draft</span> : null}
                {n.published ? <span>On /notes</span> : null}
                {liveOnHome(homepagePin, `n:${n.id}`, notes) ? (
                  <span className="text-[var(--thusness-red,#c23a2a)]">Live on /</span>
                ) : null}
              </span>
            </button>
          ))}

          <p className={`${fieldLabel} mb-2 mt-8`}>Homepage layouts</p>
          <button
            type="button"
            className={navBtn(contentKey === "tpl:simple")}
            onClick={() => setContentKey("tpl:simple")}
          >
            <span className="block truncate">Simple</span>
            {liveOnHome(homepagePin, "tpl:simple", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live on /
              </span>
            ) : (
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                Structured
              </span>
            )}
          </button>
          <button
            type="button"
            className={navBtn(contentKey === "tpl:full")}
            onClick={() => setContentKey("tpl:full")}
          >
            <span className="block truncate">Full</span>
            {liveOnHome(homepagePin, "tpl:full", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live on /
              </span>
            ) : (
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                Structured
              </span>
            )}
          </button>
        </nav>

        <div className="min-w-0 space-y-6">
          <fieldset className="space-y-4 border border-[var(--thusness-rule)] px-4 py-4">
            <legend className={`px-1 ${fieldLabel}`}>Placement &amp; type</legend>

            <label className={checkRow}>
              <input
                type="checkbox"
                className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
                checked={
                  selectedNoteForEditor
                    ? Boolean(noteHomepageChecked)
                    : selectedWeek
                      ? Boolean(weekHomepageChecked)
                      : contentKey === "tpl:simple" || contentKey === "tpl:full"
                        ? tplHomepageChecked
                        : false
                }
                disabled={
                  isPending ||
                  (Boolean(selectedWeek) &&
                    (!isCurrentWeekRow ||
                      (homepagePin.source === "week" && isCurrentWeekRow)))
                }
                title={
                  selectedWeek && !isCurrentWeekRow
                    ? "Only the scheduled (current) week can take over / this way."
                    : homepagePin.source === "week" && isCurrentWeekRow
                      ? "Homepage already follows the schedule. Pin a note or template to change it, or use another row."
                      : undefined
                }
                onChange={(e) => {
                  const on = e.target.checked;
                  if (selectedNoteForEditor) {
                    if (on) {
                      startTransition(async () => {
                        const res = await setHomepagePinToNoteSlug(
                          selectedNoteForEditor.slug
                        );
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage now uses this note.");
                          router.refresh();
                        }
                      });
                    } else if (noteHomepageChecked) {
                      startTransition(async () => {
                        const res = await clearHomepagePinToWeek();
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage now uses the scheduled week.");
                          router.refresh();
                        }
                      });
                    }
                    return;
                  }
                  if (selectedWeek && isCurrentWeekRow) {
                    if (on && homepagePin.source !== "week") {
                      startTransition(async () => {
                        const res = await clearHomepagePinToWeek();
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage now uses the scheduled week.");
                          router.refresh();
                        }
                      });
                    }
                    return;
                  }
                  if (contentKey === "tpl:simple" || contentKey === "tpl:full") {
                    if (on) {
                      const template =
                        contentKey === "tpl:simple"
                          ? ("simple_contemplation" as const)
                          : ("full_description" as const);
                      const fields =
                        template === "simple_contemplation" ? simple : full;
                      startTransition(async () => {
                        const res = await saveHomepageSiteTemplate(template, fields);
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage saved (this layout is live on /).");
                          router.refresh();
                        }
                      });
                    } else if (tplHomepageChecked) {
                      startTransition(async () => {
                        const res = await clearHomepagePinToWeek();
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage now uses the scheduled week.");
                          setContentKey(
                            currentWeek?.id
                              ? `w:${currentWeek.id}`
                              : firstWeekKey()
                          );
                          router.refresh();
                        }
                      });
                    }
                  }
                }}
              />
              <span>
                <span className="font-medium text-[var(--thusness-ink)]">Homepage</span>
                <span className={`mt-1 block ${checkHint}`}>
                  When checked, visitors see this row at the site root (/) where the
                  product allows it.
                </span>
              </span>
            </label>

            <label
              className={`${checkRow} ${
                !selectedNoteForEditor ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
                checked={selectedNoteForEditor ? notePublished : false}
                disabled={isPending || !selectedNoteForEditor}
                onChange={(e) => setNotePublished(e.target.checked)}
              />
              <span>
                <span className="font-medium text-[var(--thusness-ink)]">Notes</span>
                <span className={`mt-1 block ${checkHint}`}>
                  TipTap notes: show this post on the public{" "}
                  <code className="text-[var(--thusness-ink-soft)]">/notes</code> index.
                  Save the note to apply.
                </span>
              </span>
            </label>

            <label
              className={`${checkRow} ${
                !selectedNoteForEditor ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
                checked={selectedNoteForEditor ? notePublished : false}
                disabled={isPending || !selectedNoteForEditor}
                onChange={(e) => setNotePublished(e.target.checked)}
              />
              <span>
                <span className="font-medium text-[var(--thusness-ink)]">
                  Published
                </span>
                <span className={`mt-1 block ${checkHint}`}>
                  Drafts stay unchecked. Matches <span className="italic">Notes</span>{" "}
                  above until the product supports splitting them.
                </span>
              </span>
            </label>

            <div className="space-y-2">
              <span className={fieldLabel}>Post type</span>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--thusness-ink-soft)]">
                {(["simple", "full", "custom"] as const).map((t) => {
                  const active =
                    (t === "simple" && contentKey === "tpl:simple") ||
                    (t === "full" && contentKey === "tpl:full") ||
                    (t === "custom" &&
                      (Boolean(selectedWeek) || Boolean(selectedNoteForEditor)));
                  const disabled =
                    isPending ||
                    (t === "simple" && contentKey !== "tpl:simple") ||
                    (t === "full" && contentKey !== "tpl:full") ||
                    (t === "custom" &&
                      (contentKey === "tpl:simple" || contentKey === "tpl:full"));
                  return (
                    <label
                      key={t}
                      className={`flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}
                    >
                      <input
                        type="radio"
                        name="post-type"
                        checked={active}
                        disabled={disabled}
                        className="accent-[var(--thusness-ink)]"
                      />
                      {t === "simple"
                        ? "Simple"
                        : t === "full"
                          ? "Full"
                          : "Custom"}
                    </label>
                  );
                })}
              </div>
              <p className={checkHint}>
                Simple and Full are the structured homepage layouts. Custom is this
                TipTap document (weeks and notes). Switch type by choosing a row in the
                list.
              </p>
            </div>
          </fieldset>

          {parseWeekId(contentKey) && !selectedWeek ? (
            <p className="text-sm text-[var(--thusness-muted)]">
              This week no longer exists. Choose another row.
            </p>
          ) : null}

          {selectedWeek ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Slug (URL)</span>
                  <input
                    value={weekDraft.slug}
                    onChange={(e) =>
                      setWeekDraft((d) => ({ ...d, slug: e.target.value }))
                    }
                    className={fieldInput}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Week of</span>
                  <input
                    type="date"
                    value={weekDraft.weekOf}
                    onChange={(e) =>
                      setWeekDraft((d) => ({ ...d, weekOf: e.target.value }))
                    }
                    className={fieldInput}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Theme title (archive list)</span>
                <input
                  value={weekDraft.themeTitle}
                  onChange={(e) =>
                    setWeekDraft((d) => ({ ...d, themeTitle: e.target.value }))
                  }
                  className={fieldInput}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Question (archive subtitle)</span>
                <input
                  value={weekDraft.question}
                  onChange={(e) =>
                    setWeekDraft((d) => ({ ...d, question: e.target.value }))
                  }
                  className={fieldInput}
                />
              </label>

              <TiptapEditorField
                key={selectedWeek.id}
                ref={editorRef}
                label="Page body (TipTap — Custom layout)"
                contentSyncKey={selectedWeek.updatedAt}
                initialDoc={selectedWeek.bodyJson}
                imageUploadScope={`week/${selectedWeek.id}`}
                onImageUploadMessage={onMessage}
                onEditorError={onMessage}
                onTemplateNotice={onMessage}
                variant="page"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  className={btnPrimary}
                  onClick={() => {
                    const json = editorRef.current?.getJSON();
                    if (!json) {
                      onMessage("Editor is not ready yet. Try Save again.");
                      return;
                    }
                    startTransition(async () => {
                      const res = await saveWeek({
                        id: selectedWeek.id,
                        slug: weekDraft.slug,
                        weekOf: weekDraft.weekOf,
                        themeTitle: weekDraft.themeTitle,
                        question: weekDraft.question,
                        bodyJson: structuredClone(json) as JSONContent,
                        previousSlug: previousSlugRef.current,
                      });
                      if (!res.ok) onMessage(res.message);
                      else {
                        previousSlugRef.current = weekDraft.slug.trim();
                        onMessage("Week saved.");
                        router.refresh();
                      }
                    });
                  }}
                >
                  Save week
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] italic transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Delete this week from the database? This cannot be undone."
                      )
                    ) {
                      return;
                    }
                    startTransition(async () => {
                      const res = await deleteWeek({
                        id: selectedWeek.id,
                        slug: selectedWeek.slug,
                      });
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage("Week deleted.");
                        const nextWeeks = weeks.filter((w) => w.id !== selectedWeek.id);
                        setContentKey(
                          initialContentKey(
                            homepagePin,
                            notes,
                            currentWeek,
                            nextWeeks
                          )
                        );
                        router.refresh();
                      }
                    });
                  }}
                >
                  Delete week
                </button>
              </div>
            </>
          ) : null}

          {parseNoteId(contentKey) && selectedNoteForEditor ? (
            <NoteEditorPanel
              key={selectedNoteForEditor.id}
              note={selectedNoteForEditor}
              homepagePin={homepagePin}
              noteBodyRef={editorRef}
              isPending={isPending}
              startTransition={startTransition}
              router={router}
              onMessage={onMessage}
              onNoteBodySaved={onNoteBodySaved}
              published={notePublished}
            />
          ) : parseNoteId(contentKey) ? (
            <p className="text-sm text-[var(--thusness-muted)]">
              This note is not available. Choose another row.
            </p>
          ) : null}

          {contentKey === "tpl:simple" ? (
            <div className="space-y-4">
              <p className={fieldLabel}>Simple layout fields</p>
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

          {contentKey === "tpl:full" ? (
            <div className="space-y-4">
              <p className={fieldLabel}>Full layout fields</p>
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

          {(contentKey === "tpl:simple" || contentKey === "tpl:full") && (
            <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-8">
              <p className={fieldLabel}>Layout actions</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  className={btnPrimary}
                  onClick={() => {
                    const template =
                      contentKey === "tpl:simple"
                        ? ("simple_contemplation" as const)
                        : ("full_description" as const);
                    const fields =
                      template === "simple_contemplation" ? simple : full;
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
                  Save layout
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className={btnSmall}
                  onClick={() => {
                    const template =
                      contentKey === "tpl:simple"
                        ? ("simple_contemplation" as const)
                        : ("full_description" as const);
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
                          `Draft note created (${res.slug}). Switched to that note.`
                        );
                        setContentKey(`n:${res.id}`);
                        router.refresh();
                      }
                    });
                  }}
                >
                  Copy to new note
                </button>
                <button
                  type="button"
                  disabled={isPending || !templateLive}
                  title={
                    !templateLive
                      ? "Save this layout as the live homepage first to enable remove."
                      : undefined
                  }
                  className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] italic transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Remove this layout from the homepage? Visitors will see the scheduled week until you pick something else."
                      )
                    ) {
                      return;
                    }
                    startTransition(async () => {
                      const res = await clearHomepagePinToWeek();
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage("Homepage now uses the scheduled week.");
                        setContentKey(
                          currentWeek?.id
                            ? `w:${currentWeek.id}`
                            : firstWeekKey()
                        );
                        router.refresh();
                      }
                    });
                  }}
                >
                  Remove from homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
