"use client";

import { useEffect, useRef, useState } from "react";
import { jinpaCourseUrl, sloganAttribution, points, slogans, verses } from "@/lib/lojong/curriculum";
import { rootNotes } from "@/lib/lojong/practice";
import styles from "./lojong.module.css";

type Deck = "slogans" | "points" | "verses";
const deckNames: Record<Deck, string> = { slogans: "61 slogans", points: "Seven Points overview", verses: "Eight Verses study summaries" };

export function StudySlideshow({ active }: { active: boolean }) {
  const [deck, setDeck] = useState<Deck>("slogans");
  const [point, setPoint] = useState(0);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [remaining, setRemaining] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const slides = deck === "slogans" ? slogans.filter(s => !point || s.point === point).map(s => ({ label: `Point ${s.point} · ${points[s.point - 1].title} · slogan ${s.number}`, title: s.text, body: rootNotes.find(note => note.number === s.number)?.explanation ?? points[s.point - 1].summary, source: sloganAttribution(s.number), kind: "Wording and numbering follow T. Jinpa’s course handouts. The explanation is a study paraphrase; where no specific explanation is supplied, it gives the surrounding Point’s context.", link: "" }))
    : deck === "points" ? points.map((p, i) => ({ label: `Point ${i + 1} of 7`, title: p.title, body: p.summary, source: p.source, kind: "Point title and overview are study summaries, not a quotation of the root text.", link: "" }))
    : verses.map(v => ({ label: `Verse ${v.number} of 8`, title: v.title, body: v.summary, source: "Langri Thangpa · Eight Verses for Training the Mind", kind: "Original study summary, not the verse text or a translation. Read the original alongside its commentary.", link: v.url }));
  const current = slides[index];
  const count = slides.length;
  useEffect(() => {
    if (!active || !playing || finished) return;
    const deadline = Date.now() + remaining * 1000;
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next > 0) return;
      window.clearInterval(timer);
      if (index === count - 1) { setPlaying(false); setFinished(true); }
      else { setIndex(index + 1); setRemaining(seconds); }
    }, 250);
    return () => window.clearInterval(timer);
    // Keep one deadline per slide; countdown updates do not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, playing, finished, index, count, seconds]);
  function reset() { setIndex(0); setRemaining(seconds); setPlaying(false); setFinished(false); }
  function move(next: number) { setIndex(next); setRemaining(seconds); setFinished(false); requestAnimationFrame(() => heading.current?.focus()); }
  return <section className={styles.practice} aria-label="Timed Lojong study slideshow">
    <h2>Let the instructions become familiar.</h2>
    <p className={styles.formHelp}>Read, pause, and reflect. Familiarity supports practice; remembering the words is not the same as embodying them.</p>
    <fieldset className={styles.subnav}><legend className={styles.srOnly}>Choose a slideshow</legend>{(Object.keys(deckNames) as Deck[]).map(id => <button type="button" key={id} aria-pressed={deck === id} onClick={() => { setDeck(id); setPoint(0); reset(); }}>{deckNames[id]}</button>)}</fieldset>
    <div className={styles.filters}>
      {deck === "slogans" ? <label>Choose instructions<select value={point} onChange={event => { setPoint(Number(event.target.value)); reset(); }}><option value={0}>All Seven Points · 61 slogans</option>{points.map((p, i) => <option value={i + 1} key={p.id}>Point {i + 1} · {p.title}</option>)}</select></label> : null}
      <label>Time per slide<select value={seconds} onChange={event => { const value = Number(event.target.value); setSeconds(value); setRemaining(value); }}>{[10, 20, 30, 60].map(value => <option key={value} value={value}>{value} seconds</option>)}</select></label>
    </div>
    <div className={styles.meditation}>
      <div className={styles.quizMeta}><span>{index + 1} of {count}</span><span role="timer" aria-label="Slide time remaining">{remaining}s</span></div>
      <p className={styles.eyebrow}>{current.label}</p>
      <h3 ref={heading} tabIndex={-1} className={styles.slideTitle}>{deck === "slogans" ? `“${current.title}”` : current.title}</h3>
      {deck !== "slogans" ? <p>{current.body}</p> : <details className={styles.learnMore} key={`${deck}-${point}-${index}`}><summary>Meaning and context</summary><p>{current.body}</p><p className={styles.small}>Pause the slideshow to stay with this explanation.</p></details>}
      <p className={styles.small}>{current.source}</p><p className={styles.courseCredit}><a href={jinpaCourseUrl} target="_blank" rel="noreferrer">Course edition · T. Jinpa · Wisdom Academy</a></p><p className={styles.small}>{current.kind}</p>
      {current.link ? <p><a href={current.link} target="_blank" rel="noreferrer">Read verse and commentary</a></p> : null}
      <div className={styles.inlineActions}>
        <button type="button" className={styles.primary} onClick={() => { if (finished) { setIndex(0); setRemaining(seconds); setFinished(false); } setPlaying(value => !value); }}>{finished ? "Play again" : playing ? "Pause slideshow" : "Play slideshow"}</button>
        <button type="button" className={styles.textButton} disabled={index === 0} onClick={() => move(index - 1)}>Previous slide</button>
        <button type="button" className={styles.textButton} disabled={index === count - 1} onClick={() => move(index + 1)}>Next slide</button>
      </div>
      <p role="status" className={styles.small}>{finished ? "Deck complete. Take one instruction into your day." : playing && active ? "Advancing automatically. Pause whenever you want to reflect." : "Paused · move at your own pace."}</p>
    </div>
  </section>;
}
