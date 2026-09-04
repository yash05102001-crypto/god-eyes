import { Router } from "express";
import NodeCache from "node-cache";
import { config } from "../config.js";
import { fetchRawNews } from "../services/providers/newsProvider.js";
import { analyzeNewsImpact } from "../services/aiEngine.js";
import { getSnapshot } from "../services/snapshotHelper.js";

const router = Router();
const cache = new NodeCache({ stdTTL: config.cache.newsTtl });

router.get("/", async (_req, res) => {
  try {
    const hit = cache.get("news");
    if (hit) return res.json(hit);

    const raw = await fetchRawNews();

    // If items already carry AI fields (demo mode) return as-is.
    if (Array.isArray(raw) && raw[0] && "interpretation" in raw[0]) {
      cache.set("news", raw);
      return res.json(raw);
    }

    // Otherwise run each item through the AI Impact Engine.
    const snapshot = await getSnapshot();
    const enriched = await Promise.all(
      raw.map(async (item) => {
        try {
          const analysis = await analyzeNewsImpact(item, snapshot);
          return { ...item, ...analysis };
        } catch {
          return { ...item, interpretation: "Analysis unavailable.", impact: "neutral", strength: "low", confidence: 0 };
        }
      })
    );
    cache.set("news", enriched);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
