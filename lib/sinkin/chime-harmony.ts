import type { SinkInChimeHarmonyV1 } from "./config";

/** C2 in Hz (equal temperament). */
const ROOT_HZ = 65.40639132514965;

/** Partials for main chime + pulse (same tuning; weights sum ~1). */
export function sinkInChimePartials(
  harmony: SinkInChimeHarmonyV1
): readonly { hz: number; weight: number }[] {
  switch (harmony) {
    case "fifth":
      return [
        { hz: ROOT_HZ, weight: 0.5 },
        { hz: ROOT_HZ * 2 ** (7 / 12), weight: 0.5 },
      ];
    case "major":
      return [
        { hz: ROOT_HZ, weight: 0.34 },
        { hz: ROOT_HZ * 2 ** (4 / 12), weight: 0.33 },
        { hz: ROOT_HZ * 2 ** (7 / 12), weight: 0.33 },
      ];
    case "add9":
      return [
        { hz: ROOT_HZ, weight: 0.26 },
        { hz: ROOT_HZ * 2 ** (4 / 12), weight: 0.25 },
        { hz: ROOT_HZ * 2 ** (7 / 12), weight: 0.25 },
        { hz: ROOT_HZ * 2 ** (14 / 12), weight: 0.24 },
      ];
    case "maj7":
      return [
        { hz: ROOT_HZ, weight: 0.26 },
        { hz: ROOT_HZ * 2 ** (4 / 12), weight: 0.25 },
        { hz: ROOT_HZ * 2 ** (7 / 12), weight: 0.25 },
        { hz: ROOT_HZ * 2 ** (11 / 12), weight: 0.24 },
      ];
    case "octave":
      return [
        { hz: ROOT_HZ, weight: 0.52 },
        { hz: ROOT_HZ * 2, weight: 0.48 },
      ];
  }
}

export function sinkInChimeSampleAt(
  t: number,
  harmony: SinkInChimeHarmonyV1
): number {
  const twoPi = 2 * Math.PI;
  let s = 0;
  for (const p of sinkInChimePartials(harmony)) {
    s += p.weight * Math.sin(twoPi * p.hz * t);
  }
  return s;
}
