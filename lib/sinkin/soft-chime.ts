/**
 * C3 + G3 perfect fifth (Web Audio sines). Matches sinkin-chime-html; HTMLAudio
 * path remains primary where oscillators fail.
 */

const C3_HZ = 130.8127826502993;
const G3_HZ = 195.99771799087497;
const CG_ROOT = 0.54;
const CG_FIFTH = 0.36;

const TOTAL_SEC = 6.2;
const PEAK_GAIN = 0.1;
const RISE_SEC = 0.5;
const TAIL_SILENCE_SEC = 0.22;

function connectCgFifth(
  ctx: AudioContext,
  t0: number,
  stopAt: number,
  target: AudioNode
): void {
  const merge = ctx.createGain();
  merge.gain.value = 1;

  const oC = ctx.createOscillator();
  oC.type = "sine";
  oC.frequency.setValueAtTime(C3_HZ, t0);
  const gC = ctx.createGain();
  gC.gain.value = CG_ROOT;
  oC.connect(gC);
  gC.connect(merge);

  const oG = ctx.createOscillator();
  oG.type = "sine";
  oG.frequency.setValueAtTime(G3_HZ, t0);
  const gG = ctx.createGain();
  gG.gain.value = CG_FIFTH;
  oG.connect(gG);
  gG.connect(merge);

  merge.connect(target);

  oC.start(t0);
  oG.start(t0);
  oC.stop(stopAt);
  oG.stop(stopAt);
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
  connectCgFifth(ctx, t0, stopAt, master);
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
  connectCgFifth(ctx, t0, stopAt, master);
}
