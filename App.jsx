import React, { useEffect, useRef, useState } from "react";
import {
  Eye, TrendingUp, TrendingDown, Landmark, Coins, Flame, Newspaper,
  Target, AlertTriangle, Bell, MessageCircle, Sun, Moon, Languages,
  Minus, Send, Loader2, Info
} from "lucide-react";
import { T } from "./i18n.js";
import { api } from "./api.js";

/* ---------- small presentational helpers ---------- */
function Chg({ v }) {
  const up = v > 0, flat = v === 0;
  const cls = flat ? "text-[var(--muted)]" : up ? "text-[var(--pos)]" : "text-[var(--neg)]";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-sm ${cls}`}>
      <Icon size={13} strokeWidth={2.5} />{up ? "+" : ""}{Number(v).toFixed(2)}%
    </span>
  );
}

function Tile({ label, value, chg }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3 flex flex-col gap-1 min-w-[150px]">
      <span className="text-[11px] uppercase tracking-wide text-[var(--muted)] font-mono">{label}</span>
      <span className="font-display text-lg text-[var(--text)]">{value}</span>
      <Chg v={chg} />
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className="text-[var(--accent)]" strokeWidth={2.2} />
      <h2 className="font-display text-sm tracking-wide uppercase text-[var(--text)]">{title}</h2>
    </div>
  );
}

function ImpactBadge({ impact, L }) {
  const map = { positive: { c: "var(--pos)", t: L.positive }, negative: { c: "var(--neg)", t: L.negative }, neutral: { c: "var(--muted)", t: L.neutral } };
  const m = map[impact] || map.neutral;
  return <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border" style={{ color: m.c, borderColor: m.c }}>{m.t}</span>;
}

function StrengthBadge({ strength, L }) {
  const map = { low: L.low, medium: L.medium, high: L.high };
  const colors = { low: "var(--muted)", medium: "var(--accent)", high: "var(--neg)" };
  return <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border" style={{ color: colors[strength], borderColor: colors[strength] }}>{map[strength] || strength}</span>;
}

function Loading({ text }) {
  return <div className="flex items-center gap-2 text-[13px] font-mono text-[var(--muted)] py-6"><Loader2 size={14} className="animate-spin" />{text}</div>;
}

function ErrorBox({ text }) {
  return <div className="text-[13px] font-mono text-[var(--neg)] border border-[var(--neg)]/40 rounded-lg p-4">{text}</div>;
}

function NewsCard({ item, L }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[15px] leading-snug text-[var(--text)]">{item.headline}</h3>
        <ImpactBadge impact={item.impact} L={L} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-[var(--muted)]">
        <span>{item.country}</span><span>·</span><span>{item.time}</span><span>·</span><span>{item.source}</span><span>·</span><span>{item.category}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {(item.assets || []).map((a) => (
          <span key={a} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--panel-alt)] text-[var(--text)] border border-[var(--border)]">{a}</span>
        ))}
      </div>
      <p className="text-[13px] text-[var(--muted)] leading-relaxed mt-1">{item.interpretation}</p>
      <div className="flex items-center gap-3 mt-1">
        <StrengthBadge strength={item.strength} L={L} />
        <span className="text-[11px] font-mono text-[var(--muted)]">{L.confidence}: {item.confidence}%</span>
      </div>
    </div>
  );
}

function OppCard({ o, L }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] text-[var(--text)]">{o.asset}</h3>
          <span className="text-[11px] font-mono text-[var(--muted)]">{o.country} · {o.market}</span>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm text-[var(--text)]">{o.price}</div>
          <div className="font-mono text-xs text-[var(--accent)]">{o.move}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="rounded border border-[var(--border)] px-2 py-1"><span className="text-[var(--muted)]">{L.oppScore}: </span><span className="text-[var(--text)]">{o.oppScore}/100</span></div>
        <div className="rounded border border-[var(--border)] px-2 py-1"><span className="text-[var(--muted)]">{L.confidence}: </span><span className="text-[var(--text)]">{o.confidence}%</span></div>
        <div className="rounded border border-[var(--border)] px-2 py-1"><span className="text-[var(--muted)]">{L.riskLevel}: </span><StrengthBadge strength={o.risk} L={L} /></div>
        <div className="rounded border border-[var(--border)] px-2 py-1"><span className="text-[var(--muted)]">{L.horizon}: </span><span className="text-[var(--text)]">{L[o.horizon]}</span></div>
      </div>
      <div className="space-y-1.5 text-[13px] text-[var(--muted)] leading-relaxed">
        <p><span className="text-[var(--text)] font-semibold">{L.why} </span>{o.reason}</p>
        <p><span className="text-[var(--text)] font-semibold">{L.risk} </span>{o.invalidate}</p>
        <p><span className="text-[var(--text)] font-semibold">{L.dataUsed} </span>{o.news}; {o.fundamentals}; {o.technicals}</p>
        <p><span className="text-[var(--text)] font-semibold">{L.whatChange} </span>{o.invalidate}</p>
      </div>
    </div>
  );
}

/* ---------- chat (routes through the backend, never touches the API key) ---------- */
function Chat({ lang, L }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const data = await api.chat(next, lang);
      setMessages((m) => [...m, { role: "assistant", content: data.content || data.error || "…" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠ Could not reach the backend. Is it running?" }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col h-[70vh] max-h-[640px] rounded-lg border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--muted)] leading-relaxed">{L.chat.intro}</p>
            <div className="flex flex-wrap gap-2">
              {L.chat.suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-[12px] font-mono px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-left">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-[var(--accent)] text-[var(--void)] font-medium" : "bg-[var(--panel-alt)] text-[var(--text)] border border-[var(--border)]"}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-[12px] font-mono text-[var(--muted)]"><Loader2 size={13} className="animate-spin" />{L.chat.thinking}</div>}
        <div ref={endRef} />
      </div>
      <div className="border-t border-[var(--border)] p-3 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={L.chat.placeholder}
          className="flex-1 bg-[var(--panel-alt)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
        <button onClick={() => send()} disabled={loading} className="rounded-md bg-[var(--accent)] text-[var(--void)] p-2 disabled:opacity-50"><Send size={16} /></button>
      </div>
      <div className="px-3 pb-2 text-[10px] font-mono text-[var(--muted)] flex items-center gap-1"><Info size={11} />{L.chat.disclaimer}</div>
    </div>
  );
}

function EyeLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 60 60" className="shrink-0">
      <defs><radialGradient id="iris" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="var(--accent)" /><stop offset="100%" stopColor="var(--accent-dim)" /></radialGradient></defs>
      <path d="M4 30 C 14 12, 46 12, 56 30 C 46 48, 14 48, 4 30 Z" fill="none" stroke="var(--accent)" strokeWidth="2.2" />
      <circle cx="30" cy="30" r="10" fill="url(#iris)" /><circle cx="30" cy="30" r="4" fill="var(--void)" />
      <circle cx="30" cy="30" r="15" fill="none" stroke="var(--accent)" strokeWidth="0.6" opacity="0.5">
        <animate attributeName="r" values="15;20;15" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ---------- main app ---------- */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("en");
  const [section, setSection] = useState("home");
  const L = T[lang];

  const [snapshot, setSnapshot] = useState(null);
  const [news, setNews] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.snapshot().then(setSnapshot).catch((e) => setErr(e.message));
    api.news().then(setNews).catch((e) => setErr(e.message));
    api.opportunities().then(setOpportunities).catch((e) => setErr(e.message));
  }, []);

  const risks = (news || []).filter((n) => n.impact === "negative");

  const navItems = [
    ["home", L.nav.home, Eye], ["stocks", L.nav.stocks, TrendingUp], ["bonds", L.nav.bonds, Landmark],
    ["currency", L.nav.currency, Coins], ["commodities", L.nav.commodities, Flame], ["crypto", L.nav.crypto, Coins],
    ["news", L.nav.news, Newspaper], ["opportunities", L.nav.opportunities, Target], ["risks", L.nav.risks, AlertTriangle],
    ["alerts", L.nav.alerts, Bell], ["chat", L.nav.chat, MessageCircle],
  ];

  const vars = theme === "dark"
    ? { "--void": "#0A0B10", "--panel": "#12151C", "--panel-alt": "#181C26", "--border": "#242A36", "--text": "#E9EAEE", "--muted": "#8B92A3", "--accent": "#D4A94D", "--accent-dim": "#8A6E2E", "--pos": "#3ED7A0", "--neg": "#E8635F" }
    : { "--void": "#F5F4EF", "--panel": "#FFFFFF", "--panel-alt": "#F0EEE7", "--border": "#DEDBD2", "--text": "#1B1C20", "--muted": "#6B6E78", "--accent": "#A8791F", "--accent-dim": "#D4A94D", "--pos": "#1E9E71", "--neg": "#C6413C" };

  const IndicesTiles = () => (snapshot ? snapshot.stocks.map((i) => <Tile key={i.name} label={`${i.name} · ${i.country}`} value={i.value} chg={i.changePct} />) : null);
  const CurrencyTiles = () => (snapshot ? snapshot.currencies.map((c) => <Tile key={c.pair} label={c.pair} value={c.value} chg={c.changePct} />) : null);
  const CommodityTiles = () => (snapshot ? snapshot.commodities.map((c) => <Tile key={c.name} label={c.name} value={c.value} chg={c.changePct} />) : null);
  const YieldTiles = () => (snapshot ? snapshot.bonds.map((y) => <Tile key={y.name} label={y.name} value={`${y.yieldPct}%`} chg={y.changeBps / 100} />) : null);
  const CryptoTiles = () => (snapshot ? snapshot.crypto.map((c) => <Tile key={c.name} label={c.name} value={typeof c.value === "number" && c.value > 1e6 ? `$${(c.value / 1e12).toFixed(2)}T` : `$${c.value}`} chg={c.changePct} />) : null);

  return (
    <div style={vars} className="min-h-screen w-full bg-[var(--void)] text-[var(--text)] font-body">
      <header className="border-b border-[var(--border)] sticky top-0 z-20 bg-[var(--void)]/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <EyeLogo />
            <div className="leading-tight">
              <div className="font-display text-lg tracking-wide">GOD EYES</div>
              <div className="text-[11px] text-[var(--muted)] font-mono">{L.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "en" ? "mr" : "en")} className="flex items-center gap-1.5 text-[12px] font-mono px-2.5 py-1.5 rounded border border-[var(--border)] hover:border-[var(--accent)] transition-colors"><Languages size={13} />{lang === "en" ? "EN" : "मर"}</button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center gap-1.5 text-[12px] font-mono px-2.5 py-1.5 rounded border border-[var(--border)] hover:border-[var(--accent)] transition-colors">{theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}</button>
          </div>
        </div>
        <nav className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {navItems.map(([key, label, Icon]) => (
            <button key={key} onClick={() => setSection(key)} className={`flex items-center gap-1.5 whitespace-nowrap text-[12px] font-mono px-3 py-1.5 rounded-md transition-colors ${section === key ? "bg-[var(--accent)] text-[var(--void)]" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-alt)]"}`}><Icon size={13} />{label}</button>
          ))}
        </nav>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-8">
        {err && <ErrorBox text={`${L.error} (${err})`} />}

        {section === "home" && (
          <>
            <section><SectionHeader icon={TrendingUp} title={L.home.indices} />
              {!snapshot ? <Loading text={L.loading} /> : <div className="flex gap-2 overflow-x-auto pb-1"><IndicesTiles /></div>}
            </section>
            <div className="grid md:grid-cols-3 gap-6">
              <section><SectionHeader icon={Coins} title={L.home.currencies} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid grid-cols-2 gap-2"><CurrencyTiles /></div>}</section>
              <section><SectionHeader icon={Flame} title={L.home.commodities} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid grid-cols-2 gap-2"><CommodityTiles /></div>}</section>
              <section><SectionHeader icon={Landmark} title={L.home.yields} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid grid-cols-2 gap-2"><YieldTiles /></div>}</section>
            </div>
            <section><SectionHeader icon={Coins} title={L.home.crypto} />{!snapshot ? <Loading text={L.loading} /> : <div className="flex gap-2 overflow-x-auto pb-1"><CryptoTiles /></div>}</section>
            <section><SectionHeader icon={Newspaper} title={L.home.breaking} />
              {!news ? <Loading text={L.loading} /> : <div className="grid md:grid-cols-2 gap-3">{news.slice(0, 4).map((n, i) => <NewsCard key={i} item={n} L={L.labels} />)}</div>}
            </section>
            <section><SectionHeader icon={Target} title={L.home.oppsDetected} />
              {!opportunities ? <Loading text={L.loading} /> : <div className="grid md:grid-cols-2 gap-3">{opportunities.slice(0, 2).map((o, i) => <OppCard key={i} o={o} L={L.labels} />)}</div>}
            </section>
            <section><SectionHeader icon={AlertTriangle} title={L.home.risksDetected} />
              {!news ? <Loading text={L.loading} /> : <div className="grid md:grid-cols-2 gap-3">{risks.slice(0, 4).map((n, i) => <NewsCard key={i} item={n} L={L.labels} />)}</div>}
            </section>
          </>
        )}

        {section === "stocks" && <section><SectionHeader icon={TrendingUp} title={L.nav.stocks} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2"><IndicesTiles /></div>}</section>}
        {section === "bonds" && <section><SectionHeader icon={Landmark} title={L.nav.bonds} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2"><YieldTiles /></div>}</section>}
        {section === "currency" && <section><SectionHeader icon={Coins} title={L.nav.currency} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2"><CurrencyTiles /></div>}</section>}
        {section === "commodities" && <section><SectionHeader icon={Flame} title={L.nav.commodities} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2"><CommodityTiles /></div>}</section>}
        {section === "crypto" && <section><SectionHeader icon={Coins} title={L.nav.crypto} />{!snapshot ? <Loading text={L.loading} /> : <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2"><CryptoTiles /></div>}</section>}
        {section === "news" && <section><SectionHeader icon={Newspaper} title={L.nav.news} />{!news ? <Loading text={L.loading} /> : <div className="grid md:grid-cols-2 gap-3">{news.map((n, i) => <NewsCard key={i} item={n} L={L.labels} />)}</div>}</section>}
        {section === "opportunities" && <section><SectionHeader icon={Target} title={L.nav.opportunities} />{!opportunities ? <Loading text={L.loading} /> : <div className="grid md:grid-cols-2 gap-3">{opportunities.map((o, i) => <OppCard key={i} o={o} L={L.labels} />)}</div>}</section>}
        {section === "risks" && <section><SectionHeader icon={AlertTriangle} title={L.nav.risks} />{!news ? <Loading text={L.loading} /> : <div className="grid md:grid-cols-2 gap-3">{risks.map((n, i) => <NewsCard key={i} item={n} L={L.labels} />)}</div>}</section>}
        {section === "alerts" && (
          <section><SectionHeader icon={Bell} title={L.nav.alerts} />
            <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-[13px] text-[var(--muted)]">
              {lang === "en" ? "No alerts configured yet. Wire this panel to a rules table (price thresholds, news keywords, opportunity-score triggers) in the backend." : "अद्याप कोणतेही अलर्ट सेट केलेले नाहीत. हे पॅनेल बॅकएंडमधील नियम सारणीशी जोडा."}
            </div>
          </section>
        )}
        {section === "chat" && <section><SectionHeader icon={MessageCircle} title={L.nav.chat} /><Chat lang={lang} L={L} /></section>}
      </main>

      <footer className="border-t border-[var(--border)] px-4 py-4 text-center text-[11px] font-mono text-[var(--muted)]">{L.footer}</footer>
    </div>
  );
}
