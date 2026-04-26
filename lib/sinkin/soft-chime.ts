/** D2 + soft D3 (Web Audio). ~5s with slow fade in / out — call after a user gesture. */

const D2_HZ = 73.41619197801053;
const D3_HZ = 146.83238395602106;

const TOTAL_SEC = 5;
const ATTACK_SEC = 1.25;
const RELEASE_SEC = 1.75;
/** Peak master gain (quiet; sustained tone). */
const PEAK_GAIN = 0.13;

export function playSoftChime(ctx: AudioContext): void {
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
  oscLow.frequency.setValueAtTime(D2_HZ, t0);

  const oscHigh = ctx.createOscillator();
  oscHigh.type = "sine";
  oscHigh.frequency.setValueAtTime(D3_HZ, t0);

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
