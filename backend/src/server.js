import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import marketsRouter from "./routes/markets.js";
import newsRouter from "./routes/news.js";
import opportunitiesRouter from "./routes/opportunities.js";
import chatRouter from "./routes/chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "GOD EYES backend" }));

app.use("/api/markets", marketsRouter);
app.use("/api/news", newsRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/chat", chatRouter);

// Serve the built frontend (frontend/dist) if it exists, so ONE deployment
// (e.g. a single Render web service) can host both the API and the app —
// no separate frontend host needed. Falls back to index.html for any
// non-/api route so client-side routing still works.
const distPath = path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  console.log("Serving frontend from", distPath);
} else {
  console.log("No frontend/dist found — running API-only (run `npm run build` at the repo root to include the frontend).");
}

app.listen(config.port, () => {
  console.log(`GOD EYES backend listening on http://localhost:${config.port}`);
  if (!config.geminiApiKey) {
    console.warn("⚠ GEMINI_API_KEY not set — AI features (news analysis, opportunities, chat) will error until it is.");
  }
});
