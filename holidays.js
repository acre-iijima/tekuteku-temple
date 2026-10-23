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

  // 祝日以外の行事・記念日（節分・八十八夜・夏至・冬至は下の歳時記で毎年計算）
  const events = {
    '01-02': '初夢の日', '01-03': 'お正月三が日', '01-07': '七草がゆ',
    '02-14': 'バレンタインデー', '02-22': '猫の日',
    '03-03': 'ひなまつり', '03-14': 'ホワイトデー', '04-01': 'エイプリルフール',
    '07-07': '七夕',
    '08-08': '世界猫の日', '08-13': 'お盆', '08-14': 'お盆', '08-15': 'お盆',
    '10-31': 'ハロウィン', '11-15': '七五三', '11-22': 'いい夫婦の日',
    '12-24': 'クリスマスイブ', '12-25': 'クリスマス',
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

// ---------- 歳時記（二十四節気・七十二候・雑節） ----------
// 太陽の黄経（見かけの位置）を毎回計算するので、年ごとの表はいりません。
// 節気は15°ごと、候は5°ごと。その瞬間（日本時間）をふくむ日が、はじまりの日です。
(function () {
  const DAY = 86400000;
  const rad = Math.PI / 180;

  // 太陽の視黄経（度）。長沢工『日の出・日の入りの計算』の式（誤差は1分角くらい）
  const SUN_TERMS = [
    [0.0200, 355.05, 719.981], [0.0048, 234.95, 19.341], [0.0020, 247.1, 329.64],
    [0.0018, 297.8, 4452.67], [0.0018, 251.3, 0.20], [0.0015, 343.2, 450.37],
    [0.0013, 81.4, 225.18], [0.0008, 132.5, 659.29], [0.0007, 153.3, 90.38],
    [0.0007, 206.8, 30.35], [0.0006, 29.8, 337.18], [0.0005, 207.4, 1.50],
    [0.0005, 291.2, 22.81], [0.0004, 234.9, 315.56], [0.0004, 157.3, 299.30],
    [0.0004, 21.1, 720.02], [0.0003, 352.5, 1079.97], [0.0003, 329.7, 44.43],
  ];
  function sunLongitude(ms) {
    // 力学時に直す（ΔT はおよそ70秒）
    const T = ((ms + 70000) / DAY + 2440587.5 - 2451545.0) / 365.25;
    let lon = 280.4603 + 360.00769 * T + (1.9146 - 0.00005 * T) * Math.sin((357.538 + 359.991 * T) * rad);
    SUN_TERMS.forEach(([a, b, c]) => { lon += a * Math.sin((b + c * T) * rad); });
    return ((lon % 360) + 360) % 360;
  }
  // 日本時間のその日の0時（UTCのミリ秒）
  const jstStart = (y, m, d) => Date.UTC(y, m - 1, d) - 9 * 3600000;
  // 立春（315°）から数えた角度
  const fromRisshun = (lon) => (lon - 315 + 360) % 360;

  const SEKKI = [
    ['立春', 'りっしゅん', '春のはじまり。寒さのなかに、春の気配'],
    ['雨水', 'うすい', '雪が雨にかわり、氷がとけはじめるころ'],
    ['啓蟄', 'けいちつ', '土の中の虫たちが、目をさますころ'],
    ['春分', 'しゅんぶん', '昼と夜の長さが、ほぼ同じになる日'],
    ['清明', 'せいめい', '草木が芽ぶき、すがすがしく明るいころ'],
    ['穀雨', 'こくう', '田畑をうるおす、春の雨がふるころ'],
    ['立夏', 'りっか', '夏のはじまり。風がさわやかなころ'],
    ['小満', 'しょうまん', '草木がぐんぐん育ち、満ちていくころ'],
    ['芒種', 'ぼうしゅ', '稲や麦など、穂の出る作物の種まきのころ'],
    ['夏至', 'げし', '一年でいちばん、昼が長い日'],
    ['小暑', 'しょうしょ', '梅雨があけ、暑さが本格的になるころ'],
    ['大暑', 'たいしょ', '一年でいちばん暑いころ'],
    ['立秋', 'りっしゅう', '秋のはじまり。暑さはまだ続きます'],
    ['処暑', 'しょしょ', '暑さが、やっとおさまりはじめるころ'],
    ['白露', 'はくろ', '草に白い露が光りはじめるころ'],
    ['秋分', 'しゅうぶん', '昼と夜の長さが、ほぼ同じになる日'],
    ['寒露', 'かんろ', '露がつめたく感じられるころ'],
    ['霜降', 'そうこう', '朝晩が冷えこみ、霜がおりはじめるころ'],
    ['立冬', 'りっとう', '冬のはじまり。日ざしが弱くなるころ'],
    ['小雪', 'しょうせつ', '山に、雪がちらつきはじめるころ'],
    ['大雪', 'たいせつ', '雪が本格的にふりはじめるころ'],
    ['冬至', 'とうじ', '一年でいちばん、昼が短い日'],
    ['小寒', 'しょうかん', '寒の入り。寒さがきびしくなるころ'],
    ['大寒', 'だいかん', '一年でいちばん寒いころ'],
  ];
  const KOU = [
    ['東風解凍', 'はるかぜこおりをとく', '春の風が、川や池の氷をとかしはじめる'],
    ['黄鶯睍睆', 'うぐいすなく', 'うぐいすが、山里で鳴きはじめる'],
    ['魚上氷', 'うおこおりをいずる', '割れた氷のあいだから、魚がはねる'],
    ['土脉潤起', 'つちのしょううるおいおこる', '雨がふって、土がしっとりしてくる'],
    ['霞始靆', 'かすみはじめてたなびく', '春の霞が、うっすらたなびきはじめる'],
    ['草木萌動', 'そうもくめばえいずる', '草や木が、芽をふきはじめる'],
    ['蟄虫啓戸', 'すごもりむしとをひらく', '冬ごもりの虫が、戸をあけて出てくる'],
    ['桃始笑', 'ももはじめてさく', '桃のつぼみがひらき、花が咲きはじめる'],
    ['菜虫化蝶', 'なむしちょうとなる', 'さなぎが、モンシロチョウになる'],
    ['雀始巣', 'すずめはじめてすくう', 'すずめが、巣をつくりはじめる'],
    ['櫻始開', 'さくらはじめてひらく', '桜の花が、咲きはじめる'],
    ['雷乃発声', 'かみなりすなわちこえをはっす', '遠くで、春の雷が鳴りはじめる'],
    ['玄鳥至', 'つばめきたる', 'つばめが、南の国からやってくる'],
    ['鴻雁北', 'こうがんかえる', '雁（がん）が、北の国へ帰っていく'],
    ['虹始見', 'にじはじめてあらわる', '雨のあとに、虹が見えはじめる'],
    ['葭始生', 'あしはじめてしょうず', '水辺の葦（あし）が、芽をふく'],
    ['霜止出苗', 'しもやんでなえいずる', '霜がおりなくなり、苗が育つ'],
    ['牡丹華', 'ぼたんはなさく', '牡丹の、大きな花が咲く'],
    ['蛙始鳴', 'かわずはじめてなく', 'かえるが、鳴きはじめる'],
    ['蚯蚓出', 'みみずいずる', 'みみずが、土の上に出てくる'],
    ['竹笋生', 'たけのこしょうず', 'たけのこが、にょきっと出てくる'],
    ['蚕起食桑', 'かいこおきてくわをはむ', '蚕（かいこ）が、桑の葉をもりもり食べる'],
    ['紅花栄', 'べにばなさかう', '紅花が、いちめんに咲く'],
    ['麦秋至', 'むぎのときいたる', '麦が実って、とり入れのころになる'],
    ['蟷螂生', 'かまきりしょうず', 'かまきりが、卵からうまれる'],
    ['腐草為螢', 'くされたるくさほたるとなる', '草むらから、ほたるが光りはじめる'],
    ['梅子黄', 'うめのみきばむ', '梅の実が、黄色く熟す'],
    ['乃東枯', 'なつかれくさかるる', 'うつぼぐさ（夏枯草）の花が枯れる'],
    ['菖蒲華', 'あやめはなさく', 'あやめの花が咲く'],
    ['半夏生', 'はんげしょうず', '半夏（からすびしゃく）が生える'],
    ['温風至', 'あつかぜいたる', 'あたたかい風が、ふいてくる'],
    ['蓮始開', 'はすはじめてひらく', '蓮の花が、ひらきはじめる'],
    ['鷹乃学習', 'たかすなわちわざをならう', '鷹のひなが、飛びかたをおぼえる'],
    ['桐始結花', 'きりはじめてはなをむすぶ', '桐が、実をつけはじめる'],
    ['土潤溽暑', 'つちうるおうてむしあつし', '土がしめって、むし暑くなる'],
    ['大雨時行', 'たいうときどきふる', 'ときどき、夕立のような大雨がふる'],
    ['涼風至', 'すずかぜいたる', 'すずしい風が、ふきはじめる'],
    ['寒蝉鳴', 'ひぐらしなく', 'ひぐらしが、カナカナと鳴く'],
    ['蒙霧升降', 'ふかききりまとう', '深い霧が、たちこめる'],
    ['綿柎開', 'わたのはなしべひらく', '綿の実をつつむ、がくがひらく'],
    ['天地始粛', 'てんちはじめてさむし', 'ようやく、暑さがしずまる'],
    ['禾乃登', 'こくものすなわちみのる', '稲が実って、穂をたらす'],
    ['草露白', 'くさのつゆしろし', '草におりた露が、白く光る'],
    ['鶺鴒鳴', 'せきれいなく', 'せきれいが、鳴きはじめる'],
    ['玄鳥去', 'つばめさる', 'つばめが、南の国へ帰っていく'],
    ['雷乃収声', 'かみなりすなわちこえをおさむ', '雷が、鳴らなくなる'],
    ['蟄虫坏戸', 'むしかくれてとをふさぐ', '虫たちが、土の中にもぐって戸をふさぐ'],
    ['水始涸', 'みずはじめてかるる', '田んぼの水をぬいて、稲刈りにそなえる'],
    ['鴻雁来', 'こうがんきたる', '雁（がん）が、北の国からやってくる'],
    ['菊花開', 'きくのはなひらく', '菊の花が咲く'],
    ['蟋蟀在戸', 'きりぎりすとにあり', '戸口のあたりで、こおろぎが鳴く'],
    ['霜始降', 'しもはじめてふる', '霜が、おりはじめる'],
    ['霎時施', 'こさめときどきふる', '小雨が、ときどきぱらつく'],
    ['楓蔦黄', 'もみじつたきばむ', 'もみじや蔦（つた）が、色づく'],
    ['山茶始開', 'つばきはじめてひらく', '山茶花（さざんか）が咲きはじめる'],
    ['地始凍', 'ちはじめてこおる', '大地が、こおりはじめる'],
    ['金盞香', 'きんせんかさく', '水仙の花が咲き、香る'],
    ['虹蔵不見', 'にじかくれてみえず', '虹を、見かけなくなる'],
    ['朔風払葉', 'きたかぜこのはをはらう', '北風が、木の葉をはらいおとす'],
    ['橘始黄', 'たちばなはじめてきばむ', '橘（たちばな）の実が、黄色くなる'],
    ['閉塞成冬', 'そらさむくふゆとなる', '空がどんよりして、本格的な冬になる'],
    ['熊蟄穴', 'くまあなにこもる', '熊が、穴にこもって冬ごもりする'],
    ['鱖魚群', 'さけのうおむらがる', '鮭が、群れになって川をのぼる'],
    ['乃東生', 'なつかれくさしょうず', 'うつぼぐさ（夏枯草）が、芽を出す'],
    ['麋角解', 'さわしかのつのおつる', '大鹿の角が、ぽろりと落ちる'],
    ['雪下出麦', 'ゆきわたりてむぎのびる', '雪の下で、麦が芽を出す'],
    ['芹乃栄', 'せりすなわちさかう', '芹（せり）が、よく育つ'],
    ['水泉動', 'しみずあたたかをふくむ', '地中で、こおった泉が動きはじめる'],
    ['雉始雊', 'きじはじめてなく', 'おすの雉（きじ）が、鳴きはじめる'],
    ['款冬華', 'ふきのはなさく', '雪の下から、ふきのとうが顔を出す'],
    ['水沢腹堅', 'さわみずこおりつめる', '沢の水が、厚くこおる'],
    ['鶏始乳', 'にわとりはじめてとやにつく', 'にわとりが、卵をうみはじめる'],
  ];
  const ZASSETSU = {
    '節分': ['せつぶん', '立春の前の日。季節の分かれめ'],
    '彼岸入り': ['ひがんいり', '春分・秋分をはさんだ7日間の、はじまりの日'],
    '彼岸の中日': ['ひがんのちゅうにち', 'お彼岸のまんなか。春分・秋分の日'],
    '彼岸明け': ['ひがんあけ', 'お彼岸の、最後の日'],
    '社日': ['しゃにち', '春分・秋分にいちばん近い戊（つちのえ）の日。土地の神さまをまつる'],
    '八十八夜': ['はちじゅうはちや', '立春から88日め。茶摘みと、霜の終わりの目安'],
    '入梅': ['にゅうばい', '暦のうえでの、梅雨入り'],
    '半夏生': ['はんげしょう', '田植えを終える目安の日。たこを食べる地方も'],
    '土用入り': ['どよういり', '立春・立夏・立秋・立冬の前の約18日間、土用のはじまり'],
    '二百十日': ['にひゃくとおか', '立春から210日め。台風に気をつける日'],
    '二百二十日': ['にひゃくはつか', '立春から220日め。こちらも台風の目安'],
  };
  const DOYO = { 297: '冬', 27: '春', 117: '夏', 207: '秋' };

  // 年ごとに、毎日0時の黄経を計算しておく（日付→その日にまたいだ角度がわかる）
  const yearCache = {};
  function yearTable(y) {
    if (yearCache[y]) return yearCache[y];
    const days = [];
    // 前の年の12/31 から 次の年の1/1 まで
    for (let t = jstStart(y, 1, 0); t <= jstStart(y + 1, 1, 1); t += DAY) days.push(sunLongitude(t));
    return (yearCache[y] = days); // days[i] は y年1月i日（i=0は前年12/31）の0時
  }
  const dayIndex = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / DAY);
  // その日のうちに、太陽が lon 度を通るか
  function crosses(y, m, d, lon) {
    const t = yearTable(y), i = dayIndex(y, m, d);
    const a = t[i], b = t[i + 1];
    const da = (lon - a + 360) % 360, span = (b - a + 360) % 360;
    return da > 0 && da <= span;
  }
  // y年で、太陽が lon 度を通る日（Date、なければ null）
  function dateOfLongitude(y, lon) {
    const t = yearTable(y);
    for (let i = 1; i < t.length - 1; i++) {
      const da = (lon - t[i] + 360) % 360, span = (t[i + 1] - t[i] + 360) % 360;
      if (da > 0 && da <= span) return new Date(y, 0, i);
    }
    return null;
  }
  const addDays = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  // その日の終わり（24時）の位置で、何番めの候か（立春の初候が0）
  function kouIndexOf(date) {
    const y = date.getFullYear(), i = dayIndex(y, date.getMonth() + 1, date.getDate());
    return Math.floor(fromRisshun(yearTable(y)[i + 1]) / 5) % 72;
  }
  // 候 k がはじまった日（date からさかのぼる）
  function startOfKou(date, k) {
    let d = date;
    for (let n = 0; n < 40; n++) {
      const prev = addDays(d, -1);
      if (kouIndexOf(prev) !== k) return d;
      d = prev;
    }
    return d;
  }
  function endOfKou(date, k) {
    let d = date;
    for (let n = 0; n < 40; n++) {
      const next = addDays(d, 1);
      if (kouIndexOf(next) !== k) return d;
      d = next;
    }
    return d;
  }

  // 社日：春分・秋分にいちばん近い 戊（つちのえ）の日
  function shanichi(eq) {
    const jdn = Math.round(Date.UTC(eq.getFullYear(), eq.getMonth(), eq.getDate()) / DAY + 2440587.5);
    const stem = (jdn + 9) % 10; // 0=甲 … 4=戊
    let diff = (4 - stem + 10) % 10; // 次の戊まで
    if (diff > 5) diff -= 10;
    else if (diff === 5) diff = -5; // ちょうど真ん中（癸の日）なら前の戊
    return addDays(eq, diff);
  }

  // その日の雑節（なければ空の配列）
  const zCache = {};
  function zassetsuOfYear(y) {
    if (zCache[y]) return zCache[y];
    const list = [];
    const risshun = dateOfLongitude(y, 315);
    const shunbun = dateOfLongitude(y, 0);
    const shubun = dateOfLongitude(y, 180);
    list.push([addDays(risshun, -1), '節分']);
    [shunbun, shubun].forEach((eq) => {
      const s = eq === shunbun ? '春' : '秋';
      list.push([addDays(eq, -3), '彼岸入り', s]);
      list.push([eq, '彼岸の中日', s]);
      list.push([addDays(eq, 3), '彼岸明け', s]);
      list.push([shanichi(eq), '社日', s]);
    });
    list.push([addDays(risshun, 87), '八十八夜']);
    list.push([dateOfLongitude(y, 80), '入梅']);
    list.push([dateOfLongitude(y, 100), '半夏生']);
    Object.keys(DOYO).forEach((lon) => list.push([dateOfLongitude(y, +lon), '土用入り', DOYO[lon]]));
    list.push([addDays(risshun, 209), '二百十日']);
    list.push([addDays(risshun, 219), '二百二十日']);
    return (zCache[y] = list.filter((x) => x[0]));
  }
  function zassetsu(date) {
    return zassetsuOfYear(date.getFullYear()).filter((x) => sameDay(x[0], date))
      .map((x) => ({ name: x[1], season: x[2] || null, yomi: ZASSETSU[x[1]][0], mean: ZASSETSU[x[1]][1] }));
  }

  // その日の歳時記をまとめて返す
  function saijiki(date) {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const k = kouIndexOf(day);
    const s = Math.floor(k / 3);
    const kStart = startOfKou(day, k), kEnd = endOfKou(day, k);
    // 節気の最初の日と最後の日
    let a = kStart; while (Math.floor(kouIndexOf(addDays(a, -1)) / 3) === s) a = addDays(a, -1);
    let b = kEnd; while (Math.floor(kouIndexOf(addDays(b, 1)) / 3) === s) b = addDays(b, 1);
    return {
      sekki: { index: s, name: SEKKI[s][0], yomi: SEKKI[s][1], mean: SEKKI[s][2], start: a, end: b },
      kou: { index: k, name: KOU[k][0], yomi: KOU[k][1], mean: KOU[k][2], start: kStart, end: kEnd, part: ['初候', '次候', '末候'][k % 3] },
      sekkiFirst: sameDay(a, day),
      kouFirst: sameDay(kStart, day),
      zassetsu: zassetsu(day),
    };
  }

  // 節分は立春の前の日（年によって2月2日のことも）
  const baseEvent = window.JpCalendar.event;
  window.JpCalendar.event = function (date) {
    const e = baseEvent.call(this, date);
    if (e) return e;
    return zassetsu(date).some((z) => z.name === '節分') ? '節分' : null;
  };
  window.JpCalendar.sunLongitude = sunLongitude;
  window.JpCalendar.dateOfLongitude = dateOfLongitude;
  window.JpCalendar.crosses = crosses;
  window.JpCalendar.zassetsu = zassetsu;
  window.JpCalendar.saijiki = saijiki;
  window.JpCalendar.SEKKI = SEKKI;
  window.JpCalendar.KOU = KOU;
})();
