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
    // 1日1回だけ、控えのおすすめに入れかわることがある（歩数が届いたときは出さない）
    const nudge = !nudgeQuiet && hourOverride == null ? backupNudge(ymd(now)) : null;
    showBubble(nudge || buildMessage(now, info, steps));
  }
  let nudgeQuiet = false;

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
    'split', 'orbit', 'bubble', 'skate', 'statue', 'teleport', 'pulse', 'yoyo', 'lean', 'leaf', 'stack', 'spring',
    // 第3弾：超派手（画面ぜんたい）
    'volcano', 'surf', 'meteor', 'dragon', 'kaiju', 'hyperspace', 'stagelight', 'cannon', 'trampoline', 'jetpack', 'aurora', 'snowstorm', 'sakura', 'portal', 'glitch',
    'tvoff', 'kaleido', 'galaxy', 'whale', 'train', 'magic', 'paint', 'domino', 'sunrise', 'heartburst', 'stagejelly', 'haunted', 'robot', 'gacha', 'bigbang',
    // 第3弾：ちょっと変な
    'penguin', 'kangaroo', 'snake', 'hula', 'juggle', 'yoga', 'sumo', 'karate', 'ninja', 'slowmo', 'rewind', 'pause', 'mirror', 'achoo', 'hiccup', 'puff', 'deflate', 'rubber',
    'scroll', 'coin', 'wheel', 'ballet', 'rodeo', 'wavecats', 'magnet', 'slip', 'sleepwalk', 'flop', 'shiver', 'stamp', 'sticker', 'popcorn', 'soulout', 'boomerang', 'meditate', 'bowling'];
  // 動きに合わせて、ポーズも変える（書いていないものは今のポーズのまま）
  const MOVE_POSE = { roll: 'roll', melt: 'melt', stretch: 'upright', upside: 'stare', bounce: 'blink', flip: 'freeze',
    slide: 'stare', box: 'box', wind: 'freeze', warp: 'cosmos', ceiling: 'stare', sparkle: 'cosmos', sink: 'stare', spin: 'freeze', tiny: 'stare',
    giant: 'stare', dash: 'upright', clone: 'blink', fly: 'blink',
    rocket: 'freeze', fireworks: 'blink', catrain: 'freeze', mega: 'stare', crack: 'freeze', tornado: 'freeze', ufo: 'freeze',
    mirrorball: 'blink', flipscreen: 'freeze', quake: 'teacup', comet: 'roll', blackhole: 'freeze', balloon: 'blink', drill: 'roll',
    party: 'blink', lightning: 'freeze', parade: 'upright', pinball: 'roll', zoomin: 'blink', rainbow: 'blink',
    squash: 'freeze', shadow: 'stare', afterimage: 'upright', jelly: 'blink', peek: 'stare', hop3: 'blink', moonwalk: 'upright',
    swing: 'blink', sneak: 'sideeye', split: 'freeze', orbit: 'cosmos', bubble: 'blink', skate: 'upright', statue: 'upright',
    teleport: 'stare', pulse: 'freeze', yoyo: 'roll', lean: 'tilt', leaf: 'float', stack: 'stare', spring: 'upright',
    volcano: 'gaan', surf: 'banzai', meteor: 'gaze', dragon: 'banzai', kaiju: 'nyaa', hyperspace: 'kira', stagelight: 'music',
    cannon: 'roll', trampoline: 'banzai', jetpack: 'doya', aurora: 'gaze', snowstorm: 'komari', sakura: 'blink', portal: 'gaan', glitch: 'stare',
    tvoff: 'stare', kaleido: 'kira', galaxy: 'float', whale: 'gaze', train: 'wave', magic: 'banzai', paint: 'gaan', domino: 'upright',
    sunrise: 'shades', heartburst: 'heart', stagejelly: 'wiggle', haunted: 'gaan', robot: 'upright', gacha: 'kira', bigbang: 'cosmos',
    penguin: 'upright', kangaroo: 'upright', hula: 'banzai', juggle: 'banzai', yoga: 'upright', sumo: 'muscle', karate: 'punch', ninja: 'sneak',
    slowmo: 'banzai', rewind: 'blink', pause: 'freeze', mirror: 'stand', achoo: 'sneeze', hiccup: 'stare', puff: 'fishmouth', deflate: 'gaan',
    rubber: 'gaan', wheel: 'banzai', ballet: 'upright', rodeo: 'banzai', wavecats: 'banzai', magnet: 'gaan', slip: 'gaan', sleepwalk: 'blink',
    flop: 'freeze', shiver: 'komari', stamp: 'stare', popcorn: 'nyaa', soulout: 'gaan', boomerang: 'roll', meditate: 'blink', bowling: 'roll' };
  // 長さ（ミリ秒）。書いていないものは 1800
  const MOVE_MS = { roll: 2400, spin: 2000, fly: 2800, melt: 2400, stretch: 2000, clone: 2200, dash: 2400, giant: 2400, tiny: 2000,
    upside: 2400, bounce: 2200, sidestep: 2000, flip: 2000, slide: 2200, box: 2600, wind: 2800, warp: 2200, headspin: 2000,
    ceiling: 2800, sparkle: 2200, paper: 2000, sink: 3000,
    rocket: 3400, fireworks: 3400, catrain: 3200, mega: 3000, crack: 3000, tornado: 3200, ufo: 3500, mirrorball: 3500,
    flipscreen: 2600, quake: 2800, comet: 2600, blackhole: 3200, balloon: 3500, drill: 3200, party: 3200, lightning: 2600,
    parade: 3500, pinball: 3200, zoomin: 2800, rainbow: 3400,
    squash: 1800, shadow: 3200, afterimage: 2200, neck: 2600, jelly: 2000, peek: 3200, hop3: 2600, moonwalk: 3000, swing: 2800,
    dizzy: 2800, sneak: 3200, fold: 2400, split: 2600, orbit: 3200, bubble: 3000, skate: 2800, statue: 3200, teleport: 2800,
    pulse: 2200, yoyo: 2800, lean: 2600, leaf: 3200, stack: 3400, spring: 2600,
    volcano: 3600, surf: 3600, meteor: 3600, dragon: 3800, kaiju: 3600, hyperspace: 3200, stagelight: 3600, cannon: 3400, trampoline: 3400,
    jetpack: 3600, aurora: 3600, snowstorm: 3600, sakura: 3600, portal: 3200, glitch: 2800, tvoff: 2800, kaleido: 3400, galaxy: 3800, whale: 3800,
    train: 3400, magic: 3600, paint: 3200, domino: 3400, sunrise: 3600, heartburst: 3200, stagejelly: 2800, haunted: 3600, robot: 3200, gacha: 3600,
    bigbang: 3800,
    penguin: 2800, kangaroo: 2800, snake: 2800, hula: 2800, juggle: 3000, yoga: 3200, sumo: 3000, karate: 2800, ninja: 3000, slowmo: 3000,
    rewind: 3000, pause: 3000, mirror: 3200, achoo: 2800, hiccup: 2800, puff: 2800, deflate: 3000, rubber: 2600, scroll: 3000, coin: 2800,
    wheel: 3000, ballet: 3000, rodeo: 2800, wavecats: 3200, magnet: 3000, slip: 2800, sleepwalk: 3200, flop: 2600, shiver: 2600, stamp: 3000,
    sticker: 3000, popcorn: 2800, soulout: 3200, boomerang: 3000, meditate: 3400, bowling: 3200 };
  let moveTimer = null, lastMove = null, moving = false;
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const POP = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#ffa95e', '#c9a7ff', '#ff6b6b', '#ffffff'];
  // 小さいてんぷる（おまけ用。手描きのゆらしは重いので外す）
  const miniCat = (pose = 'sit', tint = '') => `<svg class="cat mvx-cat" viewBox="0 0 240 200"${tint ? ` style="--tint:${tint}"` : ''}>${(Poses[pose] || Poses.sit).svg}</svg>`;
  const INK = '#2b2b2b';
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
      // ページの背景ごと変える（カードの後ろ）
      back: (color, op = 0.8) => K.fixed('mvx-backdrop', '', `--dk:${color};--dko:${op}`),
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
        const { delayMax = 1200, delay0 = 0, dur = [1000, 1600], size = [20, 40], parent = stage, cls = '' } = opts;
        const W = parent === stage ? G.sw : window.innerWidth, H = parent === stage ? G.sh : window.innerHeight;
        for (let i = 0; i < n; i++) {
          const sz = rnd(size[0], size[1]);
          add('mvx-fall ' + cls, typeof html === 'function' ? html(i) : html,
            `left:${rnd(-sz / 2, W - sz / 2).toFixed(0)}px;width:${sz.toFixed(0)}px;--fh:${H + sz * 2}px;--rot:${rnd(-540, 540).toFixed(0)}deg;--sway:${rnd(-50, 50).toFixed(0)}px;animation-delay:${s(delay0 + rnd(0, delayMax))};animation-duration:${s(rnd(dur[0], dur[1]))}`, parent);
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

    // ===== 第3弾：超派手（画面ぜんたい） =====
    volcano(K) {
      const { G } = K, ms = MOVE_MS.volcano, rise = G.h * 0.8, top = G.y + G.h * 0.93 - rise;
      K.dark('#7a2412', 0.5, 0.08, 0.86);
      K.back('#3b1410', 0.55);
      K.add('mvx-lava', '', `left:${G.cx - 28}px;top:-30px;height:${top + 34}px`);
      K.add('mvx-volcano', `<svg viewBox="0 0 300 200" preserveAspectRatio="none"><path d="M-10 206 L124 18 Q150 8 176 18 L310 206 Z" fill="#7d6b8f" stroke="${INK}" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="M128 22 Q140 34 132 70 Q146 56 150 26 Q156 60 170 92 Q168 52 172 22 Z" fill="#ff7a3b" stroke="${INK}" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><path d="M70 130 l22 -12 M212 146 l24 8 M96 176 l18 -6 M178 186 l22 2 M110 100 l14 -6 M190 116 l16 6" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke"/><ellipse cx="150" cy="16" rx="28" ry="7" fill="#ff4f2b" stroke="${INK}" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`,
        `left:${G.cx - 140}px;width:280px;top:${top}px;height:${G.sh - top + 6}px`);
      const lava = ['#ff4f2b', '#ffa95e', '#ffd94a', '#7a2412'];
      for (let i = 0; i < 4; i++) K.burst(G.cx, top, ms * (0.33 + i * 0.05), 16, 110 + i * 35, lava, 12 + i);
      for (let i = 0; i < 22; i++) K.add('mvx-ember', '', `left:${G.cx + rnd(-30, 30)}px;top:${top}px;--ex:${rnd(-170, 170).toFixed(0)}px;--ey:${rnd(-260, -120).toFixed(0)}px;background:${pickRandom(lava)};animation-delay:${K.s(ms * 0.34 + rnd(0, 700))}`);
      K.rain(16, () => `<span class="mvx-pebble" style="background:${pickRandom(['#ff4f2b', '#ffa95e', '#6b3a2a'])}"></span>`, { delay0: ms * 0.45, delayMax: 700, dur: [700, 1000], size: [8, 16], cls: 'mvx-drop' });
      K.flash(ms * 0.33, '#ffb36b', 420);
      K.word('ゴゴゴ…', 14, G.bb + 40, ms * 0.08, '#ffa95e', 22, -6);
      K.word('ドッカーン!!', G.cx - 110, G.bb + 6, ms * 0.33, '#ff6b3b', 36, -8);
      K.puffs(G.cx, G.y + G.h, 7, ms * 0.84, 90);
      K.word('ストン', G.cx + 40, G.y + 10, ms * 0.84, '#ffd94a', 24, 8);
    },
    surf(K) {
      const { G } = K, ms = MOVE_MS.surf, seaTop = Math.max(G.sh * 0.4, Math.min(G.bb + G.h * 0.55, G.sh * 0.7));
      btnVar('--sy', (seaTop + 6 - (G.y + G.h * 0.94)) + 'px');
      let w = 'M0 50', w2 = 'M0 92';
      for (let x = 0; x < 800; x += 100) { w += ` Q${x + 25} 12 ${x + 50} 30 T${x + 100} 50`; w2 += ` Q${x + 30} 74 ${x + 60} 88 T${x + 100} 92`; }
      K.add('mvx-sea', `<svg viewBox="0 0 800 300" preserveAspectRatio="none"><path d="${w} L800 300 L0 300 Z" fill="#8fd0ff" stroke="${INK}" stroke-width="4" vector-effect="non-scaling-stroke"/><path d="${w2} L800 300 L0 300 Z" fill="#5fb4f0" opacity=".75"/><path d="${w}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="18 26" stroke-linecap="round" vector-effect="non-scaling-stroke" transform="translate(0 7)"/></svg>`, `top:${seaTop}px;height:${G.sh - seaTop + 4}px;width:${G.sw * 2}px`);
      K.add('mvx-curl', `<svg viewBox="0 0 220 260"><path d="M0 260 L0 150 Q8 30 120 14 Q206 6 214 82 Q218 136 168 140 Q126 142 124 108 Q124 82 152 80 Q170 80 170 96 L178 260 Z" fill="#8fd0ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M30 120 Q50 60 110 40 M60 200 Q70 130 120 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M120 14 Q160 6 190 30 Q170 26 160 36 Q150 22 130 26 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`, `top:${G.sh * 0.06}px;height:${G.sh * 1.05}px;width:${(G.sh * 1.05 * 220 / 260).toFixed(0)}px;--cw:${G.sw}px`);
      K.inBtn('mvx-board', `<svg viewBox="0 0 200 40"><path d="M10 22 Q14 8 100 8 Q186 8 194 20 Q186 34 100 34 Q14 34 10 22 Z" fill="#ffd94a" stroke="${INK}" stroke-width="4"/><path d="M30 21 L170 21" stroke="#ff6b6b" stroke-width="6" stroke-linecap="round"/></svg>`, '');
      for (let i = 0; i < 6; i++) K.burst(G.cx + rnd(-60, 60), seaTop + 4, ms * (0.2 + i * 0.1), 10, 70, ['#fff', '#8fd0ff', '#d9f1ff'], 9);
      K.word('ザッパーン!!', 10, G.bb + 8, ms * 0.12, '#8fd0ff', 32, -8);
      K.word('ひゃっほー', G.sw - 140, G.bb + 50, ms * 0.5, '#ffd94a', 24, 8);
    },
    meteor(K) {
      const { G } = K, ms = MOVE_MS.meteor, W = window.innerWidth, H = window.innerHeight;
      K.dark('#141a3e', 0.88, 0.06, 0.9);
      K.back('#0f1433', 0.92);
      K.stars(26, ms * 0.8, [3, 97, 3, 70], ['✦', '・', '✧', '★']);
      for (let i = 0; i < 46; i++) {
        const big = i % 9 === 0, len = big ? rnd(170, 240) : rnd(70, 150);
        K.fixed('mvx-meteor' + (big ? ' big' : ''), '<i></i>', `left:${rnd(-40, W + 260).toFixed(0)}px;top:${rnd(-160, H * 0.55).toFixed(0)}px;--len:${len.toFixed(0)}px;--mc:${pickRandom(['#fff6c2', '#ffd94a', '#8fe8c8', '#ff9fbb', '#8fd0ff'])};animation-delay:${K.s(ms * 0.06 + rnd(0, ms * 0.72))};animation-duration:${K.s(rnd(500, 850))}`);
      }
      K.word('キラッ', 20, G.bb + 20, ms * 0.2, '#fff6c2', 24, -8);
      K.word('キラキラッ', G.sw - 130, G.bb + 60, ms * 0.45, '#ffd94a', 24, 8);
      K.word('ねがいごと…', G.cx - 70, G.bb + 10, ms * 0.66, '#fff', 22, -4);
    },
    dragon(K) {
      const { G } = K, ms = MOVE_MS.dragon;
      const y0 = Math.max(G.bb + 40, G.sh * 0.42), amp = Math.min(G.sh * 0.2, 60);
      let d = `M-90 ${y0.toFixed(0)}`;
      for (let i = 1; i <= 40; i++) { const x = -90 + (G.sw + 180) * i / 40; d += ` L${x.toFixed(1)} ${(y0 + Math.sin(i / 40 * Math.PI * 3) * amp).toFixed(1)}`; }
      const N = 22, step = 50, dur = 2000, d0 = ms * 0.14;
      for (let i = N; i >= 1; i--) {
        const sz = 50 * (i > N - 6 ? 1 - (i - (N - 6)) * 0.12 : 1);
        K.add('mvx-dseg' + (i === N ? ' tail' : ''), '', `offset-path:path('${d}');width:${sz.toFixed(0)}px;height:${sz.toFixed(0)}px;animation-delay:${K.s(d0 + i * step)};animation-duration:${K.s(dur)};background:${i % 2 ? '#8fe8c8' : '#b4f0d8'}`);
      }
      K.add('mvx-dhead', `<svg viewBox="0 0 130 90"><path d="M20 20 Q6 4 0 8 Q12 14 14 26 M34 16 Q30 -2 20 -6 Q30 6 26 22" fill="none" stroke="#ffd94a" stroke-width="7" stroke-linecap="round"/><path d="M20 20 Q6 4 0 8 Q12 14 14 26 M34 16 Q30 -2 20 -6 Q30 6 26 22" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M6 46 Q4 18 40 16 Q70 14 92 30 Q124 34 126 52 Q124 66 100 64 L96 72 Q70 82 40 76 Q8 72 6 46 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M8 40 Q-4 30 2 18 M8 56 Q-6 62 -2 76 M14 66 Q8 80 18 88" fill="none" stroke="#ff6b6b" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="36" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="62" cy="37" r="4" fill="${INK}"/><circle cx="116" cy="44" r="3" fill="${INK}"/><path d="M100 64 Q114 62 122 56" stroke="${INK}" stroke-width="3" fill="none"/><path d="M110 60 Q140 70 150 96 M104 34 Q130 14 156 18" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M84 66 l4 8 l5 -8" fill="#fff" stroke="${INK}" stroke-width="2"/></svg><div class="mvx-rider">${nowCat()}</div>`,
        `offset-path:path('${d}');animation-delay:${K.s(d0)};animation-duration:${K.s(dur)}`);
      for (let i = 0; i < 5; i++) K.add('mvx-cloudlet', '', `left:${rnd(0, G.sw - 70).toFixed(0)}px;top:${rnd(G.bb + 10, G.sh * 0.75).toFixed(0)}px;animation-delay:${K.s(ms * 0.1 + i * 300)}`);
      K.word('ゴオオオ', 12, G.bb + 8, ms * 0.14, '#8fe8c8', 28, -8);
      K.word('のってる!', G.sw - 130, G.bb + 46, ms * 0.42, '#ffd94a', 24, 8);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.86, 70);
    },
    kaiju(K) {
      const { G } = K, ms = MOVE_MS.kaiju;
      K.dark('#3b2f5e', 0.38, 0.06, 0.9);
      let b = '', x = -4;
      const cols = ['#cfd6e6', '#ffd94a', '#8fd0ff', '#ff9fbb', '#8fe8c8', '#ffa95e', '#c9a7ff'];
      for (let i = 0; x < G.sw; i++) {
        const w = rnd(22, 40), h = rnd(26, 62);
        if (i === 4) { b += `<path d="M${x + 4} 80 L${x + 19} ${80 - 78} L${x + 34} 80 M${x + 9} 52 L${x + 29} 52 M${x + 13} 30 L${x + 25} 30" fill="none" stroke="#ff6b6b" stroke-width="4" stroke-linejoin="round"/>`; x += 38; continue; }
        b += `<rect x="${x.toFixed(0)}" y="${(80 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 4).toFixed(0)}" fill="${cols[i % cols.length]}" stroke="${INK}" stroke-width="3"/>`;
        for (let wy = 80 - h + 7; wy < 72; wy += 11) for (let wx = x + 5; wx < x + w - 7; wx += 9) b += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="4" height="5" fill="#fff6c2" stroke="${INK}" stroke-width="1"/>`;
        x += w + rnd(0, 6);
      }
      K.add('mvx-city', `<svg viewBox="0 0 ${G.sw} 84" preserveAspectRatio="none">${b}</svg>`, `width:${G.sw}px;bottom:0;height:${Math.min(84, G.sh * 0.3)}px`);
      K.word('ギャオーン!!', G.cx - 110, G.bb + 6, ms * 0.2, '#ff6b6b', 34, -8);
      [0.32, 0.47, 0.62, 0.77].forEach((t, i) => {
        K.word('ドシーン', i % 2 ? G.sw - 120 : 10, G.bb + 50 + (i % 2) * 30, ms * t, '#ffd94a', 26, i % 2 ? 10 : -10);
        K.puffs(G.cx + (i % 2 ? 50 : -50), G.sh - 14, 5, ms * t, 70);
      });
      for (let i = 0; i < 6; i++) K.add('mvx-tinyword', pickRandom(['きゃー', 'わー', 'にげろ']), `left:${rnd(5, 80).toFixed(0)}%;bottom:${rnd(30, 70).toFixed(0)}px;animation-delay:${K.s(ms * (0.3 + i * 0.08))}`);
    },
    hyperspace(K) {
      const { G } = K, ms = MOVE_MS.hyperspace, W = window.innerWidth, H = window.innerHeight;
      const sp = K.fixed('mvx-hyper', '<b></b>', '');
      for (let i = 0; i < 70; i++) {
        const l = document.createElement('i');
        l.style.cssText = `--a:${rnd(0, 360).toFixed(0)}deg;--r0:${rnd(10, 60).toFixed(0)}px;--len:${rnd(40, 170).toFixed(0)}px;background:${pickRandom(['#fff', '#fff', '#8fd0ff', '#c9a7ff', '#ff9fbb', '#ffd94a'])};animation-delay:-${rnd(0, 0.5).toFixed(2)}s;animation-duration:${rnd(0.35, 0.6).toFixed(2)}s`;
        sp.appendChild(l);
      }
      const c = K.fixed('mvx-hycat', nowCat(), `left:${G.px + G.x}px;top:${G.py + G.y}px;width:${G.w}px;--tx:${(W / 2 - G.px - G.cx).toFixed(0)}px;--ty:${(H / 2 - G.py - G.cy).toFixed(0)}px`);
      c.style.zIndex = 42;
      K.flash(ms * 0.62, '#fff', 420);
      K.fixed('mvx-word', 'ワープ!!', `left:${W / 2 - 80}px;top:${Math.max(G.py + G.bb + 10, 20)}px;color:#8fd0ff;font-size:36px;--r:-8deg;z-index:43;animation-delay:${K.s(ms * 0.14)}`);
    },
    stagelight(K) {
      const { G } = K, ms = MOVE_MS.stagelight;
      K.dark('#120c26', 0.88, 0.06, 0.9);
      K.back('#1b1238', 0.8);
      K.add('mvx-spotc', '', `left:${G.cx - 120}px;width:240px;height:${G.y + G.h}px`);
      K.add('mvx-floor', '', `left:${G.cx - 110}px;top:${G.y + G.h - 22}px`);
      [['#ff9fbb', 0, 0], ['#8fe8c8', 1, 0.2], ['#8fd0ff', 0, 0.45], ['#ffd94a', 1, 0.65]].forEach(([c, side, ph]) => K.add('mvx-cbeam' + (side ? ' r' : ''), '', `--bc:${c};height:${G.sh * 1.5}px;animation-delay:${K.s(ms * 0.08)},-${(ph * 1.6).toFixed(2)}s`));
      let crowd = '';
      for (let i = 0; i < 12; i++) {
        const x = 14 + i * (G.sw - 28) / 11, y = 40 + (i % 2) * 6, c = POP[i % 6];
        crowd += `<g class="mvx-stick" style="animation-delay:-${(i * 0.17).toFixed(2)}s;transform-origin:${(x + 12).toFixed(0)}px ${y}px"><path d="M${x + 12} ${y} L${x + 22} ${y - 30}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M${x + 12} ${y} L${x + 22} ${y - 30}" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g><path d="M${x - 14} ${y + 4} L${x - 13} ${y - 14} L${x - 6} ${y - 8} Q${x} ${y - 11} ${x + 6} ${y - 8} L${x + 13} ${y - 14} L${x + 14} ${y + 4} Q${x + 18} ${y + 22} ${x} ${y + 26} Q${x - 18} ${y + 22} ${x - 14} ${y + 4} Z" fill="#2b2140" stroke="#000" stroke-width="2"/>`;
      }
      K.add('mvx-crowd', `<svg viewBox="0 0 ${G.sw} 70" preserveAspectRatio="none">${crowd}</svg>`, `width:${G.sw}px;height:56px`);
      K.fixed('mvx-tint', '', '');
      ['♪', '♫', '♪', '♫', '♪'].forEach((n, i) => K.add('mvx-note', n, `left:${rnd(5, 85).toFixed(0)}%;top:${rnd(35, 65).toFixed(0)}%;color:${POP[i]};animation-delay:${K.s(ms * 0.15 + i * 420)}`));
      K.word('キャー!!', 12, G.bb + 20, ms * 0.3, '#ff9fbb', 28, -10);
      K.word('アンコール!', G.sw - 150, G.bb + 60, ms * 0.62, '#ffd94a', 24, 8);
    },
    cannon(K) {
      const { G } = K, ms = MOVE_MS.cannon, cw = Math.min(130, G.sw * 0.38);
      const mx = 8 + cw * 0.86, my = G.y + G.h * 0.95 - cw * 0.62;
      btnVar('--mx', (mx - G.cx) + 'px'); btnVar('--my', (my - G.cy) + 'px');
      K.add('mvx-cannon', `<svg viewBox="0 0 130 100"><g transform="rotate(-32 50 66)"><rect x="22" y="44" width="104" height="44" rx="10" fill="#5c6680" stroke="${INK}" stroke-width="4"/><rect x="110" y="38" width="18" height="56" rx="6" fill="#8d97b3" stroke="${INK}" stroke-width="4"/><path d="M40 52 L40 80 M66 52 L66 80" stroke="#ffd94a" stroke-width="5"/></g><circle cx="44" cy="80" r="18" fill="#a8714c" stroke="${INK}" stroke-width="4"/><circle cx="44" cy="80" r="5" fill="${INK}"/><path d="M44 62 L44 98 M26 80 L62 80" stroke="${INK}" stroke-width="3"/></svg>`, `left:8px;width:${cw}px;top:${G.y + G.h * 0.95 - cw * 0.77}px`);
      K.puffs(mx, my, 9, ms * 0.24, 30);
      K.burst(mx, my, ms * 0.24, 14, 80, ['#ffa95e', '#ffd94a', '#fff']);
      K.flash(ms * 0.24, '#fff6c2', 300);
      K.word('ドーン!!', 16, G.bb + 10, ms * 0.24, '#ffa95e', 36, -10);
      for (let i = 0; i < 8; i++) K.add('mvx-star', '★', `left:${(mx + (G.sw - mx) * i / 8).toFixed(0)}px;top:${(my - 40 - Math.sin(i / 8 * Math.PI) * 90).toFixed(0)}px;animation-delay:${K.s(ms * 0.26 + i * 60)};font-size:20px`);
      K.word('…ただいま!', G.cx - 40, G.bb + 50, ms * 0.8, '#8fe8c8', 22, 6);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.82, 80);
    },
    trampoline(K) {
      const { G } = K, ms = MOVE_MS.trampoline, tw = G.w * 1.05;
      K.add('mvx-tramp', `<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M14 22 L6 58 M186 22 L194 58 M60 30 L56 58 M140 30 L144 58" stroke="${INK}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke"/><ellipse cx="100" cy="20" rx="96" ry="16" fill="#8fd0ff" stroke="${INK}" stroke-width="4" vector-effect="non-scaling-stroke"/><ellipse cx="100" cy="20" rx="80" ry="10" fill="#4a5aa8" stroke="${INK}" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`, `left:${G.cx - tw / 2}px;width:${tw}px;height:${G.h * 0.3}px;top:${G.y + G.h * 0.93 - G.h * 0.22}px`);
      [[0.22, 'ぼよーん'], [0.44, 'ぼよよーん'], [0.68, 'ぼよよよーん!!']].forEach(([t, w], i) => { K.word(w, i % 2 ? G.sw - 150 : 12, G.bb + 20 + i * 24, ms * t, POP[i + 1], 22 + i * 4, i % 2 ? 8 : -8); K.burst(G.cx, G.y + G.h * 0.8, ms * t, 10, 70); });
      K.stars(12, ms * 0.8, [5, 95, 5, 50]);
      K.word('シュタッ!', G.cx + 30, G.y, ms * 0.88, '#8fe8c8', 26, 8);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.88, 80);
    },
    jetpack(K) {
      const { G } = K, ms = MOVE_MS.jetpack;
      const wp = [[0, 0, 0], [0.08, 0, -15], [0.2, -75, -66], [0.32, 60, -90], [0.44, 85, -30], [0.56, -80, -54], [0.68, -20, -90], [0.8, 40, -48], [0.9, 0, 0]];
      K.inBtn('mvx-pack', `<svg viewBox="0 0 120 80"><rect x="6" y="6" width="30" height="56" rx="12" fill="#ff6b6b" stroke="${INK}" stroke-width="4"/><rect x="84" y="6" width="30" height="56" rx="12" fill="#ff6b6b" stroke="${INK}" stroke-width="4"/><rect x="30" y="20" width="60" height="26" rx="6" fill="#cfd6e6" stroke="${INK}" stroke-width="4"/><path d="M12 62 L30 62 L26 72 L16 72 Z M90 62 L108 62 L104 72 L94 72 Z" fill="#8d97b3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><g class="mvx-jflame"><path d="M14 72 Q21 110 28 72 Z M92 72 Q99 110 106 72 Z" fill="#ffa95e" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M18 72 Q21 92 24 72 Z M96 72 Q99 92 102 72 Z" fill="#ffd94a"/></g></svg>`, '');
      for (let t = 0.09; t < 0.88; t += 0.022) {
        let k = 0; while (wp[k + 1][0] < t) k++;
        const [t0, x0, y0] = wp[k], [t1, x1, y1] = wp[k + 1], f = (t - t0) / (t1 - t0);
        const x = G.cx + (x0 + (x1 - x0) * f) / 100 * G.w, y = G.cy + (y0 + (y1 - y0) * f) / 100 * G.h + G.h * 0.5;
        K.add('mvx-smoke', '', `left:${(x + rnd(-6, 6)).toFixed(0)}px;top:${y.toFixed(0)}px;--s:${rnd(0.8, 1.4).toFixed(2)};animation-delay:${K.s(t * ms)}`);
      }
      K.word('ブオオオン', 10, G.bb + 10, ms * 0.1, '#ffa95e', 26, -8);
      K.word('びゅーん', G.sw - 120, G.bb + 60, ms * 0.45, '#8fd0ff', 24, 8);
    },
    aurora(K) {
      const { G } = K, ms = MOVE_MS.aurora;
      K.dark('#0b1433', 0.88, 0.06, 0.9);
      K.back('#0b1433', 0.9);
      K.stars(30, ms * 0.8, [3, 97, 3, 75], ['✦', '・', '✧']);
      [['#6dffc0', '#8fd0ff', 0, 0.08], ['#ff9fbb', '#c9a7ff', 1, 0.16], ['#8fe8c8', '#ffd94a', 2, 0.24]].forEach(([c1, c2, i, t]) => {
        const id = 'mvxAur' + i + Date.now();
        K.add('mvx-aur', `<svg viewBox="0 0 400 120" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity="0"/><stop offset=".55" stop-color="${c2}" stop-opacity=".55"/><stop offset=".85" stop-color="${c1}" stop-opacity=".95"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></linearGradient></defs><path d="M0 40 Q50 0 100 30 T200 30 T300 26 T400 34 L400 110 Q350 80 300 104 T200 100 T100 96 T0 104 Z" fill="url(#${id})"/></svg>`,
          `top:${(G.bb * 0.2 + i * 34).toFixed(0)}px;height:${(G.sh * 0.5).toFixed(0)}px;width:${G.sw * 1.8}px;left:${-G.sw * 0.4}px;animation-delay:${K.s(ms * t)},-${(i * 0.8).toFixed(1)}s`);
      });
      K.fixed('mvx-aurpage', '', '');
      K.word('わぁ…', G.cx - 100, G.bb + 30, ms * 0.3, '#8fe8c8', 26, -6);
      K.word('オーロラ!', G.sw - 140, G.bb + 70, ms * 0.55, '#ff9fbb', 24, 8);
    },
    snowstorm(K) {
      const { G } = K, ms = MOVE_MS.snowstorm, W = window.innerWidth, H = window.innerHeight;
      for (let i = 0; i < 120; i++) {
        const s = rnd(4, 11);
        K.fixed('mvx-flake', '', `left:${rnd(-W * 0.7, W).toFixed(0)}px;top:${rnd(-H * 0.3, H).toFixed(0)}px;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;--fx:${(W * rnd(0.7, 1.1)).toFixed(0)}px;--fy:${rnd(80, 260).toFixed(0)}px;animation-delay:${K.s(rnd(0, ms * 0.7))};animation-duration:${K.s(rnd(450, 800))}`);
      }
      K.fixed('mvx-whiteout', '', '');
      K.inBtn('mvx-snowman', `<svg viewBox="0 0 240 200"><circle cx="120" cy="146" r="50" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M84 118 Q120 132 156 118" fill="none" stroke="#cfe6ff" stroke-width="6"/><circle cx="120" cy="150" r="4" fill="${INK}"/><circle cx="120" cy="170" r="4" fill="${INK}"/><path d="M72 136 L36 110 M44 116 L38 100 M168 136 L204 110 M196 116 L204 100" stroke="#8d5a3c" stroke-width="5" stroke-linecap="round"/><path d="M90 52 L88 22 L106 40 Z M150 52 L152 22 L134 40 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="120" cy="72" r="38" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="106" cy="68" r="4.5" fill="${INK}"/><circle cx="134" cy="68" r="4.5" fill="${INK}"/><path d="M118 78 L142 84 L118 86 Z" fill="#ffa95e" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M84 100 Q120 116 156 100 L158 112 Q120 126 82 112 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M138 112 L146 140 L132 140 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`, '');
      K.burst(G.cx, G.y + G.h * 0.55, ms * 0.84, 18, 100, ['#fff', '#e8f6ff', '#cfe6ff'], 12);
      K.word('ビュオオオ', 10, G.bb + 10, ms * 0.08, '#cfe6ff', 28, -8);
      K.word('さむっ', G.sw - 100, G.bb + 60, ms * 0.25, '#8fd0ff', 24, 8);
      K.word('ゆきだるま…?', G.cx - 70, G.bb + 14, ms * 0.6, '#fff', 22, -4);
      K.word('ぶるるっ', G.cx + 20, G.bb + 50, ms * 0.84, '#8fd0ff', 24, 8);
    },
    sakura(K) {
      const { G } = K, ms = MOVE_MS.sakura, W = window.innerWidth, H = window.innerHeight;
      K.back('#ffd6e4', 0.85);
      K.dark('#ffb3cc', 0.35, 0.06, 0.9);
      let fl = '';
      [[30, 40], [70, 22], [104, 50], [140, 30], [60, 66], [176, 58]].forEach(([x, y], i) => {
        let p = '';
        for (let k = 0; k < 5; k++) p += `<ellipse cx="${x}" cy="${y - 8}" rx="6" ry="9" transform="rotate(${k * 72} ${x} ${y})" fill="${i % 2 ? '#ffc4d6' : '#ffe0ea'}" stroke="${INK}" stroke-width="2"/>`;
        fl += p + `<circle cx="${x}" cy="${y}" r="3.5" fill="#ff6b8b"/>`;
      });
      K.add('mvx-branch', `<svg viewBox="0 0 200 90"><path d="M-10 6 Q60 20 110 40 Q150 54 196 62 M60 22 Q70 50 64 70 M120 44 Q140 20 146 8" fill="none" stroke="#8d5a3c" stroke-width="7" stroke-linecap="round"/><path d="M-10 6 Q60 20 110 40 Q150 54 196 62" fill="none" stroke="${INK}" stroke-width="2"/>${fl}</svg>`, `left:-6px;top:${G.bb - 10}px;width:${Math.min(220, G.sw * 0.62)}px`);
      for (let i = 0; i < 90; i++) {
        const wave = i % 3, s = rnd(10, 18);
        K.fixed('mvx-petal', `<i style="animation-duration:${rnd(0.4, 0.8).toFixed(2)}s"></i>`, `left:${rnd(-W * 0.6, W * 0.5).toFixed(0)}px;top:${rnd(-H * 0.2, H * 0.85).toFixed(0)}px;width:${s.toFixed(0)}px;height:${(s * 0.75).toFixed(0)}px;--px:${(W * rnd(0.9, 1.5)).toFixed(0)}px;--py:${rnd(-60, 160).toFixed(0)}px;--pr:${rnd(-540, 540).toFixed(0)}deg;animation-delay:${K.s(ms * (0.04 + wave * 0.22) + rnd(0, 700))};animation-duration:${K.s(rnd(1100, 1700))}`);
      }
      K.word('はらはら〜', G.cx - 90, G.bb + 20, ms * 0.2, '#ff9fbb', 26, -6);
      K.word('ぶわっ', G.sw - 100, G.bb + 70, ms * 0.48, '#fff', 26, 8);
    },
    portal(K) {
      const { G } = K, ms = MOVE_MS.portal, H = Math.min(G.bb + 14, G.y - 3);
      btnVar('--pt', (H - G.y - G.h) + 'px'); btnVar('--pc', G.h + 'px'); btnVar('--pc2', (H - G.y) + 'px');
      K.add('mvx-portal a', '<i></i>', `left:${G.cx}px;top:${G.y + G.h * 0.95}px;--pw:${G.w * 1.05}px`);
      K.add('mvx-portal b', '<i></i>', `left:${G.cx}px;top:${H}px;--pw:${G.w * 1.05}px`);
      K.stars(10, ms * 0.6, [10, 90, 30, 90]);
      K.word('あっ', G.cx - 110, G.bb + 40, ms * 0.08, '#fff', 24, -8);
      K.word('ひゅ〜', G.sw - 100, G.bb + 60, ms * 0.28, '#8fd0ff', 24, 8);
      K.word('ストン!', G.cx + 30, G.bb + 30, ms * 0.66, '#ffa95e', 28, 8);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.66, 80);
    },
    glitch(K) {
      const { G } = K, ms = MOVE_MS.glitch, H = window.innerHeight;
      const cat = nowCat();
      K.inBtn('mvx-rgb r', cat, ''); K.inBtn('mvx-rgb c', cat, '');
      for (let i = 0; i < 12; i++) K.fixed('mvx-gband', '', `top:${rnd(0, H).toFixed(0)}px;height:${rnd(6, 46).toFixed(0)}px;background:${pickRandom(['#ff2bd6', '#00f0ff', '#ffe600', '#7bff00', '#fff'])};animation-delay:-${rnd(0, 1).toFixed(2)}s, ${K.s(rnd(0, ms * 0.5))};animation-duration:${rnd(0.25, 0.5).toFixed(2)}s, ${K.s(ms)}`);
      K.fixed('mvx-scan', '', '');
      for (let i = 0; i < 14; i++) K.add('mvx-gblock', '', `left:${rnd(0, 95).toFixed(0)}%;top:${rnd(20, 95).toFixed(0)}%;width:${rnd(10, 60).toFixed(0)}px;height:${rnd(6, 22).toFixed(0)}px;background:${pickRandom(['#ff2bd6', '#00f0ff', '#2b2b2b', '#ffe600'])};animation-delay:${K.s(rnd(0, ms * 0.8))}`);
      K.word('ERROR', 12, G.bb + 14, ms * 0.12, '#ff2bd6', 30, -6);
      K.word('ピガガガ', G.sw - 140, G.bb + 60, ms * 0.4, '#00f0ff', 26, 8);
      K.word('ｼﾞｼﾞｯ', 30, G.bb + 90, ms * 0.66, '#ffe600', 22, -4);
    },
    tvoff(K) {
      const { G } = K, ms = MOVE_MS.tvoff;
      K.back('#111', 1, 0.08, 0.86);
      K.fixed('mvx-tvdot', '', '');
      K.fixed('mvx-static', '', '');
      K.fixed('mvx-word', 'プツン', `left:${window.innerWidth / 2 - 50}px;top:${window.innerHeight / 2 + 30}px;color:#fff;font-size:28px;--r:-6deg;z-index:43;animation-delay:${K.s(ms * 0.26)}`);
      K.word('ザザッ', G.cx - 40, G.bb + 20, ms * 0.7, '#cfd6e6', 26, 6);
    },
    kaleido(K) {
      const { G } = K, ms = MOVE_MS.kaleido, cy = G.y + G.h * 0.5;
      K.add('mvx-kal', '', `left:${G.cx}px;top:${cy}px`);
      const ring = (n, R, w, cls) => {
        const r = K.add('mvx-kring ' + cls, '', `left:${G.cx}px;top:${cy}px`);
        for (let i = 0; i < n; i++) {
          const d = document.createElement('div');
          d.className = 'mvx-kcat';
          d.style.cssText = `width:${w}px;margin-left:${-w / 2}px;margin-top:${-w * 0.42}px;transform:rotate(${(360 / n) * i}deg) translateY(${-R}px)${i % 2 ? ' scaleX(-1)' : ''}`;
          d.innerHTML = miniCat(['sit', 'blink', 'maneki', 'kira', 'stare', 'banzai'][i % 6], POP[i % 7]);
          r.appendChild(d);
        }
      };
      ring(10, Math.min(118, G.sw * 0.36), 64, 'o');
      ring(6, 62, 46, 'i');
      K.stars(16, ms * 0.8);
      K.word('くるくるくる〜', 10, G.bb + 10, ms * 0.12, '#c9a7ff', 26, -8);
    },
    galaxy(K) {
      const { G } = K, ms = MOVE_MS.galaxy;
      K.dark('#1b1140', 0.9, 0.06, 0.9);
      K.back('#1b1140', 0.88);
      let dots = '';
      for (let arm = 0; arm < 3; arm++) for (let k = 0; k < 26; k++) {
        const t = k / 26, a = arm * 2.09 + t * 4.4, r = 10 + t * 150;
        dots += `<circle cx="${(160 + Math.cos(a) * r + rnd(-6, 6)).toFixed(1)}" cy="${(160 + Math.sin(a) * r * 0.55 + rnd(-4, 4)).toFixed(1)}" r="${(4.5 - t * 2.8 + rnd(0, 1.2)).toFixed(1)}" fill="${pickRandom(['#fff', '#ffd94a', '#ff9fbb', '#8fd0ff', '#c9a7ff'])}"/>`;
      }
      K.add('mvx-galaxy', `<svg viewBox="0 0 320 320"><ellipse cx="160" cy="160" rx="150" ry="84" fill="#c9a7ff" opacity=".18"/><ellipse cx="160" cy="160" rx="70" ry="40" fill="#ff9fbb" opacity=".22"/>${dots}<circle cx="160" cy="160" r="12" fill="#fff6c2" stroke="${INK}" stroke-width="2"/></svg>`, `left:${G.cx}px;top:${G.sh * 0.5}px`);
      K.add('mvx-planet p1', `<svg viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="48" ry="11" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="50" cy="30" r="20" fill="#ffa95e" stroke="${INK}" stroke-width="3.5"/><path d="M34 22 Q50 18 66 24" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/><path d="M4 32 Q50 46 96 28" fill="none" stroke="#ffd94a" stroke-width="4"/></svg>`, `left:12px;top:${G.bb + 10}px`);
      K.add('mvx-planet p2', `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#8fe8c8" stroke="${INK}" stroke-width="3"/><circle cx="14" cy="16" r="3" fill="#5fc4a4"/><circle cx="24" cy="26" r="4" fill="#5fc4a4"/></svg>`, `right:16px;top:${G.sh * 0.62}px`);
      [`<svg viewBox="0 0 50 30"><path d="M4 15 Q18 0 34 12 L46 4 L44 15 L46 26 L34 18 Q18 30 4 15 Z" fill="#8fd0ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="14" cy="13" r="2.5" fill="${INK}"/></svg>`, `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#ff9fbb" stroke="${INK}" stroke-width="3"/><path d="M8 14 Q20 22 30 8 M6 24 Q20 30 34 18" fill="none" stroke="${INK}" stroke-width="2"/></svg>`, `<svg viewBox="0 0 40 40"><path d="M20 2 L25 15 L38 16 L28 25 L31 38 L20 31 L9 38 L12 25 L2 16 L15 15 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`].forEach((c, i) => K.add('mvx-floaty', c, `left:${[18, 76, 50][i]}%;top:${[64, 40, 78][i]}%;animation-delay:0s, -${i * 0.7}s`));
      K.stars(24, ms * 0.8, [3, 97, 3, 90], ['✦', '・', '✧']);
      K.word('ふわ〜ん', G.sw - 120, G.bb + 20, ms * 0.24, '#c9a7ff', 24, 8);
      K.word('むじゅうりょく…', 14, G.bb + 70, ms * 0.5, '#fff', 20, -4);
    },
    whale(K) {
      const { G } = K, ms = MOVE_MS.whale, ww = G.sw * 1.5;
      K.dark('#1e3a6b', 0.4, 0.15, 0.8);
      K.add('mvx-whale', `<div class="mvx-wbob"><svg viewBox="0 0 500 220"><path d="M420 96 Q470 40 498 30 Q480 76 492 120 Q462 104 430 120 Z" fill="#7ea8f0" stroke="${INK}" stroke-width="5" stroke-linejoin="round" class="mvx-wtail"/><path d="M20 120 Q22 40 140 30 Q300 18 400 80 Q440 104 432 124 Q400 190 240 196 Q60 200 20 120 Z" fill="#7ea8f0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M26 132 Q60 196 240 196 Q380 190 420 136 Q300 162 160 156 Q70 152 26 132 Z" fill="#fffdf8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M80 160 L80 176 M120 166 L120 186 M160 168 L160 190 M200 170 L200 192 M240 170 L240 192 M280 168 L280 188 M320 162 L320 180" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="92" cy="98" r="11" fill="#fff" stroke="${INK}" stroke-width="3.5"/><circle cx="90" cy="99" r="5" fill="${INK}"/><path d="M24 124 Q60 132 90 126" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><ellipse cx="66" cy="114" rx="10" ry="6" fill="#ff9fbb" opacity=".8"/><path d="M190 150 Q220 196 262 186 Q236 170 222 146 Z" fill="#7ea8f0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M150 40 Q200 34 250 46" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/></svg><div class="mvx-spout"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`, `width:${ww}px;left:${G.sw + 10}px;top:${Math.max(0, G.bb - 70)}px;--ww:${ww + G.sw + 30}px`);
      for (let i = 0; i < 10; i++) K.add('mvx-minibub', '', `left:${rnd(5, 95).toFixed(0)}%;--s:${rnd(0.3, 0.8).toFixed(2)};animation-delay:${K.s(rnd(0, ms * 0.7))}`);
      K.word('くじら!?', 14, G.bb + 60, ms * 0.12, '#8fd0ff', 26, -8);
      K.word('プシューッ', G.cx - 40, G.bb + 10, ms * 0.48, '#fff', 26, 6);
    },
    train(K) {
      const { G } = K, ms = MOVE_MS.train, ch = Math.min(96, G.h * 0.7), cw = ch * 1.7;
      const feet = G.y + G.h * 0.95;
      const car = (x, i) => `<g transform="translate(${x} 0)"><rect x="4" y="6" width="${cw - 8}" height="${ch - 24}" rx="10" fill="${['#ff9fbb', '#8fe8c8', '#ffd94a'][i]}" stroke="${INK}" stroke-width="4"/><rect x="4" y="${ch - 40}" width="${cw - 8}" height="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/>${[0, 1, 2].map((k) => `<rect x="${14 + k * (cw - 28) / 3}" y="16" width="${(cw - 28) / 3 - 8}" height="${ch * 0.3}" rx="5" fill="#d9f1ff" stroke="${INK}" stroke-width="3"/>`).join('')}<circle cx="${cw * 0.22}" cy="${ch - 14}" r="10" fill="#5c6680" stroke="${INK}" stroke-width="3.5"/><circle cx="${cw * 0.78}" cy="${ch - 14}" r="10" fill="#5c6680" stroke="${INK}" stroke-width="3.5"/></g>`;
      const loco = `<path d="M8 ${ch - 18} L8 ${ch * 0.42} Q8 ${ch * 0.26} ${cw * 0.3} ${ch * 0.26} L${cw * 0.5} ${ch * 0.26} L${cw * 0.5} 4 L${cw - 6} 4 L${cw - 6} ${ch - 18} Z" fill="#8fd0ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="${cw * 0.18}" y="${ch * 0.06}" width="16" height="${ch * 0.22}" fill="#5c6680" stroke="${INK}" stroke-width="3"/><rect x="${cw * 0.58}" y="12" width="${cw * 0.3}" height="${ch * 0.3}" rx="5" fill="#d9f1ff" stroke="${INK}" stroke-width="3"/><circle cx="14" cy="${ch * 0.5}" r="6" fill="#ffd94a" stroke="${INK}" stroke-width="2.5"/><circle cx="${cw * 0.25}" cy="${ch - 14}" r="12" fill="#ff6b6b" stroke="${INK}" stroke-width="3.5"/><circle cx="${cw * 0.75}" cy="${ch - 14}" r="12" fill="#ff6b6b" stroke="${INK}" stroke-width="3.5"/><path d="M${cw * 0.25} ${ch - 14} L${cw * 0.75} ${ch - 14}" stroke="${INK}" stroke-width="4"/>`;
      const TW = cw * 4;
      const tr = K.add('mvx-train', `<svg viewBox="0 0 ${TW} ${ch}" style="width:${TW}px">${loco}${car(cw, 0)}${car(cw * 2, 1)}${car(cw * 3, 2)}</svg><div class="mvx-wincat" style="left:${cw * 2 + 14 + (cw - 28) / 3 - 4}px;width:${(cw - 28) / 3 * 2 - 2}px;top:10px;height:${ch * 0.46}px">${miniCat('wave')}</div><div class="mvx-steam" style="left:${cw * 0.18 + 8}px"><i></i><i></i><i></i><i></i></div>`,
        `left:${G.sw + 10}px;top:${feet - ch}px;width:${TW}px;height:${ch}px;--tw:${TW + G.sw + 20}px`);
      tr.dataset.n = 1;
      K.add('mvx-rail', '', `top:${feet - 4}px`);
      K.word('ガタンゴトン', 10, G.bb + 10, ms * 0.14, '#ffd94a', 26, -8);
      K.word('おーい!', G.sw - 110, G.bb + 40, ms * 0.42, '#ff9fbb', 26, 8);
      K.word('ガタンゴトン', G.cx - 60, G.bb + 70, ms * 0.6, '#8fe8c8', 22, -4);
      K.puffs(G.cx, G.y + G.h, 6, ms * 0.8, 70);
    },
    magic(K) {
      const { G } = K, ms = MOVE_MS.magic, hw = G.w * 0.82;
      K.add('mvx-tophat', `<svg viewBox="0 0 160 120"><ellipse cx="80" cy="16" rx="76" ry="14" fill="#2b2b2b" stroke="${INK}" stroke-width="4"/><ellipse cx="80" cy="16" rx="58" ry="8" fill="#000"/><path d="M24 20 L32 112 Q80 122 128 112 L136 20" fill="#3b3550" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M26 40 Q80 52 134 40 L132 60 Q80 72 28 60 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M40 80 L44 104" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/></svg>`, `left:${G.cx - hw / 2}px;width:${hw}px;top:${G.y + G.h * 0.97 - hw * 0.75}px`);
      K.add('mvx-wand', `<svg viewBox="0 0 80 20"><rect x="2" y="6" width="60" height="8" rx="3" fill="${INK}"/><rect x="58" y="5" width="20" height="10" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.5"/></svg>`, `left:${G.cx + hw / 2 - 10}px;top:${G.y + G.h * 0.4}px`);
      [0.14, 0.24, 0.34].forEach((t) => K.burst(G.cx + hw * 0.4, G.y + G.h * 0.55, ms * t, 8, 40, ['#ffd94a', '#fff'], 7));
      const dove = `<svg viewBox="0 0 60 44"><path d="M8 26 Q14 12 30 16 L52 8 L44 22 Q52 30 40 36 Q20 42 8 26 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path class="mvx-wing" d="M24 20 Q20 0 38 2 Q38 16 32 22 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="14" cy="24" r="2" fill="${INK}"/><path d="M6 26 L0 28 L7 30" fill="#ffd94a" stroke="${INK}" stroke-width="2"/></svg>`;
      [[-150, -160], [140, -170], [-90, -230], [110, -120]].forEach(([x, y], i) => K.add('mvx-dove', dove, `left:${G.cx - 24}px;top:${G.y + G.h * 0.5}px;--dx:${x}px;--dy:${y}px;--fl:${x > 0 ? -1 : 1};animation-delay:${K.s(ms * 0.4 + i * 90)}`));
      const suits = ['♥', '♠', '♦', '♣'];
      for (let i = 0; i < 14; i++) K.add('mvx-card', `<b style="color:${i % 2 ? '#2b2b2b' : '#ff4f6b'}">${suits[i % 4]}</b>`, `left:${G.cx - 13}px;top:${G.y + G.h * 0.55}px;--dx:${rnd(-170, 170).toFixed(0)}px;--dy:${rnd(-200, -90).toFixed(0)}px;--rot:${rnd(-720, 720).toFixed(0)}deg;animation-delay:${K.s(ms * 0.42 + rnd(0, 300))}`);
      K.flash(ms * 0.4, '#fff6c2', 260, false);
      K.word('ワン・ツー…', 12, G.bb + 20, ms * 0.12, '#c9a7ff', 22, -6);
      K.word('ジャジャーン!!', G.cx - 100, G.bb + 6, ms * 0.4, '#ffd94a', 32, -8);
      K.puffs(G.cx, G.y + G.h * 0.8, 6, ms * 0.66, 70);
    },
    paint(K) {
      const { G } = K, ms = MOVE_MS.paint, W = window.innerWidth, H = window.innerHeight;
      const blob = (r, c) => {
        let d = '', pts = [];
        const n = 22, sp = [3, 8, 12, 17, 20].map((k) => (k + Math.floor(rnd(0, 3))) % n);
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = r * (sp.includes(i) ? rnd(1.3, 1.6) : rnd(0.82, 1.0)); pts.push([100 + Math.cos(a) * rr, 100 + Math.sin(a) * rr]); }
        pts.forEach((p, i) => { const q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; d += (i ? ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ` : `M${m[0].toFixed(1)} ${m[1].toFixed(1)} Q${q[0].toFixed(1)} ${q[1].toFixed(1)} `) + `${m[0].toFixed(1)} ${m[1].toFixed(1)}`; });
        let dr = '';
        for (let k = 0; k < 5; k++) { const a = rnd(0, Math.PI * 2), rr = r * rnd(1.4, 1.8); dr += `<circle cx="${(100 + Math.cos(a) * rr).toFixed(0)}" cy="${(100 + Math.sin(a) * rr).toFixed(0)}" r="${rnd(4, 10).toFixed(0)}" fill="${c}" stroke="${INK}" stroke-width="3"/>`; }
        return `<svg viewBox="0 0 200 200"><path d="${d}Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>${dr}<ellipse cx="80" cy="78" rx="${(r * 0.22).toFixed(0)}" ry="${(r * 0.12).toFixed(0)}" fill="#fff" opacity=".55" transform="rotate(-30 80 78)"/></svg>`;
      };
      const cols = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#c9a7ff', '#ffa95e', '#ff6b6b'];
      for (let i = 0; i < 10; i++) {
        const s = rnd(130, 240), c = cols[i % cols.length];
        const sp = K.fixed('mvx-splat', blob(rnd(46, 58), c) + `<i style="background:${c};left:${rnd(40, 55).toFixed(0)}%"></i><i style="background:${c};left:${rnd(58, 68).toFixed(0)}%;animation-delay:.15s"></i>`, `left:${(rnd(-0.1, 0.9) * W - s / 4).toFixed(0)}px;top:${(rnd(-0.05, 0.85) * H - s / 4).toFixed(0)}px;width:${s.toFixed(0)}px;--rot:${rnd(-40, 40).toFixed(0)}deg;animation-delay:${K.s(ms * 0.06 + i * ms * 0.045)},${K.s(ms * 0.78 + i * 30)}`);
        sp.style.setProperty('--dd', K.s(ms * 0.06 + i * ms * 0.045 + 250));
      }
      K.inBtn('mvx-catsplat', blob(30, '#ff9fbb'), '');
      K.word('ベチャッ!', 12, G.bb + 10, ms * 0.1, '#ff9fbb', 32, -10);
      K.word('ベチャ!', G.sw - 110, G.bb + 60, ms * 0.3, '#8fe8c8', 28, 10);
      K.word('…すっ', G.cx - 30, G.bb + 30, ms * 0.8, '#fff', 22, -4);
    },
    domino(K) {
      const { G } = K, ms = MOVE_MS.domino, n = 7, mw = G.w * 0.5;
      const startX = G.cx - 0.7 * G.w + G.w * 0.3, gap = (G.sw - 6 - startX - mw) / (n - 1);
      for (let i = 0; i < n; i++) {
        K.add('mvx-domi', `<div>${miniCat('upright', POP[i % 7])}</div>`, `left:${(startX + i * gap).toFixed(0)}px;width:${mw}px;top:${G.y + G.h * 0.97 - mw * 0.83}px;--fd:${K.s(ms * (0.25 + i * 0.045))};--rd:${K.s(ms * 0.72 + i * 30)}`);
      }
      K.word('パタ', startX + 10, G.bb + 50, ms * 0.27, '#ffd94a', 24, -8);
      K.word('パタパタ', startX + gap * 3, G.bb + 30, ms * 0.4, '#8fe8c8', 26, 6);
      K.word('パタタタッ!', G.sw - 150, G.bb + 70, ms * 0.52, '#ff9fbb', 28, -6);
      K.word('おみごと!', 12, G.bb + 6, ms * 0.72, '#ffa95e', 26, -6);
      K.puffs(G.sw - 30, G.y + G.h, 4, ms * 0.56, 30);
    },
    sunrise(K) {
      const { G } = K, ms = MOVE_MS.sunrise, R = Math.max(G.sw * 0.55, 170);
      K.back('#ffcf6b', 0.85);
      const g = $('ground');
      const sky = K.add('mvx-skyglow', '', '');
      const rays = K.add('mvx-srays', '', `left:${G.cx}px;top:${G.sh * 0.62}px`);
      const sun = K.add('mvx-sun', `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="#ffd94a" stroke="${INK}" stroke-width="3"/><circle cx="100" cy="100" r="80" fill="#ffe680"/><path d="M50 70 Q60 50 80 46" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/></svg>`, `left:${G.cx - R}px;width:${R * 2}px;top:${G.sh * 0.62 - R}px;--sr:${(G.sh * 0.4 + R).toFixed(0)}px`);
      if (g) [sky, rays, sun].forEach((n) => g.parentNode.insertBefore(n, g));
      rays.style.setProperty('--sr', (G.sh * 0.4 + R).toFixed(0) + 'px');
      K.fixed('mvx-glare', '', '');
      K.word('ピカーッ!!', 12, G.bb + 10, ms * 0.42, '#fff6c2', 34, -8);
      K.word('まぶしっ', G.sw - 120, G.bb + 60, ms * 0.62, '#ffa95e', 26, 8);
    },
    heartburst(K) {
      const { G } = K, ms = MOVE_MS.heartburst, W = window.innerWidth, H = window.innerHeight;
      const heart = (c) => `<svg viewBox="0 0 100 90"><path d="M50 84 C 10 56 2 36 6 22 C 12 2 40 0 50 20 C 60 0 88 2 94 22 C 98 36 90 56 50 84 Z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M22 20 Q30 12 38 18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;
      K.back('#ffd6e4', 0.8, 0.3, 0.9);
      K.add('mvx-bigheart', heart('#ff6b8b'), `left:${G.cx - 60}px;top:${G.y + G.h * 0.45 - 54}px`);
      const ox = G.px + G.cx, oy = G.py + G.y + G.h * 0.45;
      const hc = ['#ff6b8b', '#ff9fbb', '#ffc4d6', '#ff4f6b', '#c9a7ff', '#ffd94a'];
      for (let i = 0; i < 60; i++) {
        const a = rnd(0, Math.PI * 2), r = rnd(160, Math.max(W, H) * 0.8), s = rnd(18, 56);
        K.fixed('mvx-hfly', heart(pickRandom(hc)), `left:${ox - s / 2}px;top:${oy - s / 2}px;width:${s.toFixed(0)}px;--hx:${(Math.cos(a) * r).toFixed(0)}px;--hy:${(Math.sin(a) * r).toFixed(0)}px;--rot:${rnd(-200, 200).toFixed(0)}deg;animation-delay:${K.s(ms * 0.42 + rnd(0, 160))}`);
      }
      for (let i = 0; i < 26; i++) { const s = rnd(16, 34); K.fixed('mvx-hrise', heart(pickRandom(hc)), `left:${rnd(0, W - 20).toFixed(0)}px;top:${H}px;width:${s.toFixed(0)}px;--hh:${-(H + 60)}px;animation-delay:${K.s(ms * 0.5 + rnd(0, ms * 0.3))}`); }
      K.flash(ms * 0.42, '#ff9fbb', 380);
      K.word('ドキドキ…', G.cx - 120, G.bb + 20, ms * 0.08, '#ff6b8b', 24, -8);
      K.word('ドッキューン!!', G.cx - 100, G.bb + 6, ms * 0.42, '#ff9fbb', 32, -6);
    },
    stagejelly(K) {
      const { G } = K, ms = MOVE_MS.stagejelly;
      K.add('mvx-jellyglaze', '<i></i><i></i>', '');
      K.word('ぶよん', 14, G.bb + 20, ms * 0.08, '#ff9fbb', 30, -10);
      K.word('ぷるるるん', G.sw - 160, G.bb + 60, ms * 0.32, '#8fe8c8', 28, 8);
      K.word('ぶよよん', 30, G.bb + 90, ms * 0.56, '#ffd94a', 26, -6);
    },
    haunted(K) {
      const { G } = K, ms = MOVE_MS.haunted, W = window.innerWidth, H = window.innerHeight;
      K.dark('#1d1233', 0.82, 0.06, 0.9);
      K.back('#1d1233', 0.85);
      const ghost = (c) => `<svg viewBox="0 0 100 124"><path d="M20 52 L16 12 L38 30 Q50 26 62 30 L84 12 L80 52 Q88 82 84 104 Q76 118 66 104 Q58 120 50 104 Q42 120 34 104 Q24 118 16 102 Q12 78 20 52 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M36 30 L50 44 L64 30 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M33 58 Q38 63 43 58 M57 58 Q62 63 67 58" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M44 72 Q50 78 56 72" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><ellipse cx="30" cy="68" rx="6" ry="4" fill="#c9a7ff" opacity=".8"/><ellipse cx="70" cy="68" rx="6" ry="4" fill="#c9a7ff" opacity=".8"/><path d="M22 80 Q4 74 2 60 M78 80 Q96 74 98 60" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>`;
      for (let i = 0; i < 6; i++) {
        const dir = i % 2 ? 1 : -1, s = rnd(60, 100);
        K.fixed('mvx-ghostf', `<div style="animation-delay:-${rnd(0, 1).toFixed(2)}s">${ghost(pickRandom(['#f4f6ff', '#e8e0ff', '#e0f4ff']))}</div>`, `left:${dir > 0 ? -s - 10 : W + 10}px;top:${rnd(H * 0.05, H * 0.75).toFixed(0)}px;width:${s.toFixed(0)}px;--gx:${(dir * (W + s + 30)).toFixed(0)}px;animation-delay:${K.s(ms * 0.08 + i * 330)};animation-duration:${K.s(rnd(1500, 2200))}`);
      }
      for (let i = 0; i < 5; i++) K.add('mvx-wisp', '<i></i>', `left:${G.cx}px;top:${G.y + G.h * 0.45}px;animation-delay:-${(i * 0.5).toFixed(1)}s;--wr:${rnd(110, 150).toFixed(0)}px`);
      K.word('ひゅ〜', 14, G.bb + 20, ms * 0.12, '#c9a7ff', 28, -8);
      K.word('どろどろ…', G.sw - 140, G.bb + 70, ms * 0.4, '#8fe8c8', 26, 8);
      K.word('うらめしにゃ〜', G.cx - 80, G.bb + 40, ms * 0.66, '#fff', 22, -4);
    },
    robot(K) {
      const { G } = K, ms = MOVE_MS.robot;
      const S = 'stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"';
      const parts = [
        ['legs', `<rect x="92" y="156" width="20" height="34" fill="#8d97b3" ${S}/><rect x="128" y="156" width="20" height="34" fill="#8d97b3" ${S}/><rect x="84" y="184" width="32" height="12" rx="4" fill="#5c6680" ${S}/><rect x="124" y="184" width="32" height="12" rx="4" fill="#5c6680" ${S}/>`, 0, 140, '50% 80%'],
        ['body', `<rect x="78" y="104" width="84" height="58" rx="8" fill="#cfd6e6" ${S}/><rect x="94" y="116" width="52" height="30" rx="5" fill="#fff" ${S}/><circle cx="108" cy="131" r="6" fill="#ff6b6b" stroke="#2b2b2b" stroke-width="2.5"/><circle cx="126" cy="131" r="6" fill="#ffd94a" stroke="#2b2b2b" stroke-width="2.5"/><path d="M134 126 L142 126 M134 136 L142 136" stroke="#2b2b2b" stroke-width="3"/>`, 0, 160, '50% 60%'],
        ['arml', `<rect x="46" y="108" width="34" height="18" rx="5" fill="#8d97b3" ${S}/><path d="M46 104 L34 98 L30 112 L34 128 L46 122" fill="#ffd94a" ${S}/>`, -180, 0, '38% 58%'],
        ['armr', `<rect x="160" y="108" width="34" height="18" rx="5" fill="#8d97b3" ${S}/><path d="M194 104 L206 98 L210 112 L206 128 L194 122" fill="#ffd94a" ${S}/>`, 180, 0, '62% 58%'],
        ['head', `<path d="M86 50 L84 22 L104 40 Z M154 50 L156 22 L136 40 Z" fill="#cfd6e6" ${S}/><rect x="80" y="38" width="80" height="62" rx="10" fill="#e8ecf4" ${S}/><rect x="90" y="52" width="60" height="22" rx="10" fill="#2b2b2b"/><rect class="mvx-visor" x="96" y="58" width="12" height="10" rx="3" fill="#8fe8c8"/><rect class="mvx-visor" x="132" y="58" width="12" height="10" rx="3" fill="#8fe8c8"/><path d="M106 86 L114 90 L120 86 L126 90 L134 86" fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M120 38 L120 18" stroke="#2b2b2b" stroke-width="4"/><circle class="mvx-visor" cx="120" cy="14" r="7" fill="#ff6b6b" stroke="#2b2b2b" stroke-width="3"/>`, 0, -200, '50% 35%'],
      ];
      parts.forEach(([n, body, fx, fy, o], i) => K.inBtn('mvx-rpart ' + n, `<svg viewBox="0 0 240 200">${body}</svg>`, `--fx:${fx}%;--fy:${fy}%;transform-origin:${o};animation-delay:${K.s(ms * (0.16 + i * 0.02))}${/arm/.test(n) ? ', ' + K.s(ms * 0.4) : ''}`));
      K.flash(ms * 0.27, '#fff', 260, false);
      K.burst(G.cx, G.cy, ms * 0.27, 16, 100, ['#ffd94a', '#fff', '#8fd0ff']);
      K.word('ウィーン', 12, G.bb + 20, ms * 0.12, '#8fd0ff', 24, -8);
      K.word('ガシャーン!!', G.cx - 100, G.bb + 6, ms * 0.27, '#ffd94a', 32, -6);
      K.word('ピピッ', G.sw - 100, G.bb + 60, ms * 0.55, '#8fe8c8', 24, 8);
      K.puffs(G.cx, G.cy, 6, ms * 0.82, 60);
    },
    gacha(K) {
      const { G } = K, ms = MOVE_MS.gacha, cs = G.w * 0.82;
      const top = `<svg viewBox="0 0 100 50"><path d="M4 50 A46 46 0 0 1 96 50 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M22 30 Q30 14 48 10" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/></svg>`;
      const bot = `<svg viewBox="0 0 100 50"><path d="M4 0 A46 46 0 0 0 96 0 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M2 0 L98 0" stroke="${INK}" stroke-width="6"/></svg>`;
      K.add('mvx-capsule', `<div class="mvx-ctop">${top}</div><div class="mvx-cbot">${bot}</div>`, `left:${G.cx - cs / 2}px;width:${cs}px;height:${cs}px;top:${G.y + G.h * 0.97 - cs}px;--fall:${-(G.y + G.h)}px`);
      K.add('mvx-grays', '', `left:${G.cx}px;top:${G.y + G.h * 0.55}px`);
      K.burst(G.cx, G.y + G.h * 0.6, ms * 0.52, 20, 120, ['#ffd94a', '#ff9fbb', '#8fe8c8', '#8fd0ff', '#c9a7ff', '#fff'], 11);
      K.flash(ms * 0.52, '#fff6c2', 360);
      K.word('ガチャ', 14, G.bb + 40, ms * 0.3, '#ff9fbb', 24, -8);
      K.word('ガチャ', G.sw - 100, G.bb + 60, ms * 0.4, '#8fd0ff', 24, 8);
      K.word('SSR!!', G.cx - 70, G.bb + 6, ms * 0.54, '#ffd94a', 40, -8);
      K.stars(18, ms * 0.4, [5, 95, 10, 80]);
    },
    bigbang(K) {
      const { G } = K, ms = MOVE_MS.bigbang, W = window.innerWidth, H = window.innerHeight;
      K.back('#0d0820', 1, 0.06, 0.85);
      K.fixed('mvx-bbcore', '', `left:${W / 2}px;top:${H / 2}px`);
      K.flash(ms * 0.32, '#fff', 700);
      const u = K.fixed('mvx-universe', '', `left:${W / 2}px;top:${H / 2}px`);
      for (let i = 0; i < 80; i++) {
        const p = document.createElement('i');
        const a = rnd(0, 360), r = rnd(80, Math.max(W, H) * 0.75), s = rnd(4, 12);
        p.style.cssText = `--a:${a.toFixed(0)}deg;--d:${r.toFixed(0)}px;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;background:${pickRandom(POP)};animation-delay:${K.s(ms * 0.33 + rnd(0, 250))}`;
        u.appendChild(p);
      }
      ['#ff9fbb', '#8fd0ff', '#ffd94a', '#c9a7ff'].forEach((c, i) => K.fixed('mvx-bbring', '', `left:${W / 2}px;top:${H / 2}px;border-color:${c};animation-delay:${K.s(ms * (0.33 + i * 0.05))}`));
      K.fixed('mvx-word', 'ビッグバン!!', `left:${W / 2 - 110}px;top:${H / 2 - 120}px;color:#ffd94a;font-size:40px;--r:-8deg;z-index:43;animation-delay:${K.s(ms * 0.36)}`);
    },

    // ===== 第3弾：ちょっと変な =====
    penguin(K) {
      const { G } = K;
      K.inBtn('mvx-flip2', '<i class="l"></i><i class="r"></i>', '');
      K.word('よちよち', 14, G.bb + 30, 200, '#8fd0ff', 24, -8);
      for (let i = 0; i < 8; i++) K.add('mvx-paw', '', `left:${(G.cx + (i < 4 ? -1 : 1) * (12 + (i % 4) * 22) - 8).toFixed(0)}px;top:${G.y + G.h - 4 + (i % 2) * 6}px;animation-delay:${K.s(300 + i * 220)}`);
    },
    kangaroo(K) {
      const { G } = K, ms = MOVE_MS.kangaroo;
      [[0.2, 0.25], [0.4, 0.5], [0.6, 0.75], [0.86, 0]].forEach(([t, x]) => K.puffs(G.cx + x * G.w, G.y + G.h, 4, ms * t, 40));
      K.word('ぴょーん', 14, G.bb + 20, ms * 0.08, '#ffa95e', 24, -8);
      K.word('ぴょーん!', G.sw - 130, G.bb + 50, ms * 0.44, '#ffd94a', 26, 8);
    },
    snake(K) {
      const n = 12, html = $('catPose').innerHTML;
      for (let i = 0; i < n; i++) {
        const t = (i * 100) / n, b = 100 - ((i + 1) * 100) / n;
        K.inBtn('mvx-sslice', `<svg class="cat" viewBox="0 0 240 200">${html}</svg>`, `clip-path:inset(${Math.max(0, t - 0.6).toFixed(1)}% -30% ${Math.max(0, b - 0.6).toFixed(1)}% -30%);animation-delay:-${(i * 0.09).toFixed(2)}s`);
      }
      K.word('くねくね〜', 14, K.G.bb + 30, 200, '#8fe8c8', 24, -8);
    },
    hula(K) {
      const hoop = `<svg viewBox="0 0 200 60"><ellipse cx="100" cy="30" rx="94" ry="24" fill="none" stroke="${INK}" stroke-width="11"/><ellipse cx="100" cy="30" rx="94" ry="24" fill="none" stroke="#ff9fbb" stroke-width="6" stroke-dasharray="16 12"/><ellipse cx="100" cy="30" rx="94" ry="24" fill="none" stroke="#ffd94a" stroke-width="6" stroke-dasharray="12 16" stroke-dashoffset="16"/></svg>`;
      K.inBtn('mvx-hoop back', hoop, ''); K.inBtn('mvx-hoop front', hoop, '');
      K.word('くるくる〜', 14, K.G.bb + 30, 200, '#ff9fbb', 24, -8);
    },
    juggle(K) {
      const j = K.inBtn('mvx-jug', '', '');
      ['#ff9fbb', '#8fe8c8', '#ffd94a'].forEach((c, i) => {
        const b = document.createElement('i');
        b.style.cssText = `animation-delay:-${(i * 0.3).toFixed(2)}s`;
        b.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="${c}" stroke="${INK}" stroke-width="3.5"/><path d="M8 12 Q20 22 30 8 M6 22 Q20 30 34 18 M12 32 Q22 28 32 30" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></svg>`;
        j.appendChild(b);
      });
      K.word('ほいっ ほいっ', 14, K.G.bb + 20, 300, '#ffd94a', 22, -8);
    },
    yoga(K) {
      const { G } = K, ms = MOVE_MS.yoga;
      K.add('mvx-mat', '', `left:${G.cx - G.w * 0.5}px;width:${G.w}px;top:${G.y + G.h * 0.92}px`);
      for (let i = 0; i < 3; i++) K.add('mvx-calm', '', `left:${G.cx}px;top:${G.y + G.h * 0.5}px;animation-delay:${K.s(ms * (0.15 + i * 0.25))}`);
      K.word('スー…', 14, G.bb + 30, ms * 0.12, '#8fe8c8', 22, -6);
      K.word('ハー…', G.sw - 90, G.bb + 50, ms * 0.48, '#c9a7ff', 22, 6);
      K.word('ぷるぷる', G.cx + 30, G.y, ms * 0.7, '#ff9fbb', 18, 8);
    },
    sumo(K) {
      const { G } = K, ms = MOVE_MS.sumo;
      K.burst(G.cx, G.y + G.h * 0.2, 80, 14, 70, ['#fff', '#f4f6ff'], 6);
      [0.34, 0.66].forEach((t, i) => { K.puffs(G.cx + (i ? 40 : -40), G.y + G.h, 7, ms * t, 80); K.word('どすこい!', i ? G.sw - 140 : 12, G.bb + 20 + i * 40, ms * t, '#ffa95e', 28, i ? 8 : -8); });
    },
    karate(K) {
      const { G } = K, ms = MOVE_MS.karate, bx = G.x + G.w * 0.86, by = G.y + G.h * 0.36;
      const board = (side) => `<svg viewBox="0 0 40 70"><path d="${side ? 'M0 2 L38 2 L38 68 L0 68 L6 50 L-2 34 L6 18 Z' : 'M2 2 L40 2 L34 18 L42 34 L34 50 L40 68 L2 68 Z'}" fill="#f1d9a0" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${side ? 16 : 14} 10 Q${side ? 22 : 20} 34 ${side ? 14 : 16} 60" stroke="#c9a06a" stroke-width="2.5" fill="none"/></svg>`;
      K.add('mvx-plank l', board(0), `left:${bx - 40}px;top:${by}px`);
      K.add('mvx-plank r', board(1), `left:${bx}px;top:${by}px`);
      K.burst(bx, by + 35, ms * 0.38, 14, 80, ['#f1d9a0', '#ffd94a', '#fff']);
      K.word('ハッ!', 14, G.bb + 30, ms * 0.32, '#ff6b6b', 28, -8);
      K.word('バキッ!!', G.sw - 130, G.bb + 10, ms * 0.38, '#ffd94a', 32, 8);
    },
    ninja(K) {
      const { G } = K, ms = MOVE_MS.ninja;
      [[0.1, 0], [0.32, -0.9], [0.48, -0.9], [0.62, 0.9], [0.74, 0.9], [0.86, 0]].forEach(([t, x]) => K.puffs(G.cx + x * G.w, G.cy + 20, 7, ms * t - 60, 50));
      K.add('mvx-shuri', `<svg viewBox="0 0 40 40"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="#cfd6e6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="20" cy="20" r="4" fill="${INK}"/></svg>`, `top:${G.y + G.h * 0.3}px;animation-delay:${K.s(ms * 0.36)}`);
      K.word('ドロン!', G.cx - 40, G.bb + 20, ms * 0.1, '#c9a7ff', 30, -8);
      K.word('シュッ', 14, G.bb + 60, ms * 0.32, '#fff', 24, -6);
      K.word('ニンッ', G.sw - 100, G.bb + 60, ms * 0.62, '#fff', 24, 8);
    },
    slowmo(K) {
      const { G } = K, ms = MOVE_MS.slowmo, cat = nowCat();
      [1, 2, 3].forEach((i) => K.add('mvx-slowg', cat, `left:${G.x}px;top:${G.y}px;width:${G.w}px;opacity:${(0.45 - i * 0.12).toFixed(2)};animation-delay:${i * 0.11}s`));
      K.add('mvx-lbox t', '', ''); K.add('mvx-lbox b', '', '');
      K.add('mvx-label', '×0.25', `left:12px;top:${G.bb + 8}px`);
      K.word('ス…ロ…ー…', G.sw - 160, G.bb + 40, ms * 0.3, '#c9a7ff', 22, 6);
    },
    rewind(K) {
      const { G } = K, ms = MOVE_MS.rewind;
      K.add('mvx-label rw', '\u25C0\uFE0E\u25C0\uFE0E REW', `left:12px;top:${G.bb + 8}px`);
      K.add('mvx-label pl', '\u25B6\uFE0E PLAY', `left:12px;top:${G.bb + 8}px`);
      K.add('mvx-vhs', '<i></i>', '');
      K.word('キュルキュル', G.sw - 150, G.bb + 50, ms * 0.5, '#fff', 22, 6);
    },
    pause(K) {
      const { G } = K, ms = MOVE_MS.pause;
      K.add('mvx-pausei', '<b></b>', `left:${G.cx}px;top:${Math.max(G.bb + 50, G.sh * 0.45)}px`);
      K.add('mvx-playi', '<b></b>', `left:${G.cx}px;top:${Math.max(G.bb + 50, G.sh * 0.45)}px`);
      K.add('mvx-label ps', 'PAUSE', `left:12px;top:${G.bb + 8}px`);
      K.puffs(G.cx, G.y + G.h, 5, ms * 0.82, 70);
    },
    mirror(K) {
      const { G } = K, ms = MOVE_MS.mirror, mw = Math.min(120, G.sw * 0.34), mh = Math.min(mw * 1.35, G.y + G.h * 0.97 - G.bb - 8);
      K.add('mvx-mirror', `<div class="mvx-glass"><div class="mvx-mircat" style="width:${mw * 0.9}px">${nowCat()}</div><i></i></div>`, `right:10px;width:${mw}px;height:${mh}px;top:${G.y + G.h * 0.97 - mh}px`);
      K.word('まねっこ?', G.cx - 110, G.bb + 20, ms * 0.3, '#8fd0ff', 24, -6);
      K.word('…じー', G.sw - 100, G.bb + 10, ms * 0.66, '#fff', 20, 6);
    },
    achoo(K) {
      const { G } = K, ms = MOVE_MS.achoo;
      K.word('は…', G.cx + 30, G.bb + 30, ms * 0.06, '#fff', 22, 6);
      K.word('はっ…', G.cx + 40, G.bb + 50, ms * 0.18, '#fff', 24, 8);
      K.word('ハックション!!', G.cx - 60, G.bb + 6, ms * 0.32, '#8fe8c8', 30, -8);
      for (let i = 0; i < 12; i++) K.add('mvx-spray', '', `left:${G.cx + G.w * 0.15}px;top:${G.y + G.h * 0.42}px;--sx:${rnd(60, 160).toFixed(0)}px;--sy:${rnd(-50, 50).toFixed(0)}px;animation-delay:${K.s(ms * 0.32 + rnd(0, 80))}`);
      K.puffs(G.cx - G.w * 0.9, G.y + G.h, 5, ms * 0.46, 40);
    },
    hiccup(K) {
      const { G } = K, ms = MOVE_MS.hiccup;
      [0.14, 0.4, 0.56, 0.82].forEach((t, i) => K.word('ヒック', [G.cx + 20, 20, G.sw - 110, G.cx - 60][i], G.bb + 20 + (i % 2) * 40, ms * t, ['#ff9fbb', '#8fd0ff', '#ffd94a', '#8fe8c8'][i], 22, i % 2 ? -8 : 8));
    },
    puff(K) {
      const { G } = K, ms = MOVE_MS.puff;
      let sp = '';
      for (let i = 0; i < 18; i++) sp += `<path transform="rotate(${i * 20} 120 118)" d="M114 40 L120 22 L126 40 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
      K.inBtn('mvx-spikes', `<svg viewBox="0 0 240 200">${sp}</svg>`, '');
      K.word('ぷくーっ', 14, G.bb + 20, ms * 0.12, '#ff9fbb', 26, -8);
      K.word('プシュ〜', G.sw - 120, G.bb + 50, ms * 0.74, '#8fd0ff', 24, 8);
      K.puffs(G.cx, G.cy, 6, ms * 0.74, 60);
    },
    deflate(K) {
      const { G } = K, ms = MOVE_MS.deflate;
      for (let i = 0; i < 10; i++) K.add('mvx-air', '', `left:${G.cx + G.w * 0.25}px;top:${G.y + G.h * 0.4}px;animation-delay:${K.s(ms * 0.06 + i * 90)}`);
      K.add('mvx-pump', `<svg viewBox="0 0 60 100"><rect x="26" y="0" width="8" height="40" fill="#cfd6e6" stroke="${INK}" stroke-width="3"/><rect x="8" y="0" width="44" height="10" rx="4" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/><rect x="14" y="38" width="32" height="56" rx="6" fill="#8fd0ff" stroke="${INK}" stroke-width="3.5"/><path d="M14 90 Q-6 92 -20 88" fill="none" stroke="${INK}" stroke-width="4"/></svg>`, `left:${G.cx + G.w * 0.5}px;top:${G.y + G.h * 0.97 - 80}px`);
      K.word('プシュ〜〜', 14, G.bb + 20, ms * 0.06, '#8fd0ff', 26, -8);
      K.word('シュコシュコ', G.sw - 150, G.bb + 50, ms * 0.66, '#ffd94a', 22, 8);
    },
    rubber(K) {
      const { G } = K, ms = MOVE_MS.rubber;
      K.add('mvx-glove', `<svg viewBox="0 0 60 50"><path d="M4 22 Q4 8 18 10 L40 8 Q48 8 48 14 Q56 14 56 20 Q56 28 48 28 L50 34 Q48 42 38 40 L18 42 Q4 42 4 22 Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M18 18 L36 16 M20 30 L38 30" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></svg>`, `left:${G.x + G.w * 0.82}px;top:${G.y + G.h * 0.44}px;--gx:${G.w * 1.2}px`);
      K.word('みょーん', G.cx - 40, G.bb + 20, ms * 0.2, '#ffd94a', 26, -6);
      K.word('バチン!', 14, G.bb + 50, ms * 0.44, '#ff6b6b', 30, -10);
    },
    scroll(K) {
      const { G } = K, ms = MOVE_MS.scroll;
      K.inBtn('mvx-roll', '<i></i>', '');
      K.word('くるくる…', 14, G.bb + 20, ms * 0.1, '#ffa95e', 24, -8);
      K.word('ぱらり', G.sw - 100, G.bb + 50, ms * 0.6, '#8fe8c8', 24, 8);
    },
    coin(K) {
      const { G } = K, ms = MOVE_MS.coin;
      K.inBtn('mvx-coin', '<i></i>', '');
      K.stars(10, ms * 0.8, [10, 90, 20, 80]);
      K.word('チャリーン', G.sw - 140, G.bb + 20, ms * 0.82, '#ffd94a', 26, 8);
    },
    wheel(K) {
      const { G } = K, ms = MOVE_MS.wheel;
      K.add('mvx-arc', `<svg viewBox="0 0 200 60"><path d="M10 54 Q100 -30 190 54" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="6 9" stroke-linecap="round"/></svg>`, `left:${G.cx - G.w * 0.2}px;width:${G.w * 1.2}px;top:${G.y - 10}px`);
      K.word('くるりん!', 14, G.bb + 20, ms * 0.1, '#c9a7ff', 24, -8);
      K.word('くるりん!', G.sw - 120, G.bb + 50, ms * 0.5, '#ffd94a', 24, 8);
      K.puffs(G.cx, G.y + G.h, 5, ms * 0.9, 60);
    },
    ballet(K) {
      const { G } = K, ms = MOVE_MS.ballet;
      K.inBtn('mvx-tutu', `<svg viewBox="0 0 120 40"><path d="M4 18 Q20 2 60 6 Q100 2 116 18 Q110 26 100 22 Q94 32 82 26 Q72 36 60 28 Q48 36 38 26 Q26 32 20 22 Q10 26 4 18 Z" fill="#ffc4d6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M20 14 Q60 22 100 14" fill="none" stroke="#ff9fbb" stroke-width="3"/></svg>`, '');
      K.stars(14, ms * 0.8, [15, 85, 20, 85]);
      ['♪', '♫'].forEach((n, i) => K.add('mvx-note', n, `left:${[15, 80][i]}%;top:${[45, 55][i]}%;color:${POP[i]};animation-delay:${K.s(ms * 0.2 + i * 600)}`));
      K.word('くるくる〜', 14, G.bb + 20, ms * 0.2, '#ff9fbb', 24, -8);
    },
    rodeo(K) {
      const { G } = K, ms = MOVE_MS.rodeo;
      K.inBtn('mvx-lasso', `<svg viewBox="0 0 120 40"><ellipse cx="60" cy="20" rx="54" ry="14" fill="none" stroke="${INK}" stroke-width="7"/><ellipse cx="60" cy="20" rx="54" ry="14" fill="none" stroke="#f1d9a0" stroke-width="3.5" stroke-dasharray="8 5"/></svg>`, '');
      K.add('mvx-cowhat', `<svg viewBox="0 0 100 50"><path d="M4 36 Q20 46 50 44 Q80 46 96 36 Q86 30 76 32 L72 10 Q62 4 50 10 Q38 4 28 10 L24 32 Q14 30 4 36 Z" fill="#c98a4a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M25 28 Q50 34 75 28" stroke="#ff6b6b" stroke-width="5" fill="none"/></svg>`, `left:${G.cx - 36}px;top:${G.y - 6}px;animation-delay:${K.s(ms * 0.36)}`);
      K.word('ヒーハー!!', 12, G.bb + 10, ms * 0.1, '#ffa95e', 30, -8);
      K.word('うわわわ', G.sw - 130, G.bb + 60, ms * 0.45, '#fff', 22, 8);
      for (let i = 0; i < 5; i++) K.puffs(G.cx, G.y + G.h, 2, ms * (0.12 + i * 0.14), 50);
    },
    wavecats(K) {
      const { G } = K, ms = MOVE_MS.wavecats, cw = G.w * 0.52, html = nowCat();
      [-3, -2, -1, 1, 2, 3].forEach((k) => {
        const i = k + 3, x = G.cx + k * cw * 0.95 - cw / 2;
        K.add('mvx-wcat', `<div style="--tint:${POP[(i + 6) % 7]}">${html}</div>`, `left:${x.toFixed(0)}px;width:${cw}px;top:${G.y + G.h * 0.97 - cw * 0.84}px;animation-delay:${K.s(ms * 0.12 + i * 100)}`);
      });
      K.word('ウェーブ!', 14, G.bb + 10, ms * 0.12, '#ffd94a', 26, -8);
      K.word('もういっかい!', G.sw - 160, G.bb + 40, ms * 0.48, '#ff9fbb', 22, 8);
    },
    magnet(K) {
      const { G } = K, ms = MOVE_MS.magnet;
      K.add('mvx-magnet', `<svg viewBox="0 0 90 110"><path d="M86 8 L40 8 Q4 8 4 55 Q4 102 40 102 L86 102 L86 76 L42 76 Q30 76 30 55 Q30 34 42 34 L86 34 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="66" y="8" width="20" height="26" fill="#fff" stroke="${INK}" stroke-width="4"/><rect x="66" y="76" width="20" height="26" fill="#fff" stroke="${INK}" stroke-width="4"/><text x="70" y="28" font-size="16" font-weight="900" fill="${INK}">N</text><text x="71" y="96" font-size="16" font-weight="900" fill="${INK}">S</text></svg>`, `right:-4px;top:${G.y + G.h * 0.3}px`);
      for (let i = 0; i < 3; i++) K.add('mvx-field', '', `right:${30 + i * 26}px;top:${G.y + G.h * 0.3 + 55}px;animation-delay:${K.s(ms * 0.1 + i * 150)}`);
      for (let i = 0; i < 6; i++) K.add('mvx-clip', `<svg viewBox="0 0 20 40"><path d="M6 30 L6 8 Q6 3 10 3 Q14 3 14 8 L14 32 Q14 37 9 37 Q3 37 3 32 L3 12" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M6 30 L6 8 Q6 3 10 3 Q14 3 14 8 L14 32 Q14 37 9 37 Q3 37 3 32 L3 12" fill="none" stroke="#cfd6e6" stroke-width="2.5" stroke-linecap="round"/></svg>`, `left:${rnd(4, 40).toFixed(0)}%;top:${rnd(50, 85).toFixed(0)}%;--mx:${G.sw}px;animation-delay:${K.s(ms * 0.1 + i * 120)}`);
      K.word('ズズズ…', 14, G.bb + 30, ms * 0.12, '#cfd6e6', 24, -8);
      K.word('ピタッ!', G.sw - 140, G.bb + 10, ms * 0.36, '#ff6b6b', 30, 8);
      K.word('はなれた…', 20, G.bb + 60, ms * 0.72, '#fff', 20, -4);
    },
    slip(K) {
      const { G } = K, ms = MOVE_MS.slip;
      K.add('mvx-peel', `<svg viewBox="0 0 60 40"><path d="M30 30 Q14 10 2 18 Q16 22 24 34 Z M30 30 Q46 8 58 16 Q44 22 36 34 Z M30 30 Q30 6 34 0 Q38 16 36 34 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="30" cy="34" rx="10" ry="5" fill="#ffd94a" stroke="${INK}" stroke-width="3"/></svg>`, `left:${G.cx + G.w * 0.38}px;top:${G.y + G.h * 0.97 - 26}px`);
      K.word('ツルッ', G.cx + 30, G.bb + 20, ms * 0.26, '#ffd94a', 28, 8);
      K.word('ドテッ', 14, G.bb + 50, ms * 0.38, '#ffa95e', 30, -8);
      K.puffs(G.cx + G.w * 0.2, G.y + G.h, 7, ms * 0.38, 80);
      K.add('mvx-dstars', '<i>★</i><i>✦</i><i>★</i>', `left:${G.cx + G.w * 0.2}px;top:${G.y + G.h * 0.6}px`);
      K.word('セーフ', G.sw - 100, G.bb + 60, ms * 0.7, '#8fe8c8', 24, 8);
    },
    sleepwalk(K) {
      const { G } = K, ms = MOVE_MS.sleepwalk;
      K.dark('#4a3f8a', 0.3, 0.06, 0.9);
      for (let i = 0; i < 6; i++) K.add('mvx-zz', 'z', `left:${G.cx + 20}px;top:${G.y + 10}px;animation-delay:${K.s(i * ms * 0.13)}`);
      K.word('むにゃ…', 14, G.bb + 20, ms * 0.3, '#c9a7ff', 22, -6);
      K.word('ふら〜', G.sw - 100, G.bb + 50, ms * 0.5, '#ffd94a', 24, 8);
    },
    flop(K) {
      const { G } = K, ms = MOVE_MS.flop;
      K.puffs(G.cx - G.w * 0.5, G.y + G.h, 7, ms * 0.28, 80);
      K.word('ばたん', 14, G.bb + 30, ms * 0.28, '#ffa95e', 28, 10);
      K.word('むくっ', 14, G.bb + 40, ms * 0.68, '#8fe8c8', 26, -8);
    },
    shiver(K) {
      const { G } = K, ms = MOVE_MS.shiver;
      K.inBtn('mvx-shiv l', '<svg viewBox="0 0 20 60"><path d="M14 4 Q4 16 14 30 Q4 44 14 56 M6 12 Q-2 22 6 30 Q-2 40 6 48" fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/></svg>', '');
      K.inBtn('mvx-shiv r', '<svg viewBox="0 0 20 60"><path d="M6 4 Q16 16 6 30 Q16 44 6 56 M14 12 Q22 22 14 30 Q22 40 14 48" fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/></svg>', '');
      K.inBtn('mvx-frost', '', '');
      K.rain(12, '<span class="mvx-snowdot"></span>', { delayMax: ms * 0.8, dur: [1200, 1800], size: [6, 10], cls: 'mvx-flutter' });
      K.word('ぶるぶる', 14, G.bb + 20, ms * 0.08, '#8fd0ff', 26, -8);
      K.word('ガチガチ', G.sw - 120, G.bb + 50, ms * 0.45, '#cfe6ff', 22, 8);
    },
    stamp(K) {
      const { G } = K, ms = MOVE_MS.stamp, sw = G.w * 0.7;
      K.add('mvx-hanko', `<svg viewBox="0 0 120 170"><path d="M44 0 Q60 -6 76 0 L80 40 Q60 48 40 40 Z" fill="#c98a4a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="60" cy="10" rx="18" ry="7" fill="#e0a868" stroke="${INK}" stroke-width="3"/><path d="M36 40 Q60 50 84 40 L96 130 L24 130 Z" fill="#e0a868" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="14" y="128" width="92" height="28" rx="6" fill="#ff4f4f" stroke="${INK}" stroke-width="4"/></svg>`, `left:${G.cx - sw / 2}px;width:${sw}px;top:${G.y + G.h * 0.56 - sw * 170 / 120}px`);
      K.add('mvx-seal', `<svg viewBox="0 0 120 70"><ellipse cx="60" cy="35" rx="56" ry="31" fill="none" stroke="#ff4f4f" stroke-width="6"/><text x="60" y="46" text-anchor="middle" font-size="30" font-weight="900" fill="#ff4f4f" font-family="M PLUS Rounded 1c, sans-serif">てんぷる</text></svg>`, `left:${G.cx - G.w * 0.4}px;width:${G.w * 0.8}px;top:${G.y + G.h * 0.97 - G.w * 0.4}px`);
      K.word('ぽんっ!', G.cx + 20, G.bb + 20, ms * 0.24, '#ff6b6b', 30, 8);
      K.word('ぺったん', 14, G.bb + 50, ms * 0.32, '#ffa95e', 22, -6);
      K.word('…あと、ついた', G.cx - 60, G.bb + 10, ms * 0.6, '#fff', 20, 4);
    },
    sticker(K) {
      const { G } = K, ms = MOVE_MS.sticker;
      K.add('mvx-residue', nowCat(), `left:${G.x}px;top:${G.y}px;width:${G.w}px`);
      K.word('ぺりっ', G.sw - 110, G.bb + 20, ms * 0.14, '#ff9fbb', 28, 8);
      K.word('ひらひら', 14, G.bb + 50, ms * 0.45, '#8fd0ff', 22, -6);
      K.word('ぺたっ!', G.cx - 40, G.bb + 20, ms * 0.82, '#ffd94a', 28, -6);
    },
    popcorn(K) {
      const { G } = K, ms = MOVE_MS.popcorn;
      const corn = `<svg viewBox="0 0 40 36"><path d="M8 26 Q0 22 4 14 Q2 6 12 6 Q16 -2 24 4 Q34 0 34 10 Q42 14 36 22 Q38 32 28 30 Q20 38 14 30 Q6 32 8 26 Z" fill="#fffdf0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M14 24 Q18 20 22 24" stroke="#ffd94a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
      for (let i = 0; i < 16; i++) K.add('mvx-corn', corn, `left:${G.cx + rnd(-60, 60).toFixed(0) * 1}px;top:${G.y + G.h * 0.6}px;--cx:${rnd(-150, 150).toFixed(0)}px;--cy:${rnd(-170, -70).toFixed(0)}px;--fy:${(G.y + G.h * 0.95 - (G.y + G.h * 0.6) + rnd(-6, 6)).toFixed(0)}px;--rot:${rnd(-360, 360).toFixed(0)}deg;animation-delay:${K.s(ms * 0.06 + i * ms * 0.05)}`);
      [0.08, 0.3, 0.52, 0.72].forEach((t, i) => K.word('ポン!', [20, G.sw - 90, 40, G.sw - 110][i], G.bb + 20 + (i % 2) * 40, ms * t, POP[i], 24, i % 2 ? 8 : -8));
    },
    soulout(K) {
      const { G } = K, ms = MOVE_MS.soulout;
      K.add('mvx-soul', `<svg viewBox="0 0 80 110"><path d="M40 6 Q72 6 72 40 Q72 66 52 76 Q46 92 56 108 Q30 96 34 78 Q8 70 8 40 Q8 6 40 6 Z" fill="#f4f8ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" opacity=".92"/><path d="M28 36 Q32 40 36 36 M44 36 Q48 40 52 36" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M36 48 Q40 52 44 48" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M14 18 L18 4 L26 12 M66 18 L62 4 L54 12" fill="#f4f8ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`, `left:${G.x + G.w * 0.5 - 30}px;top:${G.y + G.h * 0.5 - 70}px`);
      K.word('ふわぁ…', 14, G.bb + 20, ms * 0.14, '#fff', 24, -6);
      K.word('スポッ', G.sw - 100, G.bb + 50, ms * 0.78, '#8fd0ff', 26, 8);
    },
    boomerang(K) {
      const { G } = K, ms = MOVE_MS.boomerang;
      K.add('mvx-btrail', `<svg viewBox="0 0 300 200" preserveAspectRatio="none"><path d="M150 180 C 330 170 300 -10 170 10 C 30 30 -40 160 150 180" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="7 10" stroke-linecap="round" pathLength="100"/></svg>`, `left:${G.cx - G.w * 1.25}px;width:${G.w * 2.5}px;top:${G.y + G.h * 0.55 - G.h * 0.96}px;height:${G.h * 1.02}px`);
      K.word('ヒュンヒュン', 14, G.bb + 20, ms * 0.2, '#8fd0ff', 24, -8);
      K.word('パシッ!', G.cx + 30, G.bb + 50, ms * 0.86, '#ffd94a', 28, 8);
    },
    meditate(K) {
      const { G } = K, ms = MOVE_MS.meditate;
      K.inBtn('mvx-halo', '', '');
      K.inBtn('mvx-lotus', `<svg viewBox="0 0 160 50"><path d="M80 44 Q60 0 80 -6 Q100 0 80 44 Z M80 44 Q36 10 44 4 Q70 6 80 44 Z M80 44 Q124 10 116 4 Q90 6 80 44 Z M80 46 Q14 30 10 20 Q50 14 80 46 Z M80 46 Q146 30 150 20 Q110 14 80 46 Z" fill="#ffc4d6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="80" cy="46" rx="64" ry="6" fill="#8fe8c8" stroke="${INK}" stroke-width="3"/></svg>`, '');
      K.stars(10, ms * 0.8, [10, 90, 10, 70]);
      K.word('…無', 14, G.bb + 20, ms * 0.3, '#ffd94a', 26, -6);
      K.word('さとり…', G.sw - 120, G.bb + 60, ms * 0.56, '#fff', 22, 6);
    },
    bowling(K) {
      const { G } = K, ms = MOVE_MS.bowling;
      const pin = `<svg viewBox="0 0 24 64"><path d="M12 2 Q20 2 19 14 Q17 22 15 24 Q24 38 20 56 Q18 62 12 62 Q6 62 4 56 Q0 38 9 24 Q7 22 5 14 Q4 2 12 2 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M8 18 L16 18 M7 22 L17 22" stroke="#ff4f4f" stroke-width="3"/></svg>`;
      const px0 = G.sw - 70, base = G.y + G.h * 0.97 - 46;
      [[0, 0], [1, -1], [1, 1], [2, -2], [2, 0], [2, 2]].forEach(([r, c], i) => K.add('mvx-pin', pin, `left:${(px0 + r * 14 + c * 9).toFixed(0)}px;top:${(base - r * 6).toFixed(0)}px;z-index:${3 - r};--px:${rnd(30, 140).toFixed(0)}px;--py:${rnd(-200, -90).toFixed(0)}px;--rot:${rnd(-720, 720).toFixed(0)}deg;animation-delay:${K.s(ms * 0.36 + i * 25)}`));
      K.burst(px0 + 10, base + 20, ms * 0.36, 14, 80);
      K.word('ゴロゴロ…', 14, G.bb + 30, ms * 0.14, '#cfd6e6', 22, -6);
      K.word('ストライク!!', G.cx - 100, G.bb + 6, ms * 0.38, '#ffd94a', 32, -8);
      K.puffs(G.cx, G.y + G.h, 5, ms * 0.84, 60);
    },
  };

  // 動きのあいだだけ使う CSS の値（あとで消す）
  let btnVars = [];
  function btnVar(k, v) { $('catBtn').style.setProperty(k, v); btnVars.push(k); }

  // say: その動きのひとことも出す（ふきだしの大きさでステージの高さが変わるので、絵の位置を決める前に出す）
  function bigMove(name, say) {
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
    if (say && M.moves && M.moves[name]) showBubble(pickRandom(M.moves[name]));
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
    document.documentElement.style.setProperty('--mvd', ms + 'ms'); // 画面ぜんたいのおまけ用
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
      document.documentElement.style.removeProperty('--mvd');
      document.documentElement.classList.remove('mvp-' + name);
      btnVars.forEach((k) => btn.style.removeProperty(k)); btnVars = [];
      document.querySelectorAll('.mv-extra').forEach((n) => n.remove());
      moving = false;
      drawCat(back, propsFor(new Date()));
    }, ms);
    return name;
  }

  // おためし用（プレビューで動きを選んで見る）
  window.bigMove = (name) => bigMove(name, true);
  window.bigMove.list = MOVES.slice();
  window.bigMove.ms = (name) => MOVE_MS[name] || 1800;

  $('catBtn').addEventListener('click', (e) => {
    if (moving) return; // 派手な動きの最中は、なでても何もしない
    // 3回に1回くらい、派手に動く
    if (M.moves && !reduceMotion() && Math.random() < 0.34) {
      bigMove(null, true);
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
    const memoCount = {};
    memoData().memoList.forEach((x) => { memoCount[x.date] = (memoCount[x.date] || 0) + 1; });
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
      if (memoCount[k]) el.classList.add('has-memo');
      if (memoCount[k] > 1) el.classList.add('memo-many');
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

  // ---------- 日付ごとのメモ（中身は「メモ」の所） ----------
  let selDay = ymd(new Date());
  $('calendar').addEventListener('click', (e) => {
    const cell = e.target.closest('.day[data-date]');
    if (!cell) return;
    selDay = cell.dataset.date;
    renderCalendar();
  });
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
    if (sheet.id === 'memoEditSheet') finishMemoEdit();
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
    renderBackupInfo();
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
    memoData();
    const json = JSON.stringify({ days: state.days, settings: state.settings, memoGenres: state.memoGenres, memoList: state.memoList, todo: state.todo || null });
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
  // 控えの文字を読む（だめなら null）。ファイルの途中の改行や空白は気にしない
  function parseBackup(raw) {
    try {
      const text = String(raw || '').replace(/\s+/g, '');
      const at = text.indexOf(BACKUP_PREFIX);
      if (at < 0) return null;
      const data = JSON.parse(decodeURIComponent(escape(atob(text.slice(at + BACKUP_PREFIX.length)))));
      return data && typeof data === 'object' ? data : null;
    } catch (e) { return null; }
  }
  // もどす直前の状態を、ひとつだけとっておく
  const BEFORE_KEY = 'tekuteku-temple-before-restore';
  function keepBeforeRestore() {
    try { localStorage.setItem(BEFORE_KEY, JSON.stringify(state)); } catch (e) { /* とれなくても、もどすのは足すだけなので続ける */ }
  }
  function hasBeforeRestore() {
    try { return !!localStorage.getItem(BEFORE_KEY); } catch (e) { return false; }
  }
  // 控えを、いまの記録に足す（消さない。同じ日の歩数は多いほうを残す）
  function applyBackup(data) {
    keepBeforeRestore();
    let n = 0;
    Object.entries(data.days || {}).forEach(([d, v]) => {
      if (!parseYmd(d) || !Number.isFinite(v)) return;
      state.days[d] = Math.max(state.days[d] || 0, v);
      n++;
    });
    Object.entries(data.settings || {}).forEach(([k, v]) => { if (!state.settings[k]) state.settings[k] = v; });
    // メモは、まだ無いものだけ足す（同じメモは2つにしない）
    const memoN = restoreMemos(data);
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
    renderBackupInfo();
    toast(n || !memoN ? `${n}日ぶんの記録を、もどしました` : `メモを ${memoN}こ もどしました`);
  }
  $('backupRestore').addEventListener('click', () => {
    const data = parseBackup($('backupText').value);
    if (!data) { toast('バックアップの文字を、まるごと貼ってください'); return; }
    applyBackup(data);
    $('backupText').value = '';
  });

  // ファイルに保存（iPhone では共有の画面から「"ファイル"に保存」）
  function renderBackupInfo() {
    const last = parseYmd(state.settings.lastFileBackup);
    const y = last && last.getFullYear() !== new Date().getFullYear() ? `${last.getFullYear()}年` : '';
    $('backupLast').textContent = last ? `前回の保存：${y}${last.getMonth() + 1}月${last.getDate()}日` : 'まだ保存していません';
    $('backupUndo').hidden = !hasBeforeRestore();
  }
  function markFileBackup() {
    state.settings.lastFileBackup = ymd(new Date());
    save();
    renderBackupInfo();
  }
  function downloadBackup(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    markFileBackup();
    toast('控えのファイルを保存しました');
  }
  $('backupSave').addEventListener('click', () => {
    // 押したその場で共有の画面を出す（あとからだと iPhone がことわるので）
    const name = `tekuteku-backup-${ymd(new Date())}.txt`;
    const text = makeBackup();
    let file = null;
    try { file = new File([text], name, { type: 'text/plain' }); } catch (e) { file = null; }
    if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).then(() => {
        markFileBackup();
        toast('控えをとりました');
      }, (err) => {
        if (err && err.name === 'AbortError') return; // やめたときは、なにもしない
        downloadBackup(name, text);
      });
    } else {
      downloadBackup(name, text);
    }
  });
  $('backupLoad').addEventListener('click', () => { $('backupFile').value = ''; $('backupFile').click(); });
  $('backupFile').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      $('backupFile').value = '';
      const data = parseBackup(reader.result);
      if (!data) { toast('このファイルは、てくてくの控えではないようです'); return; }
      if (!confirm('この控えの内容を戻しますか？\nいまの記録は消えずに、控えにあって足りない分が足されます。同じ日の歩数は、多いほうが残ります。')) return;
      applyBackup(data);
    };
    reader.onerror = () => toast('ファイルを読めませんでした');
    reader.readAsText(f);
  });
  $('backupUndo').addEventListener('click', () => {
    let before = null;
    try { before = JSON.parse(localStorage.getItem(BEFORE_KEY)); } catch (e) { before = null; }
    if (!before || !before.days) { renderBackupInfo(); return; }
    if (!confirm('控えを戻す前の状態にもどしますか？\n戻したあとに入れた歩数やメモも、そのときの状態にもどります。')) return;
    Object.keys(state).forEach((k) => { delete state[k]; });
    Object.assign(state, { settings: {} }, before);
    save();
    try { localStorage.removeItem(BEFORE_KEY); } catch (e) { /* なにもしない */ }
    memoData();
    renderBackupInfo();
    $('catName').value = state.settings.catName || '';
    $('catBirthday').value = state.settings.catBirthday || '';
    toast('戻す前の状態に、もどしました');
  });

  // 控えのおすすめ：記録があって、5日以上ファイルに保存していなければ、1日1回だけ
  const BACKUP_NUDGE = [
    '……そろそろ、記録の控えをとっておきますか。せっていの下のほうです',
    '……記録の控え、iCloudにしまっておくと安心です',
    '……控えのファイルがあると、iPhoneを替えても大丈夫です',
    '……しばらく控えをとっていないようです。気が向いたときにでも',
    '……せっていの「ファイルに保存」で、控えがとれます',
    '……歩いた記録、ひとつ控えておくと、こころが軽くなります',
  ];
  function backupNudge(today) {
    if (state.backupNudge === today) return null;
    const t = state.todo;
    const has = Object.keys(state.days || {}).length || (state.memoList || []).length || (t && (t.items || []).length);
    if (!has) return null;
    const last = state.settings.lastFileBackup;
    if (parseYmd(last) && daysBetween(last, today) < 5) return null;
    state.backupNudge = today;
    save();
    return BACKUP_NUDGE[hash(today + 'nudge') % BACKUP_NUDGE.length];
  }

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

  // ---------- メモ（日付ごとに いくつでも・ジャンルつき） ----------
  // state.memoGenres = [{ id, name, c }]（c は色の番号）
  // state.memoList = [{ id, date: 'YYYY-MM-DD', text, genre: id|null, star, created, updated }]
  const MEMO_COLORS = ['#ffd94a', '#ffa95e', '#8fe8c8', '#ff9fbb', '#8fd0ff', '#c9b6ff', '#b4ec9a'];
  const MEMO_GENRES_FIRST = [
    { id: 'mg-temple', name: 'てんぷる', c: 0 },
    { id: 'mg-ganban', name: '岩盤浴', c: 1 },
    { id: 'mg-play', name: '遊び', c: 2 },
    { id: 'mg-gourmet', name: 'グルメ', c: 3 },
  ];
  // 前の形（日付 → 文字）のメモを、1つずつのメモにする。同じ日・同じ文のものは足さない
  function absorbOldMemos(obj) {
    let n = 0;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 0;
    Object.entries(obj).forEach(([d, v]) => {
      if (!parseYmd(d) || typeof v !== 'string' || !v.trim()) return;
      if (state.memoList.some((m) => m.date === d && m.text === v)) return;
      const t = parseYmd(d).getTime() + 12 * 3600000;
      state.memoList.push({ id: 'm-' + uid(), date: d, text: v.slice(0, 1000), genre: null, star: false, created: t, updated: t });
      n++;
    });
    return n;
  }
  function memoData() {
    let changed = false;
    if (!Array.isArray(state.memoGenres)) { state.memoGenres = MEMO_GENRES_FIRST.map((g) => ({ ...g })); changed = true; }
    if (!Array.isArray(state.memoList)) { state.memoList = []; changed = true; }
    if ('memos' in state) { absorbOldMemos(state.memos); delete state.memos; changed = true; }
    if (changed) save();
    return state;
  }
  function restoreMemos(data) {
    memoData();
    let n = 0;
    // いまメモが1つもなければ、ジャンルもバックアップのものをそのまま使う
    if (!state.memoList.length && Array.isArray(data.memoGenres) && data.memoGenres.length) state.memoGenres = [];
    (Array.isArray(data.memoGenres) ? data.memoGenres : []).forEach((g) => {
      if (!g || !g.id || state.memoGenres.some((x) => x.id === g.id)) return;
      state.memoGenres.push({ id: String(g.id), name: String(g.name || 'ジャンル').slice(0, 12), c: Number.isFinite(g.c) ? g.c : freeColor() });
    });
    (Array.isArray(data.memoList) ? data.memoList : []).forEach((m) => {
      if (!m || !parseYmd(m.date) || typeof m.text !== 'string' || !m.text.trim()) return;
      if (state.memoList.some((x) => (m.id && x.id === m.id) || (x.date === m.date && x.text === m.text))) return;
      state.memoList.push({
        id: m.id ? String(m.id) : 'm-' + uid(), date: m.date, text: m.text.slice(0, 1000),
        genre: state.memoGenres.some((g) => g.id === m.genre) ? m.genre : null, star: !!m.star,
        created: Number(m.created) || Date.now(), updated: Number(m.updated) || Date.now(),
      });
      n++;
    });
    return n + absorbOldMemos(data.memos);
  }
  function freeColor() {
    const used = state.memoGenres.map((g) => g.c);
    const i = MEMO_COLORS.findIndex((_, k) => !used.includes(k));
    return i >= 0 ? i : state.memoGenres.length % MEMO_COLORS.length;
  }
  const memoGenre = (id) => (id && state.memoGenres.find((g) => g.id === id)) || null;
  const genreColor = (g) => MEMO_COLORS[(g.c || 0) % MEMO_COLORS.length];
  // 星つきが上。日ごとの一覧は書いた順、ぜんぶの一覧は新しい日付から
  function sortMemos(list, newest) {
    return list.slice().sort((a, b) => (b.star - a.star) ||
      (newest ? b.date.localeCompare(a.date) || b.created - a.created : a.created - b.created));
  }
  const memoDateText = (k) => {
    const d = parseYmd(k);
    const y = d.getFullYear() !== new Date().getFullYear() ? `${d.getFullYear()}年` : '';
    return `${y}${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`;
  };
  function memoItemHtml(m, withDate) {
    const g = memoGenre(m.genre);
    const meta = (withDate ? `<span class="mm-date">${memoDateText(m.date)}</span>` : '') +
      (g ? `<span class="mm-tag" style="background:${genreColor(g)}">${escHtml(g.name)}</span>` : '');
    return `<li class="mm-item${m.star ? ' starred' : ''}" data-id="${m.id}">` +
      `<button class="mm-star${m.star ? ' on' : ''}" data-act="star" aria-label="${m.star ? '星をはずす' : '星をつける'}">${m.star ? '★' : '☆'}</button>` +
      `<button class="mm-body" data-act="open">` +
      (meta ? `<span class="mm-meta">${meta}</span>` : '') +
      `<span class="mm-text">${escHtml(m.text)}</span></button></li>`;
  }

  // カレンダーの下：えらんだ日のメモ
  function renderMemo() {
    const d = parseYmd(selDay);
    const s = state.days[selDay];
    $('memoLabel').textContent = `${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）のメモ`;
    $('memoSteps').textContent = s != null ? `${s.toLocaleString()}歩` : '';
    const list = sortMemos(memoData().memoList.filter((m) => m.date === selDay), false);
    $('dayMemoList').innerHTML = list.map((m) => memoItemHtml(m, false)).join('') ||
      '<li class="mm-empty">この日のメモは、まだありません</li>';
  }

  // メモの一覧（ジャンル・さがす）
  let memoFilter = 'all', memoGenreEditing = false;
  const normText = (t) => String(t).normalize('NFKC').toLowerCase();
  function renderMemoList() {
    const st = memoData();
    if (memoFilter !== 'all' && !memoGenre(memoFilter)) memoFilter = 'all';
    $('memoMain').hidden = memoGenreEditing;
    $('memoGenreEdit').hidden = !memoGenreEditing;
    $('memoEditBtn').textContent = memoGenreEditing ? '完了' : 'ジャンル';
    if (memoGenreEditing) {
      $('memoGenreList').innerHTML = st.memoGenres.map((g, i) =>
        `<div class="tg-row" data-id="${g.id}">` +
        `<span class="mg-dot" style="background:${genreColor(g)}"></span>` +
        `<input class="tg-name" value="${escHtml(g.name)}" maxlength="12" aria-label="ジャンルの名前">` +
        `<button class="tg-btn" data-act="up" ${i === 0 ? 'disabled' : ''} aria-label="上へ">↑</button>` +
        `<button class="tg-btn" data-act="down" ${i === st.memoGenres.length - 1 ? 'disabled' : ''} aria-label="下へ">↓</button>` +
        `<button class="tg-btn del" data-act="del" aria-label="削除">削除</button></div>`).join('') ||
        '<p class="sub center">ジャンルがありません。下から足してください</p>';
      return;
    }
    const tabs = [{ id: 'all', name: 'すべて' }, ...st.memoGenres];
    $('memoTabs').innerHTML = tabs.map((g) => {
      const n = g.id === 'all' ? st.memoList.length : st.memoList.filter((m) => m.genre === g.id).length;
      return `<button class="tt-tab${g.id === memoFilter ? ' on' : ''}" data-id="${g.id}">${escHtml(g.name)}${n ? `<span class="tt-n">${n}</span>` : ''}</button>`;
    }).join('');
    const q = normText($('memoSearch').value.trim());
    const list = sortMemos(st.memoList.filter((m) =>
      (memoFilter === 'all' || m.genre === memoFilter) && (!q || normText(m.text).includes(q))), true);
    $('memoCount').textContent = q || memoFilter !== 'all' ? `${list.length}こ 見つかりました` : `ぜんぶで ${list.length}こ`;
    $('memoAll').innerHTML = list.map((m) => memoItemHtml(m, true)).join('') ||
      `<li class="mm-empty">${q ? 'その言葉のメモは、ありません' : 'メモは、まだありません'}</li>`;
  }
  function refreshMemoViews() {
    if (!$('diarySheet').hidden) renderCalendar();
    if (!$('memoSheet').hidden) renderMemoList();
  }
  function onMemoListClick(e) {
    const b = e.target.closest('[data-act]');
    const li = b && b.closest('.mm-item');
    if (!li) return;
    const m = state.memoList.find((x) => x.id === li.dataset.id);
    if (!m) return;
    if (b.dataset.act === 'star') {
      m.star = !m.star;
      save(); refreshMemoViews();
    } else {
      openMemoEditor(m, !$('memoSheet').hidden && $('diarySheet').hidden);
    }
  }
  $('dayMemoList').addEventListener('click', onMemoListClick);
  $('memoAll').addEventListener('click', onMemoListClick);
  $('dayMemoAdd').addEventListener('click', () => openMemoEditor(null, false, selDay));
  $('memoNew').addEventListener('click', () => openMemoEditor(null, true, ymd(new Date()), memoFilter !== 'all' ? memoFilter : null));
  $('memoSearch').addEventListener('input', renderMemoList);
  $('memoSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); e.target.blur(); } });
  $('memoTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tt-tab');
    if (!b) return;
    memoFilter = b.dataset.id;
    renderMemoList();
  });
  $('openMemo').addEventListener('click', () => {
    memoGenreEditing = false; memoFilter = 'all';
    $('memoSearch').value = '';
    renderMemoList();
    openSheet('memoSheet');
  });

  // ジャンルの編集（ToDo と同じやりかた）
  $('memoEditBtn').addEventListener('click', () => {
    if (memoGenreEditing) {
      $('memoGenreList').querySelectorAll('.tg-row').forEach((row) => {
        const g = memoGenre(row.dataset.id);
        const v = row.querySelector('.tg-name').value.trim();
        if (g && v) g.name = v.slice(0, 12);
      });
      save();
    }
    memoGenreEditing = !memoGenreEditing;
    renderMemoList();
  });
  $('memoGenreList').addEventListener('input', (e) => {
    const row = e.target.closest('.tg-row');
    const g = row && memoGenre(row.dataset.id);
    const v = e.target.value.trim();
    if (g && v) { g.name = v.slice(0, 12); save(); }
  });
  $('memoGenreList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const gs = state.memoGenres;
    const id = b.closest('.tg-row').dataset.id;
    const i = gs.findIndex((x) => x.id === id);
    if (i < 0) return;
    if (b.dataset.act === 'up' && i > 0) [gs[i - 1], gs[i]] = [gs[i], gs[i - 1]];
    if (b.dataset.act === 'down' && i < gs.length - 1) [gs[i + 1], gs[i]] = [gs[i], gs[i + 1]];
    if (b.dataset.act === 'del') {
      const n = state.memoList.filter((m) => m.genre === id).length;
      if (!confirm(`「${gs[i].name}」を消しますか？` + (n ? `\n入っているメモ ${n}こ は消えずに、ジャンル「なし」になります` : ''))) return;
      gs.splice(i, 1);
      state.memoList.forEach((m) => { if (m.genre === id) m.genre = null; });
    }
    save(); renderMemoList();
  });
  $('memoNewGenre').addEventListener('click', () => {
    const g = { id: 'mg-' + uid(), name: '新しいジャンル', c: freeColor() };
    state.memoGenres.push(g);
    save(); renderMemoList();
    const inputs = $('memoGenreList').querySelectorAll('.tg-name');
    const last = inputs[inputs.length - 1];
    if (last) { last.focus(); last.select(); }
  });

  // 1つのメモを書く・なおす
  let meMemo = null; // 書いている途中のメモ（まだ一覧に入っていないこともある）
  let meTimer = null;
  const meInList = () => meMemo && state.memoList.includes(meMemo);
  function openMemoEditor(m, showCalLink, date, genre) {
    memoData();
    meMemo = m || { id: 'm-' + uid(), date, text: '', genre: genre || null, star: false, created: Date.now(), updated: Date.now() };
    $('meText').value = meMemo.text;
    $('meCal').hidden = !showCalLink || !m;
    renderMemoEditor();
    openSheet('memoEditSheet');
    $('memoEditSheet').querySelector('.sheet-inner').scrollTop = 0;
    if (!m) $('meText').focus();
  }
  function renderMemoEditor() {
    const m = meMemo;
    $('meTitle').textContent = memoDateText(m.date);
    $('meDate').value = m.date;
    $('meStar').textContent = m.star ? '★' : '☆';
    $('meStar').classList.toggle('on', m.star);
    $('meStar').setAttribute('aria-label', m.star ? '星をはずす' : '星をつける');
    $('meGenres').innerHTML = [{ id: '', name: 'なし' }, ...state.memoGenres].map((g) =>
      `<button class="me-g${(m.genre || '') === g.id ? ' on' : ''}" data-id="${g.id}"` +
      (g.id ? ` style="--gc:${genreColor(g)}"` : '') + `>${escHtml(g.name)}</button>`).join('');
  }
  function storeMemo() {
    clearTimeout(meTimer);
    if (!meMemo) return;
    const v = $('meText').value.replace(/\s+$/, '').slice(0, 1000);
    if (v !== meMemo.text) { meMemo.text = v; meMemo.updated = Date.now(); }
    if (v && !meInList()) state.memoList.push(meMemo);
    if (meInList()) save();
  }
  function finishMemoEdit() {
    if (!meMemo) return;
    storeMemo();
    // 中身を全部消したメモは、なくす
    if (!meMemo.text && meInList()) { state.memoList.splice(state.memoList.indexOf(meMemo), 1); save(); }
    meMemo = null;
    $('meText').blur();
    refreshMemoViews();
  }
  $('meText').addEventListener('input', () => { clearTimeout(meTimer); meTimer = setTimeout(storeMemo, 400); });
  $('meText').addEventListener('blur', storeMemo);
  $('meStar').addEventListener('click', () => {
    meMemo.star = !meMemo.star;
    storeMemo(); renderMemoEditor();
  });
  $('meGenres').addEventListener('click', (e) => {
    const b = e.target.closest('.me-g');
    if (!b) return;
    meMemo.genre = b.dataset.id || null;
    storeMemo(); renderMemoEditor();
  });
  $('meDate').addEventListener('change', (e) => {
    if (!parseYmd(e.target.value)) { e.target.value = meMemo.date; return; }
    meMemo.date = e.target.value;
    storeMemo(); renderMemoEditor();
  });
  $('meDelete').addEventListener('click', () => {
    storeMemo();
    if (meInList() && meMemo.text && !confirm('このメモを消しますか？')) return;
    if (meInList()) state.memoList.splice(state.memoList.indexOf(meMemo), 1);
    save();
    meMemo = null;
    closeSheet($('memoEditSheet'));
    refreshMemoViews();
    toast('メモを消しました');
  });
  $('meCal').addEventListener('click', () => {
    const date = meMemo.date;
    closeSheet($('memoEditSheet'));
    $('memoSheet').hidden = true;
    selDay = date;
    calMonth = parseYmd(date); calMonth.setDate(1);
    renderCalendar();
    openSheet('diarySheet');
  });
  memoData();

  // ---------- 起動 ----------
  const received = receiveFromUrl();
  if (received != null) {
    nudgeQuiet = true;
    render();
    nudgeQuiet = false;
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
