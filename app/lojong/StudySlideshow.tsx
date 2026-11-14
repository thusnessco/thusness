"use client";

import { useEffect, useRef, useState } from "react";
import { sloganAttribution, points, sloganStudySlides, verses } from "@/lib/lojong/curriculum";
import { rootNotes } from "@/lib/lojong/practice";
import { playSinkInMainChimeFromGesture, playSinkInMainChimeHtml } from "@/lib/sinkin/sinkin-chime-html";
import { exchangeScenarios, exchangeSource, getExchangeSlides } from "./exchange-meditation";
import { futureSelfSlides, immeasurablesSlides, practicePhrasesSlides, threePoisonsSlides } from "./immeasurables-meditation";
import { TonglenMeditation } from "./TonglenMeditation";
import { PracticeChecklist } from "./PracticeChecklist";
import styles from "./lojong.module.css";

type Deck = "slogans" | "points" | "verses" | "commitments" | "guidelines" | "exchange" | "immeasurables" | "three-poisons" | "practice-phrases" | "future-self";
const deckNames: Record<Deck, string> = { slogans: "61 slogans", points: "Seven Points overview", verses: "Eight Verses study summaries", commitments: "Commitments", guidelines: "Precepts / Guidelines", exchange: "Exchanging Self and Others", immeasurables: "Four Immeasurables", "three-poisons": "Working with the Three Poisons", "practice-phrases": "Training with Practice Phrases", "future-self": "Tonglen for Your Future Self" };
const studyDecks: Deck[] = ["slogans", "points", "verses", "commitments", "guidelines"];
const conventionalDecks: Deck[] = ["exchange", "immeasurables", "three-poisons", "practice-phrases", "future-self"];
const lessonFiveSlides = {
  immeasurables: immeasurablesSlides,
  "three-poisons": threePoisonsSlides,
  "practice-phrases": practicePhrasesSlides,
  "future-self": futureSelfSlides,
};


const practiceInstructions: Partial<Record<Deck, string[]>> = {
  exchange: [
    "Choose a situation above. Keep the same scene as you imagine it from three different positions: someone with less standing in that situation, a peer, and someone with more standing.",
    "From each position, use “I” for the person whose perspective you’re taking. Look back at your usual self and notice how envy, rivalry, or pride feels from there. At the end, identify one thing you could do differently.",
  ],
  immeasurables: [
    "Start with equanimity. Give a friend, a stranger, and a mildly difficult person a few breaths of attention each. Notice how your reactions differ and remember that each person’s welfare matters.",
    "Wish someone happiness and the conditions that support it. Then wish them relief from a difficulty. Recall a piece of good fortune and take a moment to enjoy it with them. Gradually extend those wishes to the wider circle.",
  ],
  "three-poisons": [
    "Recall three ordinary moments: one you wanted to hold on to, one you wanted to push away, and one you barely noticed.",
    "Try appreciating the pleasant moment without needing it to continue, responding to irritation without adding hostility, and giving the overlooked moment fresh attention. Choose one of these responses to try during the day.",
  ],
  "practice-phrases": [
    "Choose a short wish you can mean, such as “May you have the help you need.” Bring a specific person to mind and pause after saying it silently so the wish has time to register.",
    "Pick an everyday cue that can bring the words back to mind. When it happens, say the phrase once and let the intention guide what you do next.",
  ],
  "future-self": [
    "Imagine yourself facing an ordinary difficulty in the future. Picture lifting that burden from your future self and offering them what would help. If it feels natural, use the in-breath for taking and the out-breath for giving.",
    "Over several sittings, widen the practice to a loved one, a stranger, a difficult person, and eventually all beings. Spend time at each stage.",
  ],
};

export function StudySlideshow({ active, tonglenOpen, onTonglen, onTonglenExit }: { active: boolean; tonglenOpen: boolean; onTonglen: () => void; onTonglenExit: () => void }) {
  const [deck, setDeck] = useState<Deck>("immeasurables");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showList, setShowList] = useState(false);
  const [point, setPoint] = useState(0);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [sound, setSound] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const readingHeading = useRef<HTMLHeadingElement>(null);
  const isSloganDeck = deck === "slogans" || deck === "commitments" || deck === "guidelines";
  const isMeditation = conventionalDecks.includes(deck);
  const selectedPoint = deck === "commitments" ? 6 : deck === "guidelines" ? 7 : point;
  const slides = isSloganDeck ? sloganStudySlides.filter(s => !selectedPoint || s.point === selectedPoint).map(s => ({ label: `Point ${s.point} · ${points[s.point - 1].title} · slogan ${s.displayNumber}`, title: s.text, body: rootNotes.find(note => note.number === s.number)?.explanation ?? points[s.point - 1].summary, source: sloganAttribution(s.displayNumber), sloganNumber: s.number, specific: rootNotes.some(note => s.sourceNumbers.includes(note.number)), kind: "Explanations are study summaries.", link: "" }))
    : deck === "points" ? points.map((p, i) => ({ label: `Point ${i + 1} of 7`, title: p.title, body: p.summary, source: "7 Point Mind Training · Chekawa Yeshe Dorje", sloganNumber: 0, specific: false, kind: "Study summary.", link: "" }))
    : deck === "exchange" ? getExchangeSlides(exchangeScenarios[scenarioIndex])
    : deck in lessonFiveSlides ? lessonFiveSlides[deck as keyof typeof lessonFiveSlides]
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
  function chooseDeck(id: Deck) {
    setDeck(id);
    setPoint(0);
    setShowList(false);
    reset();
    if (conventionalDecks.includes(id)) {
      setSeconds(60);
      setRemaining(60);
    }
  }
  function move(next: number) { if (sound) playSinkInMainChimeFromGesture(528); setIndex(next); setRemaining(seconds); setFinished(false); requestAnimationFrame(() => (focusMode ? readingHeading : heading).current?.focus()); }
  function togglePlayback() {
    if (!playing && sound) playSinkInMainChimeFromGesture(528);
    if (finished) { setIndex(0); setRemaining(seconds); setFinished(false); }
    setPlaying(value => !value);
  }
  function toggleSound() { if (!sound) playSinkInMainChimeFromGesture(528); setSound(value => !value); }
  return <section className={styles.practice} aria-label="Guided Lojong practices">
    <h2>Guided practices</h2>
    <fieldset className={styles.subnav}>
      <legend>Conventional Awakening Mind</legend>
      <button type="button" aria-haspopup="dialog" onClick={() => { setPlaying(false); onTonglen(); }}>Tonglen Meditation</button>
      {conventionalDecks.map(id => <button type="button" key={id} aria-pressed={deck === id} onClick={() => chooseDeck(id)}>{deckNames[id]}</button>)}
    </fieldset>
    <details className={styles.learnMore} open={!isMeditation}>
      <summary>Timed readings of the Lojong texts</summary>
      <fieldset className={styles.subnav}>
        <legend className={styles.srOnly}>Choose a timed reading</legend>
        {studyDecks.map(id => <button type="button" key={id} aria-pressed={deck === id} onClick={() => chooseDeck(id)}>{deckNames[id]}</button>)}
      </fieldset>
    </details>
    {deck === "exchange" ? <p className={styles.small}>Adapted from Śāntideva’s <cite>The Way of the Bodhisattva</cite>, chapter 8, verses 140–158. <a href={exchangeSource} target="_blank" rel="noreferrer">Read the root verses</a>.</p> : null}
    {deck === "exchange" ? <div className={styles.filters}>
      <label>Choose a situation
        <select value={scenarioIndex} onChange={event => { setScenarioIndex(Number(event.target.value)); reset(); }}>
          {exchangeScenarios.map((scenario, number) => <option key={scenario.title} value={number}>{scenario.title}</option>)}
        </select>
      </label>
      <p className={styles.small}>These everyday scenarios adapt Śāntideva’s themes of recognition, social standing, and who does the work.</p>
    </div> : null}
    {deck in lessonFiveSlides ? <p className={styles.small}>Adapted from Thupten Jinpa’s <cite>Mind Training</cite>, Lesson 5. <a href="https://wisdomexperience.org/lessons/mind-training-l5/" target="_blank" rel="noreferrer">Open Lesson 5</a>.</p> : null}
    <details key={deck} className={styles.learnMore}>
      <summary>Tonglen instructions</summary>
      <p>Bring someone facing difficulty to mind. On the in-breath, imagine taking away their suffering and see them relieved. On the out-breath, imagine offering whatever would support their well-being.</p>
      <p>Give and take at a pace that lets you picture each step clearly. You can do the visualization separately from the breath.</p>
    </details>
    {practiceInstructions[deck] && <details key={`instructions-${deck}`} className={styles.learnMore}>
      <summary>How to practice {deckNames[deck]}</summary>
      {practiceInstructions[deck].map(instruction => <p key={instruction}>{instruction}</p>)}
    </details>}
    <div className={styles.inlineActions}>
      <button type="button" className={styles.textButton} aria-expanded={showList} aria-controls="study-full-list" onClick={() => { setPlaying(false); setShowList(value => !value); }}>{showList ? "Back to slideshow" : "Full list"}</button>
    </div>
    {showList ? <div id="study-full-list" className={styles.studyFullList}>
      <h3>{deck === "commitments" ? "16 commitments" : deck === "guidelines" ? "22 precepts" : deckNames[deck]}</h3>
      {deck === "commitments" ? <p className={styles.small}>Refrain from conduct that contradicts the spirit of mind training.</p> : deck === "guidelines" ? <p className={styles.small}>Cultivate habits that protect and strengthen mind training.</p> : null}
      {isSloganDeck ? points.map((p, i) => {
        const entries = sloganStudySlides.filter(s => s.point === i + 1 && (deck === "slogans" || s.point === selectedPoint));
        if (!entries.length) return null;
        return <section key={p.id}>
          <h4>Point {i + 1} · {p.title}</h4>
          {i === 1 ? <p className={styles.small}>Ultimate awakening mind · slogans 2–6<br />Conventional awakening mind · slogans 7–10</p> : null}
          <ul className={styles.studyList}>{entries.map(s => <li key={s.number}><span className={styles.studyListNumber}>{s.displayNumber}</span><span>{s.text}</span></li>)}</ul>
        </section>;
      }) : deck === "points" ? <ol className={styles.studyOverview}>{points.map(p => <li key={p.id}><h4>{p.title}</h4><p>{p.summary}</p></li>)}</ol>
        : <ol className={styles.studyOverview}>{slides.map(slide => <li key={slide.title}><h4>{slide.title}</h4><p>{slide.body}</p></li>)}</ol>}
    </div> : <>
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
      {!isMeditation ? <><p className={styles.small}>{current.source}</p><p className={styles.small}>{current.kind}</p></> : null}
      {current.link ? <p><a href={current.link} target="_blank" rel="noreferrer">Read verse and commentary</a></p> : null}
      <div className={styles.inlineActions}>
        <button type="button" className={styles.primary} onClick={() => { togglePlayback(); setFocusMode(true); }}>{finished ? "Play again" : playing ? "Pause slideshow" : "Play slideshow"}</button>
        <button type="button" className={styles.textButton} disabled={index === 0} onClick={() => move(index - 1)}>Previous slide</button>
        <button type="button" className={styles.textButton} disabled={index === count - 1} onClick={() => move(index + 1)}>Next slide</button>
      </div>
      <p role="status" className={styles.small}>{finished ? "Deck complete" : playing && active ? "Playing" : "Paused"}</p>
    </div>
    </>}
    <dialog ref={dialog} className={`${styles.readingView} ${isMeditation ? styles.exchangeReading : ""}`} aria-label="Lojong slideshow reading view" onCancel={leaveReading} onClose={leaveReading}>
      <div className={styles.readingTop}><span>{index + 1} / {count}</span><span role="timer" aria-label="Reading time remaining">{remaining}s</span><button type="button" aria-label={sound ? "Mute slideshow sound" : "Enable slideshow sound"} onClick={toggleSound}>{sound ? "Sound on" : "Sound off"}</button><button type="button" onClick={leaveReading}>Exit</button></div>
      <div className={styles.readingContent}>
        <p className={styles.readingLabel}>{isSloganDeck ? current.label.replace(/ · .* · slogan /, " · Slogan ") : `${current.label}${isMeditation ? "" : " · study summary"}`}</p>
        <h2 ref={readingHeading} tabIndex={-1}>{isSloganDeck ? `“${current.title}”` : current.title}</h2>
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
    <TonglenMeditation active={tonglenOpen} standalone onExit={onTonglenExit} />
  </section>;
}
