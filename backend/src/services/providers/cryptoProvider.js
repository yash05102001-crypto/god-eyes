import mock from "../../data/mockMarkets.json" with { type: "json" };

const IDS = { bitcoin: "Bitcoin", ethereum: "Ethereum" };

/**
 * Live via CoinGecko's free public API — no key required at all.
 * https://www.coingecko.com/en/api/documentation
 */
export async function fetchCrypto() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
    );
    const json = await res.json();
    if (!json.bitcoin || !json.ethereum) return mock.crypto;

    const totalMcap = (json.bitcoin.usd_market_cap || 0) + (json.ethereum.usd_market_cap || 0);
    return [
      { name: "Bitcoin", symbol: "BTC", value: json.bitcoin.usd, changePct: json.bitcoin.usd_24h_change },
      { name: "Ethereum", symbol: "ETH", value: json.ethereum.usd, changePct: json.ethereum.usd_24h_change },
      // NOTE: this is just BTC+ETH combined, not the true total crypto market cap
      // (that needs the /global endpoint) — swap in api.coingecko.com/api/v3/global
      // if you want the real figure.
      { name: "BTC + ETH Combined Market Cap", symbol: "TOTAL", value: totalMcap, changePct: 0 },
    ];
  } catch {
    return mock.crypto;
  }
}
