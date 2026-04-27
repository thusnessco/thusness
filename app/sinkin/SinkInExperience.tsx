"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import Wordmark from "@/components/thusness/Wordmark";
import RedDot from "@/components/thusness/RedDot";
import { defaultSinkInUi, type SinkInConfigV1 } from "@/lib/sinkin/config";
import {
  playSinkInMainChimeFromGesture,
  playSinkInMainChimeHtml,
  playSinkInPulseHtml,
} from "@/lib/sinkin/sinkin-chime-html";
import { playSinkInPulse, playSoftChime } from "@/lib/sinkin/soft-chime";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

/** Some in-app browsers never settle `Audio.play()`; cap wait so steps still advance. */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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

export function SinkInExperience({ config }: { config: SinkInConfigV1 }) {
  const steps = config.steps;
  const stepsLen = steps.length;
  const ui = { ...defaultSinkInUi, ...config.ui };
  const crossfadeMs = config.crossfadeMs;
  const midToneIntervalSec = config.midToneIntervalSec;
  const cueToneHz = config.cueToneHz;

  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [heroLeaving, setHeroLeaving] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const advanceAtRef = useRef(0);
  const stepStartedAtRef = useRef(0);
  const frozenAdvanceRemRef = useRef(0);
  const advanceTimerRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);
  const midPingTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const stepIndexRef = useRef(-1);
  const isPausedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) setHeroLeaving(false);
  }, [isPaused]);

  const ensureAudio = useCallback(() => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    if (audioCtxRef.current?.state === "closed") {
      audioCtxRef.current = null;
    }
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new Ctx({ latencyHint: "interactive" });
      } catch {
        audioCtxRef.current = new Ctx();
      }
    }
    return audioCtxRef.current;
  }, []);

  const holdForStep = useCallback(
    (idx: number) => {
      const s = steps[idx];
      if (!s) return 60;
      return Math.max(30, Math.min(720, Math.round(s.holdSec)));
    },
    [steps]
  );

  const scheduleAdvance = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (!running || stepIndex < 0 || isPaused) return;
    if (stepIndex >= stepsLen - 1) return;
    const rem = Math.max(0, advanceAtRef.current - Date.now());
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      void (async () => {
        const idx = stepIndexRef.current;
        if (idx < 0 || idx >= stepsLen - 1) return;
        const ctx = ensureAudio();
        const playMainCue = async () => {
          try {
            await playSinkInMainChimeHtml(cueToneHz);
          } catch {
            if (ctx) await playSoftChime(ctx, cueToneHz);
          }
        };
        await Promise.race([playMainCue(), sleep(2500)]);
        if (!mountedRef.current) return;
        setHeroLeaving(true);
        leaveTimerRef.current = window.setTimeout(() => {
          leaveTimerRef.current = null;
          if (!mountedRef.current || isPausedRef.current) {
            setHeroLeaving(false);
            return;
          }
          setStepIndex(idx + 1);
          setHeroLeaving(false);
        }, crossfadeMs);
      })();
    }, rem);
  }, [running, stepIndex, isPaused, stepsLen, ensureAudio, crossfadeMs, cueToneHz]);

  const clearMidPing = useCallback(() => {
    if (midPingTimerRef.current != null) {
      clearTimeout(midPingTimerRef.current);
      midPingTimerRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    if (!running || stepIndex < 0) return;
    const now = Date.now();
    stepStartedAtRef.current = now;
    advanceAtRef.current = now + holdForStep(stepIndex) * 1000;
  }, [running, stepIndex, holdForStep]);

  /** Soft pulses on long steps (not on last passage). */
  useEffect(() => {
    if (!running || stepIndex < 0 || isPaused) {
      clearMidPing();
      return;
    }
    if (stepIndex >= stepsLen - 1) {
      clearMidPing();
      return;
    }
    const mid = midToneIntervalSec;
    if (!mid || mid <= 0) {
      clearMidPing();
      return;
    }
    const bufferMs = 2500;
    const intervalMs = mid * 1000;
    const deadline = advanceAtRef.current;
    const now = Date.now();
    if (deadline - bufferMs - now < intervalMs) {
      clearMidPing();
      return;
    }

    const tick = async () => {
      midPingTimerRef.current = null;
      if (!mountedRef.current || isPausedRef.current) return;
      const idx = stepIndexRef.current;
      if (idx < 0 || idx >= stepsLen - 1) return;
      if (Date.now() >= advanceAtRef.current - bufferMs) return;
      const ctx = ensureAudio();
      const playPulseCue = async () => {
        try {
          await playSinkInPulseHtml(cueToneHz);
        } catch {
          if (ctx) await playSinkInPulse(ctx, cueToneHz);
        }
      };
      await Promise.race([playPulseCue(), sleep(1500)]);
      const nextDelay = intervalMs;
      if (Date.now() + nextDelay >= advanceAtRef.current - bufferMs) return;
      midPingTimerRef.current = window.setTimeout(() => {
        void tick();
      }, nextDelay);
    };

    const firstDelay = Math.max(
      0,
      Math.min(intervalMs, stepStartedAtRef.current + intervalMs - Date.now())
    );
    midPingTimerRef.current = window.setTimeout(() => {
      void tick();
    }, firstDelay);
    return () => clearMidPing();
  }, [
    running,
    stepIndex,
    isPaused,
    midToneIntervalSec,
    stepsLen,
    clearMidPing,
    ensureAudio,
    cueToneHz,
  ]);

  useEffect(() => {
    scheduleAdvance();
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
    };
  }, [scheduleAdvance]);

  const handleBegin = () => {
    playSinkInMainChimeFromGesture(cueToneHz);
    setIsPaused(false);
    setHeroLeaving(false);
    setStepIndex(0);
    setRunning(true);
  };

  const handleStop = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    clearMidPing();
    setRunning(false);
    setStepIndex(-1);
    setIsPaused(false);
    setHeroLeaving(false);
  };

  const handlePauseToggle = useCallback(() => {
    setIsPaused((p) => {
      if (!p) {
        frozenAdvanceRemRef.current = Math.max(
          0,
          advanceAtRef.current - Date.now()
        );
        return true;
      }
      advanceAtRef.current = Date.now() + frozenAdvanceRemRef.current;
      return false;
    });
  }, []);

  const current = stepIndex >= 0 ? steps[stepIndex] : null;
  const isLastStep = stepIndex === stepsLen - 1;
  const showFooter = !running || ui.showFooter;

  const heroClass = ["sinkin-hero", heroLeaving ? "sinkin-hero--leave" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="sinkin-root"
      style={{
        position: "relative",
        width: "100%",
        alignSelf: "stretch",
        minHeight: "100vh",
        background: "var(--thusness-bg, #efece1)",
        color: "var(--thusness-ink, #1a1915)",
        fontFamily: helv,
        WebkitFontSmoothing: "antialiased",
        paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 32px" }}>
        <header style={{ marginBottom: running ? 20 : 36 }}>
          <Wordmark size={20} tagline="~ as it is" />
        </header>

        {(!running || ui.showProgramTitle) && (
          <h1
            style={{
              margin: "0 auto 24px",
              maxWidth: 620,
              fontSize: 11,
              lineHeight: 1.5,
              fontWeight: 500,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "var(--thusness-muted, #8a8672)",
              textAlign: "center",
            }}
          >
            {config.programTitle}
          </h1>
        )}

        {!running && stepIndex < 0 ? (
          <div style={{ margin: "0 auto", maxWidth: 520, textAlign: "center" }}>
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
          </div>
        ) : null}

        {running && current ? (
          <div
            className={heroClass}
            style={
              {
                ["--sinkin-crossfade-ms" as string]: `${crossfadeMs}ms`,
              } as Record<string, string>
            }
          >
            {ui.showSectionLabel ? (
              <p key={`k-${stepIndex}`} className="sinkin-hero-kicker">
                {current.label}
              </p>
            ) : null}
            <p key={stepIndex} className="sinkin-hero-body">
              {current.body}
            </p>
            {isLastStep ? (
              <p
                key={`c-${stepIndex}`}
                className="sinkin-hero-closing"
                style={{ whiteSpace: "pre-line" }}
              >
                {config.closingMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {showFooter ? (
        <footer
          style={{
            margin: "48px auto 0",
            maxWidth: 880,
            padding: "24px 24px 0",
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
        <div style={{ height: 32 }} aria-hidden />
      )}

      <div className="sinkin-dock">
        <div className="sinkin-dock-inner">
          {!running ? (
            <button
              type="button"
              className="sinkin-dock-btn sinkin-dock-btn--primary"
              disabled={stepsLen === 0}
              onClick={handleBegin}
            >
              Begin
            </button>
          ) : (
            <>
              <button
                type="button"
                className="sinkin-dock-btn"
                onClick={handlePauseToggle}
                title={isPaused ? "Resume" : "Pause"}
                aria-label={isPaused ? "Resume session" : "Pause session"}
              >
                {isPaused ? <SinkinResumeIcon /> : <SinkinPauseIcon />}
              </button>
              <button
                type="button"
                className="sinkin-dock-btn sinkin-dock-btn--end"
                onClick={handleStop}
                aria-label="End session"
              >
                <span className="sinkin-dock-end-label">End session</span>
                <span className="sinkin-stop-square" aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
