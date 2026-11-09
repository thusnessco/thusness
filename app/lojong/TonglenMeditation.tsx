"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { playSinkInMainChimeFromGesture, playSinkInMainChimeHtml } from "@/lib/sinkin/sinkin-chime-html";
import styles from "./lojong.module.css";

const stages = [
  { title: "Settle and set an intention", text: "Sit comfortably. Let your breathing find its own rhythm. Bring to mind the wish that beings have happiness and be free from suffering. Stay here as long as you need." },
  { title: "Begin with giving", text: "Bring someone you care about to mind. Imagine offering them happiness, strength, well-being, and the causes of happiness. Let the wish for their welfare become the center of your attention." },
  { title: "Gently introduce taking", text: "If it feels workable, imagine taking away their suffering and its causes. You can imagine it dissolving into an orb of white light in front of your heart. If taking feels too difficult, stay with giving. You can also begin by imagining relief for your future self before extending to others." },
  { title: "Alternate giving and taking", text: "Continue offering happiness and imagining suffering relieved. At first, let the visualization move at its own pace. Once familiar, you may take with the in-breath and give with the out-breath. Keep breathing naturally; there is no need to slow, hold, or force it." },
  { title: "Rest and carry the intention forward", text: "Let the visualization settle. Return to the wish that beings have happiness and be free from suffering. Notice how you feel, without requiring a particular result. Consider one small act of care you can bring into the situation." },
];

const holds = [60, 90, 90, 120, 60];
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function TonglenMeditation({ active }: { active: boolean }) {
  const [stage, setStage] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(holds[0]);
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(true);
  const [sound, setSound] = useState(true);
  const [finished, setFinished] = useState(false);
  const [audioStatus, setAudioStatus] = useState("");
  const deadline = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const start = useRef<HTMLButtonElement>(null);
  const current = stage === null ? null : stages[stage];
  const timing = active && !paused && auto && !finished;

  useEffect(() => { if (active && stage !== null) heading.current?.focus(); }, [active, stage, finished]);
  useEffect(() => {
    if (stage === null || !timing) return;
    // A fresh deadline preserves the remaining time after pause or tab changes.
    deadline.current = Date.now() + remaining * 1000;
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(next);
      if (next > 0) return;
      window.clearInterval(timer);
      if (sound) void playSinkInMainChimeHtml(528).catch(() => setAudioStatus("Sound could not play. The meditation will continue silently."));
      if (stage === stages.length - 1) setFinished(true);
      else { setStage(stage + 1); setRemaining(holds[stage + 1]); }
    }, 250);
    return () => window.clearInterval(timer);
    // remaining updates the display; it must not restart the running deadline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timing, sound]);

  function cue() {
    if (sound) playSinkInMainChimeFromGesture(528);
  }
  function begin() {
    cue(); setAudioStatus(""); setRemaining(holds[0]); setPaused(false); setFinished(false); setStage(0);
  }
  function move(index: number) {
    cue(); setFinished(false); setStage(index); setRemaining(holds[index]);
  }
  function close() {
    setStage(null); setFinished(false); setPaused(false);
    requestAnimationFrame(() => start.current?.focus());
  }
  return <section className={styles.meditation} aria-label="Guided Tonglen meditation">
    {current ? <>
      <div className={styles.quizMeta}><span>Tonglen <span lang="bo" className={styles.tibetan}>གཏོང་ལེན་</span> · {(stage ?? 0) + 1} of {stages.length}</span><span role="timer" aria-label="Time remaining">{clock(remaining)}</span></div>
      <div className="sinkin-hero" style={{ "--sinkin-crossfade-ms": "700ms" } as CSSProperties}>
        <h3 ref={heading} tabIndex={-1} className="sinkin-hero-kicker">{finished ? "Meditation complete" : current.title}</h3>
        <p key={stage} className="sinkin-hero-body">{finished ? "Rest briefly, then notice how you feel." : current.text}</p>
      </div>
      <p className={styles.small}>{finished ? "The timed practice is complete." : !active || paused ? "Paused" : auto ? "Auto-advance" : "Manual advance"}</p>
      <div className={styles.inlineActions}>
        {!finished ? <button type="button" className={styles.secondary} onClick={() => setPaused(value => !value)}>{paused ? "Resume meditation" : "Pause meditation"}</button> : null}
        {stage !== null && stage > 0 ? <button type="button" className={styles.textButton} onClick={() => move(stage - 1)}>Previous prompt</button> : null}
        {stage === stages.length - 1 ? <button type="button" className={styles.secondary} onClick={close}>Finish meditation</button> : <button type="button" className={styles.secondary} onClick={() => move((stage ?? 0) + 1)}>Next prompt</button>}
        <button type="button" className={styles.textButton} onClick={close}>End meditation</button>
      </div>
    </> : <>
      <h3>Tonglen <span lang="bo" className={styles.tibetan}>གཏོང་ལེན་</span> meditation</h3>
      <p>Seven-minute giving-and-taking practice, with a bell between prompts.</p>
      <button ref={start} type="button" className={styles.primary} onClick={begin}>Begin Tonglen meditation</button>
    </>}
    <div className={styles.meditationSettings}>
      <label><input type="checkbox" checked={auto} onChange={event => setAuto(event.target.checked)} /> Auto-advance</label>
      <label><input type="checkbox" checked={sound} onChange={event => { setSound(event.target.checked); if (event.target.checked) playSinkInMainChimeFromGesture(528); }} /> Sound</label>
    </div>
    {audioStatus ? <p role="status" className={styles.small}>{audioStatus}</p> : null}
    <details className={styles.learnMore}><summary>Practice guidance and source</summary><p>You can remain with giving throughout. This is imaginative training in care, not a literal transfer of illness. If overwhelmed, leave the visualization and attend to your surroundings.</p><p>Adapted from T. Jinpa’s Lesson 5, pp. 5–6 and 9. Written prompts and timings are study aids, not quotations or a recording of the course. Breath coordination is optional and comes after familiarity.</p></details>
  </section>;
}
