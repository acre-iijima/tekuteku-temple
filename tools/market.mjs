// 為替・株価指数・金・原油の値を集めて market.json に書き出す（GitHub Actions でニュースと一緒に動く）
// 取り先：Yahoo! Finance のチャート（登録不要）。取れなかったときは Stooq を使う。
// どちらも取れなかった項目は、前に取れた値をそのまま残す。
import { readFile, writeFile } from 'node:fs/promises';

// main: true の項目は、ホームのカードにも出す（ほかは押したあとの詳細だけ）
const ITEMS = [
  { id: 'usdjpy', name: 'ドル円', group: '為替', unit: '円', digits: 2, main: true, yahoo: 'USDJPY=X', stooq: 'usdjpy' },
  { id: 'eurjpy', name: 'ユーロ円', group: '為替', unit: '円', digits: 2, main: true, yahoo: 'EURJPY=X', stooq: 'eurjpy' },
  { id: 'gbpjpy', name: 'ポンド円', group: '為替', unit: '円', digits: 2, yahoo: 'GBPJPY=X', stooq: 'gbpjpy' },
  { id: 'audjpy', name: '豪ドル円', group: '為替', unit: '円', digits: 2, main: true, yahoo: 'AUDJPY=X', stooq: 'audjpy' },
  { id: 'tryjpy', name: 'トルコリラ円', short: 'リラ円', group: '為替', unit: '円', digits: 3, main: true, yahoo: 'TRYJPY=X', stooq: 'tryjpy' },
  { id: 'eurusd', name: 'ユーロドル', group: '為替', unit: 'ドル', digits: 4, yahoo: 'EURUSD=X', stooq: 'eurusd' },
  { id: 'n225', name: '日経平均', short: '日経', group: '株価', unit: '円', digits: 0, main: true, yahoo: '^N225', stooq: '^nkx' },
  { id: 'dji', name: 'NYダウ', short: 'ダウ', group: '株価', unit: 'ドル', digits: 0, main: true, yahoo: '^DJI', stooq: '^dji' },
  { id: 'spx', name: 'S&P500', group: '株価', unit: '', digits: 0, main: true, yahoo: '^GSPC', stooq: '^spx' },
  { id: 'ixic', name: 'ナスダック総合', short: 'NASDAQ', group: '株価', unit: '', digits: 0, main: true, yahoo: '^IXIC', stooq: '^ndq' },
  { id: 'gold', name: '金（1グラム）', short: '金', group: '商品・金利', unit: '円', digits: 0, main: true, yahoo: 'GC=F', stooq: 'xauusd', perGramYen: true },
  { id: 'oil', name: '原油（WTI・1バレル）', short: '原油', group: '商品・金利', unit: 'ドル', digits: 2, main: true, yahoo: 'CL=F', stooq: 'cl.f' },
  { id: 'us10y', name: '米国10年金利', short: '米10年', group: '商品・金利', unit: '%', digits: 3, main: true, yahoo: '^TNX', stooq: '10usy.b' },
  { id: 'btcjpy', name: 'ビットコイン', short: 'BTC', group: '商品・金利', unit: '円', digits: 0, main: true, yahoo: 'BTC-JPY', stooq: 'btcjpy' },
];
const UA = { 'user-agent': 'Mozilla/5.0 (tekuteku-temple market)' };

async function fromYahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`;
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error('Yahoo HTTP ' + res.status);
  const r = (await res.json()).chart.result[0];
  const m = r.meta;
  const closes = r.indicators.quote[0].close;
  const history = r.timestamp.map((t, i) => [new Date(t * 1000).toISOString().slice(0, 10), closes[i]]).filter((x) => x[1] != null);
  const q = r.indicators.quote[0];
  const last = r.timestamp.length - 1;
  // 前日の終値：最後の足が今日の足なら、そのひとつ前
  const today = new Date(m.regularMarketTime * 1000).toISOString().slice(0, 10);
  const tail = history.at(-1);
  const prev = tail && tail[0] === today ? history.at(-2)?.[1] : tail?.[1];
  return {
    price: m.regularMarketPrice, prev,
    high: m.regularMarketDayHigh ?? q.high[last], low: m.regularMarketDayLow ?? q.low[last],
    time: new Date(m.regularMarketTime * 1000).toISOString(),
    history,
  };
}

function csv(text) {
  const [head, ...rows] = text.trim().split(/\r?\n/);
  const keys = head.split(',');
  return rows.map((r) => Object.fromEntries(r.split(',').map((v, i) => [keys[i], v])));
}
async function fromStooq(sym) {
  const d = (t) => t.toISOString().slice(0, 10).replace(/-/g, '');
  const now = new Date(), from = new Date(Date.now() - 40 * 864e5);
  const res = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d&d1=${d(from)}&d2=${d(now)}`, { headers: UA, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error('Stooq HTTP ' + res.status);
  const rows = csv(await res.text()).filter((r) => r.Close && !isNaN(+r.Close));
  if (rows.length < 2) throw new Error('Stooq データなし');
  const last = rows[rows.length - 1];
  return {
    price: +last.Close, prev: +rows[rows.length - 2].Close, high: +last.High, low: +last.Low,
    time: new Date(last.Date + 'T00:00:00Z').toISOString(),
    history: rows.map((r) => [r.Date, +r.Close]),
  };
}

async function get(item) {
  try { return { ...(await fromYahoo(item.yahoo)), source: 'Yahoo! Finance' }; } catch (e) { console.log(`  ${item.name}: ${e.message} → Stooq へ`); }
  return { ...(await fromStooq(item.stooq)), source: 'Stooq' };
}

let old = {};
try { for (const x of JSON.parse(await readFile('market.json', 'utf8')).items) old[x.id] = x; } catch (e) { /* はじめて */ }

const raw = {};
await Promise.all(ITEMS.map(async (item) => {
  try { raw[item.id] = await get(item); console.log(`ok   ${item.name}: ${raw[item.id].price}`); }
  catch (e) { console.log(`fail ${item.name}: ${e.message}`); }
}));

// 金は「1オンスのドル」を、ドル円で「1グラムの円」に直す
const OZ = 31.1035;
const usd = raw.usdjpy;
if (raw.gold && usd) {
  const rate = usd.price;
  const conv = (v) => (v == null ? v : (v * rate) / OZ);
  const byDate = Object.fromEntries(usd.history);
  raw.gold = {
    ...raw.gold,
    price: conv(raw.gold.price), prev: raw.gold.prev == null ? null : (raw.gold.prev * (usd.prev || rate)) / OZ,
    high: conv(raw.gold.high), low: conv(raw.gold.low),
    history: raw.gold.history.map(([d, v]) => [d, (v * (byDate[d] || rate)) / OZ]),
  };
} else if (raw.gold) delete raw.gold; // ドル円が取れないと円に直せない

const round = (v, n) => (v == null || isNaN(v) ? null : Math.round(v * 10 ** n) / 10 ** n);
const items = ITEMS.map((item) => {
  const r = raw[item.id];
  if (!r) return old[item.id] ? { ...old[item.id], stale: true } : null;
  const n = item.digits;
  return {
    id: item.id, name: item.name, short: item.short || item.name, group: item.group, unit: item.unit, digits: n, main: !!item.main,
    price: round(r.price, n), prev: round(r.prev, n), high: round(r.high, n), low: round(r.low, n),
    time: r.time, source: r.source,
    history: r.history.slice(-23).map(([d, v]) => [d, round(v, n)]),
  };
}).filter(Boolean);

if (!items.length) { console.log('何も取れなかったので market.json は変えません'); process.exit(0); }
if (!Object.keys(raw).length) { console.log('新しい値がないので market.json は変えません'); process.exit(0); }
await writeFile('market.json', JSON.stringify({ updatedAt: new Date().toISOString(), items }) + '\n');
console.log(`market.json を書きました（${items.length}項目）`);
