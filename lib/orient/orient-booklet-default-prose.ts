import type { OrientBookletSlug } from "@/lib/orient/booklet-config";

/** Reference seed copy only (not rendered on the site). Section pages use admin long-form overrides. */
export type OrientBookletProseBlock = { kind: "lead" | "p"; text: string };

const DEFAULTS: Record<OrientBookletSlug, OrientBookletProseBlock[]> = {
  stages: [
    {
      kind: "lead",
      text: "Peace begins as something noticed. It becomes a way of seeing. It becomes the field itself.",
    },
    {
      kind: "p",
      text: "At first, peace is a small dot in the background — an underlying okayness available even when the day is hard. We orient toward it. We learn to find it.",
    },
    {
      kind: "p",
      text: "Over time, that small dot becomes a lens. Experience is met through it; the okayness colors what arises rather than competing with it.",
    },
    {
      kind: "p",
      text: "Eventually it is no longer separable from experience at all. Peace is not a quality of certain moments. It pervades. The field itself.",
    },
  ],
  recognition: [
    {
      kind: "lead",
      text: "Two kinds of peace look similar from the outside, and ask very different things of us.",
    },
    {
      kind: "p",
      text: "Felt peace is the relaxed, calm, easy version. Pleasant. It comes with a good night of sleep, a quiet morning, a body that is not in pain. It also leaves on its own schedule.",
    },
    {
      kind: "p",
      text: "The sense of peace is quieter. It does not depend on the day going well. More like a baseline that has been there all along, waiting to be noticed under whatever is happening on top of it.",
    },
    {
      kind: "p",
      text: "A common confusion: assuming we have lost recognition when we have only lost felt peace. The body got tired. The mood turned. The sense of peace did not move.",
    },
  ],
  pillars: [
    {
      kind: "lead",
      text: "Three qualities make this practice easy and enjoyable rather than effortful and grim.",
    },
    {
      kind: "p",
      text: "Effortlessness, because tension is often what we mistake for the work. Reducing unnecessary effort lets the practice unfold on its own terms.",
    },
    {
      kind: "p",
      text: "Appreciation, because anything met with appreciation tends to deepen and stabilize. Gratitude is appreciation up a notch — useful when challenges arrive.",
    },
    {
      kind: "p",
      text: "Openness, because what we are looking at is subtler than the assumptions we usually bring to it. Gentle curiosity keeps perception loose enough to see what is actually there.",
    },
  ],
  movement: [
    {
      kind: "lead",
      text: "When peace is stable enough to rest in, attention can begin to look more closely at what is here.",
    },
    {
      kind: "p",
      text: "It is not a forced inquiry. It is more like a softening of the assumptions we did not know we were making about self, world, and experience.",
    },
    {
      kind: "p",
      text: "Looked at carefully, the things that seemed solid are not found in the way we expected. They appear, they function, they depend on countless other things — and yet nothing inherent shows up at the center.",
    },
    {
      kind: "p",
      text: "These shifts vary from person to person. Some patterns repeat. The framework points at common terrain without prescribing the route.",
    },
  ],
  themes: [
    {
      kind: "lead",
      text: "Aspects of exploration. No fixed order. Different angles on the same opening.",
    },
    {
      kind: "p",
      text: "Thought, mind, time, identity, emptiness, energy, infinity, existence — these are not separate teachings so much as different doors into the same room.",
    },
    {
      kind: "p",
      text: "Some are entered through contrast: noticing what something is not. Some through plainness: noticing what is most ordinary. Some through intensity, some through subtlety, some through pleasantness, some through difficulty.",
    },
    {
      kind: "p",
      text: "Take whichever is alive for you right now. Return to others later. The map does not require a particular path.",
    },
  ],
  nihilism: [
    {
      kind: "lead",
      text: "A common trap, worth knowing about even if you never fall into it.",
    },
    {
      kind: "p",
      text: "When the assumed self is not found, a relief can arrive that mistakes itself for the destination. \"Nothing exists, so nothing matters.\" Initially this is a holiday from suffering. The system clings to it and starts to defend it.",
    },
    {
      kind: "p",
      text: "The accurate view is subtler. Things are empty of inherent existence — there is no fixed core to be found. And things still appear, still function, still arise dependently on countless conditions. Both at once.",
    },
    {
      kind: "p",
      text: "This view is not required for accessing peace. It becomes useful contextually, later in the journey, as a way of holding what is being seen without collapsing into either extreme.",
    },
  ],
};

export function getDefaultOrientBookletProse(slug: OrientBookletSlug): OrientBookletProseBlock[] {
  return DEFAULTS[slug] ?? [];
}
