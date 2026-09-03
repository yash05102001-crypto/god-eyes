# GOD EYES

*"See the world. Understand the market."*

A private, personal global-markets research dashboard. Tracks global stocks, bonds,
currencies, commodities, and crypto; runs an AI impact engine over incoming news;
scans for cross-market opportunities; and answers questions in English or Marathi.

**This app never connects to a broker, never stores broker credentials, and never
places or executes trades.** It is research/analysis only.

## Easiest path (recommended — one host, no coding, no computer)

This skips Termux, Netlify, and separate frontend/backend hosting entirely.
One free host (Render) builds and runs the whole thing.

1. **Get 3 keys** (all free except Anthropic, which is cheap for personal use):
   `console.anthropic.com` → `twelvedata.com` → `gnews.io/register`
2. **github.com** → sign up → **New repository** → upload every file/folder
   from this project (drag the whole extracted folder in, or use "uploading
   an existing file") → Commit.
3. **render.com** → sign up with GitHub → **New → Web Service** → pick your
   repo. Render auto-detects Node; leave Build Command as `npm run build`
   and Start Command as `npm start` (these come from the root
   `package.json`, which builds the frontend and starts the backend
   together).
4. In the **Environment** tab, add: `ANTHROPIC_API_KEY`, `STOCKS_API_KEY`,
   `FX_API_KEY`, `COMMODITIES_API_KEY` (same Twelve Data key for all three),
   `NEWS_API_KEY`.
5. **Deploy.** After a few minutes you get one URL, e.g.
   `https://god-eyes.onrender.com` — open it. The whole app (frontend +
   live data + live AI) is right there.
6. On your phone, open that URL in Chrome → ⋮ menu → **Add to Home
   screen**. You now have a real app icon that opens full-screen — no APK
   build step needed.
7. **(Optional) Want an actual `.apk` file instead of a home-screen
   shortcut?** Open **pwabuilder.com**, paste your Render URL, choose
   **Android → Generate**, download the `.apk`, install it.

That's it — steps 1–6 are the whole thing if a home-screen app icon is
good enough for you; step 7 is only extra if you specifically need an
installable `.apk` file.

*(Render's free tier sleeps after inactivity and takes ~30–50 seconds to
wake up on the next visit — normal for free hosting, not a bug.)*

## Architecture

```
god-eyes-app/
  backend/     Node/Express API. Holds all API keys server-side. Modular
               provider-per-asset-class design (backend/src/services/providers/).
               Runs the AI impact/opportunity engine via the Anthropic API.
  frontend/    React + Vite dashboard. Talks only to the backend (/api/*),
               never to any market-data or AI provider directly.
```

Data flow: `provider (real API or mock) → cache → route → (AI engine, if news/opportunities) → frontend`.

Every market-data provider (`backend/src/services/providers/*.js`) currently
falls back to demo data in `backend/src/data/*.json` when no API key is
configured, so the app runs out of the box. Each file has a `TODO` marking
exactly where to plug in a real provider — swap the body of the fetch function,
keep the return shape the same, and the rest of the app doesn't need to change.

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — at minimum set ANTHROPIC_API_KEY to enable news analysis,
# the opportunity scanner, and Ask GOD EYES.
npm install
npm run dev
```

Runs on `http://localhost:4000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` to the backend in dev
(see `vite.config.js`). Open it in your browser.

## Adding a real market-data provider

Example — wiring a real FX provider into `backend/src/services/providers/fxProvider.js`:

```js
export async function fetchCurrencies() {
  const { apiKey, baseUrl } = config.providers.fx;
  if (!apiKey || !baseUrl) return mock.currencies;

  const res = await fetch(`${baseUrl}/latest?apikey=${apiKey}`);
  const json = await res.json();
  return json.rates.map(r => ({ pair: r.symbol, value: r.rate, changePct: r.changePct }));
}
```

Set `FX_API_KEY` and `FX_API_BASE_URL` in `.env` and restart the backend —
no frontend changes needed, since the frontend only ever reads the normalized
shape `{ pair, value, changePct }`.

The same pattern applies to `stocksProvider.js`, `bondsProvider.js`,
`commoditiesProvider.js`, `cryptoProvider.js`, and `newsProvider.js`.

Because global equities coverage (USA, India, Japan, China, Hong Kong, UK,
Germany, France, Canada, Australia, South Korea, Taiwan, Singapore, UAE,
Brazil, ...) usually spans more than one data vendor, it's common to end up
with several small fetch functions inside `stocksProvider.js` (one per
exchange/region) that you run in parallel and merge — the route layer and
frontend don't need to know about that internal split.

## Adding more countries / exchanges / asset classes

1. Add the new fetch logic inside the relevant provider (or a new provider file).
2. Keep the return shape consistent with the existing items in that asset class.
3. If it's a wholly new asset class, add a new provider file + route + a new
   nav tab in `frontend/src/App.jsx` following the existing pattern.

Nothing else needs to change — routes, caching, and the AI engine are all
already asset-class agnostic.

## AI Impact Engine & Opportunity Scanner

`backend/src/services/aiEngine.js` calls the Anthropic API (server-side only —
the key never reaches the browser) to:

- turn a raw news item into `{ interpretation, impact, strength, confidence, breakdown, benefited, negativelyAffected }`
- scan the full market snapshot + news set for cross-market opportunities
- power the free-form "Ask GOD EYES" chat

All three are instructed to separate fact from interpretation, use
probabilities/scenarios rather than certainties, and never suggest specific
trades, sizes, or entry/exit timing.

## Privacy

- No social features, no public profiles, no shared data between users.
- Personal data (watchlist, alerts, chat history) is only as private as
  wherever you choose to persist it — this scaffold keeps everything
  in-memory/session-based; add your own auth + per-user storage if you
  deploy this for real use.
- API keys live only in `backend/.env`, which is git-ignored.

## Going fully live (real prices, real news, real AI)

By default every provider falls back to demo data. Here's the actual stack
wired into the code, and exactly what each piece costs:

| Data | Provider | Cost | Coverage on the cheapest tier |
|---|---|---|---|
| AI (news analysis, opportunities, chat) | [Anthropic](https://console.anthropic.com) | Paid, cheap for personal use | Everything |
| Stocks/indices | [Twelve Data](https://twelvedata.com) | Free (800 req/day) | **US indices only.** Non-US indices need their ~$29/mo "Grow" plan |
| Forex (all pairs) | Twelve Data (same key) | Free | All pairs |
| Gold / Silver | Twelve Data (same key) | Free | Both |
| Oil / Gas / Copper / Aluminium | Twelve Data (same key) | Needs paid plan | — stays demo on a free key |
| Crypto (BTC, ETH) | [CoinGecko](https://www.coingecko.com/en/api) | Free, **no key needed** | Both |
| News | [GNews](https://gnews.io/register) | Free (100 req/day, non-commercial) | Global |
| Bond yields | — | No good free global source | See `bondsProvider.js` for the two practical (partial) options |

**To turn most of it on, you only need 3 free signups + 1 paid key:**
1. `console.anthropic.com` → create an API key → `ANTHROPIC_API_KEY`
2. `twelvedata.com` → free signup → same key for `STOCKS_API_KEY`, `FX_API_KEY`, `COMMODITIES_API_KEY`
3. `gnews.io/register` → free signup → `NEWS_API_KEY`
4. Crypto needs nothing — it's already live with zero configuration.

Paste all of those into `backend/.env`, restart the backend, and: forex,
metals, crypto, news, and all AI features go live immediately. US stock
indices go live too; other countries' indices and non-metal commodities
keep showing demo data until you add a paid Twelve Data plan (each
provider file falls back per-row, not all-or-nothing, so the dashboard
still looks complete in the meantime).

Bond yields are the one gap with no clean free fix — `bondsProvider.js`
documents the two realistic options if you want to close it later.

## Building an installable Android APK

The frontend is wired for [Capacitor](https://capacitorjs.com), which wraps
the web app into a real native Android project. Compiling the actual `.apk`
requires **Android Studio on your own machine** (it needs the Android SDK,
Gradle, and a signing step that can't be done from this chat).

```bash
cd frontend
npm install
npm run build              # produces dist/ (the static frontend)
npm run android:add        # generates the android/ native project (first time only)
npm run android:sync       # copies the latest build into the native project
npm run android:open       # opens the project in Android Studio
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. The
resulting `.apk` (in `android/app/build/outputs/apk/`) can be installed on
your phone directly (enable "Install unknown apps" for the transfer method
you use — USB, file share, etc.) — no Play Store needed.

Two things to decide before building:
- **Backend reachability**: your phone needs to reach the backend over the
  network. For local testing, run the backend on your PC and set
  `capacitor.config.ts`'s server config (or `VITE_API_BASE` at build time)
  to your PC's LAN IP, e.g. `http://192.168.1.20:4000`. For real use, deploy
  the backend somewhere reachable from anywhere (a small VPS, Render,
  Railway, etc.) and point the app at that URL instead.
- **App icon / splash screen**: Capacitor ships default placeholders; swap
  them via `npx @capacitor/assets generate` once you have real artwork.

## Alternative: separate frontend/backend hosts (more steps, not recommended unless you need it)

The section below is the longer path — useful if you specifically want the
frontend and backend on different hosts, or want a literal `.apk` built via
Termux instead of PWABuilder. Most people should just use "Easiest path"
above instead.

## Building the APK from an Android phone only (no PC)

This uses **Termux** (a terminal app) to build the site on your phone, a free
host to put it online, and **PWABuilder** to turn that live site into an
`.apk`. The project already includes `frontend/public/manifest.json` and
`frontend/public/sw.js` so it's installable/packageable.

**1. Install Termux** — from F-Droid (recommended) or Play Store.

**2. In Termux, set up the environment:**
```bash
pkg update -y && pkg upgrade -y
pkg install -y nodejs git zip
termux-setup-storage      # allow Termux to see your phone's storage
```

**3. Get the project onto your phone.** Download `god-eyes-app.zip` from
this chat to your phone's Downloads folder, then in Termux:
```bash
cd ~/storage/downloads
unzip god-eyes-app.zip
cd god-eyes-app/frontend
```

**4. Install dependencies and build:**
```bash
npm install
npm run build          # produces the dist/ folder — the finished website
```

**5. Put it online** (Netlify's free tier, deployed straight from Termux —
no browser upload needed):
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```
The first time, it opens a login link in your browser — sign up free, come
back to Termux. It then prints a live URL like
`https://god-eyes-xxxx.netlify.app` — save that.

**6. (Recommended) Put the backend online too**, so news/opportunities/chat
actually work instead of showing demo data only. Easiest free option: deploy
`backend/` to [Render](https://render.com) (connect it to a GitHub repo — you
can push from Termux with `git`, or upload via Render's dashboard from your
phone browser). Set `ANTHROPIC_API_KEY` in Render's environment variables
tab. Once deployed, set `VITE_API_BASE` to that backend's URL before step 4's
build (`VITE_API_BASE=https://your-backend.onrender.com npm run build`), then
redeploy the frontend (step 5) so it points at the live backend.

**7. Turn the live site into an APK:**
- Open **pwabuilder.com** in your phone's browser.
- Paste your Netlify URL (from step 5) and press **Start**.
- Go to the **Android** package option → **Generate**.
- Download the `.apk` it produces.

**8. Install it:**
- Open the downloaded `.apk` from your phone's file manager.
- If asked, allow "install unknown apps" for that app (one-time permission).
- Done — GOD EYES now has a real app icon and opens full-screen like any
  other installed app.

## Roadmap ideas (not built yet)

- Persistent watchlist & alert rules (price thresholds, news keywords, opportunity-score triggers) with push/email notification delivery.
- A scheduled job (cron) to refresh market/news caches instead of relying on request-time fetches.
- Auth, so this can safely be exposed beyond localhost.
- A dedicated `/api/risks` endpoint with its own AI pass, instead of deriving risks from negative-impact news client-side.
