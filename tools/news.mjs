// ニュースの見出しを集めて news.json に書き出す（GitHub Actions で30分ごとに動く）
// 見出しと記事へのリンクだけを使う。スポーツは入れない。
import { readFile, writeFile } from 'node:fs/promises';

// NHK の古いRSS（www3.nhk.or.jp/rss）は更新が止まっていたので使わない。NHK の記事は Google ニュース経由で入る
const FEEDS = [
  { cat: '経済', source: 'Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss/topics/business.xml' },
  { cat: '経済', source: 'Google ニュース', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ja&gl=JP&ceid=JP:ja' },
  { cat: '主なニュース', source: 'Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml' },
  { cat: '主なニュース', source: 'Google ニュース', url: 'https://news.google.com/rss/headlines/section/topic/NATION?hl=ja&gl=JP&ceid=JP:ja' },
  { cat: '国際', source: 'Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss/topics/world.xml' },
  { cat: '国際', source: 'Google ニュース', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=ja&gl=JP&ceid=JP:ja' },
];
const PER_CAT = 12;
const MAX_AGE_MS = 2 * 24 * 3600 * 1000; // 2日より古い見出しは出さない
// スポーツの新聞社・球団名（Google ニュースの経済にまざることがある）
const SPORTS_SOURCE = /スポーツ|スポニチ|サンスポ|報知|デイリー|ホークス|ジャイアンツ|タイガース|カープ|ドラゴンズ|スワローズ|ベイスターズ|ファイターズ|イーグルス|マリーンズ|ライオンズ|バファローズ|Number|ゲキサカ|ベースボール|サッカーキング|Full-Count|THE DIGEST/i;
// 主なニュースにまぎれこむスポーツの見出しをはじく
const SPORTS = /野球|サッカー|大谷|ドジャース|五輪|オリンピック|パラリンピック|Jリーグ|J1|J2|大相撲|横綱|大関|ゴルフ|テニス|ラグビー|バスケ|Bリーグ|フィギュア|スケート|マラソン|駅伝|競馬|競輪|甲子園|ワールドカップ|W杯|プロ野球|メジャー|MLB|NBA|NFL|F1|ボクシング|卓球|バレーボール|柔道|水泳|陸上|選手|代表戦|移籍|優勝|決勝|準決勝|開幕戦|本塁打|ホームラン/;

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&')
  .replace(/<[^>]+>/g, '').trim();
const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
};

function parse(xml, feed) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || [];
  return blocks.map((b) => {
    let title = tag(b, 'title');
    let link = tag(b, 'link') || (b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const date = tag(b, 'pubDate') || tag(b, 'updated') || tag(b, 'dc:date');
    let source = feed.source;
    // Google ニュースは「見出し - 新聞社名」の形なので分ける
    if (feed.source === 'Google ニュース') {
      const m = title.match(/^(.*) - ([^-]+)$/);
      if (m) { title = m[1].trim(); source = m[2].trim(); }
    }
    const t = Date.parse(date);
    return { cat: feed.cat, title, link: link.trim(), source, time: isNaN(t) ? null : new Date(t).toISOString() };
  }).filter((x) => x.title && /^https?:\/\//.test(x.link));
}

const results = await Promise.all(FEEDS.map(async (feed) => {
  try {
    const res = await fetch(feed.url, { headers: { 'user-agent': 'tekuteku-temple-news/1.0' }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const items = parse(await res.text(), feed);
    console.log(`ok   ${feed.cat} ${feed.source}: ${items.length}件`);
    return items;
  } catch (e) {
    console.log(`fail ${feed.cat} ${feed.source}: ${e.message}`);
    return [];
  }
}));

const seen = new Set();
const items = [];
for (const cat of ['経済', '主なニュース', '国際']) {
  const list = results.flat()
    .filter((x) => x.cat === cat && !SPORTS_SOURCE.test(x.source) && (cat === '経済' || !SPORTS.test(x.title)))
    .filter((x) => !x.time || Date.now() - Date.parse(x.time) < MAX_AGE_MS)
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  let n = 0;
  for (const x of list) {
    const key = x.title.replace(/\s/g, '').slice(0, 18);
    if (seen.has(key) || n >= PER_CAT) continue;
    seen.add(key); items.push(x); n++;
  }
}

if (!items.length) {
  // ひとつも取れなかったときは、前のニュースをそのまま残す
  console.log('ニュースが取れなかったので、news.json は変えません');
  process.exit(0);
}
let old = null;
try { old = JSON.parse(await readFile('news.json', 'utf8')); } catch (e) { /* はじめて */ }
if (old && JSON.stringify(old.items) === JSON.stringify(items)) {
  console.log('変わりなし');
  process.exit(0);
}
await writeFile('news.json', JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 1) + '\n');
console.log(`news.json を書きました（${items.length}件）`);
