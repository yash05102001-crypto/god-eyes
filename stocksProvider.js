import { config } from "../../config.js";
import mock from "../../data/mockMarkets.json" with { type: "json" };

// Twelve Data symbol per index. NOTE: Twelve Data's free Basic plan only
// covers US markets. Non-US symbols below need a paid "Grow" plan ($29/mo
// at time of writing) — see https://twelvedata.com/pricing.
const SYMBOLS = [
  { symbol: "SPX", name: "S&P 500", country: "USA", exchange: "NYSE/NASDAQ", freeTier: true },
  { symbol: "NDX", name: "Nasdaq 100", country: "USA", exchange: "NASDAQ", freeTier: true },
  { symbol: "NIFTY", name: "Nifty 50", country: "India", exchange: "NSE", freeTier: false },
  { symbol: "SENSEX", name: "Sensex", country: "India", exchange: "BSE", freeTier: false },
  { symbol: "N225", name: "Nikkei 225", country: "Japan", exchange: "TSE", freeTier: false },
  { symbol: "HSI", name: "Hang Seng", country: "Hong Kong", exchange: "HKEX", freeTier: false },
  { symbol: "FTSE", name: "FTSE 100", country: "UK", exchange: "LSE", freeTier: false },
  { symbol: "GDAXI", name: "DAX", country: "Germany", exchange: "XETRA", freeTier: false },
];

/**
 * Live via Twelve Data. Free Basic plan covers US indices only (SPX, NDX
 * here); everything else needs a paid plan. We fetch whichever symbols we
 * can and fall back to demo data for the rest, so the app still runs on
 * a free key — just with partial live coverage.
 */
export async function fetchStocks() {
  const { apiKey } = config.providers.stocks;
  if (!apiKey) return mock.stocks;

  try {
    const symbols = SYMBOLS.map((s) => s.symbol).join(",");
    const res = await fetch(`https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`);
    const json = await res.json();
    const entries = SYMBOLS.length > 1 ? Object.values(json) : [json];

    const live = SYMBOLS.map((meta) => {
      const hit = entries.find((e) => e && e.symbol === meta.symbol && !e.code);
      if (!hit) {
        // no access on this plan / bad symbol — fall back to demo value for this one row
        const m = mock.stocks.find((s) => s.name === meta.name);
        return m || null;
      }
      return {
        name: meta.name, country: meta.country, exchange: meta.exchange,
        value: Number(hit.close), changePct: Number(hit.percent_change),
      };
    }).filter(Boolean);

    // Keep the rest of mock.stocks (exchanges Twelve Data isn't covering above) appended,
    // clearly still demo, so the dashboard doesn't look sparse.
    const coveredNames = new Set(live.map((s) => s.name));
    const remainder = mock.stocks.filter((s) => !coveredNames.has(s.name));
    return [...live, ...remainder];
  } catch {
    return mock.stocks;
  }
}
