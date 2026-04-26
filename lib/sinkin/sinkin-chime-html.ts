/**
 * Sink-in cues via HTMLAudioElement + in-memory WAV. Safari (macOS) often stays
 * silent with Web Audio buffers; decoded WAV + play() is the reliable path.
 * Web Audio in soft-chime.ts remains optional fallback from the experience layer.
 *
 * WAVs are cached per cue frequency (see sinkin-peace-tone).
 */

import { clampCueToneHz } from "./config";
import {
  renderMainPeaceSamples,
  renderPulsePeaceSamples,
} from "./sinkin-peace-tone";

const CHIME_SR = 44100;
const PULSE_SR = 44100;

const HTML_AUDIO_VOLUME = 0.88;

const mainChimeUrlByHz = new Map<number, string>();
const pulseUrlByHz = new Map<number, string>();

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

function mainChimeObjectUrl(cueToneHz: number): string {
  const hz = clampCueToneHz(cueToneHz);
  let url = mainChimeUrlByHz.get(hz);
  if (!url) {
    url = URL.createObjectURL(
      floatToWavMono16(renderMainPeaceSamples(CHIME_SR, hz), CHIME_SR)
    );
    mainChimeUrlByHz.set(hz, url);
  }
  return url;
}

function pulseObjectUrl(cueToneHz: number): string {
  const hz = clampCueToneHz(cueToneHz);
  let url = pulseUrlByHz.get(hz);
  if (!url) {
    url = URL.createObjectURL(
      floatToWavMono16(renderPulsePeaceSamples(PULSE_SR, hz), PULSE_SR)
    );
    pulseUrlByHz.set(hz, url);
  }
  return url;
}

export function playSinkInMainChimeFromGesture(cueToneHz: number): void {
  try {
    const a = new Audio(mainChimeObjectUrl(cueToneHz));
    a.volume = HTML_AUDIO_VOLUME;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

export async function playSinkInMainChimeHtml(cueToneHz: number): Promise<void> {
  const a = new Audio(mainChimeObjectUrl(cueToneHz));
  a.volume = HTML_AUDIO_VOLUME;
  await a.play();
}

export async function playSinkInPulseHtml(cueToneHz: number): Promise<void> {
  const a = new Audio(pulseObjectUrl(cueToneHz));
  a.volume = HTML_AUDIO_VOLUME;
  await a.play();
}
