"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

/** Fade passage out, blank gap, fade keyword in (ms). */
const FADE_OUT_MS = 5000;
const GAP_MS = 1000;
const FADE_IN_MS = 5000;

const TICK_MS = 200;

function intervalSelectOptions(sec: number): { sec: number; label: string }[] {
  const base = [...INTERVAL_OPTIONS];
  if (!base.some((o) => o.sec === sec)) {
    base.push({ sec, label: `${sec} seconds` });
    base.sort((a, b) => a.sec - b.sec);
  }
  return base;
}

type FocusSeqPhase = "full" | "fadeOut" | "blank" | "fadeIn" | "focus";

function focusSequencePhase(
  elapsedMs: number,
  focusAfterSec: number,
  focusEnabled: boolean,
  isLast: boolean
): FocusSeqPhase {
  if (!focusEnabled || isLast) return "full";
  const t0 = focusAfterSec * 1000;
  const t1 = t0 + FADE_OUT_MS;
  const t2 = t1 + GAP_MS;
  const t3 = t2 + FADE_IN_MS;
  if (elapsedMs < t0) return "full";
  if (elapsedMs < t1) return "fadeOut";
  if (elapsedMs < t2) return "blank";
  if (elapsedMs < t3) return "fadeIn";
  return "focus";
}

function SinkinPauseIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
      <rect x="1" y="1" width="4" height="14" rx="0.5" fill="currentColor" />
      <rect x="9" y="1" width="4" height="14" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function SinkinResumeIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
      <path d="M1 1 L13 8 L1 15 Z" fill="currentColor" />
    </svg>
  );
}

function SessionIconControls({
  isPaused,
  onPauseToggle,
  onEnd,
}: {
  isPaused: boolean;
  onPauseToggle: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="sinkin-phase-actions">
      <button
        type="button"
        className="sinkin-icon-btn"
        onClick={onPauseToggle}
        title={isPaused ? "Resume" : "Pause"}
        aria-label={isPaused ? "Resume session" : "Pause session"}
      >
        {isPaused ? <SinkinResumeIcon /> : <SinkinPauseIcon />}
      </button>
      <button
        type="button"
        className="sinkin-icon-btn"
        onClick={onEnd}
        title="End session"
        aria-label="End session"
      >
        <span className="sinkin-stop-square" />
      </button>
    </div>
  );
}

export function SinkInExperience({ config }: { config: SinkInConfigV1 }) {
  const steps = config.steps;
  const ui = { ...defaultSinkInUi, ...config.ui };
  const [intervalSec, setIntervalSec] = useState<number>(config.intervalSec);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [, setTick] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const stepFocusClockStartRef = useRef(0);
  const advanceAtRef = useRef(0);
  const frozenFocusElapsedRef = useRef(0);
  const frozenAdvanceRemRef = useRef(0);

  const ensureAudio = useCallback(() => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  }, []);

  const resetStepClocks = useCallback(() => {
    const now = Date.now();
    stepFocusClockStartRef.current = now;
    advanceAtRef.current = now + intervalSec * 1000;
  }, [intervalSec]);

  useLayoutEffect(() => {
    if (!running || stepIndex < 0) return;
    resetStepClocks();
  }, [running, stepIndex, resetStepClocks]);

  const handleBegin = () => {
    const ctx = ensureAudio();
    if (ctx) void playSoftChime(ctx);
    setIsPaused(false);
    setStepIndex(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    setStepIndex(-1);
    setIsPaused(false);
  };

  const handlePauseToggle = useCallback(() => {
    setIsPaused((p) => {
      if (!p) {
        frozenFocusElapsedRef.current =
          Date.now() - stepFocusClockStartRef.current;
        frozenAdvanceRemRef.current = Math.max(
          0,
          advanceAtRef.current - Date.now()
        );
        return true;
      }
      advanceAtRef.current = Date.now() + frozenAdvanceRemRef.current;
      stepFocusClockStartRef.current =
        Date.now() - frozenFocusElapsedRef.current;
      return false;
    });
  }, []);

  useEffect(() => {
    if (!running || stepIndex < 0 || isPaused) return;
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, [running, stepIndex, isPaused]);

  useEffect(() => {
    if (!running || stepIndex < 0) return;
    if (stepIndex >= steps.length - 1) return;
    if (isPaused) return;
    const rem = Math.max(0, advanceAtRef.current - Date.now());
    const id = window.setTimeout(() => {
      const ctx = ensureAudio();
      if (ctx) void playSoftChime(ctx);
      setStepIndex((s) => s + 1);
    }, rem);
    return () => window.clearTimeout(id);
  }, [running, stepIndex, intervalSec, isPaused, ensureAudio, steps.length]);

  const current = stepIndex >= 0 ? steps[stepIndex] : null;
  const stepNum = stepIndex + 1;
  const total = steps.length;
  const isLastStep = stepIndex === steps.length - 1;
  const useFocusBeat =
    Boolean(running && current && config.focusPhaseEnabled && !isLastStep);
  const showFooter = !running || ui.showFooter;

  const focusElapsedMs = (() => {
    if (!running || stepIndex < 0) return 0;
    if (isPaused) return frozenFocusElapsedRef.current;
    return Date.now() - stepFocusClockStartRef.current;
  })();

  const focusSeqPhase = focusSequencePhase(
    focusElapsedMs,
    config.focusAfterSec,
    Boolean(config.focusPhaseEnabled),
    isLastStep
  );

  const fullLayerVisible = useFocusBeat && focusSeqPhase === "full";
  const focusLayerVisible =
    useFocusBeat &&
    (focusSeqPhase === "fadeIn" || focusSeqPhase === "focus");

  const intervalWindowMs = intervalSec * 1000;
  const advanceRemainingMs = (() => {
    if (!running || stepIndex < 0 || isLastStep) return intervalWindowMs;
    if (isPaused) return frozenAdvanceRemRef.current;
    return Math.max(0, advanceAtRef.current - Date.now());
  })();

  const intervalRemainingPct = Math.min(
    100,
    Math.max(0, (advanceRemainingMs / intervalWindowMs) * 100)
  );

  const sessionSlotMs = Math.max(1, steps.length * intervalWindowMs);
  const sessionElapsedMs = Math.min(
    sessionSlotMs,
    stepIndex * intervalWindowMs +
      (running && stepIndex >= 0
        ? isPaused
          ? frozenFocusElapsedRef.current
          : Date.now() - stepFocusClockStartRef.current
        : 0)
  );
  const sessionRemainingPct = Math.min(
    100,
    Math.max(0, (1 - sessionElapsedMs / sessionSlotMs) * 100)
  );

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
                  whiteSpace: "pre-line",
                }}
              >
                {config.introBlurb}
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
                Intro, timing, and what appears during steps are set in Admin → Sink
                in (hidden page).
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
                    fullLayerVisible ? "sinkin-phase-layer--visible" : ""
                  }`}
                >
                  {renderFullStepBody()}
                </div>
                <div
                  className={`sinkin-phase-layer sinkin-phase-layer--focus ${
                    focusLayerVisible ? "sinkin-phase-layer--visible" : ""
                  }`}
                >
                  <p className="sinkin-keyword">{current.keyword}</p>
                </div>
              </div>
              <SessionIconControls
                isPaused={isPaused}
                onPauseToggle={handlePauseToggle}
                onEnd={handleStop}
              />
            </div>
          ) : null}

          {running && current && !useFocusBeat ? (
            <div key={current.id} className="sinkin-step-animate" style={{ marginTop: 24 }}>
              {renderFullStepBody()}
              <SessionIconControls
                isPaused={isPaused}
                onPauseToggle={handlePauseToggle}
                onEnd={handleStop}
              />
            </div>
          ) : null}

          {running && stepIndex >= 0 ? (
            <div className="sinkin-time-tray" aria-live="polite">
              <div className="sinkin-time-row">
                <span className="sinkin-time-label">Session</span>
                <div className="sinkin-time-track">
                  <div
                    className="sinkin-time-fill"
                    style={{ width: `${sessionRemainingPct}%` }}
                  />
                </div>
              </div>
              {!isLastStep ? (
                <div className="sinkin-time-row">
                  <span className="sinkin-time-label">Interval</span>
                  <div className="sinkin-time-track">
                    <div
                      className="sinkin-time-fill"
                      style={{ width: `${intervalRemainingPct}%` }}
                    />
                  </div>
                </div>
              ) : null}
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
