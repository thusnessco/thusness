"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { saveInquiryConfig } from "@/app/admin/actions";
import {
  defaultInquiryContent,
  type InquiryContent,
  type InquiryStep,
} from "@/lib/inquiry/inquiry-content";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";

function sortedSteps(steps: InquiryStep[]): InquiryStep[] {
  return steps
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

export function InquiryEditorPanel({
  initialContent,
  isPending,
  startTransition,
  onMessage,
}: {
  initialContent: InquiryContent;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState<InquiryContent>(initialContent);
  const ordered = useMemo(() => sortedSteps(content.steps), [content.steps]);

  function updateStep(id: string, patch: Partial<InquiryStep>) {
    setContent((c) => ({
      ...c,
      steps: c.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-lg font-medium tracking-tight text-[var(--thusness-ink)]">
          Inquiry
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
          Public page at{" "}
          <Link
            href="/inquiry"
            className="text-[var(--thusness-ink)] underline decoration-[var(--thusness-rule)] underline-offset-4"
          >
            /inquiry
          </Link>
          . Answers stay in the browser only; nothing here is stored per visitor.
        </p>
      </header>

      <div className="grid max-w-2xl gap-4">
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Page title</span>
          <input
            type="text"
            disabled={isPending}
            value={content.pageTitle}
            onChange={(e) =>
              setContent((c) => ({ ...c, pageTitle: e.target.value }))
            }
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Page subtitle</span>
          <input
            type="text"
            disabled={isPending}
            value={content.pageSubtitle}
            onChange={(e) =>
              setContent((c) => ({ ...c, pageSubtitle: e.target.value }))
            }
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Intro (shown above the first step)</span>
          <textarea
            rows={3}
            disabled={isPending}
            value={content.introText}
            onChange={(e) =>
              setContent((c) => ({ ...c, introText: e.target.value }))
            }
            className={`${adminFieldInput} min-h-[88px] resize-y`}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Side panel title</span>
          <input
            type="text"
            disabled={isPending}
            value={content.sidePanelTitle}
            onChange={(e) =>
              setContent((c) => ({ ...c, sidePanelTitle: e.target.value }))
            }
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Side panel empty message</span>
          <textarea
            rows={2}
            disabled={isPending}
            value={content.sidePanelEmptyMessage}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                sidePanelEmptyMessage: e.target.value,
              }))
            }
            className={`${adminFieldInput} min-h-[72px] resize-y`}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Final reflection (first paragraph)</span>
          <textarea
            rows={4}
            disabled={isPending}
            value={content.finalReflection}
            onChange={(e) =>
              setContent((c) => ({ ...c, finalReflection: e.target.value }))
            }
            className={`${adminFieldInput} min-h-[120px] resize-y`}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Final reflection (second paragraph)</span>
          <textarea
            rows={3}
            disabled={isPending}
            value={content.finalReflectionSecondary}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                finalReflectionSecondary: e.target.value,
              }))
            }
            className={`${adminFieldInput} min-h-[96px] resize-y`}
          />
        </label>
      </div>

      <div className="space-y-6 border-t border-[var(--thusness-rule)] pt-6">
        <p className={adminFieldLabel}>Steps</p>
        <p className="text-[11px] text-[var(--thusness-muted)]">
          Use <code className="text-[10px]">{"{answer}"}</code> in summary templates. Lower sort order
          runs first. Disabled steps are hidden on the public page.
        </p>
        {ordered.map((step) => (
          <div
            key={step.id}
            className="space-y-3 rounded border border-[var(--thusness-rule)] p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--thusness-muted)]">
                {step.id}
              </span>
              <label className="flex items-center gap-2 text-sm text-[var(--thusness-ink-soft)]">
                <input
                  type="checkbox"
                  className="border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
                  checked={step.enabled}
                  disabled={isPending}
                  onChange={(e) =>
                    updateStep(step.id, { enabled: e.target.checked })
                  }
                />
                Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--thusness-ink-soft)]">
                <span className="text-[var(--thusness-muted)]">Order</span>
                <input
                  type="number"
                  className={`${adminFieldInput} w-20`}
                  disabled={isPending}
                  value={step.sortOrder}
                  onChange={(e) =>
                    updateStep(step.id, {
                      sortOrder: Number(e.target.value) || 0,
                    })
                  }
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className={adminFieldLabel}>Step label (small kicker)</span>
              <input
                type="text"
                disabled={isPending}
                value={step.title}
                onChange={(e) =>
                  updateStep(step.id, { title: e.target.value })
                }
                className={adminFieldInput}
              />
            </label>
            <label className="block space-y-1">
              <span className={adminFieldLabel}>Prompt</span>
              <textarea
                rows={3}
                disabled={isPending}
                value={step.prompt}
                onChange={(e) =>
                  updateStep(step.id, { prompt: e.target.value })
                }
                className={`${adminFieldInput} resize-y`}
              />
            </label>
            <label className="block space-y-1">
              <span className={adminFieldLabel}>Placeholder</span>
              <input
                type="text"
                disabled={isPending}
                value={step.placeholder}
                onChange={(e) =>
                  updateStep(step.id, { placeholder: e.target.value })
                }
                className={adminFieldInput}
              />
              <span className="text-[10px] text-[var(--thusness-muted)]">
                Leave blank so the public page shows no grey example text in the box.
              </span>
            </label>
            <label className="block space-y-1">
              <span className={adminFieldLabel}>Summary template</span>
              <textarea
                rows={2}
                disabled={isPending}
                value={step.summaryTemplate}
                onChange={(e) =>
                  updateStep(step.id, { summaryTemplate: e.target.value })
                }
                className={`${adminFieldInput} resize-y`}
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
              const res = await saveInquiryConfig(content);
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Inquiry saved.");
                router.refresh();
              }
            });
          }}
        >
          Save inquiry
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
            setContent(defaultInquiryContent());
          }}
        >
          Reset form to defaults
        </button>
      </div>
    </div>
  );
}
