"use client";

import { useEffect, useRef, useState } from "react";
import { sloganAttribution, points, slogans } from "@/lib/lojong/curriculum";
import { emptyReflection, expectations, methods, observations, outcomes, reflectionSummary, rootNotes, practiceConnections, suggestedAntidotes, suggestedRoots, type Reflection } from "@/lib/lojong/practice";
import styles from "./lojong.module.css";
import { TonglenMeditation } from "./TonglenMeditation";

const headings = ["What happened?", "What is arising?", "What would help?", "Apply an antidote", "What changed?"];

function toggle(list: string[], id: string) {
  if (list.includes(id)) return list.filter(value => value !== id);
  if (id === "none" || id === "unsure") return [id];
  return [...list.filter(value => value !== "none" && value !== "unsure"), id];
}

export function PracticeFlow({ active }: { active: boolean }) {
  const [reflection, setReflection] = useState<Reflection>(emptyReflection);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const summaryField = useRef<HTMLTextAreaElement>(null);
  const wasActive = useRef(false);
  useEffect(() => {
    if (active && (wasActive.current || step > 0 || complete)) title.current?.focus();
    wasActive.current = active;
  }, [active, step, complete]);

  const antidotes = suggestedAntidotes(reflection.states);
  const suggested = suggestedRoots(reflection.states, reflection.motives);
  const method = methods.find(m => m.id === reflection.method);
  const summary = complete ? reflectionSummary(reflection) : "";
  const canContinue = step === 0 ? Boolean(reflection.event.trim()) : step === 1 ? Boolean(reflection.states.length) : step === 2 ? Boolean(method) : step === 3 ? Boolean(method) : Boolean(reflection.outcome);
  function update<K extends keyof Reflection>(key: K, value: Reflection[K]) { setReflection(current => ({ ...current, [key]: value, ...(key === "states" ? { method: "", outcome: "" } : {}) })); }
  function selectRoot(number: number) { update("roots", reflection.roots.includes(number) ? reflection.roots.filter(n => n !== number) : [...reflection.roots, number]); }
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopyStatus("Summary copied."); }
    catch { summaryField.current?.focus(); summaryField.current?.select(); setCopyStatus("Select and copy the summary below."); }
  }
  function rootOption(number: number) {
    const s = slogans.find(item => item.number === number)!;
    const note = rootNotes.find(item => item.number === number);
    return <div className={styles.rootOption} key={number}>
      <label><input type="checkbox" checked={reflection.roots.includes(number)} onChange={() => selectRoot(number)} /><span><span className={styles.rootMeta}>Point {s.point} · {points[s.point - 1].title} · #{number}</span><span className={styles.rootText}>“{s.text}”</span></span></label>
      {note ? <details><summary>Read explanation</summary><p>{note.explanation}</p><p className={styles.small}>T. Jinpa · {note.source}. Explanation summarized from the course.</p></details> : null}
    </div>;
  }

  return <div className={styles.practice}>
    <div className={styles.quizMeta}><span>Practice with a situation</span><span>{complete ? "Review" : `${step + 1} of 5`}</span></div>
    <div className={styles.progressTrack}><span style={{ width: `${complete ? 100 : step * 20}%` }} /></div>
    <h2 ref={title} tabIndex={-1}>{complete ? "Practice review" : headings[step]}</h2>

    {complete ? <>
      <p className={styles.small}>Your observations and selected instructions. No interpretation has been added to your account of the event.</p>
      <label className={styles.formLabel}>Review text<textarea ref={summaryField} readOnly className={styles.summaryText} value={summary} rows={17} /></label>
      <div className={styles.inlineActions}><button className={styles.primary} onClick={copy}>Copy summary</button><button className={styles.textButton} onClick={() => { setComplete(false); setStep(4); }}>Edit review</button><button className={styles.textButton} onClick={() => setResetPending(true)}>New situation</button></div>
      {copyStatus ? <p className={styles.small} role="status">{copyStatus}</p> : null}
      {resetPending ? <div className={styles.note}><p>Start again? Copy this review first if you want to keep it.</p><div className={styles.inlineActions}><button className={styles.secondary} onClick={() => { setReflection(emptyReflection()); setStep(0); setComplete(false); setResetPending(false); setCopyStatus(""); }}>Start new situation</button><button className={styles.textButton} onClick={() => setResetPending(false)}>Keep this review</button></div></div> : null}
    </> : <form onSubmit={event => { event.preventDefault(); if (canContinue) { if (step === 4) setComplete(true); else setStep(current => current + 1); } }}>
      {step === 0 ? <>
        <label className={styles.formLabel}>Describe the event<textarea required maxLength={4000} rows={3} value={reflection.event} onChange={e => update("event", e.target.value)} /></label>
        <label className={styles.formLabel}>What did your mind say about it? <span className={styles.quiet}>(optional)</span><textarea maxLength={4000} rows={3} value={reflection.interpretation} onChange={e => update("interpretation", e.target.value)} /></label>
      </> : null}
      {step === 1 ? <>
        <p className={styles.formHelp}>Choose only what you recognize. Tension or disappointment alone does not establish an affliction.</p>
        <fieldset className={styles.checkGrid}><legend>States and attitudes</legend>{observations.map(o => <label key={o.id}><input type="checkbox" checked={reflection.states.includes(o.id)} onChange={() => update("states", toggle(reflection.states, o.id))} /><span>{o.label}</span></label>)}</fieldset>
        <details className={styles.learnMore}><summary>Examine expectations or grasping (optional)</summary><fieldset className={styles.checkGrid}><legend>What might you be holding onto?</legend>{expectations.map(o => <label key={o.id}><input type="checkbox" checked={reflection.motives.includes(o.id)} onChange={() => update("motives", toggle(reflection.motives, o.id))} /><span>{o.label}</span></label>)}</fieldset></details>
      </> : null}
      {step === 2 ? <>
        <p className={styles.note}>The direction is awakening for the benefit of beings: loosening self-cherishing and cultivating compassion and wisdom. You can begin with the response that fits this moment; you do not have to produce compassion first.</p>
        <p className={styles.formHelp}>Choose one response to practise first. These are starting points to try, rather than guarantees or demands to feel the opposite immediately.</p>
        <fieldset className={`${styles.checkGrid} ${styles.practiceChoices}`}><legend>Direct responses to what you noticed</legend>{antidotes.map(item => <label key={item.state} data-selected={reflection.method === item.method}><input type="radio" name="antidote" checked={reflection.method === item.method} onChange={() => { update("method", item.method); update("outcome", ""); }} /><span>{item.label}<span className={styles.antidoteHelp}>{item.why}</span></span></label>)}</fieldset>
        <details className={styles.learnMore}><summary>Related Lojong instructions (optional)</summary>
          <p className={styles.small}>The slogans give a wider training context. You can practise the direct response without selecting one.</p>
          <div className={styles.rootOptions}>{suggested.slice(0, 4).map(rootOption)}</div>
          {points.map((point, index) => <details className={styles.concept} key={point.id}><summary>{index + 1}. {point.title}</summary>{slogans.filter(s => s.point === index + 1 && !suggested.slice(0, 4).includes(s.number)).map(s => rootOption(s.number))}</details>)}
        </details>
      </> : null}
      {step === 3 ? <>
        <p className={styles.formHelp}>Choose a practice and apply it before checking its effect.</p>
        <fieldset className={`${styles.checkGrid} ${styles.practiceChoices}`}><legend>Choose a practice</legend>{methods.map(m => <label key={m.id} data-selected={reflection.method === m.id}><input type="radio" name="practice" value={m.id} checked={reflection.method === m.id} onChange={() => { update("method", m.id); update("outcome", ""); }} /><span>{m.title}</span></label>)}</fieldset>
        {method ? <div className={styles.methodDetail} hidden={method.id === "tonglen"}><p className={styles.rootMeta}>{method.basis}</p><ol>{method.steps.map(item => <li key={item}>{item}</li>)}</ol><p className={styles.small}>{method.source}</p></div> : null}
      </> : null}
      {step === 3 && method && practiceConnections[method.id] ? <details className={styles.learnMore}><summary>How this connects to Lojong</summary>
        <p>{practiceConnections[method.id].context}</p>
        {practiceConnections[method.id].instructions.map(number => { const instruction = slogans.find(item => item.number === number)!; return <p key={number}><span className={styles.rootMeta}>{sloganAttribution(number)} · Point {instruction.point}</span>“{instruction.text}”</p>; })}
        <p className={styles.small}>The practice prompts and suggested matches are adaptations. Read the course commentary for the full meaning of these instructions.</p>
      </details> : null}
      {step === 3 && method?.id === "tonglen" ? <TonglenMeditation active={active} /> : null}
      {step === 4 ? <>
        <blockquote className={styles.sourceQuote}><p>“Train in the three difficult challenges.”</p><cite>7 Point Mind Training, Slogan 45 · Chekawa Yeshe Dorje<br />Recognize the affliction · apply the antidote · ensure it works</cite></blockquote>
        <fieldset className={styles.checkGrid}><legend>What effect did you observe?</legend>{outcomes.map(o => <label key={o.id}><input type="radio" name="outcome" checked={reflection.outcome === o.id} onChange={() => update("outcome", o.id)} /><span>{o.label}</span></label>)}</fieldset>
        {reflection.outcome && reflection.outcome !== "weaker" ? <p className={styles.note}>The effect is not established. You can return to the practice step and investigate further or choose another antidote.</p> : null}
        <label className={styles.formLabel}>What did you notice? <span className={styles.quiet}>(optional)</span><textarea maxLength={4000} rows={3} value={reflection.observation} onChange={e => update("observation", e.target.value)} /></label>
      </> : null}
      <div className={styles.inlineActions}><button type="submit" className={styles.primary} disabled={!canContinue}>{step === 4 ? "Create review text" : step === 3 ? "Check the effect" : step === 2 ? "Practise this response" : "Continue"}</button>{step > 0 ? <button type="button" className={styles.textButton} onClick={() => setStep(current => current - 1)}>Back</button> : null}</div>
    </form>}
    <p className={styles.small}>This reflection stays in this tab and is not saved or sent to a server. Copy the review to keep it. Slogan numbering follows T. Jinpa’s course; other editions differ.</p>
  </div>;
}
