// 派手な動き 第5弾（moves-c）。window.MoreMoves に足していく
// 超派手（画面ぜんたい・シュール）30種。おまけの絵のクラスは mvx-c- ではじめる（ほかとぶつからないように）
// CSS は moves-c.css。キーフレームの名前は kfc- ではじめる
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
  const r1 = (v) => Math.round(v * 10) / 10;
  const byId = (id) => document.getElementById(id);
  const poseSvg = (n) => ((window.Poses && (window.Poses[n] || window.Poses.sit)) || { svg: '' }).svg;
  const tintSt = (t) => (t ? ` style="--tint:${t}"` : '');
  // 今のてんぷる（動きのポーズ）を絵として写す
  const catNow = (cls = '', tint = '') => `<svg class="cat mvx-cat ${cls}" viewBox="0 0 240 200"${tintSt(tint)}>${byId('catPose') ? byId('catPose').innerHTML : poseSvg('sit')}</svg>`;
  const mini = (pose = 'sit', tint = '', cls = '') => `<svg class="cat mvx-cat ${cls}" viewBox="0 0 240 200"${tintSt(tint)}>${poseSvg(pose)}</svg>`;
  // てんぷるの顔だけ
  const headSvg = (kind = 'open') => (window.PoseParts ? window.PoseParts.headG(kind) : '<circle class="b" cx="121" cy="84" r="46"/>');
  const head = (kind = 'open', tint = '', cls = '') => `<svg class="cat mvx-cat ${cls}" viewBox="64 28 114 104"${tintSt(tint)}>${headSvg(kind)}</svg>`;
  // ほかの svg の中に顔を置く（x, y は左上、w は幅）
  const headAt = (x, y, w, kind = 'open', tint = '') => `<g class="cat mvx-cat" transform="translate(${r1(x)} ${r1(y)}) scale(${(w / 114).toFixed(3)}) translate(-64 -28)"${tintSt(tint)}>${headSvg(kind)}</g>`;
  const HEADPATH = 'M70 92 C 68 72 78 60 90 57 L 94 37 Q 96 33 100 36 L 112 52 C 118 51 124 51 130 52 L 142 36 Q 146 33 148 37 L 152 57 C 164 60 174 72 172 92 C 170 116 150 127 121 127 C 92 127 72 116 70 92 Z';
  const L = (w = 3.5, c = INK) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const pre = (c) => c.split(' ').filter(Boolean).map((x) => 'mvx-c-' + x).join(' ');
  const el = (cls, html = '', st = '') => `<div class="${pre(cls)}"${st ? ` style="${st}"` : ''}>${html}</div>`;
  const F = (K, cls, html = '', st = '') => K.fixed(pre(cls), html, st);
  const A = (K, cls, html = '', st = '') => K.add(pre(cls), html, st);
  const B = (K, cls, html = '', st = '') => K.inBtn(pre(cls), html, st);
  // 画面いっぱいの景色（はじめと終わりに、ふわっと出入りする）
  const scene = (K, cls, html, st = '') => F(K, 'scene ' + cls, html, st);
  const dl = (v) => `animation-delay:${S(v)}`;
  // 画面のどこにでも出せるマンガの文字
  const fword = (K, text, x, y, delay, color = '#ffd94a', size = 32, rot = -6) => K.fixed('mvx-word mvx-c-fword', text, `left:${r0(x)}px;top:${r0(y)}px;color:${color};font-size:${size}px;--r:${rot}deg;animation-delay:${S(delay)}`);
  // 星をばらまく（景色の中に入れる文字列）
  const starsHtml = (n, d0, d1, y1 = 70, cls = 'tw') => { let s = ''; for (let i = 0; i < n; i++) s += el(cls, pick(['✦', '·', '✧', '★', '·']), `left:${r0(rnd(0, 96))}%;top:${r0(rnd(0, y1))}%;font-size:${r0(rnd(8, 22))}px;${dl(rnd(d0, d1))}`); return s; };
  // ふわふわの雲（横長）
  const CLOUD = (fill = '#fff') => `<svg viewBox="0 0 160 70"><path d="M20 62 Q2 62 6 46 Q8 32 24 34 Q24 14 46 14 Q60 2 78 12 Q96 0 112 16 Q134 12 136 32 Q156 32 154 48 Q154 62 136 62 Z" fill="${fill}" ${L(3.5)}/><path d="M30 50 Q40 56 52 50 M98 52 Q110 58 122 50" fill="none" ${L(2.5)} opacity=".35"/></svg>`;
  const def = (name, pose, ms, fn) => MM.push({ name, pose, ms, big: true, extras: (K) => fn(K, K.G, ms, window.innerWidth, window.innerHeight) });

  // ---------------- 1. 空の目 ----------------
  def('skyeye', 'gaan', 4200, (K, G, ms, W, H) => {
    K.back('#3b2f6b', 0.75);
    let top = 'M10 110', bot = '', crack = 'M-10 110';
    const n = 14;
    for (let i = 1; i <= n; i++) { const t = i / n; top += ` L${r0(10 + 380 * t)} ${r0(110 - 96 * Math.sin(Math.PI * t) + (i % 2 ? -7 : 5))}`; }
    for (let i = n - 1; i >= 1; i--) { const t = i / n; bot += ` L${r0(10 + 380 * t)} ${r0(110 + 96 * Math.sin(Math.PI * t) + (i % 2 ? 7 : -5))}`; }
    for (let i = 1; i <= 17; i++) crack += ` L${i * 26 - 10} ${r0(110 + (i % 2 ? -1 : 1) * rnd(5, 14))}`;
    const lens = top + bot + ' Z';
    const svg = `<svg viewBox="0 0 400 220" class="mvx-c-nss"><defs><clipPath id="mvxc-lens"><path d="${lens}"/></clipPath></defs>` +
      `<path class="mvx-c-crack" d="${crack}" fill="none" ${L(4)} pathLength="1"/>` +
      `<g class="mvx-c-lid"><path d="${lens}" fill="#1d1f4a"/><g clip-path="url(#mvxc-lens)"><ellipse cx="200" cy="110" rx="196" ry="100" fill="#eef8c8"/>` +
      `<g class="mvx-c-iris"><circle cx="200" cy="110" r="76" fill="#6f95d8" ${L(5)}/><circle cx="200" cy="110" r="56" fill="#8fd0ff" opacity=".55"/><ellipse class="mvx-c-pupil" cx="200" cy="110" rx="15" ry="64" fill="${INK}"/><circle cx="230" cy="78" r="15" fill="#fff"/><circle cx="174" cy="142" r="7" fill="#fff"/></g>` +
      `<path d="M0 0 H400 V46 Q200 -6 0 46 Z" fill="#1d1f4a" opacity=".22"/></g><path d="${lens}" fill="none" ${L(6)}/></g></svg>`;
    let shards = '';
    for (let i = 0; i < 12; i++) shards += el('shard', `<svg viewBox="0 0 20 20"><path d="M2 2 L18 6 L8 18 Z" fill="#1d1f4a" ${L(2.5)}/></svg>`, `left:${r0(rnd(4, 92))}%;top:${r0(rnd(12, 26))}vh;--rot:${r0(rnd(-400, 400))}deg;${dl(ms * rnd(0.12, 0.2))}`);
    scene(K, 'skyeye', el('skydim') + el('eyelines') + el('eyewrap', svg) + shards + starsHtml(16, 0, 1200, 45));
    fword(K, 'ピシッ…', W * 0.06, H * 0.05, ms * 0.05, '#fff', 24, -8);
    fword(K, 'ギョロッ', W * 0.5, H * 0.34, ms * 0.28, '#ffd94a', 38, 8);
    fword(K, 'じーっ…', W * 0.1, H * 0.36, ms * 0.66, '#c9a7ff', 26, -6);
  });

  // ---------------- 2. 美術館 ----------------
  const SIL = (i) => {
    const c = ['#3d3552', '#4a3f63', '#352e47', '#433a5a', '#3a3350'][i % 5];
    const back = i % 5 === 3 ? `<path d="M78 46 Q100 66 86 104" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>` : '';
    const topper = [`<rect x="28" y="4" width="44" height="26" rx="5" fill="${c}" ${L(3)}/><path d="M14 30 H86" ${L(4)}/>`, `<path d="M26 34 L30 2 L48 24 M52 24 L70 2 L74 34" fill="${c}" ${L(3)}/>`, `<ellipse cx="42" cy="28" rx="30" ry="10" fill="${c}" ${L(3)}/><circle cx="64" cy="20" r="4" fill="${c}" ${L(2.5)}/>`, '', `<path d="M24 40 Q50 14 76 40" fill="none" stroke="#ff9fbb" stroke-width="6"/>`][i % 5];
    return `<svg viewBox="0 0 100 170">${back}<path d="M4 170 Q4 96 50 90 Q96 96 96 170 Z" fill="${c}" ${L(3)}/><circle cx="50" cy="56" r="30" fill="${c}" ${L(3)}/>${topper}</svg>`;
  };
  def('museum', 'clap', 4400, (K, G, ms, W, H) => {
    const land = `<svg class="mvx-c-mland" viewBox="0 0 100 130" preserveAspectRatio="none"><path d="M0 58 Q20 40 40 52 Q60 30 100 46 V130 H0 Z" fill="#8a9a6a" opacity=".7"/><path d="M8 130 Q30 90 18 70 Q30 60 52 66 Q80 56 70 44" fill="none" stroke="#c9b27a" stroke-width="3" opacity=".8"/><path d="M60 40 Q74 26 100 34" fill="none" stroke="#9fb7c9" stroke-width="2.5" opacity=".8"/></svg>`;
    const vis = [-8, 14, 38, 60, 78].map((x, i) => el('vis', SIL(i), `left:${x}vw;width:${[34, 30, 32, 28, 34][i]}vw;${dl(ms * (0.16 + i * 0.05))}`)).join('');
    const ropes = [6, 52].map((x) => el('rope', '', `left:${x + 3}vw;width:40vw`)).join('') + [4, 50, 94].map((x) => el('post', '', `left:${x}vw`)).join('');
    let pops = '';
    for (let i = 0; i < 6; i++) pops += el('flashpop', '', `left:${r0(rnd(20, 80))}vw;top:${r0(rnd(14, 50))}vh;${dl(ms * rnd(0.36, 0.8))}`);
    scene(K, 'museum', el('mwall') + el('mrail') + el('mfloor') + el('mspot', '', 'left:-14vw;--r:-16deg') + el('mspot', '', 'left:54vw;--r:16deg') +
      el('mframe', el('mcanvas', land + catNow('mvx-c-mona'))) + el('mplate', '名画「てんぷる」') + ropes + vis + pops);
    fword(K, 'ほぉ…', W * 0.06, H * 0.58, ms * 0.38, '#fff', 26, -6);
    fword(K, 'けっさく!', W * 0.52, H * 0.54, ms * 0.6, '#ffd94a', 32, 8);
  });

  // ---------------- 3. ねこ惑星 ----------------
  def('planet', 'tilt', 4400, (K, G, ms, W, H) => {
    const ring = (front) => `<g transform="rotate(-14 121 86)">${front ? `<path d="M23 86 A98 20 0 0 0 219 86" fill="none" ${L(15)}/><path d="M23 86 A98 20 0 0 0 219 86" fill="none" stroke="#ffd94a" stroke-width="8"/><path d="M44 94 A84 14 0 0 0 198 94" fill="none" stroke="#fff6c2" stroke-width="2.5"/>` : `<ellipse cx="121" cy="86" rx="98" ry="20" fill="none" ${L(15)}/><ellipse cx="121" cy="86" rx="98" ry="20" fill="none" stroke="#e8b83d" stroke-width="8"/>`}</g>`;
    const P = `<svg viewBox="16 -8 210 180" class="mvx-c-nss">${ring(0)}<g class="cat mvx-cat" style="--tint:#d9c4ff">${headSvg('closed')}</g><g fill="#c3a6f5" ${L(2.5)}><circle cx="92" cy="62" r="6"/><circle cx="158" cy="112" r="5"/><circle cx="151" cy="66" r="3.5"/><circle cx="84" cy="111" r="4"/></g>${ring(1)}</svg>`;
    const hill = `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 44 Q90 6 170 32 Q270 66 400 22 V104 H0 Z" fill="#2a2550" ${L(3)}/></svg>`;
    let shoot = '';
    for (let i = 0; i < 4; i++) shoot += el('shoot', '', `left:${r0(rnd(30, 95))}vw;top:${r0(rnd(2, 30))}vh;${dl(ms * (0.15 + i * 0.2))}`);
    scene(K, 'planet', el('pnight') + starsHtml(44, 0, 1500, 78) + shoot + el('pglow') + el('pbody', P) + el('phill', hill) + el('pcat', catNow()));
    fword(K, 'のぼってきた…', W * 0.06, H * 0.08, ms * 0.22, '#c9a7ff', 24, -6);
    fword(K, 'ねこ惑星!?', W * 0.4, H * 0.7, ms * 0.6, '#ffd94a', 34, 6);
  });

  // ---------------- 4. 大名行列 ----------------
  const KAGO = () => `<svg viewBox="0 0 200 130"><path d="M-6 26 H206" ${L(9)}/><path d="M-6 26 H206" stroke="#c27f4a" stroke-width="5"/><path d="M40 30 L160 30 L152 120 L48 120 Z" fill="#3a2f2f" ${L(4)}/><path d="M28 34 Q100 4 172 34 Z" fill="#2b2b2b" ${L(4)}/><path d="M60 46 H140 V100 H60 Z" fill="#ffe3c8" ${L(3)}/>${headAt(72, 48, 56, 'closed')}<path d="M94 60 Q95 49 100 50 Q105 49 106 60 Q100 57 94 60 Z" fill="${INK}"/><path d="M60 46 V100 M140 46 V100" ${L(3)}/><path d="M60 46 H140" stroke="#ffd94a" stroke-width="5"/><path d="M48 112 H152" stroke="#ffd94a" stroke-width="4"/><circle cx="100" cy="18" r="5" fill="#ffd94a" ${L(2.5)}/></svg>`;
  const NOBORI = `<svg viewBox="0 0 60 200"><path d="M10 0 V200" ${L(5)}/><path d="M10 10 H54" ${L(4)}/><rect x="12" y="12" width="40" height="120" fill="#fffdf8" ${L(3.5)}/><text x="32" y="56" font-size="32" font-weight="900" text-anchor="middle" fill="#ff6b6b">猫</text><text x="32" y="102" font-size="32" font-weight="900" text-anchor="middle" fill="#2b2b2b">殿</text></svg>`;
  const YARI = `<svg viewBox="0 0 40 200"><path d="M20 30 V200" ${L(5)}/><path d="M20 30 V200" stroke="#c27f4a" stroke-width="2.5"/><path d="M20 2 Q34 10 32 28 Q20 40 8 28 Q6 10 20 2 Z" fill="${INK}"/><path d="M20 -18 L24 4 H16 Z" fill="#dfe4ea" ${L(2.5)}/></svg>`;
  const HASAMI = `<svg viewBox="0 0 120 60"><path d="M0 14 H120" ${L(8)}/><path d="M0 14 H120" stroke="#c27f4a" stroke-width="4"/><rect x="28" y="18" width="64" height="38" rx="4" fill="#2b2b2b" ${L(3)}/><path d="M34 26 H86" stroke="#ffd94a" stroke-width="3"/><circle cx="60" cy="40" r="7" fill="#ffd94a" ${L(2)}/></svg>`;
  def('daimyo', 'bow', 4800, (K, G, ms, W, H) => {
    const u = Math.min(W * 0.36, 160);
    const walker = (x, i) => el('dw', mini('walk'), `left:${r0(x)}px;width:${r0(u)}px;${dl(-i * 140)}`);
    const item = (w, inner) => el('ditem', inner, `width:${r0(w)}px;height:${r0(u * 1.9)}px`);
    let strip = '';
    strip += item(u, el('pole', NOBORI, `left:${r0(u * 0.22)}px;width:${r0(u * 0.42)}px`) + walker(0, 0));
    strip += item(u, el('pole', YARI, `left:${r0(u * 0.3)}px;width:${r0(u * 0.3)}px`) + walker(0, 1));
    strip += item(u, el('pole', YARI, `left:${r0(u * 0.3)}px;width:${r0(u * 0.3)}px`) + walker(0, 2));
    strip += item(u * 1.8, el('box', HASAMI, `left:0;width:${r0(u * 1.8)}px;top:${r0(u * 0.99)}px`) + walker(0, 3) + walker(u * 0.8, 4));
    strip += item(u * 2.3, el('box', KAGO(), `left:${r0(u * 0.35)}px;width:${r0(u * 1.6)}px;top:${r0(u * 0.99)}px`) + walker(-u * 0.1, 5) + walker(u * 1.4, 6));
    strip += item(u, el('pole', YARI, `left:${r0(u * 0.3)}px;width:${r0(u * 0.3)}px`) + walker(0, 7));
    strip += item(u, el('pole', NOBORI, `left:${r0(u * 0.22)}px;width:${r0(u * 0.42)}px`) + walker(0, 8));
    const pines = [8, 46, 80].map((x, i) => el('pine', `<svg viewBox="0 0 100 120"><path d="M46 120 Q36 92 54 74 Q66 60 48 40" fill="none" ${L(9)}/><path d="M46 120 Q36 92 54 74 Q66 60 48 40" fill="none" stroke="#a8683a" stroke-width="5"/><path d="M4 78 Q8 66 24 68 Q34 60 46 68 Q58 62 64 72 Q56 82 36 80 Q16 86 4 78 Z M44 56 Q48 44 64 46 Q76 40 86 48 Q98 50 94 60 Q80 66 66 62 Q50 66 44 56 Z M18 36 Q22 24 38 26 Q50 18 62 26 Q74 26 72 36 Q58 44 42 40 Q26 46 18 36 Z" fill="#3f9a72" ${L(3)}/><path d="M14 74 Q30 70 44 74 M54 54 Q70 50 84 54 M28 32 Q44 28 60 32" fill="none" stroke="#8fe8c8" stroke-width="2.5" stroke-linecap="round"/></svg>`, `left:${x}vw;width:${[26, 22, 28][i]}vw`)).join('');
    scene(K, 'daimyo', el('dsky') + el('dmt', `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 100 L0 60 Q60 20 110 50 Q170 0 240 46 Q300 20 400 56 V100 Z" fill="#c9d6f0" ${L(3)}/></svg>`) + pines + el('droad') +
      el('dstrip', strip) + el('dbow1', catNow()) + el('dbow2', mini('bow', '#ffe3c8')) + el('dbow3', mini('bow', '#e6e0f5')));
    fword(K, 'したにー', W * 0.5, H * 0.1, ms * 0.12, '#fff', 34, 6);
    fword(K, 'したにー…', W * 0.08, H * 0.2, ms * 0.48, '#ffd94a', 30, -6);
    fword(K, 'ははーっ', W * 0.36, H * 0.62, ms * 0.72, '#ff9fbb', 26, 4);
  });

  // ---------------- 5. てんぷる国会 ----------------
  def('diet', 'upright', 4400, (K, G, ms, W, H) => {
    const rows = [[13, 7, 50], [15.5, 6, 59], [18.5, 6, 69], [22, 5, 80], [26, 4, 93]];
    let seats = '';
    rows.forEach(([sz, n, y], r) => {
      for (let j = 0; j < n; j++) {
        const x = (j + 0.5) * 100 / n, yo = -Math.pow((x - 50) / 50, 2) * 3;
        seats += el('dmp', mini('clap', j % 3 === 1 ? '#ffe3c8' : j % 4 === 2 ? '#e6e0f5' : ''), `left:calc(${r1(x)}vw - ${sz / 2}vw);top:calc(${r1(y + yo)}vh - ${r1(sz * 0.8)}vw);width:${sz}vw;${dl(r * 60 + rnd(0, 140))}`);
      }
      seats += el('ddesk', '', `top:calc(${y}vh - ${r1(sz * 0.3)}vw)`);
    });
    const glass = `<svg viewBox="0 0 200 100"><path d="M0 100 A100 100 0 0 1 200 100 Z" fill="#fff6c2" ${L(3)}/>${[0, 1, 2, 3, 4, 5].map((i) => { const a0 = Math.PI * (1 - i / 6), a1 = Math.PI * (1 - (i + 1) / 6); return `<path d="M100 100 L${r1(100 + 92 * Math.cos(a0))} ${r1(100 - 92 * Math.sin(a0))} A92 92 0 0 1 ${r1(100 + 92 * Math.cos(a1))} ${r1(100 - 92 * Math.sin(a1))} Z" fill="${POP[i]}" ${L(2.5)}/>`; }).join('')}<circle cx="100" cy="100" r="26" fill="#ffd94a" ${L(3)}/></svg>`;
    scene(K, 'diet', el('dwall') + el('dglass', glass) + el('dbanner', 'てんぷる国会') + el('dspeaker', catNow()) + el('drostrum') + seats);
    fword(K, '起立!', W * 0.06, H * 0.3, ms * 0.24, '#fff', 34, -8);
    fword(K, 'パチパチパチ', W * 0.38, H * 0.42, ms * 0.44, '#ffd94a', 30, 6);
    fword(K, 'さんせーい!', W * 0.1, H * 0.62, ms * 0.66, '#ff9fbb', 30, -4);
  });

  // ---------------- 6. 記者会見 ----------------
  const MIC = (c, t, h = 120) => `<svg viewBox="0 0 40 ${r0(h)}"><path d="M20 30 V${r0(h)}" ${L(9)}/><path d="M20 30 V${r0(h)}" stroke="#6b6b78" stroke-width="5"/><rect x="5" y="40" width="30" height="24" rx="3" fill="${c}" ${L(3)}/><text x="20" y="58" font-size="15" font-weight="900" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="2.5" paint-order="stroke">${t}</text><ellipse cx="20" cy="18" rx="13" ry="16" fill="#4a4a55" ${L(3)}/><path d="M10 12 H30 M8 19 H32 M10 26 H30" stroke="#8a8a96" stroke-width="2"/></svg>`;
  const SNAPPER = (c) => `<svg viewBox="0 0 120 110"><path d="M6 110 Q6 64 52 58 Q96 62 100 110 Z" fill="${c}" ${L(3)}/><circle cx="50" cy="34" r="26" fill="${c}" ${L(3)}/><rect x="40" y="22" width="56" height="36" rx="6" fill="#2b2b2b" ${L(3)}/><circle cx="74" cy="40" r="11" fill="#5a6a8a" ${L(3)}/><rect x="80" y="10" width="16" height="12" rx="2" fill="#dfe4ea" ${L(2.5)}/></svg>`;
  def('presscon', 'doya', 4200, (K, G, ms, W, H) => {
    const cw = W * 0.9, ch = cw * 200 / 240, tableY = H * 0.66, catTop = tableY + ch * 0.1 - ch, mouth = catTop + ch * 0.56;
    let wall = '';
    for (let i = 0; i < 40; i++) wall += el('logo', i % 2 ? 'てんぷる' : '★TP★', `left:${(i % 4) * 26 - 4 + (Math.floor(i / 4) % 2) * 13}vw;top:${Math.floor(i / 4) * 8}vh`);
    let mics = '';
    const N = 18, cols = ['#ff6b6b', '#8fd0ff', '#ffd94a', '#8fe8c8', '#c9a7ff', '#ffa95e', '#ff9fbb'], tx = ['ね', 'こ', 'A', 'TV', '7', 'Q', 'ぷ'];
    for (let i = 0; i < N; i++) {
      const bx = W * (0.16 + 0.68 * i / (N - 1)) + rnd(-8, 8), by = tableY + H * rnd(0.025, 0.09);
      const txp = W / 2 + rnd(-W * 0.1, W * 0.1), typ = mouth + rnd(-4, 40);
      const dx = txp - bx, dy = typ - by, len = Math.max(80, Math.hypot(dx, dy)), ang = Math.atan2(dx, -dy) * 180 / Math.PI;
      const w = Math.min(W * 0.11, 48);
      mics += el('mic', MIC(cols[i % 7], tx[i % 7], len * 40 / w), `left:${r0(bx - w / 2)}px;top:${r0(by - len)}px;width:${r0(w)}px;--r:${r1(ang)}deg;${dl(ms * (0.06 + 0.24 * ((i * 7) % N) / N))}`);
    }
    let pops = '';
    for (let i = 0; i < 18; i++) pops += el('flashpop', '', `left:${r0(rnd(0, 92))}vw;top:${r0(rnd(30, 92))}vh;${dl(ms * rnd(0.3, 0.9))}`);
    const snaps = [-6, 22, 52, 76].map((x, i) => el('snapper', SNAPPER(['#2f3045', '#3a3350', '#2a2f40', '#33304a'][i]), `left:${x}vw;${i % 2 ? 'transform:scaleX(-1);' : ''}`)).join('');
    scene(K, 'presscon', el('pwall', wall) + el('prcat', catNow(), `left:${r0((W - cw) / 2)}px;top:${r0(catTop)}px;width:${r0(cw)}px`) +
      el('ptable', el('pplate', 'てんぷる'), `top:${r0(tableY)}px`) + mics + snaps + pops);
    K.flash(ms * 0.34, '#fff', 260);
    K.flash(ms * 0.52, '#fff', 260);
    K.flash(ms * 0.7, '#fff', 300);
    fword(K, 'パシャ!', W * 0.06, H * 0.14, ms * 0.3, '#fff', 30, -10);
    fword(K, 'パシャパシャ', W * 0.46, H * 0.22, ms * 0.5, '#ffd94a', 30, 8);
    fword(K, 'ひとこと!', W * 0.1, H * 0.82, ms * 0.68, '#ff9fbb', 30, -4);
  });

  // ---------------- 7. お寿司のみこし ----------------
  const SUSHI = (k) => {
    const t = [['#ffa95e', '<path d="M16 12 L22 24 M28 10 L34 22 M40 10 L44 20" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'], ['#ff6b6b', '<path d="M14 18 Q30 12 48 18" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>'], ['#ffd94a', `<rect x="25" y="6" width="12" height="44" fill="#2f4a3a" ${L(2.5)}/>`], ['#ffb0a0', `<path d="M54 16 L62 4 L62 26 Z" fill="#ff6b6b" ${L(2.5)}/><path d="M16 14 H44 M18 21 H42" stroke="#ff6b6b" stroke-width="3"/>`]][k % 4];
    return `<svg viewBox="0 0 64 60"><path d="M20 48 L16 58 M44 48 L48 58" ${L(3.5)}/><rect x="8" y="22" width="48" height="28" rx="13" fill="#fffdf8" ${L(3)}/><path d="M3 22 Q6 4 32 6 Q58 4 61 20 Q62 30 32 29 Q2 30 3 22 Z" fill="${t[0]}" ${L(3)}/>${t[1]}<circle cx="23" cy="39" r="2.4" fill="${INK}"/><circle cx="41" cy="39" r="2.4" fill="${INK}"/><path d="M28 42 Q32 46 36 42" fill="none" ${L(2)}/></svg>`;
  };
  def('sushiparade', 'banzai', 4400, (K, G, ms, W, H) => {
    K.back('#ffe3c8', 0.85);
    let crowd = '';
    for (let i = 0; i < 22; i++) {
      const back = i % 2 === 0, x = (i / 22) * 230 + rnd(-3, 3);
      if (x > 78 && x < 148 && !back) continue;
      crowd += el('sushi' + (back ? ' sback' : ''), SUSHI(i), `left:${r1(x)}vw;width:${back ? 15 : 21}vw;${dl(-rnd(0, 600))}`);
    }
    let bearers = '';
    for (let i = 0; i < 4; i++) bearers += el('sushi bearer', SUSHI(i + 1), `left:${4 + i * 23}%;${dl(-i * 160)}`);
    const board = `<svg viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M-30 30 H330" ${L(10)}/><path d="M-30 30 H330" stroke="#c27f4a" stroke-width="6"/><rect x="20" y="18" width="260" height="26" rx="4" fill="#d79a62" ${L(3.5)}/><path d="M40 44 L36 58 M150 44 V58 M260 44 L264 58" ${L(3)}/><path d="M30 26 H270" stroke="#ff6b6b" stroke-width="4"/></svg>`;
    let lanterns = '';
    for (let i = 0; i < 7; i++) lanterns += el('lantern', `<svg viewBox="0 0 30 44"><path d="M15 0 V6" ${L(2.5)}/><rect x="6" y="5" width="18" height="4" fill="${INK}"/><ellipse cx="15" cy="23" rx="13" ry="15" fill="${i % 2 ? '#ff6b6b' : '#fffdf8'}" ${L(3)}/><path d="M4 18 H26 M3 25 H27 M5 31 H25" stroke="${INK}" stroke-width="1.5" opacity=".4"/><rect x="6" y="37" width="18" height="4" fill="${INK}"/></svg>`, `left:${4 + i * 14}vw;top:${r0(4 + Math.sin((i / 6) * Math.PI) * 5)}vh;${dl(-i * 200)}`);
    scene(K, 'sparty', el('lstring') + lanterns + el('sparade', crowd + el('mikoshi', el('mcat', catNow()) + el('board', board) + bearers)));
    fword(K, 'わっしょい!', W * 0.06, H * 0.2, ms * 0.2, '#ff6b6b', 34, -8);
    fword(K, 'わっしょい!', W * 0.42, H * 0.3, ms * 0.48, '#ffd94a', 34, 6);
    fword(K, 'わっしょい!!', W * 0.12, H * 0.42, ms * 0.72, '#8fe8c8', 36, -4);
  });

  // ---------------- 8. 茶柱 ----------------
  def('chabashira', 'kira', 4000, (K, G, ms, W, H) => {
    K.back('#e8f5d0', 0.85);
    const cup = `<svg viewBox="0 0 300 340" class="mvx-c-nss"><path d="M18 40 Q20 250 62 318 Q150 342 238 318 Q280 250 282 40 Z" fill="#9fd4b6" ${L(4.5)}/><path d="M30 120 Q150 150 270 120" fill="none" stroke="#5fa88a" stroke-width="10" opacity=".6"/><path d="M60 60 Q56 100 64 130 M110 64 Q106 112 114 150 M190 64 Q196 110 188 140 M240 60 Q246 96 236 124" fill="none" stroke="#fffdf8" stroke-width="5" stroke-linecap="round" opacity=".6"/><path d="M70 318 L74 336 H226 L230 318" fill="#7fbfa0" ${L(4)}/><ellipse cx="150" cy="40" rx="132" ry="30" fill="#bfe6cf" ${L(4.5)}/><ellipse cx="150" cy="44" rx="116" ry="22" fill="#b7d36b" ${L(3)}/><ellipse cx="130" cy="40" rx="60" ry="8" fill="#d9ec9a" opacity=".7"/></svg>`;
    let steam = '';
    for (let i = 0; i < 3; i++) steam += el('steam', `<svg viewBox="0 0 30 100"><path d="M15 100 Q0 80 15 60 Q30 40 15 20 Q6 8 15 0" fill="none" ${L(4, '#fff')}/></svg>`, `left:${32 + i * 14}vw;${dl(i * 400)}`);
    let rip = '';
    for (let i = 0; i < 3; i++) rip += el('ripple', '', dl(ms * 0.42 + i * 220));
    let sp = '';
    for (let i = 0; i < 14; i++) sp += el('spark', pick(['✦', '✧', '★']), `left:${r0(rnd(6, 90))}vw;top:${r0(rnd(4, 60))}vh;font-size:${r0(rnd(16, 34))}px;color:${pick(['#ffd94a', '#fff', '#ff9fbb', '#8fe8c8'])};${dl(ms * rnd(0.46, 0.8))}`);
    scene(K, 'chaba', el('crays') + el('kichi', '吉') + steam + el('cup', cup) + rip + el('stalk') + sp);
    fword(K, 'ゆらゆら…', W * 0.08, H * 0.42, ms * 0.12, '#8fe8c8', 24, -6);
    fword(K, 'たった!!', W * 0.56, H * 0.44, ms * 0.42, '#ff6b6b', 34, 8);
  });

  // ---------------- 9. 福笑い ----------------
  const FP = {
    eye: `<svg viewBox="0 0 40 36"><ellipse cx="20" cy="19" rx="17" ry="15" fill="#fffdf8" ${L(3)}/><circle cx="22" cy="22" r="8" fill="#6f95d8" ${L(2)}/><circle cx="22" cy="22" r="4.5" fill="${INK}"/><circle cx="25" cy="18" r="2.6" fill="#fff"/><path d="M2 12 Q20 3 38 12" fill="none" ${L(3)}/></svg>`,
    nose: `<svg viewBox="0 0 30 22"><path d="M3 4 Q15 0 27 4 Q24 16 15 19 Q6 16 3 4 Z" fill="#f2a7b2" ${L(3)}/></svg>`,
    mouth: `<svg viewBox="0 0 50 26"><path d="M25 2 V9 M5 6 Q14 20 25 9 Q36 20 45 6" fill="none" ${L(3.5)}/></svg>`,
    wl: `<svg viewBox="0 0 60 40"><path d="M58 10 L4 2 M58 20 L2 20 M58 30 L4 38" fill="none" ${L(3)}/></svg>`,
    blush: `<svg viewBox="0 0 40 20"><ellipse cx="20" cy="10" rx="18" ry="8" fill="#ff9fbb" opacity=".7"/></svg>`,
  };
  def('fukuwarai', 'eyemask', 4400, (K, G, ms, W, H) => {
    const parts = [['eye', 31.6, 57, 17], ['eye', 68.4, 57, 17], ['nose', 50, 70, 11], ['mouth', 50, 79, 17], ['wl', 12, 73, 20, 0], ['wl', 88, 73, 20, 1], ['blush', 22, 72, 14], ['blush', 78, 72, 14]];
    const pieces = parts.map(([k, x, y, w, flip], i) => el('fp', FP[k], `left:${x}%;top:${y}%;width:${w}%;--x1:${r0(rnd(-34, 34))}vw;--y1:${r0(rnd(-26, 30))}vw;--r1:${r0(rnd(-200, 200))}deg;--x2:${r0(rnd(-30, 30))}vw;--y2:${r0(rnd(-24, 26))}vw;--r2:${r0(rnd(-160, 160))}deg;${flip ? '--sx:-1;' : ''}${dl(i * 90)}`)).join('');
    const face = `<svg viewBox="64 28 114 104" class="mvx-c-nss"><path d="${HEADPATH}" fill="#fffdf8" ${L(4)}/><ellipse cx="121" cy="64" rx="9" ry="7" fill="#f2b98a" opacity=".45"/><path d="M96 37 L100 48 M146 37 L142 48" ${L(2.5)} opacity=".4"/></svg>`;
    scene(K, 'fuku', el('fwtitle', 'ふくわらい') + el('fface', face + pieces) + el('fcat', catNow()));
    fword(K, 'あれれ?', W * 0.08, H * 0.16, ms * 0.2, '#ff9fbb', 28, -8);
    fword(K, 'こっち?', W * 0.56, H * 0.2, ms * 0.4, '#8fd0ff', 28, 8);
    fword(K, 'できた!', W * 0.32, H * 0.78, ms * 0.68, '#ffd94a', 38, -4);
  });

  // ---------------- 10. てんぷる前線 ----------------
  const JP = [
    'M196 42 L214 22 L236 30 L256 16 L272 32 L294 38 L284 62 L268 74 L260 96 L244 88 L228 104 L212 96 L206 78 L192 68 Z',
    'M222 110 L240 112 L246 138 L240 168 L242 196 L228 222 L220 238 L206 246 L196 240 L182 256 L166 262 L150 274 L132 270 L112 276 L92 278 L74 288 L60 282 L70 270 L96 262 L120 254 L140 240 L156 226 L160 206 L170 196 L178 206 L186 194 L200 180 L210 158 L214 134 Z',
    'M102 290 L124 284 L146 286 L158 296 L142 306 L124 314 L106 306 Z',
    'M50 292 L70 288 L84 300 L88 322 L80 346 L64 358 L50 346 L42 324 L44 306 Z',
  ];
  def('frontline', 'sign', 4600, (K, G, ms, W, H) => {
    const mapH = H * 0.8, s = Math.min(W / 300, mapH / 400), ox = (W - 300 * s) / 2, oy = H * 0.1 + (mapH - 400 * s) / 2;
    const cities = [['福岡', 64, 304], ['大阪', 140, 266], ['東京', 214, 236], ['金沢', 168, 214], ['仙台', 236, 176], ['青森', 228, 118], ['札幌', 220, 70]];
    let pins = '';
    cities.forEach(([nm, x, y]) => {
      const sx = ox + x * s, sy = oy + y * s, proj = ((sx - W / 2) - (sy - H / 2)) / Math.SQRT2;
      const f = 0.12 + 0.76 * (proj + 0.99 * W) / (1.98 * W);
      pins += `<g class="mvx-c-pin" style="${dl(ms * Math.min(0.86, f + 0.02))}"><circle cx="${x}" cy="${y}" r="3.5" fill="${INK}"/>${headAt(x - 13, y - 30, 26, 'happy', '#ffe3ec')}<text x="${x + 15}" y="${y + 4}" font-size="11" font-weight="900" fill="${INK}" stroke="#fff" stroke-width="3" paint-order="stroke">${nm}</text></g>`;
    });
    const map = `<svg viewBox="0 0 300 400" class="mvx-c-nss"><g fill="#c8f0b0" ${L(2.5)}>${JP.map((d) => `<path d="${d}"/>`).join('')}</g><path d="M14 380 L22 374 L28 382 Z M36 362 L40 358 L42 364 Z" fill="#c8f0b0" ${L(2)}/>${pins}</svg>`;
    let marks = '';
    for (let i = 0; i < 80; i++) marks += i % 2 ? `<path d="M${i * 30} 0 L${i * 30 + 7} -16 L${i * 30 + 14} 0 Z" fill="#ff6b6b" ${L(2.5)}/>` : `<path d="M${i * 30} 0 A8 8 0 0 1 ${i * 30 + 16} 0 Z" fill="#ff9fbb" ${L(2.5)}/>`;
    const front = `<svg viewBox="0 -20 2400 24"><path d="M0 0 H2400" ${L(6)}/><path d="M0 0 H2400" stroke="#ff6b6b" stroke-width="3"/>${marks}</svg>`;
    scene(K, 'front', el('fgrid') + el('fmap', map) + el('fline', el('fzone') + front) + el('fbar', 'てんぷる前線 北上中') + el('fcat', catNow()));
    fword(K, 'ほくじょう!', W * 0.06, H * 0.84, ms * 0.3, '#ff9fbb', 30, -6);
    fword(K, 'にゃんぱく!', W * 0.46, H * 0.16, ms * 0.66, '#ffd94a', 30, 6);
  });

  // ---------------- 11. 富士山 ----------------
  const BIRD = `<svg viewBox="0 0 40 20"><path d="M2 12 Q10 2 20 12 Q30 2 38 12" fill="none" ${L(3)}/></svg>`;
  def('mtfuji', 'flag', 4600, (K, G, ms, W, H) => {
    const fuji = `<svg viewBox="0 0 600 400" preserveAspectRatio="none" class="mvx-c-nss"><path d="M-20 404 Q120 330 200 200 Q240 120 262 46 L280 52 L300 40 L318 50 L338 44 Q360 120 400 200 Q480 330 620 404 Z" fill="#6f8fd8" ${L(4)}/><path d="M120 330 Q200 300 222 240 M480 330 Q400 300 378 240 M300 180 V260 M250 210 Q240 260 200 300 M350 210 Q360 260 400 300" fill="none" stroke="#5a78c0" stroke-width="6" stroke-linecap="round"/><path d="M262 46 L280 52 L300 40 L318 50 L338 44 Q350 92 372 140 L352 128 L340 150 L322 126 L302 156 L284 126 L266 148 L252 128 L228 142 Q248 96 262 46 Z" fill="#fffdf8" ${L(3.5)}/></svg>`;
    let clouds = '';
    for (let i = 0; i < 4; i++) clouds += el('fcloud', CLOUD(), `left:${[-10, 30, 62, 8][i]}vw;top:${[62, 66, 60, 74][i]}vh;width:${[46, 40, 50, 44][i]}vw;${dl(-i * 700)}`);
    let birds = '';
    for (let i = 0; i < 5; i++) birds += el('bird', BIRD, `top:${r0(14 + i * 4 + rnd(-2, 2))}vh;width:${r0(rnd(6, 9))}vw;${dl(ms * (0.5 + i * 0.05))}`);
    scene(K, 'fuji', el('fsky') + el('fnight') + starsHtml(24, 0, 1000, 40) + el('fsun') + el('fbox', fuji + el('fcat', catNow())) + clouds + birds + el('fdia', '✦'));
    fword(K, 'ゴゴゴゴ…', W * 0.06, H * 0.5, ms * 0.08, '#fff', 28, -6);
    fword(K, 'ご来光!!', W * 0.28, H * 0.08, ms * 0.6, '#ffd94a', 42, -6);
  });

  // ---------------- 12. ねぶた ----------------
  def('nebuta', 'ouen', 4800, (K, G, ms, W, H) => {
    const nb = `<svg viewBox="0 0 400 330" class="mvx-c-nss">` +
      `<path d="M330 214 Q352 160 366 112" ${L(22)}/><path d="M330 214 Q352 160 366 112" stroke="#fff6e8" stroke-width="15" stroke-linecap="round"/><path d="M368 108 V40" ${L(5)}/><path d="M368 44 Q340 20 352 0 Q368 -8 384 0 Q396 20 368 44 Z" fill="#ffd94a" ${L(4)}/><circle cx="368" cy="18" r="7" fill="#ff6b6b" ${L(3)}/><circle cx="366" cy="110" r="13" fill="#fff6e8" ${L(4)}/>` +
      `<path d="M60 206 Q120 176 200 178 Q280 176 340 206 L372 300 H28 Z" fill="#ff6b6b" ${L(5)}/><path d="M86 214 L120 300 M314 214 L280 300" ${L(4)}/><path d="M120 196 L200 300 L280 196" fill="#5b86d8" ${L(4)}/><path d="M150 200 L200 266 L250 200" fill="#4fb38a" ${L(4)}/><path d="M40 250 Q70 230 100 250 M300 250 Q330 230 360 250" fill="none" stroke="#ffd94a" stroke-width="6"/><path d="M28 300 H372" stroke="#ffd94a" stroke-width="7"/>` +
      `${headAt(104, 12, 192, 'open', '#fff6e8')}` +
      `<path d="M138 132 Q118 124 112 100 M150 158 Q130 168 120 186 M262 132 Q282 124 288 100 M250 158 Q270 168 280 186" fill="none" stroke="#ff3b3b" stroke-width="7" stroke-linecap="round"/><path d="M138 82 L190 92 L188 101 L140 93 Z M262 82 L210 92 L212 101 L260 93 Z" fill="${INK}"/>` +
      `<path d="M160 40 Q200 70 240 40 Q238 62 200 70 Q162 62 160 40 Z" fill="#ffd94a" ${L(4)}/><circle cx="200" cy="64" r="8" fill="#ff6b6b" ${L(3)}/>` +
      `<rect x="10" y="300" width="380" height="24" rx="4" fill="#8a2f3a" ${L(4)}/><path d="M24 316 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="2.5"/></svg>`;
    const hat = `<svg viewBox="0 0 60 30"><ellipse cx="30" cy="23" rx="28" ry="6" fill="#ffd94a" ${L(3)}/><circle cx="17" cy="15" r="8" fill="#ff9fbb" ${L(2.5)}/><circle cx="30" cy="10" r="9" fill="#ff6b6b" ${L(2.5)}/><circle cx="43" cy="15" r="8" fill="#c9a7ff" ${L(2.5)}/></svg>`;
    let dancers = '';
    for (let i = 0; i < 5; i++) dancers += el('haneto', mini(i % 2 ? 'banzai' : 'ouen', ['', '#ffe3ec', '#e6f0ff', '#fff6c2', ''][i]) + el('hat', hat), `left:${-6 + i * 24}%;${dl(-i * 130)}`);
    let lights = '';
    for (let i = 0; i < 12; i++) lights += el('nlamp', '', `left:${r0(rnd(0, 96))}vw;top:${r0(rnd(60, 96))}vh;${dl(-rnd(0, 1200))}`);
    scene(K, 'nebuta', el('nnight') + starsHtml(20, 0, 1000, 40) + lights + el('nfloat', el('nglow') + nb + dancers));
    fword(K, 'ラッセラー!', W * 0.06, H * 0.08, ms * 0.18, '#ffd94a', 34, -8);
    fword(K, 'ドン ドン', W * 0.56, H * 0.62, ms * 0.4, '#ff9fbb', 28, 8);
    fword(K, 'ラッセラー!!', W * 0.3, H * 0.8, ms * 0.66, '#8fe8c8', 34, -4);
  });

  // ---------------- 13. 大波 ----------------
  def('greatwave', 'teatime', 4600, (K, G, ms, W, H) => {
    let claws = '';
    [[110, 64], [146, 48], [184, 40], [222, 42], [258, 52], [290, 70], [314, 94], [326, 122]].forEach(([x, y], i) => { claws += `<path d="M${x} ${y} q${8 + i} -12 ${20 + i} -2 q-8 -2 -10 8 q-4 -6 -10 -6 Z" fill="#fffdf8" ${L(2.5)}/>`; });
    const wv = `<svg viewBox="0 0 400 420" class="mvx-c-nss"><path d="M-10 424 L-10 230 Q0 120 90 70 Q170 30 250 50 Q320 70 330 130 Q300 100 262 104 Q220 112 214 156 Q210 196 246 226 Q290 260 360 270 Q400 280 420 300 L420 424 Z" fill="#2e4f7f" ${L(4)}/>` +
      `<path d="M20 410 Q16 260 90 160 Q150 96 240 90 M60 410 Q60 290 120 210 Q170 150 226 140 M120 410 Q130 330 200 270 Q240 240 300 250" fill="none" stroke="#5b86b8" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M90 70 Q170 30 250 50 Q320 70 330 130 Q312 112 296 110 Q300 92 282 88 Q284 72 262 70 Q248 60 228 66 Q204 54 184 64 Q156 58 138 74 Q112 70 90 70 Z" fill="#fffdf8" ${L(3)}/>${claws}</svg>`;
    let drops = '';
    for (let i = 0; i < 22; i++) drops += el('gdrop', '', `left:${r0(rnd(40, 80))}vw;top:${r0(rnd(30, 40))}vh;--dx:${r0(rnd(-10, 40))}vw;--dy:${r0(rnd(-24, 10))}vh;width:${r0(rnd(8, 16))}px;${dl(ms * rnd(0.38, 0.5))}`);
    let sea = '';
    for (let i = 0; i < 24; i++) sea += `<path d="M${i * 40} 30 q10 -22 20 -10 q6 -14 20 0" fill="#fffdf8" ${L(2.5)}/>`;
    const fuji = `<svg viewBox="0 0 100 50"><path d="M0 50 Q30 30 42 8 L58 8 Q70 30 100 50 Z" fill="#5b86b8" ${L(2.5)}/><path d="M42 8 L58 8 Q62 16 66 22 L58 20 L50 26 L42 20 L34 22 Q38 16 42 8 Z" fill="#fffdf8" ${L(2)}/></svg>`;
    const boat = `<svg viewBox="0 0 200 70"><path d="M4 18 Q100 34 196 10 L176 62 Q100 74 24 62 Z" fill="#c27f4a" ${L(4)}/><path d="M18 34 Q100 48 186 28" fill="none" ${L(2.5)} opacity=".6"/></svg>`;
    scene(K, 'gwave', el('gsky') + el('gfuji', fuji) + el('gwv', wv) + drops + el('gboat', catNow() + el('gboatb', boat)) +
      el('gsea', `<svg viewBox="0 0 960 60" preserveAspectRatio="none"><path d="M0 30 ${Array.from({ length: 24 }, () => 'q10 -12 20 0 t20 0').join(' ')} V60 H0 Z" fill="#2e4f7f" ${L(3)}/>${sea}</svg>`) + el('gtitle', 'てんぷる沖浪裏'));
    fword(K, 'ざっぱーん!!', W * 0.04, H * 0.14, ms * 0.4, '#8fd0ff', 38, -8);
    fword(K, 'ずずー…', W * 0.6, H * 0.46, ms * 0.6, '#fff', 24, 6);
  });

  // ---------------- 14. モアイ ----------------
  const MOAI = (tint) => `<svg viewBox="0 0 100 200" class="mvx-c-nss"><path d="M12 204 L14 120 Q8 70 18 40 L24 4 L38 22 L62 22 L76 4 L82 40 Q92 70 86 120 L88 204 Z" fill="${tint}" ${L(3.5)}/><path d="M28 12 L34 22 M72 12 L66 22" ${L(2.5)}/><path d="M18 52 Q50 44 82 52 L82 64 Q50 58 18 64 Z" fill="#8f897f" ${L(3)}/><path d="M24 66 Q34 80 46 66 Z M54 66 Q66 80 76 66 Z" fill="#5a554e" ${L(2.5)}/><path d="M46 62 L38 106 Q50 116 62 106 L54 62" fill="${tint}" ${L(3)}/><path d="M44 106 Q50 102 56 106" fill="none" ${L(2)}/><path d="M34 124 Q42 132 50 124 Q58 132 66 124" fill="none" ${L(3.5)}/><path d="M10 100 L32 106 M8 112 L32 112 M90 100 L68 106 M92 112 L68 112" ${L(2.5)}/><path d="M30 144 Q50 152 70 144 M20 170 Q50 180 80 170" fill="none" ${L(2.5)} opacity=".5"/><circle cx="28" cy="90" r="2" fill="#7a746b"/><circle cx="72" cy="84" r="2.5" fill="#7a746b"/><circle cx="60" cy="150" r="2" fill="#7a746b"/></svg>`;
  def('moai', 'stare', 4400, (K, G, ms, W, H) => {
    const back = [[0, 24, 27, 0.08, '#b8b2a7'], [38, 24, 28, 0.2, '#c4bdb0'], [76, 24, 27, 0.14, '#a9a39a']];
    const front = [[-16, 52, 0, 0.32, '#c4bdb0'], [62, 54, -2, 0.42, '#b8b2a7']];
    const mo = (a) => a.map(([x, w, b, d, t]) => el('moai', MOAI(t), `left:${x}vw;width:${w}vw;bottom:${b}vh;${dl(ms * d)}`) + el('mdust', '', `left:${x + w / 2}vw;bottom:${b + 2}vh;${dl(ms * d)}`)).join('');
    const ground = `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 14 Q60 0 120 10 Q200 24 280 8 Q340 0 400 12 V104 H0 Z" fill="#7fd6a8" ${L(3)}/><path d="M30 40 l6 -10 l6 10 M150 60 l6 -10 l6 10 M300 44 l6 -10 l6 10 M240 80 l6 -10 l6 10" fill="none" stroke="#4fb38a" stroke-width="3"/></svg>`;
    scene(K, 'moaisc', el('msky') + el('msun') + mo(back) + el('mground', ground) + mo(front) + el('moaicat', catNow()));
    fword(K, 'ゴゴゴゴ…', W * 0.06, H * 0.1, ms * 0.06, '#fff', 30, -6);
    fword(K, 'にょきっ', W * 0.5, H * 0.36, ms * 0.36, '#ffd94a', 34, 8);
    fword(K, '…じーっ', W * 0.24, H * 0.56, ms * 0.66, '#c9a7ff', 26, -4);
  });

  // ---------------- 15. ピラミッドとスフィンクス ----------------
  def('pyramid', 'loaf', 4600, (K, G, ms, W, H) => {
    let rows = '';
    for (let k = 0; k < 8; k++) {
      const w = 110 * (1 - k / 8.6), n = Math.max(1, 8 - k);
      rows += el('prow', Array.from({ length: n }, () => '<span></span>').join(''), `left:${r1(50 - w / 2)}vw;width:${r1(w)}vw;bottom:${26 + k * 6}vh;${dl(ms * (0.04 + k * 0.045))}`);
    }
    const sphinx = `<svg viewBox="0 0 300 170" class="mvx-c-nss"><defs><pattern id="mvxc-nemes" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="6" fill="#ffd94a"/><rect y="6" width="12" height="6" fill="#5b86d8"/></pattern></defs>` +
      `<path d="M22 100 Q-4 96 6 70 Q12 60 22 68" fill="none" ${L(6)}/><path d="M20 164 L20 120 Q24 92 70 88 L200 84 L230 120 L236 164 Z" fill="#e8c27d" ${L(4)}/><path d="M60 110 Q100 100 150 108 M50 136 Q110 126 180 134" fill="none" stroke="#c99a55" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M198 16 Q236 2 274 16 L302 72 L306 142 L166 142 L170 72 Z" fill="url(#mvxc-nemes)" ${L(4)}/>${headAt(186, 8, 98, 'closed', '#e8c27d')}<path d="M200 36 Q235 22 270 36" fill="none" stroke="#ffd94a" stroke-width="6"/>` +
      `<path d="M180 150 Q178 138 192 138 L292 140 Q300 146 292 154 L192 156 Z M190 166 Q188 154 202 154 L296 156 Q304 162 296 168 L202 170 Z" fill="#e8c27d" ${L(3.5)}/></svg>`;
    const dune = (c, d) => `<svg viewBox="0 0 400 80" preserveAspectRatio="none"><path d="${d} V84 H0 Z" fill="${c}" ${L(3)}/></svg>`;
    scene(K, 'pyra', el('pysky') + el('pysun') + rows + el('pcap', `<svg viewBox="0 0 40 30"><path d="M20 2 L38 28 H2 Z" fill="#ffd94a" ${L(3)}/><path d="M20 2 L20 28 H2 Z" fill="#fff6c2" opacity=".6"/></svg>`, `bottom:${26 + 8 * 6}vh;${dl(ms * 0.42)}`) +
      el('pdune1', dune('#f1c27d', 'M0 30 Q100 0 200 24 Q300 46 400 16')) + el('sphx', sphinx) + el('pdune2', dune('#e8b066', 'M0 40 Q120 16 220 40 Q320 60 400 30')));
    fword(K, 'ドン!ドン!ドン!', W * 0.06, H * 0.08, ms * 0.12, '#ffa95e', 30, -6);
    fword(K, 'スフィンクス!?', W * 0.3, H * 0.5, ms * 0.6, '#ffd94a', 32, 6);
  });

  // ---------------- 16. UFOが牛を返しに来る ----------------
  const UFO = `<svg viewBox="0 0 200 96" class="mvx-c-nss"><path d="M58 46 Q60 4 100 4 Q140 4 142 46 Z" fill="#bfe6ff" ${L(4)}/><path d="M92 18 L86 6 M108 18 L114 6" ${L(2.5)}/><circle cx="86" cy="6" r="3" fill="#ffd94a" ${L(2)}/><circle cx="114" cy="6" r="3" fill="#ffd94a" ${L(2)}/><ellipse cx="100" cy="30" rx="16" ry="14" fill="#8fe8c8" ${L(3)}/><ellipse cx="93" cy="30" rx="4" ry="6" fill="${INK}"/><ellipse cx="107" cy="30" rx="4" ry="6" fill="${INK}"/><path d="M96 38 Q100 41 104 38" fill="none" ${L(2)}/><path d="M24 64 Q100 98 176 64" fill="#9aa0b8" ${L(4)}/><ellipse cx="100" cy="54" rx="96" ry="20" fill="#dfe3ee" ${L(4)}/>${[34, 66, 100, 134, 166].map((x, i) => `<circle class="mvx-c-ulight" cx="${x}" cy="${i % 4 ? 62 : 56}" r="6" fill="${POP[i]}" ${L(2.5)} style="animation-delay:${i * 0.12}s"/>`).join('')}</svg>`;
  const COW = `<svg viewBox="0 0 130 100"><path d="M100 40 Q118 36 116 58" fill="none" ${L(3)}/><path d="M28 62 V92 M44 64 V94 M84 64 V94 M98 62 V90" ${L(7)}/><path d="M28 62 V92 M44 64 V94 M84 64 V94 M98 62 V90" stroke="#fffdf8" stroke-width="3.5"/><rect x="20" y="28" width="86" height="42" rx="20" fill="#fffdf8" ${L(3.5)}/><path d="M40 30 Q52 40 46 52 Q34 50 36 36 Z M72 44 Q86 40 90 56 Q78 64 70 56 Z M92 30 Q100 32 102 40 Q94 42 92 30 Z" fill="${INK}"/><path d="M10 18 L4 8 M30 18 L36 8" ${L(4)}/><ellipse cx="20" cy="34" rx="16" ry="15" fill="#fffdf8" ${L(3.5)}/><ellipse cx="16" cy="44" rx="13" ry="9" fill="#ffb0c0" ${L(3)}/><circle cx="12" cy="44" r="1.8" fill="${INK}"/><circle cx="20" cy="44" r="1.8" fill="${INK}"/><circle cx="14" cy="30" r="2.6" fill="${INK}"/><circle cx="27" cy="30" r="2.6" fill="${INK}"/><path d="M30 52 L34 62" ${L(2.5)}/><rect x="28" y="60" width="30" height="16" rx="3" fill="#fff6c2" ${L(2.5)}/><text x="43" y="72" font-size="10" font-weight="900" text-anchor="middle" fill="${INK}">返却</text></svg>`;
  def('ufoabduct', 'gaan', 4600, (K, G, ms, W, H) => {
    K.back('#1d1f4a', 0.9);
    K.dark('#1d1f4a', 0.72, 0.06, 0.9);
    const cw = G.w * 0.62, cx = G.cx + G.w * 0.22, gy = G.y + G.h * 0.97, ch = cw * 100 / 130;
    A(K, 'cow', COW, `left:${r0(cx - cw / 2)}px;top:${r0(gy - ch)}px;width:${r0(cw)}px;--drop:${r0(-(gy - ch) - ch - 40)}px`);
    const uw = Math.min(W * 0.7, 300), ub = H * 0.04 + uw * 0.4, bx = G.px + cx, by = G.py + gy;
    scene(K, 'ufo', starsHtml(40, 0, 1200, 90) + el('beam', '', `left:${r0(bx - cw)}px;top:${r0(ub)}px;width:${r0(cw * 2)}px;height:${r0(Math.max(60, by - ub))}px`) +
      el('ufobody', UFO, `left:${r0(bx - uw / 2)}px;top:4vh;width:${r0(uw)}px`));
    fword(K, 'ピロピロ…', W * 0.06, H * 0.02 + uw * 0.42, ms * 0.08, '#8fe8c8', 24, -6);
    fword(K, 'おかえし!', W * 0.06, H * 0.3, ms * 0.34, '#ffd94a', 30, -6);
    K.word('モ〜', cx - cw * 0.2, gy - ch - 40, ms * 0.56, '#fff', 30, 8);
    K.puffs(cx, gy, 5, ms * 0.55, cw * 0.4);
  });

  // ---------------- 17. 魚の神さま ----------------
  const FISHGOD = `<svg viewBox="0 0 300 160" class="mvx-c-nss"><path d="M246 70 L292 30 Q300 80 292 130 L246 90 Z" fill="#ff9fbb" ${L(4)}/><path d="M80 34 L96 6 L112 28 L128 2 L146 26 L164 4 L180 28 L198 14 L208 40 Z" fill="#ff9fbb" ${L(3.5)}/><path d="M20 80 Q60 20 160 24 Q220 28 252 76 Q220 134 160 136 Q60 140 20 80 Z" fill="#ff6b6b" ${L(4)}/><path d="M40 94 Q100 130 200 112 Q140 130 80 122 Q52 112 40 94 Z" fill="#ffd0c8"/>${[[96, 50], [124, 46], [152, 46], [180, 50], [110, 70], [138, 68], [166, 70], [194, 74], [124, 92], [152, 92], [180, 94]].map(([x, y]) => `<path d="M${x} ${y} q8 -10 16 0" fill="none" stroke="#ffd0c8" stroke-width="3" stroke-linecap="round"/>`).join('')}<path d="M118 94 Q140 124 108 130 Q104 108 118 94 Z" fill="#ff9fbb" ${L(3)}/><circle cx="52" cy="66" r="12" fill="#fffdf8" ${L(3.5)}/><circle cx="50" cy="67" r="6" fill="${INK}"/><circle cx="53" cy="63" r="2" fill="#fff"/><path d="M24 90 Q34 98 46 92" fill="none" ${L(3)}/><path d="M48 30 L52 8 L62 20 L70 2 L78 20 L88 8 L92 30 Z" fill="#ffd94a" ${L(3)}/></svg>`;
  const SWIRL = `<svg viewBox="0 0 120 60"><path d="M10 50 Q4 30 22 26 Q24 8 46 12 Q60 0 78 12 Q100 8 104 26 Q120 30 112 50 Z" fill="#fff6e8" ${L(3)}/><path d="M40 40 q-8 -12 4 -16 q10 0 6 10 q-4 4 -8 0 M78 40 q-8 -12 4 -16 q10 0 6 10" fill="none" ${L(2.5)}/></svg>`;
  def('fishgod', 'bow', 4400, (K, G, ms, W, H) => {
    K.back('#ffe9a8', 0.85);
    let clouds = '';
    [[-12, 30, 44], [62, 28, 46], [20, 36, 40]].forEach(([x, y, w], i) => { clouds += el('swirl', SWIRL, `left:${x}vw;top:${y}vh;width:${w}vw;${dl(ms * (0.1 + i * 0.06))}`); });
    let sp = '';
    for (let i = 0; i < 18; i++) sp += el('spark', pick(['✦', '✧', '★']), `left:${r0(rnd(4, 92))}vw;top:${r0(rnd(4, 70))}vh;font-size:${r0(rnd(14, 30))}px;color:${pick(['#ffd94a', '#fff', '#ff9fbb'])};${dl(ms * rnd(0.25, 0.85))}`);
    scene(K, 'fgod', el('fglight') + el('fgrays') + el('fgring') + el('fgfish', FISHGOD) + clouds + sp);
    K.rain(12, () => `<svg viewBox="0 0 40 20"><path d="M4 10 Q14 0 28 6 L38 0 L36 10 L38 20 L28 14 Q14 20 4 10 Z" fill="${pick(['#ff9fbb', '#8fd0ff', '#ffd94a'])}" ${L(2.5)}/><circle cx="12" cy="9" r="1.8" fill="${INK}"/></svg>`, { delay0: ms * 0.45, delayMax: ms * 0.3, dur: [1000, 1500], size: [26, 40] });
    fword(K, 'ははーっ', W * 0.06, H * 0.5, ms * 0.32, '#fff', 30, -6);
    fword(K, 'ありがたや〜', W * 0.36, H * 0.62, ms * 0.58, '#ffd94a', 30, 6);
  });

  // ---------------- 18. ねこ雲 ----------------
  const CC = [
    `<svg viewBox="0 0 160 130" class="mvx-c-nss"><path d="M20 70 Q6 52 24 40 L30 6 L58 30 Q80 22 102 30 L130 6 L136 40 Q154 52 140 70 Q158 88 138 102 Q132 124 104 118 Q90 130 76 120 Q58 130 46 118 Q22 122 22 102 Q2 90 20 70 Z" fill="#fff" ${L(3.5)}/><path d="M36 106 Q80 124 124 106" fill="none" stroke="#d6ebff" stroke-width="7" stroke-linecap="round"/><circle cx="60" cy="68" r="5" fill="#9ab8d8"/><circle cx="100" cy="68" r="5" fill="#9ab8d8"/><path d="M70 84 Q75 90 80 84 Q85 90 90 84" fill="none" stroke="#9ab8d8" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 230 120" class="mvx-c-nss"><path d="M22 70 Q-4 62 6 36 Q12 24 24 30" fill="none" ${L(9)}/><path d="M22 70 Q-4 62 6 36 Q12 24 24 30" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M20 96 Q6 86 16 70 Q10 52 30 48 Q36 30 60 36 Q74 22 96 32 Q116 20 136 32 L148 6 L164 26 L178 24 L194 4 L200 36 Q220 48 212 70 Q224 86 206 98 Q198 112 178 108 Q160 116 140 108 Q120 116 100 108 Q80 116 62 108 Q40 114 30 104 Q14 104 20 96 Z" fill="#fff" ${L(3.5)}/><path d="M40 100 Q120 116 200 98" fill="none" stroke="#d6ebff" stroke-width="7" stroke-linecap="round"/><path d="M164 60 Q168 56 172 60 M186 60 Q190 56 194 60" fill="none" stroke="#9ab8d8" stroke-width="3" stroke-linecap="round"/></svg>`,
  ];
  def('cloudcat', 'gaze', 4400, (K, G, ms, W, H) => {
    K.back('#bfe6ff', 0.85);
    const list = [[0, 4, 70, 5.2, 0.1], [1, 18, 90, 6.4, 0.55], [0, 34, 50, 4.6, 0.8], [1, 50, 76, 5.8, 0.3], [0, 64, 62, 4.8, 0.62], [1, 78, 84, 6.8, 0.05], [0, 10, 40, 4, 0.4], [1, 42, 56, 5, 0.9], [0, 86, 48, 4.4, 0.72]];
    const clouds = list.map(([k, y, w, d, ph], i) => el('ccat', CC[k], `top:${y}vh;width:${w}vw;animation-duration:${d}s;animation-delay:${S(-d * 1000 * ph)};${i % 3 === 2 ? 'opacity:.85;' : ''}${i % 2 ? '--fl:-1;' : ''}`)).join('');
    scene(K, 'clouds', el('csky') + clouds);
    fword(K, 'ねこ…?', W * 0.08, H * 0.3, ms * 0.2, '#fff', 30, -6);
    fword(K, 'ぜんぶ ねこ!', W * 0.32, H * 0.58, ms * 0.56, '#ffd94a', 34, 6);
  });

  // ---------------- 19. 茶室 ----------------
  def('teaceremony', 'sadou', 4600, (K, G, ms, W, H) => {
    const bowl = `<svg viewBox="0 0 300 170" class="mvx-c-nss"><path d="M10 40 Q18 150 150 162 Q282 150 290 40 Z" fill="#6b4a3a" ${L(4.5)}/><path d="M40 60 Q44 90 52 100 M90 70 Q92 110 100 126 M200 70 Q204 108 196 126 M250 60 Q252 86 246 100" fill="none" stroke="#a07a5a" stroke-width="6" stroke-linecap="round"/><path d="M110 160 L116 168 H184 L190 160" fill="#5a3d2f" ${L(3.5)}/><ellipse cx="150" cy="40" rx="140" ry="26" fill="#5a3d2f" ${L(4.5)}/><ellipse cx="150" cy="44" rx="124" ry="19" fill="#7fae3a" ${L(3)}/><ellipse class="mvx-c-foam" cx="150" cy="44" rx="104" ry="14" fill="#b9dc7a"/></svg>`;
    const whisk = `<svg viewBox="0 0 100 200" class="mvx-c-nss"><rect x="38" y="0" width="24" height="96" rx="6" fill="#f1e3b5" ${L(3.5)}/><path d="M38 30 H62 M38 64 H62" ${L(2.5)}/>${Array.from({ length: 11 }, (_, i) => { const t = (i - 5) / 5; return `<path d="M${50 + t * 10} 94 Q${50 + t * 30} 140 ${50 + t * 46} 192" fill="none" stroke="#e6d39a" stroke-width="5" stroke-linecap="round"/><path d="M${50 + t * 10} 94 Q${50 + t * 30} 140 ${50 + t * 46} 192" fill="none" ${L(1.5)}/>`; }).join('')}<ellipse cx="50" cy="150" rx="18" ry="6" fill="none" ${L(2.5)}/></svg>`;
    let bubs = '';
    for (let i = 0; i < 16; i++) bubs += el('bub', '', `left:${r0(rnd(26, 72))}vw;width:${r0(rnd(10, 22))}px;${dl(ms * rnd(0.22, 0.8))}`);
    const vase = `<svg viewBox="0 0 60 80"><path d="M30 40 Q20 20 10 14 M30 40 Q34 18 46 8 M30 40 V20" fill="none" stroke="#4fb38a" stroke-width="3"/><circle cx="10" cy="12" r="6" fill="#ff9fbb" ${L(2.5)}/><circle cx="46" cy="8" r="6" fill="#ffd94a" ${L(2.5)}/><circle cx="30" cy="18" r="5" fill="#fffdf8" ${L(2.5)}/><path d="M18 42 H42 L38 78 H22 Z" fill="#5b86d8" ${L(3)}/></svg>`;
    scene(K, 'chashitsu', el('shoji') + el('toko', el('scroll', '一服') + el('vase', vase)) + el('tatami') + el('tcat', catNow()) + el('bowl', bowl) + el('chasen', whisk) + bubs);
    fword(K, 'シャカシャカ', W * 0.06, H * 0.5, ms * 0.24, '#8fe8c8', 30, -8);
    fword(K, 'シャカシャカ', W * 0.46, H * 0.4, ms * 0.42, '#ffd94a', 30, 6);
    fword(K, 'シャカシャカシャカ', W * 0.08, H * 0.62, ms * 0.58, '#fff', 28, -4);
    fword(K, 'ほっ…', W * 0.58, H * 0.3, ms * 0.8, '#ff9fbb', 28, 6);
  });

  // ---------------- 20. 折り紙の世界 ----------------
  const CRANE = (c1, c2) => `<svg viewBox="0 0 100 70"><path d="M34 44 L4 20 L22 46 Z" fill="${c2}" ${L(2.5)}/><path d="M56 42 L86 14 L78 32 Z" fill="${c1}" ${L(2.5)}/><path d="M86 14 L98 20 L84 22 Z" fill="${c2}" ${L(2.5)}/><path d="M28 46 L50 34 L72 46 L50 56 Z" fill="${c1}" ${L(2.5)}/><g class="mvx-c-cwing"><path d="M40 42 L52 2 L64 42 Z" fill="${c2}" ${L(2.5)}/><path d="M52 2 L52 42" ${L(1.5)}/></g></svg>`;
  def('origamiworld', 'origami', 4600, (K, G, ms, W, H) => {
    const pal = [['#ffd6e4', '#ffb3cc'], ['#fff1b8', '#ffe07a'], ['#d4f5e6', '#a8e8cc'], ['#d6ecff', '#aed6ff'], ['#ead9ff', '#d4b8ff']];
    let tiles = '';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const p = pal[(r * 3 + c * 2) % 5]; tiles += el('ori', '', `left:${c * 25}vw;top:${r * 12.5}vh;background:linear-gradient(${pick([45, 135, 225, 315])}deg, ${p[0]} 50%, ${p[1]} 50%);${dl(ms * 0.03 + (r + c) * 45)}`); }
    const mts = `<svg viewBox="0 0 400 160" preserveAspectRatio="none" class="mvx-c-nss"><path d="M-20 160 L80 30 L180 160 Z" fill="#a8e8cc" ${L(3)}/><path d="M80 30 L180 160 L80 160 Z" fill="#7fd6a8" ${L(3)}/><path d="M240 160 L330 20 L430 160 Z" fill="#aed6ff" ${L(3)}/><path d="M330 20 L430 160 L330 160 Z" fill="#8fbff0" ${L(3)}/><path d="M120 160 L210 60 L300 160 Z" fill="#ffd6e4" ${L(3)}/><path d="M210 60 L300 160 L210 160 Z" fill="#ffb3cc" ${L(3)}/></svg>`;
    let cranes = '';
    for (let i = 0; i < 14; i++) { const p = pal[i % 5], row = i % 4, col = Math.floor(i / 4); cranes += el('crane', CRANE(p[0], p[1]), `left:${-24 - col * 14 + row * 4}vw;top:${74 + row * 7 - col * 3}vh;width:${r0(rnd(16, 24))}vw;${dl(ms * (0.3 + col * 0.06 + row * 0.02))}`); }
    scene(K, 'origami', tiles + el('osun') + el('omts', mts) + el('ocat', catNow()) + cranes);
    fword(K, 'おりおり…', W * 0.06, H * 0.08, ms * 0.12, '#ff9fbb', 30, -6);
    fword(K, 'つるだ!', W * 0.52, H * 0.12, ms * 0.5, '#ffd94a', 36, 8);
  });

  // ---------------- 21. 町じゅうのドミノ ----------------
  const PIX = ['.k.........k.', '.kk.......kk.', '.kpk.....kpk.', '.kwpkkkkkpwk.', 'kwwwwwawwwwwk', 'kwwwwwwwwwwwk', 'kwgbgwwwgbgwk', 'kwgbgwwwgbgwk', 'kwwwwwpwwwwwk', '.kwwwkwkwwwk.', '..kkkkkkkkk..'];
  const PIXC = { k: INK, w: '#fffdf8', g: '#c3cbe6', b: '#6f95d8', p: '#ff9fbb', a: '#f2b98a' };
  def('domino2', 'clap', 4800, (K, G, ms, W, H) => {
    const ts = Math.floor(Math.min(W * 0.9 / 13, H * 0.36 / 11)), gx = (W - ts * 13) / 2, gy = H * 0.05;
    let tiles = '';
    PIX.forEach((row, r) => row.split('').forEach((ch, c) => {
      const col = PIXC[ch] || ((r + c) % 2 ? '#fff1c9' : '#ffe3ec');
      tiles += el('tile', '', `left:${r0(gx + c * ts)}px;top:${r0(gy + r * ts)}px;width:${ts}px;height:${ts}px;background:${col};${dl(ms * (0.56 + (r + c) * 0.009))}`);
    }));
    let doms = '';
    const n = 12;
    [58, 70, 82].forEach((y, row) => {
      for (let i = 0; i < n; i++) {
        const ltr = row % 2 === 0, k = ltr ? i : n - 1 - i;
        doms += el('dom' + (ltr ? '' : ' domr'), '', `left:${r1(5 + i * 7.6)}vw;top:${y}vh;background-color:${POP[(i + row) % 6]};${dl(ms * (0.08 + row * 0.16 + k * 0.013))}`);
      }
    });
    const town = `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 100 V60 H30 V40 L45 28 L60 40 V60 H80 V30 H110 V60 H130 V46 L150 30 L170 46 V60 H200 V24 H226 V60 H250 V44 L268 32 L286 44 V60 H310 V36 H340 V60 H360 V48 L380 36 L400 48 V100 Z" fill="#c9d6f0" ${L(3)}/><path d="M88 40 h6 v6 h-6 Z M98 40 h6 v6 h-6 Z M206 32 h6 v6 h-6 Z M206 44 h6 v6 h-6 Z M318 44 h6 v6 h-6 Z" fill="#fff6c2" ${L(1.5)}/></svg>`;
    scene(K, 'domino', el('dsky2') + el('dtown', town) + el('dground') + tiles + doms);
    fword(K, 'カタカタカタ…', W * 0.06, H * 0.48, ms * 0.12, '#ffa95e', 26, -6);
    fword(K, 'カタタタタ', W * 0.4, H * 0.62, ms * 0.34, '#8fd0ff', 26, 6);
    fword(K, 'かんせい!', W * 0.26, H * 0.44, ms * 0.76, '#ffd94a', 38, -6);
  });

  // ---------------- 22. 巨大な毛糸玉 ----------------
  const YARN = (c) => `<svg viewBox="0 0 100 100" class="mvx-c-nss"><circle cx="50" cy="50" r="46" fill="${c}" ${L(4)}/><path d="M12 36 Q50 20 88 40 M8 54 Q50 34 92 58 M14 72 Q50 52 86 76 M30 12 Q20 50 36 90 M54 6 Q40 50 58 94 M74 14 Q62 52 78 86" fill="none" ${L(2.5)} opacity=".5"/><path d="M24 30 Q34 22 44 22" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`;
  def('giantyarn', 'yarn', 4400, (K, G, ms, W, H) => {
    K.back('#ffe3ec', 0.8);
    const cols = ['#ff9fbb', '#ffd94a', '#8fe8c8', '#8fd0ff', '#c9a7ff', '#ffa95e'];
    let paths = '';
    const by = H * 0.42;
    let d0 = `M${-40} ${r0(by)}`;
    for (let i = 1; i <= 6; i++) d0 += ` Q${r0((i - 0.5) * W / 5)} ${r0(by + (i % 2 ? -60 : 60))} ${r0(i * W / 5)} ${r0(by)}`;
    paths += `<path d="${d0}" class="mvx-c-ystr" pathLength="1" fill="none" ${L(11)} style="animation-duration:${S(ms * 0.44)};${dl(ms * 0.05)}"/><path d="${d0}" class="mvx-c-ystr" pathLength="1" fill="none" stroke="#ff9fbb" stroke-width="6" stroke-linecap="round" style="animation-duration:${S(ms * 0.44)};${dl(ms * 0.05)}"/>`;
    for (let k = 0; k < 9; k++) {
      let x = rnd(-0.2, 1.2) * W, y = rnd(-0.1, 1.1) * H, d = `M${r0(x)} ${r0(y)}`;
      for (let j = 0; j < 4; j++) { const nx = rnd(-0.1, 1.1) * W, ny = rnd(0, 1) * H; d += ` Q${r0(rnd(-0.1, 1.1) * W)} ${r0(rnd(0, 1) * H)} ${r0(nx)} ${r0(ny)}`; }
      const c = cols[k % 6], st = `animation-duration:${S(rnd(900, 1300))};${dl(ms * (0.3 + k * 0.04))}`;
      paths += `<path d="${d}" class="mvx-c-ystr" pathLength="1" fill="none" ${L(10)} style="${st}"/><path d="${d}" class="mvx-c-ystr" pathLength="1" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" style="${st}"/>`;
    }
    const smalls = [[12, '#8fd0ff', 30, 0.36], [70, '#ffd94a', 26, 0.5], [22, '#c9a7ff', 34, 0.62]].map(([y, c, w, d]) => el('yball ysmall', YARN(c), `top:${y}vh;width:${w}vw;${dl(ms * d)}`)).join('');
    scene(K, 'yarn', `<svg class="mvx-c-ysvg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${paths}</svg>` + el('yball ybig', YARN('#ff9fbb'), `top:calc(42vh - 45vw);${dl(ms * 0.04)}`) + smalls);
    fword(K, 'ゴロゴロゴロ', W * 0.06, H * 0.16, ms * 0.1, '#ff9fbb', 30, -6);
    fword(K, 'からまった〜', W * 0.3, H * 0.7, ms * 0.66, '#c9a7ff', 32, 6);
  });

  // ---------------- 23. 段ボールの城 ----------------
  const ROOF = `<svg viewBox="0 0 200 40" preserveAspectRatio="none"><path d="M2 38 Q22 32 32 12 L168 12 Q178 32 198 38 Z" fill="#c99a5c" ${L(3)} vector-effect="non-scaling-stroke"/><path d="M40 20 H160 M32 28 H168" stroke="#a8783e" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  const SHACHI = `<svg viewBox="0 0 40 50"><path d="M20 48 Q8 40 10 26 Q12 12 22 6 Q20 18 28 22 Q34 30 30 40 Q26 48 20 48 Z" fill="#ffd94a" ${L(3)}/><path d="M22 6 Q30 0 36 4 Q32 8 28 14" fill="#ffd94a" ${L(2.5)}/><circle cx="16" cy="34" r="2.4" fill="${INK}"/></svg>`;
  def('catcastle', 'boxpeek', 4800, (K, G, ms, W, H) => {
    const box = (n) => Array.from({ length: n }, () => '<span></span>').join('');
    const parts = [
      el('cbrow', box(4), `left:4vw;width:92vw;bottom:12vh;${dl(ms * 0.06)}`),
      el('cbrow', box(3), `left:10vw;width:80vw;bottom:19vh;${dl(ms * 0.14)}`),
      el('cbrow', box(3), `left:16vw;width:68vw;bottom:26vh;${dl(ms * 0.22)}`),
      el('ctier', '<span></span><span></span><span></span>', `left:20vw;width:60vw;bottom:33vh;height:9vh;${dl(ms * 0.3)}`),
      el('croof', ROOF, `left:10vw;width:80vw;bottom:41vh;${dl(ms * 0.36)}`),
      el('ctier', '<span></span><span></span>', `left:28vw;width:44vw;bottom:46vh;height:8vh;${dl(ms * 0.42)}`),
      el('croof', ROOF, `left:18vw;width:64vw;bottom:53vh;${dl(ms * 0.48)}`),
      el('castcat', catNow(), `left:25vw;width:50vw;bottom:56vh;${dl(ms * 0.56)}`),
      el('shachi', SHACHI, `left:20vw;bottom:58vh;${dl(ms * 0.64)}`),
      el('shachi', SHACHI, `right:20vw;bottom:58vh;--sx:-1;${dl(ms * 0.66)}`),
    ].join('');
    let clouds = '';
    for (let i = 0; i < 3; i++) clouds += el('ccloud', CLOUD(), `left:${[-6, 60, 30][i]}vw;top:${[6, 12, 22][i]}vh;width:${[36, 34, 26][i]}vw;${dl(-i * 900)}`);
    scene(K, 'castle', el('csky2') + clouds + el('cground') + parts);
    fword(K, 'ドスン!', W * 0.06, H * 0.6, ms * 0.08, '#ffa95e', 30, -8);
    fword(K, 'ドスン!', W * 0.62, H * 0.5, ms * 0.3, '#ffa95e', 30, 8);
    fword(K, 'てんしゅかく!', W * 0.14, H * 0.06, ms * 0.66, '#ffd94a', 34, -4);
  });

  // ---------------- 24. 浮き島 ----------------
  const ISLAND = `<svg viewBox="0 0 300 260" class="mvx-c-nss"><path d="M10 80 Q40 70 150 72 Q260 70 290 80 L240 150 L200 200 L160 252 L130 210 L100 180 L60 140 Z" fill="#c27f4a" ${L(4)}/><path d="M60 140 L120 120 L100 180 M120 120 L160 252 M200 200 L170 120 L240 150 M170 120 L120 120" fill="none" stroke="#a86a3c" stroke-width="3"/><path d="M100 180 Q94 210 104 232 M200 200 Q208 222 198 244 M76 160 Q70 180 78 196" fill="none" stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"/><path d="M4 82 Q10 56 40 60 Q70 44 110 52 Q150 40 190 50 Q240 42 270 58 Q300 64 296 84 Q150 96 4 82 Z" fill="#8fe8c8" ${L(4)}/><path d="M30 76 l4 -8 l4 8 M150 80 l4 -8 l4 8 M250 74 l4 -8 l4 8" fill="none" stroke="#4fb38a" stroke-width="3"/><path d="M52 62 V30" ${L(7)}/><path d="M52 62 V30" stroke="#a8683a" stroke-width="4"/><circle cx="52" cy="22" r="22" fill="#4fb38a" ${L(3.5)}/><circle cx="44" cy="16" r="4" fill="#ff9fbb"/><circle cx="60" cy="26" r="4" fill="#ff9fbb"/><path d="M232 60 V28 M262 60 V28" ${L(6)}/><path d="M232 60 V28 M262 60 V28" stroke="#ff6b6b" stroke-width="3"/><path d="M224 26 H270 M228 36 H266" ${L(6)}/><path d="M224 26 H270 M228 36 H266" stroke="#ff6b6b" stroke-width="3"/></svg>`;
  def('floatingisland', 'float', 4800, (K, G, ms, W, H) => {
    let clouds = '';
    for (let i = 0; i < 7; i++) clouds += el('cdown', CLOUD(), `left:${r0(rnd(-10, 80))}vw;width:${r0(rnd(26, 46))}vw;animation-duration:${S(rnd(1800, 2600))};${dl(-rnd(0, 2400))}`);
    let pebs = '';
    for (let i = 0; i < 10; i++) pebs += el('peb', '', `left:${r0(rnd(30, 66))}%;width:${r0(rnd(8, 16))}px;${dl(ms * rnd(0.1, 0.42))}`);
    let birds = '';
    for (let i = 0; i < 4; i++) birds += el('bird', BIRD, `top:${r0(10 + i * 5)}vh;width:${r0(rnd(6, 9))}vw;${dl(ms * (0.55 + i * 0.06))}`);
    scene(K, 'isle', el('isky') + clouds + el('iground') + el('island', el('fall', '', 'left:4%') + el('fall', '', 'left:89%') + ISLAND + el('icat', catNow()) + pebs) + birds);
    fword(K, 'ゴゴゴ…', W * 0.06, H * 0.12, ms * 0.06, '#fff', 28, -6);
    fword(K, 'うかんだ!', W * 0.42, H * 0.08, ms * 0.48, '#ffd94a', 36, 6);
  });

  // ---------------- 25. 万華鏡 ----------------
  def('kaleidocat', 'kira', 4200, (K, G, ms, W, H) => {
    const R = Math.ceil(Math.hypot(W, H) / 2) + 12;
    const bits = [['#ff9fbb', 50, 40, 7, '50%'], ['#ffd94a', 46, 33, 4, '0'], ['#8fe8c8', 54, 33, 4, '0'], ['#8fd0ff', 50, 6, 6, '50%'], ['#c9a7ff', 50, 46, 3, '50%']].map(([c, x, y, s, br]) => el('kbit', '', `left:${x - s / 2}%;top:${y - s / 2}%;width:${s}%;height:${s}%;background:${c};border-radius:${br}`)).join('');
    const content = el('kin', catNow() + bits);
    let wedges = '';
    for (let i = 0; i < 12; i++) wedges += el('wedge', content, `transform:rotate(${i * 30}deg)${i % 2 ? ' scaleX(-1)' : ''}`);
    scene(K, 'kaleido', el('kbg') + el('kal', wedges, `width:${2 * R}px;height:${2 * R}px;margin:${-R}px 0 0 ${-R}px`) + el('kvig'));
    fword(K, 'くるくる〜', W * 0.06, H * 0.12, ms * 0.2, '#fff', 30, -6);
    fword(K, 'きらきら!', W * 0.5, H * 0.8, ms * 0.6, '#ffd94a', 32, 6);
  });

  // ---------------- 26. 戴冠式 ----------------
  const CROWN = `<svg viewBox="0 0 52 36"><path d="M4 32 L2 8 L14 18 L26 2 L38 18 L50 8 L48 32 Z" fill="#ffd94a" ${L(3)}/><path d="M4 26 H48" ${L(2.5)}/><circle cx="26" cy="22" r="3.5" fill="#ff6b6b" ${L(2)}/><circle cx="13" cy="24" r="2.5" fill="#8fd0ff" ${L(1.5)}/><circle cx="39" cy="24" r="2.5" fill="#8fe8c8" ${L(1.5)}/><circle cx="2" cy="7" r="2.5" fill="#fff" ${L(1.5)}/><circle cx="26" cy="2" r="2.5" fill="#fff" ${L(1.5)}/><circle cx="50" cy="7" r="2.5" fill="#fff" ${L(1.5)}/></svg>`;
  const THRONE = `<svg viewBox="0 0 160 200" class="mvx-c-nss"><path d="M20 196 V70 Q20 10 80 6 Q140 10 140 70 V196 Z" fill="#ffd94a" ${L(4)}/><path d="M34 190 V76 Q34 26 80 22 Q126 26 126 76 V190 Z" fill="#c9334a" ${L(3)}/><path d="M56 60 L62 40 L72 52 L80 34 L88 52 L98 40 L104 60 Z" fill="#ffd94a" ${L(2.5)}/><circle cx="20" cy="70" r="8" fill="#ffd94a" ${L(3)}/><circle cx="140" cy="70" r="8" fill="#ffd94a" ${L(3)}/><circle cx="80" cy="6" r="7" fill="#ff9fbb" ${L(3)}/></svg>`;
  def('coronation', 'tallsit', 4600, (K, G, ms, W, H) => {
    K.back('#c9a7ff', 0.75);
    A(K, 'glory', '', `left:${r0(G.cx - 150)}px;top:${r0(G.y + G.h * 0.3 - 150)}px`);
    A(K, 'throne', THRONE, `left:${r0(G.cx - G.w * 0.42)}px;width:${r0(G.w * 0.84)}px;top:${r0(G.y + G.h * 0.02)}px`);
    A(K, 'carpet', `<svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M30 0 H70 L100 40 H0 Z" fill="#c9334a"/><path d="M30 0 L0 40 M70 0 L100 40" stroke="#ffd94a" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`, `left:${r0(G.cx - G.sw * 0.5)}px;width:${r0(G.sw)}px;top:${r0(G.y + G.h * 0.86)}px;bottom:0`);
    A(K, 'curt', '', 'left:0');
    A(K, 'curt curtr', '', 'right:0');
    B(K, 'crown', CROWN, `left:${r1((121 - 26) / 2.4)}%;width:${r1(52 / 2.4)}%;top:5%`);
    K.burst(G.cx, G.y + G.h * 0.12, ms * 0.5, 16, 80, ['#ffd94a', '#fff', '#ff9fbb']);
    let conf = '';
    for (let i = 0; i < 46; i++) conf += el('conf', '', `left:${r0(rnd(0, 98))}vw;background:${pick(POP.slice(0, 7))};--rot:${r0(rnd(-720, 720))}deg;--sw:${r0(rnd(-14, 14))}vw;animation-duration:${S(rnd(1300, 2000))};${dl(ms * rnd(0.5, 0.72))}`);
    const tr = `<svg viewBox="0 0 120 50"><path d="M4 18 L70 22 L70 28 L4 32 Z" fill="#ffd94a" ${L(3)}/><path d="M70 22 Q96 8 116 2 L116 48 Q96 42 70 28 Z" fill="#ffd94a" ${L(3)}/><path d="M28 32 L30 46 L50 46 L52 30" fill="#ff6b6b" ${L(2.5)}/></svg>`;
    let banners = '';
    for (let i = 0; i < 4; i++) banners += el('ban', `<svg viewBox="0 0 40 70"><path d="M2 0 H38 V56 L20 68 L2 56 Z" fill="${['#ff6b6b', '#8fd0ff', '#ff6b6b', '#8fd0ff'][i]}" ${L(3)}/><path d="M10 34 L10 20 L16 26 L20 16 L24 26 L30 20 L30 34 Z" fill="#ffd94a" ${L(2)}/></svg>`, `left:${6 + i * 25}vw;${dl(ms * (0.04 + i * 0.04))}`);
    scene(K, 'royal', banners + el('trump', tr, 'left:-4vw') + el('trump trr', tr, 'right:-4vw') + conf);
    fword(K, 'パッパラパー!', W * 0.08, H * 0.13, ms * 0.08, '#ffd94a', 30, -6);
    fword(K, '戴冠!!', W * 0.56, G.py + G.y + G.h * 0.1, ms * 0.5, '#ff9fbb', 38, 8);
    fword(K, 'ばんざーい', W * 0.12, H * 0.82, ms * 0.7, '#fff', 30, -4);
  });

  // ---------------- 27. 無限てんぷる ----------------
  def('infinitecat', 'stare', 4400, (K, G, ms, W, H) => {
    const k = 0.55, th = 8, ox = r0(W / 2), oy = r0(H * 0.4);
    let layers = '';
    for (let i = 0; i < 11; i++) layers += el('ilayer', el('iframe', '', i % 2 ? 'background:#d6ecff;border-color:#8fd0ff' : 'background:#fff1c9;border-color:#ff9fbb') + el('icat2', catNow()), `transform-origin:${ox}px ${oy}px;transform:rotate(${i * th}deg) scale(${Math.pow(k, i).toFixed(5)})`);
    scene(K, 'infin', el('izoom', layers, `transform-origin:${ox}px ${oy}px`));
    fword(K, 'どこまでも…', W * 0.06, H * 0.06, ms * 0.26, '#c9a7ff', 28, -6);
    fword(K, '∞', W * 0.62, H * 0.04, ms * 0.56, '#ffd94a', 56, 8);
  });

  // ---------------- 28. 鏡の部屋 ----------------
  def('mirrorroom', 'peace', 4400, (K, G, ms, W, H) => {
    const vx = W / 2, vy = H * 0.44;
    let copies = '';
    for (let d = 4; d >= 0; d--) {
      const s = Math.pow(0.62, d), fy = vy + (H * 0.97 - vy) * s, cw = W * 0.5 * s, sp = W * 0.54 * s, m = Math.min(3, d + 1);
      for (let j = -m; j <= m; j++) {
        const x = vx + j * sp;
        if (x < -cw || x > W + cw) continue;
        copies += el('mcopy' + ((j + d) % 2 ? ' mflip' : ''), catNow(), `left:${r0(x - cw / 2)}px;top:${r0(fy - cw * 0.8)}px;width:${r0(cw)}px;${dl(ms * (0.04 + (4 - d) * 0.05) + Math.abs(j) * 60)}`);
      }
    }
    let lines = '';
    for (let i = -6; i <= 6; i++) lines += `<path d="M${r0(vx)} ${r0(vy)} L${r0(vx + i * W * 0.3)} ${H}" stroke="#a9a3c8" stroke-width="2"/><path d="M${r0(vx)} ${r0(vy)} L${r0(vx + i * W * 0.3)} 0" stroke="#d9d4ee" stroke-width="2"/>`;
    scene(K, 'mirror', el('mrbg') + `<svg class="mvx-c-mrlines" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${lines}</svg>` + el('mrfloor') + copies + el('glint') + el('glint', '', 'animation-delay:1.4s'));
    fword(K, 'いっぱい!?', W * 0.08, H * 0.1, ms * 0.3, '#c9a7ff', 32, -6);
    fword(K, 'どれが ほんもの?', W * 0.2, H * 0.22, ms * 0.62, '#ff9fbb', 28, 4);
  });

  // ---------------- 29. からくり ----------------
  const GEAR = (n, c) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n, s = (Math.PI * 2) / n;
      [[40, a], [48, a + s * 0.12], [48, a + s * 0.42], [40, a + s * 0.54]].forEach(([r, t], j) => { d += `${i || j ? 'L' : 'M'}${r1(r * Math.cos(t))} ${r1(r * Math.sin(t))} `; });
    }
    return `<svg viewBox="-50 -50 100 100" class="mvx-c-nss"><path d="${d}Z" fill="${c}" ${L(3.5)}/><circle r="28" fill="none" ${L(2.5)} opacity=".5"/><g fill="#f3e3c3" ${L(2.5)}><circle cx="0" cy="-17" r="6"/><circle cx="17" cy="0" r="6"/><circle cx="0" cy="17" r="6"/><circle cx="-17" cy="0" r="6"/></g><circle r="7" fill="${INK}"/></svg>`;
  };
  const KEY = `<svg viewBox="0 0 60 40"><path d="M2 20 H30" ${L(6)}/><path d="M2 20 H30" stroke="#ffd94a" stroke-width="3"/><path d="M30 20 Q34 2 46 4 Q58 8 50 20 Q58 32 46 36 Q34 38 30 20 Z" fill="#ffd94a" ${L(3)}/></svg>`;
  def('clockwork', 'upright', 4400, (K, G, ms, W, H) => {
    const cols = ['#e8b83d', '#e08a4a', '#c9c9d6', '#d6a64a'];
    const gs = [[-24, -6, 72, 16, 0, 1, 9], [58, 2, 56, 12, 1, -1, 7], [76, 30, 44, 10, 2, 1, 5], [-18, 38, 50, 12, 1, -1, 7], [16, 66, 66, 14, 0, 1, 8], [68, 68, 52, 12, 2, -1, 6], [38, 18, 28, 8, 3, -1, 3.5], [8, 28, 22, 8, 2, 1, 3], [56, 52, 26, 8, 3, 1, 3.2], [-6, 82, 30, 9, 2, -1, 4]];
    const gears = gs.map(([x, y, w, n, c, dir, dur], i) => el('gearw', GEAR(n, cols[c]), `left:${x}vw;top:${y}vh;width:${w}vw;${dl(ms * 0.02 + i * 70)}`).replace('<svg ', `<svg style="animation-duration:${dur}s${dir < 0 ? ';animation-direction:reverse' : ''}" `)).join('');
    scene(K, 'clock', el('cwbg') + gears + el('kara', catNow() + el('key', KEY)));
    fword(K, 'カチ コチ', W * 0.06, H * 0.08, ms * 0.1, '#ffd94a', 30, -6);
    fword(K, 'ギギギ…', W * 0.56, H * 0.3, ms * 0.36, '#e08a4a', 30, 8);
    fword(K, 'ガッシャン!', W * 0.14, H * 0.78, ms * 0.62, '#fff', 34, -4);
  });

  // ---------------- 30. 自由の女神 ----------------
  def('statueliberty', 'wave', 4600, (K, G, ms, W, H) => {
    let rays = '';
    for (let k = 0; k < 7; k++) {
      const a = (-160 + k * 23.3) * Math.PI / 180, p = (r, t) => `${r1(121 + r * Math.cos(a + t))} ${r1(70 + r * Math.sin(a + t))}`;
      rays += `<path d="M${p(36, -0.12)} L${p(78, 0)} L${p(36, 0.12)} Z" fill="#8fd6be" ${L(3)}/>`;
    }
    const statue = `<svg viewBox="0 -80 240 280" class="mvx-c-nss">${rays}<g class="cat mvx-cat" style="--tint:#8fd6be">${poseSvg('wave')}</g>` +
      `<path d="M58 118 L88 112 L94 162 L64 168 Z" fill="#8fd6be" ${L(3)}/><path d="M66 128 L86 124 M68 140 L88 136 M70 152 L90 148" ${L(2)} opacity=".6"/>` +
      `<circle class="mvx-c-torchglow" cx="192" cy="-54" r="30" fill="#fff6c2" opacity=".7"/><path d="M172 84 Q176 20 190 -36" fill="none" ${L(7)}/><path d="M172 84 Q176 20 190 -36" fill="none" stroke="#7cc45a" stroke-width="3.5" stroke-linecap="round"/>` +
      `<ellipse cx="192" cy="-56" rx="10" ry="22" transform="rotate(10 192 -56)" fill="#e8e07a" ${L(3)}/><path d="M182 -70 l-8 -4 M180 -56 l-9 0 M182 -42 l-8 4 M202 -70 l8 -6 M204 -56 l9 -2 M202 -42 l8 2 M194 -78 l2 -9" ${L(2.5)}/></svg>`;
    let sp = '';
    for (let i = 0; i < 12; i++) sp += el('spark', pick(['✦', '✧', '★']), `left:${r0(rnd(60, 94))}vw;top:calc(62vh - ${r0(rnd(92, 112))}vw);font-size:${r0(rnd(14, 26))}px;color:${pick(['#ffd94a', '#fff', '#ff9fbb'])};${dl(ms * rnd(0.36, 0.86))}`);
    let birds = '';
    for (let i = 0; i < 4; i++) birds += el('bird', BIRD, `top:${r0(30 + i * 6)}vh;width:${r0(rnd(6, 9))}vw;${dl(ms * (0.4 + i * 0.08))}`);
    let sea = '';
    for (let i = 0; i < 20; i++) sea += `<path d="M${i * 40 + 6} 20 q8 -10 16 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    scene(K, 'liberty', el('lsky') + el('lsun') + el('libgrp', el('ped') + el('statue', statue) + sp) + birds +
      el('lsea', `<svg viewBox="0 0 800 60" preserveAspectRatio="none"><path d="M0 14 ${Array.from({ length: 20 }, () => 'q10 -10 20 0 t20 0').join(' ')} V60 H0 Z" fill="#5fb0f0" ${L(3)}/>${sea}</svg>`));
    fword(K, 'ズズズ…', W * 0.06, H * 0.5, ms * 0.06, '#fff', 28, -6);
    fword(K, 'にゃ由の女神!?', W * 0.1, H * 0.04, ms * 0.44, '#ffd94a', 32, -4);
  });
})();
