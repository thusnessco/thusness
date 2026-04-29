export type StageItem = { scope: string; name: string; gloss: string };
export type PillarItem = { name: string; sub: string; gloss: string };
export type MovementItem = { name: string; gloss: string };

export interface OrientContent {
  giant: {
    kicker: string;
    title: string;
    sub: string;
    transition: string;
    tagline: string;
    footer: string;
  };
  stages: { kicker: string; title: string; sub: string; items: StageItem[] };
  recognition: {
    kicker: string;
    title: string;
    sub: string;
    background: { title: string; points: string[] };
    felt: { title: string; points: string[] };
    trap: string;
  };
  pillars: {
    kicker: string;
    title: string;
    sub: string;
    items: PillarItem[];
    footer: string;
  };
  movement: {
    kicker: string;
    title: string;
    sub: string;
    items: MovementItem[];
    footer: string;
  };
  themes: { kicker: string; title: string; sub: string; list: string[]; footer: string };
  nihilism: {
    kicker: string;
    title: string;
    sub: string;
    trap: { name: string; quote: string; body: string };
    view: { name: string; quote: string; body: string };
    footer: string;
  };
}
