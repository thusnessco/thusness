"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveSinkInConfig } from "@/app/admin/actions";
import {
  defaultSinkInConfig,
  SINKIN_INTRO_BLURB_MAX,
  SINKIN_PROGRAM_TITLE_MAX,
  type SinkInConfigV1,
  type SinkInStep,
  type SinkInUiV1,
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
          keyword: "notice",
          holdSec: c.intervalSec,
        },
      ],
    }));
  }

  function setUi(patch: Partial<SinkInUiV1>) {
    setConfig((c) => ({ ...c, ui: { ...c.ui, ...patch } }));
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
          . Set how long each step stays on screen, dissolve timing, and copy below,
          then save.
        </p>
      </header>

      <label className="block max-w-2xl space-y-1.5">
        <span className={adminFieldLabel}>Program title</span>
        <input
          type="text"
          disabled={isPending}
          value={config.programTitle}
          maxLength={SINKIN_PROGRAM_TITLE_MAX}
          onChange={(e) =>
            setConfig((c) => ({
              ...c,
              programTitle: e.target.value.slice(0, SINKIN_PROGRAM_TITLE_MAX),
            }))
          }
          className={adminFieldInput}
        />
        <span className="text-[10px] leading-snug text-[var(--thusness-muted)]">
          Shown on /sinkin only when “Program title” is on under During a step.
          Replace a pasted file name with whatever you want participants to see.
        </span>
      </label>

      <label className="block max-w-2xl space-y-1.5">
        <span className={adminFieldLabel}>Intro (before Begin)</span>
        <textarea
          rows={5}
          disabled={isPending}
          value={config.introBlurb}
          maxLength={SINKIN_INTRO_BLURB_MAX}
          onChange={(e) =>
            setConfig((c) => ({
              ...c,
              introBlurb: e.target.value.slice(0, SINKIN_INTRO_BLURB_MAX),
            }))
          }
          className={`${adminFieldInput} resize-y min-h-[120px]`}
        />
        <span className="text-[10px] leading-snug text-[var(--thusness-muted)]">
          Plain text on /sinkin before Begin. Line breaks are kept.
        </span>
      </label>

      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Default step length (seconds)</span>
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
            Used when you add a new step and as a fallback if a step has no length.
            Each step can override below (30–720s).
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Dissolve between steps (ms)</span>
          <input
            type="number"
            min={200}
            max={5000}
            step={50}
            disabled={isPending}
            value={config.crossfadeMs}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                crossfadeMs: Number(e.target.value) || 900,
              }))
            }
            className={adminFieldInput}
          />
          <span className="text-[10px] leading-snug text-[var(--thusness-muted)]">
            Fade out / fade in when the tone moves to the next passage (200–5000).
          </span>
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className={adminFieldLabel}>
            Mid-step reminder (seconds, 0 = off)
          </span>
          <input
            type="number"
            min={0}
            max={600}
            step={30}
            disabled={isPending}
            value={config.midToneIntervalSec}
            onChange={(e) => {
              const v = Number(e.target.value);
              const n = Number.isFinite(v) ? Math.round(v) : 0;
              setConfig((c) => ({
                ...c,
                midToneIntervalSec:
                  n <= 0 ? 0 : Math.min(600, Math.max(60, n)),
              }));
            }}
            className={adminFieldInput}
          />
          <span className="text-[10px] leading-snug text-[var(--thusness-muted)]">
            On long steps (not the last passage), a short soft tone repeats at this
            interval (60–600s). Set to 0 to disable. Saves clamped the same way.
          </span>
        </label>
      </div>

      <fieldset className="space-y-3 border border-[var(--thusness-rule)] px-4 py-4">
        <legend className={`px-1 ${adminFieldLabel}`}>
          Optional on screen during a step
        </legend>
        <p className="text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          Defaults are off for a minimal read: wordmark, hero text, and fixed
          controls. Turn on a program title or section labels if you want them.
        </p>
        {(
          [
            {
              key: "showProgramTitle" as const,
              title: "Program title",
              hint: "Uses the Program title field above the timing controls.",
            },
            {
              key: "showSectionLabel" as const,
              title: "Section title",
              hint: "Roman heading above the passage.",
            },
            {
              key: "showFooter" as const,
              title: "Footer",
              hint: "Rule line and thusness.co · sink in.",
            },
          ] as const
        ).map(({ key, title, hint }) => (
          <label
            key={key}
            className="flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]"
          >
            <input
              type="checkbox"
              className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
              checked={config.ui[key]}
              disabled={isPending}
              onChange={(e) => setUi({ [key]: e.target.checked })}
            />
            <span>
              <span className="font-medium text-[var(--thusness-ink)]">{title}</span>
              <span className="mt-0.5 block text-[10px] text-[var(--thusness-muted)]">
                {hint}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

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
            <label className="mb-3 block space-y-1.5">
              <span className={adminFieldLabel}>Body</span>
              <textarea
                value={step.body}
                disabled={isPending}
                onChange={(e) => updateStep(i, { body: e.target.value })}
                rows={5}
                className={`${adminFieldInput} resize-y`}
              />
            </label>
            <label className="block space-y-1.5">
              <span className={adminFieldLabel}>Seconds on this step</span>
              <input
                type="number"
                min={30}
                max={720}
                step={5}
                disabled={isPending}
                value={step.holdSec}
                onChange={(e) =>
                  updateStep(i, {
                    holdSec: Number(e.target.value) || config.intervalSec,
                  })
                }
                className={adminFieldInput}
              />
              <span className="text-[10px] text-[var(--thusness-muted)]">
                Time until the next tone for this passage (30–720).
              </span>
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
                "Replace the editor with the built-in default script? Your current text will be lost unless you save a copy elsewhere."
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
