"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";

import { createNote, signOut } from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { SinkInConfigV1 } from "@/lib/sinkin/config";
import type { NoteRow } from "@/lib/supabase/public-server";

import { jsonContentEqual } from "@/lib/tiptap/json-content-equal";

import type { TiptapEditorFieldHandle } from "./TiptapEditorField";
import { AdminEditorHub } from "./AdminEditorHub";
import {
  initialContentKey,
  parseNoteId,
  type ContentKey,
} from "./homepage-helpers";

type Props = {
  notes: NoteRow[];
  homepagePin: HomepagePin;
  sinkInConfig: SinkInConfigV1;
  sinkInUpdatedAt: string | null;
  orientNavVisible: boolean;
};

type NoteBodyOverride = { doc: JSONContent; key: string };

export function AdminDashboard({
  notes,
  homepagePin,
  sinkInConfig,
  sinkInUpdatedAt,
  orientNavVisible,
}: Props) {
  const router = useRouter();
  const [contentKey, setContentKey] = useState<ContentKey>(() =>
    initialContentKey(homepagePin, notes)
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [noteBodyOverrides, setNoteBodyOverrides] = useState<
    Record<string, NoteBodyOverride>
  >({});
  /** Row returned from create actions before the next RSC refresh includes it in `notes`. */
  const [pendingNote, setPendingNote] = useState<NoteRow | null>(null);

  const notesMerged = useMemo(() => {
    if (pendingNote && !notes.some((n) => n.id === pendingNote.id)) {
      return [pendingNote, ...notes];
    }
    return notes;
  }, [notes, pendingNote]);

  const onCreatedNoteAwaitingRefresh = useCallback((note: NoteRow) => {
    setPendingNote(note);
    setContentKey(`n:${note.id}`);
  }, []);

  const selectedNoteId = useMemo(() => parseNoteId(contentKey), [contentKey]);

  useEffect(() => {
    if (!pendingNote) return;
    if (notes.some((n) => n.id === pendingNote.id)) {
      setPendingNote(null);
    }
  }, [notes, pendingNote]);

  useEffect(() => {
    if (!selectedNoteId) return;
    setNoteBodyOverrides((prev) => {
      const o = prev[selectedNoteId];
      if (!o) return prev;
      const srv = notesMerged.find((n) => n.id === selectedNoteId);
      if (!srv || o.key !== srv.updated_at) return prev;
      if (!jsonContentEqual(o.doc, srv.content_json)) return prev;
      const next = { ...prev };
      delete next[selectedNoteId];
      return next;
    });
  }, [notesMerged, selectedNoteId]);

  useEffect(() => {
    const id = parseNoteId(contentKey);
    if (!id) return;
    if (notes.some((n) => n.id === id)) return;
    if (pendingNote?.id === id) return;
    setContentKey(initialContentKey(homepagePin, notes));
    setPendingNote(null);
  }, [notes, contentKey, homepagePin, pendingNote]);

  const editorRef = useRef<TiptapEditorFieldHandle>(null);

  const selected = useMemo(
    () =>
      selectedNoteId
        ? (notesMerged.find((n) => n.id === selectedNoteId) ?? null)
        : null,
    [notesMerged, selectedNoteId]
  );

  const selectedNoteForEditor = useMemo(() => {
    if (!selected) return null;
    const o = noteBodyOverrides[selected.id];
    if (!o) return selected;
    return { ...selected, content_json: o.doc, updated_at: o.key };
  }, [selected, noteBodyOverrides]);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3200);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <header className="mb-16 flex flex-col gap-6 border-b border-[var(--thusness-rule)] pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[var(--thusness-ink)] md:text-3xl">
            Admin
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
            One place for notes, the site root, and the two built-in layouts. What
            visitors see at <span className="italic">/</span> is summarized at the top
            of the editor.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs uppercase tracking-[2px] text-[var(--thusness-muted)] underline decoration-[var(--thusness-ink)] decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
          >
            Sign out
          </button>
        </form>
      </header>

      {message ? (
        <p className="mb-8 text-sm text-[var(--thusness-ink-soft)]" role="status">
          {message}
        </p>
      ) : null}

      <AdminEditorHub
        notes={notesMerged}
        homepagePin={homepagePin}
        sinkInConfig={sinkInConfig}
        sinkInUpdatedAt={sinkInUpdatedAt}
        orientNavVisible={orientNavVisible}
        contentKey={contentKey}
        setContentKey={setContentKey}
        onMessage={flash}
        onCreatedNoteAwaitingRefresh={onCreatedNoteAwaitingRefresh}
        onNewNote={() => {
          startTransition(async () => {
            const res = await createNote();
            if (!res.ok) flash(res.message);
            else {
              flash("Blank draft note created.");
              onCreatedNoteAwaitingRefresh(res.note);
              router.refresh();
            }
          });
        }}
        editorRef={editorRef}
        selectedNoteForEditor={selectedNoteForEditor}
        isPending={isPending}
        startTransition={startTransition}
        onNoteBodySaved={(id, doc, updatedAt) => {
          setNoteBodyOverrides((p) => ({
            ...p,
            [id]: { doc, key: updatedAt },
          }));
        }}
      />
    </div>
  );
}
