/**
 * Tuning-fork timbre via Web Audio (fundamental + decaying harmonics). Matches
 * sinkin-chime-html; HTMLAudio path remains primary where oscillators fail.
 */

const FORK_F0_HZ = 440;

const TOTAL_SEC = 6.2;
const PEAK_GAIN = 0.1;
const RISE_SEC = 0.5;
const TAIL_SILENCE_SEC = 0.22;

function connectFork(
  ctx: AudioContext,
  t0: number,
  stopAt: number,
  target: AudioNode,
  opts: {
    h2Peak: number;
    h2DecaySec: number;
    h3Peak: number;
    h3DecaySec: number;
  }
): void {
  const merge = ctx.createGain();
  merge.gain.value = 1;

  const o1 = ctx.createOscillator();
  o1.type = "sine";
  o1.frequency.setValueAtTime(FORK_F0_HZ, t0);
  const g1 = ctx.createGain();
  g1.gain.value = 1;
  o1.connect(g1);
  g1.connect(merge);

  const o2 = ctx.createOscillator();
  o2.type = "sine";
  o2.frequency.setValueAtTime(FORK_F0_HZ * 2, t0);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.0001, t0);
  g2.gain.setValueAtTime(opts.h2Peak, t0 + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.h2DecaySec);
  o2.connect(g2);
  g2.connect(merge);

  const o3 = ctx.createOscillator();
  o3.type = "sine";
  o3.frequency.setValueAtTime(FORK_F0_HZ * 3, t0);
  const g3 = ctx.createGain();
  g3.gain.setValueAtTime(0.0001, t0);
  g3.gain.setValueAtTime(opts.h3Peak, t0 + 0.005);
  g3.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.h3DecaySec);
  o3.connect(g3);
  g3.connect(merge);

  merge.connect(target);

  o1.start(t0);
  o2.start(t0);
  o3.start(t0);
  o1.stop(stopAt);
  o2.stop(stopAt);
  o3.stop(stopAt);
}

function scheduleSoftChimeGraph(ctx: AudioContext): void {
  const t0 = ctx.currentTime + 0.002;
  const tEnd = t0 + TOTAL_SEC;
  const tExpoEnd = tEnd - 0.28;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.00001, t0);
  master.gain.linearRampToValueAtTime(PEAK_GAIN, t0 + RISE_SEC);
  master.gain.exponentialRampToValueAtTime(0.0001, tExpoEnd);
  master.gain.linearRampToValueAtTime(0.000001, tEnd);
  master.connect(ctx.destination);

  const stopAt = tEnd + TAIL_SILENCE_SEC + 0.04;
  connectFork(ctx, t0, stopAt, master, {
    h2Peak: 0.12,
    h2DecaySec: 0.45,
    h3Peak: 0.038,
    h3DecaySec: 0.36,
  });
}

export async function playSoftChime(ctx: AudioContext): Promise<void> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
  } catch {
    return;
  }
  if (ctx.state !== "running") return;
  scheduleSoftChimeGraph(ctx);
}

export async function playSinkInPulse(ctx: AudioContext): Promise<void> {
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
  const peak = 0.055;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.linearRampToValueAtTime(peak, t0 + 0.04);
  master.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  master.connect(ctx.destination);

  const stopAt = t0 + dur + 0.05;
  connectFork(ctx, t0, stopAt, master, {
    h2Peak: 0.09,
    h2DecaySec: 0.12,
    h3Peak: 0.018,
    h3DecaySec: 0.08,
  });
}
