// 日本の祝日・季節の行事・記念日を計算する（2026年以降も自動計算）
(function () {
  const pad = (n) => String(n).padStart(2, '0');
  const key = (m, d) => `${pad(m)}-${pad(d)}`;

  // 第n月曜日
  function nthMonday(y, m, n) {
    const first = new Date(y, m - 1, 1).getDay();
    const offset = (8 - first) % 7; // 最初の月曜までの日数
    return 1 + offset + (n - 1) * 7;
  }

  // 春分・秋分（1980〜2099年で有効な近似式）
  const shunbun = (y) => Math.floor(20.8431 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
  const shubun = (y) => Math.floor(23.2488 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));

  const cache = {};
  function holidaysOfYear(y) {
    if (cache[y]) return cache[y];
    const h = {};
    h[key(1, 1)] = '元日';
    h[key(1, nthMonday(y, 1, 2))] = '成人の日';
    h[key(2, 11)] = '建国記念の日';
    h[key(2, 23)] = '天皇誕生日';
    h[key(3, shunbun(y))] = '春分の日';
    h[key(4, 29)] = '昭和の日';
    h[key(5, 3)] = '憲法記念日';
    h[key(5, 4)] = 'みどりの日';
    h[key(5, 5)] = 'こどもの日';
    h[key(7, nthMonday(y, 7, 3))] = '海の日';
    h[key(8, 11)] = '山の日';
    h[key(9, nthMonday(y, 9, 3))] = '敬老の日';
    h[key(9, shubun(y))] = '秋分の日';
    h[key(10, nthMonday(y, 10, 2))] = 'スポーツの日';
    h[key(11, 3)] = '文化の日';
    h[key(11, 23)] = '勤労感謝の日';

    const isH = (dt) => dt.getFullYear() === y && !!h[key(dt.getMonth() + 1, dt.getDate())];

    // 国民の休日（祝日にはさまれた平日）
    for (let m = 1; m <= 12; m++) {
      const days = new Date(y, m, 0).getDate();
      for (let d = 2; d < days; d++) {
        const dt = new Date(y, m - 1, d);
        if (h[key(m, d)] || dt.getDay() === 0) continue;
        if (isH(new Date(y, m - 1, d - 1)) && isH(new Date(y, m - 1, d + 1))) h[key(m, d)] = '国民の休日';
      }
    }
    // 振替休日（日曜の祝日の次の、祝日でない日）
    Object.keys(h).forEach((k) => {
      const [m, d] = k.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      if (dt.getDay() !== 0) return;
      const n = new Date(y, m - 1, d + 1);
      while (isH(n)) n.setDate(n.getDate() + 1);
      if (n.getFullYear() === y) h[key(n.getMonth() + 1, n.getDate())] = '振替休日';
    });
    cache[y] = h;
    return h;
  }

  // 十五夜（中秋の名月）は旧暦なので表で持つ
  const jugoya = { 2026: '09-25', 2027: '09-15', 2028: '10-03', 2029: '09-22', 2030: '09-12' };

  // 祝日以外の行事・記念日
  const events = {
    '01-02': '初夢の日', '01-03': 'お正月三が日', '01-07': '七草がゆ',
    '02-03': '節分', '02-14': 'バレンタインデー', '02-22': '猫の日',
    '03-03': 'ひなまつり', '03-14': 'ホワイトデー', '04-01': 'エイプリルフール',
    '05-01': '八十八夜のころ', '06-21': '夏至のころ', '07-07': '七夕',
    '08-08': '世界猫の日', '08-13': 'お盆', '08-14': 'お盆', '08-15': 'お盆',
    '10-31': 'ハロウィン', '11-15': '七五三', '11-22': 'いい夫婦の日',
    '12-22': '冬至のころ', '12-24': 'クリスマスイブ', '12-25': 'クリスマス',
    '12-31': '大晦日',
  };

  window.JpCalendar = {
    holiday(date) {
      return holidaysOfYear(date.getFullYear())[key(date.getMonth() + 1, date.getDate())] || null;
    },
    event(date) {
      const k = key(date.getMonth() + 1, date.getDate());
      if (jugoya[date.getFullYear()] === k) return '十五夜';
      // 母の日（5月第2日曜）・父の日（6月第3日曜）
      const m = date.getMonth() + 1, d = date.getDate(), w = date.getDay();
      if (m === 5 && w === 0 && d >= 8 && d <= 14) return '母の日';
      if (m === 6 && w === 0 && d >= 15 && d <= 21) return '父の日';
      return events[k] || null;
    },
  };
})();
