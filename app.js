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
  function poseFor(info, steps) {
    if (info.tod === 'dawn' || info.tod === 'morning') return 'stretch';
    if (info.tod === 'evening') return 'back';
    if (info.tod === 'night' || info.tod === 'late') return 'loaf';
    return steps >= 8000 ? 'stand' : 'sit';
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
      if (p === 'scarf') extra += `<g transform="translate(${pose.neck.x} ${pose.neck.y})">${Props.scarfOf(pose.neck.w)}</g>`;
      else extra += `<g transform="translate(${pose.head.x} ${pose.head.y}) rotate(${pose.head.r})">${Props[p]}</g>`;
    });
    $('catPose').innerHTML = pose.svg + extra;
    $('cat').classList.toggle('sleeping', !!pose.sleeping);
    currentPose = poseName;
  }

  // ---------- 歩数の受け取り（ショートカットから） ----------
  function receiveFromUrl() {
    const params = new URLSearchParams(location.search);
    if (!params.has('steps')) return null;
    const steps = Math.round(parseFloat(String(params.get('steps')).replace(/[,，\s]/g, '')));
    const date = parseYmd(params.get('date')) ? params.get('date') : ymd(new Date());
    history.replaceState(null, '', location.pathname); // URLをきれいに戻す
    if (!Number.isFinite(steps)) return null;
    recordSteps(date, steps);
    return steps;
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
    drawCat(poseFor(info, steps), propsFor(now));
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
  $('catBtn').addEventListener('click', (e) => {
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

  let addQty = 1; // 足すときの個数
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
    $('todoQtyVal').textContent = addQty;
    $('todoQtyMinus').disabled = addQty <= 1;
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
      `<span class="td-text">${escHtml(x.text)}${x.qty > 1 ? `<span class="td-qty">×${x.qty}</span>` : ''}</span>` +
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
    t.items.push({ id: uid(), genre: t.current, text: v.slice(0, 100), qty: addQty, done: false });
    $('todoInput').value = '';
    addQty = 1;
    save(); renderTodo();
  }
  $('todoAdd').addEventListener('click', addTodo);
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
  // 個数：ふだんは1個。2個以上のときだけ「×2」と出す
  $('todoQtyMinus').addEventListener('click', () => { addQty = Math.max(1, addQty - 1); renderTodo(); });
  $('todoQtyPlus').addEventListener('click', () => { addQty = Math.min(99, addQty + 1); renderTodo(); });
  $('todoPins').addEventListener('click', (e) => {
    const t = todo();
    const pins = t.pins[t.current] || [];
    const add = e.target.closest('.tp-add'), x = e.target.closest('.tp-x');
    if (add) {
      const text = pins[+add.dataset.i];
      if (!text) return;
      const done = t.items.find((it) => it.genre === t.current && it.text === text);
      if (done && !done.done) return; // もう入っている
      if (done) { done.done = false; done.qty = addQty; } // 終わったものに残っていたら、もどす
      else t.items.push({ id: uid(), genre: t.current, text, qty: addQty, done: false });
      addQty = 1;
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
    todoEditing = false; pinsOpen = false; addQty = 1;
    todo().current = todo().genres[0] ? todo().genres[0].id : null; // 開いたときは、いちばん上のジャンル（買い物）
    renderTodo();
    openSheet('todoSheet');
  });

  // ---------- 起動 ----------
  const received = receiveFromUrl();
  if (received != null) {
    render();
    toast(fill(pickRandom(M.received), { steps: received.toLocaleString() }));
    setTimeout(cheer, 400);
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
