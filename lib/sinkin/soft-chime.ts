/** C2-root chimes (Web Audio). HTMLAudio path is primary; this is the fallback. */

import type { SinkInChimeHarmonyV1 } from "./config";
import { sinkInChimePartials } from "./chime-harmony";

const TOTAL_SEC = 6.2;
/** Peak after short rise; long decay, then linear tail to silence before osc stop. */
const PEAK_GAIN = 0.09;
/** Longer linear gain rise from near-silence removes the little click on onset. */
const RISE_SEC = 0.5;
/** Seconds after gain hits silence before stopping sources (avoids click). */
const TAIL_SILENCE_SEC = 0.22;

function scheduleSoftChimeGraph(
  ctx: AudioContext,
  harmony: SinkInChimeHarmonyV1
): void {
  const t0 = ctx.currentTime + 0.002;
  const tEnd = t0 + TOTAL_SEC;
  const tExpoEnd = tEnd - 0.28;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.00001, t0);
  master.gain.linearRampToValueAtTime(PEAK_GAIN, t0 + RISE_SEC);
  master.gain.exponentialRampToValueAtTime(0.0001, tExpoEnd);
  master.gain.linearRampToValueAtTime(0.000001, tEnd);
  master.connect(ctx.destination);

  const partials = sinkInChimePartials(harmony);
  const stopAt = tEnd + TAIL_SILENCE_SEC + 0.04;
  for (const p of partials) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.hz, t0);
    const g = ctx.createGain();
    g.gain.value = p.weight;
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(stopAt);
  }
}

/**
 * Plays the sink-in tone. Awaits `resume()` when still suspended (timers / step
 * advance). The app uses HTMLAudio first; this is the Web Audio fallback.
 */
export async function playSoftChime(
  ctx: AudioContext,
  harmony: SinkInChimeHarmonyV1
): Promise<void> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
  } catch {
    return;
  }
  if (ctx.state !== "running") return;
  scheduleSoftChimeGraph(ctx, harmony);
}

/** Short gentle pulse during long holds (~0.35s). */
export async function playSinkInPulse(
  ctx: AudioContext,
  harmony: SinkInChimeHarmonyV1
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
  const dur = 0.35;
  const peak = 0.045;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.linearRampToValueAtTime(peak, t0 + 0.04);
  master.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  master.connect(ctx.destination);

  const partials = sinkInChimePartials(harmony);
  const stopAt = t0 + dur + 0.05;
  for (const p of partials) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.hz, t0);
    const g = ctx.createGain();
    g.gain.value = p.weight;
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(stopAt);
  }
}
