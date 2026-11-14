import Image from "next/image";
import { verses } from "@/lib/lojong/curriculum";
import { memoryVerses } from "./memory-verses";
import styles from "./verse-memory.module.css";

export function VerseReader() {
  return <section className={styles.reader} aria-labelledby="eight-verses-heading">
    <header>
      <h2 id="eight-verses-heading">Eight Verses of Mind Training</h2>
      <p>Langri Thangpa Dorje Senge · Translation by Thupten Jinpa</p>
    </header>
    <ol className={styles.verses}>
      {memoryVerses.map((verse, index) => <li key={verse.anchor} className={styles.card}>
        <Image src={`/lojong/memorize/verse-${index + 1}.png`} alt={verse.cue} width={720} height={720} sizes="(max-width: 650px) 90vw, 280px" />
        <div>
          <p className={styles.number}>Verse {index + 1}</p>
          <h3>{verse.anchor}</h3>
          <blockquote className={styles.verse}>{verse.lines.join("\n")}</blockquote>
          <p>{verse.meaning}</p>
          <a href={verses[index].url} target="_blank" rel="noreferrer">Read commentary ↗</a>
        </div>
      </li>)}
    </ol>
  </section>;
}
