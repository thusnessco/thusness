"use client";

import { useMemo, useState } from "react";

import { saveOrientBookletConfig } from "@/app/admin/actions";
import {
  ORIENT_BOOKLET_SLUGS,
  type OrientBookletConfig,
} from "@/lib/orient/booklet-config";

import { adminBtnPrimary } from "./admin-ui";

const LABELS: Record<(typeof ORIENT_BOOKLET_SLUGS)[number], string> = {
  stages: "01 · Stages of peace",
  recognition: "02 · Two kinds of peace",
  pillars: "03 · Three pillars",
  movement: "04 · Movement & progression",
  themes: "05 · Aspects of exploration",
  nihilism: "06 · Emptiness ≠ non-existence",
};

export function OrientBookletPanel({
  initialConfig,
  isPending,
  startTransition,
  onMessage,
}: {
  initialConfig: OrientBookletConfig;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
}) {
  const [config, setConfig] = useState<OrientBookletConfig>(initialConfig);
  const visibleCount = useMemo(
    () => ORIENT_BOOKLET_SLUGS.filter((s) => config.pagesVisible[s]).length,
    [config]
  );

  return (
    <section className="space-y-5 border border-[var(--thusness-rule)] p-4">
      <header className="space-y-1">
        <h3 className="text-base text-[var(--thusness-ink)]">Orient booklet pages</h3>
        <p className="text-xs text-[var(--thusness-muted)]">
          Toggle which section routes are public and which footer links are shown while
          you work on backend content.
        </p>
        <p className="text-[11px] text-[var(--thusness-muted)]">
          Optional prose overrides: publish notes with slugs{" "}
          <code>orient-stages</code>, <code>orient-recognition</code>,{" "}
          <code>orient-pillars</code>, <code>orient-movement</code>,{" "}
          <code>orient-themes</code>, <code>orient-nihilism</code>. If a note is
          missing or unpublished, the public page still loads with default booklet
          copy.
        </p>
      </header>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--thusness-muted)]">
          Page visibility ({visibleCount}/6)
        </p>
        {ORIENT_BOOKLET_SLUGS.map((slug) => (
          <label
            key={slug}
            className="flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]"
          >
            <input
              type="checkbox"
              className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
              checked={config.pagesVisible[slug]}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  pagesVisible: { ...prev.pagesVisible, [slug]: e.target.checked },
                }))
              }
            />
            <span>{LABELS[slug]}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2 border-t border-[var(--thusness-rule)] pt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--thusness-muted)]">
          Footer links
        </p>
        <label className="flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]">
          <input
            type="checkbox"
            className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
            checked={config.showFooterLinks}
            disabled={isPending}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, showFooterLinks: e.target.checked }))
            }
          />
          <span>Show link row (~ orient · readings · notes)</span>
        </label>
        {(["footerOrient", "footerReadings", "footerNotes"] as const).map((k) => (
          <label
            key={k}
            className="ml-6 flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]"
          >
            <input
              type="checkbox"
              className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
              checked={config[k]}
              disabled={isPending || !config.showFooterLinks}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, [k]: e.target.checked }))
              }
            />
            <span>
              {k === "footerOrient"
                ? "Orient"
                : k === "footerReadings"
                  ? "Readings"
                  : "Notes"}
            </span>
          </label>
        ))}
      </div>

      <button
        type="button"
        className={adminBtnPrimary}
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await saveOrientBookletConfig(config);
            if (!res.ok) onMessage(res.message);
            else onMessage("Orient booklet visibility/footer settings saved.");
          });
        }}
      >
        Save booklet settings
      </button>
    </section>
  );
}
