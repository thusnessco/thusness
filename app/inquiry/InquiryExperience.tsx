"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import Wordmark from "@/components/thusness/Wordmark";
import {
  formatInquirySummary,
  type InquiryContent,
  type InquiryStep,
  visibleInquirySteps,
} from "@/lib/inquiry/inquiry-content";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

type Phase = "inquiry" | "complete";

export function InquiryExperience({ content }: { content: InquiryContent }) {
  const steps = useMemo(() => visibleInquirySteps(content), [content]);
  const [phase, setPhase] = useState<Phase>("inquiry");
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");

  const current: InquiryStep | undefined = steps[activeIndex];
  const isLast = activeIndex >= steps.length - 1;

  useEffect(() => {
    if (phase !== "inquiry") return;
    const id = steps[activeIndex]?.id;
    if (!id) return;
    setDraft(answers[id] ?? "");
  }, [activeIndex, answers, phase, steps]);

  const summaryLines = useMemo(() => {
    if (phase === "complete") {
      return steps
        .map((s) => {
          const a = (answers[s.id] ?? "").trim();
          if (!a) return null;
          return formatInquirySummary(s.summaryTemplate, a);
        })
        .filter((x): x is string => Boolean(x));
    }
    const lines: string[] = [];
    for (let i = 0; i < activeIndex; i++) {
      const s = steps[i];
      const a = (answers[s.id] ?? "").trim();
      if (!s || !a) continue;
      lines.push(formatInquirySummary(s.summaryTemplate, a));
    }
    return lines;
  }, [activeIndex, answers, phase, steps]);

  const resetAll = useCallback(() => {
    setPhase("inquiry");
    setActiveIndex(0);
    setAnswers({});
    setDraft("");
  }, []);

  const handleContinue = useCallback(() => {
    if (!current) return;
    const trimmed = draft.trim();
    if (!trimmed) return;
    setAnswers((prev) => ({ ...prev, [current.id]: trimmed }));
    if (isLast) {
      setPhase("complete");
      return;
    }
    setActiveIndex((i) => i + 1);
  }, [current, draft, isLast]);

  const handleBack = useCallback(() => {
    if (phase === "complete") {
      setPhase("inquiry");
      setActiveIndex(Math.max(0, steps.length - 1));
      return;
    }
    if (activeIndex <= 0) return;
    setActiveIndex((i) => i - 1);
  }, [activeIndex, phase, steps.length]);

  const canContinue = draft.trim().length > 0;
  const backDisabled = phase === "inquiry" && activeIndex <= 0;

  if (steps.length === 0) {
    return (
      <div
        className="inquiry-root"
        style={{
          minHeight: "100vh",
          boxSizing: "border-box",
          background: "var(--thusness-bg, #efece1)",
          color: "var(--thusness-ink, #1a1915)",
          fontFamily: helv,
          WebkitFontSmoothing: "antialiased",
          padding: "48px 24px",
        }}
      >
        <div className="inquiry-inner">
          <header className="inquiry-header">
            <Link href="/" className="inline-block opacity-90 transition-opacity hover:opacity-70">
              <Wordmark size={20} tagline="~ as it is" />
            </Link>
          </header>
          <p className="inquiry-page-sub" style={{ marginTop: 28 }}>
            This inquiry path has no enabled steps yet. An editor can enable steps in admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="inquiry-root"
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        background: "var(--thusness-bg, #efece1)",
        color: "var(--thusness-ink, #1a1915)",
        fontFamily: helv,
        WebkitFontSmoothing: "antialiased",
        paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="inquiry-inner">
        <header className="inquiry-header">
          <Link href="/" className="inline-block opacity-90 transition-opacity hover:opacity-70">
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
        </header>

        <h1 className="inquiry-page-title">{content.pageTitle}</h1>
        <p className="inquiry-page-sub">{content.pageSubtitle}</p>

        {phase === "inquiry" && content.introText.trim() && activeIndex === 0 ? (
          <p className="inquiry-intro">{content.introText}</p>
        ) : null}

        {phase === "inquiry" && current ? (
          <div className="inquiry-grid">
            <section className="inquiry-main" key={current.id} aria-live="polite">
              <p className="inquiry-step-kicker">{current.title}</p>
              <p className="inquiry-step-prompt">{current.prompt}</p>
              <textarea
                id="inquiry-response"
                className="inquiry-field"
                rows={5}
                value={draft}
                placeholder={current.placeholder}
                onChange={(e) => setDraft(e.target.value)}
                autoComplete="off"
                aria-label="Your response"
              />
              <div className="inquiry-actions">
                <button
                  type="button"
                  className="inquiry-btn inquiry-btn--ghost"
                  onClick={handleBack}
                  disabled={backDisabled}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="inquiry-btn inquiry-btn--primary"
                  onClick={handleContinue}
                  disabled={!canContinue}
                >
                  Continue
                </button>
              </div>
              <button type="button" className="inquiry-reset" onClick={resetAll}>
                Begin again
              </button>
            </section>

            <aside className="inquiry-side" aria-label={content.sidePanelTitle}>
              <h2 className="inquiry-side-title">{content.sidePanelTitle}</h2>
              {summaryLines.length === 0 ? (
                <p className="inquiry-side-empty">{content.sidePanelEmptyMessage}</p>
              ) : (
                <ul className="inquiry-side-list">
                  {summaryLines.map((line, i) => (
                    <li key={`${i}-${line.slice(0, 24)}`} className="inquiry-side-item">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        ) : null}

        {phase === "complete" ? (
          <div className="inquiry-complete">
            <div className="inquiry-grid">
              <section className="inquiry-main" aria-live="polite">
                <p className="inquiry-reflection">{content.finalReflection}</p>
                {content.finalReflectionSecondary.trim() ? (
                  <p className="inquiry-reflection inquiry-reflection--secondary">
                    {content.finalReflectionSecondary}
                  </p>
                ) : null}
                <div className="inquiry-actions inquiry-actions--complete">
                  <button
                    type="button"
                    className="inquiry-btn inquiry-btn--ghost"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                  <button type="button" className="inquiry-btn inquiry-btn--primary" onClick={resetAll}>
                    Begin again
                  </button>
                </div>
              </section>
              <aside className="inquiry-side" aria-label={content.sidePanelTitle}>
                <h2 className="inquiry-side-title">{content.sidePanelTitle}</h2>
                <ul className="inquiry-side-list">
                  {summaryLines.map((line, i) => (
                    <li key={`c-${i}-${line.slice(0, 24)}`} className="inquiry-side-item">
                      {line}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
