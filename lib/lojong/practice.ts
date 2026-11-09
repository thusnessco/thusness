import { slogans } from "./curriculum";

export const observations = [
  { id: "anger", label: "Anger / irritation" },
  { id: "resentment", label: "Resentment / keeping score" },
  { id: "attachment", label: "Attachment / craving" },
  { id: "withholding", label: "Holding back / unwillingness to share" },
  { id: "pride", label: "Pride / superiority" },
  { id: "envy", label: "Jealousy / envy" },
  { id: "illwill", label: "Ill will / wanting to retaliate" },
  { id: "indifference", label: "Indifference to another’s welfare" },
  { id: "selfcherishing", label: "Putting my welfare above others’" },
  { id: "grasping", label: "Grasping at a solid self or other" },
  { id: "unsure", label: "Not sure" },
  { id: "none", label: "No affliction identified" },
];
export const expectations = [
  { id: "appreciation", label: "Needing appreciation or recognition in return" },
  { id: "outcome", label: "Insisting on a particular outcome" },
  { id: "control", label: "Needing to control what happens" },
  { id: "right", label: "Insisting that I must be right" },
  { id: "comfort", label: "Unwillingness to allow discomfort" },
  { id: "fixedself", label: "Clinging to a fixed idea of who I am" },
  { id: "fixedother", label: "Clinging to a fixed idea of who they are" },
  { id: "unsure", label: "Not sure" },
  { id: "none", label: "None identified" },
];

type RootNote = { number: number; explanation: string; source: string };
export const rootNotes: RootNote[] = [
  { number: 28, explanation: "Begin with the affliction that most strongly captures your mind. There is no fixed sequence for which affliction to address first.", source: "Lesson 3, pp. 4–5" },
  { number: 29, explanation: "Examine expectations of recognition or reward attached to generosity and helpful action.", source: "Lesson 3, p. 5" },
  { number: 30, explanation: "Examine whether practice or compassionate conduct has become mixed with self-interest or self-cherishing.", source: "Lesson 3, p. 5" },
  { number: 31, explanation: "The annotated root lines explain this instruction in relation to retaliating for harm. Its relevance depends on whether a wish to retaliate is actually present.", source: "Annotated Root Lines, course Lesson 3 readings, p. 11" },
  { number: 38, explanation: "Guard against the practice itself becoming another source of ego aggrandizement.", source: "Lesson 3, p. 5" },
  { number: 40, explanation: "Yogas here means activities: bring compassion and bodhicitta into what you do.", source: "Lesson 3, p. 5" },
  { number: 41, explanation: "Bring bodhicitta and compassion to the difficulties and errors you encounter. Tonglen is one way to apply this instruction.", source: "Lesson 3, p. 5" },
  { number: 42, explanation: "Set an intention at the beginning. At the end, review the relationship between intention and conduct, rejoice in what went well, recognize gaps without self-condemnation, and dedicate the effort.", source: "Lesson 3, pp. 5–6" },
  { number: 45, explanation: "Recognize the affliction arising; apply an antidote; ensure that the antidote is effective.", source: "Lesson 3, p. 8" },
  { number: 57, explanation: "Step back, observe, investigate, and analyze before responding. Keep a sense of proportion and seek a close understanding of the situation.", source: "Lesson 3, p. 7" },
  { number: 59, explanation: "Notice the sequence from a trigger to annoyance and anger. Training brings awareness earlier into that sequence, allowing greater freedom in how you respond.", source: "Lesson 3, pp. 7–8" },
  { number: 61, explanation: "When helping or extending kindness, do not depend on explicit recognition from the recipient. Return to the intention to help.", source: "Lesson 3, p. 8" },
  { number: 2, explanation: "Work with the apparent solidity of the object or situation. Dreamlike means empty of inherent existence, not nonexistent or without consequences.", source: "Lesson 4, pp. 3–4, 7" },
  { number: 3, explanation: "Examine grasping at the subject—the mind that experiences or meditates—as independently real. Ultimate awakening mind concerns both object and subject.", source: "Lesson 4, p. 4" },
  { number: 4, explanation: "Do not turn emptiness, or the mind meditating on it, into something inherently real. This is the third part of examining object, subject, and remedy.", source: "Lesson 4, pp. 4–5" },
];

export function suggestedRoots(states: string[], motives: string[]): number[] {
  const ids: number[] = [];
  if (motives.includes("appreciation")) ids.push(29, 61, 30);
  if (states.some(s => ["anger", "resentment"].includes(s))) ids.push(59, 57);
  if (states.includes("illwill")) ids.push(31, 59);
  if (states.includes("pride")) ids.push(30, 38);
  if (states.some(s => ["selfcherishing", "envy", "indifference", "attachment"].includes(s))) ids.push(40, 41, 30);
  if (states.includes("grasping") || motives.some(m => ["fixedself", "fixedother"].includes(m))) ids.push(2, 3, 4);
  ids.push(28, 45, 57, 40, 41);
  return [...new Set(ids)];
}

export const methods = [
  { id: "rejoicing", title: "Rejoice in another’s good fortune", basis: "Conventional awakening mind · Point 2", steps: ["Name the happiness or success the other person has.", "Notice the feeling that their gain makes you smaller. Their happiness need not be your loss.", "Try the wish: may their happiness continue and have good causes. Begin with a small, sincere willingness rather than forcing enthusiasm.", "Notice whether you can appreciate something good for them while also caring for your own unmet needs."], source: "Adapted from T. Jinpa, Lesson 5, on responding to others’ achievements and good fortune with joy instead of jealousy. Prompts are study paraphrases, not quotations." },

  { id: "compassion", title: "Cultivate compassion", basis: "Conventional awakening mind · Point 2; single-means guidelines · Point 7 (#40–41)", steps: ["Recognize that the other person wants happiness and freedom from suffering, as you do.", "Bring their welfare to mind. Cultivate concern for their happiness and freedom from suffering and its causes.", "Consider what would actually help. Compassion does not require agreeing to every wish.", "Connect the effort to bodhicitta: the aspiration to awaken for the benefit of all beings."], source: "Based on T. Jinpa’s explanation of equalizing and exchanging self and others, Lesson 1, p. 6; and the single-means instructions, Lesson 3, p. 5. This is an adapted practice outline, not a quoted traditional sequence." },
  { id: "equality", title: "Equalize self and others", basis: "Conventional awakening mind · Point 2", steps: ["Recognize your own wish for happiness and freedom from suffering.", "Recognize the same wish in the other person. Remember: ‘just like me.’", "Consider the equal importance of their welfare and yours. Equal concern does not require identical actions or agreeing with every wish.", "Examine whether treating your own satisfaction as uniquely important is sustaining the affliction."], source: "Adapted practice outline based on T. Jinpa, Lesson 5, pp. 3–5, explaining Shantideva’s equalizing self and others. Not a quoted traditional sequence." },
  { id: "kindness", title: "Cultivate loving-kindness", basis: "Conventional awakening mind · Point 2; giving aspect of tonglen", steps: ["Bring the person to mind and recognize their wish for happiness.", "Cultivate friendliness and concern for their well-being.", "Wish that they have happiness and its causes. Loving-kindness emphasizes happiness; compassion emphasizes relief from suffering.", "Let this intention inform a practical act of kindness, where appropriate."], source: "Adapted practice outline based on T. Jinpa, Lesson 5, pp. 3, 5–6, on holding others dear, loving-kindness, and giving. Not a quoted traditional sequence." },
  { id: "generosity", title: "Cultivate generosity", basis: "Commitments · Point 6; slogans 29–30", steps: ["Consider what you can offer that would benefit the person: time, attention, help, or material support.", "Examine whether the offer carries a demand for recognition, appreciation, or repayment.", "Choose a helpful action you can freely undertake. Giving need not mean fulfilling every request.", "Act with the intention to benefit, and examine whether attachment to a return has loosened."], source: "Adapted application of T. Jinpa’s explanation of generosity without expectation of reward, Lesson 3, p. 5, and kindness without applause, p. 8. Not a quoted traditional meditation." },
  { id: "tonglen", title: "Practice tonglen: giving and taking", basis: "Conventional awakening mind · Point 2; slogans 7–8", steps: ["Begin with giving: imagine offering happiness, strength, well-being, and their causes to someone you care about.", "When workable, add taking: imagine taking away their suffering and its causes. One gentler option is to let it dissolve into an orb of white light in front of the heart.", "If taking from others is difficult, begin with your future self and gradually extend to others. You can remain with giving while developing familiarity.", "Initially, the visualization need not follow the breath. When familiar, coordinate taking with inhalation and giving with exhalation, without forcing or holding the breath.", "Return to the intention that beings be free from suffering. This is imaginative training, not a literal transfer of illness."], source: "Adapted practice outline based on T. Jinpa, Lesson 5, pp. 5–6 and 9. Giving first, gradual taking, the light visualization, and delaying breath coordination are all discussed there." },
  { id: "expectation", title: "Work with an expectation of reward", basis: "Commitments and guidelines · Points 6–7; slogans 29, 30, 61", steps: ["Identify the return you hoped for: appreciation, recognition, or another response.", "Examine how that expectation is affecting your intention and conduct.", "Work to release the demand for a return. Renew the intention to help.", "Check whether resentment or self-preoccupation has diminished."], source: "Practice outline based on T. Jinpa, Lesson 3, pp. 5, 8; explanation summarized, not a canonical quotation." },
  { id: "patience", title: "Cultivate patience", basis: "Guidelines · Point 7; slogans 45, 57, 59", steps: ["Recognize the anger and the thoughts that sustain it.", "Refrain from acting out the impulse to harm or retaliate.", "Investigate the circumstances and bring the other person’s suffering and welfare into consideration.", "Check whether there is more freedom to respond without anger governing the response."], source: "Practice outline based on T. Jinpa’s explanation of awareness and anger, Lesson 3, pp. 7–8, together with the course’s cultivation of compassion. Not a canonical quotation." },
  { id: "emptiness", title: "Examine grasping through emptiness", basis: "Ultimate awakening mind · Point 2; slogans 2–4", steps: ["Examine the object: how are you apprehending the person or situation as solid and independently real?", "Examine the subject: how does the apparently solid ‘me’ who is affected appear to exist?", "Consider dependent arising. Not finding inherent existence does not negate conventional people, suffering, or responsibility.", "Release grasping at the analysis or remedy itself. Return to the situation with compassion."], source: "Practice outline based on T. Jinpa, Lesson 4, pp. 3–7: object, subject, and remedy. A brief inquiry does not by itself establish a realization of emptiness." },
  { id: "investigate", title: "Cultivate understanding: investigate and analyze", basis: "Guidelines · Point 7; slogan 57", steps: ["Separate what occurred from the interpretation you added.", "Observe the thoughts and emotions without deciding in advance that a particular affliction must be present.", "Examine the circumstances more closely. Identify what you know about the other person’s situation and what remains uncertain.", "Respond on the basis of that closer understanding rather than being pulled into an automatic emotional reaction."], source: "Practice outline based on T. Jinpa, Lesson 3, p. 7. This concerns investigation and close analysis; wisdom realizing emptiness is a separate option. Not a canonical quotation." },
];

export const practiceConnections: Record<string, { instructions: number[]; context: string }> = {
  compassion: { instructions: [40, 41], context: "The single means refers to awakening mind. Cultivating compassion supports that larger training; it is not a required preliminary feeling before every antidote." },
  equality: { instructions: [7, 40], context: "Equalizing self and others supports conventional awakening mind. It is preparation for exchanging self and others, not a claim that slogan 7 alone prescribes equality as a remedy for pride." },
  kindness: { instructions: [7, 40], context: "Giving in tonglen develops loving-kindness: wishing others happiness and its causes. This outline develops that aspect without claiming it is the full tonglen practice." },
  generosity: { instructions: [29, 30, 61], context: "Give and help without expecting repayment or applause. This small offering is an adapted application of that teaching, not a separate prescribed Lojong sequence." },
  rejoicing: { instructions: [40, 41], context: "Sympathetic joy in others’ good fortune is an expression of compassion. These slogans supply the broader awakening-mind context; they do not literally name rejoicing." },
  tonglen: { instructions: [7, 8], context: "These instructions explicitly concern giving and taking, and coordinating them with the breath. The prompts use a gradual approach: giving first, optional taking, and breath coordination after familiarity." },
  expectation: { instructions: [29, 30, 61], context: "These commitments directly address reward seeking and self-interest in helping. Use this response when an expectation of return is present; resentment can have other causes." },
  patience: { instructions: [45, 57, 59], context: "Recognize anger, counter it, and examine whether the response works. This outline applies anger awareness and investigation; it is not a complete traditional patience meditation." },
  emptiness: { instructions: [2, 3, 4], context: "These instructions concern ultimate awakening mind: examining object, subject, and remedy. This deeper inquiry requires the commentary and is not interchangeable with simply calming down." },
  investigate: { instructions: [57, 45], context: "Investigation and close analysis are explicit guidelines. This practical inquiry helps examine a reaction; it should not be confused with realization of emptiness." },
};

// Practical suggestions, not diagnoses or automatic one-to-one remedies.
export const directAntidotes = [
  { state: "anger", method: "patience", label: "Anger → patience", why: "Make room for the feeling without acting on the urge to hurt. Choose a response after the first surge." },
  { state: "resentment", method: "expectation", label: "Keeping score → release the demand for a return", why: "Look at what you hoped to receive. You can loosen the demand while still addressing unfairness." },
  { state: "attachment", method: "investigate", label: "Clinging → examine what you are insisting on", why: "Notice what you want to possess, keep, or control. Distinguish a useful wish from the demand that things must go your way. If you are withholding something shareable, generosity is another option." },
  { state: "withholding", method: "generosity", label: "Holding back → generosity", why: "Offer a small amount of time, attention, help, or resources freely. Keep appropriate boundaries and provide for your needs." },
  { state: "pride", method: "equality", label: "Superiority → equal regard", why: "Recognize the other person’s wish for happiness as equally important. You do not need to put yourself down." },
  { state: "envy", method: "rejoicing", label: "Envy → joy in another’s good fortune", why: "Practise wishing their happiness well, without treating their success as your loss." },
  { state: "illwill", method: "kindness", label: "Ill will → loving-kindness", why: "Try wishing them happiness and its causes. This does not require approving harm or staying in contact." },
  { state: "indifference", method: "compassion", label: "Indifference → care and compassion", why: "Attend to their experience and consider one thing that would help." },
  { state: "selfcherishing", method: "equality", label: "Only my welfare matters → equal concern", why: "Include their needs alongside yours, rather than excluding either person." },
  { state: "grasping", method: "investigate", label: "A fixed picture → curiosity and investigation", why: "Separate what happened from the fixed story about who you or they are. Deeper emptiness inquiry remains optional." },
  { state: "unsure", method: "investigate", label: "Not sure → investigate gently", why: "Look more closely before choosing a label or remedy." },
  { state: "none", method: "kindness", label: "No affliction identified → cultivate kindness", why: "You can practise care without deciding that something is wrong." },
];
export function suggestedAntidotes(states: string[]) {
  return directAntidotes.filter(item => states.includes(item.state)).filter((item, index, list) => list.findIndex(other => other.method === item.method) === index);
}

export const outcomes = [
  { id: "weaker", label: "The affliction weakened" },
  { id: "unchanged", label: "No clear change" },
  { id: "stronger", label: "It became stronger" },
  { id: "unsure", label: "Not sure yet" },
];

export type Reflection = { event: string; interpretation: string; states: string[]; motives: string[]; roots: number[]; method: string; outcome: string; observation: string };
export const emptyReflection = (): Reflection => ({ event: "", interpretation: "", states: [], motives: [], roots: [], method: "", outcome: "", observation: "" });

export function reflectionSummary(r: Reflection): string {
  const method = methods.find(m => m.id === r.method);
  const labels = (ids: string[], list: { id: string; label: string }[]) => ids.map(id => list.find(item => item.id === id)?.label).filter(Boolean).join("; ") || "Not recorded";
  const lines = ["LOJONG — PRACTICE REVIEW", "", "Situation (your words)", r.event, ...(r.interpretation.trim() ? ["", "Thoughts / interpretation (your words)", r.interpretation] : []), "", "What you identified", labels(r.states, observations), "", "Expectations / grasping you identified", labels(r.motives, expectations), "", "Instructions you selected", ...r.roots.flatMap(number => {
    const slogan = slogans.find(s => s.number === number);
    const note = rootNotes.find(n => n.number === number);
    return slogan ? [`#${number} · Point ${slogan.point}: ${slogan.text}`, ...(note ? [`Source-based explanation: ${note.explanation}`] : [])] : [];
  }), "", "Practice selected", method?.title ?? "Not recorded", ...(method ? [...method.steps.map((step, i) => `${i + 1}. ${step}`) ] : []), "", "Effect you reported", outcomes.find(o => o.id === r.outcome)?.label ?? "Not recorded", ...(r.observation.trim() ? [r.observation] : []), "", "Next review", r.outcome === "weaker" ? "Observe whether the same pattern arises again. Renew your intention and dedicate the effort." : "The effect is not established. Investigate further or try another suitable antidote; noticing alone does not complete the three difficult challenges.", "", "This review records your selections. It does not establish a diagnosis, a broken commitment, or spiritual realization."];
  return lines.join("\n");
}


export const oneThingLessons = [
  { slogan: 45, title: "Notice. Respond. Check.", explanation: "Noticing a familiar affliction is the beginning of training. Apply a suitable response, then look honestly at whether it helped. Awareness alone does not complete the practice.", action: "When irritation appears today, pause before speaking. Try patience or concern for the other person, then notice whether you have more freedom in how you respond.", review: "Did the response loosen the irritation, or do I need to try again?" },
  { slogan: 42, title: "Give the day a direction.", explanation: "A morning intention and an evening review help carry Lojong into ordinary life. Review what happened with honesty and kindness, rejoice in what went well, and dedicate the effort to the benefit of beings.", action: "Choose one intention for today: when someone inconveniences me, I will remember that their welfare matters too. At the end of the day, revisit one actual encounter.", review: "Where did I remember my intention? Where can I renew it?" },
  { slogan: 29, title: "Offer one thing freely.", explanation: "Helping can become a transaction when it carries a demand for repayment, appreciation, or recognition. This instruction asks us to loosen that demand and reconnect with the intention to benefit.", action: "Offer a small, useful kindness today. Notice any expectation of a return, and gently release it. Choose something you can freely give while respecting your needs and boundaries.", review: "Could their benefit be enough, even without thanks?" },
  { slogan: 57, title: "Look again before reacting.", explanation: "Investigation gives a reaction room to become understanding. Look closely at what happened and the interpretation you added, keeping a sense of proportion and openness to what you do not know.", action: "In one difficult encounter, name the observable facts. Then name the story you added. Consider one other plausible explanation before choosing your response.", review: "What became clearer when I looked more closely?" },
  { slogan: 28, title: "Work with the strongest familiar pattern.", explanation: "There is no fixed order in which everyone must address afflictions. Begin with the pattern that most strongly captures your mind, and bring training to it when it appears.", action: "Choose one recurring pattern to recognize today, such as irritation, envy, or reward seeking. When it appears, try one relevant practice and check its effect.", review: "Did I recognize the pattern sooner, and what helped?" },
  { slogan: 59, title: "Meet irritation with patience.", explanation: "When irritation appears, cultivate patience: allow the discomfort without acting on the urge to hurt. Bring compassion into the response by remembering that the other person also wants happiness and freedom from suffering.", action: "In one irritating encounter today, pause before speaking or sending a message. Let yourself feel the discomfort without retaliating. Remember: this person struggles too. Wish them freedom from suffering, then choose a useful response. You can still be firm or set a boundary.", review: "Did patience and concern for the other person soften the anger? If not, what needs closer attention?" },
  { slogan: 61, title: "Let kindness stand without applause.", explanation: "The instruction concerns depending on recognition for kindness. Appreciation can be welcome; needing it as the price of helping pulls attention back toward ourselves.", action: "After one helpful act today, notice whether you are waiting to be acknowledged. Return attention to whether the act was useful for the other person.", review: "What happened when I released the demand to be noticed?" },
  { slogan: 40, title: "Include their welfare in one ordinary action.", explanation: "The single means refers to awakening mind: bring compassion and bodhicitta into your activities. The direction is awakening for the benefit of beings, cultivated through ordinary opportunities to care.", action: "Before one conversation or task, remember that the other person wants happiness and freedom from suffering, just as you do. Let that recognition influence one concrete choice.", review: "How did including their welfare change what I did?" },
];

export function oneThingForDate(date: Date) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return oneThingLessons[((day % oneThingLessons.length) + oneThingLessons.length) % oneThingLessons.length];
}
