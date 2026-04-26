/**
 * Sink-in tones via HTMLAudioElement + in-memory WAV. Safari (macOS) often stays
 * silent with Web Audio oscillators; decoded WAV + play() is the reliable path.
 * Web Audio in soft-chime.ts remains optional fallback from the experience layer.
 */

const C2_HZ = 65.40639132514965;
const C3_HZ = 130.8127826502993;

const CHIME_SR = 44100;
const CHIME_SEC = 5.8;
const PULSE_SR = 22050;
const PULSE_SEC = 0.42;

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
 * Long chime: tiny de-click rise, then a single exponential decay over the whole
 * length so level eases down gradually from almost the start through the tail.
 */
function renderMainChimeSamples(): Float32Array {
  const n = Math.floor(CHIME_SR * CHIME_SEC);
  const out = new Float32Array(n);
  const riseSec = 0.06;
  const tau = 2.75;
  for (let i = 0; i < n; i++) {
    const t = i / CHIME_SR;
    const tone =
      0.52 * Math.sin(2 * Math.PI * C2_HZ * t) +
      0.48 * Math.sin(2 * Math.PI * C3_HZ * t);
    const rise = Math.min(1, t / riseSec);
    const riseSmooth = rise * rise * (3 - 2 * rise);
    const decay = Math.exp(-t / tau);
    const env = riseSmooth * decay;
    out[i] = tone * env * 0.38;
  }
  return out;
}

function renderPulseSamples(): Float32Array {
  const n = Math.floor(PULSE_SR * PULSE_SEC);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / PULSE_SR;
    const tone =
      0.55 * Math.sin(2 * Math.PI * C2_HZ * t) +
      0.45 * Math.sin(2 * Math.PI * C3_HZ * t);
    const u = t / PULSE_SEC;
    const env = Math.sin(Math.PI * u) * Math.exp(-2.2 * u);
    out[i] = tone * env * 0.22;
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
    pulseUrl = URL.createObjectURL(floatToWavMono16(renderPulseSamples(), PULSE_SR));
  }
  return pulseUrl;
}

/** Call from pointer/click — starts play() synchronously inside the gesture. */
export function playSinkInMainChimeFromGesture(): void {
  try {
    const a = new Audio(mainChimeObjectUrl());
    a.volume = 1;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

export async function playSinkInMainChimeHtml(): Promise<void> {
  const a = new Audio(mainChimeObjectUrl());
  a.volume = 1;
  await a.play();
}

export async function playSinkInPulseHtml(): Promise<void> {
  const a = new Audio(pulseObjectUrl());
  a.volume = 1;
  await a.play();
}
