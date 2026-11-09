"use client";

import { useEffect, useRef, useState } from "react";
import { jinpaCourseUrl, points, sloganAttribution, slogans } from "@/lib/lojong/curriculum";
import { oneThingForDate, rootNotes } from "@/lib/lojong/practice";
import styles from "./lojong.module.css";

export function OneThingToday({ active, onExit }: { active: boolean; onExit: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    if (!active) return;
    const refresh = () => setToday(new Date());
    const frame = requestAnimationFrame(refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { cancelAnimationFrame(frame); window.clearInterval(timer); };
  }, [active]);
  useEffect(() => {
    const element = dialog.current;
    if (active && !element?.open) element?.showModal();
    else if (!active && element?.open) element.close();
  }, [active]);
  const lesson = today ? oneThingForDate(today) : null;
  const slogan = lesson ? slogans.find(s => s.number === lesson.slogan)! : null;
  const note = lesson ? rootNotes.find(n => n.number === lesson.slogan)! : null;
  return <dialog ref={dialog} className={styles.readingView} aria-label="One Thing Today" onCancel={onExit} onClose={onExit}>
    <div className={styles.readingTop}><span>One Thing Today{today ? ` · ${today.toLocaleDateString(undefined, { month: "long", day: "numeric" })}` : ""}</span><button type="button" onClick={onExit}>Exit</button></div>
    {lesson && slogan ? <div className={`${styles.readingContent} ${styles.dailyContent}`}>
      <p className={styles.readingLabel}>Point {slogan.point} · {points[slogan.point - 1].title}</p>
      <h2>{lesson.title}</h2>
      <p className={styles.dailyExplanation}>{lesson.explanation}</p>
      <div className={styles.dailyAction}><h3>Try this today</h3><p>{lesson.action}</p></div>
      <details className={styles.readingMeaning} key={`review-${lesson.slogan}-${active}`}><summary>A question for tonight</summary><p>{lesson.review}</p></details>
      <details className={styles.readingMeaning} key={`source-${lesson.slogan}-${active}`}><summary>The Lojong instruction</summary><p>“{slogan.text}”</p><p className={styles.readingMeaningNote}>{sloganAttribution(slogan.number)}<br />T. Jinpa · {note?.source}. Today’s explanation and suggested action are study adaptations.</p></details>
      <p className={styles.readingCredit}><a href={jinpaCourseUrl} target="_blank" rel="noreferrer">Course companion · T. Jinpa · Wisdom Academy</a></p>
    </div> : <p className={styles.readingBody}>Preparing today’s practice…</p>}
  </dialog>;
}
