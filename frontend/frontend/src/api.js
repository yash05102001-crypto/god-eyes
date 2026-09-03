const BASE = import.meta.env.VITE_API_BASE || "/api";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  snapshot: () => get("/markets/snapshot"),
  news: () => get("/news"),
  opportunities: () => get("/opportunities"),
  chat: async (messages, lang) => {
    const res = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, lang }),
    });
    if (!res.ok) throw new Error(`chat failed: ${res.status}`);
    return res.json();
  },
};
