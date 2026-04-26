/**
 * Peace tone via pre-rendered buffer (Web Audio fallback). Envelope is baked in;
 * no second gain stage so it matches the WAV path.
 */

import {
  renderMainPeaceSamples,
  renderPulsePeaceSamples,
} from "./sinkin-peace-tone";

function playBuffer(ctx: AudioContext, samples: Float32Array, t0: number): void {
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, samples.length, sr);
  buf.getChannelData(0).set(samples);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const out = ctx.createGain();
  out.gain.value = 1;
  src.connect(out);
  out.connect(ctx.destination);
  const dur = samples.length / sr;
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export async function playSoftChime(
  ctx: AudioContext,
  cueToneHz: number
): Promise<void> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
  } catch {
    return;
  }
  if (ctx.state !== "running") return;
  const t0 = ctx.currentTime + 0.002;
  playBuffer(ctx, renderMainPeaceSamples(ctx.sampleRate, cueToneHz), t0);
}

export async function playSinkInPulse(
  ctx: AudioContext,
  cueToneHz: number
): Promise<void> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
  } catch {
    return;
  }
  if (ctx.state !== "running") return;
  const t0 = ctx.currentTime + 0.002;
  playBuffer(ctx, renderPulsePeaceSamples(ctx.sampleRate, cueToneHz), t0);
}
