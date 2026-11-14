"use client";

import { useEffect, useState } from "react";

import { sloganAttribution, foundations, points, slogans, type Concept } from "@/lib/lojong/curriculum";
import styles from "./lojong.module.css";
import { OneThingToday } from "./OneThingToday";
import { StudySlideshow } from "./StudySlideshow";
import { VerseReader } from "./VerseReader";
import { PracticeFlow } from "./PracticeFlow";

type View = "practice" | "one-thing" | "tonglen" | "study" | "slideshow";
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
  const [view, setView] = useState<View>("practice");
  const [studyView, setStudyView] = useState<StudyView>("points");
  useEffect(() => {
    const openLinkedMeditation = () => { if (window.location.hash === "#tonglen") setView("tonglen"); else if (["#memorize", "#eight-verses"].includes(window.location.hash)) { setStudyView("verses"); setView("study"); } else if (window.location.hash === "#slideshow") setView("slideshow"); };
    const frame = requestAnimationFrame(openLinkedMeditation);
    window.addEventListener("hashchange", openLinkedMeditation);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", openLinkedMeditation); };
  }, []);
  function navigateView(next: View) {
    setView(next);
    if (next === "tonglen" || next === "slideshow") window.history.replaceState(null, "", "#" + next);
    else if (["#tonglen", "#memorize", "#eight-verses", "#slideshow"].includes(window.location.hash)) window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  const [focus, setFocus] = useState<string | null>(null);

  function studyConcept(id: string) {
    setFocus(id);
    setStudyView(id.startsWith("point-") ? "points" : "foundations");
    setView("study");
  }

  const practiceArea = view === "practice" || view === "one-thing" || view === "slideshow" || view === "tonglen";
  const options: [View, string][] = [["practice", "Work with a situation"], ["one-thing", "One Thing Today"], ["slideshow", "Guided practices"]];

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
        <button type="button" aria-current={practiceArea ? "page" : undefined} onClick={() => navigateView("practice")}>Practice</button>
        <button type="button" aria-current={!practiceArea ? "page" : undefined} onClick={() => navigateView("study")}>Study</button>
      </nav>

      {practiceArea && <nav className={styles.subnav} aria-label="Practice options">
        {options.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={view === id || (view === "tonglen" && id === "slideshow")} onClick={() => navigateView(id)}>{label}</button>
        ))}
      </nav>}

      <section hidden={view !== "practice"} aria-label="Practice"><PracticeFlow active={view === "practice"} /></section>

      <OneThingToday active={view === "one-thing"} onExit={() => setView("practice")} />

      <section hidden={view !== "slideshow" && view !== "tonglen"} aria-label="Guided practices"><StudySlideshow active={view === "slideshow"} tonglenOpen={view === "tonglen"} onTonglen={() => navigateView("tonglen")} onTonglenExit={() => navigateView("slideshow")} /></section>

      <section hidden={view !== "study"} aria-label="Study">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Study</p>
          <h2>Texts and instructions</h2>
          <p>Seven-Point Mind Training and the Eight Verses.</p>
        </div>
        <div className={styles.subnav} role="group" aria-label="Study topics">
          {([['points', 'Seven Points'], ['verses', 'Eight Verses'], ['slogans', 'Slogans'], ['foundations', 'Key distinctions']] as [StudyView, string][]).map(([id, label]) => <button key={id} aria-pressed={studyView === id} onClick={() => { setStudyView(id); setFocus(null); navigateView("study"); if (id === "verses") window.history.replaceState(null, "", "#eight-verses"); }}>{label}</button>)}
        </div>
        {studyView === "points" ? <>
          <p className={styles.note}>Seven Points of Mind Training · study summaries.</p>
          <div className={styles.conceptList}>{points.map((c, i) => <ConceptItem key={`${c.id}-${focus}`} concept={c} number={i + 1} initiallyOpen={focus === c.id} />)}</div>
        </> : null}
        {studyView === "foundations" ? <div className={styles.conceptList}>{foundations.map(c => <ConceptItem key={`${c.id}-${focus}`} concept={c} initiallyOpen={focus === c.id} />)}</div> : null}
        {view === "study" && studyView === "verses" ? <VerseReader /> : null}
        {studyView === "slogans" ? <SloganLibrary onStudy={studyConcept} /> : null}
      </section>

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
