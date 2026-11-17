type Bar = { day: string; close: number; volume: number | null };

const symbols = ["GC=F", "SI=F", "GLD", "SPY", "DX-Y.NYB", "^GSPC", "BTC-USD", "GDX", "SILJ"] as const;
type Symbol = (typeof symbols)[number];

function positive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

async function history(symbol: Symbol): Promise<Bar[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5y&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 900 }, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) return [];
    const { chart } = await response.json();
    const result = chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    if (!Array.isArray(result?.timestamp) || !Array.isArray(quote?.close)) return [];
    const timezone = result.meta?.exchangeTimezoneName || "UTC";
    const dayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: timezone });
    const currentDay = dayFormat.format(new Date());
    return result.timestamp.flatMap((timestamp: number, index: number) => {
      const close = quote.close[index];
      if (!positive(timestamp) || !positive(close)) return [];
      const day = dayFormat.format(timestamp * 1000);
      // Today's provider bar can still be in progress.
      return day < currentDay ? [{ day, close, volume: positive(quote.volume?.[index]) ? quote.volume[index] : null }] : [];
    }).sort((left: Bar, right: Bar) => left.day.localeCompare(right.day));
  } catch {
    return [];
  }
}

function ratio(numerator: Bar[], denominator: Bar[]): Bar[] {
  const closes = new Map(denominator.map(bar => [bar.day, bar.close]));
  return numerator.flatMap(bar => {
    const close = closes.get(bar.day);
    return close !== undefined ? [{ ...bar, close: bar.close / close }] : [];
  });
}

function weekEnding(day: string) {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + (7 - date.getUTCDay()) % 7);
  return date.toISOString().slice(0, 10);
}

function average(values: number[], count: number): number | null {
  return values.length < count ? null : values.slice(-count).reduce((sum, value) => sum + value, 0) / count;
}

function fresh(day?: string) {
  return day !== undefined && Date.now() - Date.parse(day) < 7 * 86_400_000;
}

function classify(value: number | null, baseline: number | null, direction: number, positive: string, negative: string) {
  if (value === null || baseline === null) return "Unavailable";
  const change = (value - baseline) * direction;
  return change > 0 ? positive : change < 0 ? negative : "Neutral";
}

export async function getIndicators() {
  const data = await Promise.all(symbols.map(history));
  const [gold, silver, gld, spy, dollar, stocks, bitcoin, gdx, silj] = data;
  const currentWeek = weekEnding(new Date().toISOString().slice(0, 10));
  const weekCloses = new Map<string, number>();
  for (const bar of gold) {
    const week = weekEnding(bar.day);
    if (week < currentWeek) weekCloses.set(week, bar.close);
  }
  const weekly = [...weekCloses.values()];
  const indicators = [
    ...[20, 50, 100].map(count => ({
      name: `Gold · ${count}-week average`, bars: gold, baseline: average(weekly, count),
      prior: average(weekly.slice(0, -1), count), direction: 1, unit: "USD/oz",
      rule: "Gold above the average is bullish. A rising weekly average is improving.",
    })),
    ...[
      { name: "GLD / SPY", bars: ratio(gld, spy), direction: 1, unit: "ratio" },
      { name: "Gold / silver", bars: ratio(gold, silver), direction: -1, unit: "ratio" },
      { name: "U.S. Dollar Index (DXY)", bars: dollar, direction: -1, unit: "index points" },
      { name: "S&P 500", bars: stocks, direction: 1, unit: "index points" },
      { name: "BTC / gold", bars: ratio(bitcoin, gold), direction: -1, unit: "oz/BTC" },
      { name: "GDX / GLD", bars: ratio(gdx, gld), direction: 1, unit: "ratio" },
      { name: "SILJ / GLD", bars: ratio(silj, gld), direction: 1, unit: "ratio" },
    ].map(item => ({
      ...item, baseline: average(item.bars.map(bar => bar.close), 50),
      prior: item.bars.at(-6)?.close ?? null,
      rule: `${item.direction > 0 ? "Above" : "Below"} its 50-session average is bullish. A ${item.direction > 0 ? "rise" : "fall"} over five sessions is improving.`,
    })),
  ].map(({ bars, baseline, prior, direction, ...indicator }) => {
    const last = bars.at(-1);
    const value = last?.close ?? null;
    const available = fresh(last?.day);
    const movingAverage = indicator.unit === "USD/oz";
    return {
      ...indicator, value, baseline, day: last?.day, stale: !!last && !available,
      status: classify(available ? value : null, baseline, direction, "Bullish", "Bearish"),
      momentum: classify(available ? (movingAverage ? baseline : value) : null, prior, direction, "Improving", "Deteriorating"),
    };
  });

  const latest = gld.at(-1);
  const previous = gld.at(-2);
  const volumeSample = gld.slice(-21, -1).flatMap(bar => bar.volume ?? []);
  const baseline = average(volumeSample, 20);
  const value = latest?.volume ?? null;
  const available = fresh(latest?.day);
  const direction = Math.sign((latest?.close ?? 0) - (previous?.close ?? 0));
  const status = available && value !== null && baseline !== null && previous
    ? value > baseline && direction ? (direction > 0 ? "Bullish" : "Bearish") : "Neutral"
    : "Unavailable";
  return [...indicators, {
    name: "GLD volume", value, baseline, unit: "shares", day: latest?.day, stale: !!latest && !available,
    status,
    momentum: classify(available && previous ? value : null, previous?.volume ?? null, direction, "Improving", "Deteriorating"),
    rule: "Above-average volume confirms the direction of GLD’s close. Rising volume on an up day or falling volume on a down day is improving.",
  }];
}
