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

export const immeasurablesSlides = steps.map((step, index) => ({
  ...step,
  label: `Guided meditation · Step ${index + 1}`,
  source: "Adapted from Thupten Jinpa · Mind Training · Lesson 5",
  sloganNumber: 0,
  specific: false,
  kind: "",
  link: "",
}));
