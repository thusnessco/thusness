/**
 * Very soft two-tone chime (Web Audio). Call only after a user gesture
 * so the AudioContext is allowed to run.
 */
export function playSoftChime(ctx: AudioContext): void {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.04);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
  master.connect(ctx.destination);

  const freqs = [523.25, 659.25];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.02 + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55 + i * 0.06);
    osc.connect(g);
    g.connect(master);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + 0.9);
  });
}
