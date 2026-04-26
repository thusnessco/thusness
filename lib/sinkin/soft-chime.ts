/**
 * G3 + D4 perfect fifth (Web Audio sines). HTMLAudio path is primary; this is
 * the fallback — matches sinkin-chime-html timbre.
 */

const G3_HZ = 195.99771799087497;
const D4_HZ = 293.6647679174076;
const FIFTH_LOW = 0.5;
const FIFTH_HIGH = 0.42;

const TOTAL_SEC = 6.2;
const PEAK_GAIN = 0.1;
const RISE_SEC = 0.5;
const TAIL_SILENCE_SEC = 0.22;

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

  const g = ctx.createOscillator();
  g.type = "sine";
  g.frequency.setValueAtTime(G3_HZ, t0);
  const d = ctx.createOscillator();
  d.type = "sine";
  d.frequency.setValueAtTime(D4_HZ, t0);
  const gGain = ctx.createGain();
  gGain.gain.value = FIFTH_LOW;
  const dGain = ctx.createGain();
  dGain.gain.value = FIFTH_HIGH;
  g.connect(gGain);
  d.connect(dGain);
  gGain.connect(master);
  dGain.connect(master);

  const stopAt = tEnd + TAIL_SILENCE_SEC + 0.04;
  g.start(t0);
  d.start(t0);
  g.stop(stopAt);
  d.stop(stopAt);
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

  const g = ctx.createOscillator();
  g.type = "sine";
  g.frequency.setValueAtTime(G3_HZ, t0);
  const d = ctx.createOscillator();
  d.type = "sine";
  d.frequency.setValueAtTime(D4_HZ, t0);
  const gGain = ctx.createGain();
  gGain.gain.value = FIFTH_LOW;
  const dGain = ctx.createGain();
  dGain.gain.value = FIFTH_HIGH;
  g.connect(gGain);
  d.connect(dGain);
  gGain.connect(master);
  dGain.connect(master);

  const stopAt = t0 + dur + 0.05;
  g.start(t0);
  d.start(t0);
  g.stop(stopAt);
  d.stop(stopAt);
}
