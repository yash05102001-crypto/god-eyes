import { Router } from "express";
import NodeCache from "node-cache";
import { config } from "../config.js";
import { fetchStocks } from "../services/providers/stocksProvider.js";
import { fetchBonds } from "../services/providers/bondsProvider.js";
import { fetchCurrencies } from "../services/providers/fxProvider.js";
import { fetchCommodities } from "../services/providers/commoditiesProvider.js";
import { fetchCrypto } from "../services/providers/cryptoProvider.js";

const router = Router();
const cache = new NodeCache({ stdTTL: config.cache.marketTtl });

async function cached(key, fn) {
  const hit = cache.get(key);
  if (hit) return hit;
  const value = await fn();
  cache.set(key, value);
  return value;
}

router.get("/stocks", async (_req, res) => res.json(await cached("stocks", fetchStocks)));
router.get("/bonds", async (_req, res) => res.json(await cached("bonds", fetchBonds)));
router.get("/currencies", async (_req, res) => res.json(await cached("currencies", fetchCurrencies)));
router.get("/commodities", async (_req, res) => res.json(await cached("commodities", fetchCommodities)));
router.get("/crypto", async (_req, res) => res.json(await cached("crypto", fetchCrypto)));

// One combined snapshot — used by the AI engine and the frontend home screen.
router.get("/snapshot", async (_req, res) => {
  const [stocks, bonds, currencies, commodities, crypto] = await Promise.all([
    cached("stocks", fetchStocks),
    cached("bonds", fetchBonds),
    cached("currencies", fetchCurrencies),
    cached("commodities", fetchCommodities),
    cached("crypto", fetchCrypto),
  ]);
  res.json({ stocks, bonds, currencies, commodities, crypto });
});

export default router;
