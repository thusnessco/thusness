-- Seed editable TipTap note for /orientation.
-- Public route reads note slug "orientation".

insert into public.notes (
  slug,
  title,
  excerpt,
  content_json,
  published,
  published_at,
  category
)
values (
  'orientation',
  'Inner Peace and Beyond',
  'A description of what tends to unfold',
  $json${
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Inner Peace and Beyond" }]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "marks": [{ "type": "italic" }], "text": "A description of what tends to unfold" }
        ]
      },
      {
        "type": "blockquote",
        "content": [
          {
            "type": "paragraph",
            "content": [
              { "type": "text", "text": "This page describes what tends to unfold in this practice. It is not a set of practice instructions. If you want to actually engage with the work, come to one of the free meetings linked from the " },
              { "type": "text", "text": "home page", "marks": [{ "type": "link", "attrs": { "href": "/" } }] },
              { "type": "text", "text": "." }
            ]
          }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Recognition" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Recognizing is simply training attention toward an aspect, dimension, or layer of experience we might not normally attend to. This isn't a claim about an inherent layer underneath the senses; it's just a pointer." }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "That aspect typically has qualities of peace, equanimity, ease, or \"okayness.\" Note that it is not a sensation or a thought. Some describe it as an underlying sense, foundational, like a background peace that's always there despite what is noticed in the senses. Imagine if all lived resistance was removed: what would remain? Would it be okay? Peaceful? Easy? Equanimous? This is distinct from felt peace in the body or mind, though felt peace may follow from tuning into it, and the sense itself may be more accessible when felt peace is already present. Finding this is what we call Recognition." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Perpetuation and Integration" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "As we pay more attention to the sense and notice any appreciation around it, it becomes more prominent. Noticing and expressing its details helps further. It gradually moves forward into experience, becoming more readily accessible. It slowly pervades experience; many describe it as the lens through which all is viewed. Finally, it integrates with experience completely." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Stages of Peace" }] },
      {
        "type": "orderedList",
        "attrs": { "start": 1 },
        "content": [
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Recognition (Background)" }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Perpetuation (Foreground)" }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Integration (Pervasion)" }] }] }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Background Peace, Felt Peace, and the Nervous System" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "It's worth distinguishing two aspects of peace here. The first is the background sense described above: not a sensation, not a thought, but an underlying okayness that recognition points to. The second is felt peace: relaxation, ease, calm, or similar qualities in the body and mind." }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "They aren't the same, but they interact through the nervous system. Recognizing the background sense tends to lower nervous system activation over time. As the nervous system relaxes, felt peace becomes more available in the body and mind. And as felt peace grows, the background sense becomes easier to recognize and rest in. The two reinforce each other." }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "This distinction matters in practice. Felt qualities come and go with sleep, health, stress, and circumstance. The background sense, in this model, remains available regardless. Conflating the two can make someone think they've \"lost\" recognition just because the body or mind is having a hard day. As recognition deepens, both foundational and felt equanimity become less dependent on circumstances. This can clear the way and accelerate a deeper recognition of the nature of self and various perspectives of reality." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Movement and Progression" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Once peace has been recognized and stabilized to some depth, a subtle movement of attention, a shift in \"center of gravity,\" tends to initiate a progression of unfoldment." }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "This usually begins with deconstruction of experience over weeks, months, or years, followed by reconstruction, then a stage of fluidity and synthesis. Stages unfold differently for everyone, but some landmarks are common to many. These may align with stages of spiritual development described in other traditions. Noticing details and changes over time, and externalizing them via inquiry methods, helps provide context and deepens the felt understanding of what is happening." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Common Stages of Progression" }] },
      {
        "type": "orderedList",
        "attrs": { "start": 1 },
        "content": [
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Deconstruction" }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Reconstruction" }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Fluidity and Synthesis" }] }] }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Themes" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Various themes may present themselves throughout the journey: the nature of thought and mind (psyche), time, identity, emptiness, energy, infinity, existence, among others. There can be moments of contrast or plainness. Pleasantness and darkness. Blowout spiritual experiences, or fine subtlety, and everything in between. Some patterns may recur, but no two pathways are identical. These themes are vast in scope, but most generally they offer new perspectives on identity, the world, and experience." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Pillars of Success" }] },
      {
        "type": "orderedList",
        "attrs": { "start": 1 },
        "content": [
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Effortlessness" }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Appreciation" }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Openness / Curiosity" }] }] }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Opening to effortlessness reduces the noise that can seem like a blocker to peace. Appreciation and gratitude let any experience perpetuate and grow more rapidly and deeply; opening to appreciation, or noticing it in experience, also acts as an antidote to resistance or challenges that arise. Openness and curiosity are essential to recognition, perpetuation, and integration. To notice things we may not have normally experienced, we invite curiosity and openness rather than certainty or a closed-off stance. Each of these can be explored in depth on its own, with far-reaching positive effects." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "The Nihilism Trap and the Dependent View" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "One essential viewpoint helps avoid common traps in this process. First, the problem. The most significant trap on the journey is nihilism or non-existence: a self-sealing argument that there is no one experiencing anything, nothing to experience, and so on. It tends to appear when deconstruction begins, blended with overreach of the mind. For example: no inherent thing can be found in experience, and the mind jumps to \"therefore nothing exists.\" This can be an incredible relief from previous burdens. The system, enjoying its comfort, may then latch onto this belief and experience and root into it. It will defend its new position at all costs, fearing a return to its previous state of suffering. It is the ultimate disassociation." }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "To avoid this, a hygienic view of emptiness can be explored preemptively, through mind and logic. This brings clarity as the felt experience of emptiness begins to transpire. The view is simple: no inherent thing can be found, yet that is precisely how everything may appear and exist. The mode of existence is crucial: things do not exist inherently or separately, but dependently. So there is no inherent thing to be found, but many dependent things exist and function perfectly well. Conventionally, this is how we speak and think about reality. Emptiness is only possible because things exist dependently. Dependence is emptiness; it simply means there is nothing inherent, standing in and of itself. Understanding this completely thwarts the nihilistic trap if a deeply felt experience of emptiness eventually arises." }
        ]
      },
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Lineage and attribution" }] },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "This page articulates a practice I've worked with through training in The Deepening Protocol and through study of The Deepening Framework by Rastal, licensed under " },
          { "type": "text", "text": "CC-BY 4.0", "marks": [{ "type": "link", "attrs": { "href": "https://creativecommons.org/licenses/by/4.0/" } }] },
          { "type": "text", "text": ". This is an adaptation: terminology, structure, and framing here are my own and don't represent the source materials directly. The differences reflect how the practice has settled in my own experience." }
        ]
      }
    ]
  }$json$::jsonb,
  true,
  now(),
  'long_posts'
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  published = excluded.published,
  category = excluded.category,
  updated_at = now();
