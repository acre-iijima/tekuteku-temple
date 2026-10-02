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

  window.Poses = P;
  // なでたときに出てくるポーズ
  window.TapPoses = ['upright', 'groom', 'sideeye', 'blink', 'roll'];

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
