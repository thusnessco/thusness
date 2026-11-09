"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";

import { sloganAttribution, conceptById, concepts, foundations, points, slogans, verses, type Concept, type Skill } from "@/lib/lojong/curriculum";
import { advance, beginSession, learningState, parseProgress, respond, reviewConcepts, SESSION_LENGTH, setConfidence, type Progress } from "@/lib/lojong/engine";
import { questionById, type Question } from "@/lib/lojong/questions";
import { createProgressStore } from "@/lib/lojong/storage";
import styles from "./lojong.module.css";
import { OneThingToday } from "./OneThingToday";
import { TonglenMeditation } from "./TonglenMeditation";
import { StudySlideshow } from "./StudySlideshow";
import { PracticeFlow } from "./PracticeFlow";

type View = "practice" | "one-thing" | "tonglen" | "today" | "study" | "slideshow" | "review";
type StudyView = "points" | "verses" | "slogans" | "foundations";

const openingQuotes = [
  { text: "In all my activities, I shall probe my mind, and as soon as an affliction arises, since it endangers myself and others, I will train myself to confront it directly and counter it.", attribution: "Langri Thangpa · Eight Verses, verse 3" },
  ...[12, 14, 22, 50].map(number => { const slogan = slogans.find(item => item.number === number)!; return { text: slogan.text, attribution: sloganAttribution(number) }; }),
  { text: "Until you have gained stability, adversities become unfavorable conditions to you. Once you gain stability, there is no such thing as unfavorable conditions.", attribution: "" },
];

export function LojongCompanion() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = Number(sessionStorage.getItem("thusness:lojong:opening-quote") ?? -1);
        const next = Number.isInteger(saved) && saved >= -1 ? (saved + 1) % openingQuotes.length : 0;
        setQuoteIndex(next);
        sessionStorage.setItem("thusness:lojong:opening-quote", String(next));
      } catch { /* The first quote remains available when browser storage is blocked. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const openingQuote = openingQuotes[quoteIndex];
  function nextQuote() {
    const next = (quoteIndex + 1) % openingQuotes.length;
    setQuoteIndex(next);
    try { sessionStorage.setItem("thusness:lojong:opening-quote", String(next)); } catch {}
  }
  const store = useMemo(() => createProgressStore(), []);
  const progress = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [view, setView] = useState<View>("practice");
  const [studyView, setStudyView] = useState<StudyView>("points");
  const [focus, setFocus] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [pendingImport, setPendingImport] = useState<Progress | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  function studyConcept(id: string) {
    setFocus(id);
    setStudyView(id.startsWith("point-") ? "points" : "foundations");
    setView("study");
  }

  function exportProgress() {
    if (!progress) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `thusness-lojong-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Progress exported. Keep the file to restore this browser or move to another device.");
  }

  async function importProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) { setNotice("That file is too large. Choose an exported Lojong progress file."); return; }
    try {
      const parsed = parseProgress(JSON.parse(await file.text()));
      if (!parsed) throw new Error("Invalid progress");
      if (progress && (progress.attempts.length || progress.session)) {
        setPendingImport(parsed);
        setNotice("Ready to import. Replace this browser’s progress, or keep your current progress. Export first if you want to keep both.");
        return;
      }
      store.update(parsed);
      setNotice("Progress imported. Your saved session is available in Today.");
    } catch { setNotice("That file could not be read. Choose a valid Lojong progress export; your current progress has been kept."); }
  }

  return (
    <>
      <div className={styles.intro}>
        <h1><a href="/lojong" aria-label="Lojong — start over" style={{ textDecoration: "none" }}>Lojong <span lang="bo" className={styles.tibetan}>བློ་སྦྱོང་</span></a></h1>
        <blockquote className={styles.heroQuote}>
          <p>“{openingQuote.text}”</p>
          {openingQuote.attribution ? <cite>{openingQuote.attribution}</cite> : null}
        </blockquote>
        <button type="button" className={styles.quoteNext} onClick={nextQuote}>Another reflection</button>
      </div>

      <nav className={styles.tabs} aria-label="Mind training sections">
        {(["practice", "one-thing", "tonglen", "study", "slideshow", "review", "today"] as View[]).map(item => (
          <button key={item} type="button" aria-current={view === item ? "page" : undefined} onClick={() => setView(item)}>{item === "today" ? "Learn" : item === "one-thing" ? "One Thing Today" : item}</button>
        ))}
      </nav>

      <section hidden={view !== "practice"} aria-label="Practice"><PracticeFlow active={view === "practice"} /></section>

      <OneThingToday active={view === "one-thing"} onExit={() => setView("practice")} />
      <section hidden={view !== "tonglen"} aria-label="Tonglen meditation"><TonglenMeditation active={view === "tonglen"} /></section>

      <section hidden={view !== "slideshow"} aria-label="Slideshow"><StudySlideshow active={view === "slideshow"} /></section>

      {!progress ? <p className={styles.quiet} role="status">Loading saved learning progress…</p> : (
        <>
          <section hidden={view !== "today"} aria-label="Today">
            {!progress.session ? (
              <div className={styles.start}>
                <p className={styles.eyebrow}>Learning</p>
                <h2>{progress.attempts.length ? "Review session" : "Initial assessment"}</h2>
                <p>{progress.attempts.length ? "Review uncertain concepts and answer application questions." : "Six questions on Lojong. Choose “Not sure” when needed."}</p>
                <button className={styles.primary} onClick={() => store.update(beginSession(progress))}>{progress.attempts.length ? "Start review" : "Start assessment"}</button>
                <button className={styles.textButton} onClick={() => { setFocus(null); setView("study"); }}>Study the Seven Points</button>
                <p className={styles.small}>About 3–5 minutes.</p>
              </div>
            ) : (
              <Quiz progress={progress} update={store.update} onStudy={studyConcept} onReview={() => setView("review")} />
            )}
          </section>

          <section hidden={view !== "study"} aria-label="Study">
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>Study</p>
              <h2>Texts and instructions</h2>
              <p>Seven-Point Mind Training and the Eight Verses.</p>
            </div>
            <div className={styles.subnav} role="group" aria-label="Study topics">
              {([['points', 'Seven Points'], ['verses', 'Eight Verses'], ['slogans', 'Slogans'], ['foundations', 'Key distinctions']] as [StudyView, string][]).map(([id, label]) => <button key={id} aria-pressed={studyView === id} onClick={() => { setStudyView(id); setFocus(null); }}>{label}</button>)}
            </div>
            {studyView === "points" ? <>
              <p className={styles.note}>Seven Points of Mind Training · study summaries.</p>
              <div className={styles.conceptList}>{points.map((c, i) => <ConceptItem key={`${c.id}-${focus}`} concept={c} number={i + 1} initiallyOpen={focus === c.id} />)}</div>
            </> : null}
            {studyView === "foundations" ? <div className={styles.conceptList}>{foundations.map(c => <ConceptItem key={`${c.id}-${focus}`} concept={c} initiallyOpen={focus === c.id} />)}</div> : null}
            {studyView === "verses" ? <>
              <p className={styles.note}>Langri Thangpa’s Eight Verses · study summaries. Each card links to the verse and commentary.</p>
              <ol className={styles.verseList}>{verses.map(v => <li key={v.number}>
                <span className={styles.number}>{String(v.number).padStart(2, "0")}</span><div><h3>{v.title}</h3><p>{v.summary}</p><div className={styles.inlineActions}><button className={styles.textButton} onClick={() => studyConcept(v.point)}>Explore Point {v.point.slice(-1)}</button><a href={v.url} target="_blank" rel="noreferrer">Read commentary ↗</a></div></div>
              </li>)}</ol>
            </> : null}
            {studyView === "slogans" ? <SloganLibrary onStudy={studyConcept} /> : null}
            {progress.session && !progress.session.finished ? <button className={styles.primary} onClick={() => setView("today")}>Return to my session</button> : null}
          </section>

          <section hidden={view !== "review"} aria-label="Review">
            <Review progress={progress} onStudy={studyConcept} onSession={() => { if (!progress.session || progress.session.finished) store.update(beginSession(progress)); setView("today"); }} />
          </section>

          <div className={styles.storage} hidden={view === "practice" || view === "tonglen" || view === "one-thing"}>
            <p>Learning progress is saved in this browser. Export a copy before clearing browser data.</p>
            <div className={styles.inlineActions}><button className={styles.textButton} onClick={exportProgress}>Export progress</button><button className={styles.textButton} onClick={() => importInput.current?.click()}>Import progress</button></div>
            <input ref={importInput} className={styles.srOnly} tabIndex={-1} type="file" accept=".json,application/json" aria-label="Import Lojong progress file" onChange={importProgress} />
            {store.getMessage() ? <p role="alert">{store.getMessage()}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {pendingImport ? <div className={styles.inlineActions}><button className={styles.secondary} onClick={() => { store.update(pendingImport); setPendingImport(null); setNotice("Progress imported. Your saved session is available in Today."); }}>Replace saved progress</button><button className={styles.textButton} onClick={() => { setPendingImport(null); setNotice("Import cancelled. Your current progress has been kept."); }}>Keep current progress</button></div> : null}
          </div>
        </>
      )}
    </>
  );
}

function ConceptItem({ concept: c, number, initiallyOpen = false }: { concept: Concept; number?: number; initiallyOpen?: boolean }) {
  return <details className={styles.concept} open={initiallyOpen || undefined}>
    <summary>{number ? <span className={styles.number}>{String(number).padStart(2, "0")}</span> : null}<span>{c.title}</span><span className={styles.expand} aria-hidden="true">+</span></summary>
    <ConceptBody concept={c} />
  </details>;
}

function ConceptBody({ concept: c }: { concept: Concept }) {
  return <div className={styles.conceptBody}>
    <p>{c.summary}</p>
    {c.sections?.map(section => <div className={styles.conceptSection} key={section.title}><h3>{section.title}</h3><p>{section.text}</p></div>)}
    <p>{c.why}</p>
    {c.quote && !/Jinpa|Lesson|course/i.test(c.quote.attribution) ? <blockquote className={styles.sourceQuote}><p>“{c.quote.text}”</p><cite>{c.quote.attribution}</cite></blockquote> : null}
    <p><span className={styles.label}>Study question</span><br />{c.check}</p>
  </div>;
}

function SloganLibrary({ onStudy }: { onStudy: (id: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const results = slogans.filter(s => (filter === "all" || s.point === Number(filter)) && s.text.toLowerCase().includes(search.toLowerCase().trim()));
  return <>
    <p className={styles.note}>61 numbered instructions. Editions differ; entries 11–12 form one instruction.</p>
    <div className={styles.filters}>
      <label>Find a slogan<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="A word or phrase…" /></label>
      <label>Category<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All Seven Points</option>{points.map((p, i) => <option key={p.id} value={i + 1}>{i + 1} · {p.title}</option>)}</select></label>
    </div>
    <p className={styles.small} role="status">{results.length} {results.length === 1 ? "instruction" : "instructions"}</p>
    <ol className={styles.sloganList}>{results.map(s => <li key={s.number}><span className={styles.number}>{String(s.number).padStart(2, "0")}</span><div><p>{s.text}</p><p className={styles.small}>{sloganAttribution(s.number)}</p><button className={styles.textButton} onClick={() => onStudy(`point-${s.point}`)}>Point {s.point} · {points[s.point - 1].title}</button></div></li>)}</ol>
    {!results.length ? <p>Try another phrase or choose a different category.</p> : null}
  </>;
}

function Quiz({ progress, update, onStudy, onReview }: { progress: Progress; update: (p: Progress) => void; onStudy: (id: string) => void; onReview: () => void }) {
  const s = progress.session!;
  const q = questionById[s.ids.at(-1)!];
  const concept = conceptById[q.concept];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const hasResponse = Boolean(s.response);
  useEffect(() => {
    const target = hasResponse && !s.finished ? feedbackRef.current : headingRef.current;
    if (target?.getClientRects().length) target.focus();
  }, [q.id, hasResponse, s.finished]);
  if (s.finished) {
    const recent = progress.attempts.slice(-SESSION_LENGTH);
    const uncertain = [...new Set(recent.filter(a => !a.correct || a.confidence !== "knew").map(a => a.concept))];
    return <div className={styles.finish}>
      <p className={styles.eyebrow}>Session complete</p><h2 ref={headingRef} tabIndex={-1}>Session review</h2>
      <p>{uncertain.length ? "Review the concepts below. The next session will use different questions where possible." : "No concepts marked for review."}</p>
      {uncertain.length ? <ul className={styles.studyLinks}>{uncertain.map(id => <li key={id}><button className={styles.textButton} onClick={() => onStudy(id)}>{conceptById[id].title}</button></li>)}</ul> : null}
      <div className={styles.inlineActions}><button className={styles.primary} onClick={() => update(beginSession(progress))}>Another short session</button><button className={styles.textButton} onClick={onReview}>See review notes</button></div>
    </div>;
  }
  return <div className={styles.quiz}>
    <div className={styles.quizMeta}><span>{s.mode === "diagnostic" ? "Initial assessment" : "Review session"}</span><span>{s.ids.length} of {SESSION_LENGTH}</span></div>
    <div className={styles.progressTrack} role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={SESSION_LENGTH} aria-valuenow={s.ids.length - 1}><span style={{ width: `${((s.ids.length - 1) / SESSION_LENGTH) * 100}%` }} /></div>
    <p className={styles.eyebrow}>{q.skill === "application" ? "Application" : "Understanding"}</p>
    <h2 className={styles.question} ref={headingRef} tabIndex={-1}>{q.prompt}</h2>
    {!s.response ? <AnswerEditor key={q.id} question={q} onAnswer={(answer, unsure) => update(respond(progress, answer, unsure))} /> : <div className={styles.feedback} aria-live="polite">
      <p className={styles.feedbackLabel} ref={feedbackRef} tabIndex={-1}>{s.response.confidence === "unsure" ? "Review the explanation" : s.response.correct ? "Correct" : "Review the answer"}</p>
      <p>{q.explanation}</p><p className={styles.quiet}>{q.contrast}</p>
      <div className={styles.correctAnswer}><p className={styles.label}>The answer</p><ol>{q.answer.map((id, i) => <li key={id}>{q.slots ? `${q.slots[i]} — ` : ""}{q.options.find(o => o.id === id)!.text}</li>)}</ol></div>
      {s.response.correct && !s.response.confidence ? <fieldset className={styles.confidence}><legend>How did you arrive at that?</legend><button className={styles.secondary} onClick={() => update(setConfidence(progress, "knew"))}>Knew it</button><button className={styles.secondary} onClick={() => update(setConfidence(progress, "guessed"))}>Guessed</button><p className={styles.small}>A correct guess stays marked for review.</p></fieldset> : null}
      <details className={styles.learnMore}><summary>Read the source-based explanation</summary><ConceptBody concept={concept} /></details>
      <div className={styles.inlineActions}>{s.response.confidence ? <button className={styles.primary} onClick={() => update(advance(progress))}>{s.ids.length === SESSION_LENGTH ? "Close this session" : "Continue"}</button> : null}<button className={styles.textButton} onClick={() => onStudy(q.concept)}>Study this idea</button></div>
    </div>}
    <p className={styles.small}>You can switch to Study or Review and come back. Submitted answers are saved automatically.</p>
  </div>;
}

function AnswerEditor({ question: q, onAnswer }: { question: Question; onAnswer: (ids: string[], unsure?: boolean) => void }) {
  const ordered = q.kind === "order" || q.kind === "match";
  const [selection, setSelection] = useState<string[]>(ordered ? q.options.map(o => o.id) : []);
  const [movement, setMovement] = useState("");
  function move(index: number, direction: number) {
    const next = [...selection];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setSelection(next);
    setMovement(`${q.options.find(o => o.id === next[index + direction])!.text} moved to position ${index + direction + 1}.`);
  }
  function select(id: string) {
    setSelection(prev => q.kind === "single" ? [id] : prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }
  return <form onSubmit={e => { e.preventDefault(); onAnswer(selection); }}>
    {ordered ? <>
      <ol className={styles.orderList}>{selection.map((id, i) => <li key={id}>
        <div>{q.slots ? <p className={styles.slot}>{q.slots[i]}</p> : null}<span>{q.options.find(o => o.id === id)!.text}</span></div>
        <div className={styles.moveControls}><button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${q.options.find(o => o.id === id)!.text} up`}>Up</button><button type="button" disabled={i === selection.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${q.options.find(o => o.id === id)!.text} down`}>Down</button></div>
      </li>)}</ol><p className={styles.srOnly} aria-live="polite">{movement}</p>
    </> : <fieldset className={styles.options}><legend className={styles.srOnly}>{q.kind === "multiple" ? "Choose all that apply" : "Choose one answer"}</legend>{q.options.map(o => <label key={o.id} data-selected={selection.includes(o.id)}><input type={q.kind === "multiple" ? "checkbox" : "radio"} name={q.id} checked={selection.includes(o.id)} onChange={() => select(o.id)} /><span>{o.text}</span></label>)}</fieldset>}
    <div className={styles.inlineActions}><button className={styles.primary} type="submit" disabled={!selection.length}>Check my understanding</button><button type="button" className={styles.textButton} onClick={() => onAnswer([], true)}>Not sure</button></div>
  </form>;
}

function Review({ progress, onStudy, onSession }: { progress: Progress; onStudy: (id: string) => void; onSession: () => void }) {
  const reviewed = concepts.filter(c => progress.attempts.some(a => a.concept === c.id));
  const due = reviewConcepts(progress);
  const labels: Record<string, string> = { unexplored: "Not explored", revisit: "Revisit", uncertain: "Uncertain / guessed", demonstrated: "Demonstrated" };
  return <>
    <div className={styles.sectionHead}><p className={styles.eyebrow}>Review</p><h2>Concepts to review</h2><p>{due.length ? `${due.length} ${due.length === 1 ? "concept is" : "concepts are"} ready for review.` : reviewed.length ? "No scheduled reviews are due yet." : "No learning questions answered yet."}</p><button className={styles.primary} onClick={onSession}>{progress.session && !progress.session.finished ? "Resume my session" : "Start review"}</button></div>
    {reviewed.length ? <ul className={styles.reviewList}>{reviewed.map(c => <li key={c.id}><button className={styles.textButton} onClick={() => onStudy(c.id)}>{c.title}</button><dl className={styles.skillList}>{(["recognition", "recall", "application"] as Skill[]).map(skill => { const s = learningState(progress, c.id, skill); return <div key={skill}><dt>{skill === "recall" ? "Unaided recall" : skill}</dt><dd>{skill === "recall" ? "Not assessed" : labels[s.status]}{skill !== "recall" && s.status === "demonstrated" ? s.due ? " · ready to revisit" : ` · revisit ${new Date(s.dueAt!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</dd></div>; })}</dl></li>)}</ul> : null}

  </>;
}
