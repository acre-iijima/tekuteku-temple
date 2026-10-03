// ニュースの帯（見出しは GitHub Actions が30分ごとに news.json に集めてくる）
(function () {
  const CACHE_KEY = 'tekuteku-news-v1';
  let data = null;
  try { data = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { /* なし */ }
  let lastTry = 0;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (id) => document.getElementById(id);

  function ago(iso) {
    if (!iso) return '';
    const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (min < 60) return `${Math.max(1, min)}分前`;
    if (min < 24 * 60) return `${Math.round(min / 60)}時間前`;
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  // 帯：経済 → 主なニュース → 国際 を交互にならべて流す
  function renderTicker() {
    const band = $('newsBand');
    const items = data && data.items ? data.items : [];
    const stage = document.getElementById('stage');
    if (!items.length) { band.hidden = true; stage.classList.remove('has-news'); return; }
    stage.classList.add('has-news');
    const byCat = ['経済', '主なニュース', '国際'].map((c) => items.filter((x) => x.cat === c));
    const order = [];
    for (let i = 0; order.length < Math.min(items.length, 15); i++) {
      let added = false;
      byCat.forEach((list) => { if (list[i] && order.length < 15) { order.push(list[i]); added = true; } });
      if (!added) break;
    }
    const html = order.map((x) => `<span class="nt-item"><b class="nt-cat c-${esc(x.cat)}">${esc(x.cat === '主なニュース' ? '主な' : x.cat)}</b>${esc(x.title)}</span>`).join('');
    const track = $('newsTrack');
    track.innerHTML = `<span class="nt-run">${html}</span><span class="nt-run" aria-hidden="true">${html}</span>`;
    // 文字の量に合わせて、ゆっくり一定の速さで流す
    const chars = order.reduce((a, x) => a + x.title.length + 4, 0);
    track.style.animationDuration = Math.max(30, chars * 0.32) + 's';
    band.hidden = false;
  }

  function renderList() {
    const items = data && data.items ? data.items : [];
    $('newsList').innerHTML = ['経済', '主なニュース', '国際'].map((cat) => {
      const list = items.filter((x) => x.cat === cat);
      if (!list.length) return '';
      return `<h3 class="nl-head c-${esc(cat)}">${esc(cat)}</h3>` + list.map((x) =>
        `<a class="nl-item" href="${esc(x.link)}" target="_blank" rel="noopener">` +
        `<span class="nl-title">${esc(x.title)}</span>` +
        `<span class="nl-meta">${esc(x.source)}${x.time ? '・' + ago(x.time) : ''}</span></a>`).join('');
    }).join('');
    const u = data && data.updatedAt ? new Date(data.updatedAt) : null;
    $('newsNote').textContent = data && data.sample
      ? 'おためし用の見出しです（本物のニュースは、公開したアプリで出ます）'
      : u ? `${u.getMonth() + 1}月${u.getDate()}日 ${u.getHours()}:${String(u.getMinutes()).padStart(2, '0')} に集めた見出しです。押すと記事が開きます` : '';
  }

  function refresh(force) {
    if (!force && Date.now() - lastTry < 10 * 60 * 1000) return;
    lastTry = Date.now();
    fetch('news.json?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((json) => {
        if (!json.items || !json.items.length) return; // まだ集まっていないときは前のまま
        data = json;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* 保存できなくても動く */ }
        renderTicker();
      })
      .catch(() => { /* 電波がないときは、前の見出しのまま */ });
  }

  window.News = {
    init() {
      renderTicker();
      refresh(true);
      $('newsBand').addEventListener('click', () => { renderList(); $('newsSheet').hidden = false; });
      setInterval(() => refresh(), 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    },
    // おためし用
    fake(items) { data = { sample: true, updatedAt: new Date().toISOString(), items }; renderTicker(); },
    get: () => data,
  };
})();
