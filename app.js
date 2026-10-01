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
    if (h >= 5 && h < 10) return 'morning';
    if (h >= 10 && h < 16) return 'day';
    if (h >= 16 && h < 19) return 'evening';
    return 'night';
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
  // その日のうちは同じ言葉になるように、日付で決める
  const pickDaily = (arr, seed) => arr[hash(seed) % arr.length];
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
    return { holiday, event, season, tod: timeOfDay(now.getHours()), birthday: isBirthday(now) };
  }

  function buildMessage(now, info, steps) {
    const key = ymd(now);
    const vars = {
      steps: steps != null ? steps.toLocaleString() : '',
      km: steps != null ? fmtKm(km(steps)) : '',
      name: catName(),
      holiday: info.holiday,
    };
    let first;
    if (info.birthday) first = pickDaily(M.birthday, key + 'b');
    else if (info.holiday) first = pickDaily(M.holidayByName[info.holiday] || M.holiday, key + 'h');
    else if (info.event && M.event[info.event]) first = pickDaily(M.event[info.event], key + 'e');
    else {
      const pools = [M.greet[info.tod], M.season[now.getMonth() + 1], M.weekday[now.getDay()]];
      const pool = pools[hash(key + info.tod) % pools.length];
      first = pickDaily(pool, key + info.tod + 'g');
    }
    const band = stepsBand(steps);
    const second = pickDaily(M.steps[band], key + band);
    return fill(first, vars) + '\n' + fill(second, vars);
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
    document.body.className = `t-${info.tod} s-${info.season}`;
    const deco = $('skyDeco');
    deco.innerHTML = '';
    if (info.tod === 'night') {
      const moon = document.createElement('div');
      moon.className = 'moon' + (info.event === '十五夜' ? ' full' : '');
      deco.appendChild(moon);
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('div');
        s.className = 'star';
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
    if (info.birthday) chars = [['★', '#f2849e'], ['★', '#1d3c8f']];
    else if (info.season === 'spring') chars = [['✿', '#f2849e']];
    else if (info.season === 'autumn') chars = [['◆', '#e98a3c'], ['◆', '#c9572e']];
    else if (info.season === 'winter') chars = [['❄\uFE0E', '#ffffff']];
    else if (info.tod === 'night') chars = [['✦', '#fff2b8']];
    if (!chars) return;
    for (let i = 0; i < 9; i++) {
      const el = document.createElement('span');
      el.className = 'particle';
      const [ch, color] = chars[i % chars.length];
      el.textContent = ch;
      el.style.color = color;
      el.style.left = (i * 11 + (hash('p' + i) % 8)) + '%';
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

  const PAW = '<svg viewBox="0 0 20 20" width="16" height="16" fill="#1d3c8f"><ellipse cx="10" cy="13" rx="5" ry="4.2"/><circle cx="4" cy="8" r="2.2"/><circle cx="8" cy="4.5" r="2.2"/><circle cx="12" cy="4.5" r="2.2"/><circle cx="16" cy="8" r="2.2"/></svg>';

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
      : 'ショートカットから歩数を届けてね';

    const total = Object.values(state.days).reduce((a, b) => a + (b || 0), 0);
    const totalKm = km(total);
    $('totalKm').textContent = `${fmtKm(totalKm)} km`;
    const reached = MILESTONES.filter(([d]) => totalKm >= d).pop();
    const days = Object.keys(state.days).length;
    $('totalNote').textContent = reached
      ? `${reached[1]}くらい、いっしょに歩いたよ（${days}日ぶん）`
      : 'これからいっしょに、のんびり歩いていこうね';
  }

  function showBubble(text) {
    const b = $('bubble');
    $('bubbleText').textContent = text;
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
  }

  function render() {
    const now = new Date();
    const info = todayInfo(now);
    const steps = state.days[ymd(now)];
    $('dateLabel').textContent = `${now.getMonth() + 1}月${now.getDate()}日（${WD[now.getDay()]}）`;
    renderSky(info, now);
    renderChip(info);
    renderNumbers(steps);
    const msg = buildMessage(now, info, steps);
    showBubble(msg);
  }

  // ---------- なでる ----------
  let happyTimer = null;
  function cheer() {
    const cat = $('cat');
    cat.classList.remove('hop');
    void cat.getBoundingClientRect();
    cat.classList.add('hop', 'happy');
    clearTimeout(happyTimer);
    happyTimer = setTimeout(() => cat.classList.remove('happy'), 1600);
  }
  $('catBtn').addEventListener('click', (e) => {
    cheer();
    showBubble(pickRandom(M.tap));
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = pickRandom(['♥', '★', '♥', '✦']);
    heart.style.color = pickRandom(['#f2849e', '#1d3c8f']);
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
      const el = document.createElement('div');
      el.className = 'day';
      if (JpCalendar.holiday(date) || date.getDay() === 0) el.classList.add('holiday');
      if (k === todayKey) el.classList.add('today');
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
      ? `この月は ${count}日ぶんのおさんぽ、あわせて ${fmtKm(km(sum))} km`
      : 'この月の記録はまだないよ。のんびりいこうね';
  }
  $('prevMonth').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
  $('nextMonth').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });

  // ---------- シート ----------
  function openSheet(id) { $(id).hidden = false; }
  document.querySelectorAll('.sheet').forEach((sheet) => {
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet || e.target.hasAttribute('data-close')) {
        sheet.hidden = true;
        render();
      }
    });
  });
  $('openDiary').addEventListener('click', () => {
    calMonth = new Date(); calMonth.setDate(1);
    renderCalendar();
    openSheet('diarySheet');
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
    if (!parseYmd(date) || !Number.isFinite(steps) || steps < 0) { toast('日付と歩数を入れてね'); return; }
    recordSteps(date, steps, true);
    $('manualSteps').value = '';
    toast(`${date.slice(5).replace('-', '/')} に ${steps.toLocaleString()}歩 を入れたよ`);
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

  // 開きっぱなしで日付や時間帯が変わっても追いつく
  let lastKey = ymd(new Date()) + timeOfDay(new Date().getHours());
  setInterval(() => {
    const k = ymd(new Date()) + timeOfDay(new Date().getHours());
    if (k !== lastKey) { lastKey = k; render(); }
  }, 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

  // おためし用（歩数が届いたときと同じ動きをする）
  window.TekuTeku = {
    send(steps) {
      recordSteps(ymd(new Date()), steps, true);
      render();
      toast(fill(pickRandom(M.received), { steps: steps.toLocaleString() }));
      setTimeout(cheer, 300);
    },
  };

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
