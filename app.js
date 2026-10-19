(function () {
  const STORE_KEY = 'tekuteku-temple-v1';
  const STRIDE_M = 0.7; // 1歩あたりの距離（m）
  const M = window.Messages;
  const $ = (id) => document.getElementById(id);

  // ---------- 保存 ----------
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE_KEY));
      if (d && d.days) return { settings: {}, ...d };
    } catch (e) { /* 読めなくても動く */ }
    return { settings: {}, days: {} };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 保存できなくても動く */ }
  }
  const state = load();

  // ---------- 日付 ----------
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  const WD = ['日', '月', '火', '水', '木', '金', '土'];

  function timeOfDay(h) {
    if (h >= 4 && h < 6) return 'dawn';
    if (h >= 6 && h < 10) return 'morning';
    if (h >= 10 && h < 16) return 'day';
    if (h >= 16 && h < 19) return 'evening';
    if (h >= 19 && h < 23) return 'night';
    return 'late';
  }
  function seasonOf(month) {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
  const SEASON_LABEL = { spring: '✿ 春', summer: '☀︎ 夏', autumn: '◆ 秋', winter: '❄︎ 冬' };

  // ---------- 言葉えらび ----------
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // その日のうちは同じ言葉のまま。さらに、この7日間に出た言葉はなるべく避ける。
  const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
  function pickFresh(pool, slot, today) {
    state.used = state.used || {};
    state.picked = state.picked || {};
    const key = today + '|' + slot;
    if (state.picked[key] && pool.includes(state.picked[key])) return state.picked[key];
    const fresh = pool.filter((t) => !state.used[t] || daysBetween(state.used[t], today) >= 7);
    const list = fresh.length ? fresh : pool;
    const text = list[hash(key) % list.length];
    state.used[text] = today;
    state.picked[key] = text;
    // 古い記録はかたづける
    Object.keys(state.picked).forEach((k) => { if (!k.startsWith(today)) delete state.picked[k]; });
    Object.keys(state.used).forEach((t) => { if (daysBetween(state.used[t], today) > 14) delete state.used[t]; });
    save();
    return text;
  }

  const catName = () => (state.settings.catName || '').trim() || 'てんぷる';
  const km = (steps) => (steps * STRIDE_M / 1000);
  const fmtKm = (v) => (v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1));

  function fill(text, vars) {
    return text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
  }

  function stepsBand(steps) {
    if (steps == null) return 'none';
    if (steps < 2000) return 'rest';
    if (steps < 5000) return 'light';
    if (steps < 8000) return 'good';
    if (steps < 12000) return 'great';
    if (steps < 20000) return 'super';
    return 'legend';
  }

  function isBirthday(date) {
    const b = state.settings.catBirthday; // YYYY-MM-DD
    return !!b && b.slice(5) === ymd(date).slice(5);
  }

  function todayInfo(now) {
    const holiday = JpCalendar.holiday(now);
    const event = JpCalendar.event(now);
    const season = seasonOf(now.getMonth() + 1);
    return { holiday, event, season, tod: timeOfDay(now.getHours()), birthday: isBirthday(now), weather: todayWeather(now) };
  }

  // ---------- 天気 ----------
  // 今日の天気。最後に取れた天気から、今日のぶんを探す（電波がなくても前の天気で）
  function todayWeather(now) {
    const data = window.Weather && Weather.get();
    if (!data || !data.days) return null;
    const today = ymd(now);
    const day = data.days.find((d) => d.date === today);
    if (!day) return null;
    const fresh = ymd(new Date(data.fetchedAt)) === today && Date.now() - data.fetchedAt < 3 * 3600 * 1000;
    // 取れたばかりなら「いま」の天気、古ければその日の予報を使う
    const kind = fresh ? data.current.kind : day.kind;
    return { kind, dayKind: day.kind, temp: fresh ? data.current.temp : null, max: day.max, min: day.min, pop: day.pop };
  }

  // ひとことに使う天気の種類
  function weatherKey(w) {
    if (!w) return null;
    // ひとことは一日の予報で決める（途中で天気が変わっても、言うことがころころ変わらないように）
    const k = w.dayKind;
    if (['rain', 'snow', 'thunder', 'fog'].includes(k)) return k;
    if (w.max >= 30) return 'hot';
    if (w.max <= 8) return 'cold';
    return k === 'cloudy' ? 'cloudy' : 'clear';
  }

  // 今週（月曜〜今日）の記録
  function weekInfo(now) {
    const list = [];
    const mondayOffset = (now.getDay() + 6) % 7;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset + i);
      list.push({ date: d, steps: state.days[ymd(d)] });
    }
    const recorded = list.filter((x) => x.steps != null);
    const total = recorded.reduce((a, x) => a + x.steps, 0);
    return { list, days: recorded.length, wkm: fmtKm(km(total)) };
  }

  function buildMessage(now, info, steps) {
    const today = ymd(now);
    const week = weekInfo(now);
    const vars = {
      steps: steps != null ? steps.toLocaleString() : '',
      km: steps != null ? fmtKm(km(steps)) : '',
      name: catName(),
      holiday: info.holiday,
      days: week.days,
      wkm: week.wkm,
    };
    let first;
    if (info.birthday) first = pickFresh(M.birthday, 'birthday', today);
    else if (info.holiday) first = pickFresh(M.holidayByName[info.holiday] || M.holiday, 'holiday', today);
    else if (info.event && M.event[info.event]) first = pickFresh(M.event[info.event], 'event', today);
    else if (now.getDay() === 0 && (info.tod === 'evening' || info.tod === 'night')) {
      first = pickFresh(week.days ? M.review : M.reviewNone, 'review', today);
    } else {
      // 時間帯・季節・曜日のどれかから。時間帯がいちばん多めに出る
      const pools = [M.greet[info.tod], M.greet[info.tod], M.season[now.getMonth() + 1], M.weekday[now.getDay()]];
      // シュールなひとことも、ときどき
      if (M.surreal && M.surreal.length) pools.push(M.surreal, M.surreal);
      // 雨や雪、暑い寒いの日は、天気の話が出やすい
      const wk = weatherKey(info.weather);
      if (wk && M.weather && M.weather[wk]) {
        pools.push(M.weather[wk]);
        if (!['clear', 'cloudy'].includes(wk)) pools.push(M.weather[wk], M.weather[wk]);
      }
      const which = hash(today + info.tod) % pools.length;
      first = pickFresh(pools[which], 'first-' + info.tod, today);
    }
    const band = stepsBand(steps);
    const second = pickFresh(M.steps[band], 'steps-' + band, today);
    return fill(first, vars) + '\n' + fill(second, vars);
  }

  // ---------- ポーズと小物 ----------
  function poseFor(info, steps, now = new Date()) {
    // 時間帯ごとのポーズから、その時間帯のあいだは同じものを出す
    const list = (window.DayPoses && DayPoses[info.tod]) || [];
    let pose = list.length ? list[hash(ymd(now) + info.tod + 'pose') % list.length] : null;
    if (!pose || !Poses[pose]) {
      if (info.tod === 'dawn' || info.tod === 'morning') pose = 'stretch';
      else if (info.tod === 'evening') pose = 'back';
      else if (info.tod === 'night' || info.tod === 'late') pose = 'loaf';
      else pose = 'sit';
    }
    // よく歩いた日のお昼は、横向きで立つ
    if (pose === 'sit' && steps >= 8000) pose = 'stand';
    return pose;
  }

  function propsFor(now) {
    const md = (now.getMonth() + 1) * 100 + now.getDate();
    const list = [];
    if (md >= 1018 && md <= 1031) list.push('witch');
    else if (md >= 1218 && md <= 1225) list.push('santa');
    else if (md >= 715 && md <= 831) list.push('straw');
    else if (md >= 325 && md <= 415) list.push('sakura');
    if (md >= 1201 || md <= 228) list.push('scarf');
    return list;
  }

  let currentPose = null;
  function drawCat(poseName, props) {
    const pose = Poses[poseName];
    let extra = '';
    props.forEach((p) => {
      if (p === 'scarf') { if (pose.neck) extra += `<g transform="translate(${pose.neck.x} ${pose.neck.y})">${Props.scarfOf(pose.neck.w)}</g>`; }
      else extra += `<g transform="translate(${pose.head.x} ${pose.head.y}) rotate(${pose.head.r})">${Props[p]}</g>`;
    });
    $('catPose').innerHTML = pose.svg + extra;
    $('cat').classList.toggle('sleeping', !!pose.sleeping);
    currentPose = poseName;
  }

  // ---------- 歩数の受け取り（ショートカットから） ----------
  function receiveFromUrl() {
    const params = new URLSearchParams(location.search);
    if (!params.has('steps') && !params.has('days')) return null;
    history.replaceState(null, '', location.pathname); // URLをきれいに戻す
    const today = ymd(new Date());
    // 過去の何日ぶんか（days=2026-10-15:8159,2026-10-16:5021,…）。開かなかった日も埋まる
    let pastCount = 0;
    if (params.has('days')) {
      // 日付から次の日付までのあいだにある数字を、その日の歩数として読む（「5,123」のような区切りがあっても読める）
      const text = String(params.get('days'));
      const re = /(\d{4})[-\/.年](\d{1,2})[-\/.月](\d{1,2})日?/g;
      const found = [...text.matchAll(re)];
      found.forEach((m, i) => {
        const rest = text.slice(m.index + m[0].length, i + 1 < found.length ? found[i + 1].index : text.length);
        const num = /\d[\d,，]*(?:\.\d+)?/.exec(rest);
        if (!num) return;
        if (+m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return; // 「mm（分）」などで、ありえない日付になったものは使わない
        const date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
        const n = Math.round(parseFloat(num[0].replace(/[,，]/g, '')));
        if (!parseYmd(date) || date > today || !Number.isFinite(n) || n < 0) return;
        if (date !== today && (state.days[date] == null || n > state.days[date])) pastCount++;
        recordSteps(date, n);
      });
    }
    let steps = null;
    if (params.has('steps')) {
      steps = Math.round(parseFloat(String(params.get('steps')).replace(/[,，\s]/g, '')));
      const date = parseYmd(params.get('date')) ? params.get('date') : today;
      if (Number.isFinite(steps)) recordSteps(date, steps); else steps = null;
    }
    if (steps == null && state.days[today] != null && params.has('days')) steps = state.days[today];
    return steps == null ? null : { steps, pastCount };
  }

  // 1日のうちに何度か届いても、多いほうを残す（歩数は1日の中で増えていくだけなので）
  function recordSteps(date, steps, overwrite) {
    const prev = state.days[date];
    state.days[date] = overwrite || prev == null ? steps : Math.max(prev, steps);
    save();
  }

  // ---------- 描画 ----------
  function renderSky(info, now) {
    const wkind = info.weather ? info.weather.kind : null;
    document.body.className = `t-${info.tod} s-${info.season}` + (wkind ? ` w-${wkind}` : '');
    const deco = $('skyDeco');
    deco.innerHTML = '';
    const overcast = ['cloudy', 'rain', 'snow', 'thunder', 'fog'].includes(wkind);
    if (overcast || wkind === 'partly') {
      // くもりや雨の日は、雲を多めに。晴れときどきくもりは、お日さまも出す
      if (wkind === 'partly' && info.tod !== 'night' && info.tod !== 'late') {
        const sun = document.createElement('div');
        sun.className = 'sun';
        deco.appendChild(sun);
      }
      const clouds = overcast ? [[4, 120, 0], [14, 90, -12], [26, 140, -26], [9, 70, -34]] : [[8, 100, 0], [22, 70, -20], [14, 80, -32]];
      clouds.forEach(([top, w, delay]) => {
        const c = document.createElement('div');
        c.className = 'cloud' + (overcast ? ' gray' : '');
        c.style.top = top + '%';
        c.style.width = w + 'px';
        c.style.animationDelay = delay + 's';
        deco.appendChild(c);
      });
    } else if (info.tod === 'night' || info.tod === 'late') {
      const moon = document.createElement('div');
      moon.className = 'moon' + (info.event === '十五夜' ? ' full' : '');
      deco.appendChild(moon);
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.textContent = '✦';
        s.style.left = (hash('x' + i) % 100) + '%';
        s.style.top = (hash('y' + i) % 55) + '%';
        s.style.animationDelay = (i % 5) * 0.6 + 's';
        deco.appendChild(s);
      }
    } else {
      const sun = document.createElement('div');
      sun.className = 'sun';
      deco.appendChild(sun);
      [[6, 90, 0], [20, 60, -18]].forEach(([top, w, delay]) => {
        const c = document.createElement('div');
        c.className = 'cloud';
        c.style.top = top + '%';
        c.style.width = w + 'px';
        c.style.animationDelay = delay + 's';
        deco.appendChild(c);
      });
    }

    const p = $('particles');
    p.innerHTML = '';
    let chars = null;
    // 絵文字ではなく、絵柄に合わせた平たい記号を降らせる
    if (wkind === 'rain' || wkind === 'thunder') {
      // 雨つぶ
      for (let i = 0; i < 40; i++) {
        const el = document.createElement('span');
        el.className = 'drop';
        el.style.left = (i * 3 + (hash('r' + i) % 6)) + '%';
        el.style.animationDuration = 0.7 + (hash('rd' + i) % 5) / 10 + 's';
        el.style.animationDelay = -(hash('rt' + i) % 20) / 10 + 's';
        p.appendChild(el);
      }
      return;
    }
    if (info.birthday) chars = [['★', '#e9928c'], ['★', '#2b2b2b']];
    else if (wkind === 'snow') chars = [['●', '#ffffff'], ['❄\uFE0E', '#ffffff']];
    else if (info.season === 'spring') chars = [['✿', '#e9a0ae']];
    else if (info.season === 'autumn') chars = [['◆', '#d98a4f'], ['◆', '#b8643a']];
    else if (info.season === 'winter') chars = [['❄\uFE0E', '#9aa8cc']];
    else if (info.tod === 'night' || info.tod === 'late') chars = [['✦', '#b9a64a']];
    if (!chars) return;
    const n = wkind === 'snow' ? 22 : 9;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'particle' + (wkind === 'snow' ? ' snow' : '');
      const [ch, color] = chars[i % chars.length];
      el.textContent = ch;
      el.style.color = color;
      el.style.left = ((i * (wkind === 'snow' ? 4.6 : 11)) + (hash('p' + i) % 8)) + '%';
      el.style.animationDuration = 9 + (hash('d' + i) % 7) + 's';
      el.style.animationDelay = -(hash('t' + i) % 12) + 's';
      el.style.fontSize = 11 + (hash('s' + i) % 8) + 'px';
      p.appendChild(el);
    }
  }

  function renderChip(info) {
    const chip = $('dayChip');
    let text = SEASON_LABEL[info.season];
    if (info.birthday) text = `★ ${catName()}のお誕生日`;
    else if (info.holiday) text = `● ${info.holiday}`;
    else if (info.event) text = `★ ${info.event}`;
    chip.textContent = text;
    chip.hidden = false;
  }

  const WEATHER_WD = ['日', '月', '火', '水', '木', '金', '土'];
  function renderWeather(info) {
    const pill = $('weatherPill');
    const w = info.weather;
    if (!w) { pill.hidden = true; return; }
    const t = w.temp != null ? `${w.temp}°` : `<small>最高</small>${w.max}°`;
    pill.innerHTML = `${Weather.icon(w.kind, 28)}<span class="w-main"><span class="w-label">${Weather.SHORT[w.kind]} </span><b>${t}</b></span><span class="w-pop">☂ ${w.pop}%</span>`;
    pill.hidden = false;
  }

  // 1時間ごとの天気（今日はいまの時間から）
  function hoursHtml(d, today) {
    const now = new Date().getHours();
    const list = (d.hours || []).filter((h) => d.date !== today || h.hour >= now);
    if (!list.length) return '<p class="sub center">この日の1時間ごとの天気は、まだありません</p>';
    return '<div class="wh-strip">' + list.map((h) =>
      `<div class="wh-cell${d.date === today && h.hour === now ? ' now' : ''}">` +
      `<span class="wh-time">${d.date === today && h.hour === now ? 'いま' : h.hour + '時'}</span>` +
      `${Weather.icon(h.kind, 30)}` +
      `<b class="wh-temp">${h.temp}°</b>` +
      `<span class="wh-pop">☂${h.pop != null ? h.pop : '-'}%</span></div>`).join('') + '</div>';
  }

  let openDay = null;
  function renderWeekWeather() {
    const data = Weather.get();
    if (!data) return;
    const today = ymd(new Date());
    const days = data.days.filter((d) => d.date >= today);
    // はじめは今日をひらいておく（'' はぜんぶ閉じた状態）
    if (openDay === null || (openDay && !days.some((d) => d.date === openDay))) openDay = days.length ? days[0].date : '';
    $('weekWeather').innerHTML = days.map((d, i) => {
      const [y, m, dd] = d.date.split('-').map(Number);
      const dt = new Date(y, m - 1, dd);
      const wd = dt.getDay();
      const name = d.date === today ? '今日' : i === 1 && days[0].date === today ? '明日' : `${m}/${dd}`;
      const hol = JpCalendar.holiday(dt);
      const cls = wd === 0 || hol ? ' sun-day' : wd === 6 ? ' sat-day' : '';
      const open = d.date === openDay;
      return `<div class="ww-wrap${open ? ' open' : ''}">` +
        `<button class="ww-row${d.date === today ? ' today' : ''}" data-day="${d.date}" aria-expanded="${open}">` +
        `<span class="ww-day${cls}">${name}<small>（${WEATHER_WD[wd]}）</small><span class="ww-label">${Weather.SHORT[d.kind]}</span></span>` +
        `<span class="ww-icon">${Weather.icon(d.kind, 36)}</span>` +
        `<span class="ww-temp"><b class="hi">${d.max}°</b><b class="lo">${d.min}°</b></span>` +
        `<span class="ww-pop">☂ ${d.pop}%</span><span class="ww-arrow">${open ? '▲' : '▼'}</span></button>` +
        (open ? `<div class="ww-hours">${hoursHtml(d, today)}</div>` : '') +
        '</div>';
    }).join('');
    const f = new Date(data.fetchedAt);
    $('weatherNote').textContent = (data.sample
      ? 'おためし用の天気です'
      : `${f.getMonth() + 1}月${f.getDate()}日 ${f.getHours()}:${String(f.getMinutes()).padStart(2, '0')} に取ってきた予報です（Open-Meteo）`) +
      '。日を押すと、1時間ごとの天気が見られます';
  }
  $('weekWeather').addEventListener('click', (e) => {
    const row = e.target.closest('.ww-row');
    if (!row) return;
    openDay = openDay === row.dataset.day ? '' : row.dataset.day;
    renderWeekWeather();
    const opened = $('weekWeather').querySelector('.ww-wrap.open');
    if (opened) opened.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  const PAW = '<svg viewBox="0 0 20 20" width="16" height="16" fill="#2b2b2b"><ellipse cx="10" cy="13" rx="5" ry="4.2"/><circle cx="4" cy="8" r="2.2"/><circle cx="8" cy="4.5" r="2.2"/><circle cx="12" cy="4.5" r="2.2"/><circle cx="16" cy="8" r="2.2"/></svg>';

  const MILESTONES = [
    [0.5, 'ご近所の公園まで'], [5, 'となり町のさらに先まで'], [21.1, 'ハーフマラソンの距離'],
    [34.5, '山手線ひとまわり'], [42.2, 'フルマラソンの距離'], [100, '東京から富士山のふもとまで'],
    [350, '東京から名古屋まで'], [500, '東京から大阪まで'], [1100, '東京から福岡まで'],
    [3000, '日本列島のはしからはしまで'], [40075, '地球ひとまわり'],
  ];

  function renderNumbers(steps) {
    $('stepsNum').textContent = steps != null ? steps.toLocaleString() : '—';
    $('stepsSub').textContent = steps != null
      ? `およそ ${fmtKm(km(steps))} km`
      : 'ショートカットから、歩数を届けてください';

    const total = Object.values(state.days).reduce((a, b) => a + (b || 0), 0);
    const totalKm = km(total);
    $('totalKm').textContent = `${fmtKm(totalKm)} km`;
    const reached = MILESTONES.filter(([d]) => totalKm >= d).pop();
    const days = Object.keys(state.days).length;
    $('totalNote').textContent = reached
      ? `${reached[1]}くらい（${days}日ぶん）`
      : 'のんびり歩いていきましょう';
  }

  function showBubble(text) {
    const b = $('bubble');
    $('bubbleText').textContent = text;
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
  }

  function renderReview(now) {
    const card = $('reviewCard');
    card.hidden = now.getDay() !== 0;
    if (card.hidden) return;
    const week = weekInfo(now);
    const max = Math.max(1, ...week.list.map((x) => x.steps || 0));
    $('weekBars').innerHTML = week.list.map((x) => {
      const h = x.steps != null ? Math.max(4, Math.round((x.steps / max) * 64)) : 4;
      return `<div class="col"><div class="bar${x.steps == null ? ' empty' : ''}" style="height:${h}px"></div><span class="d">${WD[x.date.getDay()]}</span></div>`;
    }).join('');
    $('reviewNote').textContent = week.days
      ? `${week.days}日ぶん、あわせて ${week.wkm} km。おつかれさまでした`
      : '今週は、ゆっくりの週でした';
  }

  // おためし用に時間帯だけ動かせるようにしておく
  let hourOverride = null;
  function render() {
    const now = new Date();
    if (hourOverride != null) now.setHours(hourOverride, 0);
    const info = todayInfo(now);
    const steps = state.days[ymd(now)];
    $('dateLabel').textContent = `${now.getMonth() + 1}月${now.getDate()}日（${WD[now.getDay()]}）`;
    renderSky(info, now);
    renderChip(info);
    renderWeather(info);
    renderNumbers(steps);
    renderReview(now);
    drawCat(poseFor(info, steps, now), propsFor(now));
    showBubble(buildMessage(now, info, steps));
  }

  // ---------- なでる ----------
  let poseTimer = null;
  let lastTap = null;
  // なでると、ランダムにポーズが変わって、そのポーズに合ったひとことを言う
  function cheer() {
    const cat = $('cat');
    const back = window.TapPoses.includes(currentPose) ? cheer.back : currentPose;
    cheer.back = back;
    const choices = window.TapPoses.filter((p) => p !== lastTap);
    const pose = pickRandom(choices);
    lastTap = pose;
    drawCat(pose, propsFor(new Date()));
    cat.classList.remove('hop');
    void cat.getBoundingClientRect();
    cat.classList.add('hop');
    clearTimeout(poseTimer);
    poseTimer = setTimeout(() => drawCat(back, propsFor(new Date())), 2200);
    return pose;
  }
  // ---------- 派手な動き（ときどき） ----------
  // 名前は Messages.moves のキーと同じ。CSS は style.css の「派手な動き」
  // ※ おまけの絵のクラス名は mvx- ではじめる（ねこの動きのクラス mv-〇〇 とぶつからないように）
  const MOVES = ['roll', 'spin', 'fly', 'melt', 'stretch', 'clone', 'dash', 'giant', 'tiny', 'upside', 'bounce',
    'sidestep', 'flip', 'slide', 'box', 'wind', 'warp', 'headspin', 'ceiling', 'sparkle', 'paper', 'sink',
    // 超派手（画面ぜんたい）
    'rocket', 'fireworks', 'catrain', 'mega', 'crack', 'tornado', 'ufo', 'mirrorball', 'flipscreen', 'quake',
    'comet', 'blackhole', 'balloon', 'drill', 'party', 'lightning', 'parade', 'pinball', 'zoomin', 'rainbow',
    // ちょっと変な
    'squash', 'shadow', 'afterimage', 'neck', 'jelly', 'peek', 'hop3', 'moonwalk', 'swing', 'dizzy', 'sneak', 'fold',
    'split', 'orbit', 'bubble', 'skate', 'statue', 'teleport', 'pulse', 'yoyo', 'lean', 'leaf', 'stack', 'spring'];
  // 動きに合わせて、ポーズも変える（書いていないものは今のポーズのまま）
  const MOVE_POSE = { roll: 'roll', melt: 'melt', stretch: 'upright', upside: 'stare', bounce: 'blink', flip: 'freeze',
    slide: 'stare', box: 'box', wind: 'freeze', warp: 'cosmos', ceiling: 'stare', sparkle: 'cosmos', sink: 'stare', spin: 'freeze', tiny: 'stare',
    giant: 'stare', dash: 'upright', clone: 'blink', fly: 'blink',
    rocket: 'freeze', fireworks: 'blink', catrain: 'freeze', mega: 'stare', crack: 'freeze', tornado: 'freeze', ufo: 'freeze',
    mirrorball: 'blink', flipscreen: 'freeze', quake: 'teacup', comet: 'roll', blackhole: 'freeze', balloon: 'blink', drill: 'roll',
    party: 'blink', lightning: 'freeze', parade: 'upright', pinball: 'roll', zoomin: 'blink', rainbow: 'blink',
    squash: 'freeze', shadow: 'stare', afterimage: 'upright', jelly: 'blink', peek: 'stare', hop3: 'blink', moonwalk: 'upright',
    swing: 'blink', sneak: 'sideeye', split: 'freeze', orbit: 'cosmos', bubble: 'blink', skate: 'upright', statue: 'upright',
    teleport: 'stare', pulse: 'freeze', yoyo: 'roll', lean: 'tilt', leaf: 'float', stack: 'stare', spring: 'upright' };
  // 長さ（ミリ秒）。書いていないものは 1800
  const MOVE_MS = { roll: 2400, spin: 2000, fly: 2800, melt: 2400, stretch: 2000, clone: 2200, dash: 2400, giant: 2400, tiny: 2000,
    upside: 2400, bounce: 2200, sidestep: 2000, flip: 2000, slide: 2200, box: 2600, wind: 2800, warp: 2200, headspin: 2000,
    ceiling: 2800, sparkle: 2200, paper: 2000, sink: 3000,
    rocket: 3400, fireworks: 3400, catrain: 3200, mega: 3000, crack: 3000, tornado: 3200, ufo: 3500, mirrorball: 3500,
    flipscreen: 2600, quake: 2800, comet: 2600, blackhole: 3200, balloon: 3500, drill: 3200, party: 3200, lightning: 2600,
    parade: 3500, pinball: 3200, zoomin: 2800, rainbow: 3400,
    squash: 1800, shadow: 3200, afterimage: 2200, neck: 2600, jelly: 2000, peek: 3200, hop3: 2600, moonwalk: 3000, swing: 2800,
    dizzy: 2800, sneak: 3200, fold: 2400, split: 2600, orbit: 3200, bubble: 3000, skate: 2800, statue: 3200, teleport: 2800,
    pulse: 2200, yoyo: 2800, lean: 2600, leaf: 3200, stack: 3400, spring: 2600 };
  let moveTimer = null, lastMove = null, moving = false;
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const POP = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#ffa95e', '#c9a7ff', '#ff6b6b', '#ffffff'];
  // 小さいてんぷる（おまけ用。手描きのゆらしは重いので外す）
  const miniCat = (pose = 'sit', tint = '') => `<svg class="cat mvx-cat" viewBox="0 0 240 200"${tint ? ` style="--tint:${tint}"` : ''}>${(Poses[pose] || Poses.sit).svg}</svg>`;
  const nowCat = () => `<svg class="cat mvx-cat" viewBox="0 0 240 200">${$('catPose').innerHTML}</svg>`;

  // おまけの絵を足す道具
  function moveKit(stage, btn, ms) {
    const sr = stage.getBoundingClientRect();
    const G = { x: btn.offsetLeft, y: btn.offsetTop, w: btn.offsetWidth, h: btn.offsetHeight, sw: stage.clientWidth, sh: stage.clientHeight };
    G.cx = G.x + G.w / 2; G.cy = G.y + G.h / 2; G.bottom = G.sh - G.y - G.h;
    const bub = $('bubble'); G.bb = bub ? bub.offsetTop + bub.offsetHeight : 0; // ふきだしの下（文字はここより下に出す）
    G.px = sr.left + stage.clientLeft; G.py = sr.top + stage.clientTop; // ステージの、画面の中での位置
    const s = (v) => (v / 1000).toFixed(2) + 's';
    const add = (cls, html = '', style = '', parent = stage) => {
      const d = document.createElement('div');
      d.className = 'mv-extra ' + cls; d.innerHTML = html; d.style.cssText = style;
      d.setAttribute('aria-hidden', 'true');
      parent.appendChild(d); return d;
    };
    const K = {
      G, s, add,
      inBtn: (cls, html, style) => add(cls, html, style, btn),
      fixed: (cls, html, style) => add('mvx-fixed ' + cls, html, style, document.body),
      // 画面いっぱいの光（delay ミリ秒後）
      flash: (delay, color = '#fff', dur = 380, fixed = true) => (fixed ? K.fixed : add)('mvx-flash', '', `background:${color};animation-delay:${s(delay)};animation-duration:${s(dur)}`),
      // 空を暗くする
      dark: (color, op = 0.6, d0 = 0.12, d1 = 0.85) => add('mvx-dark', '', `--dk:${color};--dko:${op};--d0:${d0};--d1:${d1}`),
      // 粒が四方に飛ぶ
      burst: (x, y, delay, n = 14, dist = 90, colors = POP, size = 9, parent = stage) => {
        const b = add('mvx-burst', '', `left:${x}px;top:${y}px;animation-delay:${s(delay)}`, parent);
        for (let i = 0; i < n; i++) {
          const p = document.createElement('i');
          const c = colors[i % colors.length];
          p.style.cssText = `--a:${(360 / n) * i + rnd(-8, 8)}deg;--d:${dist * rnd(0.7, 1.15)}px;background:${c};width:${size}px;height:${size}px;animation-delay:${s(delay)}`;
          b.appendChild(p);
        }
        return b;
      },
      // マンガの文字
      word: (text, x, y, delay, color = '#ffd94a', size = 30, rot = -8) =>
        (y = Math.min(Math.max(y, G.bb + 4), G.sh - size - 8), x = Math.min(Math.max(x, 6), G.sw - 40), add('mvx-word', text, `left:${x}px;top:${y}px;color:${color};font-size:${size}px;--r:${rot}deg;animation-delay:${s(delay)}`)),
      // もくもく
      puffs: (x, y, n, delay, spread = 60, parent = stage) => {
        for (let i = 0; i < n; i++) add('mvx-puff', '', `left:${x + rnd(-spread, spread)}px;top:${y + rnd(-10, 6)}px;--s:${rnd(0.7, 1.4).toFixed(2)};--dx:${rnd(-30, 30).toFixed(0)}px;animation-delay:${s(delay + rnd(0, 180))}`, parent);
      },
      // きらきら
      stars: (n, delayMax, area = [5, 95, 5, 85], chars = ['✦', '✧', '★', '✦']) => {
        for (let i = 0; i < n; i++) add('mvx-star', pickRandom(chars), `left:${rnd(area[0], area[1])}%;top:${rnd(area[2], area[3])}%;animation-delay:${s(rnd(0, delayMax))};font-size:${rnd(14, 30).toFixed(0)}px;color:${pickRandom(['#ffd94a', '#fff', '#ff9fbb', '#8fe8c8'])}`);
      },
      // 上から降ってくる
      rain: (n, html, opts = {}) => {
        const { delayMax = 1200, dur = [1000, 1600], size = [20, 40], parent = stage, cls = '' } = opts;
        const W = parent === stage ? G.sw : window.innerWidth, H = parent === stage ? G.sh : window.innerHeight;
        for (let i = 0; i < n; i++) {
          const sz = rnd(size[0], size[1]);
          add('mvx-fall ' + cls, typeof html === 'function' ? html(i) : html,
            `left:${rnd(-sz / 2, W - sz / 2).toFixed(0)}px;width:${sz.toFixed(0)}px;--fh:${H + sz * 2}px;--rot:${rnd(-540, 540).toFixed(0)}deg;--sway:${rnd(-50, 50).toFixed(0)}px;animation-delay:${s(rnd(0, delayMax))};animation-duration:${s(rnd(dur[0], dur[1]))}`, parent);
        }
      },
    };
    return K;
  }

  // 動きごとの、おまけの絵
  const EXTRAS = {
    roll(K) { const { G } = K; K.puffs(G.cx + 40, G.y + G.h, 4, 0, 30); K.burst(G.sw - 6, G.y + G.h * 0.6, 0.3 * MOVE_MS.roll, 12, 70); K.word('ドカン!', G.sw - 120, G.y - 10, 0.3 * MOVE_MS.roll, '#ff9fbb', 28, 10); },
    spin(K) { const { G } = K; for (let i = 0; i < 3; i++) K.add('mvx-ring', '', `left:${G.cx}px;top:${G.y + G.h * 0.6}px;animation-delay:${K.s(300 + i * 350)}`); K.stars(10, 1400, [10, 90, 30, 90]); },
    fly(K) { const { G } = K; K.puffs(G.cx, G.y + G.h, 6, 100, 50); K.stars(12, 1200, [5, 95, 0, 40]); K.puffs(G.cx, G.y + G.h, 5, 0.86 * MOVE_MS.fly, 60); },
    melt(K) { const { G } = K; K.add('mvx-puddle', '', `left:${G.cx}px;top:${G.y + G.h - 6}px`); },
    stretch(K) { const { G } = K; K.word('びよーん', G.cx - 40, 10, 400, '#8fe8c8', 26, -6); },
    clone() {},
    dash(K) { const { G } = K; for (let i = 0; i < 8; i++) K.add('mvx-speed', '', `top:${G.y + G.h * (0.1 + i * 0.11)}px;animation-delay:${K.s(i * 60)}`); K.puffs(G.cx - 30, G.y + G.h, 5, 0, 30); },
    giant(K) { const { G } = K; K.word('ドーン!!', G.cx - 70, 20, 0.3 * MOVE_MS.giant, '#ffd94a', 38, -10); },
    tiny(K) { const { G } = K; K.burst(G.cx, G.y + G.h * 0.9, 0.82 * MOVE_MS.tiny, 12, 60); K.word('ぽんっ', G.cx + 20, G.y + 10, 0.82 * MOVE_MS.tiny, '#ff9fbb', 24, 8); },
    upside(K) { K.stars(8, 1500, [10, 90, 10, 70]); },
    bounce(K) { const { G } = K; for (let i = 0; i < 5; i++) K.puffs(G.cx, G.y + G.h, 2, i * 0.2 * MOVE_MS.bounce, 40); },
    sidestep() {},
    flip(K) { const { G } = K; K.burst(G.cx, G.y + G.h, 0.8 * MOVE_MS.flip, 10, 70); K.word('シュタッ', G.cx + 10, G.y - 10, 0.8 * MOVE_MS.flip, '#8fd0ff', 24, 8); },
    slide(K) { const { G } = K; for (let i = 0; i < 4; i++) K.add('mvx-speed', '', `top:${G.y + G.h * (0.2 + i * 0.2)}px;animation-delay:${K.s(i * 80)}`); },
    box(K) {
      const { G } = K;
      K.add('mvx-boxdrop', '<svg viewBox="0 0 140 90"><path d="M8 18 L132 18 L126 86 L14 86 Z" fill="#f1d9a0" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/><path d="M8 18 L-6 4 L4 0 L20 14 M132 18 L146 4 L136 0 L120 14" fill="#f1d9a0" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/><path d="M50 52 h40" stroke="#2b2b2b" stroke-width="2.5" stroke-linecap="round"/></svg>');
      K.puffs(G.cx, G.y + G.h, 8, 0.3 * MOVE_MS.box, 90);
      K.word('ズドン', G.cx - 30, 14, 0.3 * MOVE_MS.box, '#ffa95e', 30, -6);
    },
    wind(K) {
      const { G } = K;
      for (let i = 0; i < 12; i++) K.add('mvx-gust', '', `top:${6 + i * 7.5}%;animation-delay:${K.s(i * 70)}`);
      K.rain(10, () => '<span class="mvx-leafy"></span>', { delayMax: 1200, dur: [900, 1400], size: [14, 22], cls: 'mvx-blow' });
    },
    warp(K) { const { G } = K; [0.15, 0.45, 0.72].forEach((f, i) => K.add('mvx-ring', '', `left:${G.cx}px;top:${G.y + G.h * 0.5}px;animation-delay:${K.s(f * MOVE_MS.warp)};border-color:${POP[i]}`)); K.stars(10, 1600); },
    headspin(K) { const { G } = K; K.word('ぐるぐる', G.cx + 10, G.y - 30, 200, '#c9a7ff', 22, 8); },
    ceiling(K) { const { G } = K; btnVar('--ceil', (6 - G.y) + 'px'); K.burst(G.cx, 8, 0.28 * MOVE_MS.ceiling, 12, 60); K.word('ゴンッ', G.cx + 20, 20, 0.28 * MOVE_MS.ceiling, '#ffd94a', 26, 12); },
    sparkle(K) { const { G } = K; K.add('mvx-rays', '', `left:${G.cx}px;top:${G.y + G.h * 0.55}px`); K.stars(40, 1500); },
    paper() {},
    sink(K) { const { G } = K; K.puffs(G.cx, G.y + G.h, 6, 0.85 * MOVE_MS.sink, 50); },

    // ---- 超派手 ----
    rocket(K) {
      const { G } = K, ms = MOVE_MS.rocket;
      K.inBtn('mvx-rocket', '<svg viewBox="0 0 80 120"><path d="M40 4 C 62 22 66 54 60 86 L 20 86 C 14 54 18 22 40 4 Z" fill="#fff" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"/><path d="M27 20 Q40 6 53 20 Z" fill="#ff6b6b" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="44" r="10" fill="#8fd0ff" stroke="#2b2b2b" stroke-width="3.5"/><path d="M20 62 L4 92 L22 86 Z M60 62 L76 92 L58 86 Z" fill="#ff6b6b" stroke="#2b2b2b" stroke-width="3.5" stroke-linejoin="round"/><g class="mvx-flame"><path d="M24 88 Q40 140 56 88 Z" fill="#ffa95e" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/><path d="M32 88 Q40 118 48 88 Z" fill="#ffd94a"/></g></svg>');
      for (let i = 0; i < 5; i++) K.puffs(G.cx, G.y + G.h, 3, 150 + i * 160, 70);
      K.word('3・2・1…', 14, G.y + G.h * 0.2, 0, '#fff', 22, -4);
      K.add('mvx-bigstar', '★', `left:${G.cx}px;top:24px;animation-delay:${K.s(ms * 0.44)}`);
      K.burst(G.cx, 30, ms * 0.44, 18, 120);
      K.flash(ms * 0.44, '#fff6c2', 420);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.84, 80);
      K.word('ズシーン', G.cx - 60, G.y + 10, ms * 0.84, '#ffa95e', 30, -8);
    },
    fireworks(K) {
      const { G } = K, ms = MOVE_MS.fireworks;
      K.dark('#1d1f4a', 0.75, 0.06, 0.9);
      const cols = [['#ff9fbb', '#fff', '#ff6b6b'], ['#ffd94a', '#ffa95e', '#fff'], ['#8fe8c8', '#8fd0ff', '#fff'], ['#c9a7ff', '#ff9fbb', '#ffd94a']];
      for (let i = 0; i < 9; i++) {
        const x = (i % 2 ? rnd(0.08, 0.4) : rnd(0.6, 0.92)) * G.sw, y = rnd(G.bb + 30, Math.max(G.bb + 40, G.y + G.h * 0.45)), d = 150 + i * 280;
        K.add('mvx-rise', '', `left:${x}px;top:${y}px;--rh:${G.sh - y}px;animation-delay:${K.s(d)}`);
        K.burst(x, y, d + 300, 22, rnd(70, 115), cols[i % 4], 12).classList.add('mvx-fw');
        K.burst(x, y, d + 380, 12, rnd(30, 50), ['#fff', '#fff6c2'], 7).classList.add('mvx-fw');
        K.add('mvx-fwcore', '', `left:${x}px;top:${y}px;background:${cols[i % 4][0]};animation-delay:${K.s(d + 300)}`);
      }
      K.fixed('mvx-tint', '', '');
    },
    catrain(K) {
      const poses = ['sit', 'loaf', 'roll', 'blink', 'stare', 'maneki', 'freeze', 'sideeye'];
      K.rain(34, () => miniCat(pickRandom(poses), pickRandom(POP)), { delayMax: 1700, dur: [900, 1500], size: [40, 80] });
      K.word('ふってきた!?', 20, 12, 300, '#8fd0ff', 26, -6);
    },
    mega(K) {
      const { G } = K, ms = MOVE_MS.mega;
      K.word('ゴゴゴ', 14, G.sh * 0.3, ms * 0.08, '#c9a7ff', 26, -12);
      K.word('ゴゴゴ', G.sw - 100, G.sh * 0.55, ms * 0.14, '#c9a7ff', 26, 10);
      K.word('ドーン!!', G.cx - 80, G.sh * 0.06, ms * 0.32, '#ffd94a', 40, -8);
      K.flash(ms * 0.3, '#fff', 300);
    },
    crack(K) {
      const { G } = K, ms = MOVE_MS.crack;
      const W = window.innerWidth, H = window.innerHeight;
      const ox = G.px + G.cx, oy = G.py + G.sh * 0.42;
      let lines = '', ring = '';
      const n = 11;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + rnd(-0.2, 0.2);
        let x = ox, y = oy, d = `M${ox.toFixed(0)} ${oy.toFixed(0)}`;
        const steps = 6, row = [];
        for (let k = 1; k <= steps; k++) {
          const r = k * Math.max(W, H) / 4.2;
          const aa = a + rnd(-0.18, 0.18);
          x = ox + Math.cos(aa) * r; y = oy + Math.sin(aa) * r;
          d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; row.push([x, y]);
        }
        lines += `<path d="${d}"/>`; pts.push(row);
      }
      for (let k = 0; k < 3; k++) {
        let d = '';
        pts.forEach((row, i) => { const [x, y] = row[k]; d += (i ? ' L' : 'M') + x.toFixed(0) + ' ' + y.toFixed(0); });
        ring += `<path d="${d} Z"/>`;
      }
      K.fixed('mvx-crack', `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g class="mvx-crackw">${lines}${ring}</g><g class="mvx-crackk">${lines}${ring}</g></svg>`, `animation-delay:${K.s(ms * 0.18)};transform-origin:${ox}px ${oy}px`);
      K.flash(ms * 0.18, '#fff', 260);
      for (let i = 0; i < 10; i++) K.fixed('mvx-shard', `<svg viewBox="0 0 40 40"><path d="M${rnd(0, 14).toFixed(0)} ${rnd(0, 10).toFixed(0)} L${rnd(26, 40).toFixed(0)} ${rnd(4, 18).toFixed(0)} L${rnd(8, 30).toFixed(0)} ${rnd(30, 40).toFixed(0)} Z" fill="#e8f6ff" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/></svg>`, `left:${ox + rnd(-140, 140)}px;top:${oy + rnd(-140, 140)}px;--rot:${rnd(-200, 200).toFixed(0)}deg;--sx:${rnd(-60, 60).toFixed(0)}px;animation-delay:${K.s(ms * 0.62 + rnd(0, 200))}`);
      K.word('パリーン!!', G.cx - 80, 10, ms * 0.2, '#8fd0ff', 34, -8);
      K.word('…なおった', G.cx - 50, G.sh * 0.15, ms * 0.8, '#fff', 20, 4);
    },
    tornado(K) {
      const { G } = K, ms = MOVE_MS.tornado;
      let ell = '';
      for (let i = 0; i < 9; i++) { const w = 150 - i * 14, y = 14 + i * 34; ell += `<ellipse class="mvx-tw" style="animation-delay:-${(i * 0.09).toFixed(2)}s" cx="100" cy="${y}" rx="${w / 1.2}" ry="${12 - i * 0.6}"/>`; }
      K.add('mvx-tornado', `<svg viewBox="0 0 200 320" preserveAspectRatio="none">${ell}</svg>`, `left:${G.cx}px;height:${G.sh}px`);
      for (let i = 0; i < 14; i++) K.add('mvx-debris', i % 3 ? '<span class="mvx-leafy"></span>' : '✦', `left:${G.cx}px;top:${G.sh - 30}px;--r0:${rnd(50, 110).toFixed(0)}px;animation-delay:${K.s(ms * 0.08 + i * 110)}`);
      K.word('ビュオオオ', 10, 14, ms * 0.1, '#8fe8c8', 26, -8);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.82, 70);
    },
    ufo(K) {
      const { G } = K;
      K.dark('#2a2560', 0.45, 0.1, 0.9);
      K.add('mvx-beam', '', `left:${G.cx}px;height:${G.y + G.h - 40}px`);
      K.add('mvx-ufo', '<svg viewBox="0 0 160 80"><path d="M52 34 Q80 -8 108 34 Z" fill="#8fd0ff" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round" opacity=".95"/><ellipse cx="80" cy="44" rx="74" ry="20" fill="#c9a7ff" stroke="#2b2b2b" stroke-width="4"/><ellipse cx="80" cy="38" rx="40" ry="8" fill="#fff" stroke="#2b2b2b" stroke-width="3"/><g class="mvx-ufol"><circle cx="30" cy="48" r="5" fill="#ffd94a" stroke="#2b2b2b" stroke-width="2.5"/><circle cx="56" cy="54" r="5" fill="#ff9fbb" stroke="#2b2b2b" stroke-width="2.5"/><circle cx="80" cy="56" r="5" fill="#8fe8c8" stroke="#2b2b2b" stroke-width="2.5"/><circle cx="104" cy="54" r="5" fill="#ffd94a" stroke="#2b2b2b" stroke-width="2.5"/><circle cx="130" cy="48" r="5" fill="#ff9fbb" stroke="#2b2b2b" stroke-width="2.5"/></g></svg>', `left:${G.cx}px`);
      btnVar('--up', (40 - G.cy) + 'px');
      K.stars(14, 2600, [5, 95, 5, 70]);
      K.word('ピピピ…', G.cx + 30, 64, 400, '#8fe8c8', 20, 6);
    },
    mirrorball(K) {
      const { G } = K;
      K.dark('#14102e', 0.82, 0.08, 0.9);
      K.add('mvx-beams', '', `left:${G.cx}px;top:40px`);
      K.add('mvx-mball', '<i></i>', `left:${G.cx}px`);
      const dots = K.add('mvx-dots', '', `left:${G.cx}px;top:40px`);
      for (let i = 0; i < 46; i++) {
        const p = document.createElement('i');
        const a = rnd(0, 360), r = rnd(30, 260);
        p.style.cssText = `left:${(Math.cos(a) * r).toFixed(0)}px;top:${(Math.sin(a) * r).toFixed(0)}px;background:${pickRandom(POP)};animation-delay:-${rnd(0, 1).toFixed(2)}s;width:${rnd(5, 12).toFixed(0)}px;height:${rnd(5, 12).toFixed(0)}px`;
        dots.appendChild(p);
      }
      K.word('♪', 20, G.sh * 0.5, 400, '#ff9fbb', 34, -10);
      K.word('♫', G.sw - 50, G.sh * 0.35, 900, '#8fe8c8', 34, 10);
      K.word('♪', 40, G.sh * 0.2, 1700, '#ffd94a', 30, 6);
    },
    flipscreen(K) { const { G } = K, ms = MOVE_MS.flipscreen; K.word('ぐるん!', G.cx - 50, 14, ms * 0.05, '#ff9fbb', 30, -8); K.flash(ms * 0.62, '#fff', 260); },
    quake(K) {
      const { G } = K;
      K.rain(26, () => `<span class="mvx-pebble" style="background:${pickRandom(['#b9a58a', '#8d7b65', '#d8c7a8'])}"></span>`, { delayMax: 1600, dur: [700, 1100], size: [6, 14], cls: 'mvx-drop' });
      K.word('ゴゴゴゴ', 10, G.sh * 0.18, 100, '#ffa95e', 28, -10);
      K.word('ゴゴゴ', G.sw - 110, G.sh * 0.45, 500, '#ffa95e', 26, 12);
      K.word('ズズズ', 20, G.sh * 0.6, 1000, '#ffa95e', 26, -6);
    },
    comet(K) {
      const { G } = K, ms = MOVE_MS.comet;
      K.dark('#1d1f4a', 0.6, 0.1, 0.8);
      K.stars(20, 1600);
      K.inBtn('mvx-tail', '', '');
      K.burst(G.cx, G.y + G.h * 0.8, ms * 0.86, 16, 90);
      K.flash(ms * 0.86, '#fff6c2', 300, false);
      K.word('キラーン', 16, 16, ms * 0.2, '#ffd94a', 28, -8);
    },
    blackhole(K) {
      const { G } = K, ms = MOVE_MS.blackhole;
      K.dark('#1a0f33', 0.75, 0.08, 0.72);
      let sp = '';
      for (let i = 0; i < 5; i++) sp += `<path transform="rotate(${i * 72} 100 100)" d="M100 100 C 120 90 130 60 110 40 C 90 20 50 30 40 60"/>`;
      K.add('mvx-hole', `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="url(#mvxHoleG)"/><defs><radialGradient id="mvxHoleG"><stop offset="0" stop-color="#000"/><stop offset=".35" stop-color="#3b1f6e"/><stop offset=".7" stop-color="#c9a7ff" stop-opacity=".6"/><stop offset="1" stop-color="#c9a7ff" stop-opacity="0"/></radialGradient></defs><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85">${sp}</g></svg>`, `left:${G.cx}px;top:${G.y + G.h * 0.5}px`);
      for (let i = 0; i < 18; i++) K.add('mvx-suck', pickRandom(['✦', '★', '・', '♥']), `left:${G.cx}px;top:${G.y + G.h * 0.5}px;--a:${rnd(0, 360).toFixed(0)}deg;--r0:${rnd(120, 220).toFixed(0)}px;color:${pickRandom(POP)};animation-delay:${K.s(ms * 0.08 + rnd(0, 900))}`);
      K.add('mvx-ring', '', `left:${G.cx}px;top:${G.y + G.h * 0.5}px;animation-delay:${K.s(ms * 0.72)};border-color:#ffd94a`);
      K.burst(G.cx, G.y + G.h * 0.5, ms * 0.72, 16, 110);
      K.flash(ms * 0.72, '#fff', 300);
      K.word('ぽんっ!', G.cx + 10, G.y - 20, ms * 0.74, '#ff9fbb', 30, 8);
    },
    balloon(K) {
      const { G } = K;
      const b = (x, c, r) => `<line x1="${x}" y1="58" x2="60" y2="118" stroke="#2b2b2b" stroke-width="2"/><g transform="rotate(${r} ${x} 58)"><ellipse cx="${x}" cy="34" rx="18" ry="23" fill="${c}" stroke="#2b2b2b" stroke-width="3.5"/><path d="M${x - 4} 57 l4 5 l4 -5 Z" fill="${c}" stroke="#2b2b2b" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x - 8} 22 q3 -7 9 -8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;
      K.inBtn('mvx-balloons', `<svg viewBox="0 0 120 120">${b(26, '#ff9fbb', -14)}${b(94, '#8fd0ff', 14)}${b(60, '#ffd94a', 0)}</svg>`);
      for (let i = 0; i < 4; i++) K.add('mvx-cloudpass', '', `left:${rnd(0, G.sw - 80).toFixed(0)}px;animation-delay:${K.s(500 + i * 380)}`);
      K.word('ふわ〜', G.cx + 20, G.sh * 0.3, 600, '#fff', 24, 6);
    },
    drill(K) {
      const { G } = K, ms = MOVE_MS.drill;
      K.inBtn('mvx-bit', '<svg viewBox="0 0 80 90"><path d="M6 4 L74 4 L40 88 Z" fill="#cfd6e6" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"/><path class="mvx-bitl" d="M12 18 L66 10 M18 34 L60 24 M24 50 L54 40 M30 66 L48 58" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/></svg>');
      for (let i = 0; i < 6; i++) K.burst(G.cx, G.y + G.h, ms * 0.1 + i * 130, 8, 70, ['#8d7b65', '#b9a58a', '#5c4b38'], 9);
      K.word('ギュイーン', 10, G.sh * 0.2, ms * 0.06, '#cfd6e6', 26, -8);
      K.burst(G.cx, 6, ms * 0.55, 14, 90, ['#8d7b65', '#b9a58a', '#5c4b38'], 10);
      K.word('ボコッ', G.cx + 10, 30, ms * 0.55, '#ffa95e', 28, 10);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.82, 70);
    },
    party(K) {
      const { G } = K, ms = MOVE_MS.party;
      const cr = (side) => `<svg viewBox="0 0 80 80" style="transform:scaleX(${side})"><path d="M8 72 L28 22 L58 52 Z" fill="#ffd94a" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"/><path d="M17 50 L40 34 M12 62 L48 46" stroke="#ff6b6b" stroke-width="4"/><path d="M28 22 Q40 10 58 52" fill="none" stroke="#2b2b2b" stroke-width="3"/></svg>`;
      K.add('mvx-cracker left', cr(1), '');
      K.add('mvx-cracker right', cr(-1), '');
      K.burst(56, G.sh - 56, ms * 0.08, 16, 120);
      K.burst(G.sw - 56, G.sh - 56, ms * 0.12, 16, 120);
      const conf = K.fixed('mvx-confetti', '', '');
      for (let i = 0; i < 90; i++) {
        const p = document.createElement('i');
        const w = rnd(7, 13);
        p.style.cssText = `left:${rnd(0, 100).toFixed(1)}%;width:${w.toFixed(0)}px;height:${(w * rnd(0.4, 1.6)).toFixed(0)}px;background:${pickRandom(POP.slice(0, 7))};--rot:${rnd(-720, 720).toFixed(0)}deg;--sway:${rnd(-80, 80).toFixed(0)}px;animation-delay:${(rnd(0.1, 1.4)).toFixed(2)}s;animation-duration:${rnd(1.4, 2.0).toFixed(2)}s;border-radius:${Math.random() < 0.3 ? '50%' : '2px'}`;
        conf.appendChild(p);
      }
      K.flash(ms * 0.08, '#fff6c2', 260);
      K.word('パーン!!', G.cx - 70, 12, ms * 0.08, '#ff9fbb', 36, -8);
      K.word('おめでとう?', G.cx - 70, G.sh * 0.32, ms * 0.4, '#ffd94a', 24, 6);
    },
    lightning(K) {
      const { G } = K, ms = MOVE_MS.lightning;
      K.dark('#2b2f45', 0.7, 0.05, 0.85);
      K.add('mvx-bolt', `<svg viewBox="0 0 100 300" preserveAspectRatio="none"><path d="M60 0 L30 120 L58 118 L24 230 L50 226 L36 300 L80 190 L54 194 L84 92 L56 96 L76 0 Z" fill="#ffd94a" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"/></svg>`, `left:${G.cx}px;height:${G.y + G.h * 0.25}px;animation-delay:${K.s(ms * 0.25)}`);
      K.flash(ms * 0.25, '#fff', 200);
      K.flash(ms * 0.36, '#fffbd0', 200);
      K.inBtn('mvx-spiky', '<svg viewBox="0 0 240 200"><path d="M50 150 L36 136 L52 128 L34 110 L56 104 L42 82 L66 82 L60 56 L82 66 L86 38 L104 56 L116 26 L128 54 L142 28 L152 58 L174 40 L176 68 L198 62 L190 86 L212 88 L196 108 L216 116 L196 130 L210 144 L190 150" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>', '');
      K.word('ピシャーン!!', 8, 14, ms * 0.25, '#ffd94a', 32, -8);
      K.word('ゴロゴロ…', G.sw - 120, G.sh * 0.45, 100, '#cfd6e6', 20, 6);
      K.rain(30, '<span class="mvx-raindrop"></span>', { delayMax: 1800, dur: [400, 600], size: [3, 4], cls: 'mvx-rainy' });
    },
    parade(K) {
      const { G } = K, ms = MOVE_MS.parade;
      const poses = ['upright', 'maneki', 'blink', 'stand', 'sit', 'upright', 'maneki', 'blink'];
      const w = G.w * 0.5;
      poses.forEach((p, i) => {
        K.add('mvx-marcher', `<div class="mvx-bob" style="animation-delay:-${(i * 0.13).toFixed(2)}s">${miniCat(p, POP[i % 7])}${i % 3 === 0 ? '<span class="mvx-flag"></span>' : ''}</div>`,
          `width:${w}px;bottom:${G.bottom + 2}px;--from:${-w - 10}px;--to:${G.sw + 10}px;animation-delay:${K.s(ms * 0.12 + i * 230)}`);
      });
      for (let i = 0; i < 8; i++) K.add('mvx-note', pickRandom(['♪', '♫']), `left:${rnd(5, 90).toFixed(0)}%;top:${rnd(20, 60).toFixed(0)}%;color:${pickRandom(POP.slice(0, 7))};animation-delay:${K.s(ms * 0.15 + i * 240)}`);
      K.word('ぱっぱかぱーん', 10, 12, ms * 0.1, '#ffa95e', 24, -6);
    },
    pinball(K) {
      const { G } = K, ms = MOVE_MS.pinball;
      const hits = [[0.1, 0, 0.6], [0.2, 0.45, 0], [0.3, 1, 0.4], [0.4, 0.3, 0], [0.5, 1, 0.2], [0.6, 0, 0.7], [0.7, 0.6, 0], [0.8, 1, 0.55]];
      hits.forEach(([t, fx, fy]) => {
        const x = 14 + fx * (G.sw - 28), y = 14 + fy * (G.sh - 28);
        K.burst(x, y, ms * t, 10, 50, ['#ffd94a', '#fff', '#ff9fbb']);
        K.word(pickRandom(['+100', '+500', 'BONUS', '+1000']), Math.min(Math.max(x - 30, 6), G.sw - 90), Math.min(Math.max(y - 16, 6), G.sh - 40), ms * t, pickRandom(POP.slice(0, 6)), 20, rnd(-12, 12));
      });
    },
    zoomin(K) {
      const { G } = K, ms = MOVE_MS.zoomin;
      K.add('mvx-cam', '<i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><b>● REC</b>', '');
      K.word('アップ!', 14, G.sh * 0.15, ms * 0.25, '#ff9fbb', 28, -8);
      btnVar('--zy', (G.sh * 0.48 - (G.y + G.h * 0.44)) + 'px');
    },
    rainbow(K) {
      const { G } = K, ms = MOVE_MS.rainbow;
      const ox = G.cx, oy = G.y + G.h * 0.85;
      const R = Math.min(G.cx - 18, oy - 50, 150);
      btnVar('--arc', R + 'px');
      const bands = ['#ff6b6b', '#ffa95e', '#ffd94a', '#8fe8c8', '#8fd0ff', '#c9a7ff'];
      const rr = R - 10;
      let p = '';
      bands.forEach((c, i) => { const r = rr - i * 9; p += `<path d="M${-r} 0 A ${r} ${r} 0 0 1 ${r} 0" stroke="${c}" pathLength="100"/>`; });
      K.add('mvx-rainbow', `<svg viewBox="${-rr - 8} ${-rr - 8} ${(rr + 8) * 2} ${rr + 8 + 6}"><path class="mvx-rbo" d="M${-rr - 5} 0 A ${rr + 5} ${rr + 5} 0 0 1 ${rr + 5} 0" pathLength="100"/>${p}<path class="mvx-rbo" d="M${-rr + bands.length * 9 - 4} 0 A ${rr - bands.length * 9 + 4} ${rr - bands.length * 9 + 4} 0 0 1 ${rr - bands.length * 9 + 4} 0" pathLength="100"/></svg>`,
        `left:${ox - rr - 8}px;top:${oy - rr - 8}px;width:${(rr + 8) * 2}px`);
      K.stars(16, 2600, [5, 95, 5, 70]);
      K.word('にじ〜', G.cx - 34, Math.max(oy - R - 60, 4), ms * 0.2, '#fff', 24, -4);
    },

    // ---- ちょっと変な ----
    squash(K) { const { G } = K, ms = MOVE_MS.squash; K.word('ぺしゃっ', G.cx - 48, G.y + G.h * 0.4, ms * 0.22, '#ff9fbb', 28, -6); K.word('ぽよん', G.cx + 10, G.y - 30, ms * 0.7, '#8fe8c8', 24, 8); K.puffs(G.cx, G.y + G.h, 6, ms * 0.22, 90); },
    shadow(K) { const { G } = K; K.add('mvx-shadow', nowCat(), `left:${G.x}px;top:${G.y}px;width:${G.w}px`); K.word('…あれ?', G.cx - 70, G.y - 20, 500, '#fff', 20, -6); },
    afterimage(K) {
      const { G } = K, ms = MOVE_MS.afterimage;
      const pos = [[0, 0], [0.1, -95], [0.2, 95], [0.3, -60], [0.4, 60], [0.5, -95], [0.6, 95], [0.7, -30], [0.8, 30]];
      pos.forEach(([t, x], i) => { if (i) K.add('mvx-ghost2', nowCat(), `left:${G.x}px;top:${G.y}px;width:${G.w}px;--gx:${x}%;--gc:${POP[i % 6]};animation-delay:${K.s(ms * (t + 0.1))}`); });
      for (let i = 0; i < 6; i++) K.add('mvx-speed', '', `top:${G.y + G.h * (0.1 + i * 0.15)}px;animation-delay:${K.s(i * 160)}`);
    },
    neck(K) { const { G } = K; K.word('びよよーん', G.cx + 10, 20, 500, '#8fe8c8', 24, 8); },
    jelly(K) { const { G } = K; K.word('ぷるるん', G.cx + 20, G.y - 10, 200, '#ff9fbb', 24, 8); },
    peek(K) { const { G } = K, ms = MOVE_MS.peek; K.word('ちらっ', 30, G.y - 10, ms * 0.42, '#ffd94a', 24, -6); },
    hop3(K) {
      const { G } = K, ms = MOVE_MS.hop3;
      [0.2, 0.46, 0.8].forEach((t, i) => { K.puffs(G.cx, G.y + G.h, 2 + i * 2, ms * t, 30 + i * 30); K.word(['ホップ', 'ステップ', 'ジャンプ!'][i], G.cx + [-120, 30, -70][i], G.bb + [40, 10, 70][i], ms * [0.08, 0.3, 0.56][i], POP[i], 22 + i * 4, [-8, 8, -6][i]); });
      K.burst(G.cx, G.y + G.h, ms * 0.8, 14, 90);
    },
    moonwalk(K) {
      const { G } = K;
      K.inBtn('mvx-hat', '<svg viewBox="0 0 100 50"><path d="M4 40 Q50 52 96 40 Q80 36 76 30 L72 8 Q50 0 28 8 L24 30 Q20 36 4 40 Z" fill="#2b2b2b" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/><path d="M26 26 Q50 32 74 26" stroke="#ff9fbb" stroke-width="5" fill="none"/></svg>');
      K.dark('#14102e', 0.35, 0.05, 0.9);
      K.inBtn('mvx-spot', '', '');
      K.word('ポウッ!', G.cx + 20, G.y - 20, MOVE_MS.moonwalk * 0.8, '#ffd94a', 26, 10);
    },
    swing(K) { K.inBtn('mvx-rope', '', ''); },
    dizzy(K) {
      const { G } = K;
      const orb = K.inBtn('mvx-orbit', '', '');
      ['★', '✦', '★', '✦'].forEach((c, i) => { const o = document.createElement('span'); o.className = 'mvx-ox'; o.style.animationDelay = `-${(i * 0.3).toFixed(2)}s`; o.innerHTML = `<span class="mvx-oy" style="animation-delay:-${(i * 0.3 + 0.3).toFixed(2)}s;color:${POP[i]}">${c}</span>`; orb.appendChild(o); });
      K.word('@_@', G.cx + 30, G.y - 10, 300, '#fff', 22, 10);
    },
    sneak(K) {
      const { G } = K, ms = MOVE_MS.sneak;
      K.dark('#2a2560', 0.3, 0.05, 0.9);
      for (let i = 0; i < 6; i++) K.add('mvx-paw', '', `left:${G.cx + G.w * (0.12 + i * 0.13) - 8}px;top:${G.y + G.h - 4 + (i % 2) * 6}px;animation-delay:${K.s(ms * (0.06 + i * 0.07))}`);
      K.word('そろ〜り', G.cx - 100, G.y - 6, 200, '#c9a7ff', 22, -6);
    },
    fold(K) {
      const n = 8, html = $('catPose').innerHTML;
      for (let i = 0; i < n; i++) {
        const l = (i * 100) / n, r = 100 - ((i + 1) * 100) / n;
        K.inBtn('mvx-slice ' + (i % 2 ? 'odd' : 'even'), `<svg class="cat" viewBox="0 0 240 200">${html}</svg>`, `clip-path:inset(-20% ${r}% -20% ${l}%);--sx:${(50 - (l + 100 / n / 2)).toFixed(1)}%;transform-origin:${(l + 100 / n / 2).toFixed(1)}% 50%`);
      }
      K.word('ぱたぱた', K.G.cx + 20, K.G.y - 20, 200, '#ffd94a', 22, 8);
    },
    split(K) {
      const { G } = K, ms = MOVE_MS.split, html = $('catPose').innerHTML;
      K.inBtn('mvx-half left', `<svg class="cat" viewBox="0 0 240 200">${html}</svg>`, '');
      K.inBtn('mvx-half right', `<svg class="cat" viewBox="0 0 240 200">${html}</svg>`, '');
      K.word('ぱかっ', G.cx - 40, G.y - 20, ms * 0.15, '#ff9fbb', 26, -6);
      K.word('ぴたっ', G.cx - 30, G.y - 10, ms * 0.72, '#8fe8c8', 26, 6);
    },
    orbit(K) {
      const { G } = K;
      const orb = K.add('mvx-orbit2', '', `left:${G.cx}px;top:${G.y + G.h * 0.5}px`);
      const poses = ['sit', 'roll', 'blink', 'loaf', 'stare', 'maneki'];
      poses.forEach((p, i) => {
        const o = document.createElement('span'); o.className = 'mvx-ox';
        const d = -(i * 2.4 / poses.length);
        o.style.animationDelay = `${d.toFixed(2)}s`;
        o.innerHTML = `<span class="mvx-oy" style="animation-delay:${(d - 0.6).toFixed(2)}s">${miniCat(p, POP[i])}</span>`;
        orb.appendChild(o);
      });
      K.stars(12, 2400);
    },
    bubble(K) {
      const { G } = K, ms = MOVE_MS.bubble;
      K.inBtn('mvx-soap', '<i></i>', '');
      K.burst(G.cx, G.y + G.h * 0.5 - G.h * 1.1, ms * 0.7, 14, 80, ['#8fd0ff', '#fff', '#ff9fbb']);
      K.word('ぱちん!', G.cx + 10, Math.max(G.y - G.h * 1.1, 6), ms * 0.7, '#8fd0ff', 26, 8);
      for (let i = 0; i < 7; i++) K.add('mvx-minibub', '', `left:${rnd(10, 90).toFixed(0)}%;--s:${rnd(0.4, 1).toFixed(2)};animation-delay:${K.s(rnd(0, ms * 0.6))}`);
    },
    skate(K) {
      const { G } = K;
      K.add('mvx-ice', '', `top:${G.y + G.h - 18}px`);
      for (let i = 0; i < 12; i++) K.add('mvx-star', '✧', `left:${rnd(5, 90).toFixed(0)}%;top:${G.y + G.h - rnd(0, 30)}px;animation-delay:${K.s(rnd(0, 2200))};color:#fff;font-size:18px`);
      K.word('すい〜', G.cx - 20, G.y - 30, 300, '#8fd0ff', 24, -6);
    },
    statue(K) {
      const { G } = K, ms = MOVE_MS.statue;
      K.inBtn('mvx-cracks', '<svg viewBox="0 0 240 200"><path d="M120 40 L112 70 L126 92 L114 120 L128 150 L118 186 M112 70 L92 80 M126 92 L150 98 M114 120 L90 132 M128 150 L152 160" fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="100"/></svg>', '');
      K.add('mvx-pedestal', '', `left:${G.cx}px;top:${G.y + G.h - 10}px`);
      for (let i = 0; i < 10; i++) K.inBtn('mvx-chip', '', `left:${rnd(25, 75).toFixed(0)}%;top:${rnd(30, 80).toFixed(0)}%;--sx:${rnd(-80, 80).toFixed(0)}px;--rot:${rnd(-300, 300).toFixed(0)}deg;animation-delay:${K.s(ms * 0.74 + rnd(0, 120))}`);
      K.word('カチーン', G.cx - 100, G.y - 10, ms * 0.08, '#cfd6e6', 26, -6);
      K.word('ピシッ', G.cx + 30, G.y + 10, ms * 0.6, '#fff', 22, 8);
      K.flash(ms * 0.76, '#fff', 240, false);
    },
    teleport(K) {
      const { G } = K, ms = MOVE_MS.teleport;
      K.inBtn('mvx-tring', '', `animation-duration:${K.s(ms / 4)};animation-delay:${K.s(ms * 0.12)}`);
      K.inBtn('mvx-tbeam', '', `animation-duration:${K.s(ms / 4)};animation-delay:${K.s(ms * 0.1)}`);
      K.stars(14, 2400);
      K.word('シュン', G.cx - 40, G.y - 30, 100, '#c9a7ff', 22, -8);
    },
    pulse(K) {
      const { G } = K, ms = MOVE_MS.pulse;
      [0.04, 0.37, 0.7].forEach((t) => { K.add('mvx-ring', '', `left:${G.cx}px;top:${G.y + G.h * 0.6}px;animation-delay:${K.s(ms * t)};border-color:#ff6b6b`); K.word('ドクン', G.cx + rnd(-110, 30), G.y + rnd(-40, 10), ms * t, '#ff6b6b', 24, rnd(-10, 10)); });
      K.dark('#ff6b6b', 0.25, 0.04, 0.9);
    },
    yoyo(K) { K.inBtn('mvx-string', '', ''); },
    lean(K) { const { G } = K; K.word('かたむく〜', 20, 20, 300, '#ffa95e', 24, -10); },
    leaf(K) {
      K.rain(14, () => `<span class="mvx-leafy" style="background:${pickRandom(['#ffa95e', '#ffd94a', '#b4ec9a', '#ff9fbb'])}"></span>`, { delayMax: 2000, dur: [1600, 2400], size: [14, 22], cls: 'mvx-flutter' });
    },
    stack(K) {
      const { G } = K, ms = MOVE_MS.stack;
      const tw = K.add('mvx-tower', '', `left:${G.x}px;width:${G.w}px;bottom:${G.bottom}px;height:${G.sh}px`);
      const mw = G.w * 0.6, mh = G.h * 0.6, step = mh * 0.62;
      ['sit', 'blink', 'stare', 'maneki'].forEach((p, i) => {
        const d = document.createElement('div');
        d.className = 'mvx-stackcat';
        d.style.cssText = `width:${mw}px;left:${(G.w - mw) / 2 + rnd(-6, 6)}px;bottom:${mh * 0.72 + step * i}px;--fall:${-(G.sh)}px;--jx:${(i % 2 ? 1 : -1) * (120 + i * 30)}px;animation-delay:${K.s(ms * (0.08 + i * 0.12))}`;
        d.innerHTML = miniCat(p, POP[i]);
        tw.appendChild(d);
      });
      K.word('タワー!', G.cx + 20, 14, ms * 0.6, '#ffd94a', 26, 8);
    },
    spring(K) {
      const { G } = K, ms = MOVE_MS.spring;
      K.add('mvx-spring', '<svg viewBox="0 0 80 60" preserveAspectRatio="none"><path d="M10 56 L70 56 M16 56 L64 44 L16 32 L64 20 L16 8 M10 4 L70 4" fill="none" stroke="#2b2b2b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>', `left:${G.cx}px;top:${G.y + G.h * 0.7}px;height:${G.h * 0.3}px`);
      K.word('びよーん!', G.cx - 100, 20, ms * 0.24, '#8fe8c8', 28, -8);
      K.puffs(G.cx, G.y + G.h, 5, ms * 0.82, 60);
    },
  };

  // 動きのあいだだけ使う CSS の値（あとで消す）
  let btnVars = [];
  function btnVar(k, v) { $('catBtn').style.setProperty(k, v); btnVars.push(k); }

  function bigMove(name) {
    if (moving) return null; // 動いている最中は、つぎの動きを始めない
    const btn = $('catBtn'), stage = $('stage');
    if (!name) {
      const withLines = MOVES.filter((m) => m !== lastMove && (!M.moves || M.moves[m]));
      name = pickRandom(withLines.length ? withLines : MOVES.filter((m) => m !== lastMove));
    }
    if (!MOVES.includes(name)) return null;
    lastMove = name;
    clearTimeout(poseTimer); clearTimeout(moveTimer);
    document.querySelectorAll('.mv-extra').forEach((n) => n.remove());
    const back = window.TapPoses.includes(currentPose) ? (cheer.back || currentPose) : currentPose;
    cheer.back = back;
    moving = true;
    const PP = window.PoseParts;
    if (name === 'headspin' && PP) {
      $('catPose').innerHTML = PP.sitTorso() + `<g class="mv-head">${PP.headG('open')}</g>`;
      currentPose = 'headspin';
    } else if (name === 'neck' && PP) {
      $('catPose').innerHTML = PP.sitTorso() + `<g class="mvx-neckall"><path class="b mvx-neckpipe" vector-effect="non-scaling-stroke" d="M101 128 L101 96 L141 96 L141 128 Z"/><path class="l thin mvx-neckpipe" vector-effect="non-scaling-stroke" d="M110 120 L132 120 M110 110 L132 110 M110 100 L132 100"/><g class="mvx-neckhead">${PP.headG('dot')}</g></g>`;
      currentPose = 'neck';
    } else if (name === 'dizzy' && PP) {
      const swirl = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="#fffdf8"/><path class="l thin" d="M${x} ${y} m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 1 1 3.5 3.5 a5.5 5.5 0 1 1 -5.5 -5.5 a7.5 7.5 0 1 1 7.5 7.5"/>`;
      $('catPose').innerHTML = PP.sitTorso() + `<g transform="translate(121 92) rotate(-8) translate(-121 -92)">${PP.headG('closed')}${swirl(100, 88)}${swirl(142, 88)}</g>`;
      currentPose = 'dizzy';
    } else if (MOVE_POSE[name] && Poses[MOVE_POSE[name]]) drawCat(MOVE_POSE[name], propsFor(new Date()));
    const ms = MOVE_MS[name] || 1800;
    btn.className = 'cat-btn';
    void btn.offsetWidth;
    // 長さは CSS からも使う
    stage.style.setProperty('--mvd', ms + 'ms');
    // おまけの絵と、動きに使う値は、動きを始める前に用意する（あとから値を入れると反映されないことがある）
    try { if (EXTRAS[name]) EXTRAS[name](moveKit(stage, btn, ms)); } catch (err) { /* おまけの絵が出なくても、動きはつづける */ }
    void btn.offsetWidth;
    btn.classList.add('mv', 'mv-' + name);
    stage.classList.add('mvs-' + name);
    stage.classList.toggle('mv-sinking', name === 'sink');
    document.documentElement.classList.add('mvp-' + name);
    if (name === 'clone') {
      [-2, -1, 1, 2].forEach((side, i) => {
        const c = btn.cloneNode(true);
        c.removeAttribute('id'); c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
        c.className = 'cat-btn mv-extra mvx-ghost';
        c.style.setProperty('--dx', side * 52 + '%');
        c.style.setProperty('--gc', POP[i]);
        c.style.animationDelay = (Math.abs(side) - 1) * 0.15 + 's';
        c.style.left = btn.offsetLeft + 'px'; c.style.top = btn.offsetTop + 'px'; c.style.margin = '0';
        c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
        btn.parentNode.insertBefore(c, btn);
      });
    }
    moveTimer = setTimeout(() => {
      btn.className = 'cat-btn';
      stage.classList.remove('mv-sinking', 'mvs-' + name);
      stage.style.removeProperty('--mvd');
      document.documentElement.classList.remove('mvp-' + name);
      btnVars.forEach((k) => btn.style.removeProperty(k)); btnVars = [];
      document.querySelectorAll('.mv-extra').forEach((n) => n.remove());
      moving = false;
      drawCat(back, propsFor(new Date()));
    }, ms);
    return name;
  }

  // おためし用（プレビューで動きを選んで見る）
  window.bigMove = (name) => { const mv = bigMove(name); if (mv && M.moves && M.moves[mv]) showBubble(pickRandom(M.moves[mv])); return mv; };
  window.bigMove.list = MOVES.slice();
  window.bigMove.ms = (name) => MOVE_MS[name] || 1800;

  $('catBtn').addEventListener('click', (e) => {
    if (moving) return; // 派手な動きの最中は、なでても何もしない
    // 3回に1回くらい、派手に動く
    if (M.moves && !reduceMotion() && Math.random() < 0.34) {
      const mv = bigMove();
      if (mv && M.moves[mv]) showBubble(pickRandom(M.moves[mv]));
      return;
    }
    const pose = cheer();
    showBubble(pickRandom(M.tap[pose]));
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = pickRandom(['♥', '♪', '♥', '…']);
    heart.style.color = pickRandom(['#e9928c', '#2b2b2b']);
    const r = $('stage').getBoundingClientRect();
    heart.style.left = ((e.clientX || r.width / 2 + r.left) - r.left - 11) + 'px';
    heart.style.top = ((e.clientY || r.top + r.height / 2) - r.top - 20) + 'px';
    $('stage').appendChild(heart);
    setTimeout(() => heart.remove(), 1300);
  });

  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ---------- おさんぽ日記 ----------
  let calMonth = new Date();
  calMonth.setDate(1);
  function renderCalendar() {
    const y = calMonth.getFullYear(), m = calMonth.getMonth();
    $('monthLabel').textContent = `${y}年${m + 1}月`;
    const cal = $('calendar');
    cal.innerHTML = '';
    const startW = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const todayKey = ymd(new Date());
    let sum = 0, count = 0;
    for (let i = 0; i < startW; i++) {
      const e = document.createElement('div');
      e.className = 'day empty';
      cal.appendChild(e);
    }
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const k = ymd(date);
      const s = state.days[k];
      const el = document.createElement('button');
      el.className = 'day';
      el.dataset.date = k;
      if (JpCalendar.holiday(date) || date.getDay() === 0) el.classList.add('holiday');
      if (k === todayKey) el.classList.add('today');
      if (k === selDay) el.classList.add('sel');
      if (state.memos && state.memos[k]) el.classList.add('has-memo');
      let html = `<span class="n">${d}</span>`;
      if (s != null) {
        sum += s; count++;
        const lv = s >= 12000 ? 4 : s >= 8000 ? 3 : s >= 5000 ? 2 : 1;
        el.classList.add('lv' + lv);
        html += `<span class="paw">${PAW}</span><span class="s">${s >= 10000 ? (s / 10000).toFixed(1) + '万' : s.toLocaleString()}</span>`;
      }
      el.innerHTML = html;
      cal.appendChild(el);
    }
    $('monthSum').textContent = count
      ? `この月は ${count}日ぶん、あわせて ${fmtKm(km(sum))} km でした`
      : 'この月の記録は、まだありません';
    renderMemo();
  }

  // ---------- 日付ごとのメモ ----------
  let selDay = ymd(new Date());
  function renderMemo() {
    const d = parseYmd(selDay);
    const s = state.days[selDay];
    $('memoLabel').textContent = `${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）のメモ`;
    $('memoSteps').textContent = s != null ? `${s.toLocaleString()}歩` : '';
    const box = $('memoText');
    if (document.activeElement !== box) box.value = (state.memos && state.memos[selDay]) || '';
  }
  $('calendar').addEventListener('click', (e) => {
    const cell = e.target.closest('.day[data-date]');
    if (!cell) return;
    selDay = cell.dataset.date;
    $('memoText').blur();
    renderCalendar();
  });
  let memoTimer = null;
  function saveMemo() {
    state.memos = state.memos || {};
    const v = $('memoText').value.replace(/\s+$/, '');
    if (v) state.memos[selDay] = v; else delete state.memos[selDay];
    save();
    const cell = $('calendar').querySelector(`.day[data-date="${selDay}"]`);
    if (cell) cell.classList.toggle('has-memo', !!v);
  }
  $('memoText').addEventListener('input', () => { clearTimeout(memoTimer); memoTimer = setTimeout(saveMemo, 400); });
  $('memoText').addEventListener('blur', () => { clearTimeout(memoTimer); saveMemo(); });
  $('prevMonth').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
  $('nextMonth').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });

  // ---------- シート ----------
  function openSheet(id) {
    const sheet = $(id);
    sheet.querySelector('.sheet-inner').style.transform = '';
    sheet.style.background = '';
    sheet.hidden = false;
  }
  function closeSheet(sheet) {
    sheet.hidden = true;
    sheet.querySelector('.sheet-inner').style.transform = '';
    sheet.style.background = '';
    render();
  }
  document.querySelectorAll('.sheet').forEach((sheet) => {
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet || e.target.hasAttribute('data-close')) closeSheet(sheet);
    });
    // 下にスワイプして閉じる（いちばん上までスクロールしているときだけ）
    const inner = sheet.querySelector('.sheet-inner');
    const grab = document.createElement('div');
    grab.className = 'grabber';
    inner.prepend(grab);
    let startY = 0, startX = 0, startT = 0, dy = 0, mode = null;
    inner.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      startY = t.clientY; startX = t.clientX; startT = Date.now(); dy = 0;
      mode = inner.scrollTop <= 0 ? 'maybe' : null;
    }, { passive: true });
    inner.addEventListener('touchmove', (e) => {
      if (!mode) return;
      const t = e.touches[0];
      const y = t.clientY - startY, x = t.clientX - startX;
      if (mode === 'maybe') {
        if (Math.abs(y) < 8 && Math.abs(x) < 8) return;
        // 横の動き（1時間ごとの天気の横スクロールなど）や上へのスクロールは、ふつうに動かす
        mode = y > 0 && Math.abs(y) > Math.abs(x) ? 'drag' : null;
        if (!mode) return;
        inner.style.transition = 'none';
      }
      dy = Math.max(0, y);
      e.preventDefault();
      inner.style.transform = `translateY(${dy}px)`;
      sheet.style.background = `rgba(43, 43, 43, ${0.3 * Math.max(0, 1 - dy / inner.offsetHeight)})`;
    }, { passive: false });
    const end = () => {
      if (mode !== 'drag') { mode = null; return; }
      mode = null;
      const fast = dy / Math.max(1, Date.now() - startT) > 0.6;
      inner.style.transition = 'transform 0.22s ease-out';
      if (dy > Math.min(140, inner.offsetHeight * 0.3) || (fast && dy > 30)) {
        inner.style.transform = `translateY(${inner.offsetHeight + 40}px)`;
        sheet.style.background = 'rgba(43, 43, 43, 0)';
        setTimeout(() => { inner.style.transition = ''; closeSheet(sheet); }, 220);
      } else {
        inner.style.transform = '';
        sheet.style.background = '';
        setTimeout(() => { inner.style.transition = ''; }, 220);
      }
    };
    inner.addEventListener('touchend', end);
    inner.addEventListener('touchcancel', end);
  });
  $('openDiary').addEventListener('click', () => {
    calMonth = new Date(); calMonth.setDate(1);
    selDay = ymd(new Date());
    renderCalendar();
    openSheet('diarySheet');
  });
  $('weatherPill').addEventListener('click', () => {
    openDay = null;
    renderWeekWeather();
    openSheet('weatherSheet');
  });
  $('openSettings').addEventListener('click', () => {
    $('catName').value = state.settings.catName || '';
    $('catBirthday').value = state.settings.catBirthday || '';
    $('manualDate').value = ymd(new Date());
    $('manualSteps').value = '';
    $('baseUrl').textContent = location.origin + location.pathname + '?steps=';
    openSheet('settingsSheet');
  });
  $('catName').addEventListener('change', (e) => { state.settings.catName = e.target.value.trim(); save(); });
  $('catBirthday').addEventListener('change', (e) => { state.settings.catBirthday = e.target.value; save(); });
  $('manualSave').addEventListener('click', () => {
    const date = $('manualDate').value;
    const steps = parseInt($('manualSteps').value, 10);
    if (!parseYmd(date) || !Number.isFinite(steps) || steps < 0) { toast('日付と歩数を入れてください'); return; }
    recordSteps(date, steps, true);
    $('manualSteps').value = '';
    toast(`${date.slice(5).replace('-', '/')} に ${steps.toLocaleString()}歩 を入れました`);
  });

  // ---------- バックアップ ----------
  const BACKUP_PREFIX = 'TEKUTEKU1:';
  function makeBackup() {
    const json = JSON.stringify({ days: state.days, settings: state.settings, memos: state.memos || {}, todo: state.todo || null });
    return BACKUP_PREFIX + btoa(unescape(encodeURIComponent(json)));
  }
  $('backupCopy').addEventListener('click', () => {
    const code = makeBackup();
    const area = $('backupText');
    area.value = code;
    const done = () => toast('コピーしました。メモ帳などに貼っておいてください');
    const fallback = () => { area.focus(); area.select(); toast('選択した文字を、コピーしてください'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, fallback);
    else fallback();
  });
  $('backupRestore').addEventListener('click', () => {
    const raw = $('backupText').value.trim();
    try {
      if (!raw.startsWith(BACKUP_PREFIX)) throw new Error('prefix');
      const data = JSON.parse(decodeURIComponent(escape(atob(raw.slice(BACKUP_PREFIX.length)))));
      let n = 0;
      Object.entries(data.days || {}).forEach(([d, v]) => {
        if (!parseYmd(d) || !Number.isFinite(v)) return;
        state.days[d] = Math.max(state.days[d] || 0, v);
        n++;
      });
      Object.entries(data.settings || {}).forEach(([k, v]) => { if (!state.settings[k]) state.settings[k] = v; });
      // メモは、いまのメモが無い日だけもどす
      state.memos = state.memos || {};
      Object.entries(data.memos || {}).forEach(([d, v]) => { if (parseYmd(d) && typeof v === 'string' && !state.memos[d]) state.memos[d] = v; });
      // ToDo は、まだ無いジャンルと項目を足す
      if (data.todo && Array.isArray(data.todo.genres)) {
        // いまの ToDo が空なら、バックアップのものをそのまま使う
        if (!state.todo || !(state.todo.items || []).length) state.todo = { genres: [], items: [], current: null };
        const t = todo();
        data.todo.genres.forEach((g) => { if (g && g.id && !t.genres.some((x) => x.id === g.id)) t.genres.push({ id: g.id, name: String(g.name || '') }); });
        (data.todo.items || []).forEach((it) => { if (it && it.id && !t.items.some((x) => x.id === it.id)) t.items.push(it); });
        Object.entries(data.todo.pins || {}).forEach(([g, list]) => {
          if (!Array.isArray(list)) return;
          const mine = (t.pins[g] = t.pins[g] || []);
          list.forEach((p) => { if (typeof p === 'string' && !mine.includes(p)) mine.push(p); });
        });
      }
      save();
      $('backupText').value = '';
      toast(`${n}日ぶんの記録を、もどしました`);
    } catch (e) {
      toast('バックアップの文字を、まるごと貼ってください');
    }
  });

  // ---------- ToDo（ジャンル別） ----------
  function todo() {
    if (!state.todo || !Array.isArray(state.todo.genres)) {
      state.todo = { genres: [{ id: 'g-shop', name: '買い物' }, { id: 'g-do', name: 'やること' }], items: [], current: 'g-shop' };
    }
    state.todo.items = state.todo.items || [];
    state.todo.pins = state.todo.pins || {}; // ジャンルごとの「よく使う」
    return state.todo;
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const escHtml = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let todoEditing = false;

  let pinsOpen = false; // 「よく使う」は、タップしたときだけ開く
  function renderTodo() {
    const t = todo();
    if (!t.genres.some((g) => g.id === t.current)) t.current = t.genres[0] ? t.genres[0].id : null;
    $('todoTabs').hidden = todoEditing;
    $('todoMain').hidden = todoEditing || !t.current;
    $('todoEdit').hidden = !todoEditing;
    $('todoEditBtn').textContent = todoEditing ? '完了' : '編集';
    if (todoEditing) {
      $('todoGenreList').innerHTML = t.genres.map((g, i) =>
        `<div class="tg-row" data-id="${g.id}">` +
        `<input class="tg-name" value="${escHtml(g.name)}" maxlength="12" aria-label="ジャンルの名前">` +
        `<button class="tg-btn" data-act="up" ${i === 0 ? 'disabled' : ''} aria-label="上へ">↑</button>` +
        `<button class="tg-btn" data-act="down" ${i === t.genres.length - 1 ? 'disabled' : ''} aria-label="下へ">↓</button>` +
        `<button class="tg-btn del" data-act="del" aria-label="削除">削除</button></div>`).join('') ||
        '<p class="sub center">ジャンルがありません。下から足してください</p>';
      return;
    }
    $('todoTabs').innerHTML = t.genres.map((g) => {
      const left = t.items.filter((x) => x.genre === g.id && !x.done).length;
      return `<button class="tt-tab${g.id === t.current ? ' on' : ''}" data-id="${g.id}">${escHtml(g.name)}${left ? `<span class="tt-n">${left}</span>` : ''}</button>`;
    }).join('');
    const list = t.items.filter((x) => x.genre === t.current);
    const pins = t.pins[t.current] || [];
    // よく使う：押すとそのまま足せる（もう入っているものは薄く）
    $('todoPinToggle').hidden = !pins.length;
    $('todoPinToggle').classList.toggle('open', pinsOpen);
    $('todoPinToggle').setAttribute('aria-expanded', pinsOpen);
    $('todoPinToggle').innerHTML = `📌 よく使う（${pins.length}）<span class="tp-arrow">${pinsOpen ? '▲' : '▼'}</span>`;
    $('todoPins').hidden = !pins.length || !pinsOpen;
    $('todoPins').innerHTML = pins.map((p, i) => {
      const inList = list.some((x) => !x.done && x.text === p);
      return `<span class="tp-chip${inList ? ' in' : ''}"><button class="tp-add" data-i="${i}">${inList ? '✓ ' : '＋ '}${escHtml(p)}</button>` +
        `<button class="tp-x" data-i="${i}" aria-label="よく使うから外す">×</button></span>`;
    }).join('');
    const sorted = [...list.filter((x) => !x.done), ...list.filter((x) => x.done)];
    $('todoList').innerHTML = sorted.map((x) =>
      `<li class="td-item${x.done ? ' done' : ''}" data-id="${x.id}">` +
      `<button class="td-check" data-act="toggle" aria-label="${x.done ? 'もどす' : 'おわった'}">${x.done ? '✓' : ''}</button>` +
      `<span class="td-text">${escHtml(x.text)}</span>` +
      `<button class="td-pin${pins.includes(x.text) ? ' on' : ''}" data-act="pin" aria-label="よく使うに${pins.includes(x.text) ? '入っています' : '入れる'}">📌</button>` +
      `<button class="td-del" data-act="remove" aria-label="消す">×</button></li>`).join('') ||
      '<li class="td-empty">まだ何もありません</li>';
    $('todoClearDone').hidden = !list.some((x) => x.done);
    const g = t.genres.find((x) => x.id === t.current);
    $('todoInput').placeholder = g ? `${g.name}に足す` : '';
  }

  function addTodo() {
    const t = todo();
    const v = $('todoInput').value.trim();
    if (!v || !t.current) return;
    t.items.push({ id: uid(), genre: t.current, text: v.slice(0, 100), done: false });
    $('todoInput').value = '';
    save(); renderTodo();
  }
  // 「足す」を押しても、キーボードを閉じない（続けて入力できるように）
  function tapKeep(el, fn) {
    let sx = 0, sy = 0, moved = false;
    el.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = false; }, { passive: true });
    el.addEventListener('touchmove', (e) => { if (Math.abs(e.touches[0].clientX - sx) > 10 || Math.abs(e.touches[0].clientY - sy) > 10) moved = true; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (moved || !e.target.closest('button')) return;
      const input = $('todoInput'), had = document.activeElement === input;
      e.preventDefault(); // これで入力欄からフォーカスが外れない
      fn(e);
      if (had) input.focus();
    });
    el.addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
    el.addEventListener('click', fn);
  }
  tapKeep($('todoAdd'), addTodo);
  $('todoInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addTodo(); } });
  $('todoTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tt-tab');
    if (!b) return;
    todo().current = b.dataset.id; save(); renderTodo();
  });
  $('todoList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const t = todo();
    const id = b.closest('.td-item').dataset.id;
    const it = t.items.find((x) => x.id === id);
    if (!it) return;
    if (b.dataset.act === 'pin') {
      const pins = (t.pins[it.genre] = t.pins[it.genre] || []);
      const i = pins.indexOf(it.text);
      if (i >= 0) pins.splice(i, 1);
      else { pins.push(it.text); toast('「よく使う」に入れました'); }
    } else if (b.dataset.act === 'toggle') {
      it.done = !it.done;
      if (it.done && M.todoDone) toast(pickRandom(M.todoDone));
    } else {
      t.items = t.items.filter((x) => x.id !== id);
    }
    save(); renderTodo();
  });
  $('todoPinToggle').addEventListener('click', () => { pinsOpen = !pinsOpen; renderTodo(); });
  $('todoPins').addEventListener('click', (e) => {
    const t = todo();
    const pins = t.pins[t.current] || [];
    const add = e.target.closest('.tp-add'), x = e.target.closest('.tp-x');
    if (add) {
      const text = pins[+add.dataset.i];
      if (!text) return;
      const done = t.items.find((it) => it.genre === t.current && it.text === text);
      if (done && !done.done) return; // もう入っている
      if (done) done.done = false; // 終わったものに残っていたら、もどす
      else t.items.push({ id: uid(), genre: t.current, text, done: false });
    } else if (x) {
      pins.splice(+x.dataset.i, 1);
    } else return;
    save(); renderTodo();
  });
  $('todoClearDone').addEventListener('click', () => {
    const t = todo();
    t.items = t.items.filter((x) => !(x.genre === t.current && x.done));
    save(); renderTodo();
  });
  $('todoEditBtn').addEventListener('click', () => {
    if (todoEditing) {
      // 名前を保存（空なら、もとの名前のまま）
      const t = todo();
      $('todoGenreList').querySelectorAll('.tg-row').forEach((row) => {
        const g = t.genres.find((x) => x.id === row.dataset.id);
        const v = row.querySelector('.tg-name').value.trim();
        if (g && v) g.name = v.slice(0, 12);
      });
      save();
    }
    todoEditing = !todoEditing;
    renderTodo();
  });
  $('todoGenreList').addEventListener('input', (e) => {
    const row = e.target.closest('.tg-row');
    if (!row) return;
    const g = todo().genres.find((x) => x.id === row.dataset.id);
    const v = e.target.value.trim();
    if (g && v) { g.name = v.slice(0, 12); save(); }
  });
  $('todoGenreList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const t = todo();
    const id = b.closest('.tg-row').dataset.id;
    const i = t.genres.findIndex((x) => x.id === id);
    if (b.dataset.act === 'up' && i > 0) [t.genres[i - 1], t.genres[i]] = [t.genres[i], t.genres[i - 1]];
    if (b.dataset.act === 'down' && i < t.genres.length - 1) [t.genres[i + 1], t.genres[i]] = [t.genres[i], t.genres[i + 1]];
    if (b.dataset.act === 'del') {
      const n = t.items.filter((x) => x.genre === id).length;
      if (n && !confirm(`「${t.genres[i].name}」には ${n}個 入っています。いっしょに消しますか？`)) return;
      t.genres.splice(i, 1);
      t.items = t.items.filter((x) => x.genre !== id);
    }
    save(); renderTodo();
  });
  $('todoNewGenre').addEventListener('click', () => {
    const t = todo();
    const g = { id: 'g-' + uid(), name: '新しいジャンル' };
    t.genres.push(g);
    t.current = g.id;
    save(); renderTodo();
    const inputs = $('todoGenreList').querySelectorAll('.tg-name');
    const last = inputs[inputs.length - 1];
    if (last) { last.focus(); last.select(); }
  });
  $('openTodo').addEventListener('click', () => {
    todoEditing = false; pinsOpen = false;
    todo().current = todo().genres[0] ? todo().genres[0].id : null; // 開いたときは、いちばん上のジャンル（買い物）
    renderTodo();
    openSheet('todoSheet');
  });

  // ---------- 起動 ----------
  const received = receiveFromUrl();
  if (received != null) {
    render();
    toast(fill(pickRandom(M.received), { steps: received.steps.toLocaleString() }) +
      (received.pastCount ? `（前の${received.pastCount}日ぶんも入れました）` : ''));
    setTimeout(() => { if (M.moves && !reduceMotion() && Math.random() < 0.4) bigMove(); else cheer(); }, 400);
  } else {
    render();
  }

  // 天気は開いたときと、ときどき取りにいく（取れたら描きなおす）
  Weather.refresh(render);
  // ニュースの帯
  News.init();
  // マーケットのウィジェット
  Market.init();

  // 開きっぱなしで日付や時間帯が変わっても追いつく
  let lastKey = ymd(new Date()) + timeOfDay(new Date().getHours());
  setInterval(() => {
    const k = ymd(new Date()) + timeOfDay(new Date().getHours());
    if (k !== lastKey) { lastKey = k; render(); }
    Weather.refresh(render);
  }, 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); Weather.refresh(render); } });

  // おためし用（歩数が届いたときと同じ動きをする）
  window.TekuTeku = {
    send(steps) {
      recordSteps(ymd(new Date()), steps, true);
      render();
      toast(fill(pickRandom(M.received), { steps: steps.toLocaleString() }));
      setTimeout(cheer, 300);
    },
    at(hour) {
      hourOverride = hour;
      render();
    },
    weather(kind) {
      Weather.fake(kind);
      render();
    },
  };

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
