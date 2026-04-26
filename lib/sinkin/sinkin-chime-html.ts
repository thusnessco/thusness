/**
 * Sink-in tones via HTMLAudioElement + in-memory WAV. Safari (macOS) often stays
 * silent with Web Audio oscillators; decoded WAV + play() is the reliable path.
 * Web Audio in soft-chime.ts remains optional fallback from the experience layer.
 *
 * Timbral reset: only C2 + C3 (octave) sines — no stacked triads (avoids low
 * “grumble” / beating). Fades unchanged from the last stable version.
 */

const C2_HZ = 65.40639132514965;
const C3_HZ = 130.8127826502993;

const CHIME_SR = 44100;
const CHIME_SEC = 6.2;
const PULSE_SR = 22050;
const PULSE_SEC = 0.42;

const MAIN_CHIME_LEVEL = 0.28;
const PULSE_LEVEL = 0.11;
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

function octaveTone(t: number): number {
  const twoPi = 2 * Math.PI;
  return (
    0.52 * Math.sin(twoPi * C2_HZ * t) + 0.48 * Math.sin(twoPi * C3_HZ * t)
  );
}

function renderMainChimeSamples(): Float32Array {
  const n = Math.floor(CHIME_SR * CHIME_SEC);
  const out = new Float32Array(n);
  const attackSec = 0.48;
  const tau = 3.35;
  for (let i = 0; i < n; i++) {
    const t = i / CHIME_SR;
    const u = (i + 1) / n;
    const tone = octaveTone(t);
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
    const tone = octaveTone(t);
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
