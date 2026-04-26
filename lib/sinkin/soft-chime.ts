/** C2 + C3 octave (Web Audio). HTMLAudio path is primary; this is the fallback. */

const C2_HZ = 65.40639132514965;
const C3_HZ = 130.8127826502993;

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

  const oscLow = ctx.createOscillator();
  oscLow.type = "sine";
  oscLow.frequency.setValueAtTime(C2_HZ, t0);
  const oscHigh = ctx.createOscillator();
  oscHigh.type = "sine";
  oscHigh.frequency.setValueAtTime(C3_HZ, t0);
  const gLow = ctx.createGain();
  gLow.gain.value = 0.52;
  const gHigh = ctx.createGain();
  gHigh.gain.value = 0.48;
  oscLow.connect(gLow);
  gLow.connect(master);
  oscHigh.connect(gHigh);
  gHigh.connect(master);

  const stopAt = tEnd + TAIL_SILENCE_SEC + 0.04;
  oscLow.start(t0);
  oscHigh.start(t0);
  oscLow.stop(stopAt);
  oscHigh.stop(stopAt);
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

  const oscLow = ctx.createOscillator();
  oscLow.type = "sine";
  oscLow.frequency.setValueAtTime(C2_HZ, t0);
  const oscHigh = ctx.createOscillator();
  oscHigh.type = "sine";
  oscHigh.frequency.setValueAtTime(C3_HZ, t0);
  const gLow = ctx.createGain();
  gLow.gain.value = 0.52;
  const gHigh = ctx.createGain();
  gHigh.gain.value = 0.48;
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
