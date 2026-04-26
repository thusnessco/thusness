/** C2 + soft C3 (Web Audio). ~5s with slow fade in / out — call after a user gesture. */

const C2_HZ = 65.40639132514965;
const C3_HZ = 130.8127826502993;

const TOTAL_SEC = 5.8;
/** Peak after short rise; envelope then decays exponentially (no long plateau). */
const PEAK_GAIN = 0.16;
const RISE_SEC = 0.08;

function scheduleSoftChimeGraph(ctx: AudioContext): void {
  const t0 = ctx.currentTime + 0.002;
  const tEnd = t0 + TOTAL_SEC;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.linearRampToValueAtTime(PEAK_GAIN, t0 + RISE_SEC);
  master.gain.exponentialRampToValueAtTime(0.0001, tEnd);
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

/**
 * Plays the sink-in tone. Awaits `resume()` when still suspended (timers / step
 * advance). The app uses HTMLAudio first; this is the Web Audio fallback.
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
  scheduleSoftChimeGraph(ctx);
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

  const t0 = ctx.currentTime + 0.002;
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
