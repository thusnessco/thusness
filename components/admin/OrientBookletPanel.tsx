"use client";

import { useMemo, useState } from "react";

import { saveOrientBookletConfig } from "@/app/admin/actions";
import {
  ORIENT_BOOKLET_SLUGS,
  type OrientBookletConfig,
} from "@/lib/orient/booklet-config";

import { adminBtnPrimary, adminFieldInput, adminFieldLabel } from "./admin-ui";

const LABELS: Record<(typeof ORIENT_BOOKLET_SLUGS)[number], string> = {
  pillars: "01 · Three pillars",
  stages: "02 · Stages of peace",
  recognition: "03 · Two kinds of peace",
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
          <code>orient-pillars</code>, <code>orient-stages</code>,{" "}
          <code>orient-recognition</code>, <code>orient-movement</code>,{" "}
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

      <div className="space-y-2 border-t border-[var(--thusness-rule)] pt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--thusness-muted)]">
          Page copy
        </p>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Index kicker</span>
          <input
            className={`${adminFieldInput} w-full`}
            value={config.copy.indexKicker}
            disabled={isPending}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                copy: { ...prev.copy, indexKicker: e.target.value },
              }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Index title</span>
          <input
            className={`${adminFieldInput} w-full`}
            value={config.copy.indexTitle}
            disabled={isPending}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                copy: { ...prev.copy, indexTitle: e.target.value },
              }))
            }
          />
        </label>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Index intro</span>
          <textarea
            className={`${adminFieldInput} min-h-[72px] w-full resize-y`}
            value={config.copy.indexIntro}
            disabled={isPending}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                copy: { ...prev.copy, indexIntro: e.target.value },
              }))
            }
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Map pillars kicker (left)</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.mapPillarsKicker}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, mapPillarsKicker: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Map pillars hint (right)</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.mapPillarsHint}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, mapPillarsHint: e.target.value },
                }))
              }
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={adminFieldLabel}>TOC sequence label</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.tocSequenceLabel}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, tocSequenceLabel: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={adminFieldLabel}>TOC aside label</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.tocAsideLabel}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, tocAsideLabel: e.target.value },
                }))
              }
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Section sheet prefix</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.sectionSheetIndexPrefix}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, sectionSheetIndexPrefix: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Section context prefix</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.sectionContextPrefix}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, sectionContextPrefix: e.target.value },
                }))
              }
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Section context link label</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.sectionContextLinkLabel}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, sectionContextLinkLabel: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Diagram footer label</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.diagramFooterLabel}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, diagramFooterLabel: e.target.value },
                }))
              }
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Previous kicker</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.prevKicker}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, prevKicker: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Next kicker</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.nextKicker}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, nextKicker: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className={adminFieldLabel}>Back-to-map label</span>
            <input
              className={`${adminFieldInput} w-full`}
              value={config.copy.backToMapLabel}
              disabled={isPending}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, backToMapLabel: e.target.value },
                }))
              }
            />
          </label>
        </div>
        <label className="block space-y-1">
          <span className={adminFieldLabel}>Signature label</span>
          <input
            className={`${adminFieldInput} w-full`}
            value={config.copy.signatureLabel}
            disabled={isPending}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                copy: { ...prev.copy, signatureLabel: e.target.value },
              }))
            }
          />
        </label>

        <div className="space-y-2 border-t border-[var(--thusness-rule)] pt-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--thusness-muted)]">
            Section long-form overrides
          </p>
          <p className="text-[11px] text-[var(--thusness-muted)]">
            Optional plain-text prose shown below each diagram. Leave blank to keep using
            published note content/default prose. Separate paragraphs with a blank line.
          </p>
          {ORIENT_BOOKLET_SLUGS.map((slug) => (
            <label key={`prose-${slug}`} className="block space-y-1">
              <span className={adminFieldLabel}>{LABELS[slug]}</span>
              <textarea
                className={`${adminFieldInput} min-h-[110px] w-full resize-y`}
                value={config.copy.proseOverrides[slug]}
                disabled={isPending}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    copy: {
                      ...prev.copy,
                      proseOverrides: {
                        ...prev.copy.proseOverrides,
                        [slug]: e.target.value,
                      },
                    },
                  }))
                }
              />
            </label>
          ))}
        </div>
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
