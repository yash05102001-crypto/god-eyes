import { config } from "../../config.js";
import mock from "../../data/mockMarkets.json" with { type: "json" };

const PAIRS = ["USD/EUR","EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","USD/INR","USD/CNY"];
const LABELS = { "EUR/USD":"EUR/USD","GBP/USD":"GBP/USD","USD/JPY":"USD/JPY","USD/CHF":"USD/CHF",
  "AUD/USD":"AUD/USD","USD/CAD":"USD/CAD","USD/INR":"USD/INR","USD/CNY":"USD/CNY" };

/**
 * Live via Twelve Data (https://twelvedata.com) — forex is included on the
 * free Basic plan (800 requests/day). Sign up, put the key in
 * FX_API_KEY (same key as STOCKS_API_KEY works — it's one account).
 */
export async function fetchCurrencies() {
  const { apiKey } = config.providers.fx;
  if (!apiKey) return mock.currencies;

  try {
    const symbols = Object.keys(LABELS).join(",");
    const res = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`);
    const json = await res.json();
    // Twelve Data returns one object per symbol when multiple symbols are requested.
    const entries = symbols.split(",").length > 1 ? Object.values(json) : [json];
    const out = entries
      .filter((e) => e && e.symbol && !e.code)
      .map((e) => ({
        pair: e.symbol,
        value: Number(e.close),
        changePct: Number(e.percent_change),
      }));
    return out.length ? out : mock.currencies;
  } catch {
    return mock.currencies; // network hiccup or bad key — fail soft to demo data
  }
}
