const steps = [
  {
    title: "Settle and bring someone to mind",
    body: "Feel the support of the seat beneath you. Let a few breaths pass. Bring to mind someone you know and can picture easily. Recall a small detail about them, such as their voice or the way they greet you. Like you, this person wants to be happy and wants relief when things are hard.",
  },
  {
    title: "Equanimity",
    body: "Picture a person you feel close to, someone you barely know, and someone you find a little difficult. Notice how easily your attention goes to one and passes over another. Give each person a few breaths of attention. Silently say to each, “Your happiness and suffering matter too.”",
  },
  {
    title: "Loving-kindness",
    body: "Return to the person you first brought to mind. Picture something that would support their well-being today. Perhaps they need rest, good company, or a chance to do something they enjoy. Silently wish them happiness and the conditions that help it grow. Let the wish settle for a few breaths.",
  },
  {
    title: "Compassion",
    body: "Bring to mind a difficulty this person is facing. Imagine a moment in their day when they might feel its weight. Silently wish, “May you find relief. May you have the help you need.” Stay with that wish for a few breaths. Is there a small way you could help?",
  },
  {
    title: "Sympathetic joy",
    body: "Recall something that has gone well for someone else. Picture what it might be like for them to receive good news or see their effort pay off. If you notice yourself comparing, return your attention to their happiness. Silently wish, “May this good fortune continue.”",
  },
  {
    title: "Widen the circle",
    body: "Extend these wishes to someone you barely know, then to someone you find difficult. Include yourself and people you may never meet. Wish them happiness and its causes, relief from suffering, and the chance to keep what brings them joy. Feel the support of the seat again before you finish.",
  },
];

function guidedSlides(steps: { title: string; body: string }[]) {
  return steps.map((step, index) => ({
    ...step,
    label: `Guided meditation · Step ${index + 1}`,
    source: "Adapted from Thupten Jinpa · Mind Training · Lesson 5",
    sloganNumber: 0,
    specific: false,
    kind: "",
    link: "",
  }));
}

export const immeasurablesSlides = guidedSlides(steps);


export const threePoisonsSlides = guidedSlides([
  { title: "Notice your first reaction", body: "Recall three ordinary encounters from today. Choose one you wanted to prolong, one you wanted to escape, and one you barely noticed. Let each scene come to mind briefly. Feel how your attention moves as you recall it." },
  { title: "When you want to hold on", body: "Return to the pleasant encounter. Notice the difference between enjoying it and feeling that it has to continue. Let yourself appreciate what was good for one breath. Then see what it feels like to let the moment end." },
  { title: "When you want to push away", body: "Recall a mildly irritating encounter. Notice where your body tightens. Take a breath and give yourself a moment before deciding how to respond. Consider what might be going on for the other person. What response would address the situation without adding hostility?" },
  { title: "When you barely notice", body: "Recall the encounter that passed almost unnoticed. Picture one ordinary detail about the person. Imagine what you might learn if you paid closer attention. See whether curiosity can take the place of indifference." },
  { title: "Practice in the next encounter", body: "Choose one reaction to watch for today. When you notice it, pause and try the response you just practiced. Give yourself a moment afterward to notice what changed." },
]);

export const practicePhrasesSlides = guidedSlides([
  { title: "Choose words you can mean", body: "Bring to mind someone who is having a hard time. You might use the words “May you be free from suffering” or “May you have the help you need.” Choose a short phrase that expresses what you wish for them." },
  { title: "Connect the words to a person", body: "Picture a specific moment in that person’s day. Say your phrase silently once. Pause and feel the wish behind it. Repeat the phrase a few times, leaving room after each repetition." },
  { title: "Recall the wish in another situation", body: "Imagine an ordinary encounter where you tend to hurry or tune out. Say your phrase again, quietly in your mind. Notice whether the words help you bring the same care to this person." },
  { title: "Choose a cue for today", body: "Pick one moment that can remind you of the phrase, such as hearing someone sigh or waiting for a conversation to begin. When it happens, say your phrase once and let it guide your next response." },
]);

export const futureSelfSlides = guidedSlides([
  { title: "Picture your future self", body: "Settle for a few breaths. Imagine yourself a little further down the road, facing an ordinary difficulty. Picture where you are and what feels hard. Let yourself care about the person in that scene." },
  { title: "Practise taking", body: "Imagine lifting the burden from your future self and taking it upon yourself now. Picture their face or posture as they feel some relief. Stay with the wish that they be free from suffering for a few breaths." },
  { title: "Practise giving", body: "Imagine offering your future self whatever would help them meet that moment, such as strength, time to rest, or support. You can imagine taking on the in-breath and giving on the out-breath. Take each step at a pace that lets you picture it clearly." },
  { title: "Bring in someone close", body: "Picture someone you care about facing a difficulty. When you feel ready, imagine taking away their burden and offering them what would help. See them relieved for a moment." },
  { title: "Widen the practice in stages", body: "Over repeated sittings, try the same practice with someone you barely know, then someone you find difficult. Gradually extend the wish for relief to all beings. For today, stay with the person you can bring to mind clearly." },
]);
