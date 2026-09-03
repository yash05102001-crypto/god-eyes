import { fetchStocks } from "./providers/stocksProvider.js";
import { fetchBonds } from "./providers/bondsProvider.js";
import { fetchCurrencies } from "./providers/fxProvider.js";
import { fetchCommodities } from "./providers/commoditiesProvider.js";
import { fetchCrypto } from "./providers/cryptoProvider.js";

// Shared helper so routes don't duplicate the "gather everything" logic.
export async function getSnapshot() {
  const [stocks, bonds, currencies, commodities, crypto] = await Promise.all([
    fetchStocks(), fetchBonds(), fetchCurrencies(), fetchCommodities(), fetchCrypto(),
  ]);
  return { stocks, bonds, currencies, commodities, crypto };
}
