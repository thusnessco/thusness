"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Wordmark from "@/components/thusness/Wordmark";
import RedDot from "@/components/thusness/RedDot";
import { defaultSinkInUi, type SinkInConfigV1 } from "@/lib/sinkin/config";
import { playSoftChime } from "@/lib/sinkin/soft-chime";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

const INTERVAL_OPTIONS: { sec: number; label: string }[] = [
  { sec: 45, label: "45 seconds" },
  { sec: 60, label: "1 minute" },
  { sec: 90, label: "90 seconds" },
  { sec: 120, label: "2 minutes" },
];

function intervalSelectOptions(sec: number): { sec: number; label: string }[] {
  const base = [...INTERVAL_OPTIONS];
  if (!base.some((o) => o.sec === sec)) {
    base.push({ sec, label: `${sec} seconds` });
    base.sort((a, b) => a.sec - b.sec);
  }
  return base;
}

export function SinkInExperience({ config }: { config: SinkInConfigV1 }) {
  const steps = config.steps;
  const ui = { ...defaultSinkInUi, ...config.ui };
  const [intervalSec, setIntervalSec] = useState<number>(config.intervalSec);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [phase, setPhase] = useState<"full" | "focus">("full");
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureAudio = useCallback(() => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }, []);

  const handleBegin = () => {
    const ctx = ensureAudio();
    if (ctx) playSoftChime(ctx);
    setPhase("full");
    setStepIndex(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    setStepIndex(-1);
    setPhase("full");
  };

  useEffect(() => {
    if (!running) return;
    if (stepIndex < 0) return;
    if (stepIndex >= steps.length - 1) return;

    const id = window.setTimeout(() => {
      const ctx = ensureAudio();
      if (ctx) playSoftChime(ctx);
      setStepIndex((s) => s + 1);
    }, intervalSec * 1000);

    return () => window.clearTimeout(id);
  }, [running, stepIndex, intervalSec, ensureAudio, steps.length]);

  useEffect(() => {
    if (!running || stepIndex < 0) {
      setPhase("full");
      return;
    }
    if (!config.focusPhaseEnabled) {
      setPhase("full");
      return;
    }
    if (stepIndex >= steps.length - 1) {
      setPhase("full");
      return;
    }
    setPhase("full");
    const t = window.setTimeout(
      () => setPhase("focus"),
      config.focusAfterSec * 1000
    );
    return () => window.clearTimeout(t);
  }, [running, stepIndex, config.focusAfterSec, config.focusPhaseEnabled, steps.length]);

  const current = stepIndex >= 0 ? steps[stepIndex] : null;
  const stepNum = stepIndex + 1;
  const total = steps.length;
  const isLastStep = stepIndex === steps.length - 1;
  const useFocusBeat =
    Boolean(running && current && config.focusPhaseEnabled && !isLastStep);
  const showFooter = !running || ui.showFooter;

  function renderFullStepBody() {
    if (!current) return null;
    return (
      <>
        {ui.showProgress ? (
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 11,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--thusness-muted, #8a8672)",
            }}
          >
            {stepNum} / {total} · when you hear the tone, read
          </p>
        ) : null}
        {ui.showSectionLabel ? (
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              fontStyle: "italic",
              letterSpacing: "0.04em",
              color: "var(--thusness-muted, #8a8672)",
            }}
          >
            {current.label}
          </p>
        ) : null}
        <p
          style={{
            margin: 0,
            fontSize: "clamp(1.05rem, 2.8vw, 1.25rem)",
            lineHeight: 1.65,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--thusness-ink, #1a1915)",
          }}
        >
          {current.body}
        </p>
        {ui.showRestHint && stepIndex < steps.length - 1 ? (
          <p
            style={{
              marginTop: 36,
              fontSize: 14,
              fontStyle: "italic",
              lineHeight: 1.6,
              color: "var(--thusness-muted, #8a8672)",
            }}
          >
            When you have read this, you might soften your gaze, close your eyes,
            and rest until the next tone.
          </p>
        ) : null}
        {isLastStep ? (
          <p
            style={{
              marginTop: 32,
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--thusness-ink-soft, #3d3a2f)",
            }}
          >
            This was the last passage. Stay as long as you like. Thank you for
            sitting with this.
          </p>
        ) : null}
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--thusness-bg, #efece1)",
        color: "var(--thusness-ink, #1a1915)",
        fontFamily: helv,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 40px 96px" }}>
        <header style={{ marginBottom: running ? 28 : 40 }}>
          <Wordmark size={20} tagline="~ as it is" />
        </header>

        <div style={{ margin: "0 auto", maxWidth: 620 }}>
          {(!running || ui.showProgramTitle) && (
            <h1
              style={{
                margin: "0 0 28px",
                fontSize: 11,
                lineHeight: 1.5,
                fontWeight: 500,
                letterSpacing: "2.4px",
                textTransform: "uppercase",
                color: "var(--thusness-muted, #8a8672)",
              }}
            >
              {config.programTitle}
            </h1>
          )}

          {!running && stepIndex < 0 ? (
            <div style={{ marginTop: 8 }}>
              <p
                style={{
                  margin: "0 0 28px",
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--thusness-ink-soft, #3d3a2f)",
                }}
              >
                Close your eyes between each part. A soft tone marks when to open
                your eyes and read the next passage. After a short while the words
                fade to a single anchor you can rest with.
              </p>
              <label
                style={{
                  display: "block",
                  marginBottom: 20,
                  fontSize: 13,
                  color: "var(--thusness-ink-soft, #3d3a2f)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--thusness-muted, #8a8672)",
                  }}
                >
                  Time between readings
                </span>
                <select
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(Number(e.target.value))}
                  style={{
                    width: "100%",
                    maxWidth: 280,
                    border: "1px solid var(--thusness-rule, #c7c2b0)",
                    background: "var(--thusness-bg, #efece1)",
                    padding: "10px 12px",
                    fontSize: 14,
                    color: "var(--thusness-ink, #1a1915)",
                    fontFamily: helv,
                  }}
                >
                  {intervalSelectOptions(intervalSec).map((o) => (
                    <option key={o.sec} value={o.sec}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 12,
                  color: "var(--thusness-muted, #8a8672)",
                }}
              >
                Timing and what appears on screen are set in Admin → Sink in
                (hidden page).
              </p>
              <button
                type="button"
                disabled={steps.length === 0}
                onClick={handleBegin}
                style={{
                  border: "1px solid var(--thusness-ink, #1a1915)",
                  background: "transparent",
                  padding: "12px 28px",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--thusness-ink, #1a1915)",
                  cursor: steps.length === 0 ? "not-allowed" : "pointer",
                  opacity: steps.length === 0 ? 0.45 : 1,
                  fontFamily: helv,
                }}
              >
                Begin
              </button>
            </div>
          ) : null}

          {running && current && useFocusBeat ? (
            <div key={current.id} className="sinkin-phase-slot sinkin-step-animate">
              <div className="sinkin-phase-stage">
                <div
                  className={`sinkin-phase-layer sinkin-phase-layer--full ${
                    phase === "full" ? "sinkin-phase-layer--visible" : ""
                  }`}
                >
                  {renderFullStepBody()}
                </div>
                <div
                  className={`sinkin-phase-layer sinkin-phase-layer--focus ${
                    phase === "focus" ? "sinkin-phase-layer--visible" : ""
                  }`}
                >
                  <p className="sinkin-keyword">{current.keyword}</p>
                </div>
              </div>
              <div className="sinkin-phase-actions">
                <button
                  type="button"
                  onClick={handleStop}
                  style={{
                    border: "1px solid var(--thusness-rule, #c7c2b0)",
                    background: "transparent",
                    padding: "10px 20px",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--thusness-ink-soft, #3d3a2f)",
                    cursor: "pointer",
                    fontFamily: helv,
                  }}
                >
                  End session
                </button>
              </div>
            </div>
          ) : null}

          {running && current && !useFocusBeat ? (
            <div key={current.id} className="sinkin-step-animate" style={{ marginTop: 24 }}>
              {renderFullStepBody()}
              <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleStop}
                  style={{
                    border: "1px solid var(--thusness-rule, #c7c2b0)",
                    background: "transparent",
                    padding: "10px 20px",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--thusness-ink-soft, #3d3a2f)",
                    cursor: "pointer",
                    fontFamily: helv,
                  }}
                >
                  End session
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {showFooter ? (
          <footer
            style={{
              marginTop: 80,
              paddingTop: 24,
              borderTop: "1px solid var(--thusness-rule, #c7c2b0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              letterSpacing: 2,
              color: "var(--thusness-muted, #8a8672)",
              textTransform: "uppercase",
            }}
          >
            <span>thusness.co · sink in</span>
            <RedDot />
          </footer>
        ) : (
          <div style={{ marginTop: 56 }} aria-hidden />
        )}
      </div>
    </div>
  );
}
