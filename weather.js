// 中野区の天気（Open-Meteo：無料・登録不要）
// 取れなかったときは、最後に取れた天気を使う。
(function () {
  const PLACE = { name: '中野区', lat: 35.7074, lon: 139.6638 };
  const CACHE_KEY = 'tekuteku-weather-v1';
  const FRESH_MS = 30 * 60 * 1000; // 30分以内なら取り直さない
  const URL =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${PLACE.lat}&longitude=${PLACE.lon}` +
    '&current=temperature_2m,weather_code,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=Asia%2FTokyo&forecast_days=7';

  // 天気コード（WMO）を、絵とことばの種類にまとめる
  function kindOf(code) {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2) return 'partly';
    if (code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'thunder';
    return 'cloudy';
  }
  const LABEL = { clear: '晴れ', partly: '晴れときどきくもり', cloudy: 'くもり', fog: 'きり', rain: '雨', snow: '雪', thunder: 'かみなり' };
  const SHORT = { clear: '晴れ', partly: '晴れ曇り', cloudy: 'くもり', fog: 'きり', rain: '雨', snow: '雪', thunder: 'かみなり' };

  // ポップな線画アイコン
  const sun = (cx, cy, r) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffd94a" stroke="#2b2b2b" stroke-width="2.5"/>` +
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const t = (a * Math.PI) / 180;
      return `<path d="M${(cx + Math.cos(t) * (r + 3)).toFixed(1)} ${(cy + Math.sin(t) * (r + 3)).toFixed(1)} L${(cx + Math.cos(t) * (r + 7)).toFixed(1)} ${(cy + Math.sin(t) * (r + 7)).toFixed(1)}" stroke="#2b2b2b" stroke-width="2.5" stroke-linecap="round"/>`;
    }).join('');
  const cloud = (x, y, fill = '#ffffff') =>
    `<path d="M${x} ${y} h22 a7 7 0 0 0 0 -14 a10 10 0 0 0 -19 -3 a7 7 0 0 0 -3 17 Z" fill="${fill}" stroke="#2b2b2b" stroke-width="2.5" stroke-linejoin="round"/>`;
  function icon(kind, size = 30) {
    let g = '';
    if (kind === 'clear') g = sun(20, 20, 8);
    else if (kind === 'partly') g = sun(15, 15, 7) + cloud(12, 32);
    else if (kind === 'cloudy' || kind === 'fog') g = cloud(9, 28, kind === 'fog' ? '#e6e8ef' : '#ffffff') + (kind === 'fog' ? '<path d="M6 33 h28 M10 37 h20" stroke="#2b2b2b" stroke-width="2.2" stroke-linecap="round"/>' : '');
    else if (kind === 'rain') g = cloud(9, 24, '#cfe8ff') + '<path d="M14 29 l-2 6 M21 29 l-2 6 M28 29 l-2 6" stroke="#3c8de0" stroke-width="2.5" stroke-linecap="round"/>';
    else if (kind === 'snow') g = cloud(9, 24) + '<g fill="#2b2b2b"><circle cx="13" cy="32" r="2"/><circle cx="20" cy="35" r="2"/><circle cx="27" cy="32" r="2"/></g>';
    else if (kind === 'thunder') g = cloud(9, 22, '#e3e0ef') + '<path d="M21 24 l-5 8 h5 l-3 7 l8 -10 h-5 l3 -5 Z" fill="#ffd94a" stroke="#2b2b2b" stroke-width="1.8" stroke-linejoin="round"/>';
    return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">${g}</svg>`;
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* 保存できなくても動く */ }
  }

  // Open-Meteo の返事を、アプリで使う形にする
  function shape(json) {
    const d = json.daily;
    return {
      fetchedAt: Date.now(),
      current: {
        temp: Math.round(json.current.temperature_2m),
        kind: kindOf(json.current.weather_code),
      },
      days: d.time.map((date, i) => ({
        date,
        kind: kindOf(d.weather_code[i]),
        max: Math.round(d.temperature_2m_max[i]),
        min: Math.round(d.temperature_2m_min[i]),
        pop: d.precipitation_probability_max[i],
      })),
    };
  }

  let data = readCache();
  let lastTry = 0;

  window.Weather = {
    place: PLACE.name,
    LABEL, SHORT, icon,
    get: () => data,
    // 新しい天気を取りにいく。取れたら onUpdate を呼ぶ
    refresh(onUpdate, force) {
      if (!force && data && !data.sample && Date.now() - data.fetchedAt < FRESH_MS) return;
      if (!force && Date.now() - lastTry < 5 * 60 * 1000) return; // 取れないときに何度も取りにいかない
      lastTry = Date.now();
      fetch(URL)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((json) => { data = shape(json); writeCache(data); onUpdate && onUpdate(data); })
        .catch(() => { /* 電波がないときなどは、前の天気のまま */ });
    },
    // おためし用：天気を差しかえる
    fake(kind) {
      const today = new Date();
      const kinds = [kind, 'clear', 'partly', 'rain', 'cloudy', 'clear', 'snow'];
      data = {
        fetchedAt: Date.now(),
        sample: true,
        current: { temp: kind === 'snow' ? 1 : kind === 'clear' ? 24 : 17, kind },
        days: kinds.map((k, i) => {
          const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
          const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
          return { date: iso, kind: k, max: 22 - i, min: 14 - i, pop: k === 'rain' || k === 'thunder' ? 80 : k === 'snow' ? 60 : 10 };
        }),
      };
      return data;
    },
  };
})();
