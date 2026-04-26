/**
 * Sink-in tones via HTMLAudioElement + in-memory WAV. Safari (macOS) often stays
 * silent with Web Audio oscillators; decoded WAV + play() is the reliable path.
 * Web Audio in soft-chime.ts remains optional fallback from the experience layer.
 *
 * Tuning-fork–style timbre: damped fundamental (A4) plus short-lived 2× and 3×
 * partials for the metallic “ping,” then mostly pure decay. Mono so it stays clean
 * on built-in speakers (true binaural beats need isolated ears; summed mono sounds
 * like a tremolo).
 */

/** Concert A — familiar fork pitch; clear without being very low. */
const FORK_F0_HZ = 440;

const CHIME_SR = 44100;
const CHIME_SEC = 6.2;
const PULSE_SR = 44100;
const PULSE_SEC = 0.42;

const MAIN_CHIME_LEVEL = 0.32;
const PULSE_LEVEL = 0.12;
const HTML_AUDIO_VOLUME = 0.88;

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

/** Harmonics die quickly like a struck fork; fundamental implied by long envelope. */
function forkStrikeTone(t: number): number {
  const th1 = 2 * Math.PI * FORK_F0_HZ * t;
  const th2 = 2 * Math.PI * 2 * FORK_F0_HZ * t;
  const th3 = 2 * Math.PI * 3 * FORK_F0_HZ * t;
  const h2 = Math.exp(-t * 7.2);
  const h3 = Math.exp(-t * 11);
  const raw =
    Math.sin(th1) +
    0.12 * h2 * Math.sin(th2) +
    0.038 * h3 * Math.sin(th3);
  return raw / 1.14;
}

/** Short mid-step tap: lighter partials. */
function forkTapTone(t: number): number {
  const th1 = 2 * Math.PI * FORK_F0_HZ * t;
  const th2 = 2 * Math.PI * 2 * FORK_F0_HZ * t;
  const h2 = Math.exp(-t * 38);
  const raw = Math.sin(th1) + 0.09 * h2 * Math.sin(th2);
  return raw / 1.06;
}

function renderMainChimeSamples(): Float32Array {
  const n = Math.floor(CHIME_SR * CHIME_SEC);
  const out = new Float32Array(n);
  const attackSec = 0.48;
  const tau = 3.35;
  for (let i = 0; i < n; i++) {
    const t = i / CHIME_SR;
    const u = (i + 1) / n;
    const tone = forkStrikeTone(t);
    const a = Math.min(1, t / attackSec);
    const fadeIn = 0.5 * (1 - Math.cos(Math.PI * a));
    const decay = Math.exp(-t / tau);
    const endWindow = Math.cos((Math.PI / 2) * u);
    const env = fadeIn * decay * endWindow;
    out[i] = tone * env * MAIN_CHIME_LEVEL;
  }
  return out;
}

function renderPulseSamples(): Float32Array {
  const n = Math.floor(PULSE_SR * PULSE_SEC);
  const out = new Float32Array(n);
  const attackSec = 0.06;
  for (let i = 0; i < n; i++) {
    const t = i / PULSE_SR;
    const tone = forkTapTone(t);
    const u = (i + 1) / n;
    const a = Math.min(1, t / attackSec);
    const fadeIn = 0.5 * (1 - Math.cos(Math.PI * a));
    const env = fadeIn * Math.sin(Math.PI * u) * Math.exp(-2.2 * (t / PULSE_SEC));
    out[i] = tone * env * PULSE_LEVEL;
  }
  return out;
}

let mainChimeUrl: string | null = null;
let pulseUrl: string | null = null;

function mainChimeObjectUrl(): string {
  if (!mainChimeUrl) {
    mainChimeUrl = URL.createObjectURL(
      floatToWavMono16(renderMainChimeSamples(), CHIME_SR)
    );
  }
  return mainChimeUrl;
}

function pulseObjectUrl(): string {
  if (!pulseUrl) {
    pulseUrl = URL.createObjectURL(
      floatToWavMono16(renderPulseSamples(), PULSE_SR)
    );
  }
  return pulseUrl;
}

export function playSinkInMainChimeFromGesture(): void {
  try {
    const a = new Audio(mainChimeObjectUrl());
    a.volume = HTML_AUDIO_VOLUME;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

export async function playSinkInMainChimeHtml(): Promise<void> {
  const a = new Audio(mainChimeObjectUrl());
  a.volume = HTML_AUDIO_VOLUME;
  await a.play();
}

export async function playSinkInPulseHtml(): Promise<void> {
  const a = new Audio(pulseObjectUrl());
  a.volume = HTML_AUDIO_VOLUME;
  await a.play();
}
