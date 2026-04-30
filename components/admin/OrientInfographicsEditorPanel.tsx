"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { saveOrientInfographics } from "@/app/admin/actions";
import type { OrientContent } from "@/lib/orient-infographics/types";

import {
  adminBtnPrimary,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";

function Field({
  label,
  value,
  onChange,
  multiline,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const common = `${adminFieldInput} w-full`;
  return (
    <label className="block space-y-1">
      <span className={adminFieldLabel}>{label}</span>
      {multiline ? (
        <textarea
          className={`${common} min-h-[72px] resize-y`}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={common}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function OrientInfographicsEditorPanel({
  initialContent,
  updatedAt,
  isPending,
  startTransition,
  onMessage,
}: {
  initialContent: OrientContent;
  updatedAt: string | null;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
}) {
  const router = useRouter();
  const [c, setC] = useState<OrientContent>(() =>
    structuredClone(initialContent)
  );
  const knownUpdatedAtRef = useRef<string | null>(updatedAt);

  useEffect(() => {
    setC(structuredClone(initialContent));
    knownUpdatedAtRef.current = updatedAt;
  }, [initialContent, updatedAt]);

  function save() {
    startTransition(async () => {
      const res = await saveOrientInfographics(c, knownUpdatedAtRef.current);
      if (!res.ok) onMessage(res.message);
      else {
        knownUpdatedAtRef.current = res.updated_at;
        onMessage("Orient infographics saved.");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-[var(--thusness-ink)]">
          Orient infographics
        </h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--thusness-muted)]">
          Diagram copy for <span className="italic">/orient</span> (and any other
          page that renders the suite). Plain fields only — no rich text inside
          labels.
        </p>
        {updatedAt ? (
          <p className="mt-1 text-[10px] text-[var(--thusness-muted)]">
            Last saved {new Date(updatedAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      <details className="rounded border border-[var(--thusness-rule)] p-4" open>
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Giant master map
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Kicker" value={c.giant.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, giant: { ...x.giant, kicker: v } }))} />
          <Field label="Title" value={c.giant.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, giant: { ...x.giant, title: v } }))} />
          <Field label="Sub" value={c.giant.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, giant: { ...x.giant, sub: v } }))} />
          <Field label="Transition" value={c.giant.transition} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, giant: { ...x.giant, transition: v } }))} />
          <Field label="Tagline" value={c.giant.tagline} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, giant: { ...x.giant, tagline: v } }))} />
          <Field label="Footer (lineage)" value={c.giant.footer} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, giant: { ...x.giant, footer: v } }))} />
        </div>
      </details>

      <details className="rounded border border-[var(--thusness-rule)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Pillars
        </summary>
        <div className="mt-4 space-y-3">
          <Field label="Kicker" value={c.pillars.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, pillars: { ...x.pillars, kicker: v } }))} />
          <Field label="Title" value={c.pillars.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, pillars: { ...x.pillars, title: v } }))} />
          <Field label="Sub" value={c.pillars.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, pillars: { ...x.pillars, sub: v } }))} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded p-3 ring-1 ring-[var(--thusness-rule)]">
              <p className="mb-2 text-[10px] uppercase text-[var(--thusness-muted)]">Pillar {i + 1}</p>
              <div className="grid gap-2">
                <Field label="Name" value={c.pillars.items[i]?.name ?? ""} disabled={isPending} onChange={(v) => setC((x) => {
                  const items = x.pillars.items.map((it, j) => (j === i ? { ...it, name: v } : it));
                  return { ...x, pillars: { ...x.pillars, items } };
                })} />
                <Field label="Sub" value={c.pillars.items[i]?.sub ?? ""} disabled={isPending} onChange={(v) => setC((x) => {
                  const items = x.pillars.items.map((it, j) => (j === i ? { ...it, sub: v } : it));
                  return { ...x, pillars: { ...x.pillars, items } };
                })} />
                <Field label="Gloss" value={c.pillars.items[i]?.gloss ?? ""} disabled={isPending} multiline onChange={(v) => setC((x) => {
                  const items = x.pillars.items.map((it, j) => (j === i ? { ...it, gloss: v } : it));
                  return { ...x, pillars: { ...x.pillars, items } };
                })} />
              </div>
            </div>
          ))}
          <Field label="Footer" value={c.pillars.footer} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, pillars: { ...x.pillars, footer: v } }))} />
        </div>
      </details>

      <details className="rounded border border-[var(--thusness-rule)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Stages of peace
        </summary>
        <div className="mt-4 space-y-3">
          <Field label="Kicker" value={c.stages.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, stages: { ...x.stages, kicker: v } }))} />
          <Field label="Title" value={c.stages.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, stages: { ...x.stages, title: v } }))} />
          <Field label="Sub" value={c.stages.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, stages: { ...x.stages, sub: v } }))} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded bg-[var(--thusness-bg)]/80 p-3 ring-1 ring-[var(--thusness-rule)]">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                Stage {i + 1}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Scope" value={c.stages.items[i]?.scope ?? ""} disabled={isPending} onChange={(v) => setC((x) => {
                  const items = x.stages.items.map((it, j) => (j === i ? { ...it, scope: v } : it));
                  return { ...x, stages: { ...x.stages, items } };
                })} />
                <Field label="Name" value={c.stages.items[i]?.name ?? ""} disabled={isPending} onChange={(v) => setC((x) => {
                  const items = x.stages.items.map((it, j) => (j === i ? { ...it, name: v } : it));
                  return { ...x, stages: { ...x.stages, items } };
                })} />
                <Field label="Gloss" value={c.stages.items[i]?.gloss ?? ""} disabled={isPending} multiline onChange={(v) => setC((x) => {
                  const items = x.stages.items.map((it, j) => (j === i ? { ...it, gloss: v } : it));
                  return { ...x, stages: { ...x.stages, items } };
                })} />
              </div>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded border border-[var(--thusness-rule)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Recognition
        </summary>
        <div className="mt-4 space-y-3">
          <Field label="Kicker" value={c.recognition.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, recognition: { ...x.recognition, kicker: v } }))} />
          <Field label="Title" value={c.recognition.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, recognition: { ...x.recognition, title: v } }))} />
          <Field label="Sub" value={c.recognition.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, recognition: { ...x.recognition, sub: v } }))} />
          <Field label="Background title" value={c.recognition.background.title} disabled={isPending} onChange={(v) => setC((x) => ({
            ...x,
            recognition: { ...x.recognition, background: { ...x.recognition.background, title: v } },
          }))} />
          {[0, 1, 2, 3].map((i) => (
            <Field
              key={i}
              label={`Background point ${i + 1}`}
              value={c.recognition.background.points[i] ?? ""}
              disabled={isPending}
              multiline
              onChange={(v) => setC((x) => {
                const points = [...x.recognition.background.points];
                points[i] = v;
                return {
                  ...x,
                  recognition: {
                    ...x.recognition,
                    background: { ...x.recognition.background, points },
                  },
                };
              })}
            />
          ))}
          <Field label="Felt title" value={c.recognition.felt.title} disabled={isPending} onChange={(v) => setC((x) => ({
            ...x,
            recognition: { ...x.recognition, felt: { ...x.recognition.felt, title: v } },
          }))} />
          {[0, 1, 2, 3].map((i) => (
            <Field
              key={i}
              label={`Felt point ${i + 1}`}
              value={c.recognition.felt.points[i] ?? ""}
              disabled={isPending}
              multiline
              onChange={(v) => setC((x) => {
                const points = [...x.recognition.felt.points];
                points[i] = v;
                return {
                  ...x,
                  recognition: {
                    ...x.recognition,
                    felt: { ...x.recognition.felt, points },
                  },
                };
              })}
            />
          ))}
          <Field label="Trap line" value={c.recognition.trap} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, recognition: { ...x.recognition, trap: v } }))} />
        </div>
      </details>

      <details className="rounded border border-[var(--thusness-rule)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Movement
        </summary>
        <div className="mt-4 space-y-3">
          <Field label="Kicker" value={c.movement.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, movement: { ...x.movement, kicker: v } }))} />
          <Field label="Title" value={c.movement.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, movement: { ...x.movement, title: v } }))} />
          <Field label="Sub" value={c.movement.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, movement: { ...x.movement, sub: v } }))} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <Field label={`Phase ${i + 1} name`} value={c.movement.items[i]?.name ?? ""} disabled={isPending} onChange={(v) => setC((x) => {
                const items = x.movement.items.map((it, j) => (j === i ? { ...it, name: v } : it));
                return { ...x, movement: { ...x.movement, items } };
              })} />
              <Field label={`Phase ${i + 1} gloss`} value={c.movement.items[i]?.gloss ?? ""} disabled={isPending} multiline onChange={(v) => setC((x) => {
                const items = x.movement.items.map((it, j) => (j === i ? { ...it, gloss: v } : it));
                return { ...x, movement: { ...x.movement, items } };
              })} />
            </div>
          ))}
          <Field label="Footer" value={c.movement.footer} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, movement: { ...x.movement, footer: v } }))} />
        </div>
      </details>

      <details className="rounded border border-[var(--thusness-rule)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Themes (max 8)
        </summary>
        <div className="mt-4 space-y-3">
          <Field label="Kicker" value={c.themes.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, themes: { ...x.themes, kicker: v } }))} />
          <Field label="Title" value={c.themes.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, themes: { ...x.themes, title: v } }))} />
          <Field label="Sub" value={c.themes.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, themes: { ...x.themes, sub: v } }))} />
          <label className="block space-y-1">
            <span className={adminFieldLabel}>List (one per line, up to 8)</span>
            <textarea
              className={`${adminFieldInput} min-h-[120px] w-full resize-y`}
              disabled={isPending}
              value={c.themes.list.join("\n")}
              onChange={(e) => {
                const list = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 8);
                setC((x) => ({ ...x, themes: { ...x.themes, list } }));
              }}
            />
          </label>
          <Field label="Footer" value={c.themes.footer} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, themes: { ...x.themes, footer: v } }))} />
        </div>
      </details>

      <details className="rounded border border-[var(--thusness-rule)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--thusness-ink)]">
          Nihilism trap
        </summary>
        <div className="mt-4 grid gap-3">
          <Field label="Kicker" value={c.nihilism.kicker} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, kicker: v } }))} />
          <Field label="Title" value={c.nihilism.title} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, title: v } }))} />
          <Field label="Sub" value={c.nihilism.sub} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, sub: v } }))} />
          <p className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">Trap</p>
          <Field label="Name" value={c.nihilism.trap.name} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, trap: { ...x.nihilism.trap, name: v } } }))} />
          <Field label="Quote" value={c.nihilism.trap.quote} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, trap: { ...x.nihilism.trap, quote: v } } }))} />
          <Field label="Body" value={c.nihilism.trap.body} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, trap: { ...x.nihilism.trap, body: v } } }))} />
          <p className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">View</p>
          <Field label="Name" value={c.nihilism.view.name} disabled={isPending} onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, view: { ...x.nihilism.view, name: v } } }))} />
          <Field label="Quote" value={c.nihilism.view.quote} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, view: { ...x.nihilism.view, quote: v } } }))} />
          <Field label="Body" value={c.nihilism.view.body} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, view: { ...x.nihilism.view, body: v } } }))} />
          <Field label="Footer" value={c.nihilism.footer} disabled={isPending} multiline onChange={(v) => setC((x) => ({ ...x, nihilism: { ...x.nihilism, footer: v } }))} />
        </div>
      </details>

      <button type="button" className={adminBtnPrimary} disabled={isPending} onClick={save}>
        Save infographics
      </button>
    </div>
  );
}
