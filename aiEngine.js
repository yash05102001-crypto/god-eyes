import { config } from "../config.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.5-flash-lite";

function assertKey() {
  if (!config.geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to backend/.env to enable the AI Impact Engine, " +
      "the Opportunity Scanner, and Ask GOD EYES."
    );
  }
}

async function callGemini({ system, messages, maxTokens = 1200, json = false }) {
  assertKey();
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
  }));
  const body = {
    contents,
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { maxOutputTokens: maxTokens, ...(json ? { responseMimeType: "application/json" } : {}) },
  };
  const res = await fetch(`${GEMINI_URL}/${MODEL}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n").trim();
}

const BASE_RULES = `You are the analysis engine inside GOD EYES, a private personal global-markets research tool.
Hard rules, always:
- Never claim an asset will definitely rise or fall. Use probabilities, scenarios, and named risks.
- Clearly separate FACTS (what is reported) from AI INTERPRETATION (your reasoning).
- You are not a broker. You never recommend placing a specific trade, sizing a position, or timing an entry/exit. You surface research angles only.
- Ground your reasoning in the data provided in the prompt. If something is outside that data, say so plainly rather than inventing figures.`;

/**
 * GLOBAL EVENT → AI ANALYSIS → MARKET/SECTOR/ASSET IMPACT → OPPORTUNITY/RISK
 * Takes one raw news item + a snapshot of current market data, returns the
 * enriched fields the UI expects (interpretation, impact, strength, confidence)
 * plus a structured impact breakdown across currencies/inflation/bonds/stocks/
 * sectors/commodities/crypto.
 */
export async function analyzeNewsImpact(newsItem, marketSnapshot) {
  const system = `${BASE_RULES}
Return ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "interpretation": string,
  "impact": "positive" | "negative" | "neutral",
  "strength": "low" | "medium" | "high",
  "confidence": number,
  "assets": [string],
  "breakdown": {
    "currencies": string,
    "inflation": string,
    "bonds": string,
    "stocks": string,
    "sectors": string,
    "commodities": string,
    "crypto": string
  },
  "benefited": [string],
  "negativelyAffected": [string]
}`;

  const user = `News item:\n${JSON.stringify(newsItem, null, 2)}\n\nCurrent market snapshot (for grounding):\n${JSON.stringify(marketSnapshot, null, 2)}\n\nIf the news item's "assets" field is empty, infer the 3-5 most relevant assets/asset-classes yourself for the "assets" output field.`;

  const text = await callGemini({ system, messages: [{ role: "user", content: user }], json: true });
  return JSON.parse(text);
}

/**
 * Scans the provided market snapshot + news set for potential opportunities
 * across all asset classes, and returns them in the shape the UI expects.
 */
export async function scanOpportunities(marketSnapshot, newsItems) {
  const system = `${BASE_RULES}
Scan across ALL provided asset classes and countries — do not focus on a single stock or sector.
Return ONLY a valid JSON array, no markdown fences, no preamble. Each element must match exactly:
{
  "asset": string, "country": string, "market": string,
  "price": string, "move": string,
  "reason": string, "news": string,
  "fundamentals": string, "technicals": string,
  "risk": "low" | "medium" | "high",
  "horizon": "shortTerm" | "mediumTerm" | "longTerm",
  "oppScore": number, "confidence": number,
  "invalidate": string
}
Return at most 8 opportunities, ranked by oppScore descending.`;

  const user = `Market snapshot:\n${JSON.stringify(marketSnapshot, null, 2)}\n\nRecent news:\n${JSON.stringify(newsItems, null, 2)}`;

  const text = await callGemini({ system, messages: [{ role: "user", content: user }], maxTokens: 2000, json: true });
  return JSON.parse(text);
}

/**
 * Free-form chat for the "Ask GOD EYES" panel. Keeps the API key server-side.
 */
export async function chat(history, lang, marketSnapshot) {
  const system = `${BASE_RULES}
Reply in ${lang === "mr" ? "Marathi" : "English"} unless the user explicitly asks for another language.
Style: concise, professional, terminal-like.
Context snapshot (for grounding; not guaranteed to be live):
${JSON.stringify(marketSnapshot, null, 2)}`;

  return callGemini({ system, messages: history, maxTokens: 1000 });
}
