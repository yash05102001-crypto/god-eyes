import { config } from "../../config.js";
import mock from "../../data/mockMarkets.json" with { type: "json" };

// Gold/Silver trade as forex-style pairs (XAU/USD, XAG/USD) and are
// available on Twelve Data's free Basic plan. Crude oil, natural gas,
// copper, and aluminium are commodities-endpoint symbols that need a paid
// plan — those rows fall back to demo data on a free key.
const METALS = [
  { symbol: "XAU/USD", name: "Gold", unit: "USD/oz" },
  { symbol: "XAG/USD", name: "Silver", unit: "USD/oz" },
];

export async function fetchCommodities() {
  const { apiKey } = config.providers.commodities;
  if (!apiKey) return mock.commodities;

  try {
    const symbols = METALS.map((m) => m.symbol).join(",");
    const res = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`);
    const json = await res.json();
    const entries = METALS.length > 1 ? Object.values(json) : [json];

    const live = METALS.map((meta) => {
      const hit = entries.find((e) => e && e.symbol === meta.symbol && !e.code);
      if (!hit) {
        const m = mock.commodities.find((c) => c.name === meta.name);
        return m || null;
      }
      return { name: meta.name, unit: meta.unit, value: Number(hit.close), changePct: Number(hit.percent_change) };
    }).filter(Boolean);

    const coveredNames = new Set(live.map((c) => c.name));
    const remainder = mock.commodities.filter((c) => !coveredNames.has(c.name));
    return [...live, ...remainder];
  } catch {
    return mock.commodities;
  }
}
