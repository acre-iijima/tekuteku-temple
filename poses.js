// てんぷるのポーズ（手描き風の線画）。座標は viewBox 0 0 240 200。
// head: 帽子をのせる位置と角度、neck: マフラーを巻く位置と幅。
// ラグドールらしさ：ふわふわの胸毛、目のまわりの濃いモカ色、青い目、おでこのアプリコット、
// 白い鼻すじ、鼻の左と口もとの黒ぽっち、白い足先、濃い色のしっぽ。
(function () {
  // うすい水彩の塗り
  const wash = (cls, x, y, rx, ry, rot = 0) =>
    `<ellipse class="${cls}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})"/>`;
  // 目のまわりのモカ色（外側に少したれる形）
  const maskL = (x, y) => wash('w-mask', x, y, 15, 11);
  const maskR = (x, y) => wash('w-mask', x, y, 15, 11);
  const brow = (x, y) => wash('w-apricot', x, y, 9, 7);
  // 青い目：白目＋青い瞳＋黒目＋光、上まぶたの線で眠たげに
  const eye = (x, y, look = 0) =>
    `<g class="eye"><ellipse class="b" cx="${x}" cy="${y}" rx="8.5" ry="7.5"/>` +
    `<circle class="ink-fill" cx="${x + 1 + look}" cy="${y + 2}" r="3.2"/>` +
    `<path class="l" d="M${x - 10} ${y - 2} Q${x} ${y - 5} ${x + 10} ${y - 2}"/></g>`;
  const roundEye = (x, y) =>
    `<g class="eye"><circle class="b" cx="${x}" cy="${y}" r="8"/><circle class="ink-fill" cx="${x}" cy="${y}" r="3.4"/></g>`;
  const closedEye = (x, y) => `<path class="l" d="M${x - 9} ${y} Q${x} ${y + 6} ${x + 9} ${y}"/>`;
  const happyEye = (x, y) => `<path class="l" d="M${x - 9} ${y + 2} Q${x} ${y - 5} ${x + 9} ${y + 2}"/>`;
  // ピンクの鼻と、牛柄みたいな黒ぽっち（鼻の左と口もと）
  const nose = (x, y) =>
    `<path class="nose" d="M${x - 5} ${y - 2} Q${x} ${y - 4} ${x + 5} ${y - 2} Q${x + 3} ${y + 3} ${x} ${y + 4} Q${x - 3} ${y + 3} ${x - 5} ${y - 2} Z"/>` +
    `<path class="ink-fill" d="M${x - 5} ${y - 2} Q${x - 3} ${y - 3.4} ${x - 1} ${y - 3} Q${x - 0.5} ${y + 1} ${x - 2} ${y + 3.4} Q${x - 4} ${y + 1} ${x - 5} ${y - 2} Z"/>`;
  const mouth = (x, y) =>
    `<path class="l thin" d="M${x} ${y + 4} L${x} ${y + 7} M${x - 6} ${y + 10} Q${x - 3} ${y + 7} ${x} ${y + 7} Q${x + 3} ${y + 7} ${x + 6} ${y + 10}"/>` +
    `<circle class="ink-fill" cx="${x - 2.5}" cy="${y + 12.5}" r="1.4"/>`;
  // 白い鼻すじ（目のあいだを白く抜く）
  const blaze = () => '';
  const blazeUnused = (x, y) => `<path class="w-white" d="M${x - 6} ${y - 16} Q${x} ${y - 22} ${x + 6} ${y - 16} L${x + 9} ${y + 8} Q${x} ${y + 14} ${x - 9} ${y + 8} Z"/>`;
  // 耳の中のピンク
  const earIn = () => '';
  // ほっぺのふわふわ（ギザギザの毛）
  const tuftL = () => '';
  const tuftR = () => '';
  // 胸のふわふわ（白いえりまき）。下のふちをギザギザにする
  const ruff = () => '';
  function ruffUnused(cx, top, w, h) {
    const half = w / 2;
    let d = `M${cx - half} ${top} C ${cx - half - 4} ${top + h * 0.5}, ${cx - half * 0.7} ${top + h * 0.9}, ${cx - half * 0.55} ${top + h * 0.92}`;
    const n = 6;
    for (let i = 1; i <= n; i++) {
      const x = cx - half * 0.55 + (half * 1.1 * i) / n;
      const y = top + h * (i % 2 ? 1.08 : 0.9) - Math.abs(i - n / 2) * 1.2;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` C ${cx + half * 0.7} ${top + h * 0.9}, ${cx + half + 4} ${top + h * 0.5}, ${cx + half} ${top}`;
    return `<path class="b" d="${d}"/><path class="l thin" d="M${cx - 8} ${top + h * 0.45} l3 6 M${cx + 6} ${top + h * 0.5} l-3 6 M${cx - 1} ${top + h * 0.7} l1 6"/>`;
  }
  // しっぽ：太い線の上に色線を重ねて、ふさふさの二重線にする
  const tail = (d, origin) =>
    `<g class="tail" style="transform-origin:${origin}"><path class="tail-out" d="${d}"/><path class="tail-in" d="${d}"/></g>`;

  // おすわりの顔は、なでたときの反応でも使い回す
  function sitFace(kind) {
    let eyes;
    if (kind === 'closed') eyes = closedEye(100, 89) + closedEye(142, 89);
    else if (kind === 'happy') eyes = happyEye(100, 89) + happyEye(142, 89);
    else if (kind === 'side') eyes = eye(100, 88, 3) + eye(142, 88, 3);
    else eyes = eye(100, 88) + eye(142, 88);
    return `${brow(121, 64)}${maskL(100, 89)}${maskR(142, 89)}${blaze(121, 92)}${eyes}${nose(121, 102)}${mouth(121, 102)}`;
  }
  function sitBody(extra = '') {
    return `
      ${tail('M158 180 C 196 186 210 160 200 134', '160px 180px')}
      <path class="b" d="M80 186 C 62 166 64 130 96 120 L146 120 C 178 130 180 166 162 186 Z"/>
      ${wash('w-fawn', 147, 164, 9, 14)}${wash('w-fawn', 95, 168, 7, 11)}
      ${ruff(121, 116, 64, 46)}
      <path class="b" d="M100 187 C 98 176 114 174 115 187 M127 187 C 128 174 144 176 142 187"/>
      ${extra}
      <path class="b" d="M70 92 C 68 72 78 60 90 57 L 94 37 Q 96 33 100 36 L 112 52 C 118 51 124 51 130 52 L 142 36 Q 146 33 148 37 L 152 57 C 164 60 174 72 172 92 C 170 116 150 127 121 127 C 92 127 72 116 70 92 Z"/>
      ${earIn('97 42 L 107 52 L 95 54')}${earIn('145 42 L 135 52 L 147 54')}
      ${tuftL(71, 100)}${tuftR(171, 100)}`;
  }

  const P = {};

  // 昼：おすわり
  P.sit = { svg: sitBody() + sitFace('open'), head: { x: 121, y: 56, r: 0 }, neck: { x: 121, y: 126, w: 74 } };

  // よく歩いた日：横向きで立つ
  P.stand = {
    svg: `
      ${tail('M184 100 C 206 92 212 62 196 44 C 192 38 186 38 184 44', '184px 100px')}
      <path class="b" d="M64 98 C 60 78 66 66 76 62 L 78 44 Q 80 40 84 43 L 96 57 C 104 55 112 55 120 58 L 130 44 Q 134 41 136 45 L 138 64 C 144 70 146 78 146 86 C 160 84 178 86 188 94 C 198 104 198 122 190 132 L 192 152 C 192 158 182 158 182 152 L 178 138 C 168 140 156 140 146 139 L 146 154 C 146 160 136 160 136 154 L 134 138 L 126 140 L 126 154 C 126 160 116 160 116 154 L 114 136 L 102 136 L 102 154 C 102 160 92 160 92 154 L 90 132 C 74 126 66 114 64 98 Z"/>
      ${wash('w-fawn', 166, 108, 16, 10, -8)}
      ${ruff(104, 116, 38, 26)}
      ${earIn('81 48 L 91 57 L 79 59')}${earIn('131 48 L 123 58 L 135 60')}
      ${tuftL(65, 104)}${tuftR(143, 100)}
      ${brow(104, 70)}${maskL(88, 96)}${maskR(124, 96)}${blaze(106, 98)}
      ${eye(88, 95)}${eye(124, 95)}
      ${nose(106, 108)}${mouth(106, 108)}`,
    head: { x: 106, y: 58, r: -4 },
    neck: { x: 108, y: 128, w: 60 },
  };

  // 夜・深夜：香箱すわりで寝る
  P.loaf = {
    svg: `
      ${tail('M176 132 C 196 114 196 88 186 74', '176px 132px')}
      <path class="b" d="M62 162 C 56 132 66 106 84 98 L 87 78 Q 89 74 93 77 L 106 92 C 116 89 128 89 138 92 L 151 77 Q 155 74 157 78 L 160 98 C 178 106 188 132 182 162 C 176 178 150 184 122 184 C 94 184 68 178 62 162 Z"/>
      ${wash('w-fawn', 82, 156, 8, 12)}${wash('w-fawn', 164, 154, 8, 12)}
      ${earIn('90 82 L 100 92 L 88 95')}${earIn('154 82 L 144 92 L 156 95')}
      ${tuftL(63, 140)}${tuftR(181, 140)}
      <path class="b" d="M96 178 C 96 168 112 166 118 175 M126 175 C 132 166 148 168 148 178"/>
      ${brow(122, 106)}${maskL(102, 128)}${maskR(142, 128)}${blaze(122, 132)}
      ${closedEye(102, 127)}${closedEye(142, 127)}
      ${nose(122, 140)}${mouth(122, 140)}`,
    head: { x: 122, y: 92, r: 0 },
    neck: { x: 122, y: 158, w: 84 },
    sleeping: true,
  };

  // 夕方：うしろ姿で空を見る
  P.back = {
    svg: `
      ${tail('M86 182 C 60 184 50 160 58 136', '86px 182px')}
      <path class="b" d="M80 182 C 66 150 74 114 94 102 C 88 94 88 82 92 72 Q 94 68 98 71 L 110 86 C 118 84 126 84 134 86 L 146 71 Q 150 68 152 72 C 156 82 156 94 150 102 C 170 114 178 150 164 182 C 148 192 96 192 80 182 Z"/>
      <path class="w-apricot" d="M128 120 C 146 124 156 144 150 166 C 140 172 130 160 128 146 C 126 136 124 126 128 120 Z"/>
      ${wash('w-mask', 98, 80, 6, 8)}${wash('w-mask', 146, 80, 6, 8)}
      <path class="l thin" d="M90 104 L 81 100 M89 110 L 79 109 M154 104 L 163 100 M155 110 L 165 109"/>`,
    head: { x: 122, y: 86, r: 0 },
    neck: { x: 122, y: 106, w: 58 },
  };

  // 早朝・朝：のび
  P.stretch = {
    svg: `
      ${tail('M188 98 C 204 80 208 60 198 44', '188px 98px')}
      <path class="b" d="M40 184 L 92 184 C 100 184 104 176 98 172 C 120 160 140 120 168 98 C 184 88 196 96 196 112 C 196 130 194 160 194 178 C 194 186 184 186 184 178 L 182 150 C 180 160 178 170 178 178 C 178 186 168 186 168 178 L 166 146 C 150 154 132 168 116 178 C 110 182 104 186 96 188 L 40 188 C 32 188 32 184 40 184 Z"/>
      ${wash('w-fawn', 160, 122, 14, 8, -40)}
      <path class="b" d="M44 150 C 42 132 52 122 62 120 L 64 102 Q 66 98 70 101 L 80 114 C 86 113 92 113 98 115 L 108 101 Q 112 99 113 103 L 114 122 C 122 128 126 138 124 150 C 120 168 104 174 84 174 C 62 174 46 166 44 150 Z"/>
      ${earIn('67 106 L 76 115 L 65 117')}${earIn('110 106 L 102 116 L 112 118')}
      ${tuftL(45, 152)}${tuftR(123, 150)}
      ${brow(86, 128)}${maskL(70, 146)}${maskR(102, 146)}${blaze(86, 150)}
      ${closedEye(70, 145)}${closedEye(102, 145)}
      <path class="nose" d="M81 156 Q86 154 91 156 Q89 161 86 162 Q83 161 81 156 Z"/><path class="ink-fill" d="M81 156 Q83 154.6 85 155 Q85.5 159 84 161.4 Q82 159 81 156 Z"/>
      <ellipse class="l mouth-open" cx="86" cy="167" rx="4" ry="3.5"/>`,
    head: { x: 86, y: 116, r: -8 },
    neck: { x: 88, y: 172, w: 60 },
  };

  // ---- ここから、なでたときのポーズ ----

  // びっくりして立ち上がる
  P.upright = {
    svg: `
      ${tail('M156 170 C 180 170 188 150 180 128', '156px 170px')}
      <path class="b" d="M84 186 C 84 150 80 110 82 72 C 80 58 84 46 92 42 L 95 24 Q 97 20 101 23 L 112 38 C 118 37 126 37 132 38 L 143 23 Q 147 20 149 24 L 152 44 C 160 50 162 62 160 74 C 162 112 164 150 160 186 C 160 192 150 192 148 186 L 132 152 L 112 152 C 108 164 104 178 98 188 C 94 194 84 192 84 186 Z"/>
      ${ruff(122, 98, 66, 40)}
      ${earIn('98 28 L 107 38 L 96 40')}${earIn('146 28 L 137 38 L 148 40')}
      ${tuftL(82, 70)}${tuftR(161, 70)}
      ${brow(122, 48)}${maskL(104, 70)}${maskR(140, 70)}${blaze(122, 74)}
      ${roundEye(104, 70)}${roundEye(140, 70)}
      ${nose(122, 82)}
      <ellipse class="l" cx="122" cy="93" rx="4" ry="4.5"/>
      <path class="b" d="M104 116 C 98 120 98 134 104 138 C 108 134 108 120 104 116 Z M140 116 C 134 120 134 134 140 138 C 146 134 146 120 140 116 Z"/>`,
    head: { x: 122, y: 37, r: 0 },
    neck: { x: 122, y: 100, w: 70 },
  };

  // 毛づくろい：前足をなめる
  P.groom = {
    svg: sitBody() + `${brow(121, 64)}${maskL(100, 89)}${maskR(142, 89)}${blaze(121, 92)}${closedEye(100, 89)}${closedEye(142, 89)}${nose(121, 102)}
      <path class="l thin" d="M121 106 L121 109"/><path class="tongue" d="M117 110 Q121 108 125 110 Q124 116 121 116 Q118 116 117 110 Z"/>
      <path class="b" d="M126 160 C 134 140 140 124 136 114 C 132 106 120 108 120 116 C 118 130 116 146 112 162 Z"/>
      <path class="l thin" d="M124 112 l0 4 M129 111 l0 4"/>`,
    head: { x: 121, y: 56, r: 0 },
    neck: { x: 121, y: 126, w: 74 },
  };

  // 横目でちらっと見る
  P.sideeye = { svg: sitBody() + sitFace('side') + '<path class="l thin" d="M182 64 l4 -6 M190 70 l6 -3 M178 58 l1 -7"/>', head: { x: 121, y: 56, r: 0 }, neck: { x: 121, y: 126, w: 74 } };

  // ゆっくりまばたき（すきの合図）
  P.blink = { svg: sitBody() + sitFace('happy') + '<path class="heart-ink" d="M184 60 c-4 -6 -12 -2 -8 4 l8 7 l8 -7 c4 -6 -4 -10 -8 -4 Z"/>', head: { x: 121, y: 56, r: 0 }, neck: { x: 121, y: 126, w: 74 } };

  // ごろーん：あおむけ
  P.roll = {
    svg: `
      ${tail('M184 168 C 204 170 214 158 212 140', '184px 168px')}
      <path class="b" d="M64 168 C 62 146 80 132 108 130 C 140 128 176 134 188 152 C 194 164 186 180 166 182 C 140 186 96 186 78 182 C 70 180 64 176 64 168 Z"/>
      ${wash('w-fawn', 150, 170, 26, 10)}
      <path class="b" d="M112 132 C 110 118 108 104 112 96 C 116 92 122 94 122 100 C 122 110 122 122 124 132 Z"/>
      <path class="b" d="M136 132 C 138 118 142 106 148 100 C 152 96 158 100 156 106 C 152 114 150 124 150 134 Z"/>
      <path class="b" d="M166 140 C 172 128 180 118 188 116 C 194 116 196 122 192 126 C 186 132 182 140 180 148 Z"/>
      <path class="w-white" d="M96 150 C 110 140 150 140 166 152 C 160 168 110 172 96 162 Z"/>
      <path class="b" d="M28 150 C 24 132 34 118 48 114 L 46 96 Q 47 92 51 94 L 64 106 C 70 105 76 105 82 107 L 93 96 Q 97 94 97 98 L 96 116 C 104 122 108 134 104 148 C 100 164 84 170 66 170 C 44 170 30 164 28 150 Z"/>
      ${earIn('50 100 L 60 107 L 50 110')}${earIn('93 102 L 86 109 L 95 112')}
      ${brow(66, 120)}${maskL(52, 140)}${maskR(84, 140)}${blaze(68, 144)}
      ${happyEye(52, 141)}${happyEye(84, 141)}
      ${nose(68, 152)}${mouth(68, 152)}`,
    head: { x: 70, y: 108, r: -10 },
    neck: { x: 70, y: 168, w: 60 },
  };


  // ---------- ここから、増やしたポーズ（シュール多め） ----------
  const HEAD = '<path class="b" d="M70 92 C 68 72 78 60 90 57 L 94 37 Q 96 33 100 36 L 112 52 C 118 51 124 51 130 52 L 142 36 Q 146 33 148 37 L 152 57 C 164 60 174 72 172 92 C 170 116 150 127 121 127 C 92 127 72 116 70 92 Z"/>';
  // 点の目（真顔）
  const dotEye = (x, y) => `<circle class="ink-fill" cx="${x}" cy="${y}" r="2.6"/>`;
  const squintEye = (x, y, d) => `<path class="l" d="M${x - 7 * d} ${y - 5} L${x + 5 * d} ${y} L${x - 7 * d} ${y + 5}"/>`;
  const flatMouth = (x, y) => `<path class="l thin" d="M${x} ${y + 4} L${x} ${y + 7} M${x - 5} ${y + 9} L${x + 5} ${y + 9}"/>`;
  function faceOf(kind) {
    const base = `${brow(121, 64)}${maskL(100, 89)}${maskR(142, 89)}`;
    if (kind === 'dot') return base + dotEye(100, 90) + dotEye(142, 90) + nose(121, 102) + flatMouth(121, 102);
    if (kind === 'round') return base + roundEye(100, 88) + roundEye(142, 88) + nose(121, 102) + '<ellipse class="l thin" cx="121" cy="112" rx="3" ry="3.5"/>';
    if (kind === 'yawn') return base + closedEye(100, 84) + closedEye(142, 84) + nose(121, 96) +
      '<path class="b" d="M106 104 Q121 98 136 104 Q138 124 121 126 Q104 124 106 104 Z"/><path class="tongue" d="M112 118 Q121 112 130 118 Q128 124 121 124 Q114 124 112 118 Z"/>';
    if (kind === 'squint') return base + squintEye(100, 88, 1) + squintEye(142, 88, -1) + nose(121, 102) + mouth(121, 102);
    if (kind === 'closed') return base + closedEye(100, 89) + closedEye(142, 89) + nose(121, 102) + mouth(121, 102);
    if (kind === 'happy') return base + happyEye(100, 89) + happyEye(142, 89) + nose(121, 102) + mouth(121, 102);
    if (kind === 'side') return base + eye(100, 88, 3) + eye(142, 88, 3) + nose(121, 102) + mouth(121, 102);
    return base + eye(100, 88) + eye(142, 88) + nose(121, 102) + mouth(121, 102);
  }
  // 頭を、ずらす・かたむける・ちぢめる（(121,92) が中心）
  const headTf = (tx, ty, rot, s) => `translate(${tx} ${ty}) translate(121 92) rotate(${rot}) scale(${s}) translate(-121 -92)`;
  const headG = (kind, tx = 0, ty = 0, rot = 0, s = 1) => `<g transform="${headTf(tx, ty, rot, s)}">${HEAD}${faceOf(kind)}</g>`;
  // 帽子・マフラーの位置も、頭といっしょに動かす
  function at(x, y, tx, ty, rot, s) {
    const t = (rot * Math.PI) / 180, dx = (x - 121) * s, dy = (y - 92) * s;
    return { x: +(121 + tx + dx * Math.cos(t) - dy * Math.sin(t)).toFixed(1), y: +(92 + ty + dx * Math.sin(t) + dy * Math.cos(t)).toFixed(1) };
  }
  const headAt = (tx = 0, ty = 0, rot = 0, s = 1) => ({ ...at(121, 56, tx, ty, rot, s), r: rot });
  const neckSit = { x: 121, y: 126, w: 74 };
  // おすわりの体（頭なし）
  function sitTorso(tailD = 'M158 180 C 196 186 210 160 200 134', origin = '160px 180px') {
    return `${tail(tailD, origin)}
      <path class="b" d="M80 186 C 62 166 64 130 96 120 L146 120 C 178 130 180 166 162 186 Z"/>
      <path class="b" d="M100 187 C 98 176 114 174 115 187 M127 187 C 128 174 144 176 142 187"/>`;
  }
  const sitWith = (kind, extra = '', tx = 0, ty = 0, rot = 0, s = 1, after = '') =>
    ({ svg: sitTorso() + extra + headG(kind, tx, ty, rot, s) + after, head: headAt(tx, ty, rot, s), neck: neckSit });
  const star = (x, y, r = 5) => `<path class="l thin" d="M${x} ${y - r} L${x} ${y + r} M${x - r} ${y} L${x + r} ${y}"/>`;
  const zzz = (x, y) => `<path class="l thin" d="M${x} ${y} h8 l-8 9 h8 M${x + 14} ${y - 14} h6 l-6 7 h6"/>`;

  // ---- なでたときのポーズ（追加） ----
  // かたまる
  P.freeze = sitWith('round', '', 0, 0, 0, 1, '<path class="l" d="M188 34 l0 16 M188 58 l0 1 M200 42 l0 12 M200 60 l0 1"/><path class="l thin" d="M60 70 l-10 -4 M58 82 l-12 0 M182 70 l10 -4"/>');
  // 真顔でじっと見る
  P.stare = sitWith('dot');
  // 首をかしげる
  P.tilt = sitWith('open', '', -4, 4, -18, 1, '<path class="l" d="M186 46 q0 -12 10 -12 q10 0 10 9 q0 7 -10 10 l0 7 M196 72 l0 1"/>');
  // 招き猫
  P.maneki = sitWith('happy', '', 0, 0, 0, 1,
    '<path class="b" d="M150 158 C 158 132 166 108 168 90 C 168 76 186 74 188 86 C 190 104 178 130 168 160 Z"/><path class="l thin" d="M174 80 l0 6 M180 80 l0 6"/>');
  // あくび
  P.yawn = sitWith('yawn', '', 0, 0, 8);
  // 宇宙を見た顔
  P.cosmos = sitWith('dot', '', 0, 0, 0, 1, star(40, 50) + star(200, 40, 6) + star(58, 18, 4) + star(186, 92, 4) + star(30, 110, 3) + '<circle class="l thin" cx="210" cy="70" r="3"/><circle class="l thin" cx="46" cy="80" r="2.5"/>');
  // 棒のように、まっすぐ
  P.plank = {
    svg: `${tail('M196 150 L 232 150', '196px 150px')}
      <path class="b" d="M70 136 L 200 136 C 210 136 212 164 200 164 L 70 164 Z"/>
      <path class="b" d="M96 164 L 96 192 M110 164 L 110 192 M170 164 L 170 192 M184 164 L 184 192"/>
      <path class="l" d="M96 192 h-4 M110 192 h-4 M170 192 h-4 M184 192 h-4"/>
      ${headG('dot', -62, 52, 0, 0.62)}`,
    head: headAt(-62, 52, 0, 0.62), neck: { x: 76, y: 150, w: 44 },
  };
  // おじぎ
  P.bow = sitWith('closed', '', 0, 30, 0, 0.94, '<path class="l thin" d="M52 70 l-8 -6 M50 84 l-10 -2 M190 70 l8 -6 M192 84 l10 -2"/>');
  // くしゃみ
  P.sneeze = sitWith('squint', '', 4, 0, -10, 1, '<path class="l thin" d="M142 120 l12 6 M140 128 l12 12 M132 132 l6 14"/><circle class="l thin" cx="160" cy="132" r="2"/><circle class="l thin" cx="152" cy="148" r="2"/>');
  // 前足で目をかくす
  P.hide = sitWith('closed', '', 0, 0, 0, 1,
    '<path class="b" d="M86 132 C 80 116 82 96 92 86 C 100 78 114 82 112 94 C 110 106 106 120 104 134 Z"/><path class="b" d="M156 132 C 162 116 160 96 150 86 C 142 78 128 82 130 94 C 132 106 136 120 138 134 Z"/>' +
    '<path class="l thin" d="M98 84 l0 5 M104 84 l0 5 M138 84 l0 5 M144 84 l0 5"/>');

  // ---- ふだんのポーズ（追加） ----
  // 箱からあふれる（液体っぽい）
  P.box = {
    svg: `${tail('M168 134 C 190 140 196 160 184 182', '168px 134px')}
      <path class="b" d="M52 132 C 46 112 80 104 121 104 C 162 104 196 112 190 132 C 196 146 194 158 186 160 C 182 146 178 138 170 138 L 72 138 C 64 138 60 146 56 160 C 48 158 46 146 52 132 Z"/>
      ${headG('open', 0, 2)}
      <path class="b" d="M92 128 C 92 120 108 118 110 128 M132 128 C 134 118 150 120 150 128"/>
      <path class="b prop-straw" d="M62 134 L 180 134 L 176 192 L 66 192 Z"/>
      <path class="b prop-straw" d="M62 134 L 44 120 L 50 112 L 68 128 Z M180 134 L 198 120 L 192 112 L 174 128 Z"/>
      <path class="l thin" d="M100 160 L 142 160"/>`,
    head: headAt(0, 2), neck: null,
  };
  // 香箱のまま、ちょっと浮く
  P.float = {
    svg: `<ellipse class="w-mask" cx="122" cy="194" rx="56" ry="5"/>
      <path class="l thin" d="M70 192 l-6 6 M176 192 l6 6 M122 196 l0 4"/>
      <g transform="translate(0 -22)">${P.loaf.svg}</g>`,
    head: { x: 122, y: 70, r: 0 }, neck: { x: 122, y: 136, w: 84 }, sleeping: true,
  };
  // 湯のみのとなりで、ひと息
  P.teacup = sitWith('closed', '', 0, 0, 0, 1,
    '<path class="b" d="M26 154 L 30 186 Q 42 194 54 186 L 58 154 Z"/><path class="l thin" d="M26 160 Q 42 166 58 160"/><path class="l thin" d="M36 146 q-4 -8 2 -14 M46 144 q-4 -8 2 -14"/>');
  // 二本足で、遠くを見る
  P.gaze = {
    svg: P.upright.svg.replace(/<g class="eye">.*?<\/g><g class="eye">.*?<\/g>/, eye(104, 70) + eye(140, 70))
      .replace(/<ellipse class="l" cx="122" cy="93"[^>]*\/>/, mouth(122, 82)) +
      '<path class="l thin" d="M190 150 h18 M196 160 h14 M10 150 h16"/>',
    head: P.upright.head, neck: P.upright.neck,
  };
  // しっぽと、静かに向き合う
  P.tailstare = {
    svg: sitTorso('M150 186 C 196 192 206 160 186 150 C 172 144 164 160 176 166', '150px 186px') + headG('side', 4, 6, 14) +
      '<path class="l thin" d="M196 132 l4 -4 M204 140 l6 -2"/>',
    head: headAt(4, 6, 14), neck: neckSit,
  };
  // 新聞を読む
  P.newspaper = {
    svg: `${sitTorso()}
      <path class="b" d="M62 122 L 178 116 L 182 188 L 58 190 Z"/>
      <path class="l thin" d="M72 132 L 168 128 M72 146 L 116 144 M72 156 L 116 154 M72 166 L 116 164 M72 176 L 116 174"/>
      <path class="l thin" d="M128 144 L 168 142 L 170 176 L 130 178 Z"/>
      ${headG('open', 0, -4)}
      <path class="b" d="M60 124 C 52 120 52 108 62 108 C 70 108 72 118 68 124 Z M180 118 C 188 114 188 102 178 102 C 170 102 168 112 172 118 Z"/>`,
    head: headAt(0, -4), neck: null,
  };
  // とけて、平らになる
  P.melt = {
    svg: `${tail('M200 178 C 216 180 228 176 234 168', '200px 178px')}
      <path class="b" d="M20 186 C 16 172 46 162 84 164 C 110 154 170 156 204 170 C 218 178 214 192 196 192 L 36 194 C 26 194 22 190 20 186 Z"/>
      <path class="l thin" d="M60 182 q6 -4 12 0 M150 184 q6 -4 12 0"/>
      ${headG('happy', 0, 52, 0, 0.82)}`,
    head: headAt(0, 52, 0, 0.82), neck: { x: 121, y: 168, w: 70 },
  };
  // おなかを出して、ひなたで寝る
  P.sunbath = {
    svg: P.roll.svg.split(happyEye(52, 141)).join(closedEye(52, 141)).split(happyEye(84, 141)).join(closedEye(84, 141)) + zzz(20, 96),
    head: P.roll.head, neck: P.roll.neck, sleeping: true,
  };
  // 靴下をだいて寝る
  P.sockhold = {
    svg: P.loaf.svg + '<path class="b prop-pink" d="M108 160 L 108 182 Q 108 192 118 192 L 144 192 Q 152 186 144 180 L 128 178 L 128 160 Z"/><path class="l thin" d="M108 166 L 128 166 M108 172 L 128 172"/>',
    head: P.loaf.head, neck: P.loaf.neck, sleeping: true,
  };
  // 紙袋から、顔だけ
  P.bag = {
    svg: `${headG('open', 0, 18)}
      <path class="b prop-straw" d="M56 124 L 186 124 L 178 194 L 64 194 Z"/>
      <path class="l thin" d="M56 124 L 70 134 L 172 134 L 186 124 M96 150 L 96 186 M146 150 L 146 186"/>`,
    head: headAt(0, 18), neck: null,
  };

  window.Poses = P;
  // 派手な動き用（頭だけ回すときなどに使う）
  window.PoseParts = { sitTorso, headG };
  // なでたときに出てくるポーズ
  window.TapPoses = ['upright', 'groom', 'sideeye', 'blink', 'roll', 'freeze', 'stare', 'tilt', 'maneki', 'yawn', 'cosmos', 'plank', 'bow', 'sneeze', 'hide'];
  // 時間帯ごとに、ときどき出てくるポーズ（いつものポーズが多め）
  window.DayPoses = {
    dawn: ['stretch', 'stretch', 'teacup', 'newspaper'],
    morning: ['stretch', 'stretch', 'teacup', 'newspaper', 'bag'],
    day: ['sit', 'sit', 'box', 'float', 'gaze', 'tailstare', 'melt', 'bag', 'teacup', 'sunbath'],
    evening: ['back', 'back', 'gaze', 'tailstare', 'box', 'newspaper'],
    night: ['loaf', 'loaf', 'sockhold', 'float', 'sunbath', 'melt'],
    late: ['loaf', 'loaf', 'sockhold', 'sunbath'],
  };

  // 季節の小物（原点が帽子の底のまんなか）
  window.Props = {
    witch: '<path class="b prop-purple" d="M-30 0 Q0 7 30 0 Q16 -4 11 -7 L3 -44 Q1 -50 -4 -45 L-11 -7 Q-16 -4 -30 0 Z"/><path class="l" d="M-11 -7 Q0 -3 11 -7"/>',
    santa: '<path class="b prop-red" d="M-24 0 C -20 -26 6 -36 24 -22 L 30 -4 Q0 4 -24 0 Z"/><path class="b" d="M-26 2 Q0 8 30 -2 L 30 -8 Q0 -1 -26 -6 Z"/><circle class="b" cx="26" cy="-24" r="5"/>',
    straw: '<ellipse class="b prop-straw" cx="0" cy="-2" rx="34" ry="7"/><path class="b prop-straw" d="M-17 -4 C -16 -22 16 -22 17 -4 Z"/><path class="l prop-band" d="M-17 -8 Q0 -5 17 -8"/>',
    sakura: '<g transform="translate(-14 -2) rotate(-20)"><path class="b prop-pink" d="M0 0 C -7 -6 -5 -15 0 -12 C 5 -15 7 -6 0 0 Z"/></g>',
    scarfOf: (w) => {
      const h = w / 2;
      return `<path class="b prop-red" d="M${-h} -5 Q0 7 ${h} -5 L${h} 4 Q0 16 ${-h} 4 Z"/><path class="b prop-red" d="M${h * 0.35} 6 L${h * 0.5} 30 L${h * 0.85} 26 L${h * 0.7} 3 Z"/><path class="l thin" d="M${-h * 0.5} 0 L${-h * 0.45} 8 M0 3 L0 11 M${h * 0.5} 0 L${h * 0.45} 8"/>`;
    },
  };
})();
