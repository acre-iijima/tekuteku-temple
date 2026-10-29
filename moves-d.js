// 派手な動き 第5弾（moves-d）。window.MoreMoves に足していく
// 豪華でシュール（画面ぜんたい）30種。おまけの絵のクラスは mvx-d- ではじめる（ほかとぶつからないように）
// CSS は moves-d.css。キーフレームの名前は kfd- ではじめる
window.MoreMoves = window.MoreMoves || [];
(function () {
  'use strict';
  const MM = window.MoreMoves;
  const INK = '#2b2b2b';
  const POP = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#ffa95e', '#c9a7ff', '#ff6b6b', '#ffffff'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const S = (v) => (v / 1000).toFixed(2) + 's';
  const r0 = (v) => Math.round(v);
  const byId = (id) => document.getElementById(id);
  const poseSvg = (n) => ((window.Poses && (window.Poses[n] || window.Poses.sit)) || { svg: '' }).svg;
  // 今のてんぷる（動きのポーズ）を絵として写す
  const catNow = (cls = '') => `<svg class="cat mvx-cat ${cls}" viewBox="0 0 240 200">${byId('catPose') ? byId('catPose').innerHTML : poseSvg('sit')}</svg>`;
  const mini = (pose = 'sit', tint = '', cls = '') => `<svg class="cat mvx-cat ${cls}" viewBox="0 0 240 200"${tint ? ` style="--tint:${tint}"` : ''}>${poseSvg(pose)}</svg>`;
  // CSS の値を、動きのあいだだけ入れる
  function vars(el, o, ms) {
    if (!el) return;
    Object.keys(o).forEach((k) => el.style.setProperty(k, o[k]));
    setTimeout(() => Object.keys(o).forEach((k) => el.style.removeProperty(k)), ms + 40);
  }
  const catVars = (o, ms) => vars(byId('catBtn'), o, ms);
  // a ミリ秒から b ミリ秒まで動かす
  const span = (a, b) => `animation-delay:${S(a)};animation-duration:${S(Math.max(60, b - a))}`;
  const sv = (vb, inner, par = '') => `<svg viewBox="${vb}"${par ? ` preserveAspectRatio="${par}"` : ''}>${inner}</svg>`;
  const P = (d, fill = 'none', sw = 3.5, ex = '') => `<path d="${d}" fill="${fill}"${/(^|\s)stroke="/.test(ex) ? '' : ` stroke="${INK}"`} stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${ex}/>`;
  const C = (x, y, r, fill, sw = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
  const E = (x, y, rx, ry, fill, sw = 3) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
  const R = (x, y, w, h, fill, rx = 4, sw = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
  // ステージいっぱいの景色（ステージの中、ねこのうしろ）
  const full = (K, cls, html = '', style = '') => K.add('mvx-d-full ' + cls, html, style);
  const scene = (inner) => sv('0 0 360 280', inner, 'xMidYMax slice');
  // 画面ぜんたいに出す文字（いちばん上）
  const fword = (K, text, x, y, delay, color = '#ffd94a', size = 30, rot = -8) => K.fixed('mvx-word mvx-d-top', text, `left:${r0(x)}px;top:${r0(y)}px;color:${color};font-size:${size}px;--r:${rot}deg;animation-delay:${S(delay)}`);
  const VW = () => window.innerWidth, VH = () => window.innerHeight;
  const def = (name, pose, ms, fn) => MM.push({ name, pose, ms, extras: fn ? (K) => fn(K, K.G, ms) : null });

  // ---------------- 1. テレビショッピング ----------------
  const BADGE = (t) => { let d = ''; for (let i = 0; i < 32; i++) { const a = (Math.PI * i) / 16, r = i % 2 ? 34 : 46; d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(1) + ' ' + (50 + Math.sin(a) * r).toFixed(1); } return sv('0 0 100 100', `${P(d + 'Z', '#ff6b6b', 3.5)}<circle cx="50" cy="50" r="28" fill="#ffd94a" stroke="${INK}" stroke-width="3"/><text x="50" y="58" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}">${t}</text>`); };
  def('tvshopping', 'pawshow', 4200, (K, G, ms) => {
    K.back('#ffe0ec', 0.7);
    full(K, 'mvx-d-tvbg', '<i></i>');
    K.fixed('mvx-d-tvframe', '<b>● LIVE</b><u>CH 2</u>', `left:${r0(G.px - 10)}px;top:${r0(G.py - 10)}px;width:${r0(G.sw + 20)}px;height:${r0(G.sh + 20)}px`);
    K.add('mvx-d-tvtwin', catNow(), `left:${r0(G.x + G.w * 0.3)}px;top:${r0(G.y)}px;width:${r0(G.w)}px;${span(ms * 0.4, ms)}`);
    K.add('mvx-d-tvshop', 'てんぷるショップ', `left:10px;top:${r0(G.bb + 8)}px;${span(ms * 0.05, ms)}`);
    K.add('mvx-d-badge', BADGE('0円'), `left:${r0(G.sw - 92)}px;top:${r0(G.bb + 4)}px;${span(ms * 0.52, ms)}`);
    K.add('mvx-d-telop', '<b>今なら</b><em>2匹</em><s>おまとめ</s>', `top:${r0(G.sh - 56)}px;${span(ms * 0.36, ms)}`);
    K.fixed('mvx-d-callnow', '☎ いますぐお電話!', `left:${r0(G.px + G.sw / 2)}px;top:${r0(G.py + G.sh + 22)}px;${span(ms * 0.56, ms)}`);
    K.burst(G.x + G.w * 0.8, G.y + G.h * 0.45, ms * 0.4, 16, 100);
    K.flash(ms * 0.4, '#fff6c2', 260, false);
    K.word('なんと!', 14, G.bb + 44, ms * 0.18, '#ff6b6b', 28, -8);
    K.word('もう1匹!!', G.sw - 150, G.bb + 70, ms * 0.44, '#ffd94a', 28, 8);
    K.stars(16, ms * 0.8, [4, 96, 20, 90]);
  });

  // ---------------- 2. 号外 ----------------
  const SHEET = (r) => sv('0 0 60 76', `<g transform="rotate(${r} 30 38)">${R(4, 4, 52, 68, '#fbf7ec', 2, 3)}<rect x="10" y="10" width="20" height="12" fill="#ff6b6b" stroke="${INK}" stroke-width="2"/><path d="M34 12 H50 M34 18 H50 M10 30 H50 M10 36 H50 M10 42 H44 M10 50 H50 M10 56 H40 M10 62 H48" stroke="#7a7a7a" stroke-width="2.5" stroke-linecap="round"/></g>`);
  def('newsflash', 'yawn', 4200, (K, G, ms) => {
    K.back('#efe6d2', 0.75);
    K.rain(22, () => SHEET(r0(rnd(-20, 20))), { parent: document.body, cls: 'mvx-fixed mvx-d-sheet', delayMax: ms * 0.62, delay0: ms * 0.04, dur: [1600, 2500], size: [34, 66] });
    for (let i = 0; i < 8; i++) K.fixed('mvx-d-sheetfly', SHEET(0), `top:${r0(rnd(0.05, 0.9) * VH())}px;width:${r0(rnd(70, 120))}px;--fx:${r0(VW() + 260)}px;--fr:${r0(rnd(-720, 720))}deg;animation-delay:${S(rnd(ms * 0.1, ms * 0.7))}`);
    const pw = Math.min(G.sw * 0.84, 300), ph = Math.min(G.sh - G.bb - 6, pw * 1.05);
    K.add('mvx-d-front', `<div class="mvx-d-fhead"><b>てんぷる新聞</b><s>号外</s></div><div class="mvx-d-fbody"><h3>てんぷる、あくび</h3><figure>${catNow()}</figure><p></p></div>`, `left:${r0(G.sw / 2 - pw / 2)}px;top:${r0(G.bb + 4)}px;width:${r0(pw)}px;height:${r0(ph)}px;${span(ms * 0.2, ms * 0.9)}`);
    K.add('mvx-d-bell', sv('0 0 60 70', `${P('M30 6 V16', 'none', 4)}${P('M12 54 Q12 18 30 16 Q48 18 48 54 Z', '#ffd94a')}${P('M6 54 H54', 'none', 4)}${C(30, 60, 6, '#d79a62')}`), `left:12px;top:${r0(G.sh - 100)}px`);
    K.word('号外!号外!', 10, G.bb + 10, ms * 0.04, '#ff6b6b', 28, -8);
    K.word('バサァ', G.sw - 110, G.sh * 0.62, ms * 0.24, '#fff', 26, 8);
    K.flash(ms * 0.32, '#fff', 240, false);
  });
  // ---------------- 3. 授賞式 ----------------
  const TROPHY = sv('0 0 120 170', `${P('M30 22 Q-6 22 6 54 Q14 72 36 70', 'none', 7)}${P('M90 22 Q126 22 114 54 Q106 72 84 70', 'none', 7)}${P('M26 10 H94 Q96 70 60 92 Q24 70 26 10 Z', '#ffd94a', 4)}${P('M22 4 L38 -14 L46 6 Z M98 4 L82 -14 L74 6 Z', '#ffd94a', 3.5)}${P('M50 92 H70 V118 H50 Z', '#f5b800', 3.5)}${R(30, 118, 60, 16, '#ffd94a', 4, 3.5)}${R(20, 134, 80, 30, '#c9a7ff', 5, 3.5)}<text x="60" y="155" text-anchor="middle" font-size="13" font-weight="900" fill="${INK}">No.1</text>${P('M40 24 Q42 52 56 66', 'none', 4, ' stroke="#fff" opacity=".8"')}`);
  def('awards', 'tere', 4400, (K, G, ms) => {
    K.back('#2a1a3a', 0.88);
    full(K, 'mvx-d-awbg', scene(`<rect width="360" height="280" fill="#3a2350"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<circle cx="${20 + i * 40}" cy="${30 + (i % 2) * 16}" r="3" fill="#ffd94a"/>`).join('')}${P('M-10 -10 H90 Q70 60 80 140 Q60 220 70 300 H-10 Z', '#d6334a', 4)}${P('M370 -10 H270 Q290 60 280 140 Q300 220 290 300 H370 Z', '#d6334a', 4)}${P('M20 0 Q30 140 14 290 M50 0 Q56 140 44 290 M340 0 Q330 140 346 290 M310 0 Q304 140 316 290', 'none', 2.5, ' opacity=".6"')}${P('M150 290 L170 205 H190 L210 290 Z', '#ff4f6a', 3.5)}${P('M60 290 Q180 240 300 290', 'none', 3)}`));
    K.add('mvx-d-spot mvx-d-spotl', '', `left:${r0(G.sw * 0.12)}px`);
    K.add('mvx-d-spot mvx-d-spotr', '', `left:${r0(G.sw * 0.88)}px`);
    const tw = Math.min(110, G.sw * 0.3);
    K.add('mvx-d-trophy', `<i></i>${TROPHY}`, `left:${r0(G.sw - tw - 6)}px;top:${r0(G.sh - tw * 1.42 - 6)}px;width:${r0(tw)}px;${span(ms * 0.3, ms)}`);
    K.add('mvx-d-ribbon', '<b>最優秀なでられ賞</b>', `top:${r0(G.bb + 6)}px;${span(ms * 0.22, ms)}`);
    for (let i = 0; i < 14; i++) K.fixed('mvx-d-camflash', '', `left:${r0(rnd(0.02, 0.98) * VW())}px;top:${r0(rnd(0.45, 0.98) * VH())}px;animation-delay:${S(rnd(ms * 0.2, ms * 0.82))}`);
    K.rain(30, (i) => `<i class="mvx-d-conf" style="background:${pick(['#ffd94a', '#fff6c2', '#ff9fbb', '#f5b800'])}"></i>`, { parent: document.body, cls: 'mvx-fixed', delay0: ms * 0.3, delayMax: ms * 0.45, dur: [1300, 2000], size: [8, 16] });
    K.word('パチパチ', 10, G.sh * 0.5, ms * 0.32, '#ffd94a', 24, -8);
    K.stars(10, ms * 0.7, [5, 95, 30, 90]);
  });

  // ---------------- 4. 卒業式 ----------------
  const CAP = sv('0 0 80 60', `${P('M18 26 V44 Q40 54 62 44 V26', '#3a3a48', 3.5)}${P('M40 4 L78 18 L40 32 L2 18 Z', '#2b2b2b', 3)}${P('M40 18 L64 24 V40', 'none', 3, ' stroke="#ffd94a"')}${C(64, 42, 4, '#ffd94a', 2)}`);
  def('graduation', 'banzai', 4000, (K, G, ms) => {
    K.back('#bfe6ff', 0.6);
    const tree = (x) => `${P(`M${x} 290 Q${x + 4} 230 ${x - 2} 190`, 'none', 7, ' stroke="#8a5a3a"')}${[[-26, -10, 30], [10, -24, 32], [24, 6, 28], [-10, 14, 26], [-30, 20, 22]].map(([dx, dy, r]) => C(x + dx, 180 + dy, r, '#ffc4d6', 3)).join('')}`;
    full(K, 'mvx-d-grbg', scene(`<rect width="360" height="280" fill="#cdeeff"/>${R(90, 120, 180, 170, '#fff6e0', 3, 3.5)}${P('M80 124 L180 80 L280 124 Z', '#ff9f7a', 3.5)}${C(180, 108, 12, '#fff', 3)}${P('M180 101 V108 L186 112', 'none', 2.5)}${[0, 1, 2, 3].map((i) => R(104 + i * 40, 140, 26, 22, '#bfe6ff', 2, 2.5)).join('')}${[0, 1, 2, 3].map((i) => R(104 + i * 40, 180, 26, 22, '#bfe6ff', 2, 2.5)).join('')}${tree(40)}${tree(322)}<rect y="262" width="360" height="30" fill="#bfe7a8" stroke="${INK}" stroke-width="3"/>`));
    K.add('mvx-d-kanban', '<b>卒業式</b>', `left:8px;top:${r0(Math.max(G.bb + 4, G.sh - 150))}px;${span(ms * 0.06, ms)}`);
    K.inBtn('mvx-d-mycap', CAP, '');
    for (let i = 0; i < 20; i++) K.fixed('mvx-d-capthrow', CAP, `left:${r0(rnd(-0.05, 0.92) * VW())}px;width:${r0(rnd(40, 70))}px;--ch:${r0(-rnd(0.5, 0.95) * VH())}px;--cr:${r0(rnd(-900, 900))}deg;animation-delay:${S(ms * 0.3 + rnd(0, ms * 0.2))};animation-duration:${S(rnd(1700, 2300))}`);
    K.add('mvx-d-diploma', `<i></i><b>卒業証書</b><em>てんぷる殿</em><i></i>`, `left:${r0(G.sw / 2)}px;top:${r0(G.bb + 10)}px;${span(ms * 0.62, ms)}`);
    K.rain(22, '<i class="mvx-d-petal"></i>', { parent: document.body, cls: 'mvx-fixed mvx-d-flut', delayMax: ms * 0.7, dur: [1800, 2600], size: [10, 18] });
    K.word('それっ!', G.cx + 30, G.bb + 40, ms * 0.3, '#ffd94a', 30, 8);
    K.stars(10, ms * 0.8);
  });

  // ---------------- 5. 結婚式 ----------------
  const KATSUO = sv('0 0 90 170', `${P('M45 8 Q78 14 80 70 Q82 140 50 164 Q14 160 10 90 Q8 24 45 8 Z', '#b9784a', 4)}${P('M30 30 Q24 90 36 150 M48 22 Q44 90 52 158 M64 32 Q66 90 64 146', 'none', 2.5, ' opacity=".55"')}${P('M24 60 Q34 52 42 62 M50 62 Q58 52 68 60', 'none', 3)}${P('M30 84 L45 92 L30 100 Z M60 84 L45 92 L60 100 Z', '#2b2b2b', 2.5)}${C(45, 92, 4, '#2b2b2b', 2)}${P('M22 -2 H68 V8 H22 Z', '#2b2b2b', 3)}${P('M30 -26 H60 V-2 H30 Z', '#2b2b2b', 3)}${P('M30 -8 H60', 'none', 3, ' stroke="#ff6b6b"')}`);
  const VEIL = sv('0 0 120 120', `${P('M30 20 Q60 0 90 20 Q118 70 108 118 Q60 100 12 118 Q2 70 30 20 Z', 'rgba(255,255,255,.72)', 3)}${[30, 50, 70, 90].map((x) => C(x, 16 + Math.abs(60 - x) / 6, 5, '#ffc4d6', 2.5)).join('')}`);
  def('wedding', 'heart', 4600, (K, G, ms) => {
    K.back('#fff0f6', 0.78);
    const glass = (() => { let s = ''; const cols = ['#ff9fbb', '#8fd0ff', '#ffd94a', '#8fe8c8', '#c9a7ff', '#ffa95e']; for (let i = 0; i < 12; i++) { const a0 = (Math.PI * 2 * i) / 12, a1 = (Math.PI * 2 * (i + 1)) / 12; s += P(`M180 92 L${(180 + Math.cos(a0) * 62).toFixed(1)} ${(92 + Math.sin(a0) * 62).toFixed(1)} A62 62 0 0 1 ${(180 + Math.cos(a1) * 62).toFixed(1)} ${(92 + Math.sin(a1) * 62).toFixed(1)} Z`, cols[i % 6], 2.5); } return s + C(180, 92, 18, '#fff6c2', 3) + C(180, 92, 64, 'none', 4); })();
    full(K, 'mvx-d-wdbg', scene(`<rect width="360" height="280" fill="#fff7f2"/>${P('M90 290 V100 Q90 10 180 10 Q270 10 270 100 V290', '#ffeaf2', 4)}<g class="mvx-d-rose">${glass}</g>${[30, 330].map((x) => `${R(x - 16, 60, 32, 230, '#fff', 2, 3.5)}${P(`M${x - 20} 60 H${x + 20} M${x - 20} 268 H${x + 20}`, 'none', 4)}`).join('')}${P('M120 290 L160 190 H200 L240 290 Z', '#ffc4d6', 3)}`));
    const arch = []; for (let i = 0; i <= 14; i++) { const a = Math.PI - (Math.PI * i) / 14; arch.push(C((180 + Math.cos(a) * 150).toFixed(1), (250 - Math.sin(a) * 175).toFixed(1), 13, ['#ff9fbb', '#fff', '#ffd94a', '#c9a7ff'][i % 4], 3)); }
    K.add('mvx-d-arch', sv('0 0 360 280', P('M30 280 Q30 70 180 70 Q330 70 330 280', 'none', 5, ' stroke="#8fe8c8"') + arch.join(''), 'xMidYMax meet'), `${span(ms * 0.12, ms)}`);
    K.add('mvx-d-wbell', sv('0 0 70 80', `${P('M35 4 V14', 'none', 4)}${P('M12 62 Q10 16 35 14 Q60 16 58 62 Z', '#ffd94a')}${P('M4 62 H66', 'none', 4)}${C(35, 70, 7, '#ffa95e')}${P('M20 30 Q24 20 32 20', 'none', 3, ' stroke="#fff"')}`), `left:${r0(G.sw * 0.08)}px;top:${r0(G.bb + 4)}px`);
    K.add('mvx-d-wbell mvx-d-wbell2', sv('0 0 70 80', `${P('M35 4 V14', 'none', 4)}${P('M12 62 Q10 16 35 14 Q60 16 58 62 Z', '#ffd94a')}${P('M4 62 H66', 'none', 4)}${C(35, 70, 7, '#ffa95e')}`), `left:${r0(G.sw * 0.92 - 56)}px;top:${r0(G.bb + 4)}px`);
    const kh = G.h * 0.78;
    K.add('mvx-d-katsuo', KATSUO, `left:${r0(G.x + G.w * 0.66)}px;top:${r0(G.y + G.h * 0.92 - kh)}px;height:${r0(kh)}px;width:${r0(kh * 0.53)}px;${span(ms * 0.14, ms)}`);
    K.inBtn('mvx-d-veil', VEIL, '');
    K.rain(34, (i) => `<i class="mvx-d-petal" style="background:${pick(['#ffc4d6', '#fff', '#ff9fbb'])}"></i>`, { parent: document.body, cls: 'mvx-fixed mvx-d-flut', delayMax: ms * 0.75, dur: [1800, 2800], size: [10, 18] });
    for (let i = 0; i < 10; i++) K.add('mvx-d-heartup', '♥', `left:${r0(rnd(0.1, 0.9) * G.sw)}px;top:${r0(G.sh - 20)}px;font-size:${r0(rnd(16, 30))}px;color:${pick(['#ff6b6b', '#ff9fbb'])};animation-delay:${S(rnd(ms * 0.3, ms * 0.8))}`);
    K.word('カラーン', 14, G.bb + 70, ms * 0.08, '#ffd94a', 26, -8);
    K.word('カラーン', G.sw - 130, G.bb + 100, ms * 0.3, '#ffd94a', 24, 8);
    K.word('祝', G.cx - 20, G.bb + 20, ms * 0.55, '#ff6b6b', 40, -4);
  });

  // ---------------- 6. 銭湯 ----------------
  const OKE = sv('0 0 70 48', `${P('M6 10 H64 L56 44 H14 Z', '#ffd94a', 3.5)}${E(35, 10, 29, 6, '#fff6c2', 3)}<text x="35" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#e8413c">ケロリン</text>`);
  const WAVE = (fill, n = 20, amp = 8) => { let d = 'M0 12'; for (let i = 0; i < n; i++) d += ` q10 ${-amp} 20 0 t20 0`; return sv(`0 0 ${n * 40} 24`, `<path d="${d} V24 H0 Z" fill="${fill}"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="3" vector-effect="non-scaling-stroke"/>`, 'none'); };
  def('bathhouse', 'bath', 4400, (K, G, ms) => {
    K.back('#d9f2ff', 0.65);
    let tiles = ''; for (let x = 0; x <= 360; x += 24) tiles += `M${x} 0 V280 `; for (let y = 0; y <= 280; y += 24) tiles += `M0 ${y} H360 `;
    const pine = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M0 60 Q4 30 -2 0', 'none', 5, ' stroke="#8a5a3a"')}${P('M-30 10 Q0 -8 30 10 Q0 2 -30 10 Z M-26 30 Q2 14 28 30 Q0 22 -26 30 Z', '#3f8f5a', 3)}</g>`;
    full(K, 'mvx-d-sentou', scene(`<rect width="360" height="280" fill="#f4fbff"/><path d="${tiles}" stroke="#bcd7e6" stroke-width="2"/><rect x="0" y="0" width="360" height="200" fill="#8fd0ff"/><circle cx="300" cy="44" r="22" fill="#fff6c2" stroke="${INK}" stroke-width="3"/>${P('M-10 200 L140 110 Q180 96 220 110 L370 200 Z', '#4f7fd6', 4)}${P('M140 110 Q180 96 220 110 L238 122 L216 136 L198 124 L180 140 L162 124 L144 136 L122 122 Z', '#fff', 3.5)}${P('M-10 200 L60 140 L120 200 Z', '#3f6fb8', 3.5)}<rect x="0" y="176" width="360" height="24" fill="#2f6fbf"/>${P('M0 184 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0', 'none', 3, ' stroke="#fff"')}${P('M262 150 L262 178 M248 172 H290 L280 182 H254 Z M262 152 L286 170 H262', '#fff', 2.5)}${pine(30, 120, 1.1)}${pine(330, 128, 1)}${P('M0 200 H360', 'none', 4)}`));
    const top = G.y + G.h * 0.86;
    K.add('mvx-d-tub', `<div class="mvx-d-twave">${WAVE('#9fe3f5')}</div><div class="mvx-d-tubrim"></div>`, `top:${r0(top)}px`);
    K.add('mvx-d-duck', sv('0 0 50 40', `${P('M6 24 Q6 38 26 38 Q46 38 46 24 Q46 18 38 20 Q40 4 28 4 Q16 4 18 18 Q6 14 6 24 Z', '#ffd94a', 3)}${P('M17 12 L6 14 L16 18', '#ffa95e', 2.5)}<circle cx="24" cy="11" r="2.4" fill="${INK}"/>`), `left:${r0(G.sw * 0.12)}px;top:${r0(top - 26)}px`);
    K.add('mvx-d-oke', OKE, `left:${r0(Math.min(G.x + G.w * 0.8, G.sw - 76))}px;top:${r0(top - 40)}px;${span(ms * 0.2, ms)}`);
    K.add('mvx-d-oke mvx-d-oke2', OKE, `left:${r0(G.sw * 0.04)}px;top:${r0(G.sh - 50)}px;${span(ms * 0.55, ms)}`);
    for (let i = 0; i < 24; i++) { const s = rnd(110, 230); K.fixed('mvx-d-steam', '', `left:${r0(rnd(-0.15, 0.9) * VW())}px;top:${r0(rnd(0.05, 1) * VH())}px;width:${r0(s)}px;height:${r0(s * 0.8)}px;animation-delay:${S(ms * 0.1 + rnd(0, ms * 0.5))}`); }
    K.word('カポーン', 12, G.bb + 16, ms * 0.22, '#fff', 26, -6);
    K.word('カポーン…', G.sw - 140, G.bb + 50, ms * 0.6, '#8fd0ff', 22, 6);
  });

  // ---------------- 7. 工場のベルトコンベア ----------------
  const GEAR = (fill) => { let d = ''; for (let i = 0; i < 24; i++) { const a = (Math.PI * 2 * i) / 24, r = i % 2 ? 40 : 48; d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(1) + ' ' + (50 + Math.sin(a) * r).toFixed(1); } return sv('0 0 100 100', P(d + 'Z', fill, 3.5) + C(50, 50, 14, '#e8ecf2', 3.5)); };
  def('conveyor', 'loaf', 4400, (K, G, ms) => {
    K.back('#d6dbe4', 0.78);
    full(K, 'mvx-d-factory', scene(`<rect width="360" height="280" fill="#c6ccd8"/>${P('M0 30 H360 M0 34 H360', 'none', 3)}${R(-10, 0, 380, 16, '#ffd94a', 0, 3)}${[...Array(20)].map((_, i) => P(`M${i * 20 - 10} 16 L${i * 20 + 6} 0`, 'none', 6, ' stroke="#2b2b2b"')).join('')}${P('M300 40 V140 Q300 150 290 150 H250', 'none', 10, ' stroke="#9aa4b6"')}${P('M300 40 V140 Q300 150 290 150 H250', 'none', 2.5)}${[60, 160, 260].map((x) => `${R(x, 50, 40, 30, '#e8ecf2', 3, 3)}<circle class="mvx-d-lamp" cx="${x + 20}" cy="65" r="7" fill="#ff6b6b" stroke="${INK}" stroke-width="2.5"/>`).join('')}`));
    K.add('mvx-d-gear', GEAR('#9aa4b6'), `left:${r0(G.sw * 0.04)}px;top:${r0(G.bb + 6)}px;width:70px`);
    K.add('mvx-d-gear mvx-d-gear2', GEAR('#ffd94a'), `left:${r0(G.sw * 0.04 + 54)}px;top:${r0(G.bb + 42)}px;width:50px`);
    K.add('mvx-d-gear', GEAR('#8fe8c8'), `left:${r0(G.sw - 90)}px;top:${r0(G.bb + 10)}px;width:80px`);
    const by = G.y + G.h * 0.94, uy = Math.max(G.bb + 70, G.sh * 0.42);
    const lane = (y, n, cls, sz) => { let h = ''; for (let i = 0; i < n * 2; i++) h += `<div class="mvx-d-unit" style="width:${r0(sz)}px">${mini(pick(['loaf', 'sit', 'blink', 'loaf', 'stareloaf']))}</div>`; return K.add('mvx-d-lane ' + cls, `<div class="mvx-d-lanein">${h}</div><div class="mvx-d-belt"></div>`, `top:${r0(y - sz * 0.82)}px;--sz:${r0(sz)}px`); };
    lane(uy, 6, 'mvx-d-laneu', 58);
    lane(by, 6, 'mvx-d-laneb', 70);
    K.add('mvx-d-machine', `<div class="mvx-d-mbody"><b>てんぷる<br>製造機</b><i></i></div><div class="mvx-d-piston"></div>`, `top:${r0(uy - 100)}px`);
    K.add('mvx-d-stamp', '<b>検品<br>OK</b>', `left:${r0(G.x + G.w * 0.62)}px;top:${r0(G.y + G.h * 0.3)}px;${span(ms * 0.62, ms)}`);
    let W = VW(), row = ''; for (let i = 0; i < 16; i++) row += `<div class="mvx-d-unit">${mini(pick(['loaf', 'sit', 'stareloaf']), pick(['#fffdf8', '#fff6c2', '#ffe0ec', '#e0f4ff']))}</div>`;
    K.fixed('mvx-d-pagebelt', `<div class="mvx-d-lanein">${row}${row}</div><div class="mvx-d-belt"></div>`, `--pw:${W}px`);
    K.word('ガシャン', G.sw * 0.04, uy - 120, ms * 0.12, '#ffd94a', 24, -8);
    K.word('ガシャン', G.sw * 0.04, uy - 120, ms * 0.48, '#ffa95e', 24, 6);
    K.word('量産中', G.sw - 110, G.bb + 96, ms * 0.3, '#8fe8c8', 26, 8);
  });

  // ---------------- 8. 自動販売機 ----------------
  def('vending', 'stare', 3800, (K, G, ms) => {
    K.back('#ffe0e0', 0.55);
    const mw = Math.min(G.sw * 0.86, 320), ml = G.sw / 2 - mw / 2, mt = Math.max(4, G.bb - 30), mh = G.sh - mt + 4;
    let slots = ''; const cols = ['#8fd0ff', '#ff9fbb', '#ffd94a', '#8fe8c8'];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) slots += `<div class="mvx-d-slot"><div class="mvx-d-can" style="background:${cols[(r + c) % 4]}">${mini(pick(['sit', 'loaf', 'blink', 'stare', 'wink']))}</div><span>${pick(['100', '120', '130', '150'])}</span><i class="${r === 1 && c === 2 ? 'mvx-d-hit' : ''}"></i></div>`;
    K.add('mvx-d-vend', `<div class="mvx-d-vtop">つめた〜い</div><div class="mvx-d-vwin">${slots}</div><div class="mvx-d-vpanel"><i></i><i></i><b>¥</b></div><div class="mvx-d-vout"><span>とりだし口</span></div>`, `left:${r0(ml)}px;top:${r0(mt)}px;width:${r0(mw)}px;height:${r0(mh)}px`);
    K.add('mvx-d-flap', '', `left:${r0(ml + mw * 0.12)}px;width:${r0(mw * 0.76)}px;top:${r0(G.sh - 62)}px`);
    K.fixed('mvx-d-coin', sv('0 0 40 40', C(20, 20, 16, '#ffd94a', 3) + '<text x="20" y="26" text-anchor="middle" font-size="16" font-weight="900" fill="#2b2b2b">¥</text>'), `left:${r0(G.px + ml + mw * 0.86)}px;top:${r0(G.py + mt + mh * 0.35)}px`);
    catVars({ '--vy': r0((G.sh - 30) - (G.y + G.h * 0.85)) + 'px' }, ms);
    K.word('チャリン', G.sw - 120, G.bb + 30, ms * 0.12, '#ffd94a', 24, 8);
    K.word('ピッ', G.sw * 0.6, G.sh * 0.4, ms * 0.3, '#8fd0ff', 24, -6);
    K.word('ガコン!!', 14, G.sh * 0.5, ms * 0.42, '#ff6b6b', 34, -8);
    K.burst(G.cx, G.sh - 40, ms * 0.66, 16, 100);
    K.word('あたり!', G.sw - 120, G.bb + 60, ms * 0.68, '#ff9fbb', 26, 8);
  });

  // ---------------- 9. エレベーター ----------------
  def('elevator', 'upright', 4200, (K, G, ms) => {
    K.back('#d8d4cc', 0.6);
    full(K, 'mvx-d-elin', scene(`<rect width="360" height="280" fill="#efe6d4"/>${[40, 100, 160, 220, 280, 340].map((x) => P(`M${x} 0 V280`, 'none', 2.5, ' opacity=".5"')).join('')}${P('M0 196 H360', 'none', 7, ' stroke="#c9a76a"')}${P('M0 196 H360', 'none', 2.5)}<rect y="250" width="360" height="40" fill="#9a8a72" stroke="${INK}" stroke-width="3"/>`));
    const isl = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M-40 0 Q0 -14 40 0 Q20 40 0 50 Q-20 40 -40 0 Z', '#b9784a', 3)}${P('M-40 0 Q0 -14 40 0 Q0 8 -40 0 Z', '#8fe8a8', 3)}</g>`;
    full(K, 'mvx-d-elout', scene(`<defs><linearGradient id="mvxdElSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a7ff"/><stop offset=".6" stop-color="#ff9fbb"/><stop offset="1" stop-color="#ffd94a"/></linearGradient></defs><rect width="360" height="280" fill="url(#mvxdElSky)"/>${C(270, 70, 44, '#fff6c2', 3.5)}${P('M206 84 Q270 50 334 56', 'none', 6, ' stroke="#ff9fbb"')}${P('M206 84 Q270 50 334 56', 'none', 2.5)}${C(70, 56, 16, '#8fe8c8', 3)}${isl(60, 150, 1)}${isl(300, 170, 0.8)}${isl(170, 110, 0.6)}${P('M20 280 Q20 200 100 200 Q120 170 160 190 Q200 160 240 190 Q290 180 300 210 Q350 210 350 280 Z', '#fff', 3.5)}${P('M90 250 A90 90 0 0 1 270 250', 'none', 8, ' stroke="#8fd0ff" opacity=".8"')}`), `${span(ms * 0.46, ms * 0.86)}`);
    K.add('mvx-d-door mvx-d-doorl', '<i></i>', '');
    K.add('mvx-d-door mvx-d-doorr', '<i></i>', '');
    K.add('mvx-d-floor', '<b>▲</b><div class="mvx-d-num"><span>1</span><span>2</span><span>3</span><span>9</span><span>42</span><span>99</span><span>∞</span></div>', `left:${r0(G.sw - 112)}px;top:${r0(G.bb + 8)}px`);
    for (let i = 0; i < 6; i++) K.add('mvx-d-fcloud', '', `left:${r0(rnd(-0.1, 0.8) * G.sw)}px;top:${r0(rnd(G.bb, G.sh * 0.8))}px;animation-delay:${S(ms * 0.5 + i * 120)}`);
    K.word('ウィーン', 14, G.bb + 50, ms * 0.1, '#cfd6e6', 24, -6);
    K.word('チーン', G.sw - 110, G.bb + 50, ms * 0.44, '#ffd94a', 30, 8);
    K.stars(10, ms * 0.3, [5, 95, 20, 80]);
  });

  // ---------------- 10. 下りエスカレーター ----------------
  def('escalator', 'walk', 4400, (K, G, ms) => {
    K.back('#e8f0ff', 0.6);
    const shop = (x, c, t) => `${R(x, 40, 100, 90, '#fffdf8', 3, 3)}${P(`M${x - 4} 40 H${x + 104} L${x + 96} 62 H${x + 4} Z`, c, 3)}${P(`M${x + 18} 40 L${x + 14} 62 M${x + 38} 40 L${x + 36} 62 M${x + 62} 40 L${x + 64} 62 M${x + 82} 40 L${x + 86} 62`, 'none', 2.5)}<text x="${x + 50}" y="98" text-anchor="middle" font-size="18" font-weight="900" fill="${INK}">${t}</text>`;
    full(K, 'mvx-d-mall', scene(`<rect width="360" height="280" fill="#f2f6ff"/>${P('M0 30 L60 0 M80 30 L140 0 M160 30 L220 0 M240 30 L300 0 M320 30 L380 0', 'none', 2.5, ' opacity=".4"')}${shop(10, '#ff9fbb', 'パン')}${shop(130, '#8fe8c8', 'かつお')}${shop(250, '#ffd94a', 'まくら')}<rect y="200" width="360" height="90" fill="#dfe6f2" stroke="${INK}" stroke-width="3"/>`));
    const fx = G.cx, fy = G.y + G.h * 0.95, yl = (x) => fy - 0.5 * (x - fx);
    const x0 = -240, x1 = G.sw + 240, bot = G.sh + 260;
    let st = `M${x0} ${r0(yl(x0))}`;
    for (let x = x0; x < x1; x += 40) st += ` H${x + 40} V${r0(yl(x + 40))}`;
    const vb = `${x0} -260 ${x1 - x0} ${bot + 260}`, wh = `left:${x0}px;top:-260px;width:${x1 - x0}px;height:${bot + 260}px`;
    K.add('mvx-d-escglass', sv(vb, `${P(`M${x0} ${r0(yl(x0) - 6)} L${x1} ${r0(yl(x1) - 6)} L${x1} ${r0(yl(x1) - 74)} L${x0} ${r0(yl(x0) - 74)} Z`, 'rgba(191,230,255,.55)', 3)}${P(`M${x0} ${r0(yl(x0) - 78)} L${x1} ${r0(yl(x1) - 78)}`, 'none', 12)}${P(`M${x0} ${r0(yl(x0) - 78)} L${x1} ${r0(yl(x1) - 78)}`, 'none', 5, ' stroke="#4a4f5e"')}`, 'none'), wh);
    K.add('mvx-d-esc', sv(vb, `${P(`${st} V${bot} H${x0} Z`, '#cfd6e6', 3.5)}${P(`M${x0} ${r0(yl(x0) + 40)} L${x1} ${r0(yl(x1) + 40)}`, 'none', 3, ' opacity=".5"')}`, 'none'), wh);
    K.add('mvx-d-escsign', '<b>↓ 下り</b>', `left:${r0(G.sw - 96)}px;top:${r0(G.bb + 8)}px`);
    for (let i = 0; i < 7; i++) K.fixed('mvx-d-arrowdn', '▼', `left:${r0(i % 2 ? rnd(0.82, 0.95) * VW() : rnd(0.01, 0.12) * VW())}px;animation-delay:${S(rnd(0, ms * 0.7))}`);
    for (let i = 0; i < 6; i++) K.add('mvx-d-sweat', '', `left:${r0(G.x + G.w * (0.3 + rnd(0, 0.4)))}px;top:${r0(G.y + G.h * 0.1)}px;--sx:${r0(rnd(-60, 60))}px;animation-delay:${S(ms * 0.3 + i * 300)}`);
    K.word('テクテクテク', 10, G.bb + 20, ms * 0.1, '#8fd0ff', 24, -6);
    K.word('…すすまない', G.sw - 160, G.bb + 70, ms * 0.5, '#fff', 22, 6);
    for (let i = 0; i < 5; i++) K.puffs(G.cx - 20, G.y + G.h * 0.95, 2, ms * 0.1 + i * 600, 30);
  });

  // ---------------- 11. 満員電車 ----------------
  def('traincar', 'komari', 4200, (K, G, ms) => {
    K.back('#e0f0e8', 0.6);
    const sc = Math.max(G.sw / 360, G.sh / 280), oy = G.sh - 280 * sc, wt = oy + 76 * sc, wb = oy + 156 * sc;
    let bld = ''; for (let i = 0; i < 20; i++) { const h = 26 + ((i * 37) % 46); bld += R(i * 44, 80 - h, 36, h + 30, pick(['#ffd94a', '#8fd0ff', '#ff9fbb', '#c9a7ff', '#8fe8c8', '#fff6c2']), 2, 3) + `<rect x="${i * 44 + 8}" y="${86 - h}" width="8" height="8" fill="#fff"/>`; }
    const strip = sv('0 0 880 80', `<rect width="880" height="80" fill="#bfe6ff"/>${bld}`, 'xMinYMax slice');
    K.add('mvx-d-scenery', `<div class="mvx-d-scin">${strip}${strip}</div>`, `top:${r0(wt)}px;height:${r0(wb - wt)}px`);
    const holes = [20, 135, 250].map((x) => `M${x} 76 H${x + 90} V156 H${x} Z`).join(' ');
    full(K, 'mvx-d-trainin', scene(`<path d="M0 0 H360 V280 H0 Z ${holes}" fill="#f3ead2" fill-rule="evenodd"/>${[20, 135, 250].map((x) => R(x, 76, 90, 80, 'none', 6, 4)).join('')}${P('M0 40 H360', 'none', 6, ' stroke="#b8c0cc"')}${P('M0 40 H360', 'none', 2.5)}${R(-10, 214, 380, 30, '#5fae7a', 8, 3.5)}<rect y="244" width="360" height="40" fill="#b8a07a" stroke="${INK}" stroke-width="3"/>${R(140, 4, 80, 30, '#fff', 3, 3)}<text x="180" y="25" text-anchor="middle" font-size="13" font-weight="900" fill="#e8413c">てんぷる線</text>`));
    for (let i = 0; i < 7; i++) K.add('mvx-d-strap', sv('0 0 20 60', `${P('M10 0 V34', 'none', 3)}${C(10, 46, 9, '#fff', 3.5)}`), `left:${r0((i + 0.5) / 7 * G.sw - 9)}px;animation-delay:${S(-i * 90)}`);
    const poses = ['komari', 'stand', 'upright', 'jito', 'sideeye', 'stare', 'tilt'];
    const crowd = (side, i, back) => {
      const w = G.w * (back ? 0.62 : 0.8), x = side < 0 ? -w * 0.45 + i * w * 0.38 : G.sw - w * 0.55 - i * w * 0.38;
      const y = G.y + G.h * (back ? 0.98 : 1.06) - w * 0.833;
      K.add('mvx-d-crowd' + (back ? ' mvx-d-crowdb' : ''), mini(pick(poses), pick(['#fffdf8', '#fff6e8', '#f2f2f2'])), `left:${r0(x)}px;top:${r0(y)}px;width:${r0(w)}px;--cx:${side * (G.sw * 0.7)}px;--cr:${r0(rnd(-8, 8))}deg;animation-delay:${S(rnd(0, 120))}`);
    };
    for (let i = 0; i < 3; i++) { crowd(-1, i, true); crowd(1, i, true); }
    for (let i = 0; i < 2; i++) { crowd(-1, i, false); crowd(1, i, false); }
    let pf = ''; for (let i = 0; i < 14; i++) pf += `<div class="mvx-d-unit" style="--r:${r0(rnd(-8, 8))}deg">${mini(pick(poses), pick(['#fffdf8', '#fff6c2', '#e0f4ff', '#ffe0ec']))}</div>`;
    K.fixed('mvx-d-platform', pf, '');
    K.word('ガタンゴトン', 10, G.bb + 12, ms * 0.04, '#8fe8c8', 22, -6);
    K.word('ぎゅう', 14, G.sh * 0.48, ms * 0.34, '#ff9fbb', 30, -10);
    K.word('ぎゅう', G.sw - 100, G.sh * 0.4, ms * 0.42, '#ff9fbb', 30, 10);
    K.word('プシュー', G.cx - 60, G.bb + 30, ms * 0.8, '#fff', 28, -4);
    K.puffs(G.cx, G.y + G.h, 8, ms * 0.8, 120);
  });

  // ---------------- 12. カラオケ ----------------
  def('karaokebox', 'karaoke', 4400, (K, G, ms) => {
    K.back('#1d1638', 0.9);
    K.dark('#140f2a', 0.88, 0.06, 0.9);
    full(K, 'mvx-d-neon', '<i></i>');
    const sw2 = G.sw * 0.6, sh2 = Math.min(G.sh - G.bb - 40, sw2 * 0.78);
    const lyr = '<div class="mvx-d-klyr"><p data-t="……　……">……　……</p><p data-t="………!!">………!!</p></div>';
    K.add('mvx-d-kscreen', `<div class="mvx-d-kvid">${sv('0 0 200 120', `<rect width="200" height="120" fill="#ffb37a"/>${C(100, 74, 26, '#ffd94a', 3)}<rect y="74" width="200" height="46" fill="#5fb0f0"/>${P('M0 84 q12 -6 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 M0 100 q12 -6 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0', 'none', 3, ' stroke="#fff"')}${P('M150 74 L160 40 L170 74', 'none', 3)}`, 'xMidYMid slice')}</div><div class="mvx-d-ktitle">♪「……」</div>${lyr}<div class="mvx-d-kscore"><span>得点</span><b>100</b></div>`, `left:${r0(G.sw - sw2 - 8)}px;top:${r0(G.bb + 6)}px;width:${r0(sw2)}px;height:${r0(sh2)}px`);
    K.fixed('mvx-d-kbig', lyr, '');
    let dots = ''; for (let i = 0; i < 40; i++) dots += `<i style="left:${rnd(0, 100).toFixed(1)}%;top:${rnd(0, 100).toFixed(1)}%;background:${pick(POP)};animation-delay:-${rnd(0, 2).toFixed(2)}s"></i>`;
    K.fixed('mvx-d-kdots', dots, '');
    K.add('mvx-d-tamb', sv('0 0 60 60', `${C(30, 30, 24, '#ffd94a', 4)}${C(30, 30, 14, '#fff6c2', 3)}${[0, 1, 2, 3, 4].map((i) => { const a = (Math.PI * 2 * i) / 5; return R(30 + Math.cos(a) * 24 - 5, 30 + Math.sin(a) * 24 - 3, 10, 6, '#cfd6e6', 2, 2); }).join('')}`), `left:${r0(G.sw * 0.04)}px;top:${r0(G.sh - 76)}px`);
    for (let i = 0; i < 10; i++) K.add('mvx-d-note', pick(['♪', '♫', '♬']), `left:${r0(rnd(0.05, 0.5) * G.sw)}px;top:${r0(G.sh * 0.7)}px;color:${pick(POP)};animation-delay:${S(rnd(0, ms * 0.8))}`);
    K.burst(G.sw - sw2 / 2 - 8, G.bb + 6 + sh2 / 2, ms * 0.84, 18, 110);
    K.word('イェーイ!', 12, G.bb + 20, ms * 0.84, '#ffd94a', 28, -8);
  });

  // ---------------- 13. 天気図の台風 ----------------
  const JAPAN = `${P('M262 72 Q280 52 304 60 Q326 58 330 76 Q316 92 298 96 Q282 104 270 92 Q256 84 262 72 Z', '#bfe7a8', 3)}${P('M282 108 Q296 128 286 150 Q272 170 248 182 Q224 196 200 204 Q176 214 156 214 Q140 218 132 208 Q142 198 160 196 Q190 186 214 172 Q240 158 258 140 Q268 122 282 108 Z', '#bfe7a8', 3)}${P('M160 222 Q178 216 194 222 Q190 234 172 234 Q160 232 160 222 Z', '#bfe7a8', 3)}${P('M118 214 Q134 214 136 230 Q134 252 118 256 Q104 248 106 230 Q108 218 118 214 Z', '#bfe7a8', 3)}`;
  const PAWT = sv('0 0 160 160', `<g class="mvx-d-arms">${P('M80 80 m0 -60 q60 0 64 50', 'none', 14, ' stroke="#fff"')}${P('M80 80 m60 0 q0 60 -50 64', 'none', 14, ' stroke="#fff"')}${P('M80 80 m0 60 q-60 0 -64 -50', 'none', 14, ' stroke="#fff"')}${P('M80 80 m-60 0 q0 -60 50 -64', 'none', 14, ' stroke="#fff"')}</g>${E(80, 92, 26, 21, '#ffc4d6', 3.5)}${E(52, 62, 10, 12, '#ffc4d6', 3)}${E(70, 50, 10, 12, '#ffc4d6', 3)}${E(92, 50, 10, 12, '#ffc4d6', 3)}${E(110, 62, 10, 12, '#ffc4d6', 3)}`);
  def('weathermap', 'umbrella', 4400, (K, G, ms) => {
    K.back('#bfe0ff', 0.65);
    let grid = ''; for (let x = 0; x <= 360; x += 45) grid += `M${x} 0 V280 `; for (let y = 0; y <= 280; y += 45) grid += `M0 ${y} H360 `;
    full(K, 'mvx-d-wmap', scene(`<rect width="360" height="280" fill="#8fc8f0"/><path d="${grid}" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 5" opacity=".7"/>${[50, 80, 110, 140].map((r) => `<ellipse cx="90" cy="250" rx="${r}" ry="${r * 0.7}" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/>`).join('')}${[40, 70].map((r) => `<ellipse cx="60" cy="90" rx="${r}" ry="${r * 0.8}" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/>`).join('')}${JAPAN}${C(60, 90, 16, '#8fd0ff', 3)}<text x="60" y="96" text-anchor="middle" font-size="16" font-weight="900" fill="#2b5fbf">高</text>${R(8, 10, 60, 24, '#fff', 4, 3)}<text x="38" y="27" text-anchor="middle" font-size="13" font-weight="900" fill="${INK}">天気図</text>`));
    const pw = Math.min(210, G.sw * 0.6);
    K.add('mvx-d-paw', `${PAWT}<b>台風にくきゅう号</b>`, `left:${r0(-pw * 0.2)}px;top:${r0(G.sh - pw * 0.7)}px;width:${r0(pw)}px;--px:${r0(G.sw * 0.62)}px;--py:${r0(G.bb + 10 - (G.sh - pw * 0.7))}px`);
    K.rain(46, '<i class="mvx-d-streak"></i>', { parent: document.body, cls: 'mvx-fixed mvx-d-rainy', delay0: ms * 0.2, delayMax: ms * 0.6, dur: [450, 750], size: [4, 6] });
    for (let i = 0; i < 9; i++) K.fixed('mvx-d-gust', '', `top:${r0(rnd(0.05, 0.95) * VH())}px;animation-delay:${S(ms * 0.25 + rnd(0, ms * 0.55))}`);
    K.rain(10, () => '<span class="mvx-d-leaf"></span>', { delay0: ms * 0.3, delayMax: ms * 0.5, dur: [700, 1100], size: [14, 20], cls: 'mvx-d-blow' });
    K.word('ビュオオオ', G.sw - 150, G.bb + 50, ms * 0.3, '#fff', 26, 8);
    K.word('接近中!', 12, G.sh * 0.55, ms * 0.14, '#ff6b6b', 26, -8);
  });

  // ---------------- 14. 株価チャート ----------------
  def('stockchart', 'doya', 4000, (K, G, ms) => {
    K.back('#0f2a1f', 0.88);
    let grid = ''; for (let x = 0; x <= 360; x += 30) grid += `M${x} 0 V280 `; for (let y = 0; y <= 280; y += 30) grid += `M0 ${y} H360 `;
    let candles = ''; for (let i = 0; i < 14; i++) { const x = 14 + i * 25, h = 10 + ((i * 17) % 26), y = 230 - i * 8 - h; candles += `${P(`M${x + 5} ${y - 8} V${y + h + 8}`, 'none', 2, ' stroke="#9adbb8"')}<rect x="${x}" y="${y}" width="10" height="${h}" fill="${i % 3 ? '#39d98a' : '#ff6b6b'}" stroke="${INK}" stroke-width="2" opacity=".55"/>`; }
    full(K, 'mvx-d-board', scene(`<rect width="360" height="280" fill="#10261c"/><path d="${grid}" stroke="#2f6b4f" stroke-width="1.5"/>${candles}`));
    const line = 'M0 250 L30 238 L50 252 L80 232 L100 246 L130 226 L150 238 L175 216 L195 226 L215 186 L235 198 L255 140 L272 152 L298 66 L314 80 L345 -60';
    K.add('mvx-d-chart', sv('0 0 360 280', `<path d="${line} L345 290 L0 290 Z" fill="#39d98a" opacity=".22" class="mvx-d-carea"/><path class="mvx-d-cl" pathLength="1" d="${line}" fill="none" stroke="${INK}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/><path class="mvx-d-cl" pathLength="1" d="${line}" fill="none" stroke="#5dff9f" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`, 'none'), '');
    K.add('mvx-d-ticker', '<b>てんぷる株</b><em>▲ 9,999,999</em>', `left:8px;top:${r0(G.bb + 6)}px`);
    K.add('mvx-d-tape', `<div>${'てんぷる株 ▲+9999%　／　かつおぶし ▲+12%　／　まくら ▼-3%　／　こたつ ▲+40%　／　'.repeat(4)}</div>`, '');
    K.add('mvx-d-stoph', '<b>ストップ高</b>', `left:${r0(G.sw * 0.5)}px;top:${r0(G.sh * 0.5)}px;${span(ms * 0.62, ms)}`);
    K.fixed('mvx-d-bigup', sv('0 0 100 160', `${P('M50 4 L94 60 H66 V156 H34 V60 H6 Z', '#5dff9f', 5)}`), `left:${r0(G.px + G.sw * 0.82 - 50)}px;top:${r0(G.py + G.sh * 0.3)}px;animation-delay:${S(ms * 0.5)}`);
    const bill = sv('0 0 70 36', `${R(3, 3, 64, 30, '#a8e6b8', 3, 3)}${C(35, 18, 9, '#fff6c2', 2.5)}<text x="35" y="23" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}">¥</text>`);
    const coin = sv('0 0 30 30', `${C(15, 15, 12, '#ffd94a', 3)}<text x="15" y="20" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}">¥</text>`);
    K.rain(30, (i) => (i % 3 ? bill : coin), { parent: document.body, cls: 'mvx-fixed mvx-d-flut', delay0: ms * 0.5, delayMax: ms * 0.35, dur: [1300, 2000], size: [30, 60] });
    K.word('うなぎのぼり', 10, G.sh * 0.6, ms * 0.3, '#5dff9f', 24, -8);
    K.flash(ms * 0.5, '#d7ffe6', 300);
  });

  // ---------------- 15. 宇宙ステーション ----------------
  const ONI = sv('0 0 60 56', `${P('M30 4 Q46 4 54 30 Q58 50 30 50 Q2 50 6 30 Q14 4 30 4 Z', '#fff', 3.5)}${P('M14 34 H46 V50 Q30 52 14 50 Z', '#2b2b2b', 2.5)}`);
  def('spacestation', 'onigiri', 4400, (K, G, ms) => {
    K.back('#0d1030', 0.9);
    let stars = ''; for (let i = 0; i < 26; i++) stars += `<circle cx="${r0(rnd(90, 270))}" cy="${r0(rnd(30, 200))}" r="${rnd(1, 2.6).toFixed(1)}" fill="#fff"/>`;
    const rivets = [...Array(16)].map((_, i) => `<circle cx="${12 + (i % 8) * 48}" cy="${i < 8 ? 18 : 262}" r="3" fill="#8a93a6"/>`).join('');
    full(K, 'mvx-d-iss', scene(`<defs><clipPath id="mvxdPort"><circle cx="180" cy="125" r="100"/></clipPath></defs><rect width="360" height="280" fill="#dfe4ee"/>${P('M0 40 H360 M0 240 H360 M60 0 V280 M300 0 V280', 'none', 2.5, ' opacity=".5"')}${rivets}<g clip-path="url(#mvxdPort)"><rect x="70" y="20" width="220" height="220" fill="#0b1030"/>${stars}<g class="mvx-d-earth">${C(180, 300, 130, '#4f9fe8', 4)}${P('M90 220 Q120 190 160 204 Q180 230 150 250 Z M200 190 Q240 174 270 200 Q260 230 220 226 Z', '#8fe8a8', 3)}</g></g>${C(180, 125, 100, 'none', 10)}${C(180, 125, 100, 'none', 3)}${C(180, 125, 110, 'none', 3)}${[30, 330].map((x) => `${R(x - 18, 60, 36, 120, '#c6ccd8', 6, 3)}<circle class="mvx-d-lamp" cx="${x}" cy="80" r="6" fill="#8fe8c8" stroke="${INK}" stroke-width="2.5"/><circle cx="${x}" cy="104" r="6" fill="#ffd94a" stroke="${INK}" stroke-width="2.5"/>`).join('')}${P('M10 210 H90 M270 210 H350', 'none', 8, ' stroke="#ffd94a"')}${P('M10 210 H90 M270 210 H350', 'none', 2.5)}`));
    const items = [ONI, ONI, sv('0 0 30 20', E(15, 10, 12, 7, '#fff', 3)), sv('0 0 30 20', E(15, 10, 12, 7, '#fff', 3)), sv('0 0 30 20', E(15, 10, 12, 7, '#fff', 3)), sv('0 0 40 40', C(20, 20, 15, '#ffb37a', 3) + P('M12 14 Q16 9 22 10', 'none', 3, ' stroke="#fff"')), sv('0 0 40 40', C(20, 20, 11, '#ffb37a', 3)), sv('0 0 80 16', `${P('M4 4 L76 10 M4 12 L76 14', 'none', 4, ' stroke="#d79a62"')}`), sv('0 0 70 46', `${P('M4 10 H66 Q62 42 35 42 Q8 42 4 10 Z', '#ff9fbb', 3.5)}${E(35, 10, 31, 6, '#fff', 3)}`), sv('0 0 70 34', `${P('M6 17 Q30 0 52 17 Q30 34 6 17 Z', '#8fd0ff', 3)}${P('M52 17 L66 6 V28 Z', '#8fd0ff', 3)}${C(18, 15, 2.5, INK, 1)}`)];
    items.forEach((h, i) => K.add('mvx-d-float', h, `left:${r0(rnd(0.04, 0.82) * G.sw)}px;top:${r0(rnd(G.bb + 4, G.sh - 50))}px;width:${r0(i < 2 ? 46 : i < 5 ? 18 : i < 7 ? 26 : 56)}px;--dx:${r0(rnd(-50, 50))}px;--dy:${r0(rnd(-40, 40))}px;--dr:${r0(rnd(-200, 200))}deg;animation-delay:${S(rnd(0, ms * 0.2))}`));
    for (let i = 0; i < 30; i++) K.fixed('mvx-d-twinkle', '✦', `left:${r0(rnd(0, 1) * VW())}px;top:${r0(rnd(0, 1) * VH())}px;font-size:${r0(rnd(8, 20))}px;animation-delay:${S(rnd(0, ms * 0.7))}`);
    K.word('ふわ〜', 12, G.bb + 20, ms * 0.1, '#8fd0ff', 26, -8);
    K.word('もぐもぐ', G.sw - 130, G.sh * 0.6, ms * 0.5, '#fff', 24, 8);
  });

  // ---------------- 16. 深海 ----------------
  const ANGLER = sv('0 0 220 160', `${P('M110 30 Q100 6 140 8 Q190 10 200 10', 'none', 4, ' stroke="#3a5480"')}${P('M110 30 Q100 6 140 8 Q190 10 200 10', 'none', 1.5, ' stroke="#8fd0ff"')}${P('M60 40 Q120 10 160 60 Q178 90 168 110 Q120 150 60 140 Q0 130 4 90 Q8 50 60 40 Z', '#24375a', 4)}${P('M6 70 L-30 40 L-24 90 L-34 130 L8 104', '#1d2c48', 4)}${P('M168 106 L120 104 Q140 126 162 118', '#0b1426', 3)}${P('M126 104 l6 10 l6 -10 l6 12 l6 -12 l6 10 l6 -10', '#fff', 2.5)}${P('M128 116 l6 -8 l6 8 l6 -9 l6 9 l6 -8', '#fff', 2.5)}${C(140, 64, 12, '#fff6c2', 3)}${C(143, 64, 5, INK, 1)}${P('M70 120 Q88 140 110 128', '#1d2c48', 3)}<circle cx="200" cy="10" r="11" fill="#fff6c2" stroke="${INK}" stroke-width="3"/>`);
  def('deepsea', 'gaze', 4400, (K, G, ms) => {
    K.back('#06122b', 0.94);
    full(K, 'mvx-d-abyss', '');
    for (let i = 0; i < 34; i++) K.add('mvx-d-msnow', '', `left:${r0(rnd(0, G.sw))}px;top:${r0(rnd(-20, G.sh))}px;animation-delay:${S(-rnd(0, 3000))},0s`);
    const lx = G.x + G.w * 0.18, ly = Math.max(G.bb + 30, G.y + G.h * 0.12);
    K.add('mvx-d-holebox', `<i class="mvx-d-hole" style="left:${r0(lx)}px;top:${r0(ly - G.bb)}px"></i>`, `top:${r0(G.bb)}px`);
    const fw = Math.max(200, G.sw * 0.66), sc = fw / 220;
    K.add('mvx-d-angler', `${ANGLER}<i></i>`, `left:${r0(lx - 200 * sc)}px;top:${r0(ly - 10 * sc)}px;width:${r0(fw)}px`);
    for (let i = 0; i < 3; i++) K.add('mvx-d-jelly', sv('0 0 50 70', `${P('M5 30 Q5 4 25 4 Q45 4 45 30 Z', 'rgba(201,167,255,.75)', 3)}${P('M12 32 q-4 16 2 34 M25 32 q4 16 -2 34 M38 32 q-4 16 2 34', 'none', 2.5, ' stroke="#c9a7ff"')}`), `left:${r0(G.sw * (0.62 + i * 0.12))}px;top:${r0(G.sh * (0.3 + i * 0.2))}px;animation-delay:${S(-i * 700)},0s`);
    for (let i = 0; i < 12; i++) K.add('mvx-d-bub', '', `left:${r0(rnd(0.1, 0.9) * G.sw)}px;top:${r0(G.sh)}px;width:${r0(rnd(8, 18))}px;animation-delay:${S(rnd(0, ms * 0.8))}`);
    K.add('mvx-d-depth', '水深 8000m', `left:8px;top:${r0(G.bb + 6)}px`);
    for (let i = 0; i < 24; i++) K.fixed('mvx-d-plank', '', `left:${r0(rnd(0, 1) * VW())}px;top:${r0(rnd(0, 1) * VH())}px;animation-delay:${S(rnd(0, ms * 0.6))}`);
    K.word('ぽわ…', G.sw - 100, G.sh * 0.66, ms * 0.4, '#fff6c2', 24, 6);
  });

  // ---------------- 17. 火山の上で温泉 ----------------
  def('volcanoonsen', 'bath', 4400, (K, G, ms) => {
    K.back('#ffb08a', 0.75);
    full(K, 'mvx-d-volsky', '');
    const yc = r0(G.bb + (G.sh - G.bb) * 0.44), cx = r0(G.cx), vh = G.sh - yc + 24, sw = G.sw;
    catVars({ '--vy': r0(yc + G.h * 0.08 - (G.y + G.h * 0.85)) + 'px' }, ms);
    const box = `left:0;top:${yc - 16}px;width:${sw}px;height:${vh}px`, vb = `0 0 ${sw} ${vh}`;
    K.add('mvx-d-vol mvx-d-volb', sv(vb, `${E(cx, 16, 58, 13, '#9fe3e0', 3.5)}${P(`M${cx - 40} 14 q10 -6 20 0 t20 0 t20 0 t20 0`, 'none', 2.5, ' stroke="#fff"')}`), box);
    const lava = (x0, x1) => `<path class="mvx-d-lava" d="M${x0} 22 Q${(x0 + x1) / 2 - 10} ${vh * 0.5} ${x1} ${vh}" fill="none" stroke="#ff7a3a" stroke-width="12" stroke-linecap="round"/><path d="M${x0} 22 Q${(x0 + x1) / 2 - 10} ${vh * 0.5} ${x1} ${vh}" fill="none" stroke="#ffd94a" stroke-width="4" stroke-linecap="round" class="mvx-d-lava"/>`;
    K.add('mvx-d-vol mvx-d-volf', sv(vb, `${P(`M${cx - 58} 16 A58 13 0 0 0 ${cx + 58} 16 L${sw + 30} ${vh + 4} L-30 ${vh + 4} Z`, '#8a5a4a', 4)}${P(`M${cx - 30} 40 L${cx - 60} 90 M${cx + 34} 44 L${cx + 70} 100 M${cx - 90} 120 L${cx - 120} 160`, 'none', 3, ' opacity=".5"')}${lava(cx - 40, cx - 150)}${lava(cx + 44, cx + 170)}${lava(cx + 10, cx + 40)}<text x="${cx}" y="${Math.min(vh - 10, 70)}" text-anchor="middle" font-size="22" font-weight="900" fill="#fff6c2" stroke="${INK}" stroke-width="1.5">♨</text>`, 'none'), box);
    for (let k = 0; k < 5; k++) K.burst(cx + rnd(-30, 30), yc - 6, ms * (0.3 + k * 0.11), 12, rnd(70, 110), ['#ff7a3a', '#ffd94a', '#ff4f4f', '#5c3a2e'], 11);
    const W = VW();
    for (let i = 0; i < 18; i++) { const s = rnd(70, 150); K.fixed('mvx-d-smoke', '', `left:${r0(G.px + cx + rnd(-60, 60) - s / 2)}px;top:${r0(G.py + yc - s * 0.6)}px;width:${r0(s)}px;height:${r0(s * 0.8)}px;--sx:${r0(rnd(-W * 0.5, W * 0.5))}px;animation-delay:${S(ms * 0.2 + rnd(0, ms * 0.55))}`); }
    for (let i = 0; i < 6; i++) K.add('mvx-d-yuge', '♨', `left:${r0(cx + rnd(-50, 30))}px;top:${r0(yc - 30)}px;animation-delay:${S(ms * 0.3 + i * 380)}`);
    K.word('ドドドド', 10, G.bb + 20, ms * 0.08, '#ff7a3a', 28, -10);
    K.word('悠々', G.sw - 90, G.bb + 60, ms * 0.5, '#fff', 30, 8);
  });

  // ---------------- 18. 砂絵 ----------------
  def('sandart', 'sit', 4400, (K, G, ms) => {
    K.back('#2a1d12', 0.78);
    full(K, 'mvx-d-lightbox', '');
    const paths = [
      'M130 150 Q128 100 150 92 L146 62 L170 86 Q180 84 192 86 L214 62 L212 92 Q234 100 232 150 Q220 176 181 176 Q142 176 130 150 Z',
      'M156 132 q8 -8 16 0 M190 132 q8 -8 16 0', 'M178 146 l3 4 l3 -4 M181 150 q-6 8 -12 4 M181 150 q6 8 12 4',
      'M140 148 L110 142 M140 156 L108 160 M222 148 L252 142 M222 156 L254 160',
      'M142 170 Q116 214 126 266 H236 Q246 214 220 170', 'M164 266 V246 M198 266 V246', 'M236 254 Q292 254 294 212 Q296 184 274 182',
      'M300 50 a24 24 0 1 0 18 40 a18 18 0 1 1 -18 -40 Z', 'M20 272 q20 -10 40 0 t40 0 M262 272 q20 -10 40 0 t40 0',
    ];
    let d = 0; const pp = paths.map((p, i) => { const dur = i === 0 || i === 4 ? 520 : 300; const s = `<path pathLength="1" d="${p}" style="animation-delay:${S(ms * 0.1 + d)};animation-duration:${S(dur)}"/>`; d += dur * 0.85; return s; }).join('');
    K.add('mvx-d-sand', sv('0 0 360 280', `<g transform="translate(0 6)">${pp}</g>`, 'xMidYMax meet'), '');
    for (let i = 0; i < 70; i++) K.add('mvx-d-grain', '', `left:${r0(G.sw * rnd(0.25, 0.85))}px;top:${r0(rnd(G.bb + 10, G.sh - 10))}px;--gx:${r0(rnd(120, 360))}px;--gy:${r0(rnd(-80, 30))}px;animation-delay:${S(ms * 0.68 + rnd(0, 500))}`);
    const W = VW(), H = VH();
    for (let i = 0; i < 50; i++) K.fixed('mvx-d-grain', '', `left:${r0(rnd(-0.1, 0.9) * W)}px;top:${r0(rnd(0, 1) * H)}px;--gx:${r0(rnd(200, 500))}px;--gy:${r0(rnd(-120, 40))}px;animation-delay:${S(ms * 0.7 + rnd(0, 600))}`);
    K.add('mvx-d-trickle', '', `left:${r0(G.sw * 0.3)}px`);
    K.word('サラサラ…', 10, G.bb + 14, ms * 0.14, '#ffcf7a', 24, -6);
    K.word('ヒュウウ', G.sw - 130, G.bb + 40, ms * 0.68, '#fff', 28, 8);
  });

  // ---------------- 19. 影絵 ----------------
  const FOX = `<svg viewBox="0 0 220 200"><g fill="#1e1e26"><path d="M-20 210 Q30 170 70 140 Q90 120 100 100 Q96 80 104 50 L112 6 Q122 0 124 12 L122 62 Q130 66 138 66 L150 20 Q160 12 164 24 L154 74 Q190 78 214 92 Q218 100 206 104 Q170 104 146 110 Q120 140 90 170 Q60 200 30 230 Z"/><g class="mvx-d-jaw"><path d="M146 110 Q176 116 200 120 Q206 128 196 132 Q160 134 132 130 Z"/></g></g><circle cx="150" cy="88" r="4" fill="#fff3d6"/></svg>`;
  const BIRD = `<svg viewBox="0 0 120 60"><g fill="#1e1e26"><path d="M20 34 Q60 24 100 30 Q110 34 100 38 Q60 44 20 38 Z"/><path class="mvx-d-wing" d="M50 32 Q40 0 10 4 Q40 14 70 32 Z"/><path class="mvx-d-wing mvx-d-wing2" d="M60 32 Q80 2 110 2 Q86 16 72 34 Z"/></g></svg>`;
  def('shadowplay', 'stare', 4400, (K, G, ms) => {
    K.back('#1b1b24', 0.9);
    full(K, 'mvx-d-shoji', '<i></i>');
    const fw = Math.min(G.sw * 0.82, 300);
    K.add('mvx-d-fox', FOX, `left:${r0(G.sw / 2 - fw / 2)}px;top:${r0(Math.max(G.bb, G.sh - fw * 0.95))}px;width:${r0(fw)}px`);
    K.add('mvx-d-bird', BIRD, `top:${r0(G.bb + 10)}px;width:110px;--bx:${r0(G.sw + 140)}px;animation-delay:${S(ms * 0.18)}`);
    K.add('mvx-d-lamp2', '', `left:${r0(G.cx)}px;top:${r0(G.sh)}px`);
    K.word('コンコン', G.sw - 130, G.bb + 30, ms * 0.2, '#fff3d6', 26, 8);
    K.word('パッ', 14, G.bb + 40, ms * 0.48, '#ffd94a', 32, -8);
    K.word('…てんぷる!?', G.sw - 160, G.sh * 0.66, ms * 0.56, '#fff3d6', 22, 6);
  });

  // ---------------- 20. 書道 ----------------
  const BRUSH = sv('0 0 60 300', `${R(20, -400, 20, 620, '#d9b26a', 6, 3.5)}${P('M20 0 H40 M20 80 H40 M20 160 H40', 'none', 3)}${R(16, 210, 28, 20, '#8a5a3a', 3, 3.5)}${P('M16 230 Q14 270 30 300 Q46 270 44 230 Z', '#1b1b1b', 3.5)}${P('M24 240 Q24 262 30 282', 'none', 2, ' stroke="#555"')}`);
  def('calligraphy', 'shodo', 4200, (K, G, ms) => {
    K.back('#efe7d4', 0.78);
    full(K, 'mvx-d-washi', '<i></i>');
    const ks = r0(Math.min(G.sw * 0.66, (G.sh - G.bb) * 0.96)), kx = r0(G.sw - ks - 10), ky = r0(G.bb + (G.sh - G.bb - ks) / 2 + 4);
    K.add('mvx-d-kanji', '猫', `left:${kx}px;top:${ky}px;width:${ks}px;height:${ks}px;font-size:${r0(ks * 0.92)}px`);
    K.add('mvx-d-brush', BRUSH, `left:${kx - 25}px;top:${ky - 250}px;--kw:${ks}px;--kh:${ks}px`);
    for (let i = 0; i < 9; i++) K.add('mvx-d-blot', '', `left:${r0(kx + rnd(-0.1, 1.05) * ks)}px;top:${r0(ky + rnd(-0.05, 1.05) * ks)}px;width:${r0(rnd(6, 20))}px;animation-delay:${S(ms * rnd(0.2, 0.6))}`);
    K.add('mvx-d-hanko', '<b>てん<br>ぷる</b>', `left:${r0(kx + ks - 40)}px;top:${r0(ky + ks - 54)}px;${span(ms * 0.66, ms)}`);
    K.fixed('mvx-d-swoosh', sv('0 0 400 800', `<path d="M-40 160 Q120 60 220 220 Q300 380 120 480 Q-20 560 140 700 Q240 780 440 720" fill="none" stroke="#1b1b1b" stroke-width="64" stroke-linecap="round" pathLength="1" opacity=".9"/>`, 'none'), '');
    K.word('えいっ!', 10, G.bb + 16, ms * 0.14, '#fff', 28, -8);
    K.word('ズバッ', 10, G.sh * 0.55, ms * 0.42, '#ff6b6b', 28, -6);
  });

  // ---------------- 21. 回り舞台 ----------------
  def('kabukistage', 'doya', 4400, (K, G, ms) => {
    K.back('#2b1a14', 0.78);
    const pine = `${P('M150 290 Q160 220 130 190 Q110 170 150 150 Q190 130 170 100', 'none', 16, ' stroke="#7a4a2a"')}${P('M150 290 Q160 220 130 190 Q110 170 150 150 Q190 130 170 100', 'none', 3)}${[[70, 120, 70, 26], [190, 90, 80, 30], [250, 150, 76, 26], [110, 180, 60, 22], [300, 100, 50, 20]].map(([x, y, rx, ry]) => P(`M${x - rx} ${y} Q${x - rx * 0.6} ${y - ry * 1.6} ${x} ${y - ry} Q${x + rx * 0.6} ${y - ry * 1.6} ${x + rx} ${y} Q${x} ${y + ry * 0.4} ${x - rx} ${y} Z`, '#3f8f5a', 3.5)).join('')}`;
    let gold = ''; for (let x = 0; x < 360; x += 45) for (let y = 0; y < 280; y += 45) gold += `<rect x="${x}" y="${y}" width="45" height="45" fill="${(x + y) % 90 ? '#f5c84a' : '#f0bd3a'}" stroke="#d9a52a" stroke-width="1.5"/>`;
    full(K, 'mvx-d-setA', scene(`${gold}${pine}`));
    const sak = (x, y) => [[-24, 0, 22], [0, -18, 24], [22, -2, 22], [-6, 16, 20], [18, 18, 16]].map(([dx, dy, r]) => C(x + dx, y + dy, r, '#ffc4d6', 3)).join('');
    full(K, 'mvx-d-setB', scene(`<rect width="360" height="280" fill="#1d1f4a"/>${C(270, 80, 42, '#fff6c2', 3.5)}${P('M220 280 V200 H236 V180 H226 L250 160 L274 180 H264 V200 H280 V280 Z', '#2b2b3a', 3)}${P('M200 280 V214 L250 190 L300 214 V280', 'none', 3)}${P('M60 290 Q70 200 50 150', 'none', 10, ' stroke="#5c3a2e"')}${sak(60, 140)}${sak(100, 100)}`));
    K.add('mvx-d-mawari', '<i></i>', `top:${r0(G.y + G.h * 0.88)}px`);
    K.rain(30, (i) => `<i class="mvx-d-conf" style="background:${pick(['#fff', '#ffc4d6', '#ffd94a', '#ff9fbb'])}"></i>`, { parent: document.body, cls: 'mvx-fixed mvx-d-flut', delay0: ms * 0.6, delayMax: ms * 0.25, dur: [1500, 2200], size: [8, 14] });
    K.add('mvx-d-maku', '', '');
    K.word('カン!', 12, G.bb + 20, 0, '#fff', 30, -8);
    K.word('カン!', G.sw - 90, G.bb + 40, ms * 0.08, '#fff', 30, 8);
    K.word('ぐるり', 12, G.sh * 0.5, ms * 0.42, '#ffd94a', 26, -6);
    K.word('よっ!てんぷる屋!', G.sw - 220, G.bb + 16, ms * 0.66, '#ff9f7a', 26, 6);
  });

  // ---------------- 22. 操り人形 ----------------
  def('puppet', 'wave', 4200, (K, G, ms) => {
    K.back('#3a2030', 0.68);
    const swag = (x0, x1) => P(`M${x0} 0 Q${(x0 + x1) / 2} 50 ${x1} 0`, '#d6334a', 3.5);
    full(K, 'mvx-d-theater', scene(`<rect width="360" height="280" fill="#2a1a2a"/>${P('M-10 -10 H70 Q50 100 66 290 H-10 Z', '#d6334a', 4)}${P('M370 -10 H290 Q310 100 294 290 H370 Z', '#d6334a', 4)}${swag(-10, 130)}${swag(110, 250)}${swag(230, 370)}<rect y="250" width="360" height="40" fill="#8a5a3a" stroke="${INK}" stroke-width="3"/>${[30, 90, 150, 210, 270, 330].map((x) => `<circle class="mvx-d-lamp" cx="${x}" cy="262" r="6" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/>`).join('')}`));
    K.add('mvx-d-spot mvx-d-spotc', '', `left:${r0(G.cx)}px`);
    const pts = [[120, 238], [56, 292], [186, 286], [208, 352]];
    const bar = `<g transform="translate(0 56)"><g class="mvx-d-bar">${pts.map(([x, y], i) => `<path d="M${[60, 60, 180, 180][i]} 70 L${x} ${y - 56}" stroke="${INK}" stroke-width="1.6" fill="none"/>`).join('')}${R(40, 62, 160, 14, '#d79a62', 5, 3.5)}${R(112, 36, 16, 70, '#d79a62', 5, 3.5)}${P('M92 -60 Q90 20 104 40 Q120 54 136 40 Q150 20 148 -60', '#fffdf8', 3.5)}${E(120, 30, 10, 8, '#ffc4d6', 2.5)}</g></g>`;
    K.inBtn('mvx-d-strings', sv('0 0 240 400', bar), '');
    for (let i = 0; i < 8; i++) K.add('mvx-d-heartup', pick(['✦', '★', '♪']), `left:${r0(rnd(0.1, 0.9) * G.sw)}px;top:${r0(G.sh - 30)}px;font-size:${r0(rnd(16, 26))}px;color:${pick(['#ffd94a', '#fff6c2', '#ff9fbb'])};animation-delay:${S(rnd(ms * 0.2, ms * 0.8))}`);
    K.word('カクッ', 12, G.bb + 24, ms * 0.1, '#fff', 26, -8);
    K.word('カクカク', G.sw - 120, G.bb + 60, ms * 0.4, '#ffd94a', 26, 8);
    K.word('あやつられ中', 12, G.sh * 0.62, ms * 0.62, '#ff9fbb', 22, -6);
  });

  // ---------------- 23. 巨大まくら ----------------
  const PILLOW = sv('0 0 300 160', `<path d="M24 30 Q150 4 276 30 Q300 80 276 130 Q150 156 24 130 Q0 80 24 30 Z" fill="#eef4ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="M40 44 Q150 24 260 44 Q278 80 260 116 Q150 136 40 116 Q22 80 40 44 Z" fill="none" stroke="#8fb6ff" stroke-width="3" stroke-dasharray="8 7" vector-effect="non-scaling-stroke"/>${[70, 120, 170, 220].map((x) => `<circle cx="${x}" cy="${x % 100 ? 70 : 96}" r="7" fill="#ffc4d6"/>`).join('')}<path d="M24 30 L6 14 M276 30 L294 14 M24 130 L6 148 M276 130 L294 148" stroke="${INK}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`, 'none');
  const FEATHER = sv('0 0 30 50', `${P('M15 2 Q30 20 18 46 Q2 30 15 2 Z', '#fff', 2.5)}${P('M15 6 Q16 30 16 48', 'none', 2)}`);
  def('giantpillow', 'pillowhug', 3800, (K, G, ms) => {
    K.back('#c9d4ff', 0.65);
    const W = VW(), H = VH(), pw = W * 1.5, ph = Math.min(H * 0.48, pw * 0.55), ly = G.py + G.sh - ph * 0.82;
    K.fixed('mvx-d-pillowsh', '', `left:${r0((W - pw * 0.8) / 2)}px;top:${r0(G.py + G.sh - 40)}px;width:${r0(pw * 0.8)}px`);
    K.fixed('mvx-d-pillow', PILLOW, `left:${r0((W - pw) / 2)}px;top:${r0(ly)}px;width:${r0(pw)}px;height:${r0(ph)}px`);
    for (let i = 0; i < 40; i++) { const a = rnd(Math.PI * 1.05, Math.PI * 1.95), d = rnd(80, W * 0.8); K.fixed('mvx-d-feather', FEATHER, `left:${r0(W / 2 + rnd(-pw * 0.3, pw * 0.3))}px;top:${r0(ly + ph * 0.4)}px;width:${r0(rnd(16, 30))}px;--fx:${r0(Math.cos(a) * d)}px;--fy:${r0(Math.sin(a) * d * 0.8)}px;--fr:${r0(rnd(-360, 360))}deg;animation-delay:${S(ms * 0.22 + rnd(0, 160))};animation-duration:${S(rnd(1800, 2600))}`); }
    fword(K, 'ひゅ〜', W * 0.6, G.py + G.bb, 0, '#fff', 26, 8);
    fword(K, 'ぼふっ!!', W / 2 - 80, ly + ph * 0.3, ms * 0.22, '#ffd94a', 44, -8);
    fword(K, 'Zzz…', W * 0.62, ly + 10, ms * 0.44, '#c9a7ff', 30, 8);
  });

  // ---------------- 24. 泡風呂 ----------------
  const TUB = sv('0 0 300 130', `${P('M10 24 H290 Q292 110 232 116 H68 Q8 110 10 24 Z', '#fff', 4)}${P('M40 116 L30 128 M260 116 L270 128', 'none', 7, ' stroke="#ffd94a"')}${P('M40 116 L30 128 M260 116 L270 128', 'none', 2.5)}${[...Array(13)].map((_, i) => C(16 + i * 22.5, 22 - (i % 3) * 4, 14 + (i % 3) * 4, '#fff', 3)).join('')}${[40, 110, 200].map((x) => C(x, 4, 8, '#e8f6ff', 2.5)).join('')}`);
  def('bubblebath', 'bubbles', 4400, (K, G, ms) => {
    K.back('#e6f6ff', 0.65);
    let tiles = ''; for (let x = 0; x <= 360; x += 30) tiles += `M${x} 0 V280 `; for (let y = 0; y <= 280; y += 30) tiles += `M0 ${y} H360 `;
    full(K, 'mvx-d-bathroom', scene(`<rect width="360" height="280" fill="#ffe4ef"/><path d="${tiles}" stroke="#ffc4d6" stroke-width="2"/>${R(250, 70, 70, 70, '#bfe6ff', 6, 3.5)}${P('M285 70 V140 M250 105 H320', 'none', 3)}<rect y="230" width="360" height="60" fill="#d8eefa" stroke="${INK}" stroke-width="3"/>`));
    const tw = Math.min(G.sw * 0.96, G.w * 1.4);
    K.add('mvx-d-tubx', TUB, `left:${r0(G.cx - tw / 2)}px;top:${r0(G.y + G.h * 0.58)}px;width:${r0(tw)}px`);
    K.add('mvx-d-duck', sv('0 0 50 40', `${P('M6 24 Q6 38 26 38 Q46 38 46 24 Q46 18 38 20 Q40 4 28 4 Q16 4 18 18 Q6 14 6 24 Z', '#ffd94a', 3)}${P('M17 12 L6 14 L16 18', '#ffa95e', 2.5)}<circle cx="24" cy="11" r="2.4" fill="${INK}"/>`), `left:${r0(G.cx + tw * 0.22)}px;top:${r0(G.y + G.h * 0.58 - 24)}px`);
    const W = VW(), H = VH();
    for (let i = 0; i < 64; i++) {
      const sz = rnd(30, 110), y = rnd(-0.05, 0.95) * H, d = rnd(0, ms * 0.55), pop = ms * rnd(0.84, 0.95);
      K.fixed('mvx-d-fbub', '', `left:${r0(rnd(-0.08, 0.95) * W)}px;top:${r0(y)}px;width:${r0(sz)}px;--by:${r0(H - y + sz)}px;animation-delay:${S(d)};animation-duration:${S(pop - d)}`);
    }
    fword(K, 'あわあわ', 20, G.py + G.bb + 10, ms * 0.18, '#8fd0ff', 30, -8);
    fword(K, 'もこもこ', W - 150, H * 0.55, ms * 0.45, '#ff9fbb', 30, 8);
    fword(K, 'ぱちん!', W / 2 - 50, H * 0.4, ms * 0.86, '#fff', 34, -6);
  });

  // ---------------- 25. トランプタワー ----------------
  def('cardtower', 'freeze', 4200, (K, G, ms) => {
    K.back('#1e5c3a', 0.68);
    full(K, 'mvx-d-felt', '');
    const n = 5, by = G.sh - 4, ty = Math.max(G.bb + 60, G.sh * 0.4), lh = (by - ty) / n, bw = Math.min(G.sw * 0.94, lh * 1.25 * n), x0 = G.cx - bw / 2, pw = bw / n;
    const suit = ['♥', '♠', '♦', '♣'];
    let lv = '';
    for (let i = 0; i < n; i++) {
      const yb = by - i * lh, yt = yb - lh + 6, cnt = n - i, lx = x0 + i * pw / 2;
      let g = '';
      for (let k = 0; k < cnt; k++) {
        const x = lx + k * pw, back = (i + k) % 2;
        const fill = back ? '#e8413c' : '#fff';
        g += `<path d="M${(x).toFixed(1)} ${yb} L${(x + pw * 0.26).toFixed(1)} ${yb} L${(x + pw * 0.52).toFixed(1)} ${yt} L${(x + pw * 0.26).toFixed(1)} ${yt} Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
        g += `<path d="M${(x + pw).toFixed(1)} ${yb} L${(x + pw * 0.74).toFixed(1)} ${yb} L${(x + pw * 0.48).toFixed(1)} ${yt} L${(x + pw * 0.74).toFixed(1)} ${yt} Z" fill="${back ? '#fff' : '#3a6fd6'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
        g += `<text x="${(x + pw * 0.27).toFixed(1)}" y="${(yb - lh * 0.4).toFixed(1)}" font-size="${r0(lh * 0.3)}" text-anchor="middle" fill="${k % 2 ? '#2b2b2b' : '#e8413c'}">${suit[(i + k) % 4]}</text>`;
      }
      if (i < n - 1) g += `<rect x="${(lx + pw * 0.2).toFixed(1)}" y="${(yt - 6).toFixed(1)}" width="${(cnt * pw - pw * 0.4).toFixed(1)}" height="7" rx="2" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
      lv += `<g class="mvx-d-lvl" style="animation-delay:${S(ms * (0.1 + i * 0.07))},${S(ms * 0.8)};--tx:${r0(rnd(-200, 200))}px;--ty:${r0(rnd(-160, -40))}px;--tr:${r0(rnd(-120, 120))}deg">${g}</g>`;
    }
    K.add('mvx-d-tower', sv(`0 0 ${G.sw} ${G.sh}`, lv, 'none'), `width:${G.sw}px;height:${G.sh}px`);
    catVars({ '--ty': r0(ty - 2 - (G.y + G.h * 0.85)) + 'px' }, ms);
    const card = (i) => sv('0 0 40 56', `${R(2, 2, 36, 52, i % 2 ? '#fff' : '#e8413c', 5, 3)}<text x="20" y="36" text-anchor="middle" font-size="20" fill="${i % 2 ? '#e8413c' : '#fff'}">${suit[i % 4]}</text>`);
    K.rain(26, card, { parent: document.body, cls: 'mvx-fixed mvx-d-flut', delay0: ms * 0.8, delayMax: ms * 0.12, dur: [1000, 1500], size: [28, 46] });
    K.word('そーっと…', 10, G.bb + 14, ms * 0.12, '#fff', 22, -6);
    K.word('ピタッ', G.sw - 100, G.bb + 30, ms * 0.48, '#ffd94a', 30, 8);
    K.word('びくともしない', 10, G.sh * 0.5, ms * 0.6, '#8fe8c8', 22, -6);
  });

  // ---------------- 26. 巨大な魚の影 ----------------
  const FISHSH = sv('0 0 500 210', `<g fill="rgba(8,28,64,.42)"><path d="M10 105 Q80 20 250 25 Q380 30 420 90 L495 30 Q470 105 495 180 L420 120 Q380 185 250 188 Q80 190 10 105 Z"/><path d="M190 32 Q250 -26 330 34 Z"/><path d="M140 160 Q160 214 230 176 Z"/></g><circle cx="80" cy="92" r="10" fill="rgba(8,28,64,.3)"/>`, 'none');
  def('giantfish', 'halfloaf', 4400, (K, G, ms) => {
    K.back('#6fbfe8', 0.8);
    full(K, 'mvx-d-pond', '<i></i>');
    const W = VW(), H = VH(), fw = W * 2.4, fh = fw * 0.42, ft = (H - fh) / 2 + H * 0.05;
    K.fixed('mvx-d-fishsh', FISHSH, `left:${r0(W)}px;top:${r0(ft)}px;width:${r0(fw)}px;height:${r0(fh)}px;--fx:${r0(-(W + fw))}px`);
    K.add('mvx-d-fishsh mvx-d-fishin', FISHSH, `left:${r0(W - G.px)}px;top:${r0(ft - G.py)}px;width:${r0(fw)}px;height:${r0(fh)}px;--fx:${r0(-(W + fw))}px`);
    const lw = G.w * 1.1;
    K.add('mvx-d-lily', sv('0 0 200 60', `${P('M100 30 L190 22 Q200 30 190 42 Q100 62 10 42 Q0 30 10 20 Q100 0 190 22', '#6cc28a', 4)}${P('M100 30 L60 16 M100 30 L150 14 M100 30 L40 40 M100 30 L160 44', 'none', 2.5, ' stroke="#3f8f5a"')}`), `left:${r0(G.cx - lw / 2)}px;top:${r0(G.y + G.h * 0.86)}px;width:${r0(lw)}px`);
    for (let i = 0; i < 5; i++) K.add('mvx-d-ripple', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.97)}px;animation-delay:${S(i * 800)}`);
    for (let i = 0; i < 14; i++) K.fixed('mvx-d-fbubble', '', `left:${r0(rnd(0.05, 0.95) * W)}px;top:${r0(rnd(0.3, 1) * H)}px;width:${r0(rnd(8, 20))}px;animation-delay:${S(rnd(ms * 0.2, ms * 0.8))}`);
    K.word('……', G.sw - 90, G.bb + 20, ms * 0.3, '#fff', 26, 6);
    K.word('ゆら…', 12, G.sh * 0.42, ms * 0.5, '#fff', 24, -6);
    K.word('ちゃぷ', G.sw - 100, G.sh * 0.6, ms * 0.82, '#8fd0ff', 24, 8);
  });

  // ---------------- 27. 鳩時計 ----------------
  def('catclock', 'nyaa', 4000, (K, G, ms) => {
    K.back('#f3e2c8', 0.65);
    full(K, 'mvx-d-wallp', '');
    const top = Math.max(0, G.bb - 50), ch = G.sh - top + 6, s = ch / 280, cw = 200 * s, cl = G.cx - cw / 2;
    let ticks = ''; for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 * i) / 12; ticks += `<path d="M${(100 + Math.cos(a) * 30).toFixed(1)} ${(160 + Math.sin(a) * 30).toFixed(1)} L${(100 + Math.cos(a) * 36).toFixed(1)} ${(160 + Math.sin(a) * 36).toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; }
    const clock = `${P('M70 210 V270 M130 210 V262', 'none', 2.5, ' stroke="#8a6a3a" stroke-dasharray="3 3"')}<g class="mvx-d-pend">${P('M100 210 V256', 'none', 4)}${C(100, 262, 12, '#ffd94a', 3.5)}</g>${P('M62 266 Q70 252 78 266 Q78 282 70 286 Q62 282 62 266 Z', '#8a5a3a', 3)}${P('M122 258 Q130 244 138 258 Q138 274 130 278 Q122 274 122 258 Z', '#8a5a3a', 3)}${P('M18 66 L100 6 L182 66 Z', '#a0603a', 4)}${P('M30 60 L100 14 L170 60', 'none', 3, ' stroke="#3f8f5a" stroke-dasharray="10 6" stroke-width="8"')}${R(28, 60, 144, 150, '#d79a62', 6, 4)}${P('M28 210 Q100 230 172 210', '#a0603a', 4)}${R(78, 72, 44, 44, '#2b2b2b', 3, 3)}<g class="mvx-d-cdl">${R(78, 72, 22, 44, '#c0814a', 2, 3)}</g><g class="mvx-d-cdr">${R(100, 72, 22, 44, '#c0814a', 2, 3)}</g>${C(100, 160, 40, '#fffdf2', 4)}${ticks}<g class="mvx-d-hh">${P('M100 160 V138', 'none', 5)}</g><g class="mvx-d-mh">${P('M100 160 L122 160', 'none', 3.5)}</g>${C(100, 160, 4, INK, 1)}${P('M40 96 Q30 120 44 140 M160 96 Q170 120 156 140', 'none', 6, ' stroke="#3f8f5a"')}`;
    K.add('mvx-d-cclock', sv('0 0 200 280', clock), `left:${r0(cl)}px;top:${r0(top)}px;width:${r0(cw)}px;height:${r0(ch)}px`);
    const doorB = top + 116 * s;
    catVars({ '--cy': r0(doorB - (G.y + G.h * 0.85)) + 'px' }, ms);
    [0.38, 0.5, 0.62].forEach((f, i) => K.word('ぽっぽー', i % 2 ? G.cx + 40 : 10, top + 70 * s - 20, ms * f, ['#ff9fbb', '#ffd94a', '#8fe8c8'][i], 26, i % 2 ? 8 : -8));
    K.word('チクタク', G.sw - 110, G.sh * 0.66, ms * 0.08, '#fff', 22, 6);
    K.stars(10, ms * 0.7, [5, 95, 20, 80]);
  });

  // ---------------- 28. たぬきに変身 ----------------
  const TANUKI = sv('0 0 240 200', `${P('M168 172 Q226 168 218 120 Q210 98 192 110 Q200 140 160 150', '#b07d52', 3.5)}${P('M206 112 L194 124 M214 130 L198 136 M212 150 L194 150', 'none', 5, ' stroke="#5a3a22"')}${E(120, 150, 62, 48, '#b07d52', 3.5)}<g class="mvx-d-belly">${E(120, 158, 38, 32, '#f3dfc0', 3)}</g>${E(78, 150, 12, 18, '#9a6a42', 3)}${E(162, 150, 12, 18, '#9a6a42', 3)}${E(92, 192, 18, 9, '#9a6a42', 3)}${E(148, 192, 18, 9, '#9a6a42', 3)}${C(84, 52, 12, '#7a5232', 3)}${C(156, 52, 12, '#7a5232', 3)}${E(120, 84, 48, 40, '#b07d52', 3.5)}${E(101, 84, 17, 12, '#5a3a22', 0)}${E(139, 84, 17, 12, '#5a3a22', 0)}${C(103, 83, 6, '#fff', 2)}${C(137, 83, 6, '#fff', 2)}${C(104, 84, 3, INK, 0)}${C(136, 84, 3, INK, 0)}${E(120, 102, 16, 11, '#f3dfc0', 3)}${E(120, 96, 6, 4, INK, 0)}${P('M114 106 Q120 110 126 106', 'none', 2.5)}${P('M120 44 Q96 22 112 4 Q134 18 120 44 Z', '#6cc28a', 3)}${P('M120 44 Q116 24 113 8', 'none', 2)}`);
  def('tanuki', 'leafhead', 4000, (K, G, ms) => {
    K.back('#2c2a4a', 0.75);
    let st = ''; for (let i = 0; i < 20; i++) st += `<circle cx="${r0(rnd(0, 360))}" cy="${r0(rnd(0, 160))}" r="${rnd(1, 2.4).toFixed(1)}" fill="#fff6c2"/>`;
    const susuki = [...Array(9)].map((_, i) => { const x = 10 + i * 42; return `${P(`M${x} 290 Q${x + 4} 230 ${x + 20} 200`, 'none', 3, ' stroke="#c9a76a"')}${P(`M${x + 20} 200 q-6 -16 6 -30 q4 18 -6 30 Z`, '#e8d6a8', 2.5)}`; }).join('');
    full(K, 'mvx-d-tnight', scene(`<rect width="360" height="280" fill="#2c2a5a"/>${st}${C(280, 80, 42, '#fff6c2', 3.5)}${C(266, 70, 6, '#f0e2a8', 0)}${C(292, 92, 8, '#f0e2a8', 0)}${P('M-10 290 Q100 230 200 250 Q290 236 370 260 V290 Z', '#3a3a6a', 3)}${susuki}`));
    K.inBtn('mvx-d-tanuki', TANUKI, '');
    const dron = (t) => { for (let i = 0; i < 16; i++) { const sz = rnd(46, 96); K.add('mvx-d-dron', '', `left:${r0(G.cx + rnd(-G.w * 0.42, G.w * 0.42) - sz / 2)}px;top:${r0(G.y + G.h * rnd(0.2, 0.9) - sz / 2)}px;width:${r0(sz)}px;height:${r0(sz)}px;animation-delay:${S(t + rnd(0, 120))}`); } };
    dron(ms * 0.28); dron(ms * 0.66);
    K.rain(16, () => `<span class="mvx-d-leaf" style="background:${pick(['#ffa95e', '#ff6b6b', '#ffd94a', '#8fe8a8'])}"></span>`, { parent: document.body, cls: 'mvx-fixed mvx-d-flut', delayMax: ms * 0.7, dur: [1800, 2600], size: [14, 22] });
    K.word('ドロン!', 12, G.bb + 20, ms * 0.28, '#fff', 34, -8);
    K.word('ぽんぽこ', G.sw - 120, G.sh * 0.42, ms * 0.42, '#ffd94a', 26, 8);
    K.word('ぽんぽこ', 12, G.sh * 0.56, ms * 0.54, '#ffd94a', 26, -8);
    K.word('ドロン!', G.sw - 120, G.bb + 20, ms * 0.66, '#fff', 34, 8);
  });

  // ---------------- 29. 灯籠流し ----------------
  const LANTERN = sv('0 0 40 52', `${R(2, 2, 36, 7, '#5c3a2e', 2, 3)}${R(6, 9, 28, 31, '#ffd27a', 2, 3)}${P('M20 9 V40 M6 24 H34', 'none', 2, ' stroke="#c98a3a"')}${R(2, 40, 36, 8, '#5c3a2e', 2, 3)}`);
  def('lanternfly', 'lantern', 4600, (K, G, ms) => {
    K.back('#141a3c', 0.92);
    K.dark('#0d1330', 0.85, 0.06, 0.9);
    full(K, 'mvx-d-river', scene(`${C(70, 60, 26, '#fff6c2', 3)}${P('M-10 200 Q60 160 120 186 Q190 150 260 180 Q320 160 370 176 V290 H-10 Z', '#1d2550', 3)}<rect y="214" width="360" height="80" fill="#24306a" stroke="${INK}" stroke-width="3"/>${P('M20 234 h40 M110 248 h60 M220 232 h50 M290 252 h40 M60 266 h50', 'none', 3, ' stroke="#8fb6ff" opacity=".6"')}`));
    const ry = G.sh - (G.sh * 0.18);
    for (let i = 0; i < 6; i++) K.add('mvx-d-tourou', `<i></i>${LANTERN}`, `left:${r0((i / 6) * G.sw - 20)}px;top:${r0(ry - 30 + (i % 2) * 10)}px;--ry:${r0(-(ry + 80))}px;animation-delay:${S(-i * 300)},${S(ms * 0.35 + i * 140)}`);
    const W = VW(), H = VH();
    for (let i = 0; i < 28; i++) K.fixed('mvx-d-skylan', `<i></i>${LANTERN}`, `left:${r0(rnd(-0.02, 0.92) * W)}px;width:${r0(rnd(22, 46))}px;--rh:${r0(-(H + 140))}px;--sx:${r0(rnd(-40, 40))}px;animation-delay:${S(rnd(ms * 0.08, ms * 0.55))};animation-duration:${S(rnd(2600, 3600))}`);
    for (let i = 0; i < 24; i++) K.fixed('mvx-d-twinkle', '✦', `left:${r0(rnd(0, 1) * W)}px;top:${r0(rnd(0, 0.6) * H)}px;font-size:${r0(rnd(8, 18))}px;animation-delay:${S(rnd(0, ms * 0.8))}`);
    K.word('ゆらゆら', 12, G.bb + 20, ms * 0.14, '#ffd27a', 24, -6);
    K.word('ふわ…', G.sw - 100, G.bb + 50, ms * 0.5, '#fff6c2', 26, 8);
  });

  // ---------------- 30. エンドロール ----------------
  def('endroll', 'bow', 5200, (K, G, ms) => {
    K.back('#000', 0.94);
    K.dark('#000', 0.9, 0.05, 0.92);
    K.add('mvx-d-endspot', '', `left:${r0(G.cx - G.w * 0.24)}px;top:${r0(G.y + G.h * 0.5)}px`);
    K.fixed('mvx-d-bars', '<i></i><i></i>', '');
    const cr = [['出演', 'てんぷる（全役）'], ['監督', 'てんぷる'], ['脚本', 'てんぷる'], ['撮影', 'てんぷる'], ['音楽', 'てんぷる'], ['衣装', 'しろい毛'], ['ケータリング', 'かつおぶし'], ['協力', 'こたつ'], ['special thanks', 'あなた']];
    K.fixed('mvx-d-credits', `<dl>${cr.map(([a, b], i) => `<dt>${a}</dt><dd${i ? '' : ' class="mvx-d-star"'}>${b}</dd>`).join('')}</dl><p>制作・著作<br><b>てんぷる</b></p>`, '');
    K.fixed('mvx-d-owari mvx-d-top', 'おしまい', `${span(ms * 0.8, ms)}`);
    for (let i = 0; i < 4; i++) K.fixed('mvx-d-scratch', '', `left:${r0(rnd(0.05, 0.95) * VW())}px;animation-delay:${S(rnd(0, 400))}`);
  });
})();
