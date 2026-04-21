"use client";

import { useRef, useState, useTransition } from "react";
import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";

import {
  createNote,
  saveNote,
  saveSiteContent,
  signOut,
} from "@/app/admin/actions";
import type { NoteRow } from "@/lib/supabase/public-server";

import {
  TiptapEditorField,
  type TiptapEditorFieldHandle,
} from "./TiptapEditorField";

type Props = {
  homeIntro: JSONContent;
  weeklySessions: JSONContent;
  homeIntroKey: string;
  weeklySessionsKey: string;
  notes: NoteRow[];
};

function NoteEditorPanel({
  note,
  noteBodyRef,
  isPending,
  startTransition,
  router,
  onMessage,
}: {
  note: NoteRow;
  noteBodyRef: React.RefObject<TiptapEditorFieldHandle | null>;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  router: ReturnType<typeof useRouter>;
  onMessage: (msg: string) => void;
}) {
  const [slug, setSlug] = useState(note.slug);
  const [title, setTitle] = useState(note.title);
  const [excerpt, setExcerpt] = useState(note.excerpt ?? "");
  const [published, setPublished] = useState(note.published);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Slug (URL)
          </span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Excerpt (optional)
        </span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-gray-200 outline-none focus:border-white/30"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded border-white/30 bg-black"
        />
        Published
      </label>

      <TiptapEditorField
        ref={noteBodyRef}
        label="Body"
        initialDoc={note.content_json}
        imageUploadScope={`note/${note.id}`}
        onImageUploadMessage={onMessage}
      />

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const json = noteBodyRef.current?.getJSON();
            if (!json) return;
            const res = await saveNote({
              id: note.id,
              slug,
              title,
              excerpt: excerpt || null,
              content_json: json,
              published,
            });
            if (!res.ok) onMessage(res.message);
            else {
              onMessage("Note saved.");
              router.refresh();
            }
          });
        }}
        className="rounded-md border border-white/20 px-4 py-2 text-xs tracking-wide text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40"
      >
        Save note
      </button>
    </>
  );
}

export function AdminDashboard({
  homeIntro,
  weeklySessions,
  homeIntroKey,
  weeklySessionsKey,
  notes,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const introRef = useRef<TiptapEditorFieldHandle>(null);
  const weeklyRef = useRef<TiptapEditorFieldHandle>(null);
  const noteBodyRef = useRef<TiptapEditorFieldHandle>(null);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3200);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <header className="mb-16 flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-white md:text-3xl">
            Admin
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Homepage copy and notes. Nothing here is linked from the public site.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs tracking-[0.2em] uppercase text-gray-500 transition-colors hover:text-gray-300"
          >
            Sign out
          </button>
        </form>
      </header>

      {message ? (
        <p className="mb-8 text-sm text-gray-400" role="status">
          {message}
        </p>
      ) : null}

      <div className="space-y-20">
        <section className="space-y-8">
          <h2 className="text-xs tracking-[0.25em] uppercase text-gray-500">
            Homepage
          </h2>
          <TiptapEditorField
            key={homeIntroKey}
            ref={introRef}
            label="Current invitation (home_intro)"
            initialDoc={homeIntro}
            imageUploadScope="site/home_intro"
            onImageUploadMessage={flash}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const json = introRef.current?.getJSON();
                if (!json) return;
                const res = await saveSiteContent("home_intro", json);
                if (!res.ok) flash(res.message);
                else {
                  flash("Saved invitation.");
                  router.refresh();
                }
              });
            }}
            className="rounded-md border border-white/20 px-4 py-2 text-xs tracking-wide text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40"
          >
            Save invitation
          </button>

          <div className="border-t border-white/10 pt-10">
            <TiptapEditorField
              key={weeklySessionsKey}
              ref={weeklyRef}
              label="Weekly sessions (weekly_sessions)"
              initialDoc={weeklySessions}
              imageUploadScope="site/weekly_sessions"
              onImageUploadMessage={flash}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const json = weeklyRef.current?.getJSON();
                  if (!json) return;
                  const res = await saveSiteContent("weekly_sessions", json);
                  if (!res.ok) flash(res.message);
                  else {
                    flash("Saved weekly sessions.");
                    router.refresh();
                  }
                });
              }}
              className="mt-4 rounded-md border border-white/20 px-4 py-2 text-xs tracking-wide text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40"
            >
              Save weekly sessions
            </button>
          </div>
        </section>

        <section className="space-y-6 border-t border-white/10 pt-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-xs tracking-[0.25em] uppercase text-gray-500">
              Notes
            </h2>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await createNote();
                  if (!res.ok) flash(res.message);
                  else {
                    flash("Draft note created.");
                    setSelectedId(res.id);
                    router.refresh();
                  }
                });
              }}
              className="self-start rounded-md border border-white/20 px-3 py-1.5 text-xs tracking-wide text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40"
            >
              New note
            </button>
          </div>

          <div className="grid gap-10 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
            <nav
              aria-label="Notes"
              className="space-y-1 border-b border-white/10 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8"
            >
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  className={`block w-full rounded px-2 py-2 text-left text-sm transition-colors ${
                    n.id === selectedId
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <span className="block truncate">{n.title || "Untitled"}</span>
                  {!n.published ? (
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-gray-600">
                      Draft
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>

            <div className="min-w-0 space-y-6">
              {selected ? (
                <NoteEditorPanel
                  key={`${selected.id}-${selected.updated_at}`}
                  note={selected}
                  noteBodyRef={noteBodyRef}
                  isPending={isPending}
                  startTransition={startTransition}
                  router={router}
                  onMessage={flash}
                />
              ) : (
                <p className="text-sm text-gray-500">Create a note to begin.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
