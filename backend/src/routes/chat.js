import { Router } from "express";
import { chat } from "../services/aiEngine.js";
import { getSnapshot } from "../services/snapshotHelper.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { messages, lang } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages[] is required" });
    }
    const snapshot = await getSnapshot();
    const reply = await chat(messages, lang || "en", snapshot);
    res.json({ role: "assistant", content: reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
