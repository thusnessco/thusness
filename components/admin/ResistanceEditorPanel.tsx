"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { saveResistancePage } from "@/app/admin/actions";
import {
  defaultResistancePageContent,
  RESISTANCE_GLYPH_KEYS,
  type ResistancePageContent,
  type ResistanceRuleRow,
  type ResistanceTool,
} from "@/lib/resistance/resistance-page";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";

const GLYPH_OPTIONS = [...RESISTANCE_GLYPH_KEYS];

export function ResistanceEditorPanel({
  initialContent,
  isPending,
  startTransition,
  onMessage,
  updatedAt,
}: {
  initialContent: ResistancePageContent;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [c, setC] = useState<ResistancePageContent>(initialContent);
  const tools = useMemo(() => c.tools, [c.tools]);

  function setPremise(patch: Partial<ResistancePageContent["premise"]>) {
    setC((x) => ({ ...x, premise: { ...x.premise, ...patch } }));
  }

  function setRules(patch: Partial<ResistancePageContent["rules"]>) {
    setC((x) => ({ ...x, rules: { ...x.rules, ...patch } }));
  }

  function setRuleRow(i: number, patch: Partial<ResistanceRuleRow>) {
    setC((x) => {
      const rows = x.rules.rows.map((r, j) => (j === i ? { ...r, ...patch } : r));
      return { ...x, rules: { ...x.rules, rows } };
    });
  }

  function addRuleRow() {
    setC((x) => ({
      ...x,
      rules: {
        ...x.rules,
        rows: [...x.rules.rows, { label: "~ New", body: "Body text." }],
      },
    }));
  }

  function removeRuleRow(i: number) {
    setC((x) => ({
      ...x,
      rules: {
        ...x.rules,
        rows: x.rules.rows.filter((_, j) => j !== i),
      },
    }));
  }

  function setTool(i: number, patch: Partial<ResistanceTool>) {
    setC((x) => ({
      ...x,
      tools: x.tools.map((t, j) => (j === i ? { ...t, ...patch } : t)),
    }));
  }

  function addTool() {
    setC((x) => ({
      ...x,
      tools: [
        ...x.tools,
        {
          num: String(x.tools.length + 1).padStart(2, "0"),
          glyph: "include",
          name: "New tool",
          script: "Script…",
          why: "Why…",
        },
      ],
    }));
  }

  function removeTool(i: number) {
    setC((x) => ({ ...x, tools: x.tools.filter((_, j) => j !== i) }));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-lg font-medium tracking-tight text-[var(--thusness-ink)]">
          Resistance (readings)
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
          Public page{" "}
          <Link
            href="/readings/resistance"
            className="text-[var(--thusness-ink)] underline decoration-[var(--thusness-rule)] underline-offset-4"
          >
            /readings/resistance
          </Link>
          . Use <code className="text-[10px]">*italic*</code> and{" "}
          <code className="text-[10px]">[avoid]phrase[/avoid]</code> in body fields. Glyph
          keys select SVG icons.
        </p>
      </header>

      <div className="grid max-w-2xl gap-4">
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Wordmark label (reserved)</span>
          <input
            type="text"
            disabled={isPending}
            value={c.wordmark}
            onChange={(e) => setC((x) => ({ ...x, wordmark: e.target.value }))}
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Kicker</span>
          <input
            type="text"
            disabled={isPending}
            value={c.kicker}
            onChange={(e) => setC((x) => ({ ...x, kicker: e.target.value }))}
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Title</span>
          <input
            type="text"
            disabled={isPending}
            value={c.title}
            onChange={(e) => setC((x) => ({ ...x, title: e.target.value }))}
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Subtitle</span>
          <input
            type="text"
            disabled={isPending}
            value={c.sub}
            onChange={(e) => setC((x) => ({ ...x, sub: e.target.value }))}
            className={adminFieldInput}
          />
        </label>
      </div>

      <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-6">
        <p className={adminFieldLabel}>Premise</p>
        <label className="block space-y-1">
          <span className="text-[10px] uppercase text-[var(--thusness-muted)]">Label</span>
          <input
            type="text"
            disabled={isPending}
            value={c.premise.label}
            onChange={(e) => setPremise({ label: e.target.value })}
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] uppercase text-[var(--thusness-muted)]">
            Paragraphs (one per block, blank line between in storage = separate entries)
          </span>
          {c.premise.paragraphs.map((p, i) => (
            <textarea
              key={i}
              rows={3}
              disabled={isPending}
              value={p}
              onChange={(e) => {
                const next = [...c.premise.paragraphs];
                next[i] = e.target.value;
                setPremise({ paragraphs: next });
              }}
              className={`${adminFieldInput} mb-2 min-h-[72px] resize-y`}
            />
          ))}
          <button
            type="button"
            className={adminBtnGhost}
            disabled={isPending}
            onClick={() =>
              setPremise({ paragraphs: [...c.premise.paragraphs, ""] })
            }
          >
            Add paragraph
          </button>
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] uppercase text-[var(--thusness-muted)]">Pull quote</span>
          <textarea
            rows={3}
            disabled={isPending}
            value={c.premise.pull}
            onChange={(e) => setPremise({ pull: e.target.value })}
            className={`${adminFieldInput} min-h-[80px] resize-y`}
          />
          <span className="text-[10px] text-[var(--thusness-muted)]">
            Leave empty to hide the callout block between premise and clean rules.
          </span>
        </label>
      </div>

      <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={adminFieldLabel}>Clean rules</p>
          <button type="button" className={adminBtnGhost} disabled={isPending} onClick={addRuleRow}>
            Add row
          </button>
        </div>
        <label className="block space-y-1">
          <span className="text-[10px] uppercase text-[var(--thusness-muted)]">Section label</span>
          <input
            type="text"
            disabled={isPending}
            value={c.rules.label}
            onChange={(e) => setRules({ label: e.target.value })}
            className={adminFieldInput}
          />
        </label>
        {c.rules.rows.map((row, i) => (
          <div
            key={i}
            className="space-y-2 rounded border border-[var(--thusness-rule)] p-3"
          >
            <div className="flex justify-end">
              <button
                type="button"
                className={adminBtnGhost}
                disabled={isPending || c.rules.rows.length <= 1}
                onClick={() => removeRuleRow(i)}
              >
                Remove row
              </button>
            </div>
            <input
              type="text"
              disabled={isPending}
              value={row.label}
              onChange={(e) => setRuleRow(i, { label: e.target.value })}
              className={adminFieldInput}
              placeholder="~ Label"
            />
            <textarea
              rows={3}
              disabled={isPending}
              value={row.body}
              onChange={(e) => setRuleRow(i, { body: e.target.value })}
              className={`${adminFieldInput} min-h-[88px] resize-y`}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-[var(--thusness-rule)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block flex-1 space-y-1">
            <span className={adminFieldLabel}>Tools section label</span>
            <input
              type="text"
              disabled={isPending}
              value={c.toolsLabel}
              onChange={(e) => setC((x) => ({ ...x, toolsLabel: e.target.value }))}
              className={adminFieldInput}
            />
          </label>
          <button type="button" className={adminBtnGhost} disabled={isPending} onClick={addTool}>
            Add tool
          </button>
        </div>
        {tools.map((tool, i) => (
          <div
            key={i}
            className="space-y-2 rounded border border-[var(--thusness-rule)] p-3"
          >
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={adminBtnGhost}
                disabled={isPending || c.tools.length <= 1}
                onClick={() => removeTool(i)}
              >
                Remove tool
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1">
                <span className="text-[10px] uppercase text-[var(--thusness-muted)]">Num</span>
                <input
                  type="text"
                  disabled={isPending}
                  value={tool.num}
                  onChange={(e) => setTool(i, { num: e.target.value })}
                  className={adminFieldInput}
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] uppercase text-[var(--thusness-muted)]">Glyph</span>
                <select
                  disabled={isPending}
                  value={tool.glyph}
                  onChange={(e) =>
                    setTool(i, { glyph: e.target.value as ResistanceTool["glyph"] })
                  }
                  className={adminFieldInput}
                >
                  {GLYPH_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-end">
                <span className="flex items-center gap-2 text-sm text-[var(--thusness-ink-soft)]">
                  <input
                    type="checkbox"
                    checked={tool.wide === true}
                    disabled={isPending}
                    onChange={(e) =>
                      setTool(i, { wide: e.target.checked ? true : undefined })
                    }
                  />
                  Wide layout
                </span>
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-[10px] uppercase text-[var(--thusness-muted)]">Name</span>
              <input
                type="text"
                disabled={isPending}
                value={tool.name}
                onChange={(e) => setTool(i, { name: e.target.value })}
                className={adminFieldInput}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase text-[var(--thusness-muted)]">
                When (optional)
              </span>
              <textarea
                rows={2}
                disabled={isPending}
                value={tool.when ?? ""}
                onChange={(e) =>
                  setTool(i, {
                    when: e.target.value.trim() ? e.target.value : undefined,
                  })
                }
                className={`${adminFieldInput} resize-y`}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase text-[var(--thusness-muted)]">~ Language</span>
              <textarea
                rows={4}
                disabled={isPending}
                value={tool.script}
                onChange={(e) => setTool(i, { script: e.target.value })}
                className={`${adminFieldInput} min-h-[100px] resize-y`}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase text-[var(--thusness-muted)]">
                ~ Why it works
              </span>
              <textarea
                rows={3}
                disabled={isPending}
                value={tool.why}
                onChange={(e) => setTool(i, { why: e.target.value })}
                className={`${adminFieldInput} min-h-[80px] resize-y`}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={adminBtnPrimary}
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await saveResistancePage(c);
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Resistance page saved.");
                router.refresh();
              }
            });
          }}
        >
          Save resistance page
        </button>
        <button
          type="button"
          className={adminBtnGhost}
          disabled={isPending}
          onClick={() => {
            if (
              !window.confirm(
                "Reset the form to bundled defaults? This does not save until you click Save."
              )
            ) {
              return;
            }
            setC(defaultResistancePageContent());
          }}
        >
          Reset form to defaults
        </button>
      </div>
      {updatedAt ? (
        <p className="text-[11px] text-[var(--thusness-muted)]">
          Last saved {new Date(updatedAt).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
