"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import {
  createDraftNoteFromHomepageTemplate,
  resetHomepagePinToDefaultLayout,
  saveHomepageSiteTemplate,
  setHomepagePinToNoteSlug,
} from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
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

export type ContentKey = `n:${string}` | "tpl:simple" | "tpl:full";

export function parseNoteId(pk: ContentKey): string | null {
  return pk.startsWith("n:") ? pk.slice(2) : null;
}

export function initialContentKey(
  pin: HomepagePin,
  notes: NoteRow[]
): ContentKey {
  if (pin.source === "site_template") {
    return pin.template === "simple_contemplation" ? "tpl:simple" : "tpl:full";
  }
  if (pin.source === "note") {
    const n = notes.find((x) => x.slug === pin.slug);
    if (n) return `n:${n.id}`;
  }
  return notes[0] ? `n:${notes[0].id}` : "tpl:simple";
}

function liveOnHome(hp: HomepagePin, key: ContentKey, notes: NoteRow[]): boolean {
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
  notes: NoteRow[];
  homepagePin: HomepagePin;
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
  notes,
  homepagePin,
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

  const tplHomepageChecked =
    (contentKey === "tpl:simple" || contentKey === "tpl:full") && templateLive;

  const postTypeBtn = (active: boolean) =>
    `border px-3 py-1.5 text-xs tracking-wide transition-colors ${
      active
        ? "border-[var(--thusness-ink)] text-[var(--thusness-ink)]"
        : "border-[var(--thusness-rule)] text-[var(--thusness-muted)] hover:border-[var(--thusness-ink)] hover:text-[var(--thusness-ink)]"
    }`;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
            Site content
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-ink-soft)]">
            Notes and homepage layouts in one place. Use{" "}
            <span className="italic">Homepage</span> for the site root,{" "}
            <span className="italic">Notes</span> and{" "}
            <span className="italic">Published</span> for{" "}
            <span className="italic">/notes</span>, and the type buttons to jump between
            Simple, Full, and Custom (TipTap) editing.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <nav
          aria-label="Notes and homepage"
          className="space-y-1 border-b border-[var(--thusness-rule)] pb-8 lg:border-b-0 lg:border-r lg:border-[var(--thusness-rule)] lg:pb-0 lg:pr-8"
        >
          <p className={`${fieldLabel} mb-2`}>Notes</p>
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
                    : contentKey === "tpl:simple" || contentKey === "tpl:full"
                      ? tplHomepageChecked
                      : false
                }
                disabled={
                  isPending ||
                  (Boolean(selectedNoteForEditor) &&
                    !notePublished &&
                    !noteHomepageChecked)
                }
                title={
                  selectedNoteForEditor &&
                  !notePublished &&
                  !noteHomepageChecked
                    ? "Publish this note (Notes · Published) and save before pinning to /."
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
                        const res = await resetHomepagePinToDefaultLayout();
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage reset to the default Simple layout.");
                          setContentKey("tpl:simple");
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
                        const res = await resetHomepagePinToDefaultLayout();
                        if (!res.ok) onMessage(res.message);
                        else {
                          onMessage("Homepage reset to the default Simple layout.");
                          setContentKey("tpl:simple");
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
                  When checked, visitors see this note or layout at the site root (/).
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  className={postTypeBtn(contentKey === "tpl:simple")}
                  onClick={() => setContentKey("tpl:simple")}
                >
                  Simple
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className={postTypeBtn(contentKey === "tpl:full")}
                  onClick={() => setContentKey("tpl:full")}
                >
                  Full
                </button>
                <button
                  type="button"
                  disabled={isPending || notes.length === 0}
                  className={postTypeBtn(parseNoteId(contentKey) != null)}
                  onClick={() => {
                    const id = parseNoteId(contentKey);
                    if (id) return;
                    const first = notes[0];
                    if (first) setContentKey(`n:${first.id}`);
                    else onMessage("Create a note first.");
                  }}
                >
                  Custom
                </button>
              </div>
              <p className={checkHint}>
                Simple and Full edit the structured homepage layouts. Custom is the
                TipTap note editor. These buttons switch what you are editing.
              </p>
            </div>
          </fieldset>

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
                        "Remove this layout from the homepage? The site will fall back to the default Simple layout until you pin something else."
                      )
                    ) {
                      return;
                    }
                    startTransition(async () => {
                      const res = await resetHomepagePinToDefaultLayout();
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage("Homepage reset to the default Simple layout.");
                        setContentKey("tpl:simple");
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
