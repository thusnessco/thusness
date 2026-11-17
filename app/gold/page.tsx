import type { Metadata } from "next";
import { getIndicators } from "./market";
import styles from "./gold.module.css";

export const metadata: Metadata = {
  title: "Gold Market Dashboard · Thusness",
  description: "Gold trends, relative strength, and market confirmation.",
};

export const revalidate = 900;

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const stamp = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default async function GoldPage() {
  const indicators = await getIndicators();

  return <main className={styles.page}>
    <header>
      <p className={styles.eyebrow}>Market dashboard</p>
      <h1>Gold</h1>
      <p>Trend, relative strength, and market confirmation using the indicators requested from Goldman Starch’s gold analysis.</p>
      <p className={styles.muted}>Calculated {stamp.format(new Date())} UTC · Refreshes on visits after 15 minutes · Daily data may be delayed</p>
    </header>

    <section aria-labelledby="signals">
      <h2 id="signals">Market signals</h2>
      <p>Status compares the latest close with its reference. Momentum measures movement separately, so a bearish signal can be improving.</p>
      <div className={styles.grid}>
        {indicators.map(indicator => <article key={indicator.name} className={styles.card}>
          <h3>{indicator.name}</h3>
          <p className={styles.value}>{indicator.value === null ? "Unavailable" : number.format(indicator.value)} <span>{indicator.value !== null && indicator.unit}</span></p>
          <dl>
            <div><dt>Status</dt><dd data-signal={indicator.status}>{indicator.status}</dd></div>
            <div><dt>Momentum</dt><dd data-signal={indicator.momentum}>{indicator.momentum}</dd></div>
            <div><dt>Reference</dt><dd>{indicator.baseline === null ? "Unavailable" : number.format(indicator.baseline)}</dd></div>
          </dl>
          <p className={styles.muted}>{indicator.day ? `As of ${indicator.day}${indicator.stale ? " · Stale" : ""}` : "No market observation available"}</p>
          <p className={styles.rule}>{indicator.rule}</p>
        </article>)}
      </div>
    </section>

    <section aria-labelledby="thresholds">
      <h2 id="thresholds">Historical thresholds</h2>
      <p>The live references use 20, 50 and 100 completed weekly gold closes, 50 sessions for the ratios and indexes, and 20 prior sessions for GLD volume. These are dashboard rules. The historical levels below refer to the quoted gold price in the source. Additional indicator-specific thresholds are unverified.</p>
      <ul className={styles.checkpoints}>
        <li><strong>$3,955/oz</strong> · June 30, 2026 low and the level Goldman Starch highlighted as the line to watch.</li>
        <li><strong>$5,595/oz</strong> · January 29, 2026 record high cited in the same analysis.</li>
      </ul>
      <p><a href="https://goldmanstarch.com/gld-etf-analysis/">Goldman Starch’s October 11, 2026 gold analysis</a></p>
    </section>
    <section aria-labelledby="checkpoints">
      <h2 id="checkpoints">2027 checkpoints</h2>
      <ul className={styles.checkpoints}>
        <li><strong>January 2027</strong> · Review the gold trend and relative strength at month-end.</li>
        <li><strong>June 2027</strong> · Recheck the same signals at month-end and compare them with January.</li>
      </ul>
      <p className={styles.muted}>The month-end reviews are dashboard checkpoints. Source-specific targets are unverified.</p>
    </section>
    <details>
      <summary>Data and calculation notes</summary>
      <p>Yahoo Finance daily history. Gold and silver use front-month COMEX futures (GC=F and SI=F), which can differ from spot and can be affected by contract rolls. Ratios pair observations on the same local trading date. Current-day and incomplete weekly bars are excluded. A reading seven days old or older is marked stale and its signals are unavailable.</p>
      <p><a href="https://goldmanstarch.com/">Goldman Starch analysis</a> · <a href="https://finance.yahoo.com/">Yahoo Finance</a></p>
    </details>
  </main>;
}
