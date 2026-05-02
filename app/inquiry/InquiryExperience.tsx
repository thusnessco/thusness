"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { TelegramConnectLink } from "@/components/thusness/TelegramConnectLink";
import Wordmark from "@/components/thusness/Wordmark";
import {
  buildInquiryTrailLine,
  getInquiryStepById,
  resolveInquiryNextStepId,
  stepAllowsFreeText,
} from "@/lib/inquiry/inquiry-flow";
import {
  type InquiryContent,
  type InquiryStep,
  visibleInquirySteps,
} from "@/lib/inquiry/inquiry-content";
import { isVagueResponse, truncateInquirySummaryLine } from "@/lib/inquiry/inquiry-ux";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

type Phase = "inquiry" | "complete";

type TrailEntry = { stepId: string; line: string };

type SavedAnswer = { text: string; choiceId: string | null };

function InquiryEmptySteps() {
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
        <footer className="inquiry-footer-connect">
          <TelegramConnectLink bare />
        </footer>
      </div>
    </div>
  );
}

export function InquiryExperience({ content }: { content: InquiryContent }) {
  const steps = useMemo(() => visibleInquirySteps(content), [content]);

  if (steps.length === 0) {
    return <InquiryEmptySteps />;
  }

  return <InquiryGuidedFlow content={content} steps={steps} />;
}

function InquiryGuidedFlow({
  content,
  steps,
}: {
  content: InquiryContent;
  steps: InquiryStep[];
}) {
  const firstId = steps[0]!.id;
  const [phase, setPhase] = useState<Phase>("inquiry");
  const [trail, setTrail] = useState<TrailEntry[]>([]);
  const [currentStepId, setCurrentStepId] = useState(firstId);
  const [answers, setAnswers] = useState<Record<string, SavedAnswer>>({});
  const [draft, setDraft] = useState("");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const current = useMemo(
    () => getInquiryStepById(steps, currentStepId),
    [steps, currentStepId]
  );

  useEffect(() => {
    if (phase !== "inquiry" || !currentStepId) return;
    const saved = answers[currentStepId];
    setDraft(saved?.text ?? "");
    setSelectedChoiceId(saved?.choiceId ?? null);
  }, [currentStepId, phase, answers]);

  const summaryLines = useMemo(() => trail.map((t) => t.line), [trail]);

  const resetAll = useCallback(() => {
    setPhase("inquiry");
    setTrail([]);
    setCurrentStepId(firstId);
    setAnswers({});
    setDraft("");
    setSelectedChoiceId(null);
  }, [firstId]);

  const handleContinue = useCallback(() => {
    if (!current) return;
    const allowFt = stepAllowsFreeText(current);
    const hasChoices = Boolean(current.choices && current.choices.length > 0);
    const textOk = allowFt && draft.trim().length > 0;
    const choiceOk =
      Boolean(selectedChoiceId) &&
      Boolean(current.choices?.some((c) => c.id === selectedChoiceId));
    if (!textOk && !choiceOk) return;

    const line = buildInquiryTrailLine(current, draft, selectedChoiceId);
    const nextId = resolveInquiryNextStepId(current, selectedChoiceId, steps);

    setAnswers((prev) => ({
      ...prev,
      [current.id]: {
        text: draft.trim(),
        choiceId: selectedChoiceId,
      },
    }));
    setTrail((prev) => [...prev, { stepId: current.id, line }]);

    if (!nextId) {
      setPhase("complete");
      return;
    }
    setCurrentStepId(nextId);
    setDraft("");
    setSelectedChoiceId(null);
  }, [current, draft, selectedChoiceId, steps]);

  const handleBack = useCallback(() => {
    if (phase === "complete") {
      if (trail.length === 0) {
        setPhase("inquiry");
        return;
      }
      const last = trail[trail.length - 1]!;
      setTrail((t) => t.slice(0, -1));
      setPhase("inquiry");
      setCurrentStepId(last.stepId);
      const saved = answers[last.stepId];
      setDraft(saved?.text ?? "");
      setSelectedChoiceId(saved?.choiceId ?? null);
      return;
    }
    if (trail.length === 0) return;
    const last = trail[trail.length - 1]!;
    setTrail((t) => t.slice(0, -1));
    setCurrentStepId(last.stepId);
    const saved = answers[last.stepId];
    setDraft(saved?.text ?? "");
    setSelectedChoiceId(saved?.choiceId ?? null);
  }, [answers, phase, trail]);

  const allowFt = current ? stepAllowsFreeText(current) : false;
  const hasChoices = Boolean(current?.choices && current.choices.length > 0);
  const textOk = allowFt && draft.trim().length > 0;
  const choiceOk =
    Boolean(selectedChoiceId) &&
    Boolean(current?.choices?.some((c) => c.id === selectedChoiceId));
  let canContinue = false;
  if (current) {
    if (!hasChoices) canContinue = textOk;
    else if (!allowFt) canContinue = choiceOk;
    else canContinue = textOk || choiceOk;
  }

  const backDisabled =
    phase === "inquiry" ? trail.length === 0 : false;

  const showVagueHint =
    phase === "inquiry" &&
    allowFt &&
    !selectedChoiceId &&
    draft.trim().length > 0 &&
    isVagueResponse(draft);

  const fieldPlaceholder = (() => {
    const ph = (current?.placeholder ?? "").trim();
    return ph.length > 0 ? ph : undefined;
  })();

  const choiceLeadIn = (() => {
    const per = current?.choiceLeadIn?.trim() ?? "";
    if (per.length > 0) return per;
    return content.choiceLeadIn?.trim() ?? "";
  })();

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (value !== answers[currentStepId]?.text) {
      setSelectedChoiceId(null);
    }
  };

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
      <div className="inquiry-inner inquiry-inner--guided">
        <header className="inquiry-header">
          <Link href="/" className="inline-block opacity-90 transition-opacity hover:opacity-70">
            <Wordmark size={20} tagline="~ as it is" />
          </Link>
        </header>

        <h1 className="inquiry-page-title">{content.pageTitle}</h1>
        <p className="inquiry-page-sub">{content.pageSubtitle}</p>

        {phase === "inquiry" && content.introText.trim() && trail.length === 0 ? (
          <p className="inquiry-intro">{content.introText}</p>
        ) : null}

        {phase === "inquiry" && current ? (
          <div className="inquiry-grid">
            <section className="inquiry-main" key={current.id} aria-live="polite">
              <p className="inquiry-step-kicker">{current.title}</p>
              <p className="inquiry-step-prompt">{current.prompt}</p>

              {hasChoices && choiceLeadIn ? (
                <p className="inquiry-choice-lead">{choiceLeadIn}</p>
              ) : null}

              {hasChoices ? (
                <div className="inquiry-choice-grid" role="group" aria-label="Responses">
                  {current.choices!.map((ch) => {
                    const active = selectedChoiceId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        className={
                          active ? "inquiry-choice-btn inquiry-choice-btn--active" : "inquiry-choice-btn"
                        }
                        onClick={() => {
                          setSelectedChoiceId(ch.id);
                          setDraft("");
                        }}
                      >
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {allowFt ? (
                <textarea
                  id="inquiry-response"
                  className="inquiry-field"
                  rows={hasChoices ? 4 : 5}
                  value={draft}
                  placeholder={fieldPlaceholder}
                  onChange={(e) => onDraftChange(e.target.value)}
                  autoComplete="off"
                  aria-label="Your response"
                />
              ) : null}

              {showVagueHint ? (
                <p className="inquiry-hint" role="note">
                  A few more words from what you actually notice here might make what is
                  gathered beside this a little clearer — only if that feels natural.
                </p>
              ) : null}

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
                  {summaryLines.map((line, i) => {
                    const { display, title } = truncateInquirySummaryLine(line);
                    return (
                      <li
                        key={`${i}-${line.slice(0, 24)}`}
                        className="inquiry-side-item"
                        title={title}
                      >
                        {display}
                      </li>
                    );
                  })}
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
                  <button type="button" className="inquiry-btn inquiry-btn--ghost" onClick={handleBack}>
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
                  {summaryLines.map((line, i) => {
                    const { display, title } = truncateInquirySummaryLine(line);
                    return (
                      <li
                        key={`c-${i}-${line.slice(0, 24)}`}
                        className="inquiry-side-item"
                        title={title}
                      >
                        {display}
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          </div>
        ) : null}
        <footer className="inquiry-footer-connect">
          <TelegramConnectLink bare />
        </footer>
      </div>
    </div>
  );
}
