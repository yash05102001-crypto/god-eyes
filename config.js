import "dotenv/config";

export const config = {
  port: process.env.PORT || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  providers: {
    stocks: { apiKey: process.env.STOCKS_API_KEY || "", baseUrl: process.env.STOCKS_API_BASE_URL || "" },
    bonds: { apiKey: process.env.BONDS_API_KEY || "", baseUrl: process.env.BONDS_API_BASE_URL || "" },
    fx: { apiKey: process.env.FX_API_KEY || "", baseUrl: process.env.FX_API_BASE_URL || "" },
    commodities: { apiKey: process.env.COMMODITIES_API_KEY || "", baseUrl: process.env.COMMODITIES_API_BASE_URL || "" },
    crypto: { apiKey: process.env.CRYPTO_API_KEY || "", baseUrl: process.env.CRYPTO_API_BASE_URL || "" },
    news: { apiKey: process.env.NEWS_API_KEY || "", baseUrl: process.env.NEWS_API_BASE_URL || "" },
  },
  cache: {
    marketTtl: Number(process.env.MARKET_CACHE_TTL || 60),
    newsTtl: Number(process.env.NEWS_CACHE_TTL || 120),
  },
};
