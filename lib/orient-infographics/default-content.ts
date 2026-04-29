import type { OrientContent } from "./types";

/** Bundled default; merged with DB in `parseOrientInfographics`. */
export function defaultOrientInfographics(): OrientContent {
  return {
    giant: {
      kicker: "~ The whole field",
      title: "Inner peace — and beyond.",
      sub: "recognize · perpetuate · integrate · then a shift, and a second arc unfolds",
      transition: "~ a shift in center of gravity",
      tagline:
        "~ Recognize. Perpetuate. Integrate. Then a shift, and a second arc unfolds.",
      footer:
        "thusness.co · orient · adapted from The Deepening Framework by Rastal · CC-BY 4.0",
    },
    stages: {
      kicker: "~ Stages of peace",
      title: "From background, to foreground, to pervasion.",
      sub: "three movements of a single recognition",
      items: [
        {
          scope: "Background",
          name: "Recognition",
          gloss: "Notice the underlying okayness already available.",
        },
        {
          scope: "Foreground",
          name: "Perpetuation",
          gloss: "Attend to it. Appreciate. It becomes more present.",
        },
        {
          scope: "Pervasion",
          name: "Integration",
          gloss: "It pervades. A lens through which experience is viewed.",
        },
      ],
    },
    recognition: {
      kicker: "~ Recognition",
      title: "Two kinds of peace. Related, but distinct.",
      sub: "don't conflate them — one comes and goes; one tends to stay available",
      background: {
        title: "Underlying okayness.",
        points: [
          "Subtle, available even on a hard day",
          "Not a sensation — more like a quiet field",
          "What recognition actually orients toward",
          "Doesn't require the body to feel good",
        ],
      },
      felt: {
        title: "Calm in body and mind.",
        points: [
          "Comes and goes with sleep, health, mood",
          "Settles over time as the system softens",
          "Makes the background-sense easier to notice",
          "Pleasant, but not the target",
        ],
      },
      trap: "Conflating the two makes someone think they've lost recognition\nwhen really, conditions just changed.",
    },
    pillars: {
      kicker: "~ Pillars of success",
      title: "Three rails that run the whole length.",
      sub: "present in every stage, every phase, every theme",
      items: [
        {
          name: "Effortlessness",
          sub: "Reduce unnecessary tension.",
          gloss: "Tension can seem like the barrier itself. Letting it soften removes the wall.",
        },
        {
          name: "Appreciation",
          sub: "Lets experience deepen.",
          gloss: "Gratitude stabilizes recognition and counteracts resistance when challenges arise.",
        },
        {
          name: "Openness · Curiosity",
          sub: "Notice what is actually present.",
          gloss: "Hold no certainty. Stay willing. Essential through every phase.",
        },
      ],
      footer: "Carried through Recognition, Perpetuation, Integration — and beyond.",
    },
    movement: {
      kicker: "~ Movement & progression",
      title: "A second arc, after recognition stabilizes.",
      sub: "a subtle shift in the center of gravity, and unfolding begins",
      items: [
        { name: "Deconstruction", gloss: "experience is taken apart" },
        { name: "Reconstruction", gloss: "pieces re-form into a working whole" },
        { name: "Fluidity & Synthesis", gloss: "movement, flexibility, a single fabric" },
      ],
      footer:
        "Each phase unfolds differently for everyone. Noticing details and reflecting on them gives context — and deepens what is happening.",
    },
    themes: {
      kicker: "~ Themes",
      title: "Recurring textures, no fixed order.",
      sub: "different perspectives on identity, world, and experience",
      list: [
        "Thought",
        "Mind",
        "Time",
        "Identity",
        "Emptiness",
        "Energy",
        "Infinity",
        "Existence",
      ],
      footer: "Some patterns recur. No two pathways are identical.",
    },
    nihilism: {
      kicker: "~ One trap to know",
      title: "Emptiness ≠ non-existence.",
      sub: "things are empty of inherent existence — and still appear, function, depend",
      trap: {
        name: "Nihilism.",
        quote: "No inherent thing can be found, therefore nothing exists.",
        body: "Initially relieving. The system latches on, defends it, fearing return to discomfort. Becomes a form of ultimate disassociation.",
      },
      view: {
        name: "Empty & dependent.",
        quote:
          "No inherent thing is found — yet things appear and function. They exist dependently, not independently.",
        body: "Emptiness describes the absence of inherent existence. Dependence describes how things actually arise. Not opposed — paired.",
      },
      footer: "Not required for accessing peace.\nBecomes intriguing later in the journey.",
    },
  };
}
