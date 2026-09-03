import { config } from "../../config.js";
import mock from "../../data/mockNews.json" with { type: "json" };

/**
 * Live via GNews (https://gnews.io) — free tier: 100 requests/day,
 * non-commercial use. Sign up, put the key in NEWS_API_KEY.
 * Returns RAW articles (no impact/interpretation fields) — the AI engine
 * fills those in (see routes/news.js).
 */
export async function fetchRawNews() {
  const { apiKey } = config.providers.news;
  if (!apiKey) return mock; // mock already has AI fields baked in, for demo mode

  try {
    const q = encodeURIComponent("markets OR economy OR inflation OR central bank OR earnings OR commodities");
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&sortby=publishedAt&apikey=${apiKey}`
    );
    const json = await res.json();
    if (!Array.isArray(json.articles) || json.articles.length === 0) return mock;

    return json.articles.map((a) => ({
      headline: a.title,
      country: a.source?.name || "Unknown",
      time: new Date(a.publishedAt).toISOString().slice(11, 16) + " UTC",
      source: a.source?.name || "GNews",
      category: "Market News",
      assets: [], // the AI engine infers affected assets from the headline itself
      url: a.url,
    }));
  } catch {
    return mock;
  }
}
