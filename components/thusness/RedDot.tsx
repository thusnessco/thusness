"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

import "./red-dot-burn.css";

const RED = "var(--thusness-red, #c23a2a)";

const BURN_MS = 5100;
const BURN_MS_REDUCED = 750;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function RedDotSvg({ size }: { size: number }) {
  const vb = 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <circle
        cx={vb / 2}
        cy={vb / 2}
        r={8.75}
        fill="none"
        stroke={RED}
        strokeWidth={1.15}
      />
      <circle cx={vb / 2} cy={vb / 2} r={2.35} fill={RED} />
    </svg>
  );
}

/**
 * Footer signature mark. Click ignites a full-viewport “paper burns to black”
 * vignette (Escape or click when black to return).
 */
export default function RedDot({ size = 12 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "burning" | "ashes">("idle");
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setPhase("idle");
  }, [clearTimer]);

  useEffect(() => {
    if (phase === "idle") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "ashes") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, reset]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const startBurn = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (phase !== "idle") return;
    setOrigin({ x: e.clientX, y: e.clientY });
    setPhase("burning");
    const ms = prefersReducedMotion() ? BURN_MS_REDUCED : BURN_MS;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPhase("ashes");
    }, ms);
  };

  const overlayStyle: CSSProperties = {
    ["--thusness-burn-cx" as string]: `${origin.x}px`,
    ["--thusness-burn-cy" as string]: `${origin.y}px`,
  };

  const reduced = mounted && prefersReducedMotion();

  const portal =
    mounted && phase !== "idle" ? (
      <div
        className="thusness-burn-root"
        data-phase={phase}
        style={phase === "ashes" ? undefined : overlayStyle}
        onClick={phase === "ashes" ? reset : undefined}
        role="presentation"
      >
        {phase === "burning" ? (
          reduced ? (
            <div className="thusness-burn-reduced" aria-hidden />
          ) : (
            <>
              <div className="thusness-burn-paper" aria-hidden />
              <div className="thusness-burn-scorch" aria-hidden />
              <div className="thusness-burn-flames" aria-hidden />
              <div className="thusness-burn-ember" aria-hidden />
              <div className="thusness-burn-ash" aria-hidden />
            </>
          )
        ) : (
          <>
            <span className="thusness-burn-hint" aria-live="polite">
              Click anywhere or press Escape to return
            </span>
          </>
        )}
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        className="inline-flex cursor-pointer border-0 bg-transparent p-1 align-middle opacity-100 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--thusness-ink)]"
        aria-label="Thusness mark — click for a brief visual effect"
        onClick={startBurn}
        disabled={phase !== "idle"}
      >
        <RedDotSvg size={size} />
      </button>
      {mounted && portal ? createPortal(portal, document.body) : null}
    </>
  );
}
