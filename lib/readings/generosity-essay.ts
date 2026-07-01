export const READINGS_GENEROSITY_SITE_KEY = "readings_generosity";

export type GenerosityEssayContent = {
  v: 2;
  title: string;
  body: string;
};

const DEFAULT_BODY = `I sat on the beach enjoying a Mexican sunset, my son gliding over the waves, light flickering off the white water in an infinite multiplicity, sparkling in the air, then gone, never to be seen again the same way. Completely unique. Dynamic. Deep saturations of colors, contrast, flow. So much gratitude. What a life. Maybe I had good karma.
Beach vendors passed in an endless stream, lugging their kits and offerings.

“Bracelet, amigo?”

With a smile and an acknowledgment, I said in as kind a tone as I could find, “No, gracias.”

Again and again and again.

Declining a 50-peso, handmade, custom bracelet every single night, every single pass. It wasn’t because the bracelet was deficient. It wasn’t because it was too expensive. I simply didn’t need a bracelet. Not much of an accessories guy.

The next vendor trudged along through the sand, sweating and toasted from long hours in the sun, and the cycle repeated.

“Bracelet, amigo?”
“No, gracias.”
“For your girlfriend, amigo?”
“No, gracias.”
“Cocaine amigo?”
“No, gracias.”

Meanwhile, back at the ranch, my mind had started to open again after a long hibernation, with a fresh new freedom. I contemplated ethics and afflictions. Patterns still arose, and as I read more about them, I started noticing them more in myself.

Miserliness.
Is that like misery?
No. Miserly.
Had to look it up. A friend explained it as the character of Scrooge.
Okay, I see now. A holding back. A protecting something.

I noticed I was cheap with compliments, generous with tips, but needlessly and habitually stingy on the beach. Happy to give rides to hitchhikers, yet I hadn’t told my wife how beautiful she was in ages. I wasn’t exactly Scrooge, but I wasn’t exactly Chuck Feeney either.

Why not run a little experiment?
Notice the holding back. Notice any reification. Then, replace the holding back with generosity. If I could open to generosity, I would be….. If I could let go of miserliness, I would be….

It could be in speech, in thought, in expression, with money, with attitude, with time, with helpfulness, with attention. Anywhere I could, I’d notice miserliness, whether a cobweb or a gross pattern, and replace with generosity.

The effect was immediate.
Happiness brighter. Smiles on faces. Hearts warmed. Compassion felt. Gratitude felt. Generosity felt. Mind… different.

Next I contemplated the ripple of generosity as opposed to the ripple, or non-ripple, of holding back. When the vendor gets home, does that little act get passed along somehow? A far-reaching fractal, infinitely expanding, maybe dissipating, still impactful? What about the little act on my own mind and heart? Would my family feel that, my clients, my business partner? The recipients of the new bracelets?

Why wouldn’t I want all this?

So, we’ve got a generosity-and-appreciation cocktail, smiles all around, a potential massive positive ripple effect, combined with a beach surf sunset bordering on a PCE, versus “No gracias.”

Okay. This doesn’t feel like homework.

Thinking back to years ago, some gifts or donations even felt like:
“I gave. I am generous. He should appreciate it! And maybe even return the favor sometime.”
Reminds me of the classic line:
“Not even a thank-you card?!!”

Now it seems more like:.
Some bracelets were bought. A vendor smiled. Some gifts were given. A ripple rippled. The mind loosened.

Emptiness and Generosity
How could I explain this generosity phenomenon without any inherent giver, receiver, or giving?
Is there really a giver anyway?
A quick scan finds no inherent giver standing on his own. No receiver who could be separate is found either.
What about giving? Any separate giving?
Negative. The pattern is dependent.
Does that annihilate any of those conventionally?
No.
So there is giving. But if it’s not separate or inherent, how does it show up?
Giving depends on a need, an intention, a generosity, a having, a moment, a receiver. The simple relational nature of reality. Nothing deleted. Nothing conventional excluded.

This is what lack of separation or inherency means here. Not oneness. Not non-existence. Not non-conceptuality. Not inconceivability.

When giving, giver, receiver are dependent, it loosens any scent of grandiosity or pity.
Relational nature.

As I realize the degree by which we depend on one another, generosity becomes more natural. As generosity becomes more natural, miserliness fades. As miserliness fades, the heart seems to warm, the mind seems to clear, and colorful bracelets are donned.
A ripple in still water.

Wish you the best in your exploration of generosity, C`;

export function defaultGenerosityEssayContent(): GenerosityEssayContent {
  return {
    v: 2,
    title: "Generosity vs. Miserliness",
    body: DEFAULT_BODY,
  };
}

export function parseGenerosityEssayContent(raw: unknown): GenerosityEssayContent {
  // Always serve the canonical plain-text body from code.
  void raw;
  return defaultGenerosityEssayContent();
}

export function generosityExcerpt(content: GenerosityEssayContent, max = 140): string {
  const line = content.body.split("\n").find((l) => l.trim()) ?? "";
  if (line.length <= max) return line;
  return `${line.slice(0, max).trimEnd()}…`;
}
