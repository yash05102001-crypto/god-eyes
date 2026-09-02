import { Router } from "express";
import NodeCache from "node-cache";
import { config } from "../config.js";
import { scanOpportunities } from "../services/aiEngine.js";
import { getSnapshot } from "../services/snapshotHelper.js";
import { fetchRawNews } from "../services/providers/newsProvider.js";

const router = Router();
const cache = new NodeCache({ stdTTL: config.cache.marketTtl });

router.get("/", async (_req, res) => {
  try {
    const hit = cache.get("opportunities");
    if (hit) return res.json(hit);

    const [snapshot, news] = await Promise.all([getSnapshot(), fetchRawNews()]);
    const opportunities = await scanOpportunities(snapshot, news);
    cache.set("opportunities", opportunities);
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
