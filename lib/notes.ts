export type Note = {
  title: string;
  slug: string;
  /** ISO date `YYYY-MM-DD` (used for sorting and display) */
  date: string;
  /** One line for the index list; optional */
  excerpt?: string;
  /** Body copy; paragraphs separated by a blank line (`\n\n`) */
  content: string;
};

export const notes: Note[] = [
  {
    title: "Effortlessness and control",
    slug: "effortlessness-and-control",
    date: "2026-03-18",
    excerpt:
      "When trying drops away, something quieter can take the lead—without collapsing into passivity.",
    content: `There is a familiar oscillation: either I am steering hard, or I have given up and gone slack. Neither quite fits what we touched on today.

What if control and effortlessness are not opposites in the way the mind assumes? What if “doing” can lighten without the whole scene falling apart?

We stayed with small moments—typing, walking, listening—where the grip shows itself first. Not to fix the grip, only to see its temperature and texture. From there, the same action sometimes continues with less commentary, as though the body already knew how.

Nothing to prove here. Just a record: the day leaned toward less forcing, and the world did not end.`,
  },
  {
    title: "Noticing resistance",
    slug: "noticing-resistance",
    date: "2026-02-04",
    excerpt:
      "Resistance appeared as tightening, skipping, and a low story about how this should already be different.",
    content: `Resistance rarely arrives with a label. Today it came as a slight narrowing behind the eyes, a reluctance to stay with one more breath, and a quiet argument that something else deserved attention.

We did not negotiate with it as an enemy. We let it be named in a plain way—tension, avoidance, the small “no”—and watched how it behaved when it was not chased.

What stood out was how quickly resistance softens when it is allowed to exist without being turned into a project. Not always. Not forever. But often enough to be worth remembering.

This note is a bookmark for that ordinary afternoon when the floor felt steadier after the noticing widened, even a little.`,
  },
  {
    title: "As it is",
    slug: "as-it-is",
    date: "2026-01-12",
    excerpt:
      "Starting where things are—not as resignation, but as an honest coordinate for inquiry.",
    content: `We began where we always begin, which is here: sound in the room, weight in the chair, the hum of thinking doing what thinking does.

“As it is” is easy to repeat and hard to mean. Today it meant pausing the habit of gently bullying experience into a better shape before looking.

What showed up was not dramatic. Colors a little clearer. Silence with more room in it. A sense that the narrative could arrive a half-step later and nothing would be lost.

If someone reads this later and wonders what happened in the session, the honest answer is: not much, in the best sense. A few minutes of not lying to oneself about what was already present.`,
  },
];

export function getNotesChronological(): Note[] {
  return [...notes].sort((a, b) => b.date.localeCompare(a.date));
}

export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((n) => n.slug === slug);
}

export function getAllSlugs(): string[] {
  return notes.map((n) => n.slug);
}

export function formatNoteDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
