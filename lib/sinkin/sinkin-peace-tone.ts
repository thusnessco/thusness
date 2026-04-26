/**
 * Sink-in cue tones: pure sine, smooth single-lobe envelope, trailing silence.
 * Designed to be unobtrusive (no noise grain, no dense partials), easy on small
 * speakers, and fully faded at buffer boundaries — no abrupt cutoff.
 */

import { clampCueToneHz } from "./config";

/** Main: long sin² window (zero slope at both ends) + silence pad. */
export const PEACE_MAIN_TOTAL_SEC = 6.75;
const PEACE_MAIN_BODY_SEC = 6.28;

/** Mid-step tap: shorter same pitch, padded tail. */
export const PEACE_PULSE_TOTAL_SEC = 0.48;
const PEACE_PULSE_BODY_SEC = 0.36;

const MAIN_GAIN = 0.26;
const PULSE_GAIN = 0.09;

function smoothstep01(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

/** Fade last `samples` to exact 0 (guards int16 edge). */
function softenLastSamples(out: Float32Array, tail: number): void {
  const n = out.length;
  const k = Math.min(tail, n);
  for (let j = 0; j < k; j++) {
    const i = n - k + j;
    const u = j / Math.max(1, k - 1);
    out[i] *= 1 - smoothstep01(u);
  }
}

/**
 * Single smooth bump: sin²(π·i/(N−1)) so level and slope are both 0 at ends.
 * No extra hard gates — the math already gives a complete fade-out.
 */
export function renderMainPeaceSamples(
  sampleRate: number,
  fundHzInput: number
): Float32Array {
  const fundHz = clampCueToneHz(fundHzInput);
  const n = Math.floor(sampleRate * PEACE_MAIN_TOTAL_SEC);
  const nBody = Math.min(Math.floor(sampleRate * PEACE_MAIN_BODY_SEC), n);
  const out = new Float32Array(n);
  const denom = Math.max(1, nBody - 1);

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let env = 0;
    if (i < nBody) {
      const u = i / denom;
      const s = Math.sin(Math.PI * u);
      env = s * s;
    }
    out[i] = env * MAIN_GAIN * Math.sin(2 * Math.PI * fundHz * t);
  }
  softenLastSamples(out, 128);
  return out;
}

export function renderPulsePeaceSamples(
  sampleRate: number,
  fundHzInput: number
): Float32Array {
  const fundHz = clampCueToneHz(fundHzInput);
  const n = Math.floor(sampleRate * PEACE_PULSE_TOTAL_SEC);
  const nBody = Math.min(Math.floor(sampleRate * PEACE_PULSE_BODY_SEC), n);
  const out = new Float32Array(n);
  const denom = Math.max(1, nBody - 1);

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let env = 0;
    if (i < nBody) {
      const u = i / denom;
      const s = Math.sin(Math.PI * u);
      env = s * s;
    }
    out[i] = env * PULSE_GAIN * Math.sin(2 * Math.PI * fundHz * t);
  }
  softenLastSamples(out, 96);
  return out;
}
