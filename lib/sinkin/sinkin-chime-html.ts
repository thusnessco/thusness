/**
 * Sink-in tones via HTMLAudioElement + in-memory WAV. Safari (macOS) often stays
 * silent with Web Audio oscillators; decoded WAV + play() is the reliable path.
 * Web Audio in soft-chime.ts remains optional fallback from the experience layer.
 */

import type { SinkInChimeHarmonyV1 } from "./config";
import { sinkInChimeSampleAt } from "./chime-harmony";

const CHIME_SR = 44100;
const CHIME_SEC = 6.2;
const PULSE_SR = 22050;
const PULSE_SEC = 0.42;

/** Peak sample scale in WAV (output level; fades unchanged). */
const MAIN_CHIME_LEVEL = 0.4;
const PULSE_LEVEL = 0.16;
/** Media element gain (1 = full browser output). */
const HTML_AUDIO_VOLUME = 1;

function floatToWavMono16(samples: Float32Array, sampleRate: number): Blob {
  const n = samples.length;
  const dataSize = n * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  let o = 0;
  const w = (s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o++, s.charCodeAt(i));
  };
  w("RIFF");
  v.setUint32(o, 36 + dataSize, true);
  o += 4;
  w("WAVE");
  w("fmt ");
  v.setUint32(o, 16, true);
  o += 4;
  v.setUint16(o, 1, true);
  o += 2;
  v.setUint16(o, 1, true);
  o += 2;
  v.setUint32(o, sampleRate, true);
  o += 4;
  v.setUint32(o, sampleRate * 2, true);
  o += 4;
  v.setUint16(o, 2, true);
  o += 2;
  v.setUint16(o, 16, true);
  o += 2;
  w("data");
  v.setUint32(o, dataSize, true);
  o += 4;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    const q = s < 0 ? s * 0x8000 : s * 0x7fff;
    v.setInt16(o, Math.round(q), true);
    o += 2;
  }
  return new Blob([buf], { type: "audio/wav" });
}

/**
 * Long chime: soft rise, gradual body decay, then a cosine window to exact silence
 * on the last sample so the file never hard-cuts mid-level (which sounds like a
 * click / abrupt stop).
 */
function renderMainChimeSamples(harmony: SinkInChimeHarmonyV1): Float32Array {
  const n = Math.floor(CHIME_SR * CHIME_SEC);
  const out = new Float32Array(n);
  /** Half-cosine fade-in (zero derivative at t=0) to remove onset click. */
  const attackSec = 0.48;
  const tau = 3.35;
  for (let i = 0; i < n; i++) {
    const t = i / CHIME_SR;
    const u = (i + 1) / n;
    const tone = sinkInChimeSampleAt(t, harmony);
    const a = Math.min(1, t / attackSec);
    const fadeIn = 0.5 * (1 - Math.cos(Math.PI * a));
    const decay = Math.exp(-t / tau);
    const endWindow = Math.cos((Math.PI / 2) * u);
    const env = fadeIn * decay * endWindow;
    out[i] = tone * env * MAIN_CHIME_LEVEL;
  }
  return out;
}

function renderPulseSamples(harmony: SinkInChimeHarmonyV1): Float32Array {
  const n = Math.floor(PULSE_SR * PULSE_SEC);
  const out = new Float32Array(n);
  const attackSec = 0.06;
  for (let i = 0; i < n; i++) {
    const t = i / PULSE_SR;
    const tone = sinkInChimeSampleAt(t, harmony);
    const u = (i + 1) / n;
    const a = Math.min(1, t / attackSec);
    const fadeIn = 0.5 * (1 - Math.cos(Math.PI * a));
    const env = fadeIn * Math.sin(Math.PI * u) * Math.exp(-2.2 * (t / PULSE_SEC));
    out[i] = tone * env * PULSE_LEVEL;
  }
  return out;
}

const mainChimeUrls: Partial<Record<SinkInChimeHarmonyV1, string>> = {};
const pulseUrls: Partial<Record<SinkInChimeHarmonyV1, string>> = {};

function mainChimeObjectUrl(harmony: SinkInChimeHarmonyV1): string {
  if (!mainChimeUrls[harmony]) {
    mainChimeUrls[harmony] = URL.createObjectURL(
      floatToWavMono16(renderMainChimeSamples(harmony), CHIME_SR)
    );
  }
  return mainChimeUrls[harmony]!;
}

function pulseObjectUrl(harmony: SinkInChimeHarmonyV1): string {
  if (!pulseUrls[harmony]) {
    pulseUrls[harmony] = URL.createObjectURL(
      floatToWavMono16(renderPulseSamples(harmony), PULSE_SR)
    );
  }
  return pulseUrls[harmony]!;
}

/** Call from pointer/click — starts play() synchronously inside the gesture. */
export function playSinkInMainChimeFromGesture(
  harmony: SinkInChimeHarmonyV1
): void {
  try {
    const a = new Audio(mainChimeObjectUrl(harmony));
    a.volume = HTML_AUDIO_VOLUME;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

export async function playSinkInMainChimeHtml(
  harmony: SinkInChimeHarmonyV1
): Promise<void> {
  const a = new Audio(mainChimeObjectUrl(harmony));
  a.volume = HTML_AUDIO_VOLUME;
  await a.play();
}

export async function playSinkInPulseHtml(
  harmony: SinkInChimeHarmonyV1
): Promise<void> {
  const a = new Audio(pulseObjectUrl(harmony));
  a.volume = HTML_AUDIO_VOLUME;
  await a.play();
}
