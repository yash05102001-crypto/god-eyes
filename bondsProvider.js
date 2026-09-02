import { config } from "../../config.js";
import mock from "../../data/mockMarkets.json" with { type: "json" };

/**
 * Bonds are the hardest asset class here to get live for free: there is no
 * single provider offering real-time sovereign yields across many countries
 * without a paid plan. Two practical options if you want this live too:
 *
 *   1. US only, genuinely free, no key: the St. Louis Fed's FRED API
 *      (https://fred.stlouisfed.org/docs/api/fred/) has the US 10Y series
 *      (DGS10). Good for one row; doesn't cover the other countries below.
 *   2. Global coverage: Twelve Data's paid plans include some government
 *      bond/yield symbols — check their symbol search for your markets.
 *
 * Until you wire one of those in, this stays demo data — normalize whatever
 * you add to { name, country, yieldPct, changeBps }.
 */
export async function fetchBonds() {
  const { apiKey, baseUrl } = config.providers.bonds;
  if (!apiKey || !baseUrl) return mock.bonds;

  // const res = await fetch(`${baseUrl}/yields?apikey=${apiKey}`);
  // return normalize(await res.json());

  return mock.bonds;
}
