"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import {
  createDraftNoteFromHomepageTemplate,
  createNoteFromTemplate,
  saveOrientNavVisible,
} from "@/app/admin/actions";
import type { OrientContent } from "@/lib/orient-infographics/types";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import {
  NOTE_CATEGORIES,
  NOTE_CATEGORY_SHORT,
  parseNoteCategory,
  type NoteCategory,
} from "@/lib/notes/category";
import type { SinkInConfigV1 } from "@/lib/sinkin/config";
import type { NoteRow } from "@/lib/supabase/public-server";
import type {
  FullDescriptionFields,
  SimpleContemplationFields,
} from "@/lib/homepage/site-templates";
import {
  DEFAULT_FULL_FIELDS,
  DEFAULT_SIMPLE_FIELDS,
} from "@/lib/homepage/site-templates";

import {
  adminBtnSmall,
  adminFieldLabel,
  adminNavBtn,
  adminSegmentBtn,
} from "./admin-ui";
import { FullLayoutForm } from "./FullLayoutForm";
import {
  isLiveAtRoot,
  type ContentKey,
  parseNoteId,
} from "./homepage-helpers";
import { NoteEditorPanel } from "./NoteEditorPanel";
import { RootStatusStrip } from "./RootStatusStrip";
import { SimpleLayoutForm } from "./SimpleLayoutForm";
import { OrientInfographicsEditorPanel } from "./OrientInfographicsEditorPanel";
import { SinkInEditorPanel } from "./SinkInEditorPanel";
import { SwitchRootToNote } from "./SwitchRootToNote";
import type { TiptapEditorFieldHandle } from "./TiptapEditorField";

type AdminNoteListFilter = "all" | NoteCategory | "unsorted";

type Props = {
  notes: NoteRow[];
  homepagePin: HomepagePin;
  sinkInConfig: SinkInConfigV1;
  sinkInUpdatedAt: string | null;
  orientNavVisible: boolean;
  orientInfographics: OrientContent;
  orientInfographicsUpdatedAt: string | null;
  contentKey: ContentKey;
  setContentKey: (k: ContentKey) => void;
  onMessage: (msg: string) => void;
  onNewNote: () => void;
  /** Called with the row returned from the server so the UI can show the editor before RSC refresh lists the note. */
  onCreatedNoteAwaitingRefresh: (note: NoteRow) => void;
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
  sinkInConfig,
  sinkInUpdatedAt,
  orientNavVisible,
  orientInfographics,
  orientInfographicsUpdatedAt,
  contentKey,
  setContentKey,
  onMessage,
  onNewNote,
  onCreatedNoteAwaitingRefresh,
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
  const [showOrientLink, setShowOrientLink] = useState(orientNavVisible);
  const [templateSourceId, setTemplateSourceId] = useState("");
  const [noteListFilter, setNoteListFilter] =
    useState<AdminNoteListFilter>("all");

  const templateNotes = useMemo(
    () => notes.filter((n) => n.is_template === true),
    [notes]
  );

  const notesForNav = useMemo(() => {
    if (noteListFilter === "all") return notes;
    if (noteListFilter === "unsorted") {
      return notes.filter((n) => !parseNoteCategory(n.category));
    }
    return notes.filter(
      (n) => parseNoteCategory(n.category) === noteListFilter
    );
  }, [notes, noteListFilter]);

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

  useEffect(() => {
    setShowOrientLink(orientNavVisible);
  }, [orientNavVisible]);

  const editingNoteId = parseNoteId(contentKey);

  return (
    <section className="space-y-10">
      <header className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
          Content
        </h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-ink-soft)]">
          Notes and the site root share the same TipTap story when you pin a note to{" "}
          <span className="italic">/</span>. Built-in Simple and Full are alternate
          ways to fill <span className="italic">/</span> with structured fields.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <nav
          aria-label="Choose what to edit"
          className="space-y-1 border-b border-[var(--thusness-rule)] pb-8 lg:border-b-0 lg:border-r lg:border-[var(--thusness-rule)] lg:pb-0 lg:pr-8"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]">
            Notes
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={onNewNote}
            className={`${adminBtnSmall} mb-2 w-full`}
          >
            New blank note
          </button>
          <div className="mb-1 grid grid-cols-2 gap-2">
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
                    onMessage("Draft created from Simple layout fields.");
                    onCreatedNoteAwaitingRefresh(res.note);
                    router.refresh();
                  }
                });
              }}
            >
              New from Simple
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
                    onMessage("Draft created from Full layout fields.");
                    onCreatedNoteAwaitingRefresh(res.note);
                    router.refresh();
                  }
                });
              }}
            >
              New from Full
            </button>
          </div>
          <p className="mb-2 text-[10px] leading-snug text-[var(--thusness-muted)]">
            From Simple/Full uses the same field values as those layout tabs.
          </p>
          <p className="mb-3 text-[10px] leading-snug text-[var(--thusness-muted)]">
            A blank note is free-form TipTap — use{" "}
            <span className="text-[var(--thusness-ink-soft)]">+ Layout block…</span>{" "}
            or <span className="text-[var(--thusness-ink-soft)]">Sample page layout</span>{" "}
            in the body toolbar.
          </p>
          {templateNotes.length > 0 ? (
            <div className="mb-3 space-y-2">
              <label className="block space-y-1">
                <span className={adminFieldLabel}>New from your template</span>
                <select
                  className="w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-2 py-1.5 text-xs text-[var(--thusness-ink-soft)]"
                  value={templateSourceId}
                  disabled={isPending}
                  onChange={(e) => setTemplateSourceId(e.target.value)}
                >
                  <option value="">Choose template…</option>
                  {templateNotes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title?.trim() || t.slug || "Untitled"}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={isPending || !templateSourceId}
                className={adminBtnSmall}
                onClick={() => {
                  const id = templateSourceId;
                  if (!id) return;
                  startTransition(async () => {
                    const res = await createNoteFromTemplate({ sourceId: id });
                    if (!res.ok) onMessage(res.message);
                    else {
                      onMessage("Draft created from your template.");
                      setTemplateSourceId("");
                      onCreatedNoteAwaitingRefresh(res.note);
                      router.refresh();
                    }
                  });
                }}
              >
                Create draft from template
              </button>
            </div>
          ) : null}
          <div className="mb-2 space-y-1.5">
            <span className={adminFieldLabel}>View</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                disabled={isPending}
                className={adminSegmentBtn(noteListFilter === "all")}
                onClick={() => setNoteListFilter("all")}
              >
                All
              </button>
              {NOTE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isPending}
                  className={adminSegmentBtn(noteListFilter === c)}
                  onClick={() => setNoteListFilter(c)}
                >
                  {NOTE_CATEGORY_SHORT[c]}
                </button>
              ))}
              <button
                type="button"
                disabled={isPending}
                className={adminSegmentBtn(noteListFilter === "unsorted")}
                onClick={() => setNoteListFilter("unsorted")}
              >
                Unsorted
              </button>
            </div>
          </div>
          {notesForNav.map((n) => {
            const cat = parseNoteCategory(n.category);
            return (
              <button
                key={n.id}
                type="button"
                className={adminNavBtn(contentKey === `n:${n.id}`)}
                onClick={() => setContentKey(`n:${n.id}`)}
              >
                <span className="block truncate">{n.title || "Untitled"}</span>
                <span className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                  {!n.published ? <span>Draft</span> : null}
                  {n.published ? <span>/notes</span> : null}
                  {cat ? <span>{NOTE_CATEGORY_SHORT[cat]}</span> : null}
                  {n.is_template ? <span>Template</span> : null}
                  {isLiveAtRoot(homepagePin, `n:${n.id}`, notes) ? (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                      Live at /
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}

          <p className="mb-2 mt-8 text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]">
            Built-in layouts
          </p>
          <p className="mb-2 text-[10px] leading-snug text-[var(--thusness-muted)]">
            Structured fields for <span className="italic">/</span> only — not the
            TipTap note editor.
          </p>
          <button
            type="button"
            className={adminNavBtn(contentKey === "tpl:simple")}
            onClick={() => setContentKey("tpl:simple")}
          >
            <span className="block truncate">Simple</span>
            {isLiveAtRoot(homepagePin, "tpl:simple", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live at /
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className={adminNavBtn(contentKey === "tpl:full")}
            onClick={() => setContentKey("tpl:full")}
          >
            <span className="block truncate">Full</span>
            {isLiveAtRoot(homepagePin, "tpl:full", notes) ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-red,#c23a2a)]">
                Live at /
              </span>
            ) : null}
          </button>

          <p className="mb-2 mt-8 text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]">
            Hidden pages
          </p>
          <button
            type="button"
            className={adminNavBtn(contentKey === "sinkin")}
            onClick={() => setContentKey("sinkin")}
          >
            <span className="block truncate">Sink in</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
              /sinkin
            </span>
          </button>
          <button
            type="button"
            className={adminNavBtn(contentKey === "orient_graphics")}
            onClick={() => setContentKey("orient_graphics")}
          >
            <span className="block truncate">Orient graphics</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
              /orient diagrams
            </span>
          </button>
          <label className="mt-3 flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]">
            <input
              type="checkbox"
              className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
              checked={showOrientLink}
              disabled={isPending}
              onChange={(e) => {
                const next = e.target.checked;
                setShowOrientLink(next);
                startTransition(async () => {
                  const res = await saveOrientNavVisible(next);
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage(
                      next
                        ? "Orient is now visible in public nav + homepage."
                        : "Orient is now hidden from public nav + homepage."
                    );
                    router.refresh();
                  }
                });
              }}
            />
            <span>
              <span className="font-medium text-[var(--thusness-ink)]">
                Show Orient link
              </span>
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                Controls Orient in top navigation and the homepage top-right link.
              </span>
            </span>
          </label>
        </nav>

        <div className="min-w-0 space-y-6">
          <RootStatusStrip homepagePin={homepagePin} notes={notes} />

          {contentKey === "tpl:simple" || contentKey === "tpl:full" ? (
            <SwitchRootToNote
              homepagePin={homepagePin}
              notes={notes}
              isPending={isPending}
              startTransition={startTransition}
              onMessage={onMessage}
              setContentKey={setContentKey}
            />
          ) : null}

          {editingNoteId && selectedNoteForEditor ? (
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
            />
          ) : editingNoteId ? (
            <p className="text-sm text-[var(--thusness-muted)]">
              This note is not available. Choose another item in the list.
            </p>
          ) : null}

          {contentKey === "tpl:simple" ? (
            <SimpleLayoutForm
              simple={simple}
              setSimple={setSimple}
              isPending={isPending}
              startTransition={startTransition}
              onMessage={onMessage}
              isLiveAtRoot={isLiveAtRoot(homepagePin, "tpl:simple", notes)}
              onDraftNoteCreated={onCreatedNoteAwaitingRefresh}
            />
          ) : null}

          {contentKey === "tpl:full" ? (
            <FullLayoutForm
              full={full}
              setFull={setFull}
              isPending={isPending}
              startTransition={startTransition}
              onMessage={onMessage}
              isLiveAtRoot={isLiveAtRoot(homepagePin, "tpl:full", notes)}
              onDraftNoteCreated={onCreatedNoteAwaitingRefresh}
            />
          ) : null}

          {contentKey === "sinkin" ? (
            <SinkInEditorPanel
              key={sinkInUpdatedAt ?? "sinkin"}
              initialConfig={sinkInConfig}
              isPending={isPending}
              startTransition={startTransition}
              onMessage={onMessage}
            />
          ) : null}

          {contentKey === "orient_graphics" ? (
            <OrientInfographicsEditorPanel
              key={orientInfographicsUpdatedAt ?? "orient_graphics"}
              initialContent={orientInfographics}
              updatedAt={orientInfographicsUpdatedAt}
              isPending={isPending}
              startTransition={startTransition}
              onMessage={onMessage}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
