// 派手な動き 第4弾（moves-b）。window.MoreMoves に足していく
// 中くらい（ちょっと変）62種。CSS は moves-b.css
// ※ おまけの絵のクラスは「mvx-b」＋「mvx-b-〇〇」（ほかの動きとぶつからないように）
window.MoreMoves = window.MoreMoves || [];
(function () {
  'use strict';
  const INK = '#2b2b2b';
  const POP = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#ffa95e', '#c9a7ff', '#ff6b6b', '#ffffff'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const $ = (id) => document.getElementById(id);
  const ink = (w = 3.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const sv = (vb, inner, attr = '') => `<svg viewBox="${vb}"${attr}>${inner}</svg>`;
  const catSvg = (inner) => `<svg class="cat mvx-cat" viewBox="0 0 240 200">${inner}</svg>`;
  const poseSvg = (pose) => { const P = window.Poses || {}; return (P[pose] || P.sit || { svg: '' }).svg; };
  const mini = (pose) => catSvg(poseSvg(pose));
  const nowCat = () => catSvg($('catPose') ? $('catPose').innerHTML : poseSvg('sit'));
  const headOf = (pose) => { const p = window.Poses && window.Poses[pose]; return p && p.head ? p.head : { x: 121, y: 56, r: 0 }; };
  // おまけを足す（mvx-b をかならずつける）
  const A = (K, cls, html = '', style = '') => K.add('mvx-b ' + cls, html, style);
  const B = (K, cls, html = '', style = '') => K.inBtn('mvx-b ' + cls, html, style);
  // ねこボタンに一時的な値を入れる（動きが終わるときに消す）
  const bv = (vars, ms) => {
    const b = $('catBtn'); if (!b) return;
    Object.keys(vars).forEach((k) => b.style.setProperty(k, vars[k]));
    setTimeout(() => Object.keys(vars).forEach((k) => b.style.removeProperty(k)), ms);
  };
  const px = (v) => v.toFixed(1) + 'px';
  const pc = (v) => (v * 100).toFixed(1) + '%';
  const ground = (G) => G.y + G.h;
  // ステージの中の範囲（%）を、ねこのまわりで
  const catArea = (G, x0, x1, y0, y1) => [((G.x + G.w * x0) / G.sw) * 100, ((G.x + G.w * x1) / G.sw) * 100, ((G.y + G.h * y0) / G.sh) * 100, ((G.y + G.h * y1) / G.sh) * 100];
  const def = (name, pose, ms, fn) => window.MoreMoves.push({ name, pose, ms, extras: fn ? (K) => fn(K, K.G, ms, (f) => ms * f) : undefined });

  // ---- 小物の絵 ----
  const paw = (c = INK) => sv('0 0 30 30', `<ellipse cx="15" cy="20" rx="7.5" ry="6.5" fill="${c}"/><circle cx="6.5" cy="11.5" r="3.4" fill="${c}"/><circle cx="12" cy="5.5" r="3.4" fill="${c}"/><circle cx="18.5" cy="5.5" r="3.4" fill="${c}"/><circle cx="24" cy="11.5" r="3.4" fill="${c}"/>`);
  const heartSvg = (c = '#ff9fbb') => sv('0 0 40 36', `<path d="M20 33 C 6 24 2 16 2 10 C 2 4 7 1 12 1 C 16 1 19 4 20 7 C 21 4 24 1 28 1 C 33 1 38 4 38 10 C 38 16 34 24 20 33 Z" fill="${c}" ${ink(3)}/><path d="M9 9 Q10 6 13 6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`);
  const starSvg = (c) => sv('0 0 40 40', `<path d="M20 2 L24 14 L38 13 L27 21 L33 36 L20 27 L7 36 L13 21 L2 13 L16 14 Z" fill="${c}" ${ink(3)}/>`);
  const gearD = (cx, cy, r1, r2, n) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a0 = (Math.PI * i) / n, a1 = (Math.PI * (i + 1)) / n, r = i % 2 ? r1 : r2;
      const p = (a) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
      d += (i ? ' L' : 'M') + p(a0 + 0.08) + ' L' + p(a1 - 0.08);
    }
    return d + ' Z';
  };
  const gear = (c) => sv('0 0 60 60', `<path d="${gearD(30, 30, 20, 28, 8)}" fill="${c}" ${ink(3)}/><circle cx="30" cy="30" r="8" fill="#fff" ${ink(3)}/>`);
  const leaf = (c = '#8fe8c8') => sv('0 0 30 20', `<path d="M2 10 Q14 -4 28 10 Q14 24 2 10 Z" fill="${c}" ${ink(2.5)}/><path d="M4 10 L24 10" ${ink(1.8)}/>`);
  const cardboard = '#f1d9a0';
  // ねこの顔（お団子などに使う、まるい顔）
  const ballFace = (cx, cy, r, color) =>
    `<path d="M${cx - r * 0.85} ${cy - r * 0.35} L${cx - r * 0.7} ${cy - r * 1.15} L${cx - r * 0.2} ${cy - r * 0.8} Z M${cx + r * 0.85} ${cy - r * 0.35} L${cx + r * 0.7} ${cy - r * 1.15} L${cx + r * 0.2} ${cy - r * 0.8} Z" fill="${color}" ${ink(3)}/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" ${ink(3.5)}/>` +
    `<path d="M${cx - r * 0.5} ${cy - r * 0.05} q${r * 0.15} ${-r * 0.2} ${r * 0.3} 0 M${cx + r * 0.2} ${cy - r * 0.05} q${r * 0.15} ${-r * 0.2} ${r * 0.3} 0" fill="none" ${ink(2.6)}/>` +
    `<path d="M${cx - r * 0.2} ${cy + r * 0.25} q${r * 0.1} ${r * 0.18} ${r * 0.2} 0 q${r * 0.1} ${r * 0.18} ${r * 0.2} 0" fill="none" ${ink(2.2)}/>` +
    `<ellipse cx="${cx - r * 0.6}" cy="${cy + r * 0.2}" rx="${r * 0.16}" ry="${r * 0.1}" fill="#ff9fbb" opacity=".8"/><ellipse cx="${cx + r * 0.6}" cy="${cy + r * 0.2}" rx="${r * 0.16}" ry="${r * 0.1}" fill="#ff9fbb" opacity=".8"/>`;

  // ======================= ダンス・運動・あそび =======================
  def('tapdance', 'upright', 2800, (K, G, ms, t) => {
    const h = headOf('upright');
    B(K, 'mvx-b-ov', sv('0 0 240 200', `<g transform="translate(${h.x} ${h.y + 6}) rotate(${h.r - 8})"><rect x="-19" y="-36" width="38" height="36" rx="3" fill="${INK}"/><rect x="-19" y="-13" width="38" height="7" fill="#ff6b6b"/><ellipse cx="0" cy="0" rx="33" ry="6" fill="${INK}"/></g><g class="mvx-b-cane"><path d="M198 196 L198 122 Q198 104 182 108" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M198 196 L198 122 Q198 104 182 108" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 7"/></g>`));
    for (let i = 0; i < 10; i++) A(K, 'mvx-b-tap', starSvg(['#ffd94a', '#8fd0ff', '#ff9fbb'][i % 3]), `left:${px(G.cx + (i % 2 ? 18 : -44))};top:${px(ground(G) - 24)};animation-delay:${K.s(t(0.04) + i * 230)}`);
    K.word('タタタッ', 12, G.bb + 30, t(0.08), '#8fd0ff', 24, -8);
    K.word('カッ!', G.sw - 80, G.bb + 56, t(0.42), '#ffd94a', 28, 8);
    K.word('ジャン!', G.cx - 50, G.bb + 8, t(0.82), '#ff9fbb', 30, -6);
  });

  def('breakdance', 'sakadachi', 3000, (K, G, ms, t) => {
    A(K, 'mvx-b-mat', '', `left:${px(G.cx - G.w * 0.6)};width:${px(G.w * 1.2)};top:${px(ground(G) - 14)}`);
    B(K, 'mvx-b-ov mvx-b-arcs', sv('0 0 240 200', `<ellipse cx="120" cy="178" rx="104" ry="16" fill="none" stroke="${INK}" stroke-width="3.5" stroke-dasharray="20 16"/><ellipse cx="120" cy="178" rx="82" ry="11" fill="none" stroke="#c9a7ff" stroke-width="4" stroke-dasharray="12 12"/>`));
    K.word('キュキュッ', 12, G.bb + 30, t(0.14), '#c9a7ff', 24, -8);
    K.word('ブンブン', G.sw - 110, G.bb + 64, t(0.46), '#8fe8c8', 24, 8);
    K.word('フリーズ!', G.cx - 60, G.bb + 8, t(0.84), '#ffd94a', 30, -6);
  });

  def('robotdance', 'upright', 3000, (K, G, ms, t) => {
    const h = headOf('upright');
    B(K, 'mvx-b-ov', sv('0 0 240 200', `<path d="M${h.x} ${h.y + 6} L${h.x} ${h.y - 18}" ${ink(4)}/><circle class="mvx-b-blink" cx="${h.x}" cy="${h.y - 24}" r="7" fill="#ff6b6b" ${ink(3)}/>`));
    A(K, 'mvx-b-gear', gear('#8fd0ff'), `left:${px(Math.max(4, G.x - 24))};top:${px(G.y + G.h * 0.2)};width:48px`);
    A(K, 'mvx-b-gear rev', gear('#ffd94a'), `left:${px(Math.min(G.sw - 40, G.x + G.w - 6))};top:${px(G.y + G.h * 0.5)};width:36px`);
    K.word('ウィーン', 12, G.bb + 24, t(0.06), '#8fd0ff', 22, -8);
    K.word('ガシャン', G.sw - 110, G.bb + 60, t(0.36), '#ffd94a', 24, 8);
    K.word('ピピッ', 20, G.bb + 70, t(0.7), '#ff6b6b', 22, -6);
  });

  def('linedance', 'banzai', 3200, (K, G, ms, t) => {
    const w = Math.min(G.w * 0.46, 80), h = (w * 200) / 240, top = ground(G) - h - 2;
    [[-0.86, '#ffd8e4'], [-0.48, '#d8f6ec'], [0.48, '#fff1b8'], [0.86, '#e2d6ff']].forEach(([s, c]) => {
      const x = Math.min(Math.max(G.cx + s * G.w - w / 2, 2), G.sw - w - 2);
      A(K, 'mvx-b-liner', `<div class="mvx-b-lin">${mini('banzai')}</div>`, `left:${px(x)};top:${px(top)};width:${px(w)};--in:${s < 0 ? -1 : 1};--tint:${c}`);
    });
    K.word('1・2・3・4!', 12, G.bb + 20, t(0.12), '#ff9fbb', 24, -8);
    K.word('イーハー!', G.sw - 130, G.bb + 56, t(0.6), '#ffd94a', 26, 8);
  });

  def('limbo', 'banzai', 3200, (K, G, ms, t) => {
    const barY = G.y + G.h * 0.3;
    A(K, 'mvx-b-limbo', '<i class="p1"></i><i class="p2"></i><b></b>', `left:${px(G.cx - 72)};width:144px;top:${px(barY)};height:${px(ground(G) - barY + 2)}`);
    K.word('リンボー♪', 12, G.bb + 20, t(0.12), '#ffa95e', 24, -8);
    K.word('ギリギリ…', G.cx - 50, G.bb + 4, t(0.42), '#8fd0ff', 22, 4);
    K.word('くぐれた!', G.sw - 120, G.bb + 50, t(0.76), '#ffd94a', 26, 8);
  });

  def('tugofwar', 'komari', 3200, (K, G, ms, t) => {
    A(K, 'mvx-b-rope', '', `left:${px(G.cx - 14)};top:${px(G.y + G.h * 0.6)};width:${px(G.sw + 40)}`);
    K.puffs(G.cx, ground(G), 6, t(0.36), 40);
    K.puffs(G.cx - 20, ground(G), 5, t(0.82), 40);
    K.word('うーん!', 12, G.bb + 24, t(0.06), '#ffa95e', 24, -8);
    K.word('ずるずる…', G.sw - 130, G.bb + 60, t(0.36), '#8fd0ff', 22, 8);
    K.word('えいっ!', 14, G.bb + 70, t(0.6), '#ff9fbb', 26, -6);
    K.word('ドテッ', G.cx - 40, G.bb + 10, t(0.82), '#ffd94a', 28, -4);
  });

  def('pushup', 'sunflat', 3000, (K, G, ms, t) => {
    const cols = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#ffa95e'];
    for (let i = 0; i < 5; i++) K.word(String(i + 1), i % 2 ? G.sw - 70 : 22, G.bb + 18 + (i % 3) * 22, t(0.08 + 0.13 * i + 0.06), cols[i], 32, i % 2 ? 8 : -8);
    const h = headOf('sunflat');
    for (let i = 0; i < 7; i++) A(K, 'mvx-b-sweat', sv('0 0 20 28', `<path d="M10 2 Q20 16 16 22 Q10 30 4 22 Q0 16 10 2 Z" fill="#8fd0ff" ${ink(2.5)}/>`), `left:${px(G.x + (h.x / 240) * G.w)};top:${px(G.y + ((h.y + 10) / 200) * G.h)};--dx:${rnd(-60, 30).toFixed(0)}px;--dy:${rnd(-50, -20).toFixed(0)}px;animation-delay:${K.s(t(0.3) + i * 230)}`);
    K.word('ぜぇぜぇ', G.cx - 40, G.bb + 8, t(0.78), '#c9a7ff', 22, -4);
  });

  def('squat', 'upright', 3000, (K, G, ms, t) => {
    const h = headOf('upright'), y = h.y - 4;
    B(K, 'mvx-b-ov', sv('0 0 240 200', `<path d="M-6 ${y} L246 ${y}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M-6 ${y} L246 ${y}" stroke="#cfd6e6" stroke-width="4" stroke-linecap="round"/>` +
      [[-2, 26], [12, 20], [216, 20], [228, 26]].map(([x, hh], i) => `<rect x="${x}" y="${y - hh}" width="${i === 0 || i === 3 ? 14 : 12}" height="${hh * 2}" rx="4" fill="${i === 0 || i === 3 ? '#ff6b6b' : '#ffd94a'}" ${ink(3)}/>`).join('')));
    ['いち!', 'に!', 'さん!', 'し!'].forEach((w, i) => K.word(w, i % 2 ? G.sw - 80 : 14, G.bb + 20 + (i % 2) * 30, t(0.1 + 0.2 * i), POP[i], 24, i % 2 ? 8 : -8));
    K.word('ムキッ', G.cx - 40, G.bb + 6, t(0.84), '#ffa95e', 28, -6);
  });

  def('pogo', 'upright', 2800, (K, G, ms, t) => {
    B(K, 'mvx-b-pogo', sv('0 0 100 200', `<path d="M14 12 L86 12" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M14 12 L86 12" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/><path d="M50 12 L50 120" stroke="${INK}" stroke-width="9"/><path d="M50 12 L50 120" stroke="#cfd6e6" stroke-width="4"/><path d="M22 96 L78 96" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><g class="spr"><path d="M50 120 l14 6 l-28 8 l28 8 l-28 8 l28 8 l-28 8 l14 6" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/><path d="M50 120 l14 6 l-28 8 l28 8 l-28 8 l28 8 l-28 8 l14 6" fill="none" stroke="#ffd94a" stroke-width="2.5" stroke-linejoin="round"/></g><path d="M50 172 L50 192" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><ellipse cx="50" cy="194" rx="9" ry="5" fill="${INK}"/>`));
    for (let i = 0; i < 5; i++) K.puffs(G.cx, ground(G), 2, t(0.1 + 0.15 * i), 26);
    K.word('ボヨン', 12, G.bb + 30, t(0.1), '#ffd94a', 24, -8);
    K.word('ボヨヨン', G.sw - 120, G.bb + 60, t(0.4), '#8fe8c8', 24, 8);
    K.word('ぴょーん', 16, G.bb + 70, t(0.7), '#ff9fbb', 24, -6);
  });

  def('unicycle', 'banzai', 3200, (K, G, ms, t) => {
    let spokes = '';
    for (let i = 0; i < 6; i++) spokes += `<path d="M50 125 L${(50 + Math.cos((i * Math.PI) / 3) * 30).toFixed(1)} ${(125 + Math.sin((i * Math.PI) / 3) * 30).toFixed(1)}" ${ink(2.5)}/>`;
    B(K, 'mvx-b-uni', sv('0 0 100 160', `<path d="M50 14 L50 112" stroke="${INK}" stroke-width="8"/><path d="M50 14 L50 112" stroke="#c9a7ff" stroke-width="3.5"/><ellipse cx="50" cy="10" rx="22" ry="8" fill="#ff6b6b" ${ink(3)}/><circle cx="50" cy="125" r="33" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="50" cy="125" r="33" fill="none" stroke="#8fd0ff" stroke-width="3"/><g class="whl">${spokes}<circle cx="50" cy="125" r="5" fill="#ffd94a" ${ink(2.5)}/></g>`));
    K.word('ふらふら〜', 12, G.bb + 24, t(0.14), '#c9a7ff', 22, -8);
    K.word('おっとっと', G.sw - 130, G.bb + 60, t(0.66), '#ffa95e', 24, 8);
  });

  def('stilts', 'upright', 3000, (K, G, ms, t) => {
    B(K, 'mvx-b-stilts', '<i class="l"></i><i class="r"></i>');
    K.word('たかーい!', 12, G.bb + 20, t(0.14), '#8fe8c8', 24, -8);
    K.word('ぐらっ', G.sw - 100, G.bb + 50, t(0.74), '#ffa95e', 26, 8);
  });

  def('ski', 'banzai', 2800, (K, G, ms, t) => {
    const W = G.sw, H = G.sh, y0 = G.bb + 34, y1 = ground(G) + 12;
    const lineY = (x) => y0 + ((y1 - y0) * x) / W;
    A(K, 'mvx-b-slope', `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="M-4 ${y0} L${W + 4} ${y1} L${W + 4} ${H + 4} L-4 ${H + 4} Z" fill="#fbfdff" ${ink(3)}/><path d="M${W * 0.15} ${lineY(W * 0.15) + 18} l40 8 M${W * 0.55} ${lineY(W * 0.55) + 24} l46 9 M${W * 0.3} ${lineY(W * 0.3) + 52} l30 6" stroke="#8fd0ff" stroke-width="3" stroke-linecap="round"/></svg>`, 'left:0;top:0');
    const sx0 = -(G.cx + G.w * 0.7), sx1 = W - G.cx + G.w * 0.7;
    const ang = (Math.atan2(y1 - y0, W) * 180) / Math.PI;
    bv({ '--sx0': px(sx0), '--sy0': px(lineY(G.cx + sx0) - ground(G)), '--sx1': px(sx1), '--sy1': px(lineY(G.cx + sx1) - ground(G)), '--sa': ang.toFixed(1) + 'deg' }, ms);
    B(K, 'mvx-b-skis', sv('0 0 240 30', `<path d="M10 14 L216 14 Q236 14 234 2" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M10 14 L216 14 Q236 14 234 2" fill="none" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/>`));
    for (let i = 0; i < 4; i++) { const f = 0.2 + i * 0.13; const x = G.cx + sx0 + (sx1 - sx0) * ((f - 0.1) / 0.65); K.puffs(x, lineY(x), 3, t(f), 20); }
    K.rain(12, '<i class="mvx-b-flake"></i>', { delayMax: 1800, dur: [1400, 2200], size: [8, 13], cls: 'mvx-b' });
    K.word('シャーッ', G.sw - 120, G.bb + 70, t(0.3), '#8fd0ff', 26, 8);
    K.word('ひゃっほー', 12, G.bb + 8, t(0.12), '#ff9fbb', 22, -6);
  });

  def('sled', 'loaf', 3000, (K, G, ms, t) => {
    B(K, 'mvx-b-sled', sv('0 0 240 50', `<path d="M14 40 L206 40 Q234 40 232 14" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M14 40 L206 40 Q234 40 232 14" fill="none" stroke="#ff6b6b" stroke-width="3.5" stroke-linecap="round"/><path d="M50 40 L50 24 M110 40 L110 24 M170 40 L170 24" ${ink(5)}/><rect x="20" y="10" width="200" height="16" rx="5" fill="#ffa95e" ${ink(3.5)}/><path d="M60 18 h20 M120 18 h20" stroke="#c97a3a" stroke-width="2.5" stroke-linecap="round"/>`));
    K.rain(14, '<i class="mvx-b-flake"></i>', { delayMax: 2000, dur: [1500, 2400], size: [8, 13], cls: 'mvx-b' });
    K.puffs(G.cx - 50, ground(G), 4, t(0.12), 30);
    K.puffs(G.cx, ground(G), 4, t(0.86), 50);
    K.word('シャーッ', 12, G.bb + 30, t(0.14), '#8fd0ff', 26, -8);
    K.word('ガタン', G.sw - 100, G.bb + 60, t(0.84), '#ffa95e', 26, 8);
  });

  def('kite', 'banzai', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-kite', sv('0 0 240 400', `<path d="M174 98 C 160 160, 110 170, 122 232" fill="none" stroke="${INK}" stroke-width="2.4"/><g class="kf"><path d="M174 20 L210 58 L174 98 L138 58 Z" fill="#ff9fbb" ${ink(3.5)}/><path d="M174 20 L210 58 L174 58 Z" fill="#ffd94a"/><path d="M174 20 L210 58 L174 98 L138 58 Z" fill="none" ${ink(3.5)}/><path d="M174 20 L174 98 M138 58 L210 58" ${ink(2.5)}/><path d="M174 98 q-10 18 4 30 q14 12 0 30" fill="none" ${ink(2.5)}/><path d="M168 118 l12 -6 l0 12 Z M168 146 l12 -6 l0 12 Z" fill="#8fd0ff" ${ink(2)}/></g>`));
    for (let i = 0; i < 6; i++) A(K, 'mvx-b-wline', '', `top:${px(G.bb + 14 + i * 22)};animation-delay:${K.s(t(0.15) + i * 160)}`);
    K.word('ふわ〜', 12, G.bb + 30, t(0.16), '#8fd0ff', 24, -8);
    K.word('ゆ〜らゆら', G.sw - 140, G.bb + 70, t(0.5), '#ff9fbb', 22, 8);
  });

  def('umbrella', 'umbrella', 3200, (K, G, ms, t) => {
    for (let i = 0; i < 7; i++) A(K, 'mvx-b-floaty', leaf(pick(['#8fe8c8', '#ffd94a', '#ff9fbb'])), `left:${px(rnd(10, G.sw - 30))};top:${px(rnd(G.bb, G.sh - 40))};width:${rnd(16, 24).toFixed(0)}px;animation-delay:${K.s(t(0.2) + rnd(0, 900))}`);
    K.word('ふわ〜り', 12, G.bb + 20, t(0.26), '#c9a7ff', 24, -8);
    K.word('すとん', G.sw - 100, G.bb + 70, t(0.84), '#ffd94a', 24, 8);
    K.puffs(G.cx, ground(G), 5, t(0.84), 50);
  });

  def('parachute', 'banzai', 3400, (K, G, ms, t) => {
    const cols = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#ffa95e'];
    let segs = '', strings = '';
    for (let i = 0; i < 5; i++) {
      const x0 = 12 + i * 43.2, x1 = x0 + 43.2;
      strings += `<path d="M${x0} 78 L120 156" ${ink(1.8)}/>`;
      segs += `<path d="M${x0} 78 Q${(x0 + x1) / 2} 64 ${x1} 78" fill="none" ${ink(3)}/>`;
    }
    const dome = 'M12 78 C 14 6, 226 6, 228 78';
    let fills = '';
    for (let i = 0; i < 5; i++) fills += `<rect x="${12 + i * 43.2}" y="0" width="43.6" height="80" fill="${cols[i]}" clip-path="url(#mvbChuteClip)"/>`;
    B(K, 'mvx-b-chute', sv('0 0 240 160', `<defs><clipPath id="mvbChuteClip"><path d="${dome} Z"/></clipPath></defs>${strings}<path d="M228 78 L120 156" ${ink(1.8)}/>${fills}<path d="${dome}" fill="none" ${ink(3.5)}/><path d="M12 78 L228 78" fill="none" ${ink(3)}/>${segs}<path d="M55 78 Q70 20 120 14 M185 78 Q170 20 120 14 M98 78 Q100 30 120 14 M142 78 Q140 30 120 14" fill="none" ${ink(2.2)}/>`));
    K.word('バサッ', G.sw - 100, G.bb + 20, t(0.18), '#ffd94a', 26, 8);
    K.word('ふわふわ', 12, G.bb + 60, t(0.46), '#8fd0ff', 22, -6);
    K.word('着地!', G.cx - 30, G.bb + 10, t(0.82), '#ff9fbb', 28, -6);
    K.puffs(G.cx, ground(G), 6, t(0.8), 60);
  });

  def('bungee', 'jump', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-cord', '');
    K.word('びよーん!', 12, G.bb + 30, t(0.28), '#ff9fbb', 26, -8);
    K.word('びよんびよん', G.sw - 150, G.bb + 66, t(0.5), '#ffd94a', 22, 8);
    K.word('ぶらーん', 16, G.bb + 70, t(0.76), '#8fe8c8', 20, -4);
  });

  def('zipline', 'banzai', 2800, (K, G, ms, t) => {
    const W = G.sw, H = G.sh, y0 = G.bb + 12, y1 = G.y + G.h * 0.62;
    const ropeY = (x) => y0 + ((y1 - y0) * x) / W;
    A(K, 'mvx-b-zrope', `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="M-4 ${ropeY(-4)} L${W + 4} ${ropeY(W + 4)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-4 ${ropeY(-4)} L${W + 4} ${ropeY(W + 4)}" stroke="#f1d9a0" stroke-width="2.5" stroke-dasharray="6 4"/></svg>`, 'left:0;top:0');
    const zx0 = -(G.cx + G.w * 0.55), zx1 = W - G.cx + G.w * 0.55, off = G.h * 0.09;
    bv({ '--zx0': px(zx0), '--zy0': px(ropeY(G.cx + zx0) - G.y - off), '--zx1': px(zx1), '--zy1': px(ropeY(G.cx + zx1) - G.y - off), '--za': ((Math.atan2(y1 - y0, W) * 180) / Math.PI).toFixed(1) + 'deg' }, ms);
    B(K, 'mvx-b-pulley', sv('0 0 60 50', `<path d="M10 40 L50 40 M30 40 L30 16" ${ink(5)}/><circle cx="30" cy="12" r="10" fill="#ffd94a" ${ink(3.5)}/><circle cx="30" cy="12" r="3" fill="${INK}"/>`));
    for (let i = 0; i < 6; i++) A(K, 'mvx-b-wline', '', `top:${px(G.bb + 30 + i * 20)};animation-delay:${K.s(t(0.12) + i * 120)}`);
    K.word('シャーーッ', G.sw - 140, G.bb + 70, t(0.3), '#8fd0ff', 24, 8);
    K.word('ひゅーん', 12, G.bb + 80, t(0.5), '#ffd94a', 22, -6);
    K.puffs(G.cx, ground(G), 5, t(0.9), 50);
  });

  def('seesaw', 'upright', 3200, (K, G, ms, t) => {
    const gy = ground(G) - 2, fx = G.cx + 52;
    A(K, 'mvx-b-fulcrum', sv('0 0 40 30', `<path d="M20 2 L38 28 L2 28 Z" fill="#c9a7ff" ${ink(3.5)}/>`), `left:${px(fx - 20)};top:${px(gy - 28)};width:40px`);
    A(K, 'mvx-b-plank', '', `left:${px(fx - 100)};top:${px(gy - 32)};width:200px`);
    A(K, 'mvx-b-weight', sv('0 0 60 50', `<path d="M22 12 Q30 0 38 12" fill="none" ${ink(4)}/><path d="M14 12 L46 12 L56 48 L4 48 Z" fill="#5a5f73" ${ink(3.5)}/><text x="30" y="40" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="sans-serif">10t</text>`), `left:${px(fx + 100 - 52)};top:${px(gy - 6 - 42)};width:50px`);
    K.puffs(fx + 70, gy, 5, t(0.3), 30);
    K.puffs(G.cx, gy, 5, t(0.74), 40);
    K.word('ドスン!', G.sw - 110, G.bb + 40, t(0.3), '#ffa95e', 28, 8);
    K.word('ぴゅーん', 12, G.bb + 20, t(0.38), '#8fd0ff', 24, -8);
    K.word('ばったん', 14, G.bb + 70, t(0.74), '#ffd94a', 24, -6);
  });

  def('buranko', 'kira', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-swing', '<b></b>');
    K.word('それ〜', 12, G.bb + 30, t(0.2), '#ffd94a', 24, -8);
    K.word('たかーい', G.sw - 110, G.bb + 60, t(0.5), '#8fd0ff', 24, 8);
    K.word('たのし〜', 14, G.bb + 70, t(0.72), '#ff9fbb', 22, -6);
  });

  def('suberidai', 'banzai', 3000, (K, G, ms, t) => {
    const W = G.sw, H = G.sh, gy = ground(G);
    const T = { x: Math.max(34, W * 0.12), y: G.bb + 40 }, Bt = { x: G.cx - 10, y: gy - 16 };
    const d = `M${T.x} ${T.y} C ${T.x + (Bt.x - T.x) * 0.45} ${T.y + 6}, ${T.x + (Bt.x - T.x) * 0.55} ${Bt.y}, ${Bt.x} ${Bt.y} L${Bt.x + 26} ${Bt.y - 4}`;
    let rungs = '';
    for (let y = T.y + 16; y < gy - 6; y += 20) rungs += `M${T.x - 26} ${y} L${T.x - 4} ${y} `;
    A(K, 'mvx-b-slide', `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="M${T.x - 26} ${T.y - 4} L${T.x - 26} ${gy} M${T.x - 4} ${T.y - 4} L${T.x - 4} ${gy}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="${rungs}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="${rungs}" stroke="#8fd0ff" stroke-width="3" stroke-linecap="round"/><path d="M${T.x - 30} ${T.y} L${T.x + 8} ${T.y}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ff9fbb" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="14 18" opacity=".8"/></svg>`, 'left:0;top:0');
    const ang = (Math.atan2(Bt.y - T.y, Bt.x - T.x) * 180) / Math.PI;
    bv({ '--tx': px(T.x + 10 - G.cx), '--ty': px(T.y - gy + 4), '--ta': (ang * 0.7).toFixed(1) + 'deg' }, ms);
    K.word('わーい', 12, G.bb + 70, t(0.2), '#ffd94a', 22, -6);
    K.word('シューッ', G.sw - 120, G.bb + 40, t(0.4), '#ff9fbb', 26, 8);
    K.puffs(G.cx + 20, gy, 5, t(0.72), 40);
  });

  def('tumble', 'curl', 2800, (K, G, ms, t) => {
    K.puffs(G.cx + G.w * 0.4, ground(G), 4, t(0.44), 40);
    K.puffs(G.cx, ground(G), 4, t(0.78), 40);
    K.word('くるん', G.sw - 100, G.bb + 40, t(0.24), '#8fe8c8', 24, 8);
    K.word('くるりん', 12, G.bb + 50, t(0.6), '#ff9fbb', 24, -8);
    K.word('ぴたっ', G.cx - 30, G.bb + 8, t(0.82), '#ffd94a', 24, -4);
  });

  // ======================= 気持ち・ねこらしさ =======================
  def('blush', 'tere', 2800, (K, G, ms, t) => {
    const h = headOf('tere'), cx = h.x, cy = h.y + 36;
    B(K, 'mvx-b-ov mvx-b-red', sv('0 0 240 200', `<ellipse class="face" cx="${cx}" cy="${cy}" rx="52" ry="36" fill="#ff6b6b"/><g class="ck"><ellipse cx="${cx - 30}" cy="${cy + 14}" rx="12" ry="7" fill="#ff6b6b"/><ellipse cx="${cx + 30}" cy="${cy + 14}" rx="12" ry="7" fill="#ff6b6b"/><path d="M${cx - 38} ${cy + 18} l5 -8 M${cx - 31} ${cy + 18} l5 -8 M${cx - 24} ${cy + 18} l5 -8 M${cx + 22} ${cy + 18} l5 -8 M${cx + 29} ${cy + 18} l5 -8 M${cx + 36} ${cy + 18} l5 -8" ${ink(2)}/></g>`));
    for (let i = 0; i < 3; i++) B(K, 'mvx-b-steam', sv('0 0 20 50', `<path d="M10 48 C 0 38, 20 30, 10 20 C 2 12, 16 6, 10 2" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M10 48 C 0 38, 20 30, 10 20 C 2 12, 16 6, 10 2" fill="none" ${ink(2)}/>`), `left:${pc((cx - 36 + i * 30) / 240)};top:${pc((h.y - 40) / 200)};animation-delay:${K.s(t(0.3) + i * 220)}`);
    K.word('ポッ', G.sw - 90, G.bb + 30, t(0.1), '#ff6b6b', 30, 8);
    K.word('もじもじ', 12, G.bb + 60, t(0.4), '#ff9fbb', 22, -6);
    K.word('ぷしゅ〜', G.sw - 120, G.bb + 74, t(0.68), '#fff', 22, 6);
  });

  def('surprise', 'upright', 2400, (K, G, ms, t) => {
    let fur = '';
    for (let i = 0; i < 30; i++) {
      const a = (Math.PI * 2 * i) / 30, c = Math.cos(a), s = Math.sin(a);
      const x0 = 122 + c * 62, y0 = 108 + s * 88, len = 10 + (i % 3) * 5;
      fur += `M${x0.toFixed(1)} ${y0.toFixed(1)} l${(c * len).toFixed(1)} ${(s * len).toFixed(1)} `;
    }
    B(K, 'mvx-b-ov mvx-b-fur', sv('0 0 240 200', `<path d="${fur}" fill="none" ${ink(3.5)}/>`));
    K.word('ビクッ!!', 12, G.bb + 10, t(0.14), '#ff6b6b', 30, -8);
    K.word('!!', G.sw - 70, G.bb + 40, t(0.18), '#ffd94a', 40, 10);
    K.puffs(G.cx, ground(G), 6, t(0.64), 60);
  });

  def('bigyawn', 'yawn', 3200, (K, G, ms, t) => {
    const h = headOf('yawn');
    const mx = G.x + ((h.x - 8) / 240) * G.w, my = G.y + ((h.y + 54) / 200) * G.h;
    A(K, 'mvx-b-vortex', sv('0 0 100 100', `<path d="M50 50 m0 -4 a4 4 0 1 1 -4 4 a10 10 0 1 1 10 10 a18 18 0 1 1 -18 -18 a28 28 0 1 1 28 28 a40 40 0 1 1 -40 -40" fill="none" stroke="#c9a7ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 8"/>`), `left:${px(mx - 60)};top:${px(my - 60)};width:120px`);
    const chars = ['✦', '♪', '★', '?', 'z', '…', '✿', '♥'];
    for (let i = 0; i < 18; i++) {
      const a = rnd(0, Math.PI * 2), r = rnd(80, 170);
      const x = Math.min(Math.max(mx + Math.cos(a) * r, 10), G.sw - 24), y = Math.min(Math.max(my + Math.sin(a) * r * 0.7, G.bb + 4), G.sh - 24);
      A(K, 'mvx-b-suck', i % 4 === 3 ? leaf(pick(['#8fe8c8', '#ffd94a'])) : chars[i % chars.length], `left:${px(x)};top:${px(y)};--tx:${px(mx - x)};--ty:${px(my - y)};color:${pick(['#ffd94a', '#ff9fbb', '#8fd0ff', '#8fe8c8', '#c9a7ff'])};animation-delay:${K.s(t(0.22) + rnd(0, t(0.3)))}`);
    }
    K.word('ふぁ〜〜〜', 12, G.bb + 10, t(0.16), '#c9a7ff', 26, -6);
    K.word('むにゃ…', G.sw - 100, G.bb + 70, t(0.8), '#8fd0ff', 20, 6);
  });

  def('shed', 'stare', 3200, (K, G, ms, t) => {
    let rays = '';
    for (let k = 0; k < 8; k++) { const a = (Math.PI * k) / 4; rays += `M15 15 L${(15 + Math.cos(a) * 13).toFixed(1)} ${(15 + Math.sin(a) * 13).toFixed(1)} `; }
    const fl = sv('0 0 30 30', `<path d="${rays}" stroke="#7d8296" stroke-width="1.6" stroke-linecap="round"/><circle cx="15" cy="15" r="6" fill="#fffdf8" ${ink(2)}/>`);
    for (let i = 0; i < 22; i++) A(K, 'mvx-b-fluff', fl, `left:${px(G.x + G.w * rnd(0.25, 0.72))};top:${px(G.y + G.h * rnd(0.15, 0.85))};width:${rnd(16, 26).toFixed(0)}px;--dx:${rnd(-110, 110).toFixed(0)}px;--dy:${rnd(-160, -50).toFixed(0)}px;animation-delay:${K.s(t(0.12) + rnd(0, t(0.4)))}`);
    K.word('ぶるぶるっ', 12, G.bb + 20, t(0.08), '#8fd0ff', 24, -8);
    K.word('ふわ〜', G.sw - 90, G.bb + 60, t(0.42), '#fff', 24, 8);
    K.word('ほっそり?', G.cx - 50, G.bb + 8, t(0.72), '#ff9fbb', 22, -4);
  });

  def('licklick', 'groom', 2400, (K, G, ms, t) => {
    B(K, 'mvx-b-ov mvx-b-licks', sv('0 0 240 200', `<path d="M156 112 q10 -6 18 0 M158 126 q12 -4 20 4 M156 98 q8 -8 16 -6" fill="none" ${ink(2.6)}/>`));
    B(K, 'mvx-b-shine', '<i></i>');
    K.stars(10, 700, catArea(G, 0.25, 0.75, 0.2, 0.8));
    K.word('ペロペロペロ', 12, G.bb + 20, t(0.06), '#ff9fbb', 22, -8);
    K.word('ピカピカ!', G.sw - 120, G.bb + 60, t(0.76), '#ffd94a', 26, 8);
  });

  def('zoomies', 'hunt', 3400, (K, G, ms, t) => {
    const s = 0.55, hw = (G.w * s) / 2, hh = (G.h * s) / 2, m = 4, gy = ground(G);
    bv({
      '--zb': px(gy - G.cy - hh - m), '--zbw': px(gy - G.cy - hw - m), '--zt': px(m + hh - G.cy), '--ztw': px(m + hw - G.cy),
      '--zl': px(m + hw - G.cx), '--zlw': px(m + hh - G.cx), '--zr': px(G.sw - m - hw - G.cx), '--zrw': px(G.sw - m - hh - G.cx),
    }, ms);
    K.dark('#1d1f4a', 0.6, 0.06, 0.9);
    K.stars(10, 2600, [5, 95, 5, 60], ['✦', '✧']);
    K.word('ドドドド', 12, G.bb + 30, t(0.12), '#ffd94a', 24, -8);
    K.word('夜の運動会!', G.sw - 150, G.bb + 70, t(0.5), '#8fe8c8', 22, 6);
  });

  def('kneading', 'blink', 3000, (K, G, ms, t) => {
    const w = G.w * 1.15;
    A(K, 'mvx-b-cushion', sv('0 0 200 56', `<path d="M10 20 Q8 6 24 6 L176 6 Q192 6 190 20 L192 42 Q192 52 176 52 L24 52 Q8 52 8 42 Z" fill="#ffc9d8" ${ink(3.5)}/><path d="M24 6 L18 0 M176 6 L182 0 M24 52 L18 56 M176 52 L182 56" ${ink(3)}/><ellipse class="d1" cx="78" cy="18" rx="16" ry="5" fill="#f2a7bc"/><ellipse class="d2" cx="122" cy="18" rx="16" ry="5" fill="#f2a7bc"/><circle cx="50" cy="32" r="3" fill="${INK}"/><circle cx="100" cy="36" r="3" fill="${INK}"/><circle cx="150" cy="32" r="3" fill="${INK}"/>`, ' preserveAspectRatio="none"'), `left:${px(G.cx - w / 2)};width:${px(w)};top:${px(G.y + G.h * 0.8)};height:${px(G.h * 0.28)}`);
    [0.14, 0.4, 0.66].forEach((f, i) => K.word('ふみ', i % 2 ? G.sw - 70 : 16, G.bb + 30 + i * 18, t(f), '#ff9fbb', 22, i % 2 ? 8 : -8));
    for (let i = 0; i < 6; i++) A(K, 'mvx-b-heart', heartSvg(pick(['#ff9fbb', '#ff6b6b'])), `left:${px(G.cx + rnd(-50, 40))};top:${px(G.y + G.h * 0.2)};width:${rnd(16, 24).toFixed(0)}px;animation-delay:${K.s(t(0.2) + i * 300)}`);
    K.word('ふかふか', G.cx - 40, G.bb + 6, t(0.82), '#ffd94a', 22, -4);
  });

  def('loafslide', 'loaf', 2800, (K, G, ms, t) => {
    A(K, 'mvx-b-ice', '', `left:${px(G.sw * 0.04)};width:${px(G.sw * 0.92)};top:${px(ground(G) - 12)}`);
    B(K, 'mvx-b-broom', sv('0 0 60 100', `<path d="M40 4 L26 66" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M40 4 L26 66" stroke="#c97a3a" stroke-width="4" stroke-linecap="round"/><path d="M14 64 L40 70 L44 98 L2 90 Z" fill="#ffd94a" ${ink(3)}/><path d="M12 76 L8 90 M22 78 L18 92 M32 80 L30 94" ${ink(2)}/>`));
    K.word('シャーーッ', G.sw - 140, G.bb + 30, t(0.16), '#8fd0ff', 24, 8);
    K.word('スイープ!', 12, G.bb + 60, t(0.5), '#ffd94a', 24, -8);
    K.word('すべすべ', G.cx - 40, G.bb + 8, t(0.84), '#c9a7ff', 20, -4);
  });

  def('pour', 'stare', 3400, (K, G, ms, t) => {
    const gw = 64, gh = 84, gx = G.sw - gw - 12, gy = ground(G) - gh - 2;
    A(K, 'mvx-b-glass', sv('0 0 64 84', `<defs><clipPath id="mvbGlassClip"><path d="M6 4 L58 4 L52 80 L12 80 Z"/></clipPath></defs><path d="M6 4 L58 4 L52 80 L12 80 Z" fill="#e6f5ff" opacity=".85"/><g clip-path="url(#mvbGlassClip)"><g class="liq"><rect x="-2" y="-4" width="68" height="100" fill="#fffdf8" ${ink(3)}/><path d="M22 6 q3 3 6 0 M36 6 q3 3 6 0" fill="none" ${ink(2.2)}/><path d="M30 12 q2 2 4 0" fill="none" ${ink(2)}/><ellipse cx="18" cy="12" rx="4" ry="2.5" fill="#ff9fbb"/><ellipse cx="46" cy="12" rx="4" ry="2.5" fill="#ff9fbb"/></g></g><g class="ears"><path d="M14 0 L18 -12 L26 -2 Z M50 0 L46 -12 L38 -2 Z" fill="#fffdf8" ${ink(2.5)}/></g><path d="M6 4 L58 4 L52 80 L12 80 Z" fill="none" ${ink(3.5)}/><path d="M48 12 L45 60" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`), `left:${px(gx)};top:${px(gy)};width:${gw}px`);
    A(K, 'mvx-b-stream', '', `left:${px(gx + gw / 2 - 8)};top:${px(G.bb + 4)};height:${px(gy + 30 - G.bb - 4)}`);
    bv({ '--gx': px(gx + gw / 2 - G.cx) }, ms);
    K.word('とぽぽぽ…', 12, G.bb + 30, t(0.24), '#8fd0ff', 22, -6);
    K.word('ねこは液体', 12, G.bb + 70, t(0.56), '#fff', 22, -4);
    K.word('ぷはっ', G.cx - 40, G.bb + 10, t(0.78), '#ffd94a', 26, 6);
  });

  def('bread', 'shokupan', 3200, (K, G, ms, t) => {
    A(K, 'mvx-b-glow', '', `left:${px(G.cx)};top:${px(G.y + G.h * 0.62)}`);
    for (let i = 0; i < 4; i++) A(K, 'mvx-b-heat', sv('0 0 16 50', `<path d="M8 48 C 0 40, 16 32, 8 24 C 0 16, 16 8, 8 2" fill="none" stroke="#ffa95e" stroke-width="3.5" stroke-linecap="round"/>`), `left:${px(G.x + G.w * (0.18 + i * 0.2))};top:${px(G.y + G.h * 0.45)};animation-delay:${K.s(t(0.14) + i * 180)}`);
    K.word('じりじり…', 12, G.bb + 30, t(0.14), '#ffa95e', 22, -6);
    K.word('チン!', G.sw - 90, G.bb + 20, t(0.68), '#ffd94a', 34, 10);
    K.burst(G.cx, G.y + G.h * 0.4, t(0.68), 12, 80, ['#ffd94a', '#fff', '#ffa95e']);
    K.puffs(G.cx, G.y + G.h * 0.2, 5, t(0.7), 50);
    K.word('ふっくら', 14, G.bb + 70, t(0.8), '#fff', 22, -4);
  });

  def('mochi', 'omochi', 3000, (K, G, ms, t) => {
    const h = headOf('omochi');
    B(K, 'mvx-b-puku', sv('0 0 60 50', `<path d="M8 46 C 0 20, 20 2, 30 2 C 40 2, 60 20, 52 46 Z" fill="#fffdf8" ${ink(3.5)}/><path d="M20 14 Q26 8 32 10" fill="none" stroke="#d6d8e4" stroke-width="3" stroke-linecap="round"/>`), `left:${pc((h.x + 6) / 240)};top:${pc((h.y - 14) / 200)}`);
    K.word('のび〜る', 12, G.bb + 30, t(0.16), '#fff', 26, -6);
    K.word('ぷくっ', G.sw - 90, G.bb + 40, t(0.6), '#ffd94a', 24, 8);
    K.word('ぱちん', G.cx - 30, G.bb + 10, t(0.8), '#ff9fbb', 26, -6);
    K.burst(G.x + ((h.x + 24) / 240) * G.w, G.y + ((h.y + 4) / 200) * G.h, t(0.8), 10, 50, ['#fff', '#fffdf8', '#f1d9a0']);
  });

  def('dango3', 'dango', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-ov mvx-b-dango', sv('0 0 240 200', `<path d="M120 4 L120 198" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M120 4 L120 198" stroke="#f1d9a0" stroke-width="4.5" stroke-linecap="round"/>` +
      [[160, '#a8e0a0', 'd3'], [104, '#fffdf8', 'd2'], [48, '#ffb7cc', 'd1']].map(([cy, c, k]) => `<g class="dg ${k}">${ballFace(120, cy, 27, c)}</g>`).join('')));
    K.word('ぽん', G.sw - 80, G.bb + 70, t(0.14), '#a8e0a0', 22, 8);
    K.word('ぽん', G.sw - 80, G.bb + 40, t(0.22), '#fff', 22, 8);
    K.word('ぽんっ!', G.sw - 90, G.bb + 10, t(0.3), '#ff9fbb', 24, 8);
    K.word('もちもち', 12, G.bb + 50, t(0.56), '#ffd94a', 22, -6);
    K.puffs(G.cx, G.y + G.h * 0.5, 6, t(0.84), 50);
  });

  def('tsuru', 'origami', 3400, (K, G, ms, t) => {
    A(K, 'mvx-b-crane', `<div class="cr">${sv('0 0 100 80', `<g class="wl"><path d="M50 44 L18 6 L60 38 Z" fill="#ffc4d6" ${ink(3)}/></g><path d="M8 30 L22 40 L50 44 L80 40 L96 18 L86 44 L60 58 L36 56 Z" fill="#ff9fbb" ${ink(3)}/><path d="M8 30 L4 38 L14 36 Z" fill="#ff9fbb" ${ink(2.5)}/><path d="M36 56 L50 44 L60 58" fill="none" ${ink(2)}/><g class="wr"><path d="M54 44 L84 2 L46 40 Z" fill="#ffd8e4" ${ink(3)}/></g>`)}</div>`, `left:${px(G.cx - 45)};top:${px(G.y + G.h * 0.35)};width:90px`);
    K.puffs(G.cx, G.cy, 4, t(0.12), 40);
    K.puffs(G.cx, G.cy, 5, t(0.84), 50);
    K.word('パタン', 12, G.bb + 70, t(0.1), '#ff9fbb', 22, -6);
    K.word('パタパタ', G.sw - 110, G.bb + 70, t(0.42), '#fff', 22, 6);
    K.word('ひらり', 14, G.bb + 20, t(0.66), '#ffd94a', 22, -6);
  });

  def('cloud', 'kumo', 3400, (K, G, ms, t) => {
    const w = G.w * 0.9;
    let drops = '';
    for (let i = 0; i < 5; i++) drops += `<i style="left:${18 + i * 15}%;animation-delay:${(i * 0.17).toFixed(2)}s"></i>`;
    A(K, 'mvx-b-cloudcat', `<div class="cc">${sv('0 0 200 120', `<path d="M58 34 L66 6 L84 26 Z M142 34 L134 6 L116 26 Z" fill="#fff" ${ink(3.5)}/><path d="M30 96 C 6 96 4 64 28 60 C 26 34 58 22 76 36 C 86 16 120 14 132 34 C 152 22 182 36 174 62 C 198 66 196 98 170 98 Z" fill="#fff" ${ink(3.5)}/><path d="M80 66 q8 6 16 0 M106 66 q8 6 16 0" fill="none" ${ink(3)}/><path d="M96 78 q5 5 10 0" fill="none" ${ink(2.5)}/><ellipse cx="72" cy="78" rx="7" ry="4" fill="#ff9fbb" opacity=".7"/><ellipse cx="130" cy="78" rx="7" ry="4" fill="#ff9fbb" opacity=".7"/>`)}</div><div class="rn">${drops}</div>`, `left:${px(G.cx - w / 2)};top:${px(G.y + G.h * 0.2)};width:${px(w)}`);
    K.puffs(G.cx, G.cy, 6, t(0.06), 50);
    K.puffs(G.cx, G.cy, 6, t(0.84), 50);
    K.word('もくもく', 12, G.bb + 20, t(0.08), '#fff', 22, -6);
    K.word('ぷか〜', G.sw - 90, G.bb + 70, t(0.3), '#8fd0ff', 24, 8);
    K.word('ぽつぽつ', 14, G.bb + 70, t(0.6), '#8fd0ff', 20, -6);
  });

  def('snowman', 'yukidaruma', 3400, (K, G, ms, t) => {
    K.rain(16, '<i class="mvx-b-flake"></i>', { delayMax: 2200, dur: [1600, 2600], size: [8, 14], cls: 'mvx-b' });
    B(K, 'mvx-b-ov mvx-b-snowman', sv('0 0 240 200', `<g class="s1"><circle cx="120" cy="158" r="40" fill="#fbfdff" ${ink(3.5)}/><path d="M96 146 q10 -6 20 0" fill="none" stroke="#cfe3f5" stroke-width="3"/></g>` +
      `<g class="s2"><circle cx="120" cy="100" r="28" fill="#fbfdff" ${ink(3.5)}/><circle cx="120" cy="94" r="3" fill="${INK}"/><circle cx="120" cy="106" r="3" fill="${INK}"/></g>` +
      `<g class="s5"><path d="M94 96 L62 76 M70 81 L64 70 M146 96 L178 76 M170 81 L176 70" stroke="#8a5a32" stroke-width="4.5" stroke-linecap="round"/></g>` +
      `<g class="s3"><path d="M100 46 L104 22 L116 36 Z M140 46 L136 22 L124 36 Z" fill="#fbfdff" ${ink(3)}/><circle cx="120" cy="54" r="24" fill="#fbfdff" ${ink(3.5)}/><circle cx="111" cy="50" r="3.2" fill="${INK}"/><circle cx="129" cy="50" r="3.2" fill="${INK}"/><path d="M120 56 L138 60 L120 62 Z" fill="#ffa95e" ${ink(2)}/><path d="M112 66 q8 4 16 0" fill="none" ${ink(2.2)}/></g>` +
      `<g class="s4"><path d="M104 32 L108 12 L132 12 L136 32 Z" fill="#8fd0ff" ${ink(3)}/></g>`));
    K.word('ころころ', 12, G.bb + 60, t(0.12), '#8fd0ff', 22, -6);
    K.word('どすっ', G.sw - 90, G.bb + 50, t(0.36), '#fff', 24, 8);
    K.word('できた!', G.cx - 40, G.bb + 8, t(0.6), '#ffd94a', 26, -6);
    K.puffs(G.cx, G.cy, 7, t(0.84), 60);
  });

  def('pumpkin', 'kabocha', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-pump', sv('0 0 200 150', `<path d="M100 26 Q98 8 110 2" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M100 26 Q98 8 110 2" fill="none" stroke="#6fbf5a" stroke-width="6" stroke-linecap="round"/><ellipse cx="100" cy="86" rx="92" ry="60" fill="#ffa95e"/><path d="M100 28 Q70 86 100 146 M100 28 Q130 86 100 146 M58 34 Q30 86 58 140 M142 34 Q170 86 142 140" fill="none" stroke="#e07f30" stroke-width="3"/><ellipse cx="100" cy="86" rx="92" ry="60" fill="none" ${ink(4)}/><path d="M56 70 L74 50 L86 74 Z M144 70 L126 50 L114 74 Z" fill="#ffd94a" ${ink(3)}/><path d="M52 98 L66 112 L80 100 L94 116 L106 100 L120 116 L134 100 L148 110 L146 96 Q100 126 54 94 Z" fill="#ffd94a" ${ink(3)}/>`));
    for (let i = 0; i < 2; i++) A(K, 'mvx-b-bat', sv('0 0 60 30', `<path d="M30 12 C 22 0, 8 2, 2 10 C 8 10, 10 16, 14 18 C 18 14, 22 18, 26 22 L30 18 L34 22 C 38 18, 42 14, 46 18 C 50 16, 52 10, 58 10 C 52 2, 38 0, 30 12 Z" fill="#5a4a7a" ${ink(2.5)}/><circle cx="27" cy="13" r="1.6" fill="#ffd94a"/><circle cx="33" cy="13" r="1.6" fill="#ffd94a"/>`), `top:${px(G.bb + 14 + i * 40)};animation-delay:${K.s(t(0.18) + i * 500)}`);
    K.word('ずぼっ', G.sw - 90, G.bb + 30, t(0.14), '#ffa95e', 26, 8);
    K.word('ごろごろ', 12, G.bb + 60, t(0.36), '#ffd94a', 22, -6);
    K.word('ばあ!', G.cx - 30, G.bb + 8, t(0.84), '#ff9fbb', 30, -6);
  });

  def('teapot', 'kira', 3000, (K, G, ms, t) => {
    B(K, 'mvx-b-pot', sv('0 0 200 140', `<path d="M40 76 Q2 64 6 34 Q8 26 14 32 Q14 58 44 66" fill="#8fd0ff" ${ink(3.5)}/><path d="M158 60 Q196 54 192 92 Q188 118 156 112" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M158 60 Q196 54 192 92 Q188 118 156 112" fill="none" stroke="#8fd0ff" stroke-width="5" stroke-linecap="round"/><path d="M34 70 Q34 40 100 38 Q166 40 166 70 L162 112 Q158 136 100 136 Q42 136 38 112 Z" fill="#e8f6ff" ${ink(4)}/><path d="M50 88 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0 q10 -8 20 0" fill="none" stroke="#8fd0ff" stroke-width="5" stroke-linecap="round"/><circle cx="76" cy="112" r="6" fill="#ff9fbb"/><circle cx="124" cy="112" r="6" fill="#ff9fbb"/><g class="lid"><path d="M58 40 Q100 14 142 40 Z" fill="#8fd0ff" ${ink(3.5)}/><circle cx="100" cy="20" r="8" fill="#ffd94a" ${ink(3)}/></g>`));
    K.puffs(G.cx, G.y + G.h * 0.4, 3, t(0.2), 30);
    K.puffs(G.cx, G.y + G.h * 0.4, 3, t(0.3), 30);
    K.word('カタカタ', 12, G.bb + 40, t(0.2), '#8fd0ff', 22, -6);
    K.word('ポンッ', G.sw - 90, G.bb + 20, t(0.38), '#ffd94a', 28, 8);
    K.word('にょきっ', 14, G.bb + 70, t(0.5), '#8fe8c8', 22, -6);
  });

  def('jackbox', 'nyaa', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-spring', sv('0 0 30 100', `<path d="M15 100 L28 92 L2 80 L28 68 L2 56 L28 44 L2 32 L28 20 L2 8 L15 0" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="M15 100 L28 92 L2 80 L28 68 L2 56 L28 44 L2 32 L28 20 L2 8 L15 0" fill="none" stroke="#ffd94a" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`, ' preserveAspectRatio="none"'));
    B(K, 'mvx-b-jbox', `<i class="lid"></i><b class="crank">${sv('0 0 40 40', `<path d="M8 20 L32 20 L32 34" fill="none" ${ink(5)}/><circle cx="32" cy="36" r="5" fill="#ff6b6b" ${ink(2.5)}/><circle cx="8" cy="20" r="5" fill="#ffd94a" ${ink(2.5)}/>`)}</b>`);
    for (let i = 0; i < 3; i++) A(K, 'mvx-b-note', '♪', `left:${px(G.cx + 40 + i * 14)};top:${px(G.y + G.h * 0.4)};animation-delay:${K.s(t(0.08) + i * 300)}`);
    K.word('クルクル…', 12, G.bb + 40, t(0.08), '#c9a7ff', 22, -6);
    K.word('ビヨヨーン!', G.sw - 150, G.bb + 60, t(0.4), '#ffd94a', 26, 8);
    K.word('ばあ!', 14, G.bb + 70, t(0.6), '#ff9fbb', 26, -6);
  });

  def('drawer', 'kira', 3000, (K, G, ms, t) => {
    const cw = G.w * 0.82, ch = G.h * 0.82, cx = G.cx - cw / 2, cy = ground(G) - ch;
    A(K, 'mvx-b-chest', '<i></i><i></i><i></i>', `left:${px(cx)};top:${px(cy)};width:${px(cw)};height:${px(ch)}`);
    A(K, 'mvx-b-dfront', '<i></i>', `left:${px(cx + cw * 0.04)};top:${px(cy + ch * 0.36)};width:${px(cw * 0.92)};height:${px(ch * 0.29)}`);
    K.word('ガラッ', G.sw - 90, G.bb + 30, t(0.22), '#ffa95e', 26, 8);
    K.word('ちらっ', 12, G.bb + 50, t(0.36), '#8fd0ff', 22, -6);
    K.word('ばあ!', G.cx - 30, G.bb + 8, t(0.7), '#ff9fbb', 28, -6);
  });

  def('zipper', 'banzai', 3200, (K, G, ms, t) => {
    A(K, 'mvx-b-zip', '<div class="zw l"><div class="zh"></div></div><div class="zw r"><div class="zh"></div></div><i class="track"></i><b class="pull"></b>', `top:${px(G.bb + 6)}`);
    K.word('ジジジ…', 12, G.bb + 30, t(0.14), '#ffd94a', 24, -6);
    K.word('ジャーン!', G.sw - 140, G.bb + 50, t(0.5), '#ff9fbb', 28, 8);
  });

  def('eraser', 'stare', 3400, (K, G, ms, t) => {
    B(K, 'mvx-b-eraser', sv('0 0 80 50', `<rect x="4" y="6" width="72" height="38" rx="6" fill="#ffb7cc" ${ink(3.5)}/><rect x="30" y="4" width="44" height="42" rx="3" fill="#8fd0ff" ${ink(3.5)}/><path d="M38 18 h28 M38 28 h20" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`));
    B(K, 'mvx-b-pen2', sv('0 0 60 60', `<path d="M6 54 L14 38 L50 2 L58 10 L22 46 Z" fill="#ffd94a" ${ink(3)}/><path d="M6 54 L14 38 L22 46 Z" fill="#f1d9a0" ${ink(2.5)}/><path d="M6 54 L9 48 L12 51 Z" fill="${INK}"/>`));
    for (let i = 0; i < 14; i++) { const f = 0.1 + (i / 14) * 0.36; A(K, 'mvx-b-crumb', '', `left:${px(G.x + G.w * rnd(0.2, 0.8))};top:${px(G.y + G.h * ((f - 0.08) / 0.4) * 0.9)};animation-delay:${K.s(t(f))}`); }
    K.word('ゴシゴシ', 12, G.bb + 30, t(0.12), '#ff9fbb', 24, -6);
    K.word('あれ?', G.sw - 80, G.bb + 60, t(0.48), '#fff', 24, 8);
    K.word('かきかき…', 12, G.bb + 70, t(0.6), '#ffd94a', 22, -6);
  });

  def('pencil', 'peace', 3400, (K, G, ms, t) => {
    const p = $('catPose');
    if (p) p.querySelectorAll('path,ellipse,circle,rect,line,polyline,polygon').forEach((n) => n.setAttribute('pathLength', '100'));
    A(K, 'mvx-b-pbox', `<i>${sv('0 0 60 60', `<path d="M4 56 L10 40 L48 2 L58 12 L20 50 Z" fill="#ffd94a" ${ink(3)}/><path d="M48 2 L58 12 L54 16 L44 6 Z" fill="#ff9fbb" ${ink(2.5)}/><path d="M4 56 L10 40 L20 50 Z" fill="#f1d9a0" ${ink(2.5)}/><path d="M4 56 L7 49 L11 53 Z" fill="${INK}"/>`)}</i>`, `left:${px(G.x)};top:${px(G.y)};width:${px(G.w)};height:${px(G.h)}`);
    K.word('カキカキ', 12, G.bb + 30, t(0.14), '#ffd94a', 24, -6);
    K.word('かんせい!', G.sw - 130, G.bb + 50, t(0.7), '#ff9fbb', 26, 8);
    K.stars(8, 600, catArea(G, 0.05, 0.95, 0.1, 0.9));
  });

  def('footprints', 'tilt', 3400, (K, G, ms, t) => {
    const gy = ground(G);
    for (let i = 0; i < 11; i++) {
      const x = G.cx + 34 + i * 26, y = gy - 18 - (i % 2) * 12;
      if (x > G.sw - 4) break;
      A(K, 'mvx-b-print', paw(INK), `left:${px(x)};top:${px(y)};animation-delay:${K.s(t(0.04) + i * 200)}`);
    }
    K.word('てくてく…?', 12, G.bb + 20, t(0.1), '#fff', 22, -6);
    K.word('まってー!', G.sw - 120, G.bb + 60, t(0.46), '#ff9fbb', 24, 8);
    K.puffs(G.cx, gy, 5, t(0.46), 40);
  });

  def('echo', 'upright', 3000, (K, G, ms, t) => {
    const gy = ground(G), c = nowCat();
    [[0.5, G.x + G.w - 6, 0.75, '#d8ecff', 0.1], [0.32, G.x - G.w * 0.32 + 6, 0.55, '#e8ddff', 0.2]].forEach(([s, x, op, tint, d]) => {
      const w = G.w * s, h = G.h * s;
      A(K, 'mvx-b-echo', c, `left:${px(Math.min(Math.max(x, 2), G.sw - w - 2))};top:${px(gy - h)};width:${px(w)};--op:${op};--tint:${tint};animation-delay:calc(var(--mvd) * ${d}), 0s`);
    });
    K.word('やっほー!', G.cx - 50, G.bb + 6, t(0.04), '#ffd94a', 26, -6);
    K.word('やっほー…', G.sw - 110, G.bb + 40, t(0.28), '#d8ecff', 20, 6);
    K.word('ほー…', 14, G.bb + 70, t(0.52), '#e8ddff', 15, -4);
  });

  def('matryoshka', 'stare', 3600, (K, G, ms, t) => {
    const doll = (body, scarf) => sv('0 0 100 130', `<path d="M30 16 L34 2 L44 12 Z M70 16 L66 2 L56 12 Z" fill="${body}" ${ink(3)}/><path d="M50 6 C 74 6 82 26 78 46 C 92 62 96 96 88 116 Q 84 128 50 128 Q 16 128 12 116 C 4 96 8 62 22 46 C 18 26 26 6 50 6 Z" fill="${body}" ${ink(3.5)}/><ellipse cx="50" cy="36" rx="22" ry="20" fill="#fffdf8" ${ink(3)}/><path d="M40 34 q3 3 6 0 M54 34 q3 3 6 0" fill="none" ${ink(2.4)}/><path d="M47 42 q3 3 6 0" fill="none" ${ink(2)}/><circle cx="37" cy="42" r="3.5" fill="#ff9fbb"/><circle cx="63" cy="42" r="3.5" fill="#ff9fbb"/><path d="M14 64 Q50 70 86 64" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="50" cy="94" r="14" fill="${scarf}" ${ink(3)}/><circle cx="50" cy="94" r="5" fill="#ffd94a" ${ink(2)}/><path d="M28 86 q4 -6 8 0 M64 86 q4 -6 8 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`);
    const D = [[0.62, '#ff6b6b', '#ffd94a', 0.04], [0.45, '#8fd0ff', '#ff9fbb', 0.26], [0.3, '#8fe8c8', '#c9a7ff', 0.48]];
    D.forEach(([s, body, scarf, d]) => {
      const w = G.w * s, h = (w * 130) / 100;
      const style = `left:${px(G.w / 2 - w / 2)};top:${px(G.h - h)};width:${px(w)};animation-delay:calc(var(--mvd) * ${d})`;
      B(K, 'mvx-b-doll bot', doll(body, scarf), style);
      B(K, 'mvx-b-doll top', doll(body, scarf), style);
    });
    const tw = G.w * 0.24;
    B(K, 'mvx-b-tiny', mini('sit'), `left:${px(G.w / 2 - tw / 2)};top:${px(G.h - (tw * 200) / 240)};width:${px(tw)}`);
    K.word('パカッ', G.sw - 90, G.bb + 20, t(0.2), '#ff6b6b', 24, 8);
    K.word('パカッ', 12, G.bb + 40, t(0.42), '#8fd0ff', 22, -6);
    K.word('パカッ…!?', G.sw - 120, G.bb + 70, t(0.64), '#8fe8c8', 22, 8);
    K.word('ちいさ!', 14, G.bb + 10, t(0.76), '#ffd94a', 24, -6);
  });

  def('jenga', 'komari', 3400, (K, G, ms, t) => {
    let rows = '';
    for (let r = 0; r < 7; r++) {
      const y = 4 + r * 18;
      if (r % 2) rows += `<rect x="4" y="${y}" width="92" height="16" rx="2" fill="${r % 4 === 1 ? '#f1d9a0' : '#e8c58a'}" ${ink(2.5)}/>`;
      else for (let k = 0; k < 3; k++) if (!(r === 2 && k === 1) && !(r === 4 && k === 0)) rows += `<rect x="${4 + k * 31}" y="${y}" width="29" height="16" rx="2" fill="#f1d9a0" ${ink(2.5)}/>`;
    }
    B(K, 'mvx-b-jenga', sv('0 0 100 132', rows, ' preserveAspectRatio="none"'));
    const blk = sv('0 0 30 16', `<rect x="1" y="1" width="28" height="14" rx="2" fill="#ffd94a" ${ink(2.5)}/>`);
    B(K, 'mvx-b-jblk b1', blk); B(K, 'mvx-b-jblk b2', blk);
    const tx = G.x + G.w * 0.28, tw = G.w * 0.44, ty = ground(G) - G.h * 0.53;
    for (let i = 0; i < 9; i++) {
      const y0 = ty + rnd(0, G.h * 0.4);
      A(K, 'mvx-b-jfall', sv('0 0 30 16', `<rect x="1" y="1" width="28" height="14" rx="2" fill="${i % 2 ? '#f1d9a0' : '#e8c58a'}" ${ink(2.5)}/>`), `left:${px(tx + rnd(0, tw - 24))};top:${px(y0)};--dx:${rnd(-80, 80).toFixed(0)}px;--dy:${px(ground(G) - 14 - y0)};--rot:${rnd(-200, 200).toFixed(0)}deg;animation-delay:${K.s(t(0.72))}`);
    }
    K.word('そーっと…', 12, G.bb + 20, t(0.22), '#fff', 22, -6);
    K.word('ぐらぐら', G.sw - 110, G.bb + 50, t(0.5), '#ffa95e', 24, 8);
    K.word('ガラガラ!', 14, G.bb + 70, t(0.72), '#ffd94a', 26, -6);
    K.word('セーフ!', G.cx - 30, G.bb + 8, t(0.86), '#8fe8c8', 26, -4);
  });

  def('tetris', 'stare', 3400, (K, G, ms, t) => {
    const c = 18, gy = ground(G) - 4;
    const L = Math.max(4, G.x + 16 - 4 * c), R = Math.min(G.sw - 3 * c - 4, G.x + G.w - 16);
    const pieces = [
      { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], col: '#8fd0ff', x: L, d: 0.04 },
      { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], col: '#ffa95e', x: R, d: 0.18 },
      { cells: [[0, 1], [1, 1], [0, 2], [1, 2]], col: '#ffd94a', x: L, d: 0.32 },
      { cells: [[0, 1], [1, 1], [1, 2], [2, 2]], col: '#ff9fbb', x: R, d: 0.46 },
    ];
    pieces.forEach((p) => {
      const maxY = Math.max(...p.cells.map((q) => q[1])), maxX = Math.max(...p.cells.map((q) => q[0]));
      const w = (maxX + 1) * c, h = (maxY + 1) * c, top = gy - h;
      const rects = p.cells.map(([x, y]) => `<rect x="${x * c + 1.5}" y="${(maxY - y) * c + 1.5}" width="${c - 3}" height="${c - 3}" rx="3" fill="${p.col}" ${ink(2.5)}/><path d="M${x * c + 5} ${(maxY - y) * c + 6} h6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`).join('');
      A(K, 'mvx-b-tet', `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rects}</svg>`, `left:${px(p.x)};top:${px(top)};width:${w}px;--fy:${px(-(top + h + 10))};animation-delay:${K.s(t(p.d))}, ${K.s(t(0.76))}`);
    });
    A(K, 'mvx-b-tline', '', `top:${px(gy - c)};height:${c}px`);
    K.word('カクッ', 12, G.bb + 20, t(0.2), '#8fd0ff', 22, -6);
    K.word('そろった!', G.sw - 130, G.bb + 40, t(0.7), '#ffd94a', 26, 8);
    K.burst(G.cx, gy - c / 2, t(0.78), 16, 120, ['#8fd0ff', '#ffa95e', '#ffd94a', '#ff9fbb']);
  });

  def('mousechase', 'hunt', 3400, (K, G, ms, t) => {
    const gy = ground(G);
    A(K, 'mvx-b-mouse', `<div class="mi">${sv('0 0 64 40', `<path d="M56 30 C 66 30 64 14 56 18" fill="none" ${ink(2.5)}/><path d="M6 30 C 6 14 22 6 36 10 C 50 14 58 24 56 32 Z" fill="#c8ccd8" ${ink(3)}/><circle cx="22" cy="10" r="7" fill="#ffc9d8" ${ink(2.5)}/><circle cx="12" cy="20" r="2.2" fill="${INK}"/><circle cx="5" cy="27" r="2.6" fill="#ff9fbb" ${ink(1.5)}/><path d="M14 26 l-10 -4 M14 28 l-10 2" ${ink(1.4)}/><path d="M22 32 l-2 5 M42 32 l2 5" ${ink(2.5)}/>`)}</div>`, `left:0;top:${px(gy - 32)};--mx0:${px(G.sw + 10)};--mx1:-70px`);
    K.puffs(G.cx - 40, gy, 4, t(0.14), 30);
    K.puffs(G.cx + 40, gy, 4, t(0.46), 30);
    K.word('チュー!', G.sw - 90, G.bb + 60, t(0.06), '#c8ccd8', 22, 8);
    K.word('まてまてー!', 12, G.bb + 30, t(0.2), '#ffa95e', 24, -8);
    K.word('にがした…', G.cx - 50, G.bb + 8, t(0.82), '#8fd0ff', 20, -4);
  });

  def('yarntangle', 'yarn', 3000, (K, G, ms, t) => {
    const loops = ['M58 150 C 90 92, 170 92, 204 150 S 120 204, 80 160 S 140 100, 192 124', 'M70 120 C 100 182, 160 182, 214 130 C 180 100, 110 112, 92 152', 'M98 98 C 58 142, 140 202, 182 160 C 222 120, 150 88, 120 132', 'M60 170 C 120 130, 160 200, 210 170'];
    B(K, 'mvx-b-ov mvx-b-yarn', sv('0 0 240 200', loops.map((d) => `<path d="${d}" pathLength="1" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="${d}" pathLength="1" fill="none" stroke="#ff9fbb" stroke-width="4.5" stroke-linecap="round"/>`).join('')));
    A(K, 'mvx-b-yball', sv('0 0 40 40', `<circle cx="20" cy="20" r="17" fill="#ff9fbb" ${ink(3.5)}/><path d="M8 12 Q20 22 30 8 M6 22 Q20 30 34 18 M12 32 Q22 28 32 30" fill="none" ${ink(2)}/>`), `left:${px(G.x + G.w * 0.2)};top:${px(ground(G) - 30)};--rx:${px(G.sw - G.x - G.w * 0.2 + 20)}`);
    K.word('あっ', G.sw - 70, G.bb + 30, t(0.1), '#ff9fbb', 24, 8);
    K.word('からまった…', 12, G.bb + 40, t(0.4), '#fff', 22, -6);
    K.word('もぞもぞ', G.sw - 110, G.bb + 70, t(0.62), '#ffd94a', 22, 8);
  });

  def('laserdot', 'hunt', 3200, (K, G, ms, t) => {
    A(K, 'mvx-b-dot', '<i></i>', '');
    K.word('ちらっ', G.sw - 80, G.bb + 20, t(0.06), '#ff6b6b', 22, 8);
    K.word('ロックオン', 12, G.bb + 40, t(0.3), '#ffd94a', 22, -6);
    K.word('えいっ!', G.cx - 40, G.bb + 8, t(0.72), '#ff9fbb', 28, -6);
    K.word('…あれ?', G.sw - 100, G.bb + 70, t(0.86), '#fff', 20, 6);
    K.puffs(G.cx, ground(G), 5, t(0.78), 40);
  });

  def('fishjump', 'hunt', 3000, (K, G, ms, t) => {
    const gy = ground(G), pw = 100, px0 = G.sw - pw - 8;
    A(K, 'mvx-b-pond', '', `left:${px(px0)};width:${pw}px;top:${px(gy - 14)}`);
    const h = headOf('hunt'), mxp = (h.x - 6) / 240, myp = (h.y + 52) / 200;
    const mx = G.x + mxp * G.w, my = G.y + myp * G.h - G.h * 0.8;
    const fish = (c) => sv('0 0 60 30', `<path d="M4 15 C 14 2, 36 2, 46 15 C 36 28, 14 28, 4 15 Z" fill="${c}" ${ink(3)}/><path d="M44 15 L58 4 L56 26 Z" fill="${c}" ${ink(3)}/><circle cx="14" cy="13" r="2.4" fill="${INK}"/><path d="M24 8 Q28 15 24 22" fill="none" ${ink(2)}/>`);
    const fx0 = px0 + pw / 2 - 26, fy0 = gy - 20;
    A(K, 'mvx-b-fish', fish('#ffa95e'), `left:${px(fx0)};top:${px(fy0)};--fx:${px(mx - fx0 - 8)};--fy:${px(my - fy0 - 8)}`);
    B(K, 'mvx-b-fishheld', fish('#ffa95e'), `left:${pc(mxp - 0.17)};top:${pc(myp - 0.08)}`);
    K.puffs(px0 + pw / 2, gy - 8, 4, t(0.16), 30);
    K.burst(px0 + pw / 2, gy - 10, t(0.16), 10, 50, ['#8fd0ff', '#fff']);
    K.word('ピチピチ', G.sw - 110, G.bb + 70, t(0.18), '#8fd0ff', 22, 8);
    K.word('パクッ!', 12, G.bb + 10, t(0.46), '#ffa95e', 28, -6);
    K.word('ゲット!', G.cx - 30, G.bb + 50, t(0.66), '#ffd94a', 26, 6);
  });

  def('matatabi', 'wiggle', 3200, (K, G, ms, t) => {
    K.dark('#ff9fbb', 0.28, 0.1, 0.88);
    A(K, 'mvx-b-twig', sv('0 0 60 50', `<path d="M4 46 Q24 30 56 10" fill="none" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/><path d="M20 36 Q12 22 24 18 Q30 28 20 36 Z M36 26 Q34 10 46 10 Q46 22 36 26 Z" fill="#8fe8c8" ${ink(2.5)}/><ellipse cx="50" cy="22" rx="5" ry="7" fill="#ffa95e" ${ink(2.5)}/>`), `left:${px(Math.min(G.sw - 64, G.x + G.w * 0.82))};top:${px(ground(G) - 44)};width:56px`);
    for (let i = 0; i < 14; i++) A(K, 'mvx-b-heart', heartSvg(pick(['#ff9fbb', '#ff6b6b', '#ffc9d8'])), `left:${px(G.cx + rnd(-90, 80))};top:${px(G.y + G.h * rnd(0.3, 0.7))};width:${rnd(14, 26).toFixed(0)}px;animation-delay:${K.s(t(0.12) + rnd(0, t(0.6)))}`);
    K.word('とろ〜ん', 12, G.bb + 20, t(0.1), '#ff9fbb', 24, -6);
    K.word('ごろごろ…', G.sw - 120, G.bb + 60, t(0.46), '#fff', 22, 6);
    K.word('しあわせ…', 14, G.bb + 70, t(0.74), '#ffd94a', 20, -4);
  });

  def('boxdive', 'stare', 3400, (K, G, ms, t) => {
    const bw = 100, bh = 70, bx = G.sw - bw - 10, by = ground(G) - bh + 2;
    A(K, 'mvx-b-dbox', sv('0 0 100 70', `<path d="M10 14 L-2 2 L14 0 L22 14 Z M90 14 L102 2 L86 0 L78 14 Z" fill="${cardboard}" ${ink(3)}/><path d="M6 14 L94 14 L90 68 L10 68 Z" fill="${cardboard}" ${ink(3.5)}/><path d="M36 40 h28" ${ink(2.5)}/><path d="M8 16 L92 16" stroke="#c9a06a" stroke-width="4"/>`), `left:${px(bx)};top:${px(by)};width:${bw}px`);
    bv({ '--gx': px(bx + bw / 2 - G.cx) }, ms);
    K.word('ダイブ!', 12, G.bb + 20, t(0.14), '#8fd0ff', 26, -6);
    K.word('ガサゴソ', 14, G.bb + 60, t(0.44), '#ffa95e', 22, -6);
    K.word('ぴょこっ', G.cx - 40, G.bb + 8, t(0.8), '#ff9fbb', 24, -4);
  });

  def('uzumaki', 'curl', 3000, (K, G, ms, t) => {
    let d = 'M50 50';
    for (let a = 0.3; a <= Math.PI * 6.2; a += 0.25) { const r = 2 + a * 2.3; d += ` L${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`; }
    A(K, 'mvx-b-spiral', sv('0 0 100 100', `<g class="sp"><path d="${d}" pathLength="1" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" pathLength="1" fill="none" stroke="#ff9fbb" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></g>`), `left:${px(G.cx - 60)};top:${px(G.y + G.h * 0.6 - 60)};width:120px`);
    K.word('うずうず〜', 12, G.bb + 20, t(0.12), '#ff9fbb', 24, -6);
    K.word('ぐるるん', G.sw - 110, G.bb + 60, t(0.42), '#c9a7ff', 22, 8);
    K.word('ほどけた', 14, G.bb + 70, t(0.8), '#8fe8c8', 22, -4);
  });

  def('tailcopter', 'sit', 3200, (K, G, ms, t) => {
    B(K, 'mvx-b-ov mvx-b-rotor', sv('0 0 240 200', `<path d="M158 180 C 186 182 200 160 198 132" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M158 180 C 186 182 200 160 198 132" fill="none" stroke="#fffdf8" stroke-width="9" stroke-linecap="round"/><circle class="blur" cx="198" cy="124" r="44" fill="#fff" opacity=".5" stroke="${INK}" stroke-width="1.5" stroke-dasharray="6 8"/><g class="bl"><path d="M198 124 C 186 112 178 88 196 80 C 210 86 206 112 198 124 Z M198 124 C 210 136 218 160 200 168 C 186 162 190 136 198 124 Z" fill="#fffdf8" ${ink(3)}/></g><circle cx="198" cy="124" r="6" fill="#ffd94a" ${ink(3)}/>`));
    for (let i = 0; i < 8; i++) A(K, 'mvx-b-down', '', `left:${px(G.cx + rnd(-50, 50))};top:${px(ground(G) - 30)};animation-delay:${K.s(t(0.2) + i * 220)}`);
    K.word('ブルルル', 12, G.bb + 30, t(0.08), '#8fd0ff', 24, -6);
    K.word('うかんだ!', G.sw - 120, G.bb + 60, t(0.38), '#ffd94a', 24, 8);
  });

  def('tailwag', 'back', 3000, (K, G, ms, t) => {
    const tx = G.x + (58 / 240) * G.w, ty = G.y + (150 / 200) * G.h;
    for (let i = 0; i < 9; i++) A(K, 'mvx-b-gust', '', `left:${px(tx - 20)};top:${px(ty + rnd(-40, 30))};width:${rnd(30, 60).toFixed(0)}px;animation-delay:${K.s(t(0.1) + i * 230)}`);
    for (let i = 0; i < 7; i++) A(K, 'mvx-b-blowleaf', leaf(pick(['#8fe8c8', '#ffd94a', '#ffa95e'])), `left:${px(tx - 10)};top:${px(ty + rnd(-30, 30))};--ly:${rnd(-60, 30).toFixed(0)}px;animation-delay:${K.s(t(0.16) + i * 280)}`);
    K.word('ぶんぶんぶん', 12, G.bb + 20, t(0.08), '#ffa95e', 22, -6);
    K.word('ビューッ', G.sw - 100, G.bb + 60, t(0.4), '#8fd0ff', 26, 8);
  });

  def('earflap', 'sit', 3000, (K, G, ms, t) => {
    const PP = window.PoseParts, p = $('catPose');
    if (PP && p) {
      const HEAD_D = 'M70 92 C 68 72 78 60 90 57 L 94 37 Q 96 33 100 36 L 112 52 C 118 51 124 51 130 52 L 142 36 Q 146 33 148 37 L 152 57 C 164 60 174 72 172 92 C 170 116 150 127 121 127 C 92 127 72 116 70 92 Z';
      const EARLESS = 'M70 92 C 68 72 78 60 90 57 C 100 53 112 51 121 51 C 130 51 142 53 152 57 C 164 60 174 72 172 92 C 170 116 150 127 121 127 C 92 127 72 116 70 92 Z';
      let head = PP.headG('happy');
      if (head.includes(HEAD_D)) {
        head = head.replace(HEAD_D, EARLESS);
        p.innerHTML = PP.sitTorso() + '<g class="mvx-b-ear l"><path class="b" d="M88 64 L 94 37 Q 96 33 100 36 L 116 56 Z"/><path d="M96 44 L104 52 L94 54 Z" fill="#f4b9c3"/></g><g class="mvx-b-ear r"><path class="b" d="M154 64 L 148 37 Q 146 33 142 36 L 126 56 Z"/><path d="M146 44 L138 52 L148 54 Z" fill="#f4b9c3"/></g>' + head;
      }
    }
    for (let i = 0; i < 2; i++) B(K, 'mvx-b-flapl' + (i ? ' r' : ''), sv('0 0 30 30', `<path d="M4 8 q10 -6 22 0 M2 16 q12 -4 24 2 M6 24 q8 -2 16 2" fill="none" ${ink(2.5)}/>`));
    K.word('パタパタ', 12, G.bb + 30, t(0.14), '#ffd94a', 24, -6);
    K.word('ちょっと浮いた!', G.sw - 160, G.bb + 66, t(0.46), '#8fe8c8', 22, 8);
    K.puffs(G.cx, ground(G), 4, t(0.84), 40);
  });

  def('winkheart', 'wink', 2800, (K, G, ms, t) => {
    const ex = G.x + (142 / 240) * G.w, ey = G.y + (89 / 200) * G.h;
    [0.08, 0.24, 0.4, 0.56, 0.72].forEach((f) => {
      for (let i = 0; i < 2; i++) A(K, 'mvx-b-wheart', heartSvg(pick(['#ff9fbb', '#ff6b6b', '#ffc9d8'])), `left:${px(ex - 12)};top:${px(ey - 12)};--dx:${rnd(-140, 130).toFixed(0)}px;--dy:${rnd(-90, 40).toFixed(0)}px;animation-delay:${K.s(t(f) + i * 90)}`);
    });
    K.word('パチン☆', G.sw - 110, G.bb + 20, t(0.08), '#ffd94a', 24, 8);
    K.word('ズキュン', 12, G.bb + 60, t(0.5), '#ff6b6b', 26, -6);
    K.burst(G.cx, G.y + G.h * 0.4, t(0.84), 14, 100, ['#ff9fbb', '#ff6b6b', '#fff']);
  });

  def('peekbox', 'boxpeek', 3200, (K, G, ms, t) => {
    const bw = G.w * 0.8, bh = bw * 0.72;
    A(K, 'mvx-b-pkbox', sv('0 0 140 100', `<rect x="14" y="22" width="112" height="22" fill="${INK}"/><g class="eyes"><ellipse cx="54" cy="33" rx="9" ry="7" fill="#fff"/><ellipse cx="86" cy="33" rx="9" ry="7" fill="#fff"/><g class="pu"><circle cx="54" cy="34" r="4" fill="#6f95d8"/><circle cx="86" cy="34" r="4" fill="#6f95d8"/><circle cx="54" cy="34" r="2" fill="${INK}"/><circle cx="86" cy="34" r="2" fill="${INK}"/></g></g><path d="M10 42 L130 42 L126 98 L14 98 Z" fill="${cardboard}" ${ink(3.5)}/><path d="M60 70 h20" ${ink(2.5)}/><g class="lid"><path d="M6 20 L134 20 L132 44 L8 44 Z" fill="#f6e2b3" ${ink(3.5)}/><path d="M70 20 L70 44" stroke="#c9a06a" stroke-width="3"/></g>`), `left:${px(G.cx - bw / 2)};top:${px(ground(G) - bh + 2)};width:${px(bw)}`);
    K.word('…じー', G.sw - 90, G.bb + 30, t(0.24), '#fff', 22, 8);
    K.word('ちらっ', 12, G.bb + 60, t(0.6), '#8fd0ff', 22, -6);
    K.word('ひょこっ', G.cx - 40, G.bb + 8, t(0.86), '#ffd94a', 24, -4);
  });

  def('ojigi', 'bow', 2800, (K, G, ms, t) => {
    K.word('ぺこり', G.sw - 100, G.bb + 30, t(0.3), '#ff9fbb', 26, 8);
    K.word('ふかぶか〜', 12, G.bb + 60, t(0.46), '#fff', 22, -6);
    K.stars(6, 400, [10, 90, 50, 90]);
  });
})();
// 中くらいのしるし（超派手ではない）
window.MoreMoves.forEach((m) => { if (!('big' in m)) m.big = false; });
