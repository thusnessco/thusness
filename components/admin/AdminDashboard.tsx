"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";

import { createNote, signOut } from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { WeekDocument } from "@/lib/data/weeks-types";
import type { NoteRow } from "@/lib/supabase/public-server";

import { jsonContentEqual } from "@/lib/tiptap/json-content-equal";

import type { TiptapEditorFieldHandle } from "./TiptapEditorField";
import { WeeksPanel } from "./WeeksPanel";
import {
  UnifiedPagesEditor,
  initialPageKey,
  parseNoteId,
  type PageKey,
} from "./UnifiedPagesEditor";

type Props = {
  weeks: WeekDocument[];
  notes: NoteRow[];
  homepagePin: HomepagePin;
  currentWeek: WeekDocument | null;
};

type NoteBodyOverride = { doc: JSONContent; key: string };

export function AdminDashboard({
  weeks,
  notes,
  homepagePin,
  currentWeek,
}: Props) {
  const router = useRouter();
  const [pageKey, setPageKey] = useState<PageKey>(() =>
    initialPageKey(homepagePin, notes)
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [noteBodyOverrides, setNoteBodyOverrides] = useState<
    Record<string, NoteBodyOverride>
  >({});

  const selectedNoteId = useMemo(() => parseNoteId(pageKey), [pageKey]);

  useEffect(() => {
    if (!selectedNoteId) return;
    setNoteBodyOverrides((prev) => {
      const o = prev[selectedNoteId];
      if (!o) return prev;
      const srv = notes.find((n) => n.id === selectedNoteId);
      if (!srv || o.key !== srv.updated_at) return prev;
      if (!jsonContentEqual(o.doc, srv.content_json)) return prev;
      const next = { ...prev };
      delete next[selectedNoteId];
      return next;
    });
  }, [notes, selectedNoteId]);

  useEffect(() => {
    const id = parseNoteId(pageKey);
    if (!id) return;
    if (!notes.some((n) => n.id === id)) {
      setPageKey(initialPageKey(homepagePin, notes));
    }
  }, [notes, pageKey, homepagePin]);

  const noteBodyRef = useRef<TiptapEditorFieldHandle>(null);

  const selected = useMemo(
    () =>
      selectedNoteId
        ? (notes.find((n) => n.id === selectedNoteId) ?? null)
        : null,
    [notes, selectedNoteId]
  );

  const selectedForEditor = useMemo(() => {
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
            Weeks use the same TipTap setup as the public site. The root URL
            (/) follows the scheduled week unless you pin a note or homepage
            template in <span className="italic">Pages &amp; notes</span>{" "}
            below.
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

      <div className="space-y-20">
        <WeeksPanel weeks={weeks} onMessage={flash} />

        <UnifiedPagesEditor
          notes={notes}
          homepagePin={homepagePin}
          currentWeek={currentWeek}
          pageKey={pageKey}
          setPageKey={setPageKey}
          onMessage={flash}
          onNewNote={() => {
            startTransition(async () => {
              const res = await createNote();
              if (!res.ok) flash(res.message);
              else {
                flash("Draft note created.");
                setPageKey(`n:${res.id}`);
                router.refresh();
              }
            });
          }}
          noteBodyRef={noteBodyRef}
          selectedForEditor={selectedForEditor}
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
    </div>
  );
}
