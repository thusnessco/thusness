export const exchangeSource =
  "https://www.drepunggomangusa.org/wp-content/uploads/2019/01/shantideva-bodhicaryavatara-wallace.pdf";

export const exchangeScenarios = [
  {
    title: "Who gets credit",
    scene: "Picture a group finishing a project. Some contributions get public praise while others go unnoticed. Put yourself in the room.",
    envy: "I did my share too. How come everyone thanks that person?",
    rivalry: "We contributed about the same. If that person gets the credit, what will people think of my work?",
    pride: "People already know how much I contributed. That person still has to prove themselves.",
    action: "Name a contribution that went unnoticed.",
  },
  {
    title: "Who gets heard",
    scene: "Picture a meeting where some people’s ideas shape the decision while others struggle to get a word in. Put yourself at the table.",
    envy: "I had something to say too. Why does everyone listen when that person speaks?",
    rivalry: "My idea is just as good. If they go with that person’s suggestion, mine will be forgotten.",
    pride: "I know what works here. We can move on without hearing that person out.",
    action: "Invite someone to finish a thought that got interrupted.",
  },
  {
    title: "Who carries the workload",
    scene: "Picture people preparing a shared meal or event. Some have time to relax while others are still doing the setup or cleanup. Put yourself there.",
    envy: "I’m still working. How did that person get to sit down already?",
    rivalry: "That person and I took on the same job. Why am I the one still doing it?",
    pride: "I’m the one keeping this organized. That person can handle the cleanup.",
    action: "Offer to share a task that someone has been carrying alone.",
  },
];

export function getExchangeSlides(scenario: (typeof exchangeScenarios)[number]) {
  const steps = [
    {
      title: "Settle and choose a situation",
      body: `Feel your feet or the weight of your body on the seat. Let a few breaths pass. ${scenario.scene} Stay with this scene as you try each role. Take as long as you need on each slide.`,
    },
    {
      title: "Give someone else the word “I”",
      body: "Picture someone in that situation with less standing or fewer choices than your usual self. Imagine sitting where they sit and seeing your usual self across the room. For this part of the practice, “I” means the person whose seat you’ve taken. Refer to your usual self by name or as “that person.”",
    },
    {
      title: "Feel envy from the other seat",
      body: `From that seat, try the thought, “${scenario.envy}” Let the envy register for a few breaths. Where do you feel it? What would it be like to keep being overlooked? Treat the words as part of the exercise and stay curious about what they bring up.`,
    },
    {
      title: "Take the seat of a peer",
      body: `Now become someone with roughly the same standing as your usual self. Look across at your usual self and think, “${scenario.rivalry}” Feel what happens when you see the other person’s success as a threat to your own.`,
    },
    {
      title: "Take the seat of someone with more standing",
      body: `Now give “I” to someone whose opinion carries more weight in this situation. Look back at your usual self and try, “${scenario.pride}” Notice how easy it is to dismiss someone from this seat. What would it feel like to be on the receiving end of that attitude?`,
    },
    {
      title: "Let the roles go",
      body: "Return to the feeling of your body sitting here. Recall how the same scene felt from each seat. Notice how envy, rivalry, and pride shifted with where you placed “I.” Give yourself a little time to feel the wish to be heard and respected that ran through the different roles.",
    },
    {
      title: "Bring the exchange back into the room",
      body: `Picture meeting these people again. Remember what it felt like when you called one of them “I.” What might you do differently now? Choose one action you could actually take, in this situation. ${scenario.action} End by wishing everyone in the scene, including yourself, some ease.`,
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    label: `Guided meditation · Step ${index + 1}`,
    source: "Adapted from Śāntideva · The Way of the Bodhisattva · 8.140–158",
    sloganNumber: 0,
    specific: false,
    kind: "",
    link: "",
  }));
}
