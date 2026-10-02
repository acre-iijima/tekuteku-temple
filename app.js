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
    return { holiday, event, season, tod: timeOfDay(now.getHours()), birthday: isBirthday(now) };
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
    document.body.className = `t-${info.tod} s-${info.season}`;
    const deco = $('skyDeco');
    deco.innerHTML = '';
    if (info.tod === 'night' || info.tod === 'late') {
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
    if (info.birthday) chars = [['★', '#e9928c'], ['★', '#2b2b2b']];
    else if (info.season === 'spring') chars = [['✿', '#e9a0ae']];
    else if (info.season === 'autumn') chars = [['◆', '#d98a4f'], ['◆', '#b8643a']];
    else if (info.season === 'winter') chars = [['❄\uFE0E', '#9aa8cc']];
    else if (info.tod === 'night' || info.tod === 'late') chars = [['✦', '#b9a64a']];
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
      ? `${reached[1]}くらい、いっしょに歩きました（${days}日ぶん）`
      : 'これから、のんびり歩いていきましょう';
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
    renderNumbers(steps);
    renderReview(now);
    drawCat(poseFor(info, steps), propsFor(now));
    showBubble(buildMessage(now, info, steps));
  }

  // ---------- なでる ----------
  let poseTimer = null;
  function cheer() {
    const cat = $('cat');
    const back = currentPose === 'upright' ? cheer.back : currentPose;
    cheer.back = back;
    drawCat('upright', propsFor(new Date()));
    cat.classList.remove('hop');
    void cat.getBoundingClientRect();
    cat.classList.add('hop');
    clearTimeout(poseTimer);
    poseTimer = setTimeout(() => drawCat(back, propsFor(new Date())), 1600);
  }
  $('catBtn').addEventListener('click', (e) => {
    cheer();
    showBubble(pickRandom(M.tap));
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
      ? `この月は ${count}日ぶん、あわせて ${fmtKm(km(sum))} km でした`
      : 'この月の記録は、まだありません';
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
    if (!parseYmd(date) || !Number.isFinite(steps) || steps < 0) { toast('日付と歩数を入れてください'); return; }
    recordSteps(date, steps, true);
    $('manualSteps').value = '';
    toast(`${date.slice(5).replace('-', '/')} に ${steps.toLocaleString()}歩 を入れました`);
  });

  // ---------- バックアップ ----------
  const BACKUP_PREFIX = 'TEKUTEKU1:';
  function makeBackup() {
    const json = JSON.stringify({ days: state.days, settings: state.settings });
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
      save();
      $('backupText').value = '';
      toast(`${n}日ぶんの記録を、もどしました`);
    } catch (e) {
      toast('バックアップの文字を、まるごと貼ってください');
    }
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
    at(hour) {
      hourOverride = hour;
      render();
    },
  };

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
