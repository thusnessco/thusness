/**
 * Reads design_handoff_thusness/resistance-handoff/content/resistance.json
 * and prints a Supabase migration SQL snippet that upserts the resistance note
 * as a published template (hidden from /notes index, visible at /notes/working-with-resistance).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(
  root,
  "design_handoff_thusness/resistance-handoff/content/resistance.json"
);

const src = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

function stripAvoidMarkup(s) {
  return String(s).replace(/\[avoid\]/g, "").replace(/\[\/avoid\]/g, "");
}

function tx(s) {
  return { type: "text", text: s };
}
function it(s) {
  return { type: "text", text: s, marks: [{ type: "italic" }] };
}
function bold(s) {
  return { type: "text", text: s, marks: [{ type: "bold" }] };
}
function para(...content) {
  return { type: "paragraph", content: content.filter(Boolean) };
}
function sectionMarkLine(label) {
  return {
    type: "thusnessSectionMark",
    content: [para(tx(label))],
  };
}
function pullBlock(...paragraphs) {
  return {
    type: "thusnessPullQuote",
    content: paragraphs.map((p) =>
      typeof p === "string" ? para(tx(p)) : p
    ),
  };
}
function ruleList(header, items) {
  return {
    type: "thusnessRuleList",
    content: [
      para(tx(header)),
      ...items.map((body) => ({
        type: "thusnessRuleListItem",
        content: [para(tx(body))],
      })),
    ],
  };
}
function h2(s) {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [tx(s)],
  };
}
function h3(s) {
  return {
    type: "heading",
    attrs: { level: 3 },
    content: [tx(s)],
  };
}
function bq(line) {
  return {
    type: "blockquote",
    content: [para(it(line))],
  };
}

/** Split "a *b* c" into text nodes with italic marks — simple single * pairs. */
function paraWithLightMarkdown(s) {
  const parts = String(s).split("*");
  const content = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    if (i % 2 === 0) content.push(tx(parts[i]));
    else content.push(it(parts[i]));
  }
  return para(...content);
}

const doc = {
  type: "doc",
  content: [
    {
      type: "thusnessHero",
      content: [
        para(tx(`${src.eyebrow} · ${src.datelineSecond}`)),
        para(it(src.kicker)),
      ],
    },
    h2(src.title),
    para(it(src.sub)),
    sectionMarkLine(src.premise.label),
    ...src.premise.paragraphs.map((s) => paraWithLightMarkdown(s)),
    pullBlock(src.premise.pull),
    sectionMarkLine(src.coreScript.label),
    para(it(src.coreScript.text)),
    sectionMarkLine(src.strategiesLabel),
    ...src.strategies.flatMap((st) => {
      const head = `${st.num} · ${st.name}`;
      return [
        h3(head),
        para(bold("When "), tx(st.when)),
        para(bold("Script ")),
        bq(st.script),
        para(bold("Why ")),
        para(tx(st.why)),
      ];
    }),
    ruleList(
      src.rules.label,
      src.rules.rows.map((r) => stripAvoidMarkup(`${r.label} ${r.body}`))
    ),
    sectionMarkLine(src.decisionTree.label),
    ...src.decisionTree.steps.map((step) =>
      para(
        tx(`${step.q} `),
        bold("→ "),
        tx(`${step.yes} `),
        it(`(${step.tag})`)
      )
    ),
    sectionMarkLine(src.pair.label),
    para(
      bold(src.pair.left.label + " "),
      it(src.pair.left.word),
      tx(" · "),
      it(src.pair.left.sub)
    ),
    para(
      bold(src.pair.right.label + " "),
      it(src.pair.right.word),
      tx(" · "),
      it(src.pair.right.sub)
    ),
    pullBlock(src.pair.invitation),
  ],
};

const slug = "working-with-resistance";
const title = src.title.replace(/\.$/, "") || "Working with resistance";
const excerpt = `${src.eyebrow} — ${src.datelineSecond}`;

const jsonStr = JSON.stringify(doc);
fs.writeFileSync(
  path.join(root, "lib/notes/resistance-seed-doc.json"),
  `${JSON.stringify(doc, null, 2)}\n`,
  "utf8"
);

/** PostgreSQL dollar-quoted string: $tag$body$tag$ */
const dq = (tag, body) => `$${tag}$${body}$${tag}$`;

const sql = `-- Resistance field guide as a TipTap note (published + template = unlisted on /notes, direct link only).
-- Edit body in Admin like any other note. Public URL: /notes/working-with-resistance

insert into public.notes (slug, title, excerpt, content_json, published, published_at, is_template)
values (
  '${slug}',
  ${dq("TITLE", title)},
  ${dq("EXCERPT", excerpt)},
  ${dq("DOCJSON", jsonStr)}::jsonb,
  true,
  now(),
  true
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  published = excluded.published,
  is_template = excluded.is_template,
  updated_at = now();
`;

process.stdout.write(sql);
