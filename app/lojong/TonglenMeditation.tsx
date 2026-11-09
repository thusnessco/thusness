"use client";

import { useEffect, useRef, useState } from "react";
import { playSinkInMainChimeFromGesture, playSinkInMainChimeHtml } from "@/lib/sinkin/sinkin-chime-html";
import styles from "./lojong.module.css";

const stages = [
  { title: "Settle", text: "Sit comfortably.\nBreathe naturally.\nWish that beings be free from suffering.", hint: "", seconds: 45 },
  { title: "Bring someone to mind", text: "Picture someone you care about.\nThey want happiness, just as you do.", hint: "", seconds: 45 },
  { title: "Give", text: "Imagine offering them happiness,\nstrength, and the causes of well-being.", hint: "", seconds: 75 },
  { title: "Take · optional", text: "Imagine their suffering dissolving\ninto white light in front of your heart.", hint: "If uncomfortable, stay with giving.", seconds: 75 },
  { title: "Give and take", text: "Continue giving happiness.\nIf comfortable, alternate with taking away suffering.", hint: "Let the imagery move at its own pace.", seconds: 90 },
  { title: "With the breath · optional", text: "When familiar with the practice:\nbreathe in—take; breathe out—give.", hint: "Or continue without linking to the breath. Never force or hold it.", seconds: 45 },
  { title: "Rest", text: "Let the imagery settle.\nKeep the wish for their well-being.", hint: "Carry this care into one action today.", seconds: 45 },
];
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function TonglenMeditation({ active, standalone = false, onExit }: { active: boolean; standalone?: boolean; onExit?: () => void }) {
  const [stage, setStage] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(stages[0].seconds);
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(true);
  const [sound, setSound] = useState(true);
  const [finished, setFinished] = useState(false);
  const [audioStatus, setAudioStatus] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const current = stage === null ? null : stages[stage];
  const timing = active && !paused && auto && !finished;

  useEffect(() => {
    const element = dialog.current;
    if (active && (standalone || stage !== null)) { if (!element?.open) element?.showModal(); }
    else if (element?.open) element.close();
  }, [active, standalone, stage]);
  useEffect(() => { if (active && stage !== null) heading.current?.focus(); }, [active, stage, finished]);
  useEffect(() => {
    if (stage === null || !timing) return;
    const deadline = Date.now() + remaining * 1000;
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next > 0) return;
      window.clearInterval(timer);
      if (sound) void playSinkInMainChimeHtml(528).catch(() => setAudioStatus("Sound unavailable."));
      if (stage === stages.length - 1) setFinished(true);
      else { setStage(stage + 1); setRemaining(stages[stage + 1].seconds); }
    }, 250);
    return () => window.clearInterval(timer);
    // Keep the deadline stable while the countdown display updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timing, sound]);
  function cue() { if (sound) playSinkInMainChimeFromGesture(528); }
  function begin() { cue(); setAudioStatus(""); setRemaining(stages[0].seconds); setPaused(false); setFinished(false); setStage(0); }
  function move(index: number) { cue(); setFinished(false); setStage(index); setRemaining(stages[index].seconds); }
  function close() { setStage(null); setFinished(false); setPaused(false); onExit?.(); if (!standalone) requestAnimationFrame(() => launcher.current?.focus()); }
  function toggleSound() { if (!sound) playSinkInMainChimeFromGesture(528); setSound(value => !value); }

  return <section aria-label="Guided Tonglen meditation">
    {!standalone ? <button ref={launcher} type="button" className={styles.secondary} onClick={begin}>Begin Tonglen meditation</button> : null}
    <dialog ref={dialog} className={styles.readingView} aria-label="Tonglen meditation reading view" onCancel={close} onClose={close}>
      <div className={styles.readingTop}>
        <span>Tonglen <span lang="bo" className={styles.tibetan}>གཏོང་ལེན་</span>{stage !== null ? ` · ${stage + 1}/${stages.length}` : ""}</span>
        {current ? <span role="timer" aria-label="Time remaining">{clock(remaining)}</span> : null}
        <button type="button" aria-label={sound ? "Mute meditation sound" : "Enable meditation sound"} onClick={toggleSound}>{sound ? "Sound on" : "Sound off"}</button>
        <button type="button" onClick={close}>Exit</button>
      </div>
      {current ? <>
        <div className={`${styles.readingContent} ${styles.tonglenReading}`}>
          <p className={styles.readingLabel}>{finished ? "Complete" : current.title}</p>
          <h2 ref={heading} tabIndex={-1} key={finished ? "complete" : stage}>{finished ? "May this practice benefit all beings." : current.text}</h2>
          {!finished && current.hint ? <p className={styles.tonglenHint}>{current.hint}</p> : null}
        </div>
        <div className={styles.readingControls}>
          <button type="button" disabled={stage === 0} onClick={() => move((stage ?? 0) - 1)}>Previous</button>
          {finished ? <button type="button" onClick={begin}>Begin again</button> : <button type="button" onClick={() => setPaused(value => !value)}>{paused ? "Resume" : "Pause"}</button>}
          <button type="button" onClick={() => stage === stages.length - 1 ? close() : move((stage ?? 0) + 1)}>{stage === stages.length - 1 ? "Finish" : "Next"}</button>
        </div>
      </> : <div className={`${styles.readingContent} ${styles.tonglenReading}`}>
        <h2>Tonglen</h2>
        <p className={styles.readingBody}>Give happiness. Take away suffering.</p>
        <p className={styles.readingLabel}>7 minutes</p>
        <div className={styles.readingControls}><button type="button" onClick={begin}>Begin meditation</button></div>
        <div className={styles.meditationSettings}><label><input type="checkbox" checked={auto} onChange={event => setAuto(event.target.checked)} /> Auto-advance</label></div>
        <details className={styles.readingMeaning}><summary>Guidance</summary><p>Taking and breath coordination are optional. You can stay with giving. This is visualization, not a literal transfer of suffering. If overwhelmed, stop and attend to your surroundings.</p></details>
      </div>}
      {audioStatus ? <p role="status" className={styles.readingEnd}>{audioStatus}</p> : null}
    </dialog>
  </section>;
}
