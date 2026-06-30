export const READINGS_GENEROSITY_SITE_KEY = "readings_generosity";

export type GenerosityEssayBlock =
  | { type: "p"; text: string }
  | { type: "dialogue"; lines: string[] }
  | { type: "section"; label: string }
  | { type: "h2"; text: string }
  | { type: "pull"; text: string };

export type GenerosityEssayContent = {
  v: 1;
  kicker: string;
  title: string;
  sub: string;
  blocks: GenerosityEssayBlock[];
};

function slice(s: string, max: number): string {
  return s.trim().slice(0, max);
}

function parseBlock(raw: unknown): GenerosityEssayBlock | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const type = o.type;
  if (type === "p" && typeof o.text === "string") {
    return { type: "p", text: slice(o.text, 8000) };
  }
  if (type === "dialogue" && Array.isArray(o.lines)) {
    const lines = o.lines
      .filter((line): line is string => typeof line === "string")
      .map((line) => slice(line, 500))
      .filter(Boolean)
      .slice(0, 24);
    if (!lines.length) return null;
    return { type: "dialogue", lines };
  }
  if (type === "section" && typeof o.label === "string") {
    return { type: "section", label: slice(o.label, 120) };
  }
  if (type === "h2" && typeof o.text === "string") {
    return { type: "h2", text: slice(o.text, 200) };
  }
  if (type === "pull" && typeof o.text === "string") {
    return { type: "pull", text: slice(o.text, 1200) };
  }
  return null;
}

export function defaultGenerosityEssayContent(): GenerosityEssayContent {
  return {
    v: 1,
    kicker: "~ A field note",
    title: "Generosity on the beach",
    sub: "miserliness, bracelets, and relational giving",
    blocks: [
      {
        type: "p",
        text: "I sat on the beach enjoying a Mexican sunset, my son gliding over the waves, light flickering off the white water in an infinite multiplicity, sparkling in the air, then gone, never to be seen again the same way. Completely unique. Dynamic. Deep saturations of colors, contrast, flow. So much gratitude. What a life. Maybe I had good karma.",
      },
      {
        type: "p",
        text: "Beach vendors passed in an endless stream, lugging their kits and offerings.",
      },
      {
        type: "dialogue",
        lines: [
          "“Bracelet, amigo?”",
          "With a smile and an acknowledgment, I said in as kind a tone as I could find, “No, gracias.”",
          "Again and again and again.",
          "Declining a 50-peso, handmade, custom bracelet every single night, every single pass. It wasn’t because the bracelet was deficient. It wasn’t because it was too expensive. I simply didn’t need a bracelet. Not much of an accessories guy.",
        ],
      },
      {
        type: "dialogue",
        lines: [
          "The next vendor trudged along through the sand, sweating and toasted from long hours in the sun, and the cycle repeated.",
          "“Bracelet, amigo?”",
          "“No, gracias.”",
          "“For your girlfriend, amigo?”",
          "“No, gracias.”",
          "“Cocaine amigo?”",
          "“No, gracias.”",
        ],
      },
      {
        type: "p",
        text: "Meanwhile, back at the ranch, my mind had started to open again after a long hibernation, with a fresh new freedom. I contemplated ethics and afflictions. Patterns still arose, and as I read more about them, I started noticing them more in myself.",
      },
      { type: "section", label: "~ Miserliness" },
      {
        type: "p",
        text: "Miserliness.\nIs that like misery?\nNo. Miserly.\nHad to look it up. A friend explained it as the character of Scrooge.\nOkay, I see now. A holding back. A protecting something.",
      },
      {
        type: "p",
        text: "I noticed I was cheap with compliments, generous with tips, but needlessly and habitually stingy on the beach. Happy to give rides to hitchhikers, yet I hadn’t told my wife how beautiful she was in ages. I wasn’t exactly Scrooge, but I wasn’t exactly Chuck Feeney either.",
      },
      { type: "pull", text: "Why not run a little experiment?" },
      {
        type: "p",
        text: "Notice the holding back. Notice any reification. Then, replace the holding back with generosity. If I could open to generosity, I would be….. If I could let go of miserliness, I would be….",
      },
      {
        type: "p",
        text: "It could be in speech, in thought, in expression, with money, with attitude, with time, with helpfulness, with attention. Anywhere I could, I’d notice miserliness, whether a cobweb or a gross pattern, and replace with generosity.",
      },
      {
        type: "p",
        text: "The effect was immediate.\nHappiness brighter. Smiles on faces. Hearts warmed. Compassion felt. Gratitude felt. Generosity felt. Mind… different.",
      },
      { type: "section", label: "~ The ripple" },
      {
        type: "p",
        text: "Next I contemplated the ripple of generosity as opposed to the ripple, or non-ripple, of holding back. When the vendor gets home, does that little act get passed along somehow? A far-reaching fractal, infinitely expanding, maybe dissipating, still impactful? What about the little act on my own mind and heart? Would my family feel that, my clients, my business partner? The recipients of the new bracelets?",
      },
      { type: "pull", text: "Why wouldn’t I want all this?" },
      {
        type: "p",
        text: "So, we’ve got a generosity-and-appreciation cocktail, smiles all around, a potential massive positive ripple effect, combined with a beach surf sunset bordering on a PCE, versus “No gracias.”",
      },
      {
        type: "p",
        text: "Okay. This doesn’t feel like homework.",
      },
      {
        type: "p",
        text: "Thinking back to years ago, some gifts or donations even felt like:\n“I gave. I am generous. He should appreciate it! And maybe even return the favor sometime.”",
      },
      { type: "pull", text: "“Not even a thank-you card?!!”" },
      {
        type: "p",
        text: "Now it seems more like:\nSome bracelets were bought. A vendor smiled. Some gifts were given. A ripple rippled. The mind loosened.",
      },
      { type: "h2", text: "Emptiness and Generosity" },
      {
        type: "p",
        text: "How could I explain this generosity phenomenon without any inherent giver, receiver, or giving?\nIs there really a giver anyway?\nA quick scan finds no inherent giver standing on his own. No receiver who could be separate is found either.\nWhat about giving? Any separate giving?\nNegative. The pattern is dependent.\nDoes that annihilate any of those conventionally?\nNo.\nSo there is giving. But if it’s not separate or inherent, how does it show up?",
      },
      {
        type: "p",
        text: "Giving depends on a need, an intention, a generosity, a having, a moment, a receiver. The simple relational nature of reality. Nothing deleted. Nothing conventional excluded.",
      },
      {
        type: "p",
        text: "This is what lack of separation or inherency means here. Not oneness. Not non-existence. Not non-conceptuality. Not inconceivability.",
      },
      {
        type: "p",
        text: "When giving, giver, receiver are dependent, it loosens any scent of grandiosity or pity.\nRelational nature.",
      },
      {
        type: "p",
        text: "As I realize the degree by which we depend on one another, generosity becomes more natural. As generosity becomes more natural, miserliness fades. As miserliness fades, the heart seems to warm, the mind seems to clear, and colorful bracelets are donned.\nA ripple in still water.",
      },
      {
        type: "p",
        text: "Wish you the best in your exploration of generosity,\nC",
      },
    ],
  };
}

export function parseGenerosityEssayContent(raw: unknown): GenerosityEssayContent {
  const d = defaultGenerosityEssayContent();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return d;
  const o = raw as Record<string, unknown>;
  const blocksRaw = o.blocks;
  const blocks = Array.isArray(blocksRaw)
    ? blocksRaw.map(parseBlock).filter((b): b is GenerosityEssayBlock => b != null)
    : d.blocks;

  return {
    v: 1,
    kicker: typeof o.kicker === "string" ? slice(o.kicker, 80) : d.kicker,
    title: typeof o.title === "string" ? slice(o.title, 200) : d.title,
    sub: typeof o.sub === "string" ? slice(o.sub, 300) : d.sub,
    blocks: blocks.length ? blocks : d.blocks,
  };
}
