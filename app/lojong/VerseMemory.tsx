"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { memoryVerses } from "./memory-verses";
import styles from "./verse-memory.module.css";

type Card = { due: number; level: number; practiced: boolean; note: string };
type Saved = { version: 1; cards: Record<string, Card> };
const KEY = "thusness:lojong:verse-memory:v1";
const intervals = [600000, 86400000, 259200000, 604800000, 2592000000];
const stages = ["Meet the meaning", "Look, cover, recall", "Recall the whole", "Bring it into life"];
function parse(raw: string | null): Saved {
  const empty: Saved = { version: 1, cards: {} };
  if (!raw) return empty;
  const value = JSON.parse(raw);
  if (value?.version !== 1 || !value.cards || typeof value.cards !== "object") return empty;
  for (const [key, card] of Object.entries(value.cards)) {
    const c = card as Card;
    if (!/^[0-7]$/.test(key) || !c || !Number.isFinite(c.due) || !Number.isInteger(c.level) || c.level < 0 || c.level > 4 || typeof c.practiced !== "boolean" || typeof c.note !== "string") return empty;
  }
  return value;
}

export function VerseMemory() {
  const [saved, setSaved] = useState<Saved>({ version: 1, cards: {} });
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [words, setWords] = useState(false);
  const [shown, setShown] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [passes, setPasses] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { setSaved(parse(localStorage.getItem(KEY))); }
      catch { setNotice("Browser saving is unavailable. Practice still works; copy any notes you want to keep."); }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const verse = memoryVerses[index];
  const practiced = Object.values(saved.cards).filter(c => c.practiced).length;
  function start(i: number) {
    setIndex(i); setStep(0); setShown(true); setAttempted(false); setPasses(0); setQuiz(false); setNote(saved.cards[i]?.note || "");
  }
  function nextStep(next: number) {
    setStep(next); setPasses(0); setShown(next !== 2 || words); setAttempted(next === 2 && !words);
  }
  function recall() {
    if (!attempted) return;
    if (passes === 1) nextStep(step + 1);
    else { setPasses(1); setShown(false); setAttempted(true); }
  }
  function persist(next: Saved) {
    setSaved(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); setNotice("Saved in this browser."); }
    catch { setNotice("Could not save. Keep this page open and copy any notes before leaving."); }
  }
  function finish(success: boolean) {
    const old = saved.cards[index];
    const level = success && old?.practiced ? Math.min(old.level + 1, 4) : 0;
    persist({ version: 1, cards: { ...saved.cards, [index]: { due: Date.now() + intervals[level], level, practiced: success || !!old?.practiced, note } } });
    nextStep(0);
  }
  function resume() {
    const due = memoryVerses.findIndex((_, i) => saved.cards[i]?.due <= Date.now());
    const next = due >= 0 ? due : memoryVerses.findIndex((_, i) => !saved.cards[i]?.practiced);
    start(next >= 0 ? next : 0);
  }
  return <div className={styles.memory}>
    <header className={styles.header}><h2>Memorize the Eight Verses</h2><p>Eight short ideas, eight images. Begin with the meaning; add the exact words when you’re ready.</p></header>
    <div className={styles.toolbar}><span>{ready ? `${practiced} of 8 practiced` : "Loading progress…"}</span><button onClick={resume} disabled={!ready}>Continue / review due</button><button onClick={() => { setQuiz(!quiz); setRevealed({}); setScores({}); }}> {quiz ? "Back to practice" : "Test the eight anchors"}</button></div>
    <p className={styles.quiet}>A suggested week: two new verses a day for four days, then three days of recall and review. Take about 25 minutes each day, adjusting the pace to your recall.</p>
    {quiz ? <section className={styles.quiz} aria-label="Eight anchor recall test"><h3>Follow the journey from memory.</h3><p>Recall each teaching aloud before revealing its anchor.</p><p role="status">{Object.values(scores).filter(Boolean).length}/8 remembered · {Object.keys(scores).length}/8 assessed</p>{memoryVerses.map((v, i) => <div className={styles.question} key={v.anchor}><strong>Verse {i + 1}</strong>{revealed[i] ? <><span>{v.anchor}</span><button aria-pressed={scores[i] === true} onClick={() => setScores({ ...scores, [i]: true })}>Remembered</button><button aria-pressed={scores[i] === false} onClick={() => setScores({ ...scores, [i]: false })}>Practice again</button></> : <button onClick={() => setRevealed({ ...revealed, [i]: true })}>Reveal memory anchor</button>}</div>)}<button onClick={() => { setRevealed({}); setScores({}); }}>Reset test</button></section> : <>
    <div className={styles.toolbar}><label>Practice goal <select value={words ? "words" : "meaning"} onChange={e => { setWords(e.target.value === "words"); start(index); }}><option value="meaning">Remember the teachings</option><option value="words">Learn word for word</option></select></label><label>Verse <select value={index} onChange={e => start(Number(e.target.value))}>{memoryVerses.map((v, i) => <option key={v.anchor} value={i}>{step > 0 && step < 3 && !shown ? `Verse ${i + 1}` : `${i + 1}. ${v.anchor}`}</option>)}</select></label></div>
    <section className={styles.practice} aria-label="Guided memorization">
      <aside className={styles.art}><p className={styles.quiet}>VERSE {index + 1} / 8</p><div style={{ visibility: step > 0 && step < 3 && !shown ? "hidden" : "visible" }}><Image src={`/lojong/memorize/verse-${index + 1}.png`} alt={verse.cue} width={720} height={720} sizes="(max-width: 650px) 100vw, 280px"/><h3>{verse.anchor}</h3><p>{verse.cue}</p></div></aside>
      <div className={styles.lesson}><p className={styles.quiet}>STEP {step + 1} / 4 · {stages[step]}</p><progress value={step + 1} max={4} aria-label="Practice step"/>
      {step === 0 ? <><h3>Give the idea a picture.</h3><p>{verse.meaning}</p><p>Look at the image. Say the short anchor three times, look away, and explain the teaching in your own words.</p><details><summary>Read the full verse</summary><p className={styles.verse}>{verse.lines.join("\n")}</p><p className={styles.quiet}>Translation: Thupten Jinpa</p></details><button onClick={() => nextStep(1)}>Ready to recall</button></> : step < 3 ? <><h3>{words ? step === 1 ? "Begin with two lines." : "Add the next two lines." : step === 1 ? "Remember the meaning." : "Recall without a cue."}</h3><p>{words ? "Read aloud. Cover the words and try to recite before revealing them to check." : "Cover the anchor and say the teaching in your own words before checking."}</p><div className={styles.recall}>{shown ? <p className={styles.verse}>{words ? (step === 1 ? verse.lines.slice(0, 2) : verse.lines).join("\n") : verse.anchor}</p> : <p>Pause. Try recalling aloud.</p>}</div><button onClick={() => { setShown(!shown); if (shown) setAttempted(true); }}>{shown ? "Cover & try from memory" : "Reveal & check"}</button><div className={styles.toolbar}><button disabled={!shown || !attempted} onClick={() => { setPasses(0); setShown(false); setAttempted(true); }}>Needs another try</button><button disabled={!shown || !attempted} onClick={recall}>Recalled correctly · {passes}/2</button></div><p className={styles.quiet}>Aim for two correct recalls. These are your own assessments of recall.</p></> : <><h3>Bring it into life.</h3><p>Recall a real encounter where this teaching could help. Hold that moment alongside the image.</p><label className={styles.note}>My connection<textarea value={note} onChange={e => setNote(e.target.value)} placeholder="A moment in my life…"/></label><p className={styles.quiet}>Successful practice schedules a review in 10 minutes, then 1, 3, 7 and 30 days after subsequent successful reviews. A missed recall returns to 10 minutes.</p><div className={styles.toolbar}><button disabled={!ready} onClick={() => finish(true)}>Recalled · schedule review</button><button disabled={!ready} onClick={() => finish(false)}>Needs review · 10 minutes</button></div></>}
      {step > 0 ? <button className={styles.back} onClick={() => nextStep(step - 1)}>Previous step</button> : null}
      </div>
    </section>
    <details className={styles.journey}><summary>The eight-step journey</summary><div className={styles.grid}>{memoryVerses.map((v, i) => <button key={v.anchor} onClick={() => start(i)}><Image src={`/lojong/memorize/verse-${i + 1}.png`} alt={v.cue} width={720} height={720} sizes="(max-width: 650px) 45vw, 180px"/><span>{i + 1}. {v.anchor}</span><small>{saved.cards[i] ? `Review ${new Date(saved.cards[i].due).toLocaleString()}` : "Begin with the meaning"}</small></button>)}</div></details>
    </>}
    <p className={styles.quiet} role="status">{notice}</p><p className={styles.quiet}>Progress and connections save only in this browser, separately from Learn progress. Review dates appear here; there are no background notifications. Clearing browser data removes this copy.</p><p className={styles.quiet}>The Eight Verses of Mind Training (Lo jong Tsig gye ma), by Langri Tangpa Dorje Senge. Translation: Thupten Jinpa. Anchors and summaries are study paraphrases. Full wording follows the supplied translation, with line breaks arranged for practice. Memorization does not measure realization.</p>
  </div>;
}
