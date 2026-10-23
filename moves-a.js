// 派手な動き 第4弾（moves-a）。window.MoreMoves に足していく
// 超派手（画面ぜんたい）70種。おまけの絵のクラスは mvx-a- ではじめる（ほかとぶつからないように）
// CSS は moves-a.css。キーフレームの名前は kfa- ではじめる
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
  // 波のふち（横に長い。半分ずらすとつながる）
  const wave = (fill, n = 20, amp = 8, stroke = INK) => {
    let d = 'M0 12';
    for (let i = 0; i < n; i++) d += ` q10 ${-amp} 20 0 t20 0`;
    const w = n * 40;
    return `<svg viewBox="0 0 ${w} 24" preserveAspectRatio="none"><path d="${d} V24 H0 Z" fill="${fill}"/><path d="${d}" fill="none" stroke="${stroke}" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`;
  };
  // 画面（#app）の写し。x,y,w,h は画面の中の四角。その中に、ずらして写しを置く
  function snap(K, cls, x, y, w, h, style = '') {
    const app = byId('app');
    const r = app.getBoundingClientRect();
    const box = K.fixed('mvx-a-snap ' + cls, '', `left:${r0(x)}px;top:${r0(y)}px;width:${r0(w)}px;height:${r0(h)}px;${style}`);
    const bs = getComputedStyle(document.body);
    const bg = document.createElement('div');
    bg.className = 'mvx-a-snapbg';
    bg.style.cssText = `left:${r0(-x)}px;top:${r0(-y)}px;width:${window.innerWidth}px;height:${window.innerHeight}px;background-color:${bs.backgroundColor};background-image:${bs.backgroundImage};background-size:${bs.backgroundSize}`;
    box.appendChild(bg);
    const c = app.cloneNode(true);
    c.removeAttribute('id'); // 中の id は、見た目（#openDiary などの色）のために残す。getElementById は先にある本物を返す
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('[filter]').forEach((n) => n.removeAttribute('filter'));
    c.querySelectorAll('.mv-extra').forEach((n) => n.remove());
    const cs = getComputedStyle(app);
    c.className = 'mvx-a-snapapp';
    c.style.cssText = `left:${r0(r.left - x)}px;top:${r0(r.top - y)}px;width:${r.width}px;height:${r.height}px;padding:${cs.padding};gap:${cs.gap}`;
    box.appendChild(c);
    return box;
  }
  // SVG のフィルタ（モザイクなど）を置く
  function defs(K, html) {
    return K.fixed('mvx-a-defs', `<svg width="0" height="0" style="position:absolute"><defs>${html}</defs></svg>`, 'width:0;height:0;overflow:hidden');
  }
  const def = (name, pose, ms, fn) => MM.push({ name, pose, ms, extras: fn ? (K) => fn(K, K.G, ms) : null });

  // ---------------- 1. 洪水と箱舟 ----------------
  const ARK = `<svg viewBox="0 0 200 70"><path d="M150 26 V-30" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M152 -28 L186 -18 L152 -6 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M4 24 L196 24 L176 66 L24 66 Z" fill="#d79a62" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M14 38 H186 M20 52 H180" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><circle cx="50" cy="45" r="5" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/><circle cx="100" cy="45" r="5" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/><circle cx="150" cy="45" r="5" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/></svg>`;
  const DUCK = `<svg viewBox="0 0 50 40"><path d="M6 24 Q6 38 26 38 Q46 38 46 24 Q46 18 38 20 Q40 4 28 4 Q16 4 18 18 Q6 14 6 24 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M17 12 L6 14 L16 18" fill="#ffa95e" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="11" r="2.4" fill="${INK}"/></svg>`;
  const PLANK = `<svg viewBox="0 0 70 20"><rect x="2" y="4" width="66" height="12" rx="4" fill="#d79a62" stroke="${INK}" stroke-width="3"/><path d="M14 10 H34" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></svg>`;
  def('flood', 'wave', 3800, (K, G, ms) => {
    K.back('#8fd0ff', 0.55);
    K.rain(22, '<i class="mvx-a-drop"></i>', { delayMax: 700, dur: [450, 750], size: [9, 13] });
    const top = G.y + G.h * 0.8;
    K.add('mvx-a-water', `<div class="mvx-a-wave">${wave('#8fd0ff')}</div><div class="mvx-a-wave mvx-a-wave2">${wave('#bfe6ff', 20, 6)}</div>`, `top:${r0(top)}px`);
    [DUCK, PLANK, PLANK, DUCK, PLANK].forEach((h, i) => K.add('mvx-a-floater', h, `top:${r0(top - (h === DUCK ? 26 : 10))}px;width:${h === DUCK ? 40 : 60}px;--fx:${-(G.sw + 140)}px;animation-delay:${S(ms * 0.18 + i * 260)}`));
    K.inBtn('mvx-a-ark', ARK);
    K.word('ざぶーん!!', 12, G.y + 6, ms * 0.1, '#8fd0ff', 34, -8);
    K.word('どんぶらこ〜', G.sw - 160, G.y + G.h * 0.35, ms * 0.5, '#fff', 22, 6);
    for (let i = 0; i < 4; i++) K.puffs(rnd(30, G.sw - 30), top, 2, ms * 0.12 + i * 120, 30);
  });

  // ---------------- 2. サメ ----------------
  const FIN = `<svg viewBox="0 0 60 50"><path d="M4 48 Q30 40 34 2 Q46 26 56 48 Z" fill="#8a9bb8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M36 14 Q40 30 48 44" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/></svg>`;
  const SHARK = `<svg viewBox="0 0 160 80"><path d="M150 40 L134 14 L132 38 Z" fill="#8a9bb8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M134 40 L150 66 L130 46 Z" fill="#8a9bb8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M6 44 Q14 18 60 16 Q74 0 82 14 Q120 16 136 40 Q118 66 64 66 Q18 66 6 44 Z" fill="#8a9bb8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M10 46 Q40 64 100 56 Q70 66 40 64 Q16 60 10 46 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M16 46 L22 52 L28 47 L34 53 L40 48 L46 53 L52 48" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="34" cy="32" r="4.5" fill="${INK}"/><circle cx="35.5" cy="30.5" r="1.4" fill="#fff"/><path d="M62 36 Q72 46 70 56" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="40" rx="5" ry="3" fill="#ff9fbb" opacity=".8"/></svg>`;
  def('shark', 'swimring', 3600, (K, G, ms) => {
    const top = G.y + G.h * 0.8;
    K.back('#5fb0f0', 0.45);
    K.add('mvx-a-sea', `<div class="mvx-a-wave">${wave('#5fb0f0')}</div>`, `top:${r0(top)}px`);
    K.add('mvx-a-fin', FIN, `top:${r0(top - 36)}px;--w:${G.sw}px`);
    K.add('mvx-a-shark', SHARK, `top:${r0(top - 30)}px;--w:${G.sw}px;--hy:${r0(-G.h * 0.95)}px`);
    K.word('ちゃぷ…ちゃぷ…', 14, G.y + G.h * 0.1, ms * 0.12, '#8fd0ff', 20, -4);
    K.word('ザバーッ!!', G.sw - 150, G.y - 10, ms * 0.6, '#fff', 32, 8);
    K.puffs(30, top, 5, ms * 0.58, 30);
    K.puffs(G.sw - 30, top, 5, ms * 0.8, 30);
    K.burst(G.cx, top, ms * 0.6, 16, 90, ['#8fd0ff', '#fff', '#5fb0f0']);
  });

  // ---------------- 3. 神さまの手 ----------------
  const HAND = `<svg viewBox="0 0 220 230"><path d="M44 0 L176 0 L176 110 Q178 130 170 150 L170 196 Q170 210 158 210 Q146 210 146 196 L146 160 L140 160 L140 214 Q140 228 127 228 Q114 228 114 214 L114 160 L108 160 L108 214 Q108 228 95 228 Q82 228 82 214 L82 160 L76 160 L76 198 Q76 212 63 212 Q50 212 50 198 L50 140 Q30 128 18 104 Q10 88 22 82 Q34 78 44 96 Z" fill="#ffe3c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M95 120 Q110 130 128 120" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/><path d="M64 196 Q63 200 64 204 M95 212 Q95 216 95 220 M127 212 Q127 216 127 220 M158 194 Q158 198 158 202" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity=".5"/><path d="M40 0 H180 L184 -14 H36 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
  const CLOUD = `<svg viewBox="0 0 160 70"><path d="M20 62 Q2 62 6 46 Q8 32 26 34 Q28 12 52 14 Q64 0 84 10 Q104 0 116 18 Q140 14 142 34 Q160 38 154 54 Q150 64 136 62 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
  def('godhand', 'blink', 3600, (K, G, ms) => {
    K.back('#fff1a8', 0.7);
    K.add('mvx-a-godrays', '', `left:${r0(G.cx)}px`);
    K.add('mvx-a-cloudl', CLOUD, '');
    K.add('mvx-a-cloudr', CLOUD, '');
    K.add('mvx-a-hand', HAND, `left:${r0(G.cx)}px;--hy:${r0(G.y + G.h * 0.32)}px`);
    K.stars(18, ms * 0.8, [5, 95, 5, 70], ['✦', '✧', '♥', '✦']);
    K.word('なで…', G.cx + 50, G.y + G.h * 0.25, ms * 0.36, '#ffd94a', 24, 8);
    K.word('なでなで♥', 10, G.y + G.h * 0.45, ms * 0.6, '#ff9fbb', 26, -6);
  });

  // ---------------- 4. 巨大な肉球 ----------------
  const PAW = (fill = '#fffdf8', pad = '#ff9fbb', sw = 5) => `<svg viewBox="0 0 200 200"><path d="M100 196 Q20 196 16 120 Q12 58 52 40 Q100 18 148 40 Q188 58 184 120 Q180 196 100 196 Z" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M100 172 Q58 172 58 140 Q58 110 82 108 Q92 106 100 112 Q108 106 118 108 Q142 110 142 140 Q142 172 100 172 Z" fill="${pad}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="46" cy="96" rx="17" ry="22" transform="rotate(-24 46 96)" fill="${pad}" stroke="${INK}" stroke-width="${sw}"/><ellipse cx="80" cy="66" rx="18" ry="24" transform="rotate(-8 80 66)" fill="${pad}" stroke="${INK}" stroke-width="${sw}"/><ellipse cx="120" cy="66" rx="18" ry="24" transform="rotate(8 120 66)" fill="${pad}" stroke="${INK}" stroke-width="${sw}"/><ellipse cx="154" cy="96" rx="17" ry="22" transform="rotate(24 154 96)" fill="${pad}" stroke="${INK}" stroke-width="${sw}"/></svg>`;
  const PRINT = `<svg viewBox="0 0 200 200"><path d="M100 172 Q58 172 58 140 Q58 110 82 108 Q92 106 100 112 Q108 106 118 108 Q142 110 142 140 Q142 172 100 172 Z"/><ellipse cx="46" cy="96" rx="17" ry="22" transform="rotate(-24 46 96)"/><ellipse cx="80" cy="66" rx="18" ry="24" transform="rotate(-8 80 66)"/><ellipse cx="120" cy="66" rx="18" ry="24" transform="rotate(8 120 66)"/><ellipse cx="154" cy="96" rx="17" ry="22" transform="rotate(24 154 96)"/></svg>`;
  def('giantpaw', 'gaan', 3200, (K, G, ms) => {
    const cx = G.px + G.cx, cy = G.py + G.y + G.h * 0.55;
    K.add('mvx-a-pawshadow', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.6)}px`);
    K.fixed('mvx-a-bigpaw', PAW(), `left:${r0(cx)}px;top:${r0(cy)}px`);
    K.fixed('mvx-a-pawprint', PRINT, `left:${r0(cx)}px;top:${r0(cy)}px`);
    K.flash(ms * 0.3, '#fff', 300);
    const W = window.innerWidth, H = window.innerHeight;
    [[0.2, 0.18], [0.78, 0.3], [0.25, 0.72], [0.8, 0.8], [0.5, 0.92]].forEach(([x, y], i) => K.fixed('mvx-a-smallprint', PRINT, `left:${r0(W * x)}px;top:${r0(H * y)}px;--r:${r0(rnd(-40, 40))}deg;animation-delay:${S(ms * 0.52 + i * 130)}`));
    K.burst(G.cx, G.y + G.h * 0.9, ms * 0.3, 18, 140, ['#ff9fbb', '#fff', '#ffd94a']);
    K.word('ペタン!!!', G.cx - 90, G.y - 6, ms * 0.31, '#ff9fbb', 38, -8);
    K.word('ぷにっ', G.sw - 100, G.y + G.h * 0.55, ms * 0.56, '#fff', 22, 10);
  });

  // ---------------- 5. 目からビーム ----------------
  def('catbeam', 'stare', 3000, (K, G, ms) => {
    K.dark('#1d1f4a', 0.6, 0.1, 0.88);
    K.back('#1d1f4a', 0.5);
    const ex = (vx) => G.px + G.x + (vx / 240) * G.w, ey = G.py + G.y + (90 / 200) * G.h;
    [101, 141].forEach((vx, i) => {
      K.fixed('mvx-a-beam', '<i></i>', `left:${r0(ex(vx))}px;top:${r0(ey)}px;animation-delay:${S(ms * 0.3 + i * 30)}`);
      K.fixed('mvx-a-eyeglow', '', `left:${r0(ex(vx))}px;top:${r0(ey)}px`);
    });
    const W = window.innerWidth;
    for (let i = 0; i < 8; i++) {
      const t = ms * (0.34 + i * 0.065);
      const a = (-160 + i * 20) * Math.PI / 180;
      const x = ex(121) + Math.cos(a) * W * 0.55, y = ey + Math.sin(a) * W * 0.55;
      K.fixed('mvx-a-zap', '', `left:${r0(Math.min(Math.max(x, 20), W - 20))}px;top:${r0(Math.max(y, 20))}px;animation-delay:${S(t)}`);
    }
    K.stars(24, ms * 0.7, [5, 95, 5, 60]);
    K.word('ビビビーッ!!', 10, G.y + G.h * 0.62, ms * 0.32, '#ff9fbb', 32, -6);
  });

  // ---------------- 6. スーパーヒーロー ----------------
  def('superhero', 'hero', 3800, (K, G, ms) => {
    K.back('#8fd0ff', 0.6);
    K.add('mvx-a-comicrays', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.5)}px`);
    const W = window.innerWidth, H = window.innerHeight;
    const hero = K.fixed('mvx-a-hero', `<div class="mvx-a-heroin">${catNow()}</div>`, `--W:${W}px;--H:${H}px`);
    hero.style.width = Math.min(170, W * 0.42) + 'px';
    for (let i = 0; i < 7; i++) K.fixed('mvx-a-whoosh', '', `top:${r0(rnd(0.08, 0.9) * H)}px;animation-delay:${S(ms * 0.14 + i * 260)}`);
    K.word('ビューン!', 14, G.bb + 10, ms * 0.2, '#fff', 26, -8);
    K.word('ヒーロー参上!!', G.cx - 110, G.y + G.h * 0.15, ms * 0.82, '#ffd94a', 32, -6);
    K.puffs(G.cx, G.y + G.h, 7, ms * 0.82, 90);
    K.flash(ms * 0.82, '#fff6c2', 300, false);
  });

  // ---------------- 7. 巨大ロボ ----------------
  const ROBOT = `<svg viewBox="0 0 200 300" class="mvx-a-robotsvg">
    <g class="mvx-a-rleg mvx-a-rleg1"><rect x="56" y="196" width="34" height="74" rx="8" fill="#b9c6dc" stroke="${INK}" stroke-width="5"/><path d="M44 270 H96 Q100 290 92 292 H46 Q38 290 44 270 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="mvx-a-rleg mvx-a-rleg2"><rect x="110" y="196" width="34" height="74" rx="8" fill="#b9c6dc" stroke="${INK}" stroke-width="5"/><path d="M104 270 H156 Q162 290 154 292 H108 Q100 290 104 270 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="mvx-a-rarm mvx-a-rarm1"><rect x="6" y="122" width="30" height="80" rx="12" fill="#b9c6dc" stroke="${INK}" stroke-width="5"/><circle cx="21" cy="210" r="16" fill="#ffd94a" stroke="${INK}" stroke-width="5"/></g>
    <g class="mvx-a-rarm mvx-a-rarm2"><rect x="164" y="122" width="30" height="80" rx="12" fill="#b9c6dc" stroke="${INK}" stroke-width="5"/><circle cx="179" cy="210" r="16" fill="#ffd94a" stroke="${INK}" stroke-width="5"/></g>
    <rect x="34" y="110" width="132" height="98" rx="18" fill="#8fd0ff" stroke="${INK}" stroke-width="5"/>
    <rect x="62" y="132" width="76" height="40" rx="8" fill="#fff" stroke="${INK}" stroke-width="4"/>
    <circle class="mvx-a-blink" cx="80" cy="152" r="8" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/><circle class="mvx-a-blink mvx-a-blink2" cx="100" cy="152" r="8" fill="#ffd94a" stroke="${INK}" stroke-width="3"/><circle class="mvx-a-blink" cx="120" cy="152" r="8" fill="#8fe8c8" stroke="${INK}" stroke-width="3"/>
    <path d="M60 188 H140" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <rect x="30" y="4" width="140" height="112" rx="30" fill="#c9a7ff" stroke="${INK}" stroke-width="5"/>
    <path d="M100 4 V-22" stroke="${INK}" stroke-width="5"/><circle class="mvx-a-blink" cx="100" cy="-26" r="9" fill="#ff6b6b" stroke="${INK}" stroke-width="4"/>
  </svg>`;
  const ROBOGLASS = `<svg viewBox="0 0 200 300"><rect x="44" y="16" width="112" height="86" rx="22" fill="rgba(191,230,255,.35)" stroke="${INK}" stroke-width="5"/><path d="M58 30 Q66 24 76 26" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  def('mecha', 'doya', 3800, (K, G, ms) => {
    const h = Math.max(120, Math.min(G.sh * 0.92, G.sh - G.bb - 10, (G.sw * 0.62) * 1.5)), w = h / 1.5;
    const robo = K.add('mvx-a-robot', `${ROBOT}<div class="mvx-a-pilot">${catNow()}</div>${ROBOGLASS}`, `left:${r0(G.cx - w / 2)}px;width:${r0(w)}px;height:${r0(h)}px;--rx:${r0(G.sw * 0.18)}px`);
    robo.style.top = r0(G.sh - h - 6) + 'px';
    for (let i = 0; i < 4; i++) K.puffs(G.cx + (i % 2 ? 40 : -40), G.sh - 10, 3, ms * (0.36 + i * 0.12), 40);
    K.word('ガシーン!', 12, G.bb + 20, ms * 0.24, '#c9a7ff', 30, -8);
    K.word('ズシン', G.sw - 100, G.sh * 0.55, ms * 0.4, '#ffd94a', 26, 8);
    K.word('ズシン', 14, G.sh * 0.62, ms * 0.64, '#ffd94a', 26, -8);
  });

  // ---------------- 8. 宇宙船、発進 ----------------
  const SHIP = `<svg viewBox="0 0 160 240"><path d="M80 4 Q132 50 130 150 L30 150 Q28 50 80 4 Z" fill="#fffdf8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M56 30 Q80 0 104 30 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M30 104 L4 168 L34 158 Z M130 104 L156 168 L126 158 Z" fill="#8fd0ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><rect x="40" y="150" width="80" height="18" rx="6" fill="#c9a7ff" stroke="${INK}" stroke-width="4"/><path d="M60 132 H100" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><g class="mvx-flame"><path d="M44 168 Q80 250 116 168 Z" fill="#ffa95e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M58 168 Q80 220 102 168 Z" fill="#ffd94a"/></g></svg>`;
  def('spaceship', 'salute', 3800, (K, G, ms) => {
    const w = Math.max(80, Math.min(G.sw * 0.5, 170, (G.sh - G.bb - 22) / 1.5)), h = w * 1.5;
    K.add('mvx-a-ship', `${SHIP}<div class="mvx-a-shipwin"><div class="mvx-a-shipcat">${catNow()}</div></div>`, `left:${r0(G.cx - w / 2)}px;width:${r0(w)}px;top:${r0(G.sh - h - 14)}px;--up:${r0(-G.sh - h)}px`);
    ['3', '2', '1'].forEach((n, i) => K.add('mvx-a-count', n, `left:${r0(G.cx)}px;top:${r0(Math.max(G.bb, 0) + 8)}px;animation-delay:${S(ms * (0.06 + i * 0.1))}`));
    K.word('はっしゃ!!', G.cx - 90, G.bb + 10, ms * 0.38, '#ffa95e', 34, -8);
    for (let i = 0; i < 14; i++) K.add('mvx-a-bigsmoke', '', `left:${r0(rnd(-0.05, 1.05) * G.sw)}px;top:${r0(G.sh - rnd(10, 70))}px;--s:${rnd(1, 2.2).toFixed(2)};animation-delay:${S(ms * 0.34 + rnd(0, 500))}`);
    K.back('#151a3a', 0.85);
    K.add('mvx-a-spacebg', '', '');
    for (let i = 0; i < 26; i++) K.add('mvx-a-streak', '', `left:${r0(rnd(0, G.sw))}px;height:${r0(rnd(30, 90))}px;--sh:${G.sh + 100}px;animation-delay:${S(ms * 0.5 + rnd(0, ms * 0.3))}`);
    K.word('ただいまー', G.cx - 60, G.y + G.h * 0.2, ms * 0.84, '#fff', 22, 6);
  });

  // ---------------- 9. 月面着陸 ----------------
  const EARTH = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#8fd0ff" stroke="${INK}" stroke-width="5"/><path d="M20 30 Q34 18 44 28 Q50 40 38 46 Q30 58 22 50 Q12 40 20 30 Z M58 58 Q72 50 80 62 Q82 78 66 84 Q56 76 58 58 Z M60 14 Q72 16 76 26 Q66 30 60 24 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
  const FLAG = `<svg viewBox="0 0 60 90"><path d="M8 88 V6" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M8 8 H54 V40 H8 Z" fill="#fffdf8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M22 30 L26 16 L30 22 L34 16 L38 30 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  def('moonland', 'flag', 3800, (K, G, ms) => {
    K.back('#151a3a', 0.85);
    K.dark('#151a3a', 0.9, 0.08, 0.92);
    K.stars(26, ms * 0.8, [3, 97, 3, 50], ['✦', '·', '✧', '★']);
    K.add('mvx-a-earth', EARTH, '');
    K.add('mvx-a-moonground', '<i></i><i></i><i></i><i></i>', `top:${r0(G.y + G.h * 0.9)}px`);
    K.add('mvx-a-flagpole', FLAG, `left:${r0(Math.min(G.x + G.w * 0.86, G.sw - 50))}px;top:${r0(G.y + G.h * 0.9 - 80)}px`);
    [0.3, 0.55, 0.78].forEach((f) => K.puffs(G.cx, G.y + G.h * 0.95, 4, ms * f, 70));
    K.word('ふわ〜ん', 14, G.bb + 20, ms * 0.4, '#c9a7ff', 24, -6);
    K.word('ぺたっ', G.sw - 110, G.y + G.h * 0.5, ms * 0.5, '#fff', 22, 8);
  });

  // ---------------- 10. 衛星になる ----------------
  def('satellite', 'float', 3800, (K, G, ms) => {
    K.back('#151a3a', 0.85);
    K.dark('#151a3a', 0.92, 0.1, 0.9);
    K.stars(22, ms * 0.8, [3, 97, 3, 95], ['✦', '·', '✧']);
    const ex = G.cx, ey = G.sh * 0.56, R = Math.min(G.sw * 0.2, G.sh * 0.22, 100);
    const rx = Math.min(G.sw * 0.44, 170), ry = R * 0.62;
    K.add('mvx-a-orbit', '', `left:${r0(ex - rx)}px;top:${r0(ey - ry)}px;width:${r0(rx * 2)}px;height:${r0(ry * 2)}px`);
    const path = `path('M ${r0(ex - rx)} ${r0(ey)} A ${r0(rx)} ${r0(ry)} 0 0 0 ${r0(ex + rx)} ${r0(ey)} A ${r0(rx)} ${r0(ry)} 0 0 0 ${r0(ex - rx)} ${r0(ey)} Z')`;
    const sat = K.add('mvx-a-sat', `<i class="mvx-a-spanel"></i><div class="mvx-a-satcat">${catNow()}</div><i class="mvx-a-spanel"></i>`, '');
    sat.style.offsetPath = path;
    K.add('mvx-a-globe', EARTH, `left:${r0(ex - R)}px;top:${r0(ey - R)}px;width:${r0(R * 2)}px`);
    K.word('ピコーン', ex + R * 0.4, ey - R - 40, ms * 0.45, '#8fe8c8', 22, 6);
  });

  // 魚（右向き）
  const FISH = (c, c2 = '#fff') => `<svg viewBox="0 0 60 36"><path d="M44 18 L58 4 L56 32 Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M4 18 Q16 2 32 4 Q46 6 48 18 Q46 30 32 32 Q16 34 4 18 Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M22 6 Q28 18 22 30" stroke="${INK}" stroke-width="2.4" fill="none" opacity=".55"/><path d="M28 10 Q34 18 28 26" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="14" cy="15" r="2.8" fill="${INK}"/></svg>`;
  // 小さい星（顔つき）
  const STARFACE = (c = '#ffd94a') => `<svg viewBox="0 0 100 100"><path d="M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="41" cy="50" r="4" fill="${INK}"/><circle cx="59" cy="50" r="4" fill="${INK}"/><path d="M44 60 Q50 66 56 60" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="60" rx="5" ry="3" fill="#ff9fbb"/><ellipse cx="66" cy="60" rx="5" ry="3" fill="#ff9fbb"/></svg>`;
  // 画面にくっつくバースト
  const fixedBurst = (K, x, y, delay, n, dist, colors, size) => { const b = K.burst(x, y, delay, n, dist, colors, size, document.body); b.classList.add('mvx-fixed', 'mvx-a-fburst'); return b; };

  // ---------------- 11. 星をキャッチ ----------------
  def('starfall', 'banzai', 3400, (K, G, ms) => {
    K.dark('#1d1f4a', 0.55, 0.06, 0.9);
    K.stars(20, ms * 0.6, [3, 97, 3, 60], ['✦', '·', '✧']);
    const sz = Math.min(G.w * 0.7, 130);
    const sx = G.sw - G.cx + sz, sy = -(G.y + sz * 0.4), ta = Math.atan2(sy, sx) * 180 / Math.PI;
    K.add('mvx-a-bigstarfall', `<i class="mvx-a-trail"></i>${STARFACE()}`, `left:${r0(G.cx - sz / 2)}px;top:${r0(G.y - sz * 0.7)}px;width:${r0(sz)}px;--sx:${r0(sx)}px;--sy:${r0(sy)}px;--ta:${r0(ta)}deg`);
    K.inBtn('mvx-a-heldstar', STARFACE());
    K.flash(ms * 0.44, '#fff6c2', 360, false);
    K.burst(G.cx, G.y + G.h * 0.05, ms * 0.44, 20, 110, ['#ffd94a', '#fff', '#ff9fbb', '#8fe8c8'], 11);
    K.stars(16, 900, [10, 90, 10, 80]);
    K.word('キャッチ!!', G.cx - 100, G.y + G.h * 0.25, ms * 0.46, '#ffd94a', 32, -8);
    K.word('キラーン', G.sw - 110, G.y + G.h * 0.6, ms * 0.66, '#fff', 22, 8);
  });

  // ---------------- 12. 超新星 ----------------
  def('supernova', 'gaan', 3600, (K, G, ms) => {
    K.back('#ff9f6b', 0.7);
    K.dark('#2a1640', 0.6, 0.05, 0.9);
    const W = window.innerWidth, H = window.innerHeight;
    const cx = G.px + G.cx, cy = G.py + Math.max(G.bb + 30, G.y * 0.6);
    K.fixed('mvx-a-novacore', '', `left:${r0(cx)}px;top:${r0(cy)}px`);
    K.fixed('mvx-a-novarays', '', `left:${r0(cx)}px;top:${r0(cy)}px`);
    for (let i = 0; i < 3; i++) K.fixed('mvx-a-novaring', '', `left:${r0(cx)}px;top:${r0(cy)}px;border-color:${['#ffd94a', '#ff9fbb', '#8fe8c8'][i]};animation-delay:${S(ms * 0.38 + i * 160)}`);
    K.flash(ms * 0.38, '#fff', 650);
    const cols = ['#ff6b6b', '#ffd94a', '#8fe8c8', '#8fd0ff', '#c9a7ff', '#ff9fbb', '#ffa95e'];
    fixedBurst(K, cx, cy, ms * 0.38, 28, Math.max(W, H) * 0.7, cols, 16);
    fixedBurst(K, cx, cy, ms * 0.42, 18, Math.max(W, H) * 0.45, cols, 22);
    for (let i = 0; i < 9; i++) K.fixed('mvx-a-splat', '', `left:${r0(rnd(0.05, 0.95) * W)}px;top:${r0(rnd(0.05, 0.95) * H)}px;background:${cols[i % cols.length]};--s:${rnd(0.7, 1.5).toFixed(2)};animation-delay:${S(ms * 0.42 + rnd(0, 300))}`);
    K.word('ゴゴゴゴ…', 14, G.bb + 20, ms * 0.08, '#ffa95e', 24, -6);
    K.word('ドッカーン!!!', G.cx - 110, G.y + G.h * 0.1, ms * 0.4, '#ffd94a', 38, -8);
  });

  // ---------------- 13. 時間がまわる ----------------
  const CLOCK = `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#fff6c2" stroke="${INK}" stroke-width="6"/><circle cx="100" cy="100" r="80" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="3 9.57"/>${[...Array(12)].map((_, i) => { const a = (i * 30 - 60) * Math.PI / 180; return `<text x="${(100 + Math.cos(a) * 66).toFixed(1)}" y="${(100 + Math.sin(a) * 66 + 7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="900" fill="${INK}" font-family="sans-serif">${i + 1}</text>`; }).join('')}<g class="mvx-a-hhour"><path d="M100 100 L100 52" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></g><g class="mvx-a-hmin"><path d="M100 100 L100 30" stroke="#ff6b6b" stroke-width="6" stroke-linecap="round"/></g><circle cx="100" cy="100" r="8" fill="${INK}"/></svg>`;
  const GEAR = (c) => `<svg viewBox="0 0 100 100"><path d="${[...Array(10)].map((_, i) => { const a0 = i * 36 * Math.PI / 180, a1 = (i * 36 + 14) * Math.PI / 180, a2 = (i * 36 + 18) * Math.PI / 180, a3 = (i * 36 + 32) * Math.PI / 180; const p = (a, r) => `${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`; return `${i ? 'L' : 'M'}${p(a0, 46)} L${p(a1, 46)} L${p(a2, 36)} L${p(a3, 36)}`; }).join(' ')} Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="12" fill="#fffdf8" stroke="${INK}" stroke-width="4"/></svg>`;
  def('timewarp', 'stare', 3600, (K, G, ms) => {
    const sz = Math.min(G.sw * 0.9, G.sh * 0.9);
    K.add('mvx-a-clock', CLOCK, `left:${r0(G.cx - sz / 2)}px;top:${r0(G.y + G.h * 0.5 - sz / 2)}px;width:${r0(sz)}px`);
    for (let i = 0; i < 4; i++) K.add('mvx-a-warpring', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.5)}px;animation-delay:${S(ms * 0.15 + i * 420)}`);
    [[0.04, 0.12, '#ffd94a', 64], [0.82, 0.08, '#ff9fbb', 50], [0.86, 0.7, '#8fe8c8', 70], [0.02, 0.72, '#c9a7ff', 48]].forEach(([x, y, c, w], i) => K.add('mvx-a-gear' + (i % 2 ? ' mvx-a-gearr' : ''), GEAR(c), `left:${r0(x * G.sw)}px;top:${r0(y * G.sh)}px;width:${w}px`));
    K.fixed('mvx-a-vignette', '', '');
    K.word('チクタク…', 12, G.bb + 14, ms * 0.12, '#ffd94a', 22, -6);
    K.word('グルグルグル', G.sw - 170, G.y + G.h * 0.7, ms * 0.4, '#ffa95e', 24, 6);
  });

  // ---------------- 14. 恐竜 ----------------
  const DINO = `<svg viewBox="0 0 240 200"><path d="M150 96 Q200 90 236 128 Q200 124 160 134 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><g class="mvx-a-dleg mvx-a-dleg2"><path d="M128 140 L130 186 L156 186 L152 140 Z" fill="#6fcfae" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g><path d="M86 66 L104 46 L112 70 L128 50 L134 76 L150 60 L152 86 L168 78 L162 100 Z" fill="#ffa95e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="124" cy="116" rx="58" ry="46" fill="#8fe8c8" stroke="${INK}" stroke-width="5"/><ellipse cx="108" cy="128" rx="30" ry="26" fill="#fff6c2" stroke="${INK}" stroke-width="3"/><path d="M76 100 Q60 70 64 50 L96 60 Q92 80 98 94 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><g class="mvx-a-dhead"><path d="M14 52 Q10 16 50 12 Q90 10 96 40 Q100 62 84 68 L40 70 Q16 70 14 52 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="62" cy="32" r="6" fill="${INK}"/><circle cx="64" cy="30" r="2" fill="#fff"/><circle cx="24" cy="34" r="2.6" fill="${INK}"/><path d="M18 56 Q50 62 84 58" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M28 57 L32 64 L36 58 M50 59 L54 66 L58 59" stroke="${INK}" stroke-width="3" fill="#fff" stroke-linejoin="round"/><ellipse cx="74" cy="48" rx="7" ry="4" fill="#ff9fbb"/></g><path d="M92 120 Q80 132 70 126" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><g class="mvx-a-dleg"><path d="M96 146 L94 188 L122 188 L120 146 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g></svg>`;
  def('dinosaur', 'gaan', 3800, (K, G, ms) => {
    const w = Math.min(G.sh * 0.95 * 1.2, G.sw * 1.05), h = w / 1.2;
    K.add('mvx-a-dino', DINO, `left:0;width:${r0(w)}px;top:${r0(G.sh - h - 4)}px;--x0:${r0(G.sw + 10)}px;--x1:${r0(-w - 10)}px`);
    for (let i = 0; i < 6; i++) {
      const t = 0.14 + i * 0.12;
      const fx = G.sw + 10 + (-w - 10 - G.sw - 10) * ((t - 0.08) / 0.8) + w * 0.45;
      K.add('mvx-a-dprint', '', `left:${r0(fx)}px;top:${r0(G.sh - 14)}px;animation-delay:${S(ms * t)}`);
      K.puffs(fx, G.sh - 10, 3, ms * t, 30);
    }
    K.word('ドシーン', 12, G.sh * 0.5, ms * 0.14, '#8fe8c8', 26, -8);
    K.word('ガオー!!', G.cx - 70, G.bb + 6, ms * 0.44, '#ffa95e', 36, 6);
    K.word('ドシーン', G.sw - 120, G.sh * 0.55, ms * 0.62, '#8fe8c8', 26, 8);
  });

  // ---------------- 15. 動物の大群 ----------------
  const BEAST = (c, horn = true) => `<svg viewBox="0 0 120 80"><path d="M100 30 Q116 26 114 14" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><g class="mvx-a-bleg"><path d="M30 50 L22 76 M44 52 L40 76" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g><g class="mvx-a-bleg mvx-a-bleg2"><path d="M80 50 L88 76 M94 48 L100 74" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g><ellipse cx="62" cy="40" rx="42" ry="22" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M40 36 Q50 30 60 36" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".4"/>${horn ? `<path d="M96 10 Q102 0 112 4 M104 14 Q112 8 118 14" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>` : `<path d="M98 12 L102 0 L108 12" fill="${c}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`}<ellipse cx="102" cy="28" rx="16" ry="14" fill="${c}" stroke="${INK}" stroke-width="4"/><circle cx="106" cy="25" r="2.6" fill="${INK}"/><ellipse cx="114" cy="32" rx="3" ry="2" fill="${INK}"/></svg>`;
  def('stampede', 'gaan', 3600, (K, G, ms) => {
    const cols = ['#d79a62', '#fffdf8', '#c9a7ff', '#ffd94a', '#ffa95e', '#8fe8c8', '#b9c6dc'];
    const rows = [[G.y + G.h * 0.62, 0.6, 1], [G.y + G.h * 0.78, 0.8, 2], [G.y + G.h * 0.92, 1.05, 5]];
    let k = 0;
    rows.forEach(([y, s, z], ri) => {
      for (let i = 0; i < 6; i++) {
        const w = G.w * 0.55 * s;
        K.add('mvx-a-beast', BEAST(cols[k++ % cols.length], (i + ri) % 2 === 0), `left:0;top:${r0(y - w * 0.66)}px;width:${r0(w)}px;z-index:${z};--x0:${r0(-w - 10)}px;--x1:${r0(G.sw + 10)}px;animation-delay:${S(ms * 0.08 + i * ms * 0.11 + ri * 90 + rnd(0, 120))};animation-duration:${S(rnd(900, 1200) / s)}`);
      }
    });
    for (let i = 0; i < 16; i++) K.add('mvx-a-dust', '', `left:${r0(rnd(-0.1, 1.05) * G.sw)}px;top:${r0(G.y + G.h * rnd(0.75, 1.05))}px;--s:${rnd(1, 2.4).toFixed(2)};animation-delay:${S(ms * 0.1 + rnd(0, ms * 0.65))}`);
    K.word('ドドドドド', 10, G.bb + 14, ms * 0.1, '#ffa95e', 28, -6);
    K.word('わわわっ', G.sw - 120, G.y + G.h * 0.1, ms * 0.45, '#fff', 24, 8);
  });

  // ---------------- 16. 飛行機 ----------------
  const PLANE = `<svg viewBox="0 0 240 120"><path d="M30 46 L6 14 L30 16 L56 46 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M20 52 Q24 40 60 40 L176 40 Q214 42 220 64 Q214 86 176 88 L60 88 Q24 88 20 74 Z" fill="#fffdf8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M40 64 H200" stroke="#8fd0ff" stroke-width="8"/><path d="M40 64 H200" stroke="${INK}" stroke-width="2" opacity=".3"/><circle cx="168" cy="56" r="6" fill="#bfe6ff" stroke="${INK}" stroke-width="3"/><circle cx="146" cy="56" r="6" fill="#bfe6ff" stroke="${INK}" stroke-width="3"/><path d="M84 74 L60 116 L90 116 L124 74 Z" fill="#ffd94a" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="222" cy="64" r="6" fill="${INK}"/><g class="mvx-a-prop"><ellipse cx="226" cy="64" rx="5" ry="30" fill="#c9a7ff" stroke="${INK}" stroke-width="3.5"/></g></svg>`;
  const CLOUD2 = `<svg viewBox="0 0 160 70"><path d="M20 62 Q2 62 6 46 Q8 32 26 34 Q28 12 52 14 Q64 0 84 10 Q104 0 116 18 Q140 14 142 34 Q160 38 154 54 Q150 64 136 62 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
  def('airplane', 'banzai', 3600, (K, G, ms) => {
    K.back('#8fd0ff', 0.7);
    K.add('mvx-a-skyblue', '', '');
    for (let i = 0; i < 9; i++) K.add('mvx-a-cloudrun', CLOUD2, `top:${r0(rnd(0.05, 0.75) * G.sh)}px;width:${r0(rnd(60, 130))}px;--x0:${r0(G.sw + 20)}px;animation-delay:${S(rnd(0, ms * 0.8))};animation-duration:${S(rnd(700, 1300))}`);
    K.add('mvx-a-cloudsea', `<div class="mvx-a-cloudseain">${CLOUD2.repeat(8)}</div>`, `top:${r0(G.sh * 0.82)}px`);
    const w = Math.min(G.sw * 0.82, 300);
    K.add('mvx-a-plane', `<div class="mvx-a-planecat">${mini('wave')}</div>${PLANE}`, `left:${r0(G.cx - w / 2)}px;top:${r0(G.sh * 0.42 - w * 0.25)}px;width:${r0(w)}px;--x0:${r0(-G.sw)}px;--x1:${r0(G.sw)}px`);
    for (let i = 0; i < 8; i++) K.add('mvx-speed', '', `top:${r0(G.sh * (0.15 + i * 0.09))}px;animation-delay:${S(ms * 0.2 + i * 90)}`);
    K.word('ブーーン', 12, G.bb + 10, ms * 0.28, '#fff', 26, -6);
    K.word('くるりん!', G.sw - 130, G.sh * 0.66, ms * 0.56, '#ffd94a', 26, 8);
  });

  // ---------------- 17. 気球 ----------------
  const BALLOON = `<svg viewBox="0 0 160 220"><path d="M80 6 Q150 6 150 74 Q150 118 104 150 L56 150 Q10 118 10 74 Q10 6 80 6 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M80 6 Q112 40 104 150 L56 150 Q48 40 80 6 Z" fill="#ffd94a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M80 6 Q92 60 86 150 L74 150 Q68 60 80 6 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M58 150 L52 184 M102 150 L108 184 M76 150 L72 184 M84 150 L88 184" stroke="${INK}" stroke-width="3"/><g class="mvx-flame"><path d="M70 150 Q80 124 90 150 Z" fill="#ffa95e" stroke="${INK}" stroke-width="2.5"/></g></svg>`;
  const BASKET = `<svg viewBox="0 0 160 220"><path d="M48 182 H112 L106 216 H54 Z" fill="#d79a62" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M52 196 H108 M58 182 L60 216 M80 182 V216 M102 182 L100 216" stroke="${INK}" stroke-width="2.5" opacity=".6"/><rect x="44" y="176" width="72" height="10" rx="4" fill="#c27f4a" stroke="${INK}" stroke-width="4"/></svg>`;
  const TOWN = `<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMax slice"><path d="M-20 70 Q60 30 140 64 Q220 30 320 66 V140 H-20 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="4"/><g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"><rect x="40" y="74" width="34" height="30" fill="#fff6c2"/><path d="M36 76 L57 56 L78 76 Z" fill="#ff9fbb"/><rect x="120" y="70" width="40" height="36" fill="#fffdf8"/><path d="M116 72 L140 50 L164 72 Z" fill="#8fd0ff"/><rect x="210" y="76" width="30" height="28" fill="#fff6c2"/><path d="M206 78 L225 60 L244 78 Z" fill="#ffa95e"/></g><g stroke="${INK}" stroke-width="3"><circle cx="96" cy="80" r="12" fill="#6fcfae"/><circle cx="186" cy="82" r="10" fill="#6fcfae"/><circle cx="270" cy="80" r="12" fill="#6fcfae"/></g></svg>`;
  def('hotair', 'wave', 3800, (K, G, ms) => {
    K.back('#bfe6ff', 0.7);
    K.add('mvx-a-skyblue', '', '');
    K.add('mvx-a-town', TOWN, `height:${r0(G.sh * 0.42)}px`);
    for (let i = 0; i < 8; i++) K.add('mvx-a-clouddown', CLOUD2, `left:${r0(rnd(-0.1, 0.85) * G.sw)}px;width:${r0(rnd(60, 120))}px;--h:${G.sh + 80}px;animation-delay:${S(ms * 0.3 + rnd(0, ms * 0.45))}`);
    const w = Math.min(G.w * 0.75, G.sh * 0.6 / 1.375);
    const bx = G.cx - w / 2, by = G.y + G.h - w * 1.375;
    K.add('mvx-a-balloon', `${BALLOON}<div class="mvx-a-bcat">${catNow()}</div>${BASKET}`, `left:${r0(bx)}px;top:${r0(by)}px;width:${r0(w)}px;--up:${r0(Math.max(G.bb + 4, 6) - by)}px`);
    K.word('ふわ〜り', 12, G.sh * 0.6, ms * 0.3, '#ff9fbb', 24, -6);
    K.word('たかーい!', G.sw - 120, G.sh * 0.5, ms * 0.55, '#fff', 24, 8);
  });

  // ---------------- 18. 潜水艦の丸窓 ----------------
  def('submarine', 'gaze', 3600, (K, G, ms) => {
    const d = Math.min(G.sw * 0.86, G.sh * 0.86);
    const cx = G.cx, cy = Math.min(G.y + G.h * 0.5, G.sh - d / 2 - 4);
    let inner = '<i class="mvx-a-ray"></i><i class="mvx-a-ray mvx-a-ray2"></i>';
    for (let i = 0; i < 6; i++) inner += `<div class="mvx-a-pfish${i % 2 ? ' mvx-a-pfishl' : ''}" style="top:${r0(rnd(0.1, 0.8) * d)}px;width:${r0(rnd(30, 54))}px;--d:${r0(d + 120)}px;animation-delay:${S(rnd(0, ms * 0.7))};animation-duration:${S(rnd(1300, 2000))}">${FISH(pick(POP.slice(0, 6)))}</div>`;
    inner += `<div class="mvx-a-pwhale" style="--d:${r0(d + 260)}px">${FISH('#8a9bb8', '#bfe6ff')}</div>`;
    for (let i = 0; i < 12; i++) inner += `<b class="mvx-a-pbub" style="left:${r0(rnd(0.05, 0.95) * d)}px;--d:${r0(d + 40)}px;animation-delay:${S(rnd(0, ms * 0.8))}"></b>`;
    K.add('mvx-a-port', inner, `left:${r0(cx - d / 2)}px;top:${r0(cy - d / 2)}px;width:${r0(d)}px;height:${r0(d)}px`);
    K.add('mvx-a-portring', '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>', `left:${r0(cx - d / 2)}px;top:${r0(cy - d / 2)}px;width:${r0(d)}px;height:${r0(d)}px;--r:${r0(-d / 2 + 8)}px`);
    K.word('ゴポゴポ…', 10, G.bb + 10, ms * 0.2, '#8fd0ff', 22, -6);
    K.word('でかっ!', G.sw - 100, G.y + G.h * 0.2, ms * 0.6, '#fff', 26, 8);
  });

  // ---------------- 19. 水族館 ----------------
  def('aquarium', 'hunt', 3600, (K, G, ms) => {
    K.back('#3f86c9', 0.55);
    K.dark('#2f6fb0', 0.55, 0.08, 0.9);
    K.add('mvx-a-caustic', '', '');
    for (let i = 0; i < 5; i++) K.add('mvx-a-weed', '', `left:${r0((0.06 + i * 0.22) * G.sw)}px;height:${r0(G.sh * rnd(0.25, 0.42))}px;animation-delay:${S(-rnd(0, 1500))}`);
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < 22; i++) {
      const left = i % 2 === 1, w = rnd(34, 70);
      K.fixed('mvx-a-afish' + (left ? ' mvx-a-afishl' : ''), FISH(POP[i % 6], pick(['#fff', '#ffd94a', '#ff9fbb'])), `top:${r0(rnd(0.05, 0.92) * H)}px;width:${r0(w)}px;--W:${W + 160}px;animation-delay:${S(rnd(0, ms * 0.72))};animation-duration:${S(rnd(1100, 1900))}`);
    }
    for (let s = 0; s < 2; s++) {
      const y = rnd(0.2, 0.7) * H, d0 = ms * (0.15 + s * 0.35);
      for (let i = 0; i < 6; i++) K.fixed('mvx-a-afish mvx-a-school' + (s ? ' mvx-a-afishl' : ''), FISH('#8fd0ff', '#fff'), `top:${r0(y + (i % 3) * 18 - 18)}px;width:26px;--W:${W + 160}px;animation-delay:${S(d0 + i * 70)};animation-duration:1.6s`);
    }
    for (let i = 0; i < 14; i++) K.add('mvx-a-sbub', '', `left:${r0(rnd(0.05, 0.95) * G.sw)}px;--d:${r0(G.sh + 30)}px;animation-delay:${S(rnd(0, ms * 0.8))}`);
    K.word('おさかないっぱい!', 10, G.bb + 10, ms * 0.25, '#8fd0ff', 22, -6);
    K.word('シュッ', G.cx + 40, G.y + G.h * 0.3, ms * 0.55, '#fff', 24, 10);
  });

  // ---------------- 20. クラゲの群れ ----------------
  const JELLY = (c) => `<svg viewBox="0 0 60 90"><g class="mvx-a-tent"><path d="M14 40 Q8 56 16 70 Q22 82 14 90 M26 42 Q32 58 24 72 Q18 84 26 90 M36 42 Q30 58 38 72 Q42 82 36 90 M48 40 Q54 56 46 70 Q40 80 48 88" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/></g><path d="M4 40 Q4 4 30 4 Q56 4 56 40 Q48 36 42 42 Q36 36 30 42 Q24 36 18 42 Q12 36 4 40 Z" fill="${c}" fill-opacity=".85" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M14 22 Q18 12 28 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="24" cy="28" r="2.6" fill="${INK}"/><circle cx="36" cy="28" r="2.6" fill="${INK}"/><ellipse cx="18" cy="33" rx="3.5" ry="2" fill="#ff6b9f" opacity=".6"/><ellipse cx="42" cy="33" rx="3.5" ry="2" fill="#ff6b9f" opacity=".6"/></svg>`;
  def('jellyfish', 'float', 3800, (K, G, ms) => {
    K.back('#1c2a5c', 0.8);
    K.dark('#1c2a5c', 0.85, 0.08, 0.9);
    const W = window.innerWidth, H = window.innerHeight;
    const cols = ['#ff9fbb', '#c9a7ff', '#8fd0ff', '#8fe8c8', '#ffd94a', '#fff'];
    for (let i = 0; i < 16; i++) {
      const w = rnd(34, 74);
      K.fixed('mvx-a-jelly', `<div class="mvx-a-jellyin" style="animation-delay:${S(-rnd(0, 800))}">${JELLY(cols[i % cols.length])}</div>`, `left:${r0(rnd(0.02, 0.9) * W)}px;width:${r0(w)}px;--H:${H + 160}px;--sx:${r0(rnd(-60, 60))}px;animation-delay:${S(rnd(0, ms * 0.3))};animation-duration:${S(rnd(ms * 0.5, ms * 0.65))}`);
    }
    for (let i = 0; i < 12; i++) K.add('mvx-a-sbub', '', `left:${r0(rnd(0.05, 0.95) * G.sw)}px;--d:${r0(G.sh + 30)}px;animation-delay:${S(rnd(0, ms * 0.8))}`);
    K.word('ふわ…ふわ…', 10, G.bb + 14, ms * 0.25, '#c9a7ff', 22, -6);
  });

  // 画面に固定のけむり
  const fpuff = (K, x, y, delay, n = 5, spread = 40, cls = '') => {
    for (let i = 0; i < n; i++) K.fixed('mvx-a-smk ' + cls, '', `left:${r0(x + rnd(-spread, spread))}px;top:${r0(y + rnd(-spread * 0.6, spread * 0.6))}px;--s:${rnd(0.8, 1.6).toFixed(2)};--dx:${r0(rnd(-30, 30))}px;animation-delay:${S(delay + rnd(0, 120))}`);
  };
  const LEAF = (c) => `<svg viewBox="0 0 100 60"><path d="M4 30 Q30 -4 70 6 Q92 14 98 30 Q92 46 70 54 Q30 64 4 30 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M4 30 Q50 26 96 30 M30 28 L44 14 M30 32 L44 46 M56 28 L68 12 M56 32 L68 48" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/></svg>`;

  // ---------------- 21. 海の底、泡がいっぱい ----------------
  def('bubblesea', 'bubbles', 3600, (K, G, ms) => {
    K.back('#4fb6c9', 0.6);
    K.add('mvx-a-seabg', '', '');
    K.add('mvx-a-sand', '<i></i><i></i><i></i>', `top:${r0(G.y + G.h * 0.9)}px`);
    for (let i = 0; i < 4; i++) K.add('mvx-a-weed', '', `left:${r0((0.08 + i * 0.28) * G.sw)}px;height:${r0(G.sh * rnd(0.25, 0.4))}px;animation-delay:${S(-rnd(0, 1500))}`);
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < 46; i++) {
      const s = rnd(10, 46);
      K.fixed('mvx-a-fbub', '', `left:${r0(rnd(0, 1) * W)}px;width:${r0(s)}px;height:${r0(s)}px;--H:${H + 60}px;--sx:${r0(rnd(-30, 30))}px;animation-delay:${S(ms * 0.08 + rnd(0, ms * 0.55))};animation-duration:${S(rnd(900, 1600))}`);
    }
    K.inBtn('mvx-a-catbubble', '');
    K.word('ぶくぶくぶく', 10, G.bb + 10, ms * 0.12, '#8fd0ff', 26, -6);
    K.word('ぱちんっ', G.cx + 30, G.y + G.h * 0.1, ms * 0.84, '#fff', 26, 8);
    K.burst(G.cx, G.y + G.h * 0.45, ms * 0.84, 14, 90, ['#fff', '#bfe6ff', '#8fd0ff'], 10);
  });

  // ---------------- 22. 砂嵐とラクダ ----------------
  const CAMEL = `<svg viewBox="0 0 200 150"><g class="mvx-a-bleg"><path d="M60 92 L56 146 M84 94 L86 146" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></g><g class="mvx-a-bleg mvx-a-bleg2"><path d="M128 92 L124 146 M150 90 L156 146" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></g><path d="M44 96 Q36 70 56 64 Q66 30 86 60 Q102 70 114 60 Q132 26 146 60 Q166 66 160 96 Q120 104 44 96 Z" fill="#e7b877" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M160 92 Q176 90 172 120" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 74 Q30 64 26 40 Q24 22 10 20 Q2 18 4 30 Q6 36 14 36 Q22 40 22 54 Q24 78 48 92 Z" fill="#e7b877" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="12" cy="26" r="2.6" fill="${INK}"/><path d="M14 12 L18 20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M78 62 Q100 50 122 60" stroke="#ff6b6b" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`;
  const WEED = `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="none" stroke="#c27f4a" stroke-width="4"/><path d="M8 26 Q30 8 52 30 Q30 52 10 34 Q26 20 44 34 Q30 44 20 30 M16 14 Q36 40 46 14 M14 46 Q30 22 48 46" fill="none" stroke="#a46a3b" stroke-width="3" stroke-linecap="round"/></svg>`;
  def('desert', 'komari', 3800, (K, G, ms) => {
    K.back('#e7b877', 0.75);
    K.add('mvx-a-sun', '', '');
    K.add('mvx-a-dune', '', `top:${r0(G.y + G.h * 0.82)}px`);
    const cw = Math.min(G.w * 1.1, G.sw * 0.7);
    K.add('mvx-a-camel', CAMEL, `left:0;width:${r0(cw)}px;top:${r0(G.y + G.h * 0.95 - cw * 0.73)}px;--x0:${r0(G.sw + 10)}px;--x1:${r0(-cw - 10)}px`);
    K.add('mvx-a-tumble', WEED, `top:${r0(G.y + G.h * 0.95 - 46)}px;--x0:${r0(-60)}px;--x1:${r0(G.sw + 60)}px`);
    K.fixed('mvx-a-sandstorm', '', '');
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < 40; i++) K.fixed('mvx-a-grain', '', `top:${r0(rnd(0, 1) * H)}px;--W:${W + 40}px;animation-delay:${S(rnd(0, ms * 0.8))};animation-duration:${S(rnd(350, 700))}`);
    K.word('ビュオオオ', 10, G.bb + 10, ms * 0.15, '#e7b877', 26, -8);
    K.word('ザザザ…', G.sw - 120, G.y + G.h * 0.4, ms * 0.5, '#fff', 22, 8);
  });

  // ---------------- 23. ジャングル ----------------
  def('jungle', 'leafhead', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = G.px + G.cx, cy = G.py + G.y + G.h * 0.5;
    const greens = ['#6fcfae', '#8fe8c8', '#4fb38a', '#a8e07a', '#7fd36b'];
    for (let i = 0; i < 42; i++) {
      const x = rnd(-0.1, 1.1) * W, y = rnd(-0.08, 1.08) * H;
      const a = Math.atan2(y - cy, x - cx), w = rnd(120, 200);
      K.fixed('mvx-a-bigleaf', `<div class="mvx-a-leafin" style="--r:${r0(a * 180 / Math.PI + rnd(-30, 30))}deg">${LEAF(greens[i % greens.length])}</div>`, `left:${r0(x - w / 2)}px;top:${r0(y - w * 0.3)}px;width:${r0(w)}px;--ox:${r0(Math.cos(a) * W * 0.9)}px;--oy:${r0(Math.sin(a) * H * 0.7)}px;animation-delay:${S(rnd(0, ms * 0.12))}`);
    }
    for (let i = 0; i < 5; i++) K.add('mvx-a-vine', '<i></i>', `left:${r0((0.1 + i * 0.2) * G.sw)}px;height:${r0(G.sh * rnd(0.3, 0.55))}px;animation-delay:${S(ms * 0.5 + i * 60)}`);
    K.word('ガサガサ…', 10, G.bb + 20, ms * 0.08, '#4fb38a', 24, -6);
    K.word('ばあっ!!', G.cx - 60, G.bb + 6, ms * 0.6, '#ffd94a', 38, -8);
    K.stars(14, 800, [10, 90, 20, 90], ['✿', '❀', '✿', '✦']);
  });

  // ---------------- 24. 雪崩 ----------------
  const SNOWTOP = (() => { let d = 'M0 40'; for (let i = 0; i < 10; i++) d += ` q15 ${-(18 + (i % 3) * 8)} 30 0`; return `<svg viewBox="0 0 300 60" preserveAspectRatio="none"><path d="${d} V60 H0 Z" fill="#fbfdff"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="3.5" vector-effect="non-scaling-stroke"/></svg>`; })();
  def('avalanche', 'gaan', 3600, (K, G, ms) => {
    K.back('#dfeeff', 0.7);
    K.rain(26, '<i class="mvx-a-flake"></i>', { delayMax: ms * 0.8, dur: [900, 1500], size: [8, 14] });
    const top = G.y + G.h * 0.8;
    for (let i = 0; i < 4; i++) K.add('mvx-a-snowball', '', `left:0;top:${r0(top - 20 + rnd(-10, 30))}px;width:${r0(rnd(26, 44))}px;--x0:${r0(G.sw + 40)}px;--x1:${r0(-60)}px;animation-delay:${S(ms * 0.12 + i * 110)}`);
    K.add('mvx-a-snowmass', `<div class="mvx-a-snowtop">${SNOWTOP}</div><i></i><i></i><i></i>`, `top:${r0(top)}px`);
    K.flash(ms * 0.28, '#fff', 400);
    K.word('ゴゴゴゴ…', 10, G.bb + 14, ms * 0.04, '#8fd0ff', 24, -6);
    K.word('ドサーッ!!', G.cx - 90, G.bb + 10, ms * 0.28, '#fff', 34, -8);
    K.word('ぷはっ', G.cx + 30, G.y + G.h * 0.2, ms * 0.82, '#8fd0ff', 26, 8);
    K.burst(G.cx, top, ms * 0.82, 16, 100, ['#fff', '#e8f6ff', '#bfe6ff'], 14);
  });

  // ---------------- 25. 氷河期 ----------------
  def('iceage', 'freeze', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = G.px + G.cx, cy = G.py + G.y + G.h * 0.5;
    let cr = '';
    for (let i = 0; i < 9; i++) {
      const a = (Math.PI * 2 * i) / 9 + rnd(-0.2, 0.2);
      let x = cx, y = cy, d = `M${r0(cx)} ${r0(cy)}`;
      for (let k = 1; k <= 5; k++) { const r = k * Math.max(W, H) / 4.5, aa = a + rnd(-0.2, 0.2); x = cx + Math.cos(aa) * r; y = cy + Math.sin(aa) * r; d += ` L${r0(x)} ${r0(y)}`; }
      cr += `<path d="${d}" pathLength="100"/>`;
    }
    K.fixed('mvx-a-ice', `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="mvx-a-icecrack">${cr}</svg>`, `--cx:${r0(cx)}px;--cy:${r0(cy)}px`);
    K.inBtn('mvx-a-icecube', '');
    for (let i = 0; i < 16; i++) K.fixed('mvx-a-shard', `<svg viewBox="0 0 40 40"><path d="M${r0(rnd(0, 14))} ${r0(rnd(0, 10))} L${r0(rnd(26, 40))} ${r0(rnd(4, 18))} L${r0(rnd(8, 30))} ${r0(rnd(30, 40))} Z" fill="#cfefff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`, `left:${r0(rnd(0, W))}px;top:${r0(rnd(0, H * 0.8))}px;width:${r0(rnd(26, 60))}px;--rot:${r0(rnd(-300, 300))}deg;--sx:${r0(rnd(-80, 80))}px;--fy:${r0(H * 0.6)}px;animation-delay:${S(ms * 0.62 + rnd(0, 150))}`);
    K.flash(ms * 0.62, '#e8f8ff', 400);
    K.word('カチーン…', 10, G.bb + 14, ms * 0.16, '#8fd0ff', 26, -6);
    K.word('パリーン!!', G.cx - 80, G.bb + 8, ms * 0.63, '#fff', 34, -8);
    K.word('さむっ', G.sw - 90, G.y + G.h * 0.4, ms * 0.8, '#8fd0ff', 24, 8);
  });

  // ---------------- 26. 和太鼓 ----------------
  const DRUMFACE = `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="#c2414b" stroke="${INK}" stroke-width="6"/><circle cx="100" cy="100" r="78" fill="#fff3d6" stroke="${INK}" stroke-width="5"/>${[...Array(16)].map((_, i) => { const a = i * Math.PI / 8; return `<circle cx="${(100 + Math.cos(a) * 87).toFixed(1)}" cy="${(100 + Math.sin(a) * 87).toFixed(1)}" r="3.6" fill="#ffd94a" stroke="${INK}" stroke-width="2"/>`; }).join('')}<g transform="translate(100 100)">${[0, 120, 240].map((r) => `<path transform="rotate(${r})" d="M0 -6 Q-2 -40 26 -44 Q46 -44 44 -24 Q42 -8 22 -10 Q30 -24 18 -26 Q2 -24 0 -6 Z" fill="${INK}"/>`).join('')}</g></svg>`;
  const BEATS = [0.12, 0.24, 0.36, 0.42, 0.54, 0.66, 0.72, 0.84];
  def('taikodrum', 'taiko', 3400, (K, G, ms) => {
    K.back('#c2414b', 0.35);
    const sz = Math.min(G.sw * 0.95, G.sh * 0.95);
    K.add('mvx-a-drumface', DRUMFACE, `left:${r0(G.cx - sz / 2)}px;top:${r0(G.y + G.h * 0.55 - sz / 2)}px;width:${r0(sz)}px`);
    const cx = G.px + G.cx, cy = G.py + G.y + G.h * 0.75;
    BEATS.forEach((b, i) => {
      K.fixed('mvx-a-sring', '', `left:${r0(cx)}px;top:${r0(cy)}px;animation-delay:${S(ms * b)}`);
      const big = i === 3 || i === 7;
      K.word(i === 2 || i === 6 ? 'カッ!' : 'ドン!', i % 2 ? G.sw - (big ? 140 : 100) : 10, G.bb + 10 + (i % 3) * 30, ms * b, i === 2 || i === 6 ? '#fff' : '#ffd94a', big ? 40 : 30, i % 2 ? 8 : -8);
    });
    K.add('mvx-a-beatbg', '', '');
    K.burst(G.cx, G.y + G.h * 0.7, ms * 0.84, 20, 140, ['#ffd94a', '#ff6b6b', '#fff']);
  });

  // ---------------- 27. お祭り ----------------
  const LANTERN = `<svg viewBox="0 0 40 60"><path d="M20 0 V6" stroke="${INK}" stroke-width="3"/><rect x="10" y="5" width="20" height="6" rx="2" fill="${INK}"/><path d="M8 11 Q-2 30 8 49 L32 49 Q42 30 32 11 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M5 20 H35 M3 30 H37 M5 40 H35" stroke="${INK}" stroke-width="1.8" opacity=".45"/><text x="20" y="35" text-anchor="middle" font-size="15" font-weight="900" fill="#fff" stroke="${INK}" stroke-width="1" font-family="serif">祭</text><rect x="10" y="49" width="20" height="6" rx="2" fill="${INK}"/></svg>`;
  const MIKOSHI = `<svg viewBox="0 0 200 140"><rect x="0" y="104" width="200" height="12" rx="6" fill="#d79a62" stroke="${INK}" stroke-width="4"/><rect x="40" y="70" width="120" height="44" fill="#ff6b6b" stroke="${INK}" stroke-width="5"/><path d="M52 78 H148 M52 104 H148" stroke="#ffd94a" stroke-width="5"/><rect x="88" y="82" width="24" height="20" fill="#ffd94a" stroke="${INK}" stroke-width="3"/><path d="M20 72 Q100 30 180 72 Z" fill="#ffd94a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M30 120 V140 M170 120 V140" stroke="${INK}" stroke-width="5"/><path d="M14 72 Q6 82 10 92 M186 72 Q194 82 190 92" stroke="#ff9fbb" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  def('matsuri', 'banzai', 3800, (K, G, ms) => {
    K.back('#ffa95e', 0.55);
    K.dark('#6a3a7a', 0.45, 0.08, 0.9);
    const n = Math.max(5, Math.round(G.sw / 56));
    [0.04, 0.2].forEach((yf, row) => {
      let h = `<svg class="mvx-a-string" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 2 Q50 26 100 2" fill="none" stroke="${INK}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; h += `<div class="mvx-a-lantern" style="left:${(t * 100).toFixed(1)}%;top:${(Math.sin(t * Math.PI) * 16 + 2).toFixed(0)}px;animation-delay:${S(-i * 230 - row * 400)}">${LANTERN}</div>`; }
      K.add('mvx-a-lanterns', h, `top:${r0(G.sh * yf)}px`);
    });
    const mw = Math.min(G.w * 1.25, G.sw * 0.9), mh = mw * 0.7, lift = G.h * 0.3;
    K.add('mvx-a-mikoshi', MIKOSHI, `left:${r0(G.cx - mw / 2)}px;top:${r0(G.y + G.h * 0.94 - lift - mh * 0.36)}px;width:${r0(mw)}px;--b:${r0(G.h * 0.08)}px`);
    catVars({ '--a-lift': -lift + 'px', '--a-b': r0(G.h * 0.08) + 'px' }, ms);
    [-1, 1].forEach((sd, i) => K.add('mvx-a-bearer', mini('banzai', i ? '#ffd94a' : '#ff9fbb'), `left:${r0(G.cx + sd * mw * 0.48 - G.w * 0.2)}px;top:${r0(G.sh - G.w * 0.4 * 0.83 - 4)}px;width:${r0(G.w * 0.4)}px;--b:${r0(G.h * 0.08)}px`));
    [0.18, 0.38, 0.58, 0.78].forEach((f, i) => K.word('わっしょい!', i % 2 ? G.sw - 150 : 10, G.bb + 10 + (i % 2) * 34, ms * f, i % 2 ? '#fff' : '#ffd94a', 26, i % 2 ? 8 : -8));
    K.rain(20, () => `<i class="mvx-a-conf" style="background:${pick(POP)}"></i>`, { delayMax: ms * 0.7, dur: [1200, 1800], size: [8, 12], cls: 'mvx-flutter' });
  });

  // ---------------- 28. 獅子舞 ----------------
  const SHISHI = `<svg viewBox="0 0 200 170"><path d="M150 60 Q200 50 260 70 L260 160 Q200 150 150 140 Z" fill="#4fb38a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M170 80 q10 -12 20 0 t20 0 M180 110 q10 -12 20 0 t20 0 M170 136 q10 -12 20 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g class="mvx-a-jaw"><path d="M20 100 Q24 150 100 152 Q160 150 166 104 Z" fill="#c2414b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M34 104 L44 118 L54 104 L64 118 L74 104 L84 118 L94 104 L104 118 L114 104 L124 118 L134 104 L144 118 L154 104" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>
    <path d="M10 92 Q4 20 90 14 Q170 12 176 80 Q178 100 166 104 L20 104 Q10 104 10 92 Z" fill="#e2404b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M30 104 L40 90 L50 104 L60 90 L70 104 L80 90 L90 104 L100 90 L110 104 L120 90 L130 104 L140 90 L150 104 L160 90" fill="#ffd94a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="60" cy="52" rx="20" ry="18" fill="#ffd94a" stroke="${INK}" stroke-width="4"/><ellipse cx="124" cy="52" rx="20" ry="18" fill="#ffd94a" stroke="${INK}" stroke-width="4"/><circle cx="64" cy="54" r="8" fill="${INK}"/><circle cx="128" cy="54" r="8" fill="${INK}"/><path d="M38 28 Q58 14 80 26 M104 26 Q124 14 146 28" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M80 72 Q92 64 104 72 Q92 82 80 72 Z" fill="${INK}"/><path d="M20 20 Q30 0 46 12 M150 12 Q164 0 172 22" stroke="${INK}" stroke-width="5" fill="#ffd94a" stroke-linejoin="round"/></svg>`;
  def('shishimai', 'gaan', 3600, (K, G, ms) => {
    K.back('#ffd94a', 0.45);
    const w = Math.min(G.w * 1.05, G.sw * 0.8);
    K.add('mvx-a-shishi', SHISHI, `left:${r0(G.cx - w * 0.42)}px;top:${r0(G.y - w * 0.12)}px;width:${r0(w)}px;--x0:${r0(G.sw)}px;--x1:${r0(-G.sw)}px;--dy:${r0(G.h * 0.3)}px`);
    K.add('mvx-a-kami', '', '');
    K.word('シャンシャン♪', 10, G.bb + 10, ms * 0.1, '#ffd94a', 22, -6);
    K.word('ぱくっ!!', G.cx - 70, G.bb + 6, ms * 0.42, '#ff6b6b', 38, -8);
    K.word('もぐもぐ', G.sw - 120, G.y + G.h * 0.55, ms * 0.52, '#fff', 24, 8);
    K.word('えんぎがいい!', 10, G.y + G.h * 0.45, ms * 0.74, '#ffd94a', 24, -6);
    K.burst(G.cx, G.y + G.h * 0.3, ms * 0.7, 16, 100);
  });

  // ---------------- 29. 歌舞伎 ----------------
  const KUMA = `<svg viewBox="0 0 240 200"><g fill="none" stroke="#e2232f" stroke-width="5" stroke-linecap="round"><path d="M98 84 Q86 70 70 60 Q84 66 96 74"/><path d="M144 84 Q156 70 172 60 Q158 66 146 74"/><path d="M92 98 Q84 108 82 122"/><path d="M150 98 Q158 108 160 122"/><path d="M112 66 Q121 54 130 66"/></g><g fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"><path d="M92 74 L110 80 M150 74 L132 80"/></g></svg>`;
  def('kabuki', 'doya', 3600, (K, G, ms) => {
    K.add('mvx-a-kbg', '', '');
    K.add('mvx-a-curtain', '', '');
    K.inBtn('mvx-a-kuma', KUMA);
    K.add('mvx-a-kbars', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.45)}px`);
    K.add('mvx-a-hyoshi', '<i></i><i></i>', `left:${r0(G.sw - 70)}px;top:${r0(Math.max(G.bb + 6, 6))}px`);
    K.word('カンッ!', G.sw - 120, G.bb + 50, ms * 0.04, '#fff', 24, 8);
    K.word('カカカカ…', 10, G.bb + 14, ms * 0.24, '#fff', 22, -6);
    K.word('よっ!てんぷる屋!', G.cx - 110, G.bb + 10, ms * 0.5, '#ffd94a', 28, -6);
    K.flash(ms * 0.47, '#fff', 260, false);
  });

  // ---------------- 30. 忍者の大群 ----------------
  def('ninjaarmy', 'ninja', 3600, (K, G, ms) => {
    K.back('#2b2550', 0.55);
    K.dark('#2b2550', 0.5, 0.08, 0.9);
    const W = window.innerWidth, H = window.innerHeight;
    fpuff(K, G.px + G.cx, G.py + G.y + G.h * 0.6, ms * 0.08, 6, 40);
    for (let i = 0; i < 16; i++) {
      const w = rnd(70, 110), x = rnd(0, W - w), y = rnd(0.02, 0.85) * H, d0 = ms * 0.12 + rnd(0, ms * 0.5), dur = rnd(700, 1100);
      K.fixed('mvx-a-ninja', mini(pick(['sneak', 'punch', 'jump', 'stare', 'salute']), pick(['#4a4466', '#3b3550', '#56507a'])), `left:${r0(x)}px;top:${r0(y)}px;width:${r0(w)}px;animation-delay:${S(d0)};animation-duration:${S(dur)}`);
      fpuff(K, x + w / 2, y + w * 0.45, d0, 3, 26);
      fpuff(K, x + w / 2, y + w * 0.45, d0 + dur - 120, 3, 26);
    }
    for (let i = 0; i < 10; i++) K.fixed('mvx-a-shuriken' + (i % 2 ? ' mvx-a-shurikenl' : ''), '', `top:${r0(rnd(0.05, 0.9) * H)}px;--W:${W + 60}px;animation-delay:${S(ms * 0.15 + rnd(0, ms * 0.6))}`);
    fpuff(K, G.px + G.cx, G.py + G.y + G.h * 0.6, ms * 0.84, 6, 40);
    K.word('ドロン!', G.cx - 50, G.bb + 10, ms * 0.08, '#c9a7ff', 32, -8);
    K.word('ニンニン', G.sw - 120, G.y + G.h * 0.4, ms * 0.5, '#fff', 24, 8);
    K.word('ドロン!', 14, G.y + G.h * 0.3, ms * 0.84, '#c9a7ff', 28, -6);
  });

  // 画面に固定のマンガ文字（画面の写しより上に出す）
  const fword = (K, text, x, y, delay, color = '#ffd94a', size = 34, rot = -8) => K.fixed('mvx-word mvx-a-fword', text, `left:${r0(x)}px;top:${r0(y)}px;color:${color};font-size:${size}px;--r:${rot}deg;animation-delay:${S(delay)}`);
  // 画面のある四角を写して、べつの四角にうつす（マンガのコマなど）
  function mapSnap(K, cls, src, dst, style = '') {
    const k = dst[2] / src[2];
    return snap(K, cls, src[0], src[1], src[2], src[3], `transform-origin:0 0;--tf:translate(${r0(dst[0] - src[0])}px, ${r0(dst[1] - src[1])}px) scale(${k.toFixed(3)});${style}`);
  }
  // 小さなドット絵（rows の文字 → pal の色）
  const pix = (rows, pal) => {
    const w = rows[0].length, h = rows.length;
    let r = '';
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) r += `<rect x="${x}" y="${y}" width="1.05" height="1.05" fill="${pal[ch]}"/>`; }));
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${r}</svg>`;
  };
  const pxFilter = (id, n) => `<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feFlood x="${Math.floor(n / 2)}" y="${Math.floor(n / 2)}" width="1" height="1" flood-color="#000"/><feComposite width="${n}" height="${n}"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="${Math.ceil(n / 2)}"/></filter>`;

  // ---------------- 31. 侍、画面を斬る ----------------
  const KATANA = `<svg viewBox="0 0 40 200"><path d="M20 4 Q28 60 24 140 L16 140 Q16 60 20 4 Z" fill="#eef4ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M21 14 Q25 70 22 136" stroke="#fff" stroke-width="2" fill="none"/><rect x="6" y="140" width="28" height="7" rx="3" fill="#ffd94a" stroke="${INK}" stroke-width="3"/><rect x="14" y="147" width="12" height="46" rx="4" fill="#3b3550" stroke="${INK}" stroke-width="3"/><path d="M14 156 L26 164 M14 168 L26 176 M14 180 L26 188" stroke="#fff" stroke-width="2"/></svg>`;
  def('samurai', 'stare', 3200, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.inBtn('mvx-a-katana', KATANA);
    const y1 = H * 0.72, y2 = H * 0.28;
    const up = snap(K, 'mvx-a-cutup', 0, 0, W, H, `clip-path:polygon(0 0, ${W}px 0, ${W}px ${r0(y2)}px, 0 ${r0(y1)}px)`);
    const dn = snap(K, 'mvx-a-cutdn', 0, 0, W, H, `clip-path:polygon(0 ${r0(y1)}px, ${W}px ${r0(y2)}px, ${W}px ${H}px, 0 ${H}px)`);
    const len = Math.hypot(W, y1 - y2), ang = Math.atan2(y2 - y1, W) * 180 / Math.PI;
    K.fixed('mvx-a-slash', '', `left:0;top:${r0(y1)}px;width:${r0(len)}px;--a:${ang.toFixed(1)}deg`);
    K.fixed('mvx-a-slashglow', '', `left:0;top:${r0(y1)}px;width:${r0(len)}px;--a:${ang.toFixed(1)}deg`);
    K.flash(ms * 0.27, '#fff', 300);
    fword(K, '斬!!', W * 0.08, H * 0.18, ms * 0.28, '#ff6b6b', 64, -10);
    fword(K, 'スパッ', W * 0.55, H * 0.6, ms * 0.3, '#fff', 30, 8);
    fword(K, 'カチン', W * 0.34, H * 0.44, ms * 0.72, '#ffd94a', 30, -6);
    K.word('…シャキン', 10, G.bb + 14, ms * 0.04, '#cfd6e6', 22, -6);
    void up; void dn;
  });

  // ---------------- 32. 温泉 ----------------
  const ROCKS = `<svg viewBox="0 0 300 50" preserveAspectRatio="none">${[...Array(9)].map((_, i) => `<ellipse cx="${i * 36 + 12}" cy="${30 + (i % 2) * 6}" rx="24" ry="${16 + (i % 3) * 3}" fill="${['#b9c0cc', '#a7aebb', '#c8ced8'][i % 3]}" stroke="${INK}" stroke-width="3.5" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
  def('onsen', 'bath', 3800, (K, G, ms) => {
    K.back('#ffc9b0', 0.6);
    K.add('mvx-a-noren', '<i>ゆ</i>', '');
    const top = G.y + G.h * 0.9;
    K.add('mvx-a-hotwater', `<div class="mvx-a-wave">${wave('#9fe3e0')}</div><div class="mvx-a-rocks">${ROCKS}</div>`, `top:${r0(top)}px`);
    K.add('mvx-a-oke', `<svg viewBox="0 0 60 40"><path d="M6 8 H54 L48 36 H12 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="30" cy="8" rx="24" ry="5" fill="#fff6c2" stroke="${INK}" stroke-width="3"/><path d="M14 22 H46" stroke="${INK}" stroke-width="2.5"/></svg>`, `left:${r0(Math.min(G.x + G.w * 0.85, G.sw - 60))}px;top:${r0(top - 34)}px`);
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < 22; i++) { const s = rnd(110, 220); K.fixed('mvx-a-steam', '', `left:${r0(rnd(-0.1, 0.9) * W)}px;top:${r0(rnd(0.3, 1) * H)}px;width:${r0(s)}px;height:${r0(s * 0.8)}px;animation-delay:${S(ms * 0.2 + rnd(0, ms * 0.4))}`); }
    for (let i = 0; i < 5; i++) K.add('mvx-a-yuge', '♨', `left:${r0(rnd(0.05, 0.85) * G.sw)}px;top:${r0(top - 30)}px;animation-delay:${S(ms * 0.15 + i * 300)}`);
    K.word('ちゃぽん', 10, G.bb + 14, ms * 0.14, '#9fe3e0', 24, -6);
    K.word('いいゆだな〜', G.sw - 160, G.y + G.h * 0.3, ms * 0.5, '#fff', 22, 6);
  });

  // ---------------- 33. 回転寿司 ----------------
  const SUSHI = (c) => `<svg viewBox="0 0 60 36"><ellipse cx="30" cy="26" rx="28" ry="9" fill="${c}" stroke="${INK}" stroke-width="3"/><ellipse cx="30" cy="24" rx="20" ry="5" fill="#fffdf8" stroke="${INK}" stroke-width="2"/><rect x="16" y="12" width="28" height="12" rx="6" fill="#fffdf8" stroke="${INK}" stroke-width="3"/><path d="M14 14 Q30 2 46 12 Q46 18 40 16 Q30 10 16 18 Z" fill="${pick(['#ff9f7a', '#ff6b6b', '#ffd94a', '#ffb3a0'])}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M24 10 L22 16 M32 8 L30 14 M40 10 L38 16" stroke="#fff" stroke-width="2" opacity=".7"/></svg>`;
  def('kaitenzushi', 'sushi', 3800, (K, G, ms) => {
    K.back('#ffe7c2', 0.6);
    const plates = ['#8fd0ff', '#ff9fbb', '#ffd94a', '#8fe8c8', '#c9a7ff'];
    const lane = (y, n, cls) => { let h = ''; for (let i = 0; i < n * 2; i++) h += `<div class="mvx-a-plate">${SUSHI(plates[i % 5])}</div>`; return K.add('mvx-a-lane ' + cls, `<div class="mvx-a-lanein">${h}</div>`, `top:${r0(y)}px`); };
    lane(G.y + G.h * 0.84, 6, 'mvx-a-lane1');
    lane(Math.max(G.bb + 10, G.sh * 0.32), 6, 'mvx-a-lane2');
    K.inBtn('mvx-a-catplate', SUSHI('#ff9fbb').replace(/<rect[\s\S]*$/, '</svg>'));
    K.word('へいらっしゃい!', 10, G.bb + 10, ms * 0.08, '#ff6b6b', 24, -6);
    K.word('まわるー', G.sw - 110, G.y + G.h * 0.3, ms * 0.4, '#fff', 24, 8);
  });

  // ---------------- 34. ごちそうの雨 ----------------
  const FOODS = [
    FISH('#8fd0ff'),
    `<svg viewBox="0 0 60 56"><path d="M30 4 Q40 4 52 34 Q58 52 30 52 Q2 52 8 34 Q20 4 30 4 Z" fill="#fffdf8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="18" y="32" width="24" height="20" fill="#3b4a3b" stroke="${INK}" stroke-width="3"/><circle cx="24" cy="22" r="2" fill="${INK}" opacity=".3"/></svg>`,
    `<svg viewBox="0 0 60 56"><path d="M4 50 L30 8 L56 50 Z" fill="#fff3d6" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M12 38 L48 38" stroke="#ff9fbb" stroke-width="6"/><path d="M4 50 L56 50" stroke="${INK}" stroke-width="3.5"/><path d="M30 8 Q22 0 28 -4 Q36 -4 34 6 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/></svg>`,
    `<svg viewBox="0 0 30 70"><path d="M15 30 V68" stroke="#d79a62" stroke-width="4"/><circle cx="15" cy="10" r="9" fill="#ff9fbb" stroke="${INK}" stroke-width="3"/><circle cx="15" cy="26" r="9" fill="#fffdf8" stroke="${INK}" stroke-width="3"/><circle cx="15" cy="42" r="9" fill="#8fe8c8" stroke="${INK}" stroke-width="3"/></svg>`,
    `<svg viewBox="0 0 40 70"><path d="M8 26 L20 68 L32 26 Z" fill="#e7b877" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="20" cy="18" r="15" fill="#ffd3e0" stroke="${INK}" stroke-width="3"/><circle cx="14" cy="10" r="3" fill="#ff6b6b"/></svg>`,
    `<svg viewBox="0 0 70 40"><path d="M10 20 Q8 6 30 8 L60 14 Q66 20 60 26 L30 32 Q8 34 10 20 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M60 14 L68 8 L66 20 L68 32 L60 26" fill="#ff6b6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  ];
  def('foodrain', 'nyaa', 3400, (K, G, ms) => {
    K.back('#ffd3e0', 0.6);
    K.rain(44, (i) => FOODS[i % FOODS.length], { delayMax: ms * 0.6, delay0: ms * 0.06, dur: [1100, 1700], size: [34, 66], parent: document.body, cls: 'mvx-fixed mvx-a-food' });
    K.word('いただきまーす!', 10, G.bb + 10, ms * 0.08, '#ff9fbb', 26, -6);
    K.word('もぐもぐ', G.sw - 110, G.y + G.h * 0.4, ms * 0.5, '#fff', 24, 8);
  });

  // ---------------- 35. 巨大ケーキ ----------------
  const CAKE = `<svg viewBox="0 0 200 220"><g class="mvx-a-candles">${[60, 100, 140].map((x) => `<rect x="${x - 5}" y="8" width="10" height="30" rx="3" fill="${x === 100 ? '#8fd0ff' : '#ff9fbb'}" stroke="${INK}" stroke-width="3"/><path class="mvx-a-flick" d="M${x} -10 Q${x + 9} 2 ${x} 8 Q${x - 9} 2 ${x} -10 Z" fill="#ffd94a" stroke="${INK}" stroke-width="2.5"/>`).join('')}</g><g class="mvx-a-ctop"><rect x="40" y="36" width="120" height="50" rx="10" fill="#ffd3e0" stroke="${INK}" stroke-width="5"/><path d="M40 50 Q50 64 60 50 Q70 64 80 50 Q90 64 100 50 Q110 64 120 50 Q130 64 140 50 Q150 64 160 50 L160 44 Q160 36 150 36 L50 36 Q40 36 40 44 Z" fill="#fffdf8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g><rect x="20" y="84" width="160" height="60" rx="10" fill="#fff3d6" stroke="${INK}" stroke-width="5"/><path d="M20 96 H180" stroke="#ff9fbb" stroke-width="7"/>${[44, 76, 108, 140, 166].map((x) => `<circle cx="${x}" cy="84" r="9" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/>`).join('')}<rect x="4" y="142" width="192" height="70" rx="12" fill="#ffd3e0" stroke="${INK}" stroke-width="5"/><path d="M4 160 Q24 176 44 160 Q64 176 84 160 Q104 176 124 160 Q144 176 164 160 Q184 176 196 160" fill="none" stroke="#fffdf8" stroke-width="7"/><path d="M4 160 Q24 176 44 160 Q64 176 84 160 Q104 176 124 160 Q144 176 164 160 Q184 176 196 160" fill="none" stroke="${INK}" stroke-width="2.5"/><rect x="-6" y="208" width="212" height="12" rx="6" fill="#fffdf8" stroke="${INK}" stroke-width="4"/></svg>`;
  def('cake', 'banzai', 3600, (K, G, ms) => {
    K.back('#ffd3e0', 0.6);
    const ch = Math.min(G.h * 1.12, G.sh - G.bb - 8), cw = Math.min(ch / 1.1, G.sw * 0.92);
    const ctop = G.sh - ch + 2;
    K.add('mvx-a-cake', CAKE, `left:${r0(G.cx - cw / 2)}px;top:${r0(ctop)}px;width:${r0(cw)}px`);
    catVars({ '--a-lift': r0(ctop + ch * 0.38 - (G.y + G.h * 0.95)) + 'px' }, ms);
    K.burst(G.cx, ctop + ch * 0.2, ms * 0.46, 22, 140, ['#fffdf8', '#ffd3e0', '#ff6b6b', '#ffd94a'], 14);
    K.puffs(G.cx, ctop + ch * 0.2, 6, ms * 0.46, 60);
    K.rain(28, () => `<i class="mvx-a-conf" style="background:${pick(POP)}"></i>`, { delayMax: ms * 0.4, delay0: ms * 0.46, dur: [1200, 1700], size: [8, 12], cls: 'mvx-flutter' });
    K.word('ゴゴゴ…', 10, G.bb + 14, ms * 0.12, '#ff9fbb', 24, -6);
    K.word('ハッピー!!', G.cx - 90, G.bb + 8, ms * 0.48, '#ffd94a', 36, -8);
  });

  // ---------------- 36. お菓子の家 ----------------
  const CANDYHOUSE = `<svg viewBox="0 0 240 220">
    <g class="mvx-a-ch mvx-a-ch1"><rect x="40" y="96" width="160" height="118" rx="6" fill="#d79a62" stroke="${INK}" stroke-width="5"/><path d="M40 112 Q50 120 60 112 Q70 120 80 112 Q90 120 100 112 Q110 120 120 112 Q130 120 140 112 Q150 120 160 112 Q170 120 180 112 Q190 120 200 112" stroke="#fffdf8" stroke-width="5" fill="none"/></g>
    <g class="mvx-a-ch mvx-a-ch2"><path d="M20 104 L120 18 L220 104 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M20 104 Q34 118 46 104 Q60 120 74 104 Q88 118 100 104 Q114 120 128 104 Q142 118 154 104 Q168 120 182 104 Q196 118 208 104 L220 104" fill="#fffdf8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M70 62 H170 M48 84 H192" stroke="#fffdf8" stroke-width="4" stroke-dasharray="10 8"/></g>
    <g class="mvx-a-ch mvx-a-ch3"><rect x="160" y="22" width="22" height="44" fill="#c9a7ff" stroke="${INK}" stroke-width="4"/><circle cx="174" cy="12" r="10" fill="#fffdf8" stroke="${INK}" stroke-width="3"/><circle cx="186" cy="2" r="8" fill="#fffdf8" stroke="${INK}" stroke-width="3"/></g>
    <g class="mvx-a-ch mvx-a-ch4"><rect x="58" y="128" width="40" height="36" rx="4" fill="#fff6c2" stroke="${INK}" stroke-width="4"/><path d="M78 128 V164 M58 146 H98" stroke="${INK}" stroke-width="3"/><rect x="142" y="128" width="40" height="36" rx="4" fill="#fff6c2" stroke="${INK}" stroke-width="4"/><path d="M162 128 V164 M142 146 H182" stroke="${INK}" stroke-width="3"/></g>
    <g class="mvx-a-ch mvx-a-ch5"><circle cx="120" cy="40" r="11" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/><circle cx="90" cy="66" r="9" fill="#8fe8c8" stroke="${INK}" stroke-width="3"/><circle cx="150" cy="66" r="9" fill="#ffd94a" stroke="${INK}" stroke-width="3"/><circle cx="62" cy="88" r="8" fill="#8fd0ff" stroke="${INK}" stroke-width="3"/><circle cx="178" cy="88" r="8" fill="#c9a7ff" stroke="${INK}" stroke-width="3"/></g>
    <g class="mvx-a-ch mvx-a-ch6"><path d="M14 214 V150" stroke="${INK}" stroke-width="5"/><circle cx="14" cy="142" r="16" fill="#ff9fbb" stroke="${INK}" stroke-width="4"/><path d="M14 142 m0 -10 a10 10 0 1 1 -8 14" stroke="#fffdf8" stroke-width="4" fill="none"/><path d="M226 214 V160 Q226 140 212 142 Q202 146 206 156" stroke="#ff6b6b" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M226 214 V160 Q226 140 212 142 Q202 146 206 156" stroke="#fffdf8" stroke-width="8" stroke-dasharray="6 6" fill="none"/></g>
  </svg>`;
  const CANDY = (c) => `<svg viewBox="0 0 60 30"><path d="M16 15 L2 4 L4 26 Z M44 15 L58 4 L56 26 Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="30" cy="15" rx="16" ry="12" fill="${c}" stroke="${INK}" stroke-width="3"/><path d="M22 8 Q26 15 22 22 M30 4 Q34 15 30 26 M38 8 Q42 15 38 22" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/></svg>`;
  def('candyhouse', 'kira', 3800, (K, G, ms) => {
    K.back('#ffd3e0', 0.65);
    const hw = Math.min(G.sw * 0.95, (G.sh - G.bb - 6) * 1.09), hh = hw / 1.09;
    K.add('mvx-a-candyhouse', CANDYHOUSE, `left:${r0(G.cx - hw / 2)}px;top:${r0(G.sh - hh)}px;width:${r0(hw)}px`);
    K.rain(22, (i) => CANDY(POP[i % 6]), { delayMax: ms * 0.6, delay0: ms * 0.2, dur: [1100, 1600], size: [30, 48] });
    K.stars(20, ms * 0.8, [5, 95, 10, 90], ['✦', '♥', '✧', '★']);
    K.word('トントン…', 10, G.bb + 14, ms * 0.08, '#d79a62', 22, -6);
    K.word('あまーい!', G.sw - 130, G.y + G.h * 0.3, ms * 0.6, '#ff9fbb', 28, 8);
  });

  // ---------------- 37. ポップアート ----------------
  def('popart', 'peace', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#ffd94a', 1);
    const tiles = [[1, -1, 'mvx-a-pa1'], [-1, 1, 'mvx-a-pa2'], [1, 1, 'mvx-a-pa3']];
    tiles.forEach(([sx, sy, c]) => snap(K, 'mvx-a-patile ' + c, 0, 0, W, H, `--tx:${r0(sx * W / 4)}px;--ty:${r0(sy * H / 4)}px`));
    K.fixed('mvx-a-pagrid', '<i></i><i></i>', '');
    K.fixed('mvx-a-dots', '', '');
    fword(K, 'POP!', W * 0.06, H * 0.08, ms * 0.2, '#ff6b6b', 40, -12);
    fword(K, 'NYA!', W * 0.58, H * 0.56, ms * 0.36, '#8fd0ff', 40, 10);
    fword(K, 'WOW!', W * 0.58, H * 0.08, ms * 0.5, '#8fe8c8', 36, 8);
    fword(K, 'ART!', W * 0.08, H * 0.58, ms * 0.62, '#c9a7ff', 36, -8);
  });

  // ---------------- 38. マンガのコマ ----------------
  def('comic', 'gaan', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    const pg = K.fixed('mvx-a-comicpage', '<div class="mvx-a-paper"></div>', '');
    const own = (el) => { pg.appendChild(el); return el; };
    const m = 12, gap = 10;
    const st = { x: G.px, y: G.py, w: G.sw, h: G.sh };
    const fit = (cx, cy, aspect, w) => { const h = w / aspect; return [cx - w / 2, cy - h / 2, w, h]; };
    const P = [
      [m, m + 20, W - m * 2, H * 0.3],
      [m, m + 20 + H * 0.3 + gap, (W - m * 2 - gap) * 0.55, H * 0.28],
      [m + (W - m * 2 - gap) * 0.55 + gap, m + 20 + H * 0.3 + gap, (W - m * 2 - gap) * 0.45, H * 0.28],
      [m, m + 20 + H * 0.58 + gap * 2, W - m * 2, H - (m + 20 + H * 0.58 + gap * 2) - m],
    ];
    const hx = G.px + G.cx, hy = G.py + G.y + G.h * 0.45;
    const srcs = [
      fit(st.x + st.w / 2, st.y + st.h * 0.55, P[0][2] / P[0][3], st.w),
      fit(hx, hy, P[1][2] / P[1][3], G.w * 0.7),
      null,
      fit(hx, G.py + G.y + G.h * 0.6, P[3][2] / P[3][3], G.w * 1.6),
    ];
    P.forEach((p, i) => {
      const d = ms * (0.06 + i * 0.1);
      if (srcs[i]) { const b = own(mapSnap(K, 'mvx-a-panel' + (i === 3 ? ' mvx-a-panelht' : ''), srcs[i], p)); b.style.animationDelay = S(d); }
      else own(K.fixed('mvx-a-panelfx', `<div class="mvx-a-pcat">${mini('gaan')}</div>`, `left:${r0(p[0])}px;top:${r0(p[1])}px;width:${r0(p[2])}px;height:${r0(p[3])}px;animation-delay:${S(d)}`));
      own(K.fixed('mvx-a-pframe', '', `left:${r0(p[0])}px;top:${r0(p[1])}px;width:${r0(p[2])}px;height:${r0(p[3])}px;animation-delay:${S(d)}`));
    });
    own(fword(K, 'えっ!?', P[1][0] + 8, P[1][1] + 6, ms * 0.2, '#fff', 30, -8));
    own(fword(K, '!?', P[2][0] + P[2][2] * 0.5, P[2][1] + 6, ms * 0.3, '#ff6b6b', 44, 10));
    own(fword(K, 'ドーン!!', P[3][0] + 10, P[3][1] + 10, ms * 0.42, '#ffd94a', 40, -8));
    own(K.fixed('mvx-a-pbubble', '…なにこれ', `left:${r0(P[0][0] + P[0][2] * 0.55)}px;top:${r0(P[0][1] + 10)}px;animation-delay:${S(ms * 0.12)}`));
  });

  // ---------------- 39. 白黒映画 ----------------
  def('film', 'upright', 3600, (K, G, ms) => {
    K.fixed('mvx-a-lbox mvx-a-lboxt', '', '');
    K.fixed('mvx-a-lbox mvx-a-lboxb', '', '');
    K.fixed('mvx-a-grain2', '', '');
    for (let i = 0; i < 4; i++) K.fixed('mvx-a-scratch', '', `left:${r0(rnd(0.05, 0.95) * window.innerWidth)}px;animation-delay:${S(-rnd(0, 600))};animation-duration:${S(rnd(300, 700))}`);
    K.fixed('mvx-a-leader', '<i></i><b>3</b><b>2</b><b>1</b>', '');
    K.fixed('mvx-a-endcard', '<span>〜 おしまい 〜</span>', '');
    K.word('カタカタカタ…', 10, G.bb + 14, ms * 0.22, '#fff', 22, -6);
  });

  // ---------------- 40. 8bit（レトロゲーム） ----------------
  const QBLOCK = pix(['kkkkkkkkkk', 'kooooooook', 'kooowwwook', 'koowkkowok', 'kooookwwok', 'koooowwkok', 'koooookook', 'koooowwook', 'kooooooook', 'kkkkkkkkkk'], { k: INK, o: '#ffd94a', w: '#fff' });
  const COIN = pix(['..kkkk..', '.kyyyyk.', 'kyywyyyk', 'kyywyyyk', 'kyywyyyk', 'kyywyyyk', '.kyyyyk.', '..kkkk..'], { k: INK, y: '#ffd94a', w: '#fff' });
  const HEART = pix(['.kk.kk.', 'krrkrrk', 'krrrrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'], { k: INK, r: '#ff6b6b' });
  def('retro', 'game', 3400, (K, G, ms) => {
    defs(K, pxFilter('mvxa-px5', 5));
    K.fixed('mvx-a-scan', '', '');
    K.fixed('mvx-a-hud', `<span class="mvx-a-hearts">${HEART}${HEART}${HEART}</span><span>SCORE <b class="mvx-a-score"><i>000100</i><i>000300</i></b></span>`, '');
    const bs = Math.max(30, G.w * 0.2);
    const qt = Math.max(G.bb + 4, G.y - bs * 0.6);
    K.add('mvx-a-qblock', QBLOCK, `left:${r0(G.cx - bs / 2)}px;top:${r0(qt)}px;width:${r0(bs)}px`);
    catVars({ '--a-jump': r0(Math.min(-20, qt + bs - (G.y + G.h * 0.22))) + 'px' }, ms);
    K.add('mvx-a-pcoin', COIN, `left:${r0(G.cx - bs * 0.4)}px;top:${r0(Math.max(G.bb + 4, G.y - bs * 0.6))}px;width:${r0(bs * 0.8)}px`);
    for (let i = 0; i < 6; i++) K.add('mvx-a-pcoin2', COIN, `left:${r0((0.08 + i * 0.16) * G.sw)}px;top:${r0(G.sh * (0.25 + (i % 2) * 0.12))}px;width:${r0(bs * 0.6)}px;animation-delay:${S(-i * 120)}`);
    K.add('mvx-a-ground8', '', '');
    K.word('ピコーン!', G.cx + 20, G.bb + 10, ms * 0.36, '#ffd94a', 24, 0);
    K.word('1UP', 10, G.y + G.h * 0.3, ms * 0.66, '#8fe8c8', 24, 0);
  });

  // ---------------- 41. ネオンの夜 ----------------
  const NEONS = [
    `<svg viewBox="0 0 120 50"><text x="60" y="38" text-anchor="middle" font-size="36" font-weight="900" font-family="var(--pop), sans-serif" fill="none" stroke="currentColor" stroke-width="3">ねこ</text></svg>`,
    `<svg viewBox="0 0 60 56"><path d="M30 52 Q4 34 6 18 Q8 4 20 4 Q28 4 30 14 Q32 4 40 4 Q52 4 54 18 Q56 34 30 52 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
    `<svg viewBox="0 0 70 60"><path d="M10 54 Q4 30 12 6 L26 22 Q35 18 44 22 L58 6 Q66 30 60 54 Q35 64 10 54 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="25" cy="36" r="3.5" fill="currentColor"/><circle cx="45" cy="36" r="3.5" fill="currentColor"/></svg>`,
    `<svg viewBox="0 0 60 60"><path d="M30 4 L37 23 L57 23 L41 35 L47 55 L30 43 L13 55 L19 35 L3 23 L23 23 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
    `<svg viewBox="0 0 110 44"><text x="55" y="33" text-anchor="middle" font-size="28" font-weight="900" font-family="sans-serif" fill="none" stroke="currentColor" stroke-width="2.5">OPEN</text><rect x="4" y="4" width="102" height="36" rx="8" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  ];
  const SKYLINE = (() => { let d = '', w = ''; let x = 0; const hs = [50, 80, 60, 100, 70, 90, 55, 85, 65, 95]; hs.forEach((h, i) => { const bw = 30; d += `<rect x="${x}" y="${120 - h}" width="${bw}" height="${h + 4}" fill="#1c1640" stroke="#000" stroke-width="2"/>`; for (let yy = 120 - h + 8; yy < 112; yy += 14) for (let xx = x + 6; xx < x + bw - 6; xx += 10) if ((xx + yy + i) % 3) w += `<rect x="${xx}" y="${yy}" width="5" height="6" fill="${pick(['#ffd94a', '#ff9fbb', '#8fd0ff'])}"/>`; x += bw; }); return `<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMax slice">${d}${w}</svg>`; })();
  def('neon', 'shades', 3600, (K, G, ms) => {
    K.back('#120a2a', 0.9);
    K.dark('#120a2a', 0.88, 0.08, 0.9);
    K.add('mvx-a-skyline', SKYLINE, `height:${r0(G.sh * 0.42)}px`);
    const spots = [[0.06, 0.08, 0, '#ff4fd8', 110], [0.7, 0.06, 1, '#4ff3ff', 54], [0.06, 0.5, 2, '#ffe14f', 62], [0.78, 0.42, 3, '#7dff6b', 54], [0.62, 0.72, 4, '#ff6b6b', 92]];
    spots.forEach(([x, y, k, c, w], i) => K.add('mvx-a-neon', NEONS[k], `left:${r0(x * G.sw)}px;top:${r0(Math.max(y * G.sh, k === 0 || k === 1 ? G.bb + 4 : 0))}px;width:${w}px;color:${c};--c:${c};--d:${S(ms * (0.1 + i * 0.09))}`));
    K.add('mvx-a-neonframe', '', '');
    K.word('ピカッ', G.sw - 100, G.bb + 30, ms * 0.2, '#ff4fd8', 24, 8);
  });

  // ---------------- 42. レーザーショー ----------------
  def('laser', 'shades', 3400, (K, G, ms) => {
    K.back('#0d0b22', 0.9);
    K.dark('#0d0b22', 0.85, 0.06, 0.92);
    const W = window.innerWidth, H = window.innerHeight;
    const emit = [[0, H, -20, -75, '#5dff7a'], [W, H, -160, -105, '#ff4fd8'], [W * 0.5, H, -150, -30, '#4ff3ff'], [0, H * 0.55, -40, 30, '#ffe14f'], [W, H * 0.55, -140, -210, '#ff6b6b'], [W * 0.5, 0, 40, 140, '#c9a7ff']];
    emit.forEach(([x, y, a0, a1, c], i) => {
      for (let k = 0; k < 2; k++) K.fixed('mvx-a-laser', '', `left:${r0(x)}px;top:${r0(y)}px;--a0:${a0 + k * 12}deg;--a1:${a1 - k * 12}deg;--c:${c};--d:${S(ms * 0.08 + i * 90)};--du:${S(rnd(500, 800))}`);
      K.fixed('mvx-a-emitter', '', `left:${r0(x)}px;top:${r0(y)}px;--c:${c}`);
    });
    K.fixed('mvx-a-haze', '', '');
    K.add('mvx-a-floor', '', `top:${r0(G.y + G.h * 0.9)}px`);
    K.word('ビビビビ', 10, G.bb + 14, ms * 0.12, '#5dff7a', 24, -6);
    K.word('フゥーッ!', G.sw - 130, G.y + G.h * 0.4, ms * 0.5, '#ff4fd8', 28, 8);
  });

  // ---------------- 43. ホログラム ----------------
  def('hologram', 'upright', 3400, (K, G, ms) => {
    K.back('#0e2340', 0.75);
    K.dark('#0e2340', 0.8, 0.06, 0.92);
    K.add('mvx-a-holocone', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.05)}px;height:${r0(G.h * 0.95)}px;width:${r0(G.w * 0.95)}px`);
    K.add('mvx-a-holobase', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.96)}px;width:${r0(G.w * 0.7)}px`);
    K.inBtn('mvx-a-holor', catNow());
    K.inBtn('mvx-a-holob', catNow());
    K.inBtn('mvx-a-holoscan', '');
    for (let i = 0; i < 3; i++) K.add('mvx-a-hexring', '', `left:${r0(G.cx)}px;top:${r0(G.y + G.h * 0.55)}px;width:${r0(G.w * (0.7 + i * 0.25))}px;height:${r0(G.w * (0.7 + i * 0.25))}px;animation-delay:${S(-i * 500)}`);
    K.word('ピピ…ザザッ', 10, G.bb + 14, ms * 0.12, '#4ff3ff', 22, -6);
    K.word('3Dです', G.sw - 100, G.y + G.h * 0.4, ms * 0.5, '#4ff3ff', 24, 6);
  });

  // ---------------- 44. レントゲン ----------------
  const BONES = `<svg viewBox="0 0 240 200"><g fill="none" stroke="#e8fbff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M86 66 L80 30 L102 50 Q121 44 140 50 L162 30 L156 66 Q166 92 150 110 Q121 124 92 110 Q76 92 86 66 Z"/>
    <circle cx="106" cy="82" r="8"/><circle cx="136" cy="82" r="8"/><path d="M117 96 L121 100 L125 96 M110 104 Q121 112 132 104"/>
    <path d="M121 118 L121 128 M121 134 L121 142 M121 148 L121 156 M121 162 L121 170" stroke-width="7"/>
    <path d="M121 132 Q96 132 92 146 M121 132 Q146 132 150 146 M121 146 Q100 146 98 158 M121 146 Q142 146 144 158"/>
    <path d="M102 174 Q121 166 140 174 Q138 184 121 184 Q104 184 102 174 Z"/>
    <path d="M104 182 L100 196 M138 182 L142 196 M96 196 h10 M136 196 h10" stroke-width="5"/>
    <path d="M150 178 Q178 176 184 154 Q190 132 180 118" stroke-dasharray="2 7" stroke-width="7"/>
  </g></svg>`;
  def('xray', 'freeze', 3400, (K, G, ms) => {
    const pw = Math.min(G.w * 0.75, G.sw * 0.5), ph = G.h * 1.08;
    const px = G.x + G.w * 0.5 - pw / 2;
    K.add('mvx-a-xpanel', `<div class="mvx-a-xbones" style="left:${r0(G.x - px)}px;top:${r0(-G.h * 0.04)}px;width:${r0(G.w)}px;--sx:${r0(G.sw * 0.5 + pw)}px">${BONES}</div><i></i>`, `left:${r0(px)}px;top:${r0(G.y - G.h * 0.04)}px;width:${r0(pw)}px;height:${r0(ph)}px;--sx:${r0(G.sw * 0.5 + pw)}px`);
    K.inBtn('mvx-a-xfull', BONES);
    K.add('mvx-a-xbg', '', '');
    K.word('ピッ…ピッ…', 10, G.bb + 14, ms * 0.08, '#8fd0ff', 22, -6);
    K.word('ほね!!', G.sw - 110, G.y + G.h * 0.3, ms * 0.6, '#e8fbff', 32, 8);
    K.flash(ms * 0.56, '#e8fbff', 300);
  });

  // ---------------- 45. 蜃気楼 ----------------
  const PALM = `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="108" rx="54" ry="10" fill="#8fd0ff" stroke="${INK}" stroke-width="3"/><path d="M62 104 Q58 70 66 40" stroke="#c27f4a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M66 40 Q40 26 18 40 Q40 34 62 44 M66 40 Q92 24 112 40 Q90 34 70 44 M66 40 Q54 10 34 8 Q54 20 64 42 M66 40 Q82 12 102 12 Q82 22 68 42" fill="#6fcfae" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  def('mirage', 'atsui', 3600, (K, G, ms) => {
    defs(K, `<filter id="mvxa-heat" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" baseFrequency="0.008 0.05" numOctaves="1" seed="3" result="t"><animate attributeName="baseFrequency" dur="1.3s" values="0.008 0.045;0.011 0.07;0.008 0.045" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="t" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    K.back('#ffb36b', 0.65);
    K.add('mvx-a-heatsky', '', '');
    K.add('mvx-a-bigsun', '', '');
    K.add('mvx-a-dune', '', `top:${r0(G.y + G.h * 0.86)}px`);
    K.add('mvx-a-oasis', PALM, `left:${r0(G.sw * 0.62)}px;top:${r0(G.y + G.h * 0.86 - 70)}px;width:80px`);
    K.add('mvx-a-ghostcat', catNow(), `left:${r0(G.x - G.w * 0.6)}px;top:${r0(G.y + G.h * 0.05)}px;width:${r0(G.w * 0.6)}px`);
    for (let i = 0; i < 6; i++) K.add('mvx-a-heatline', '〰', `left:${r0((0.08 + i * 0.16) * G.sw)}px;top:${r0(G.y + G.h * 0.8)}px;animation-delay:${S(i * 260)}`);
    K.word('ゆら…ゆら…', 10, G.bb + 14, ms * 0.12, '#ffa95e', 24, -6);
    K.word('あつい…', G.sw - 110, G.y + G.h * 0.3, ms * 0.5, '#ff6b6b', 24, 8);
  });

  // ---------------- 46. うず ----------------
  const SPIRAL = (() => { const cols = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#c9a7ff', '#ffa95e']; let p = ''; for (let k = 0; k < 6; k++) { let d = ''; for (let t = 0; t <= 60; t++) { const a = t * 0.12 + k * Math.PI / 3, r = t * 1.7; d += `${t ? 'L' : 'M'}${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)} `; } p += `<path d="${d}" fill="none" stroke="${cols[k]}" stroke-width="16" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`; } return `<svg viewBox="0 0 200 200">${p}</svg>`; })();
  def('vortex', 'gaan', 3600, (K, G, ms) => {
    K.back('#c9a7ff', 0.9);
    K.fixed('mvx-a-spiral', SPIRAL, '');
    const W = window.innerWidth, H = window.innerHeight;
    fword(K, 'ぐるぐる〜', W * 0.06, H * 0.1, ms * 0.2, '#ff9fbb', 32, -10);
    fword(K, 'すいこまれる〜', W * 0.3, H * 0.8, ms * 0.45, '#ffd94a', 28, 8);
    fword(K, 'もどった!', W * 0.3, H * 0.2, ms * 0.88, '#8fe8c8', 30, -6);
  });

  // ---------------- 47. ズームアウト（地球まで） ----------------
  const TOWNMAP = (W, H, cx, cy, aw, ah) => {
    let s = `<rect width="${W}" height="${H}" fill="#cfeec0"/>`;
    const rx = cx - aw / 2 - 10, ry = cy - ah / 2 - 10;
    s += `<path d="M0 ${r0(ry - 18)} H${W} M0 ${r0(ry + ah + 38)} H${W} M${r0(rx - 18)} 0 V${H} M${r0(rx + aw + 38)} 0 V${H}" stroke="#fffdf8" stroke-width="14"/><path d="M0 ${r0(ry - 18)} H${W} M0 ${r0(ry + ah + 38)} H${W} M${r0(rx - 18)} 0 V${H} M${r0(rx + aw + 38)} 0 V${H}" stroke="${INK}" stroke-width="2" stroke-dasharray="8 8" opacity=".4"/>`;
    s += `<path d="M${r0(W * 0.75)} 0 Q${r0(W * 0.9)} ${r0(H * 0.3)} ${r0(W * 0.7)} ${r0(H * 0.55)} T${r0(W * 0.8)} ${H}" stroke="#8fd0ff" stroke-width="22" fill="none"/>`;
    for (let i = 0; i < 26; i++) {
      const x = rnd(0, W), y = rnd(0, H);
      if (Math.abs(x - cx) < aw / 2 + 30 && Math.abs(y - cy) < ah / 2 + 30) continue;
      if (i % 3) s += `<g transform="translate(${r0(x)} ${r0(y)})"><rect x="-12" y="-6" width="24" height="18" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/><path d="M-15 -5 L0 -16 L15 -5 Z" fill="${pick(['#ff9fbb', '#8fd0ff', '#ffa95e', '#c9a7ff'])}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g>`;
      else s += `<circle cx="${r0(x)}" cy="${r0(y)}" r="10" fill="#6fcfae" stroke="${INK}" stroke-width="2.5"/>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s}</svg>`;
  };
  const JAPAN = (W, H, cx, cy) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#8fd0ff"/><g transform="translate(${r0(cx)} ${r0(cy)}) scale(${(Math.min(W, H) / 260).toFixed(2)})" fill="#a8e07a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M0 -6 Q14 -26 22 -60 Q30 -90 50 -110 Q60 -100 52 -80 Q40 -50 30 -20 Q22 4 -6 14 Q-40 20 -70 34 Q-96 44 -110 60 Q-118 50 -104 38 Q-80 16 -50 6 Q-20 0 0 -6 Z"/><path d="M50 -124 Q70 -150 100 -146 Q108 -128 84 -120 Q66 -112 50 -124 Z"/><path d="M-112 66 Q-100 60 -96 76 Q-104 100 -122 96 Q-126 80 -112 66 Z"/><path d="M-80 52 Q-62 46 -58 54 Q-66 64 -82 62 Z"/></g><circle cx="${r0(cx)}" cy="${r0(cy)}" r="7" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/></svg>`;
  const GLOBE = (W, H, cx, cy) => { const R = Math.min(W, H) * 0.3; return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#151a3a"/>${[...Array(40)].map(() => `<circle cx="${r0(rnd(0, W))}" cy="${r0(rnd(0, H))}" r="${rnd(0.8, 2.2).toFixed(1)}" fill="#fff"/>`).join('')}<g transform="translate(${r0(cx + R * 0.25)} ${r0(cy + R * 0.3)})"><circle r="${r0(R)}" fill="#8fd0ff" stroke="${INK}" stroke-width="5"/><path d="M${r0(-R * 0.25)} ${r0(-R * 0.3)} q8 -18 16 -26 q8 8 -2 22 z M${r0(-R * 0.7)} ${r0(-R * 0.1)} q20 -40 40 -20 q10 30 -20 40 q-24 4 -20 -20 z M${r0(R * 0.1)} ${r0(R * 0.2)} q30 -10 40 20 q-10 30 -30 20 q-20 -10 -10 -40 z" fill="#8fe8c8" stroke="${INK}" stroke-width="3"/></g><circle cx="${r0(cx)}" cy="${r0(cy)}" r="6" fill="#ff6b6b" stroke="${INK}" stroke-width="2.5"/></svg>`; };
  def('zoomout', 'wave', 3800, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = G.px + G.cx, cy = G.py + G.y + G.h * 0.5;
    const ar = byId('app').getBoundingClientRect();
    vars(document.documentElement, { '--a-zo': `${r0(cx - ar.left)}px ${r0(cy - ar.top)}px` }, ms);
    const st = `transform-origin:${r0(cx)}px ${r0(cy)}px`;
    K.fixed('mvx-a-zl mvx-a-zearth', GLOBE(W, H, cx, cy), st);
    K.fixed('mvx-a-zl mvx-a-zjapan', JAPAN(W, H, cx, cy), st);
    K.fixed('mvx-a-zl mvx-a-ztown', TOWNMAP(W, H, cx, cy, W * 0.2, ar.height * 0.2), st);
    K.fixed('mvx-a-zpin', '<b>ここ!</b>', `left:${r0(cx)}px;top:${r0(cy)}px`);
    fword(K, 'ぐーん…', W * 0.08, H * 0.12, ms * 0.15, '#fff', 28, -8);
    fword(K, 'ちきゅう!', W * 0.5, H * 0.12, ms * 0.6, '#8fe8c8', 32, 8);
    fword(K, 'ただいま!', W * 0.2, H * 0.2, ms * 0.92, '#ffd94a', 30, -6);
  });

  // ---------------- 48. 3Dでくるっと ----------------
  def('tilt3d', 'blink', 3000, (K, G, ms) => {
    K.back('#8fd0ff', 0.9);
    K.fixed('mvx-a-floorgrid', '', '');
    const W = window.innerWidth, H = window.innerHeight;
    fword(K, 'くるっ!', W * 0.1, H * 0.1, ms * 0.3, '#ffd94a', 34, -10);
    fword(K, '3D!', W * 0.66, H * 0.7, ms * 0.6, '#ff9fbb', 34, 10);
  });

  // ---------------- 49. サイコロ ----------------
  def('cube', 'stare', 3400, (K, G, ms) => {
    K.back('#c9a7ff', 0.95);
    const W = window.innerWidth, H = window.innerHeight;
    K.fixed('mvx-a-pips', '<i></i><i></i><i></i><i></i><i></i>', '');
    [0.22, 0.5, 0.78].forEach((f, i) => fword(K, ['コロン', 'コロロン', 'ころっ'][i], i % 2 ? W * 0.55 : W * 0.08, H * (0.12 + i * 0.3), ms * f, POP[i + 1], 30, i % 2 ? 8 : -8));
  });

  // ---------------- 50. 折り紙 ----------------
  const CRANE = `<svg viewBox="0 0 200 140"><path d="M100 70 L40 20 L96 84 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M100 70 L170 10 L104 84 Z" fill="#ffb3c9" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M60 92 L100 70 L140 92 L100 112 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M60 92 L20 60 L28 58 L74 88 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M20 60 L8 64 L22 54 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M140 92 L186 48 L176 50 L128 88 Z" fill="#ffb3c9" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
  def('papercraft', 'origami', 3800, (K, G, ms) => {
    // 3D の入れ子はこわれやすいので、平たい「ちぢむ→のびる」で折り紙をまねる
    const W = window.innerWidth, H = window.innerHeight, hx = r0(W / 2), hy = r0(H / 2);
    K.back('#fff1c9', 1);
    snap(K, 'mvx-a-ptop', 0, 0, W, hy);
    snap(K, 'mvx-a-pbotf', 0, hy, W, H - hy, `transform-origin:50% 0`);
    const paper = (cls, x, y, w, h) => K.fixed('mvx-a-ppaper ' + cls, '', `left:${x}px;top:${y}px;width:${w}px;height:${h}px`);
    paper('mvx-a-pyl', 0, 0, hx, hy);
    paper('mvx-a-pyr', hx, 0, W - hx, hy);
    paper('mvx-a-pgr', 0, 0, hx, hy);
    K.fixed('mvx-a-pcov', '', `left:${hx}px;top:0;width:${W - hx}px;height:${hy}px`);
    K.fixed('mvx-a-crane', CRANE, `left:${r0(W * 0.25)}px;top:${r0(hy * 0.3)}px`);
    fword(K, 'おりおり…', W * 0.12, H * 0.62, ms * 0.1, '#ff9fbb', 28, -6);
    fword(K, 'ぱっ!', W * 0.55, H * 0.6, ms * 0.46, '#ffd94a', 44, -8);
    fword(K, 'ひらいて…', W * 0.4, H * 0.7, ms * 0.66, '#8fe8c8', 26, 6);
  });

  // ---------------- 51. パズルがバラバラ ----------------
  // ピースの形（ふちの出っぱり）。s=0 はまっすぐ、+1 は外へ、-1 は内へ
  const jigPath = (bx, by, w, h, t, sides) => {
    const P = [[bx, by], [bx + w, by], [bx + w, by + h], [bx, by + h]];
    let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
    for (let k = 0; k < 4; k++) {
      const p0 = P[k], p1 = P[(k + 1) % 4], s = sides[k];
      const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), dx = (p1[0] - p0[0]) / L, dy = (p1[1] - p0[1]) / L, nx = dy, ny = -dx;
      if (s) {
        const r = t * 0.75, m = L / 2;
        const a = [p0[0] + dx * (m - r * 0.7), p0[1] + dy * (m - r * 0.7)], b = [p0[0] + dx * (m + r * 0.7), p0[1] + dy * (m + r * 0.7)];
        const c1 = [a[0] + nx * s * t * 1.25 - dx * r, a[1] + ny * s * t * 1.25 - dy * r], c2 = [b[0] + nx * s * t * 1.25 + dx * r, b[1] + ny * s * t * 1.25 + dy * r];
        d += ` L${a[0].toFixed(1)} ${a[1].toFixed(1)} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      }
      d += ` L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    }
    return d + ' Z';
  };
  def('puzzlebreak', 'puzzle', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight, C = 3, R = 5;
    const cw = W / C, ch = H / R, t = Math.min(cw, ch) * 0.2;
    const hs = [...Array(R)].map(() => [...Array(C)].map(() => (Math.random() < 0.5 ? 1 : -1)));
    const vs = [...Array(R)].map(() => [...Array(C)].map(() => (Math.random() < 0.5 ? 1 : -1)));
    K.back('#2b2b2b', 0.92);
    K.fixed('mvx-a-pzgrid', '', '');
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const x = c * cw - t, y = r * ch - t, w = cw + t * 2, h = ch + t * 2;
      const sides = [r ? -hs[r - 1][c] : 0, c < C - 1 ? vs[r][c] : 0, r < R - 1 ? hs[r][c] : 0, c ? -vs[r][c - 1] : 0];
      const ang = Math.atan2(r - (R - 1) / 2 + rnd(-0.4, 0.4), c - (C - 1) / 2 + rnd(-0.4, 0.4));
      const dist = rnd(0.1, 0.2) * Math.max(W, H);
      const wrap = K.fixed('mvx-a-pz', '', `left:${r0(x)}px;top:${r0(y)}px;width:${r0(w)}px;height:${r0(h)}px;--tx:${r0(Math.cos(ang) * dist)}px;--ty:${r0(Math.sin(ang) * dist)}px;--rt:${r0(rnd(-120, 120))}deg;--fx:${r0(rnd(-14, 14))}px;--fy:${r0(rnd(-14, 14))}px;animation-delay:${S(rnd(0, 120))}`);
      const sn = snap(K, 'mvx-a-pzface', x, y, w, h, `left:0;top:0;clip-path:path('${jigPath(t, t, cw, ch, t, sides)}')`);
      wrap.appendChild(sn);
    }
    fword(K, 'バラバラ〜!!', W * 0.12, H * 0.42, ms * 0.16, '#ffd94a', 40, -8);
    fword(K, 'カチッ!', W * 0.55, H * 0.6, ms * 0.82, '#8fe8c8', 36, 6);
    K.flash(ms * 0.84, '#fff', 260);
  });

  // ---------------- 52. モザイク ----------------
  const PXSIZES = [3, 6, 10, 16, 24];
  def('pixelate', 'game', 3200, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    defs(K, PXSIZES.map((n) => pxFilter('mvxa-pz' + n, n)).join(''));
    const cols = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#c9a7ff', '#ffa95e'];
    for (let i = 0; i < 46; i++) {
      const s = pick([12, 16, 20, 24]);
      K.fixed('mvx-a-pxbit', '', `left:${r0(Math.floor(rnd(0, W - s) / s) * s)}px;top:${r0(Math.floor(rnd(0, H - s) / s) * s)}px;width:${s}px;height:${s}px;background:${pick(cols)};animation-delay:${S(rnd(ms * 0.15, ms * 0.7))}`);
    }
    K.fixed('mvx-a-pxbar', '<b>LOADING</b><i></i>', `top:${r0(H * 0.72)}px`);
    fword(K, 'カクカク〜', W * 0.1, H * 0.62, ms * 0.24, '#8fd0ff', 30, -6);
    fword(K, 'もどった!', W * 0.5, H * 0.66, ms * 0.84, '#ffd94a', 30, 6);
  });

  // ---------------- 53. 金貨の雨 ----------------
  const GCOIN = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#ffd94a" stroke="${INK}" stroke-width="3.5"/><circle cx="20" cy="20" r="11" fill="none" stroke="#e0a800" stroke-width="2.5"/><ellipse cx="20" cy="23" rx="4.2" ry="3.4" fill="#e0a800"/><circle cx="14.5" cy="16.5" r="2" fill="#e0a800"/><circle cx="20" cy="14" r="2" fill="#e0a800"/><circle cx="25.5" cy="16.5" r="2" fill="#e0a800"/><path d="M10 12 Q14 7 20 6" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
  const GOLDPILE = `<svg viewBox="0 0 300 80" preserveAspectRatio="none"><path d="M-10 84 Q20 40 60 46 Q90 14 130 30 Q160 4 196 26 Q236 12 256 40 Q290 34 310 60 V84 Z" fill="#ffd94a" stroke="${INK}" stroke-width="4" vector-effect="non-scaling-stroke"/>${[...Array(14)].map((_, i) => `<ellipse cx="${10 + i * 21}" cy="${48 + (i % 3) * 9}" rx="9" ry="4" fill="#ffe98a" stroke="#c99400" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
  def('goldrain', 'banzai', 3400, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#ffe98a', 0.75);
    K.fixed('mvx-a-goldrays', '', `left:${r0(W / 2)}px;top:${r0(G.py + G.cy)}px`);
    K.rain(70, GCOIN, { parent: document.body, cls: 'mvx-fixed mvx-a-gcoin', delayMax: ms * 0.62, delay0: ms * 0.04, dur: [700, 1300], size: [22, 40] });
    K.fixed('mvx-a-goldpile', GOLDPILE, '');
    K.stars(16, ms * 0.8, [4, 96, 40, 96], ['✦', '★', '✧']);
    fword(K, '大当たり〜!!', W * 0.08, Math.max(G.py + G.sh + 12, H * 0.5), ms * 0.18, '#ffd94a', 42, -8);
    fword(K, 'ジャラジャラ', W * 0.36, Math.max(G.py + G.sh + 70, H * 0.62), ms * 0.42, '#fff', 28, 6);
    K.word('キラーン', G.sw - 120, G.bb + 8, ms * 0.6, '#ffd94a', 22, 8);
    for (let i = 0; i < 3; i++) fixedBurst(K, rnd(W * 0.2, W * 0.8), H - 30, ms * (0.3 + i * 0.18), 14, 120, ['#ffd94a', '#fff', '#ffe98a'], 10);
  });

  // ---------------- 54. スロット ----------------
  const CATFACE = `<svg viewBox="0 0 60 60"><path d="M10 26 L12 6 L26 16 Q30 15 34 16 L48 6 L50 26 Q56 50 30 54 Q4 50 10 26 Z" fill="#fffdf8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M16 12 L18 20 L23 16 Z M44 12 L42 20 L37 16 Z" fill="#ff9fbb"/><path d="M19 30 Q22 27 25 30 M35 30 Q38 27 41 30" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 37 Q30 40 33 37" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="17" cy="38" rx="4" ry="2.4" fill="#ff9fbb"/><ellipse cx="43" cy="38" rx="4" ry="2.4" fill="#ff9fbb"/><path d="M26 6 L30 -2 L34 6 Z" fill="#c9a7ff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  const SYMS = [
    `<svg viewBox="0 0 60 60"><path d="M30 8 Q34 24 44 28 M30 8 Q24 26 18 32" stroke="#4fb38a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="18" cy="40" r="12" fill="#ff6b6b" stroke="${INK}" stroke-width="3.5"/><circle cx="44" cy="36" r="12" fill="#ff6b6b" stroke="${INK}" stroke-width="3.5"/></svg>`,
    `<svg viewBox="0 0 60 60"><text x="30" y="50" text-anchor="middle" font-size="52" font-weight="900" fill="#ff6b6b" stroke="${INK}" stroke-width="3" paint-order="stroke" font-family="sans-serif">7</text></svg>`,
    `<svg viewBox="0 0 60 60"><path d="M30 8 Q46 10 46 34 L52 44 H8 L14 34 Q14 10 30 8 Z" fill="#ffd94a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="30" cy="50" r="5" fill="#ffd94a" stroke="${INK}" stroke-width="3"/></svg>`,
    `<svg viewBox="0 0 60 60"><path d="M30 6 L37 22 L54 23 L41 34 L45 51 L30 42 L15 51 L19 34 L6 23 L23 22 Z" fill="#8fd0ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
    CATFACE,
  ];
  def('jackpot', 'maneki', 3800, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#3a1d5c', 0.55);
    K.fixed('mvx-a-bulbs', '', '');
    const top = Math.min(G.py + G.sh + 6, H - 200), mh = Math.min(H - top - 8, 230), mw = Math.min(W * 0.92, 380);
    const strip = [...SYMS, ...SYMS].map((s) => `<i>${s}</i>`).join('');
    const reels = [0, 1, 2].map((i) => `<div class="mvx-a-reel"><div class="mvx-a-strip" style="animation-delay:${S(-i * 90)},${S(ms * (0.36 + i * 0.13))}">${strip}${strip}</div><div class="mvx-a-stop" style="animation-delay:${S(ms * (0.36 + i * 0.13))}">${CATFACE}</div></div>`).join('');
    K.fixed('mvx-a-slot', `<div class="mvx-a-slottitle">★ TEMPURA ★</div><div class="mvx-a-reels">${reels}</div><div class="mvx-a-payline"></div><div class="mvx-a-lever"><i></i></div>`, `left:${r0((W - mw) / 2)}px;top:${r0(top)}px;width:${r0(mw)}px;height:${r0(mh)}px`);
    [0, 1, 2].forEach((i) => fword(K, ['ピタッ', 'ピタッ', 'ピタッ!!'][i], (W - mw) / 2 + mw * (0.12 + i * 0.27), top + mh * 0.82, ms * (0.36 + i * 0.13), '#fff', 18, 0));
    K.flash(ms * 0.63, '#ffd94a', 420);
    fword(K, 'JACKPOT!!', W * 0.06, top - 10, ms * 0.64, '#ffd94a', 46, -8);
    fword(K, 'てんぷる×3', W * 0.3, top + 44, ms * 0.7, '#ff9fbb', 30, 6);
    fixedBurst(K, W / 2, top + mh * 0.45, ms * 0.64, 26, Math.max(W, H) * 0.5, ['#ffd94a', '#fff', '#ff9fbb', '#8fe8c8'], 14);
    K.rain(36, GCOIN, { parent: document.body, cls: 'mvx-fixed mvx-a-gcoin', delayMax: ms * 0.28, delay0: ms * 0.64, dur: [700, 1100], size: [20, 34] });
  });

  // ---------------- 55. くす玉 ----------------
  const KUSU = (side) => `<svg viewBox="0 0 100 100"><path d="${side ? 'M50 4 A46 46 0 0 1 50 96 Z' : 'M50 4 A46 46 0 0 0 50 96 Z'}" fill="#ffd94a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="${side ? 'M50 18 Q86 30 70 84 M50 50 H94' : 'M50 18 Q14 30 30 84 M50 50 H6'}" stroke="#ffb02e" stroke-width="5" fill="none"/><path d="${side ? 'M58 26 Q70 30 72 42' : 'M42 26 Q30 30 28 42'}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;
  const STREAMER = (c) => `<svg viewBox="0 0 30 140"><path d="M15 0 Q28 20 15 40 Q2 60 15 80 Q28 100 15 120 Q8 132 15 140" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M15 0 Q28 20 15 40 Q2 60 15 80 Q28 100 15 120 Q8 132 15 140" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
  const CONF = (i) => `<i class="mvx-a-conf" style="background:${POP[i % 7]}"></i>`;
  def('kusudama', 'clap', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#ffd6e4', 0.6);
    const bs = Math.max(48, Math.min(G.w * 0.42, 90));
    const bx = G.sw * 0.8, by = G.bb + 4;
    K.add('mvx-a-kusustring', '', `left:${r0(bx)}px;top:0;height:${r0(by + 2)}px`);
    K.add('mvx-a-kusul', KUSU(0), `left:${r0(bx - bs / 2)}px;top:${r0(by)}px;width:${r0(bs)}px`);
    K.add('mvx-a-kusur', KUSU(1), `left:${r0(bx - bs / 2)}px;top:${r0(by)}px;width:${r0(bs)}px`);
    const bl = Math.max(60, G.sh - by - bs * 0.5 - 8);
    K.add('mvx-a-banner', '<span>祝・てんぷる</span>', `left:${r0(bx - 20)}px;top:${r0(by + bs * 0.45)}px;height:${r0(bl)}px;--bl:${r0(bl)}px`);
    fixedBurst(K, G.px + bx, G.py + by + bs / 2, ms * 0.3, 24, Math.max(W, H) * 0.45, POP, 12);
    K.rain(70, CONF, { parent: document.body, cls: 'mvx-fixed mvx-a-confall', delayMax: ms * 0.55, delay0: ms * 0.3, dur: [1200, 2000], size: [8, 14] });
    for (let i = 0; i < 8; i++) K.fixed('mvx-a-streamer ' + (i % 2 ? 'mvx-a-streamr' : 'mvx-a-streaml'), STREAMER(POP[i % 6]), `${i % 2 ? 'right' : 'left'}:${r0(rnd(-10, 30))}px;--a:${r0(rnd(10, 40))}deg;--h:${r0(rnd(0.55, 0.9) * H)}px;animation-delay:${S(ms * 0.3 + i * 40)}`);
    K.word('パカッ!', bx - 110, by + bs * 0.2, ms * 0.3, '#ffd94a', 28, -8);
    fword(K, 'おめでと〜!!', W * 0.08, Math.min(H - 60, G.py + G.sh + 20), ms * 0.38, '#ff9fbb', 40, -6);
  });

  // ---------------- 56. 表彰台 ----------------
  const TROPHY = `<svg viewBox="0 0 100 120"><path d="M24 14 Q4 14 6 34 Q8 52 30 54" stroke="${INK}" stroke-width="11" fill="none"/><path d="M76 14 Q96 14 94 34 Q92 52 70 54" stroke="${INK}" stroke-width="11" fill="none"/><path d="M24 14 Q4 14 6 34 Q8 52 30 54" stroke="#ffd94a" stroke-width="5" fill="none"/><path d="M76 14 Q96 14 94 34 Q92 52 70 54" stroke="#ffd94a" stroke-width="5" fill="none"/><path d="M20 6 H80 Q82 60 54 72 L56 90 H44 L46 72 Q18 60 20 6 Z" fill="#ffd94a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><rect x="28" y="90" width="44" height="12" rx="3" fill="#ffd94a" stroke="${INK}" stroke-width="5"/><rect x="20" y="102" width="60" height="14" rx="3" fill="#c27f4a" stroke="${INK}" stroke-width="5"/><path d="M34 16 Q34 44 46 58" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><path d="M50 26 L54 34 L62 35 L56 40 L58 48 L50 44 L42 48 L44 40 L38 35 L46 34 Z" fill="#fff" stroke="${INK}" stroke-width="2"/></svg>`;
  const PODIUM = (n, c, h) => `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none"><rect x="3" y="3" width="94" height="${h + 10}" fill="${c}" stroke="${INK}" stroke-width="5" vector-effect="non-scaling-stroke"/></svg><b>${n}</b>`;
  def('trophy', 'crown', 3600, (K, G, ms) => {
    const W = window.innerWidth;
    K.back('#2a2350', 0.7);
    K.add('mvx-a-spot mvx-a-spotl', '', `left:${r0(G.sw * 0.1)}px`);
    K.add('mvx-a-spot mvx-a-spotr', '', `left:${r0(G.sw * 0.9)}px`);
    const ph = Math.min(G.h * 0.32, G.sh - G.y - G.h + G.h * 0.3), pw = Math.min(G.w * 0.95, G.sw * 0.34);
    const base = G.y + G.h * 0.92;
    K.add('mvx-a-pod mvx-a-pod1', PODIUM(1, '#ffd94a', 60), `left:${r0(G.cx - pw / 2)}px;top:${r0(base - G.h * 0.05)}px;width:${r0(pw)}px;height:${r0(G.sh)}px;--up:${r0(-ph)}px`);
    K.add('mvx-a-pod mvx-a-pod2', PODIUM(2, '#dfe6f2', 60), `left:${r0(G.cx - pw * 1.5)}px;top:${r0(base)}px;width:${r0(pw)}px;height:${r0(G.sh)}px;--up:${r0(-ph * 0.55)}px`);
    K.add('mvx-a-pod mvx-a-pod3', PODIUM(3, '#e3a26b', 60), `left:${r0(G.cx + pw / 2)}px;top:${r0(base)}px;width:${r0(pw)}px;height:${r0(G.sh)}px;--up:${r0(-ph * 0.35)}px`);
    const ms2 = pw * 0.8;
    K.add('mvx-a-podcat mvx-a-podcat2', mini('clap', '#8fd0ff'), `left:${r0(G.cx - pw * 1.5 + (pw - ms2) / 2)}px;top:${r0(base - ph * 0.55 - ms2 * 0.8)}px;width:${r0(ms2)}px`);
    K.add('mvx-a-podcat mvx-a-podcat3', mini('clap', '#ffa95e'), `left:${r0(G.cx + pw / 2 + (pw - ms2) / 2)}px;top:${r0(base - ph * 0.35 - ms2 * 0.8)}px;width:${r0(ms2)}px`);
    catVars({ '--a-up': r0(-ph) + 'px' }, ms);
    const ts = Math.max(34, G.w * 0.3);
    K.add('mvx-a-trophy', TROPHY, `left:${r0(G.cx + G.w * 0.28)}px;top:${r0(Math.max(G.bb + 2, G.y - ph + G.h * 0.1))}px;width:${r0(ts)}px`);
    K.add('mvx-a-trophyglow', '', `left:${r0(G.cx + G.w * 0.28 + ts / 2)}px;top:${r0(Math.max(G.bb + 2, G.y - ph + G.h * 0.1) + ts * 0.5)}px`);
    for (let i = 0; i < 6; i++) K.word('パチパチ', i % 2 ? G.sw - 110 : 8, G.bb + 8 + (i >> 1) * 34, ms * (0.4 + i * 0.07), i % 2 ? '#ffd94a' : '#fff', 18, i % 2 ? 8 : -8);
    fword(K, 'ゆうしょう!!', W * 0.1, G.py + G.sh + 14, ms * 0.36, '#ffd94a', 40, -6);
    K.rain(50, CONF, { parent: document.body, cls: 'mvx-fixed mvx-a-confall', delayMax: ms * 0.5, delay0: ms * 0.35, dur: [1200, 2000], size: [8, 14] });
    fixedBurst(K, G.px + G.cx, G.py + G.y, ms * 0.34, 20, 160, ['#ffd94a', '#fff'], 10);
  });

  // ---------------- 57. ゴールテープ ----------------
  const CROWD = (W) => { let s = ''; const n = Math.ceil(W / 34) + 1; for (let i = 0; i < n; i++) { const x = i * 34 + 6, c = POP[i % 6]; s += `<g class="mvx-a-fan" style="animation-delay:${S(-i * 130)}"><path d="M${x - 14} 70 Q${x - 14} 34 ${x} 34 Q${x + 14} 34 ${x + 14} 70 Z" fill="${c}" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="24" r="11" fill="#fffdf8" stroke="${INK}" stroke-width="3"/><path d="M${x - 9} 17 L${x - 8} 8 L${x - 2} 14 M${x + 9} 17 L${x + 8} 8 L${x + 2} 14" fill="#fffdf8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x + 12} 40 L${x + 20} 14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><rect x="${x + 14}" y="2" width="16" height="12" fill="${POP[(i + 2) % 6]}" stroke="${INK}" stroke-width="2.5"/></g>`; } return `<svg viewBox="0 0 ${n * 34} 70" preserveAspectRatio="xMinYMax slice">${s}</svg>`; };
  def('goaltape', 'banzai', 3400, (K, G, ms) => {
    const W = window.innerWidth;
    K.back('#bfe6ff', 0.6);
    K.add('mvx-a-crowd', CROWD(G.sw), '');
    const ty = G.y + G.h * 0.55;
    K.add('mvx-a-post mvx-a-postl', '', `left:6px;top:${r0(ty - 30)}px`);
    K.add('mvx-a-post mvx-a-postr', '', `right:6px;top:${r0(ty - 30)}px`);
    K.add('mvx-a-tape mvx-a-tapel', '', `left:10px;top:${r0(ty)}px;width:${r0(G.cx - 10)}px`);
    K.add('mvx-a-tape mvx-a-taper', '', `left:${r0(G.cx)}px;top:${r0(ty)}px;width:${r0(G.sw - 10 - G.cx)}px`);
    for (let i = 0; i < 7; i++) K.add('mvx-speed mvx-a-runline', '', `top:${r0(G.y + G.h * (0.15 + i * 0.12))}px;animation-delay:${S(i * 60)}`);
    K.flash(ms * 0.4, '#fff', 300);
    K.burst(G.cx, ty, ms * 0.4, 18, 110, POP, 10);
    K.word('ゴーール!!', G.cx - 90, G.bb + 6, ms * 0.42, '#ff6b6b', 34, -8);
    fword(K, 'ワーッ!!', W * 0.06, G.py + G.sh + 10, ms * 0.48, '#ffd94a', 36, -6);
    fword(K, '1着!', W * 0.62, G.py + G.sh + 50, ms * 0.6, '#fff', 34, 8);
    K.rain(40, CONF, { parent: document.body, cls: 'mvx-fixed mvx-a-confall', delayMax: ms * 0.45, delay0: ms * 0.42, dur: [1200, 1900], size: [8, 13] });
  });

  // ---------------- 58. 日食 ----------------
  def('eclipse', 'gaze', 3800, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.fixed('mvx-a-ecldark', '', '');
    for (let i = 0; i < 40; i++) K.fixed('mvx-a-eclstar', pick(['✦', '·', '✧', '★']), `left:${r0(rnd(0, W - 14))}px;top:${r0(rnd(0, H - 14))}px;font-size:${r0(rnd(9, 20))}px;animation-delay:${S(rnd(0, 800))}`);
    const below = H - (G.py + G.sh);
    const R = r0(Math.max(40, Math.min(W * 0.26, below * 0.36, 110)));
    const cx = W / 2, cy = below > R * 2.4 ? G.py + G.sh + below * 0.48 : H * 0.7;
    K.fixed('mvx-a-corona', '', `left:${r0(cx - R * 2)}px;top:${r0(cy - R * 2)}px;width:${R * 4}px;height:${R * 4}px`);
    K.fixed('mvx-a-esun', '', `left:${r0(cx - R)}px;top:${r0(cy - R)}px;width:${R * 2}px;height:${R * 2}px`);
    K.fixed('mvx-a-moon', '', `left:${r0(cx - R)}px;top:${r0(cy - R)}px;width:${R * 2}px;height:${R * 2}px;--mx:${r0(W * 0.75)}px`);
    K.fixed('mvx-a-diamond', '✦', `left:${r0(cx + R * 0.62 - 20)}px;top:${r0(cy - R * 0.72 - 24)}px`);
    fword(K, 'まっくら…', W * 0.08, cy + R + 14 > H - 44 ? H * 0.3 : cy + R + 14, ms * 0.34, '#c9a7ff', 26, -6);
    fword(K, 'ひかりのわ!!', W * 0.36, Math.max(G.py + G.sh + 4, cy - R * 1.8), ms * 0.5, '#ffd94a', 32, 6);
    K.flash(ms * 0.7, '#fff', 340);
  });

  // ---------------- 59. 横なぐりの大雨 ----------------
  const UMB = `<svg viewBox="0 0 120 120"><path d="M60 60 V108 Q60 118 50 118 Q42 118 42 110" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M6 60 Q10 10 60 8 Q110 10 114 60 Q101 50 87 60 Q74 50 60 60 Q46 50 33 60 Q19 50 6 60 Z" fill="#ff9fbb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M60 8 Q44 30 33 60 M60 8 Q76 30 87 60" stroke="${INK}" stroke-width="3" fill="none"/><path d="M60 8 V2" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></svg>`;
  const NEWS = `<svg viewBox="0 0 60 44"><path d="M4 6 L54 2 L56 40 L6 42 Z" fill="#fffdf8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M12 12 H46 M12 20 H30 M12 27 H44 M34 18 H46 V32 H34 Z" stroke="${INK}" stroke-width="2.4" fill="none"/></svg>`;
  def('monsoon', 'komari', 3400, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#55627a', 0.85);
    K.fixed('mvx-a-stormsky', '', '');
    for (let i = 0; i < 95; i++) K.fixed('mvx-a-hrain', '', `left:${r0(rnd(-W * 0.4, W))}px;top:${r0(rnd(-H * 0.2, H))}px;height:${r0(rnd(26, 60))}px;--dx:${r0(W * 0.9)}px;--dy:${r0(H * 0.5)}px;animation-delay:${S(-rnd(0, 600))},0s;animation-duration:${S(rnd(380, 560))},${S(ms)}`);
    for (let i = 0; i < 10; i++) K.fixed('mvx-a-gale', '', `top:${r0(rnd(0.05, 0.95) * H)}px;width:${r0(rnd(80, 180))}px;--w:${W}px;animation-delay:${S(rnd(0, ms * 0.9))}`);
    [NEWS, LEAF('#8fe8c8'), NEWS, LEAF('#ffa95e'), LEAF('#ffd94a')].forEach((h, i) => K.fixed('mvx-a-blowby', h, `top:${r0(H * (0.2 + i * 0.15))}px;width:${30 + (i % 2) * 14}px;--w:${W + 120}px;animation-delay:${S(ms * (0.1 + i * 0.14))}`));
    const us = Math.max(44, G.w * 0.55);
    K.inBtn('mvx-a-umb', UMB, `width:${r0(us)}px;left:${r0((G.w - us) / 2 + G.w * 0.18)}px;--fly:${r0(-(G.py + G.y + G.h))}px;--flx:${r0(W)}px`);
    K.flash(ms * 0.22, '#fffbd0', 200);
    K.flash(ms * 0.68, '#fffbd0', 260);
    K.add('mvx-a-puddlewater', `<div class="mvx-a-wave">${wave('#7aa6d6', 20, 5)}</div>`, `top:${r0(G.y + G.h * 0.94)}px`);
    K.word('ビュオオオ', 10, G.bb + 10, ms * 0.08, '#c9e3ff', 26, -6);
    K.word('あーっ! かさ!!', G.sw - 170, G.bb + 44, ms * 0.42, '#ff9fbb', 24, 6);
    fword(K, 'ゴロゴロ…', W * 0.5, G.py + G.sh + 16, ms * 0.66, '#ffd94a', 30, 8);
  });

  // ---------------- 60. 風車 ----------------
  const BLADES = `<svg viewBox="-100 -100 200 200">${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a})"><path d="M-4 -8 L-6 -96 L6 -96 L4 -8 Z" fill="#c27f4a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M6 -94 L32 -92 L28 -22 L6 -20 Z" fill="#fffdf8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M6 -72 H30 M6 -50 H29 M6 -36 H28 M18 -93 V-21" stroke="${INK}" stroke-width="2" opacity=".55"/></g>`).join('')}<circle r="11" fill="#ff9fbb" stroke="${INK}" stroke-width="4"/><circle r="3.5" fill="${INK}"/></svg>`;
  const MILL = `<svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMin meet"><path d="M30 20 L70 20 L84 160 L16 160 Z" fill="#ffe3c8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M24 22 L50 -4 L76 22 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="40" y="118" width="20" height="42" rx="10" fill="#c27f4a" stroke="${INK}" stroke-width="4"/><rect x="42" y="60" width="16" height="18" rx="3" fill="#8fd0ff" stroke="${INK}" stroke-width="3"/></svg>`;
  const TULIPS = (W) => { let s = ''; const n = Math.ceil(W / 26); for (let i = 0; i < n; i++) { const x = i * 26 + 13; s += `<path d="M${x} 40 V20" stroke="#4fb38a" stroke-width="4"/><path d="M${x - 8} 10 L${x - 4} 18 L${x} 8 L${x + 4} 18 L${x + 8} 10 Q${x + 9} 24 ${x} 24 Q${x - 9} 24 ${x - 8} 10 Z" fill="${POP[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 6]}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`; } return `<svg viewBox="0 0 ${n * 26} 40" preserveAspectRatio="xMinYMax slice">${s}</svg>`; };
  def('windmill', 'hang', 3800, (K, G, ms) => {
    const W = window.innerWidth;
    K.back('#bfe6ff', 0.7);
    const hx = G.cx, hy = G.y + G.h * 0.12;
    const R = Math.max(G.h * 0.95, 90);
    const mw = R * 0.62;
    K.add('mvx-a-mill', MILL, `left:${r0(hx - mw / 2)}px;top:${r0(hy - mw * 0.1)}px;width:${r0(mw)}px`);
    K.add('mvx-a-blades', BLADES, `left:${r0(hx - R)}px;top:${r0(hy - R)}px;width:${r0(R * 2)}px;height:${r0(R * 2)}px`);
    K.add('mvx-a-tulips', TULIPS(G.sw), '');
    for (let i = 0; i < 8; i++) K.add('mvx-gust', '', `top:${6 + i * 11}%;animation-delay:${S(i * 140)}`);
    catVars({ '--a-ox': '50%', '--a-oy': r0(hy - G.y) + 'px' }, ms);
    K.word('ぐるぐる〜', 8, G.bb + 8, ms * 0.2, '#8fd0ff', 26, -8);
    K.word('めがまわる〜', G.sw - 150, G.sh - 60, ms * 0.62, '#ff9fbb', 22, 6);
    fword(K, 'ビュウウウ', W * 0.4, G.py + G.sh + 12, ms * 0.1, '#fff', 28, 6);
  });

  // ---------------- 61. 観覧車 ----------------
  const WHEEL = (n) => `<svg viewBox="-100 -100 200 200"><circle r="92" fill="none" stroke="${INK}" stroke-width="7"/><circle r="92" fill="none" stroke="#ff9fbb" stroke-width="3"/><circle r="70" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/>${[...Array(n)].map((_, i) => { const a = (i * 360) / n * Math.PI / 180, x = Math.cos(a) * 92, y = Math.sin(a) * 92; return `<path d="M0 0 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${INK}" stroke-width="3"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${POP[i % 6]}" stroke="${INK}" stroke-width="2.5" class="mvx-a-wbulb" style="animation-delay:${S(i * 90)}"/>`; }).join('')}<circle r="12" fill="#ffd94a" stroke="${INK}" stroke-width="4"/></svg>`;
  const GONDOLA = (c) => `<svg viewBox="0 0 40 44"><path d="M20 0 V8" stroke="${INK}" stroke-width="3"/><path d="M6 10 H34 L32 40 Q20 44 8 40 Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="11" y="15" width="18" height="11" rx="3" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/></svg>`;
  const CUP = `<svg viewBox="0 0 240 110"><path d="M10 6 H230 L218 96 Q120 112 22 96 Z" fill="#8fd0ff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M28 30 H212" stroke="${INK}" stroke-width="4" opacity=".4"/><circle cx="60" cy="62" r="9" fill="#ffd94a" stroke="${INK}" stroke-width="4"/><circle cx="120" cy="66" r="9" fill="#ff9fbb" stroke="${INK}" stroke-width="4"/><circle cx="180" cy="62" r="9" fill="#8fe8c8" stroke="${INK}" stroke-width="4"/></svg>`;
  def('ferris', 'tere', 3800, (K, G, ms) => {
    const W = window.innerWidth;
    K.back('#ffb0a0', 0.6);
    K.fixed('mvx-a-dusk', '', '');
    const R = r0(Math.max(48, Math.min(G.h * 0.62, (G.cy - G.h * 0.25) / 2, G.sw * 0.4)));
    const hx = G.cx, hy = G.cy - R;
    K.add('mvx-a-wheelleg', '', `left:${r0(hx)}px;top:${r0(hy)}px;height:${r0(G.sh - hy)}px;--w:${r0(R * 1.2)}px`);
    K.add('mvx-a-wheel', WHEEL(12), `left:${r0(hx - R * 1.1)}px;top:${r0(hy - R * 1.1)}px;width:${r0(R * 2.2)}px;height:${r0(R * 2.2)}px`);
    [60, 120, 180, 240, 300].forEach((a, i) => K.add('mvx-a-gond', `<div>${GONDOLA(POP[i % 6])}</div>`, `left:${r0(hx)}px;top:${r0(hy)}px;--a:${a}deg;--r:${R}px;width:${r0(R * 0.36)}px;margin-left:${r0(-R * 0.18)}px`));
    K.inBtn('mvx-a-cup', CUP, '');
    catVars({ '--a-r': R + 'px' }, ms);
    K.stars(14, ms * 0.8, [4, 96, 30, 90], ['✦', '✧', '·']);
    K.word('たかーい!', 8, G.bb + 8, ms * 0.4, '#fff', 26, -8);
    fword(K, 'ゆ〜らゆら', W * 0.45, G.py + G.sh + 12, ms * 0.2, '#ffd94a', 28, 6);
    fixedBurst(K, W * 0.2, G.py + G.sh * 0.4, ms * 0.5, 16, 70, ['#ffd94a', '#ff9fbb', '#fff'], 8);
    fixedBurst(K, W * 0.8, G.py + G.sh * 0.3, ms * 0.6, 16, 70, ['#8fe8c8', '#8fd0ff', '#fff'], 8);
  });

  // ---------------- 62. ジェットコースター ----------------
  const CAR = `<svg viewBox="0 0 120 70"><path d="M8 26 H112 L104 56 H16 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M8 26 Q2 26 4 14 L18 14 L18 26" fill="#ff6b6b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M20 38 H100" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/><circle cx="32" cy="60" r="8" fill="#ffd94a" stroke="${INK}" stroke-width="4"/><circle cx="88" cy="60" r="8" fill="#ffd94a" stroke="${INK}" stroke-width="4"/></svg>`;
  def('coaster', 'banzai', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#bfe6ff', 0.85);
    const r = Math.min(W * 0.26, H * 0.17), cx = W * 0.5, yb = Math.min(H * 0.86, G.py + G.sh + r * 2 + 30), y0 = Math.max(G.py + G.sh * 0.55, yb - r * 4);
    const d = `M ${r0(-140)} ${r0(y0)} C ${r0(W * 0.18)} ${r0(y0)} ${r0(W * 0.16)} ${r0(yb)} ${r0(cx - r * 0.2)} ${r0(yb)} A ${r0(r)} ${r0(r)} 0 0 0 ${r0(cx - r * 0.2)} ${r0(yb - 2 * r)} A ${r0(r)} ${r0(r)} 0 0 0 ${r0(cx + r * 0.2)} ${r0(yb)} C ${r0(W * 0.86)} ${r0(yb)} ${r0(W * 0.8)} ${r0(y0)} ${r0(W + 160)} ${r0(y0 - 40)}`;
    let legs = '';
    for (let x = 20; x < W; x += 34) legs += `<path d="M${x} ${H} V${r0(Math.min(yb + 4, H))}" />`;
    K.fixed('mvx-a-track', `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g stroke="#8a7a6a" stroke-width="5" opacity=".7">${legs}</g><path d="${d}" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffa95e" stroke-width="7" stroke-dasharray="4 10"/><path d="${d}" fill="none" stroke="#fffdf8" stroke-width="2"/></svg>`, '');
    const cw = Math.max(90, Math.min(W * 0.32, 130));
    const car = K.fixed('mvx-a-car', `<div class="mvx-a-carcat">${catNow()}</div>${CAR}`, `width:${r0(cw)}px`);
    car.style.offsetPath = `path('${d}')`;
    for (let i = 0; i < 2; i++) {
      const c2 = K.fixed('mvx-a-car mvx-a-car2', `<div class="mvx-a-carcat">${mini('banzai', POP[i * 2 + 1])}</div>${CAR.replace('#ff6b6b', POP[i + 3]).replace('#ff6b6b', POP[i + 3])}`, `width:${r0(cw * 0.85)}px;animation-delay:${S(-(i + 1) * 110)}`);
      c2.style.offsetPath = `path('${d}')`;
    }
    fword(K, 'キャーーー!!', W * 0.06, Math.max(G.py + G.sh + 6, 20), ms * 0.36, '#ff6b6b', 40, -8);
    fword(K, 'ぐるーん', cx - 50, yb - r - 14, ms * 0.48, '#fff', 26, 0);
    fword(K, 'ゴーッ', W * 0.62, y0 - 60, ms * 0.7, '#ffd94a', 30, 8);
  });

  // ---------------- 63. メリーゴーランド ----------------
  const HORSE = (c, m) => `<svg viewBox="0 0 120 150"><path d="M60 0 V150" stroke="#ffd94a" stroke-width="7"/><path d="M60 0 V150" stroke="${INK}" stroke-width="2" stroke-dasharray="6 8"/><path d="M18 68 Q20 50 44 50 L76 50 Q84 30 92 22 L100 18 Q112 22 110 34 L104 38 Q98 44 96 56 Q100 76 86 84 L88 112 L80 112 L76 88 L46 88 L42 112 L34 112 L34 86 Q18 82 18 68 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M90 22 Q80 30 78 48 M18 66 Q6 74 10 90" stroke="${m}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="100" cy="28" r="3" fill="${INK}"/><path d="M48 50 Q60 64 72 50" fill="#ff9fbb" stroke="${INK}" stroke-width="4"/></svg>`;
  def('carousel', 'kira', 3800, (K, G, ms) => {
    const W = window.innerWidth;
    K.back('#ffd6e4', 0.7);
    K.fixed('mvx-a-bulbs', '', '');
    const n = 8, hw = Math.max(46, Math.min(G.w * 0.5, 80)), R = Math.min(G.sw * 0.42, 190);
    let ring = '';
    for (let i = 0; i < n; i++) ring += `<div class="mvx-a-horse" style="--ry:${i * 45}deg;--R:${r0(R)}px;width:${r0(hw)}px;margin-left:${r0(-hw / 2)}px"><div style="animation-delay:${S(-i * 230)}">${HORSE(POP[(i + 2) % 6], POP[i % 6])}</div></div>`;
    const top = Math.max(G.bb + 4, G.y);
    K.add('mvx-a-carousel', `<div class="mvx-a-ring">${ring}</div>`, `left:${r0(G.cx)}px;top:${r0(top)}px;height:${r0(G.sh - top)}px`);
    K.add('mvx-a-cfloor', '', `left:${r0(G.cx - R * 1.1)}px;width:${r0(R * 2.2)}px;top:${r0(G.y + G.h * 0.88)}px`);
    const ch = Math.max(G.w * 0.9, 60);
    K.inBtn('mvx-a-myhorse', HORSE('#fffdf8', '#c9a7ff'), `width:${r0(ch)}px;left:${r0((G.w - ch) / 2)}px`);
    for (let i = 0; i < 8; i++) K.add('mvx-a-note', pick(['♪', '♫', '♬']), `left:${r0(rnd(0.05, 0.9) * G.sw)}px;top:${r0(rnd(G.bb + 10, G.sh - 30))}px;color:${POP[i % 6]};animation-delay:${S(rnd(0, ms * 0.7))}`);
    K.word('くるくる〜', 8, G.bb + 8, ms * 0.15, '#c9a7ff', 24, -8);
    fword(K, 'パカラッ♪', W * 0.45, G.py + G.sh + 12, ms * 0.4, '#ff9fbb', 30, 6);
  });

  // ---------------- 64. サーカス ----------------
  const POLE = `<svg viewBox="0 0 300 30"><path d="M4 20 Q150 4 296 20" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M4 20 Q150 4 296 20" stroke="#ffd94a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="6" cy="20" r="9" fill="#ff6b6b" stroke="${INK}" stroke-width="4"/><circle cx="294" cy="20" r="9" fill="#ff6b6b" stroke="${INK}" stroke-width="4"/></svg>`;
  def('circus', 'upright', 3800, (K, G, ms) => {
    const W = window.innerWidth;
    K.back('#1c1430', 0.88);
    K.fixed('mvx-a-ccurt mvx-a-curtl', '', '');
    K.fixed('mvx-a-ccurt mvx-a-curtr', '', '');
    K.fixed('mvx-a-ctent', '', '');
    K.add('mvx-a-spot2 mvx-a-spot2l', '', `left:4%;--x:${r0(G.cx - G.sw * 0.04)}px`);
    K.add('mvx-a-spot2 mvx-a-spot2r', '', `right:4%;--x:${r0(G.cx - G.sw * 0.96)}px`);
    const ry = G.y + G.h * 0.97;
    K.add('mvx-a-rope', '', `top:${r0(ry)}px`);
    K.add('mvx-a-ropepost', '', `left:4px;top:${r0(ry - 6)}px`);
    K.add('mvx-a-ropepost', '', `right:4px;top:${r0(ry - 6)}px`);
    const pw = G.w * 1.8;
    K.inBtn('mvx-a-pole', POLE, `width:${r0(pw)}px;left:${r0((G.w - pw) / 2)}px;top:42%`);
    K.word('ドロロロ…', 8, G.bb + 6, ms * 0.08, '#fff', 22, -6);
    K.word('おっとっと!', G.sw - 140, G.bb + 34, ms * 0.42, '#ffd94a', 22, 8);
    fword(K, 'ジャジャーン!!', W * 0.08, G.py + G.sh + 10, ms * 0.8, '#ff6b6b', 38, -6);
    fixedBurst(K, G.px + G.cx, G.py + G.y, ms * 0.8, 22, 150, ['#ffd94a', '#ff6b6b', '#fff'], 10);
    K.stars(10, ms * 0.3, [5, 95, 30, 80]);
  });

  // ---------------- 65. オーケストラ ----------------
  const BATON = `<svg viewBox="0 0 80 80"><path d="M10 70 L74 6" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M10 70 L74 6" stroke="#fffdf8" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="68" r="7" fill="#c27f4a" stroke="${INK}" stroke-width="3.5"/></svg>`;
  const STAFF = `<svg viewBox="0 0 400 60" preserveAspectRatio="none"><g stroke="${INK}" stroke-width="2.4" fill="none" vector-effect="non-scaling-stroke">${[10, 20, 30, 40, 50].map((y) => `<path d="M0 ${y} Q100 ${y - 14} 200 ${y} T400 ${y}"/>`).join('')}</g></svg>`;
  def('orchestra', 'wave', 3800, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#7a1f3a', 0.75);
    K.fixed('mvx-a-hallcurt', '', '');
    K.inBtn('mvx-a-baton', BATON, '');
    [0.2, 0.45, 0.72].forEach((f, i) => K.fixed('mvx-a-staff', STAFF, `top:${r0(H * f)}px;animation-delay:${S(i * 160)}`));
    const cx = G.px + G.cx, cy = G.py + G.cy;
    for (let i = 0; i < 90; i++) {
      const a = rnd(0, 360), rr = rnd(0.2, 0.7) * Math.max(W, H);
      K.fixed('mvx-a-swirl', `<b style="color:${POP[i % 7]};font-size:${r0(rnd(24, 52))}px">${pick(['♪', '♫', '♬', '♩'])}</b>`, `left:${r0(cx)}px;top:${r0(cy)}px;--a0:${r0(a)}deg;--a1:${r0(a + rnd(160, 320))}deg;--rr:${r0(rr)}px;animation-delay:${S(ms * 0.1 + rnd(0, ms * 0.6))}`);
    }
    K.flash(ms * 0.62, '#ffd94a', 300);
    fword(K, 'ジャジャジャ', W * 0.06, G.py + G.sh + 8, ms * 0.2, '#ffd94a', 30, -6);
    fword(K, 'ジャーン!!!', W * 0.32, G.py + G.sh + 56, ms * 0.62, '#fff', 44, 6);
  });

  // ---------------- 66. DJ ----------------
  const SPEAKER = `<svg viewBox="0 0 80 120"><rect x="4" y="4" width="72" height="112" rx="8" fill="#3a3550" stroke="${INK}" stroke-width="5"/><circle cx="40" cy="34" r="16" fill="#8fd0ff" stroke="${INK}" stroke-width="4"/><circle cx="40" cy="34" r="6" fill="${INK}"/><g class="mvx-a-cone"><circle cx="40" cy="80" r="26" fill="#c9a7ff" stroke="${INK}" stroke-width="5"/><circle cx="40" cy="80" r="10" fill="${INK}"/></g></svg>`;
  const DECK = `<svg viewBox="0 0 240 70"><rect x="4" y="22" width="232" height="44" rx="8" fill="#3a3550" stroke="${INK}" stroke-width="5"/><g class="mvx-a-disc" style="transform-origin:60px 30px"><ellipse cx="60" cy="30" rx="44" ry="16" fill="#2b2b2b" stroke="${INK}" stroke-width="3"/><ellipse cx="60" cy="30" rx="14" ry="5" fill="#ff9fbb"/><path d="M30 26 Q60 18 90 26" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/></g><g class="mvx-a-disc" style="transform-origin:180px 30px"><ellipse cx="180" cy="30" rx="44" ry="16" fill="#2b2b2b" stroke="${INK}" stroke-width="3"/><ellipse cx="180" cy="30" rx="14" ry="5" fill="#8fe8c8"/></g><rect x="108" y="40" width="24" height="12" rx="3" fill="#ffd94a" stroke="${INK}" stroke-width="3"/></svg>`;
  def('dj', 'music', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#1a1530', 0.9);
    K.fixed('mvx-a-strobe', '', '');
    for (let i = 0; i < 6; i++) K.fixed('mvx-a-djbeam', '', `left:${r0((i + 0.5) * W / 6)}px;--c:${POP[i % 6]};--a0:${r0(rnd(-40, -10))}deg;--a1:${r0(rnd(10, 40))}deg;animation-delay:0s,${S(-i * 170)}`);
    const sw = Math.max(48, Math.min(G.sw * 0.2, 90));
    K.add('mvx-a-speaker', SPEAKER, `left:4px;top:${r0(Math.max(G.bb + 4, G.sh - sw * 1.5 - 4))}px;width:${r0(sw)}px`);
    K.add('mvx-a-speaker', SPEAKER, `right:4px;top:${r0(Math.max(G.bb + 4, G.sh - sw * 1.5 - 4))}px;width:${r0(sw)}px`);
    K.inBtn('mvx-a-deck', DECK, '');
    let eq = '';
    for (let i = 0; i < 16; i++) eq += `<i style="background:${POP[i % 6]};animation-delay:${S(-rnd(0, 460))};animation-duration:${S(rnd(240, 460))}"></i>`;
    K.fixed('mvx-a-eq', eq, `height:${r0(Math.min(H * 0.22, 150))}px`);
    K.word('ズンズン', 8, G.bb + 8, ms * 0.1, '#c9a7ff', 24, -8);
    K.word('チキチキ', G.sw - 110, G.bb + 40, ms * 0.3, '#8fe8c8', 22, 8);
    fword(K, 'イェーイ!!', W * 0.2, G.py + G.sh + 14, ms * 0.6, '#ffd94a', 42, -6);
  });

  // ---------------- 67. アイドル ----------------
  def('idol', 'karaoke', 3800, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#241a40', 0.9);
    K.add('mvx-a-spot mvx-a-spotl', '', `left:${r0(G.sw * 0.15)}px`);
    K.add('mvx-a-spot mvx-a-spotr', '', `left:${r0(G.sw * 0.85)}px`);
    const top = Math.min(G.py + G.sh + 6, H * 0.6);
    let lights = '';
    const cols = ['#ff9fbb', '#8fd0ff', '#ffd94a', '#8fe8c8', '#c9a7ff'];
    for (let row = 0; row < 5; row++) for (let i = 0; i < 9; i++) {
      const x = (i + (row % 2) * 0.5) / 9 * 100, c = cols[(i + row) % 5];
      lights += `<i style="left:${x.toFixed(1)}%;top:${row * 20 + 6}%;--c:${c};animation-delay:${S(-row * 100)}"></i>`;
    }
    K.fixed('mvx-a-penlights', lights, `top:${r0(top)}px`);
    K.fixed('mvx-a-crowdheads', '', '');
    for (let i = 0; i < 12; i++) K.add('mvx-a-heart', `<svg viewBox="0 0 40 36"><path d="M20 34 Q2 22 4 11 Q6 2 14 2 Q19 2 20 8 Q21 2 26 2 Q34 2 36 11 Q38 22 20 34 Z" fill="${pick(['#ff9fbb', '#ff6b6b', '#ffd94a'])}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`, `left:${r0(G.cx + rnd(-G.sw * 0.4, G.sw * 0.4))}px;top:${r0(G.sh - 20)}px;width:${r0(rnd(16, 28))}px;--d:${r0(rnd(G.sh * 0.4, G.sh - G.bb))}px;animation-delay:${S(rnd(ms * 0.2, ms * 0.75))}`);
    K.stars(14, ms * 0.8, [4, 96, 30, 95], ['✦', '★', '✧']);
    K.word('キラッ☆', G.sw - 120, G.bb + 8, ms * 0.3, '#ffd94a', 24, 8);
    fword(K, 'てんぷるー!!', W * 0.06, top - 30, ms * 0.2, '#ff9fbb', 34, -6);
    fword(K, 'L・O・V・E', W * 0.3, top + 40, ms * 0.56, '#fff', 30, 4);
  });

  // ---------------- 68. ファッションショー ----------------
  def('catwalk', 'shades', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#1b1b2e', 0.9);
    K.add('mvx-a-runway', '', `top:${r0(G.bb)}px`);
    K.add('mvx-a-rwlights', '', `top:${r0(G.bb)}px`);
    K.fixed('mvx-a-audl', '', '');
    K.fixed('mvx-a-audr', '', '');
    for (let i = 0; i < 44; i++) {
      const side = i % 2, x = side ? rnd(W * 0.72, W - 30) : rnd(4, W * 0.24), y = rnd(H * 0.5, H * 0.97);
      K.fixed('mvx-a-camflash', '<i></i>', `left:${r0(x)}px;top:${r0(y)}px;animation-delay:${S(rnd(ms * 0.15, ms * 0.85))}`);
    }
    K.flash(ms * 0.6, '#fff', 200);
    K.flash(ms * 0.66, '#fff', 200);
    K.word('パシャパシャ', 6, G.bb + 8, ms * 0.25, '#fff', 20, -8);
    fword(K, 'キマった!', W * 0.36, G.py + G.sh + 14, ms * 0.6, '#ffd94a', 40, 6);
  });

  // ---------------- 69. パパラッチ ----------------
  const CAMERA = `<svg viewBox="0 0 80 60"><rect x="4" y="14" width="72" height="42" rx="8" fill="#3a3550" stroke="${INK}" stroke-width="5"/><path d="M24 14 L30 4 H50 L56 14" fill="#3a3550" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="40" cy="35" r="14" fill="#8fd0ff" stroke="${INK}" stroke-width="5"/><circle cx="36" cy="31" r="4" fill="#fff"/><rect x="58" y="20" width="12" height="7" rx="2" fill="#fff6c2" stroke="${INK}" stroke-width="2.5"/></svg>`;
  def('paparazzi', 'peace', 3600, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight;
    K.back('#2b2b40', 0.6);
    const spots = [[-20, 0.2, 20], [W - 60, 0.15, -20], [-20, 0.55, 30], [W - 60, 0.5, -30], [-10, 0.85, 10], [W - 70, 0.82, -12], [W * 0.4, 1.02, 0]];
    spots.forEach(([x, fy, rot], i) => {
      K.fixed('mvx-a-camera', `${CAMERA}<i></i>`, `left:${r0(x)}px;top:${r0(fy * H - 30)}px;--r:${rot}deg;--s:${x < W / 2 ? 1 : -1};animation-delay:${S(i * 70)}`);
    });
    for (let i = 0; i < 9; i++) K.flash(ms * (0.12 + i * 0.08) + rnd(-40, 40), '#fff', 140);
    const pw = Math.min(W * 0.32, 130);
    for (let i = 0; i < 9; i++) K.fixed('mvx-a-photo', `<div>${catNow()}</div>`, `left:${r0(rnd(0, W - pw))}px;top:-${r0(pw * 1.3)}px;width:${r0(pw)}px;--rot:${r0(rnd(-30, 30))}deg;--fy:${r0(rnd(H * 0.45, H - pw * 1.2) + pw * 1.3)}px;animation-delay:${S(ms * (0.2 + i * 0.06))}`);
    fword(K, 'パシャ!', W * 0.06, G.py + G.sh + 8, ms * 0.14, '#fff', 30, -10);
    fword(K, 'パシャパシャ!!', W * 0.38, G.py + G.sh + 60, ms * 0.36, '#ffd94a', 32, 6);
    fword(K, 'こっち向いて〜!', W * 0.1, G.py + G.sh + 110, ms * 0.58, '#ff9fbb', 26, -4);
  });

  // ---------------- 70. 天地創造 ----------------
  const PLANET = (c, ring) => `<svg viewBox="0 0 100 100">${ring ? `<ellipse cx="50" cy="50" rx="48" ry="14" fill="none" stroke="${INK}" stroke-width="7" transform="rotate(-20 50 50)"/><ellipse cx="50" cy="50" rx="48" ry="14" fill="none" stroke="#ffd94a" stroke-width="3" transform="rotate(-20 50 50)"/>` : ''}<circle cx="50" cy="50" r="28" fill="${c}" stroke="${INK}" stroke-width="5"/><path d="M34 40 Q44 34 52 40" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;
  const SPROUT = (c) => `<svg viewBox="0 0 60 90"><path d="M30 90 Q28 60 32 36" stroke="#4fb38a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M31 50 Q10 46 6 26 Q26 28 31 50 Z M32 42 Q50 34 54 14 Q36 18 32 42 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="32" cy="22" r="11" fill="${c}" stroke="${INK}" stroke-width="3.5"/><circle cx="32" cy="22" r="4" fill="#ffd94a"/></svg>`;
  const TREE = `<svg viewBox="0 0 100 130"><path d="M44 130 L46 70 H56 L58 130 Z" fill="#c27f4a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M50 4 Q86 6 90 40 Q100 62 78 74 Q60 86 40 78 Q10 80 8 56 Q2 30 26 20 Q32 4 50 4 Z" fill="#8fe8c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="34" cy="44" r="6" fill="#ff9fbb" stroke="${INK}" stroke-width="3"/><circle cx="64" cy="34" r="6" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/><circle cx="66" cy="60" r="6" fill="#ffd94a" stroke="${INK}" stroke-width="3"/></svg>`;
  const BIRD = `<svg viewBox="0 0 40 20"><path d="M2 10 Q10 0 20 10 Q30 0 38 10" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  def('creation', 'cosmos', 4000, (K, G, ms) => {
    const W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = G.py + G.cy;
    K.fixed('mvx-a-void', '', '');
    K.fixed('mvx-a-seed', '', `left:${r0(cx)}px;top:${r0(cy)}px`);
    K.fixed('mvx-a-bigbang', '', `left:${r0(cx)}px;top:${r0(cy)}px`);
    for (let i = 0; i < 4; i++) K.fixed('mvx-a-rainring', '', `left:${r0(cx)}px;top:${r0(cy)}px;border-color:${['#ff6b6b', '#ffd94a', '#8fe8c8', '#c9a7ff'][i]};animation-delay:${S(ms * 0.3 + i * 90)}`);
    K.fixed('mvx-a-newsky', '', '');
    for (let i = 0; i < 30; i++) K.fixed('mvx-a-cstar', pick(['✦', '✧', '★', '·']), `left:${r0(cx)}px;top:${r0(cy)}px;--tx:${r0(rnd(-W * 0.6, W * 0.6))}px;--ty:${r0(rnd(-H * 0.6, H * 0.4))}px;color:${pick(['#ffd94a', '#fff', '#ff9fbb', '#8fe8c8'])};font-size:${r0(rnd(12, 30))}px;animation-delay:${S(ms * 0.3 + rnd(0, 200))}`);
    [['#ff9fbb', 1, -0.32, -0.3], ['#8fd0ff', 0, 0.3, -0.22], ['#ffa95e', 0, -0.28, 0.08], ['#c9a7ff', 1, 0.34, 0.12]].forEach(([c, ring, fx, fy], i) => K.fixed('mvx-a-planet', PLANET(c, ring), `left:${r0(cx)}px;top:${r0(cy)}px;width:${r0(Math.min(W * 0.22, 90))}px;--tx:${r0(fx * W)}px;--ty:${r0(fy * H)}px;animation-delay:${S(ms * 0.34 + i * 60)}`));
    K.fixed('mvx-a-newsun', '', `left:${r0(W * 0.82)}px`);
    K.fixed('mvx-a-land', `<div class="mvx-a-wave">${wave('#8fe8c8', 20, 6)}</div>`, '');
    const gy = H * 0.86;
    for (let i = 0; i < 7; i++) K.fixed(i % 3 === 1 ? 'mvx-a-tree' : 'mvx-a-sprout', i % 3 === 1 ? TREE : SPROUT(POP[i % 6]), `left:${r0((i + 0.2) * W / 7)}px;top:${r0(gy - (i % 3 === 1 ? 90 : 56))}px;width:${i % 3 === 1 ? 70 : 38}px;animation-delay:${S(ms * (0.58 + i * 0.025))}`);
    for (let i = 0; i < 5; i++) K.fixed('mvx-a-bird', BIRD, `left:-50px;top:${r0(H * (0.12 + i * 0.06))}px;--w:${W + 100}px;animation-delay:${S(ms * (0.62 + i * 0.04))}`);
    fword(K, '……まっくら', W * 0.3, cy + 50, ms * 0.04, '#8a8aa8', 22, 0);
    fword(K, 'ひかり、あれ!!', W * 0.08, Math.min(H * 0.62, cy + 90), ms * 0.28, '#ffd94a', 40, -6);
    fword(K, 'せかいが できた!', W * 0.18, H * 0.68, ms * 0.66, '#ff9fbb', 30, 6);
  });
})();
