// マーケットのウィジェット（値は GitHub Actions が market.json に集めてくる）
(function () {
  const CACHE_KEY = 'tekuteku-market-v1';
  let data = null;
  try { data = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { /* なし */ }
  let lastTry = 0;
  const $ = (id) => document.getElementById(id);

  const fmt = (v, n) => (v == null ? '—' : v.toLocaleString('ja-JP', { minimumFractionDigits: n, maximumFractionDigits: n }));
  function change(x) {
    if (x.price == null || x.prev == null) return { cls: 'flat', arrow: '', diff: '', pct: '' };
    const d = x.price - x.prev;
    const cls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
    return {
      cls, arrow: d > 0 ? '▲' : d < 0 ? '▼' : '―',
      diff: fmt(Math.abs(d), x.digits), pct: `${d >= 0 ? '+' : '−'}${Math.abs((d / x.prev) * 100).toFixed(2)}%`,
    };
  }
  // ホームのカードでは、大きい数は「万」で短く
  const short = (x) => (x.price != null && x.price >= 1e6 ? `${fmt(x.price / 1e4, 0)}万` : fmt(x.price, x.digits));
  function when(iso) {
    if (!iso) return '';
    const t = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${t.getMonth() + 1}/${t.getDate()} ${p(t.getHours())}:${p(t.getMinutes())}`;
  }
  // 1か月の動き（小さな折れ線）
  function spark(hist, cls, w = 120, h = 36) {
    const v = (hist || []).map((x) => x[1]).filter((x) => x != null);
    if (v.length < 2) return '';
    const min = Math.min(...v), max = Math.max(...v), r = max - min || 1;
    const pts = v.map((y, i) => `${((i / (v.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 3 - ((y - min) / r) * (h - 6)).toFixed(1)}`).join(' ');
    return `<svg class="spark ${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  }

  const GROUPS = ['為替', '株価', '商品・金利'];
  let openGroup = '為替';

  // ホームのカード：分類ごとの枠。押すと、その分類の詳細が出る
  function renderWidget() {
    const card = $('marketCard');
    const items = data && data.items ? data.items : [];
    if (!items.length) { card.hidden = true; return; }
    $('marketGroups').innerHTML = GROUPS.map((g) => {
      const list = items.filter((x) => x.group === g);
      const shown = (list.some((x) => x.main) ? list.filter((x) => x.main) : list).slice(0, 4);
      if (!shown.length) return '';
      return `<button class="mg-box" data-group="${g}" aria-label="${g}のくわしい値をひらく">` +
        `<span class="mg-head">${g}<span class="mg-more">くわしく ›</span></span><span class="mt-grid">` +
        shown.map((x) => {
          const c = change(x);
          return `<span class="mt-tile ${c.cls}"><span class="mt-name">${x.short}</span>` +
            `<b class="mt-price">${short(x)}</b>` +
            `<span class="mt-chg">${c.arrow}${c.pct.replace(/^[+−]/, '')}</span></span>`;
        }).join('') + '</span></button>';
    }).join('');
    $('marketTime').textContent = data.sample ? 'おためし' : when(data.updatedAt);
    card.hidden = false;
  }

  function renderDetail() {
    const items = data && data.items ? data.items : [];
    $('marketTitle').textContent = openGroup;
    $('marketList').innerHTML = items.filter((x) => x.group === openGroup).map((x) => {
      const c = change(x);
      return `<div class="ml-row ${c.cls}">` +
        `<div class="ml-left"><span class="ml-name">${x.name}</span>` +
        `<b class="ml-price">${fmt(x.price, x.digits)}<small>${x.unit}</small></b>` +
        `<span class="ml-chg">${c.arrow} ${c.diff}（${c.pct}）</span></div>` +
        `<div class="ml-right">${spark(x.history, c.cls)}<span class="ml-sub">1か月の動き</span>` +
        `<span class="ml-sub">高 ${fmt(x.high, x.digits)}・安 ${fmt(x.low, x.digits)}</span>` +
        `<span class="ml-sub">${when(x.time)}${x.stale ? '（前回の値）' : ''}</span></div></div>`;
    }).join('');
    const notes = {
      '為替': '前日比は、前の日の終値とくらべています。',
      '株価': '前日比は、前の日の終値とくらべています。値は15〜20分ほど遅れることがあります。',
      '商品・金利': '金は海外の値を1グラムの円に直したもので、お店の値段とは少しちがいます。米国10年金利は、アメリカの長い期間の金利で、為替や株の動きの目安になります。',
    };
    $('marketNote').textContent = (data && data.sample
      ? 'おためし用の数字です（本物の値は、公開したアプリで出ます）。'
      : `${when(data.updatedAt)} に集めた値です。`) + (notes[openGroup] || '');
  }

  function refresh(force) {
    if (!force && Date.now() - lastTry < 10 * 60 * 1000) return;
    lastTry = Date.now();
    fetch('market.json?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((json) => {
        if (!json.items || !json.items.length) return;
        data = json;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* 保存できなくても動く */ }
        renderWidget();
      })
      .catch(() => { /* 電波がないときは、前の値のまま */ });
  }

  window.Market = {
    init() {
      renderWidget();
      refresh(true);
      $('marketCard').addEventListener('click', (e) => {
        const box = e.target.closest('.mg-box');
        if (!box) return;
        openGroup = box.dataset.group;
        renderDetail();
        $('marketSheet').hidden = false;
      });
      setInterval(() => refresh(), 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    },
    fake(json) { data = { sample: true, ...json }; renderWidget(); },
    get: () => data,
  };
})();
