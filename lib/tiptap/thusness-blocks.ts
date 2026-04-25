import { mergeAttributes, Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";

const sectionMark = "thusnessSectionMark";
const hero = "thusnessHero";
const pullQuote = "thusnessPullQuote";
const ruleList = "thusnessRuleList";
const ruleListItem = "thusnessRuleListItem";
const pillar = "thusnessPillar";
const sessionGrid = "thusnessSessionGrid";
const sessionCard = "thusnessSessionCard";
const zoomBlock = "thusnessZoomBlock";

function text(s: string): JSONContent {
  return { type: "text", text: s };
}

function para(...content: JSONContent[]): JSONContent {
  return { type: "paragraph", content: content.length ? content : undefined };
}

export const ThusnessSectionMark = Node.create({
  name: sectionMark,
  group: "block",
  content: "paragraph",
  defining: true,
  parseHTML() {
    return [
      {
        tag: `div[data-thusness-node="${sectionMark}"]`,
        contentElement: "p",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const hair: [string, Record<string, string>] = [
      "span",
      {
        class: "tiptap-thusness-section-mark__hair",
        "aria-hidden": "true",
      },
    ];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": sectionMark,
        class: "tiptap-thusness-section-mark",
      }),
      hair,
      0,
      hair,
    ];
  },
});

export const ThusnessHero = Node.create({
  name: hero,
  group: "block",
  content: "paragraph paragraph",
  defining: true,
  parseHTML() {
    return [{ tag: `section[data-thusness-node="${hero}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": hero,
        class: "tiptap-thusness-hero",
      }),
      0,
    ];
  },
});

export const ThusnessPullQuote = Node.create({
  name: pullQuote,
  group: "block",
  content: "paragraph+",
  defining: true,
  parseHTML() {
    return [{ tag: `aside[data-thusness-node="${pullQuote}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": pullQuote,
        class: "tiptap-thusness-pull-quote",
        role: "note",
      }),
      0,
    ];
  },
});

export const ThusnessRuleListItem = Node.create({
  name: ruleListItem,
  group: "block",
  content: "paragraph",
  defining: true,
  parseHTML() {
    return [{ tag: `div[data-thusness-node="${ruleListItem}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": ruleListItem,
        class: "tiptap-thusness-rule-list-item",
      }),
      0,
    ];
  },
});

export const ThusnessRuleList = Node.create({
  name: ruleList,
  group: "block",
  content: "paragraph thusnessRuleListItem+",
  defining: true,
  parseHTML() {
    return [{ tag: `div[data-thusness-node="${ruleList}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": ruleList,
        class: "tiptap-thusness-rule-list",
      }),
      0,
    ];
  },
});

export const ThusnessPillar = Node.create({
  name: pillar,
  group: "block",
  content: "paragraph",
  defining: true,
  parseHTML() {
    return [
      {
        tag: `div[data-thusness-node="${pillar}"]`,
        contentElement: ".tiptap-thusness-pillar__body",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": pillar,
        class: "tiptap-thusness-pillar",
      }),
      [
        "p",
        { class: "tiptap-thusness-pillar__tilde", "aria-hidden": "true" },
        "~",
      ],
      [
        "p",
        { class: "tiptap-thusness-pillar__label" },
        "Pillar of Success",
      ],
      ["div", { class: "tiptap-thusness-pillar__body" }, 0],
    ];
  },
});

export const ThusnessSessionCard = Node.create({
  name: sessionCard,
  group: "block",
  content: "paragraph paragraph paragraph paragraph",
  defining: true,
  parseHTML() {
    return [{ tag: `div[data-thusness-node="${sessionCard}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": sessionCard,
        class: "tiptap-thusness-session-card",
      }),
      0,
    ];
  },
});

export const ThusnessSessionGrid = Node.create({
  name: sessionGrid,
  group: "block",
  content: "thusnessSessionCard thusnessSessionCard",
  defining: true,
  parseHTML() {
    return [{ tag: `div[data-thusness-node="${sessionGrid}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": sessionGrid,
        class: "tiptap-thusness-session-grid",
      }),
      0,
    ];
  },
});

export const ThusnessZoomBlock = Node.create({
  name: zoomBlock,
  group: "block",
  content: "paragraph+",
  defining: true,
  parseHTML() {
    return [{ tag: `div[data-thusness-node="${zoomBlock}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": zoomBlock,
        class: "tiptap-thusness-zoom-block",
      }),
      0,
    ];
  },
});

export function thusnessBlockExtensions() {
  return [
    ThusnessSectionMark,
    ThusnessHero,
    ThusnessPullQuote,
    ThusnessRuleList,
    ThusnessRuleListItem,
    ThusnessPillar,
    ThusnessSessionCard,
    ThusnessSessionGrid,
    ThusnessZoomBlock,
  ];
}

export function makeThusnessSessionCard(
  kicker: string,
  day: string,
  time: string,
  zone: string
): JSONContent {
  return {
    type: sessionCard,
    content: [
      para(text(kicker)),
      para(text(day)),
      para(text(time)),
      para(text(zone)),
    ],
  };
}

export type ThusnessSnippetKey =
  | "hero"
  | "sectionMark"
  | "pullQuote"
  | "ruleList"
  | "pillar"
  | "sessionGrid"
  | "zoomBlock";

export const THUSNESS_SNIPPET_OPTIONS: { key: ThusnessSnippetKey; label: string }[] =
  [
    { key: "hero", label: "Hero (question + subtitle)" },
    { key: "sectionMark", label: "Section mark (~ · ·)" },
    { key: "pullQuote", label: "Pull quote (ruled)" },
    { key: "ruleList", label: "Ruled numbered list" },
    { key: "pillar", label: "Pillar of Success" },
    { key: "sessionGrid", label: "Session tabs (2 cards)" },
    { key: "zoomBlock", label: "Zoom link row" },
  ];

export function getThusnessSnippetFragment(
  key: ThusnessSnippetKey
): JSONContent {
  switch (key) {
    case "hero":
      return {
        type: hero,
        content: [
          para(text("Your question here?")),
          para(text("— a question to sit with —")),
        ],
      };
    case "sectionMark":
      return {
        type: sectionMark,
        content: [para(text("~ Theme · Title"))],
      };
    case "pullQuote":
      return {
        type: pullQuote,
        content: [
          para(
            text(
              "A centered pull quote with hairline borders above and below."
            )
          ),
        ],
      };
    case "ruleList":
      return {
        type: ruleList,
        content: [
          para(text("~ Benefits & Goals")),
          {
            type: ruleListItem,
            content: [para(text("First row"))],
          },
          {
            type: ruleListItem,
            content: [para(text("Second row"))],
          },
        ],
      };
    case "pillar":
      return {
        type: pillar,
        content: [para(text("Your pillar line."))],
      };
    case "sessionGrid":
      return {
        type: sessionGrid,
        content: [
          makeThusnessSessionCard(
            "~ I",
            "Wednesday",
            "09:00 — 10:00",
            "Pacific Time"
          ),
          makeThusnessSessionCard(
            "~ II",
            "Friday",
            "09:00 — 10:00",
            "Pacific Time"
          ),
        ],
      };
    case "zoomBlock":
      return {
        type: zoomBlock,
        content: [
          para(text("https://zoom.us/j/97461285343")),
          para(text("All are welcome.")),
        ],
      };
  }
}

/** Full homepage-style stack matching the design-handoff sample (editable in place). */
export function getPageLayoutSampleDoc(): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: hero,
        content: [
          para(
            text(
              "Is any effort necessary for experience to be?"
            )
          ),
          para(text("— a question to sit with —")),
        ],
      },
      {
        type: sectionMark,
        content: [
          para(text("~ Theme · Noticing Effort")),
        ],
      },
      para(
        text(
          "Previously we explored resistance — a sense of no regarding what's happening. Effort is a little more subtle, and might show up as a sense that something needs to be done."
        )
      ),
      {
        type: pullQuote,
        content: [
          para(
            text(
              "What happens as we become more curious and aware of effort in each moment?"
            )
          ),
        ],
      },
      {
        type: ruleList,
        content: [
          para(text("~ Benefits & Goals")),
          {
            type: ruleListItem,
            content: [
              para(text("Practice noticing experience as it is")),
            ],
          },
          {
            type: ruleListItem,
            content: [
              para(text("Increase sensitivity to the details of effort")),
            ],
          },
          {
            type: ruleListItem,
            content: [
              para(text("Effort becomes more visible and optional")),
            ],
          },
        ],
      },
      {
        type: ruleList,
        content: [
          para(text("~ Itinerary")),
          {
            type: ruleListItem,
            content: [para(text("Notice where attention goes"))],
          },
          {
            type: ruleListItem,
            content: [para(text("Noticing gentle curiosity"))],
          },
          {
            type: ruleListItem,
            content: [
              para(text("Introductory exploration of effort")),
            ],
          },
          {
            type: ruleListItem,
            content: [
              para(
                text(
                  "Notice any aspects of experience and how effort might relate"
                )
              ),
            ],
          },
          {
            type: ruleListItem,
            content: [para(text("Integration exercise"))],
          },
          {
            type: ruleListItem,
            content: [para(text("Home integration instructions"))],
          },
          {
            type: ruleListItem,
            content: [para(text("Group sharing"))],
          },
        ],
      },
      {
        type: pillar,
        content: [para(text("Gentle curiosity."))],
      },
      {
        type: sectionMark,
        content: [para(text("~ Sit together"))],
      },
      para(
        text(
          "A quiet hour of guided noticing, with space for sharing. Held on Zoom."
        )
      ),
      {
        type: sessionGrid,
        content: [
          makeThusnessSessionCard(
            "~ I",
            "Wednesday",
            "09:00 — 10:00",
            "Pacific Time"
          ),
          makeThusnessSessionCard(
            "~ II",
            "Friday",
            "09:00 — 10:00",
            "Pacific Time"
          ),
        ],
      },
      {
        type: zoomBlock,
        content: [
          para(text("https://zoom.us/j/97461285343")),
          para(text("All are welcome.")),
        ],
      },
    ],
  };
}
