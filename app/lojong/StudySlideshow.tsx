"use client";

import { useEffect, useRef, useState } from "react";
import { sloganAttribution, points, sloganStudySlides, verses } from "@/lib/lojong/curriculum";
import { rootNotes } from "@/lib/lojong/practice";
import { playSinkInMainChimeFromGesture, playSinkInMainChimeHtml } from "@/lib/sinkin/sinkin-chime-html";
import { PracticeChecklist } from "./PracticeChecklist";
import styles from "./lojong.module.css";

type Deck = "slogans" | "points" | "verses" | "commitments" | "guidelines";
const deckNames: Record<Deck, string> = { slogans: "61 slogans", points: "Seven Points overview", verses: "Eight Verses study summaries", commitments: "Commitments", guidelines: "Guidelines" };

export function StudySlideshow({ active }: { active: boolean }) {
  const [deck, setDeck] = useState<Deck>("slogans");
  const [point, setPoint] = useState(0);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [remaining, setRemaining] = useState(30);
  const [sound, setSound] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const isSloganDeck = deck === "slogans" || deck === "commitments" || deck === "guidelines";
  const selectedPoint = deck === "commitments" ? 6 : deck === "guidelines" ? 7 : point;
  const slides = isSloganDeck ? sloganStudySlides.filter(s => !selectedPoint || s.point === selectedPoint).map(s => ({ label: `Point ${s.point} · ${points[s.point - 1].title} · slogan ${s.displayNumber}`, title: s.text, body: rootNotes.find(note => note.number === s.number)?.explanation ?? points[s.point - 1].summary, source: sloganAttribution(s.displayNumber), sloganNumber: s.number, specific: rootNotes.some(note => s.sourceNumbers.includes(note.number)), kind: "Explanations are study summaries.", link: "" }))
    : deck === "points" ? points.map((p, i) => ({ label: `Point ${i + 1} of 7`, title: p.title, body: p.summary, source: "7 Point Mind Training · Chekawa Yeshe Dorje", sloganNumber: 0, specific: false, kind: "Study summary.", link: "" }))
    : verses.map(v => ({ label: `Verse ${v.number} of 8`, title: v.title, body: v.summary, source: "Langri Thangpa · Eight Verses for Training the Mind", sloganNumber: 0, specific: false, kind: "Study summary · use the link for the verse and commentary.", link: v.url }));
  useEffect(() => {
    const element = dialog.current;
    if (focusMode && active) { if (!element?.open) element?.showModal(); }
    else if (element?.open) element.close();
  }, [focusMode, active]);
  function leaveReading() { setPlaying(false); setFocusMode(false); }
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
      if (sound) void playSinkInMainChimeHtml(528).catch(() => {});
      if (index === count - 1) { setPlaying(false); setFinished(true); }
      else { setIndex(index + 1); setRemaining(seconds); }
    }, 250);
    return () => window.clearInterval(timer);
    // Keep one deadline per slide; countdown updates do not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, playing, finished, index, count, seconds, sound]);
  function reset() { setIndex(0); setRemaining(seconds); setPlaying(false); setFinished(false); }
  function move(next: number) { if (sound) playSinkInMainChimeFromGesture(528); setIndex(next); setRemaining(seconds); setFinished(false); requestAnimationFrame(() => heading.current?.focus()); }
  function togglePlayback() {
    if (!playing && sound) playSinkInMainChimeFromGesture(528);
    if (finished) { setIndex(0); setRemaining(seconds); setFinished(false); }
    setPlaying(value => !value);
  }
  function toggleSound() { if (!sound) playSinkInMainChimeFromGesture(528); setSound(value => !value); }
  return <section className={styles.practice} aria-label="Timed Lojong study slideshow">
    <h2>Slideshow</h2>
    <fieldset className={styles.subnav}><legend className={styles.srOnly}>Choose a slideshow</legend>{(Object.keys(deckNames) as Deck[]).map(id => <button type="button" key={id} aria-pressed={deck === id} onClick={() => { setDeck(id); setPoint(0); reset(); }}>{deckNames[id]}</button>)}</fieldset>
    <div className={styles.filters}>
      {deck === "slogans" ? <label>Choose instructions<select value={point} onChange={event => { setPoint(Number(event.target.value)); reset(); }}><option value={0}>All Seven Points · 61 slogans</option>{points.map((p, i) => <option value={i + 1} key={p.id}>Point {i + 1} · {p.title}</option>)}</select></label> : null}
      <label>Time per slide<select value={seconds} onChange={event => { const value = Number(event.target.value); setSeconds(value); setRemaining(value); }}>{[10, 20, 30, 60].map(value => <option key={value} value={value}>{value} seconds</option>)}</select></label>
    </div>
    <div className={styles.meditationSettings}><label><input type="checkbox" checked={sound} onChange={toggleSound} /> Sound</label></div>
    <div className={styles.meditation}>
      <div className={styles.quizMeta}><span>{index + 1} of {count}</span><span role="timer" aria-label="Slide time remaining">{remaining}s</span></div>
      <p className={styles.eyebrow}>{current.label}</p>
      <h3 ref={heading} tabIndex={-1} className={styles.slideTitle}>{isSloganDeck ? `“${current.title}”` : current.title}</h3>
      {!isSloganDeck ? <p>{current.body}</p> : <details className={styles.learnMore} key={`${deck}-${point}-${index}`}><summary>Meaning and context</summary><p>{current.body}</p></details>}
      <p className={styles.small}>{current.source}</p><p className={styles.small}>{current.kind}</p>
      {current.link ? <p><a href={current.link} target="_blank" rel="noreferrer">Read verse and commentary</a></p> : null}
      <div className={styles.inlineActions}>
        <button type="button" className={styles.primary} onClick={() => { togglePlayback(); setFocusMode(true); }}>{finished ? "Play again" : playing ? "Pause slideshow" : "Play slideshow"}</button>
        <button type="button" className={styles.textButton} disabled={index === 0} onClick={() => move(index - 1)}>Previous slide</button>
        <button type="button" className={styles.textButton} disabled={index === count - 1} onClick={() => move(index + 1)}>Next slide</button>
      </div>
      <p role="status" className={styles.small}>{finished ? "Deck complete" : playing && active ? "Playing" : "Paused"}</p>
    </div>
    <dialog ref={dialog} className={styles.readingView} aria-label="Lojong slideshow reading view" onCancel={leaveReading} onClose={leaveReading}>
      <div className={styles.readingTop}><span>{index + 1} / {count}</span><span role="timer" aria-label="Reading time remaining">{remaining}s</span><button type="button" aria-label={sound ? "Mute slideshow sound" : "Enable slideshow sound"} onClick={toggleSound}>{sound ? "Sound on" : "Sound off"}</button><button type="button" onClick={leaveReading}>Exit</button></div>
      <div className={styles.readingContent}>
        <p className={styles.readingLabel}>{isSloganDeck ? current.label.replace(/ · .* · slogan /, " · Slogan ") : `${current.label} · study summary`}</p>
        <h2>{isSloganDeck ? `“${current.title}”` : current.title}</h2>
        {!isSloganDeck ? <p className={styles.readingBody}>{current.body}</p> : null}
        {isSloganDeck ? <details className={styles.readingMeaning} key={`meaning-${deck}-${point}-${index}`} onToggle={event => { if (event.currentTarget.open) setPlaying(false); }}>
          <summary>Meaning</summary>
          <p>{current.body}</p>
          <p className={styles.readingMeaningNote}>{current.specific ? "Study explanation." : "Point overview · study summary."}</p>
          <PracticeChecklist key={current.sloganNumber} slogan={current.sloganNumber} />
        </details> : null}
        <p className={styles.readingCredit}>{deck === "points" ? "7 Point Mind Training · Chekawa Yeshe Dorje" : current.source}</p>
      </div>
      <div className={styles.readingControls}>
        <button type="button" disabled={index === 0} onClick={() => move(index - 1)}>Previous</button>
        <button type="button" onClick={togglePlayback}>{finished ? "Play again" : playing ? "Pause" : "Resume"}</button>
        <button type="button" disabled={index === count - 1} onClick={() => move(index + 1)}>Next</button>
      </div>
      {finished ? <p role="status" className={styles.readingEnd}>Deck complete</p> : null}
    </dialog>
  </section>;
}
