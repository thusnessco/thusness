const practices = {
  "analyze-and-rest": [
    ["Settle and choose an object", "Feel your feet or the support of the seat. Choose an everyday object, such as a cup. Notice how readily it appears to be a thing in its own right."],
    ["Examine the object", "Look for the cup apart from its parts, its causes, and the use for which you call it a cup. What can you find that makes it a cup all by itself? Notice that you can still pick it up and drink from it."],
    ["Examine the mind that knows", "Turn toward the experience of seeing. Look for a knower that exists apart from this moment of seeing and the conditions that make it possible. Where would you locate it? Notice what you actually find."],
    ["Examine the antidote", "Notice the thought that the cup is empty of independent existence. Examine that thought too. See how it depends on the cup, your inquiry, and what you mean by emptiness. Let the conclusion itself come under the same inquiry."],
    ["Rest with what you found", "Let the questions fall quiet for a few breaths. Stay alert and rest with whatever understanding became clear. When it fades, return briefly to the inquiry, then rest again."],
    ["Close with compassion", "Bring to mind someone caught in a difficult situation. Wish them relief from the suffering that comes with grasping. Dedicate whatever benefit came from this sitting to others."],
  ],
  "mind-like-space": [
    ["Recall a broad horizon", "Picture standing somewhere with an unobstructed view of the sky. Let that sense of openness inform how you attend to what is happening now."],
    ["Notice a thought arrive", "When a thought comes up, recognize it as a thought. Notice the pull to follow its story. Give it a moment to change or pass on its own, like a cloud moving across the sky."],
    ["Let attention widen", "If a thought fills your attention, notice sounds and sensations around it. Let thoughts come and go within that wider attention. Use the image of space to loosen the grip of a thought that feels solid."],
  ],
  "illusion-like": [
    ["Pick a moment after sitting", "Recall an ordinary encounter that felt more fixed than it now seems. Perhaps a brief remark felt like a verdict on who you are."],
    ["Notice what shaped the appearance", "Recall what was said and what you brought to it, such as your mood, expectations, and history with that person. Notice how these conditions shaped what the remark seemed to mean."],
    ["Carry the inquiry into your day", "When a situation feels fixed today, silently recall that it is illusion-like. Look for one condition you may have overlooked. Feel how the situation still affects people and choose a response that takes their welfare into account."],
  ],
};

export const ultimateSlides = {
  "analyze-and-rest": makeSlides(practices["analyze-and-rest"]),
  "mind-like-space": makeSlides(practices["mind-like-space"]),
  "illusion-like": makeSlides(practices["illusion-like"]),
};

function makeSlides(steps: string[][]) {
  return steps.map(([title, body], index) => ({
    title,
    body,
    label: `Guided meditation · Step ${index + 1}`,
    source: "Adapted from Thupten Jinpa · Mind Training · Lesson 4",
    sloganNumber: 0,
    specific: false,
    kind: "",
    link: "",
  }));
}
