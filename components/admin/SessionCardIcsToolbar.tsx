"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

const SESSION_CARD = "thusnessSessionCard";

function utcIsoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToUtcIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function SessionCardIcsToolbar({
  editor,
  onNotice,
  btnClass,
  idleClass,
}: {
  editor: Editor;
  onNotice?: (msg: string) => void;
  btnClass: string;
  idleClass: string;
}) {
  const [open, setOpen] = useState(false);
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [location, setLocation] = useState("");

  const active = editor.isActive(SESSION_CARD);

  useEffect(() => {
    if (!open || !active) return;
    const a = editor.getAttributes(SESSION_CARD) as {
      icsStart?: string | null;
      icsEnd?: string | null;
      icsLocation?: string | null;
    };
    setStartLocal(
      typeof a.icsStart === "string" && a.icsStart ? utcIsoToDatetimeLocal(a.icsStart) : ""
    );
    setEndLocal(
      typeof a.icsEnd === "string" && a.icsEnd ? utcIsoToDatetimeLocal(a.icsEnd) : ""
    );
    setLocation(typeof a.icsLocation === "string" ? a.icsLocation : "");
  }, [open, active, editor]);

  function apply(save: boolean, clear?: boolean) {
    if (clear) {
      editor
        .chain()
        .focus()
        .updateAttributes(SESSION_CARD, {
          icsStart: null,
          icsEnd: null,
          icsLocation: null,
        })
        .run();
      setOpen(false);
      onNotice?.("Calendar data cleared for this session card.");
      return;
    }
    if (!save) {
      setOpen(false);
      return;
    }
    const s = localInputToUtcIso(startLocal);
    const e = localInputToUtcIso(endLocal);
    if (!s || !e) {
      onNotice?.("Choose a valid start and end date/time.");
      return;
    }
    if (new Date(e).getTime() <= new Date(s).getTime()) {
      onNotice?.("End must be after start.");
      return;
    }
    const loc = location.trim() || null;
    editor
      .chain()
      .focus()
      .updateAttributes(SESSION_CARD, {
        icsStart: s,
        icsEnd: e,
        icsLocation: loc,
      })
      .run();
    setOpen(false);
    onNotice?.(
      "Calendar link saved — it appears when visitors hover the session card (or focus it)."
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={!active}
        title={
          active
            ? "Set start/end and meeting URL for a downloadable .ics on this card"
            : "Click inside a session invitation card first"
        }
        className={`${btnClass} ${active ? idleClass : `${idleClass} opacity-40`}`}
        onClick={() => {
          if (!active) return;
          setOpen(true);
        }}
      >
        Session .ics
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) apply(false);
          }}
        >
          <div
            role="dialog"
            aria-labelledby="session-ics-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] p-5 shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2
              id="session-ics-title"
              className="text-sm font-medium text-[var(--thusness-ink)]"
            >
              Calendar file for this session card
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--thusness-muted)]">
              Times use your browser&apos;s local zone, then store as UTC. The public
              site shows an &ldquo;Add to calendar&rdquo; line only when someone hovers
              or focuses the card.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                  Start
                </span>
                <input
                  type="datetime-local"
                  value={startLocal}
                  onChange={(e) => setStartLocal(e.target.value)}
                  className="w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-2 py-1.5 text-sm text-[var(--thusness-ink-soft)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                  End
                </span>
                <input
                  type="datetime-local"
                  value={endLocal}
                  onChange={(e) => setEndLocal(e.target.value)}
                  className="w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-2 py-1.5 text-sm text-[var(--thusness-ink-soft)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                  Location (Zoom / booking URL)
                </span>
                <input
                  type="url"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="https://…"
                  className="w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-2 py-1.5 text-sm text-[var(--thusness-ink-soft)]"
                />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-sm border border-[var(--thusness-rule)] bg-[var(--thusness-ink)] px-3 py-1.5 text-xs text-[var(--thusness-bg)]"
                onClick={() => apply(true)}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded-sm border border-[var(--thusness-rule)] px-3 py-1.5 text-xs text-[var(--thusness-ink-soft)]"
                onClick={() => apply(false, true)}
              >
                Clear calendar
              </button>
              <button
                type="button"
                className="rounded-sm px-3 py-1.5 text-xs text-[var(--thusness-muted)]"
                onClick={() => apply(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
