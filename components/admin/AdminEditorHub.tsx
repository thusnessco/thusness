"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import { createDraftNoteFromHomepageTemplate } from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { NoteRow } from "@/lib/supabase/public-server";
import type {
  FullDescriptionFields,
  SimpleContemplationFields,
} from "@/lib/homepage/site-templates";
import {
  DEFAULT_FULL_FIELDS,
  DEFAULT_SIMPLE_FIELDS,
} from "@/lib/homepage/site-templates";

import { adminBtnSmall, adminNavBtn } from "./admin-ui";
import { FullLayoutForm } from "./FullLayoutForm";
import {
  isLiveAtRoot,
  type ContentKey,
  parseNoteId,
} from "./homepage-helpers";
import { NoteEditorPanel } from "./NoteEditorPanel";
import { RootStatusStrip } from "./RootStatusStrip";
import { SimpleLayoutForm } from "./SimpleLayoutForm";
import { SwitchRootToNote } from "./SwitchRootToNote";
import type { TiptapEditorFieldHandle } from "./TiptapEditorField";

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
                    setContentKey(`n:${res.id}`);
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
                    setContentKey(`n:${res.id}`);
                    router.refresh();
                  }
                });
              }}
            >
              New from Full
            </button>
          </div>
          <p className="mb-3 text-[10px] leading-snug text-[var(--thusness-muted)]">
            From Simple/Full uses the same field values as those layout tabs.
          </p>
          {notes.map((n) => (
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
                {isLiveAtRoot(homepagePin, `n:${n.id}`, notes) ? (
                  <span className="text-[var(--thusness-red,#c23a2a)]">/</span>
                ) : null}
              </span>
            </button>
          ))}

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
        </nav>

        <div className="min-w-0 space-y-6">
          <RootStatusStrip homepagePin={homepagePin} notes={notes} />

          {contentKey === "tpl:simple" || contentKey === "tpl:full" ? (
            <SwitchRootToNote
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
              onDraftNoteCreated={(id) => setContentKey(`n:${id}`)}
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
              onDraftNoteCreated={(id) => setContentKey(`n:${id}`)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
