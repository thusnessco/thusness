"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveSinkInConfig } from "@/app/admin/actions";
import {
  defaultSinkInConfig,
  type SinkInConfigV1,
  type SinkInStep,
} from "@/lib/sinkin/config";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";

export function SinkInEditorPanel({
  initialConfig,
  isPending,
  startTransition,
  onMessage,
}: {
  initialConfig: SinkInConfigV1;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<SinkInConfigV1>(initialConfig);

  function updateStep(i: number, patch: Partial<SinkInStep>) {
    setConfig((c) => ({
      ...c,
      steps: c.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    }));
  }

  function addStep() {
    setConfig((c) => ({
      ...c,
      steps: [
        ...c.steps,
        {
          id: `step-${c.steps.length + 1}`,
          label: "New section",
          body: "",
        },
      ],
    }));
  }

  function removeStep(i: number) {
    setConfig((c) => ({
      ...c,
      steps: c.steps.filter((_, j) => j !== i),
    }));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-lg font-medium tracking-tight text-[var(--thusness-ink)]">
          Sink in
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
          Public timed read at{" "}
          <Link
            href="/sinkin"
            className="text-[var(--thusness-ink)] underline decoration-[var(--thusness-rule)] underline-offset-4"
          >
            /sinkin
          </Link>
          . Set the pause between tones and edit each passage below, then save.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Seconds between tones</span>
          <input
            type="number"
            min={30}
            max={720}
            step={5}
            disabled={isPending}
            value={config.intervalSec}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                intervalSec: Number(e.target.value) || 60,
              }))
            }
            className={adminFieldInput}
          />
          <span className="text-[10px] leading-snug text-[var(--thusness-muted)]">
            30–720. About <span className="italic">60</span> is one minute between
            dings.
          </span>
        </label>
      </div>

      <div className="max-h-[min(70vh,720px)] space-y-4 overflow-y-auto border border-[var(--thusness-rule)] px-4 py-4">
        <p className={adminFieldLabel}>Steps (in order)</p>
        {config.steps.map((step, i) => (
          <div
            key={`${i}-${step.id}`}
            className="border-b border-[var(--thusness-rule)] pb-5 last:border-b-0"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[var(--thusness-ink-soft)]">
                Step {i + 1}
              </span>
              <button
                type="button"
                disabled={isPending || config.steps.length <= 1}
                className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)] underline decoration-[var(--thusness-rule)] underline-offset-2 disabled:opacity-40"
                onClick={() => removeStep(i)}
              >
                Remove
              </button>
            </div>
            <label className="mb-3 block space-y-1.5">
              <span className={adminFieldLabel}>Section title</span>
              <input
                value={step.label}
                disabled={isPending}
                onChange={(e) => updateStep(i, { label: e.target.value })}
                className={adminFieldInput}
              />
            </label>
            <label className="block space-y-1.5">
              <span className={adminFieldLabel}>Body</span>
              <textarea
                value={step.body}
                disabled={isPending}
                onChange={(e) => updateStep(i, { body: e.target.value })}
                rows={5}
                className={`${adminFieldInput} resize-y`}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          disabled={isPending}
          onClick={addStep}
          className={adminBtnGhost}
        >
          Add step
        </button>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[var(--thusness-rule)] pt-8">
        <button
          type="button"
          disabled={isPending}
          className={adminBtnPrimary}
          onClick={() => {
            startTransition(async () => {
              const res = await saveSinkInConfig(config);
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Sink-in saved.");
                router.refresh();
              }
            });
          }}
        >
          Save sink-in
        </button>
        <button
          type="button"
          disabled={isPending}
          className={adminBtnGhost}
          onClick={() => {
            if (
              !window.confirm(
                "Replace the editor with the built-in default script and 60s timing? Your current text will be lost unless you save a copy elsewhere."
              )
            ) {
              return;
            }
            setConfig(defaultSinkInConfig());
            onMessage("Defaults loaded — save to write them to the site.");
          }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
