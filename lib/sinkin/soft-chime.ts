/** C2 + soft C3 (Web Audio). ~5s with slow fade in / out — call after a user gesture. */

const C2_HZ = 65.40639132514965;
const C3_HZ = 130.8127826502993;

const TOTAL_SEC = 5;
const ATTACK_SEC = 1.25;
const RELEASE_SEC = 1.75;
/** Peak master gain (quiet; sustained tone). */
const PEAK_GAIN = 0.18;

/**
 * Plays the sink-in tone. Must be called after `AudioContext` is running —
 * awaits `resume()` when still suspended (needed for tones fired from timers).
 */
export async function playSoftChime(ctx: AudioContext): Promise<void> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
  } catch {
    return;
  }
  if (ctx.state !== "running") return;

  const t0 = ctx.currentTime;
  const tEnd = t0 + TOTAL_SEC;
  const tReleaseStart = tEnd - RELEASE_SEC;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(PEAK_GAIN, t0 + ATTACK_SEC);
  master.gain.setValueAtTime(PEAK_GAIN, tReleaseStart);
  master.gain.linearRampToValueAtTime(0.0001, tEnd);
  master.connect(ctx.destination);

  const oscLow = ctx.createOscillator();
  oscLow.type = "sine";
  oscLow.frequency.setValueAtTime(C2_HZ, t0);

  const oscHigh = ctx.createOscillator();
  oscHigh.type = "sine";
  oscHigh.frequency.setValueAtTime(C3_HZ, t0);

  const gLow = ctx.createGain();
  gLow.gain.value = 0.62;
  const gHigh = ctx.createGain();
  gHigh.gain.value = 0.38;

  oscLow.connect(gLow);
  gLow.connect(master);
  oscHigh.connect(gHigh);
  gHigh.connect(master);

  const stopAt = tEnd + 0.08;
  oscLow.start(t0);
  oscHigh.start(t0);
  oscLow.stop(stopAt);
  oscHigh.stop(stopAt);
}

/** Short gentle pulse during long holds (same C partials, ~0.35s). */
export async function playSinkInPulse(ctx: AudioContext): Promise<void> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
  } catch {
    return;
  }
  if (ctx.state !== "running") return;

  const t0 = ctx.currentTime;
  const dur = 0.35;
  const peak = 0.09;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.linearRampToValueAtTime(peak, t0 + 0.04);
  master.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  master.connect(ctx.destination);

  const oscLow = ctx.createOscillator();
  oscLow.type = "sine";
  oscLow.frequency.setValueAtTime(C2_HZ, t0);
  const oscHigh = ctx.createOscillator();
  oscHigh.type = "sine";
  oscHigh.frequency.setValueAtTime(C3_HZ, t0);
  const gLow = ctx.createGain();
  gLow.gain.value = 0.55;
  const gHigh = ctx.createGain();
  gHigh.gain.value = 0.45;
  oscLow.connect(gLow);
  gLow.connect(master);
  oscHigh.connect(gHigh);
  gHigh.connect(master);

  const stopAt = t0 + dur + 0.05;
  oscLow.start(t0);
  oscHigh.start(t0);
  oscLow.stop(stopAt);
  oscHigh.stop(stopAt);
}
