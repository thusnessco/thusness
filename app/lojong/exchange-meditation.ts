export const exchangeSource =
  "https://www.drepunggomangusa.org/wp-content/uploads/2019/01/shantideva-bodhicaryavatara-wallace.pdf";

const steps = [
  {
    title: "Settle and choose a situation",
    body: "Feel your feet or the weight of your body on the seat. Let a few breaths pass. Choose a familiar situation where people compare themselves, such as who gets heard in a group. Picture yourself there. Stay with the same situation as you try each role. Take as long as you need on each slide.",
  },
  {
    title: "Give someone else the word “I”",
    body: "Picture someone in that situation who gets less recognition than you do. Imagine sitting where they sit and seeing your usual self across the room. For this part of the practice, “I” means the person whose seat you’ve taken. Refer to your usual self by name or as “that person.”",
  },
  {
    title: "Feel envy from the other seat",
    body: "From that seat, try the thought, “I contributed too. How come everyone listens when that person speaks?” Let the envy register for a few breaths. Where do you feel it? What would it be like to keep being overlooked? Treat the words as part of the exercise and stay curious about what they bring up.",
  },
  {
    title: "Take the seat of a peer",
    body: "Now become someone with roughly the same standing as your usual self. Look across at your usual self and think, “I can do this just as well. If that person gets ahead, where does that leave me?” Feel what happens when you see the other person’s success as a threat to your own.",
  },
  {
    title: "Take the seat of someone with more standing",
    body: "Now give “I” to someone whose opinion carries more weight in this situation. Look back at your usual self and try, “I know how things work here. That person still has a lot to learn.” Notice how easy it is to dismiss someone from this seat. What would it feel like to be on the receiving end of that attitude?",
  },
  {
    title: "Let the roles go",
    body: "Return to the feeling of your body sitting here. Recall how the same scene felt from each seat. Notice how envy, rivalry, and pride shifted with where you placed “I.” Give yourself a little time to feel the wish to be heard and respected that ran through the different roles.",
  },
  {
    title: "Bring the exchange back into the room",
    body: "Picture meeting these people again. Remember what it felt like when you called one of them “I.” What might you do differently now? Choose one action you could actually take, such as asking for someone’s view or naming their contribution. End by wishing everyone in the scene, including yourself, some ease.",
  },
];

export const exchangeSlides = steps.map((step, index) => ({
  ...step,
  label: `Guided meditation · Step ${index + 1}`,
  source: "Adapted from Śāntideva · The Way of the Bodhisattva · 8.140–158",
  sloganNumber: 0,
  specific: false,
  kind: "",
  link: "",
}));
