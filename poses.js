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
  // ---- 表情（追加ぶん） ----
  const halfEye = (x, y, lid = 0) =>
    `<path class="b" d="M${x - 9} ${y + lid} Q${x} ${y + 12} ${x + 9} ${y + lid} Z"/><circle class="ink-fill" cx="${x + 0.5}" cy="${y + 3 + lid / 2}" r="2.6"/><path class="l" d="M${x - 10} ${y + lid} L${x + 10} ${y + lid}"/>`;
  const upEye = (x, y) => `<g class="eye"><ellipse class="b" cx="${x}" cy="${y}" rx="8.5" ry="7.5"/><circle class="ink-fill" cx="${x}" cy="${y - 2.5}" r="3.2"/></g>`;
  const kiraEye = (x, y) =>
    `<g class="eye"><circle class="b" cx="${x}" cy="${y}" r="8.5"/><circle class="ink-fill" cx="${x}" cy="${y + 0.5}" r="5.4"/><circle class="shine" cx="${x + 2}" cy="${y - 1.8}" r="1.9"/><circle class="shine" cx="${x - 2}" cy="${y + 2.6}" r="1"/></g>`;
  const smallEye = (x, y) => `<g class="eye"><circle class="b" cx="${x}" cy="${y}" r="8"/><circle class="ink-fill" cx="${x}" cy="${y}" r="1.8"/></g>`;
  const lineEye = (x, y) => `<path class="l" d="M${x - 8} ${y + 1} L${x + 8} ${y + 1}"/>`;
  const smugMouth = (x, y) =>
    `<path class="l thin" d="M${x} ${y + 4} L${x} ${y + 7} M${x - 8} ${y + 6} Q${x - 4} ${y + 12} ${x} ${y + 7} Q${x + 4} ${y + 12} ${x + 8} ${y + 6}"/><circle class="ink-fill" cx="${x - 2.5}" cy="${y + 13}" r="1.4"/>`;
  const openMouth = (x, y) =>
    `<path class="l thin" d="M${x} ${y + 4} L${x} ${y + 6}"/><path class="b" d="M${x - 6} ${y + 7} Q${x} ${y + 5} ${x + 6} ${y + 7} Q${x + 5} ${y + 17} ${x} ${y + 17} Q${x - 5} ${y + 17} ${x - 6} ${y + 7} Z"/>` +
    `<path class="tongue" d="M${x - 3.5} ${y + 13} Q${x} ${y + 10} ${x + 3.5} ${y + 13} Q${x + 3} ${y + 16} ${x} ${y + 16} Q${x - 3} ${y + 16} ${x - 3.5} ${y + 13} Z"/>`;
  const wavyMouth = (x, y) => `<path class="l thin" d="M${x} ${y + 4} L${x} ${y + 7} M${x - 8} ${y + 11} q2 -3 4 0 q2 3 4 0 q2 -3 4 0 q2 3 4 0"/>`;
  const worry = '<path class="l thin" d="M88 74 L108 69 M134 69 L154 74"/>';
  const drop = (x, y) => `<path class="b" style="fill:#c4d8ee" d="M${x} ${y} q-4 6 0 9 q4 -3 0 -9 Z"/>`;
  const blush = wash('w-apricot', 84, 105, 8, 4) + wash('w-apricot', 158, 105, 8, 4);
  const FACES = {
    half: () => halfEye(100, 86) + halfEye(142, 86) + nose(121, 102) + mouth(121, 102),
    jito: () => halfEye(100, 87, 3) + halfEye(142, 87, 3) + nose(121, 102) + flatMouth(121, 102),
    doya: () => closedEye(100, 88) + closedEye(142, 88) + nose(121, 102) + smugMouth(121, 102),
    komari: () => worry + eye(100, 88) + eye(142, 88) + nose(121, 102) + wavyMouth(121, 102),
    kira: () => kiraEye(100, 88) + kiraEye(142, 88) + nose(121, 102) + mouth(121, 102),
    wink: () => eye(100, 88) + happyEye(142, 89) + nose(121, 102) + smugMouth(121, 102),
    up: () => upEye(100, 88) + upEye(142, 88) + nose(121, 102) + mouth(121, 102),
    nyaa: () => eye(100, 88) + eye(142, 88) + nose(121, 101) + openMouth(121, 101),
    tear: () => worry + eye(100, 88) + eye(142, 88) + drop(94, 98) + drop(148, 98) + nose(121, 102) + wavyMouth(121, 102),
    line: () => lineEye(100, 88) + lineEye(142, 88) + nose(121, 102) + flatMouth(121, 102),
    tere: () => blush + happyEye(100, 89) + happyEye(142, 89) + nose(121, 102) + mouth(121, 102),
    shock: () => '<path class="l thin" d="M106 56 L106 72 M116 54 L116 70 M126 54 L126 70 M136 56 L136 72"/>' + smallEye(100, 88) + smallEye(142, 88) + nose(121, 102) + wavyMouth(121, 102),
    mogu: () => blush + happyEye(100, 89) + happyEye(142, 89) + nose(121, 102) + smugMouth(121, 102),
  };
  function faceOf(kind) {
    const base = `${brow(121, 64)}${maskL(100, 89)}${maskR(142, 89)}`;
    if (FACES[kind]) return base + FACES[kind]();
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


  // ========== 組み合わせで増やしたポーズ（体のかたち × 表情 × 小物） ==========
  // 小物の色（うすい水彩）
  const C = { green: '#cfe2b8', blue: '#c4d8ee', brown: '#dcc3a4', gray: '#e3e1dc', orange: '#f5c48c', yellow: '#f6e2a0', dark: '#5b5b66' };
  const cl = (k) => (C[k] ? `class="b" style="fill:${C[k]}"` : `class="b${k ? ' ' + k : ''}"`);
  const sh = (d, k = '') => `<path ${cl(k)} d="${d}"/>`;
  const ov = (x, y, rx, ry, k = '', rot = 0) => `<ellipse ${cl(k)} cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
  const ln = (d, thick) => `<path class="l${thick ? '' : ' thin'}" d="${d}"/>`;
  const dot = (x, y, r = 1.6) => `<circle class="ink-fill" cx="${x}" cy="${y}" r="${r}"/>`;
  const g = (x, y, inner, rot = 0, s = 1) => `<g transform="translate(${x} ${y})${rot ? ` rotate(${rot})` : ''}${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;
  // 前足（肩から足先まで。肩のほうは線を閉じないので、体になじむ）
  function arm(x1, y1, x2, y2, w = 14) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy * w / 2, ny = ux * w / 2, f = (v) => +v.toFixed(1);
    const tx = x2 + ux * (w / 2 - 1), ty = y2 + uy * (w / 2 - 1);
    return `<path class="b" d="M${f(x1 + nx)} ${f(y1 + ny)} L${f(x2 + nx)} ${f(y2 + ny)} A${w / 2} ${w / 2} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)} L${f(x1 - nx)} ${f(y1 - ny)}"/>` +
      `<path class="l thin" d="M${f(tx + nx * 0.3)} ${f(ty + ny * 0.3)} l${f(-ux * 4)} ${f(-uy * 4)} M${f(tx - nx * 0.3)} ${f(ty - ny * 0.3)} l${f(-ux * 4)} ${f(-uy * 4)}"/>`;
  }
  const paw = (x, y, rx = 12, ry = 6) => ov(x, y, rx, ry) + ln(`M${x - 3} ${y - ry + 2} l0 4 M${x + 3} ${y - ry + 2} l0 4`);
  const sitPaws = '<path class="b" d="M100 187 C 98 176 114 174 115 187 M127 187 C 128 174 144 176 142 187"/>';

  // ---- 体のかたち（頭はべつ）。tf は頭の [横, 縦, 回転, 大きさ] ----
  const B = {
    sit: () => ({ back: sitTorso(), tf: [0, 0, 0, 1] }),
    // すわって、前足で何かを持つ
    hold: (o) => {
      const [a, b, c, d] = o.paws || [106, 150, 136, 150];
      return { back: sitTorso(), tf: [0, -4, 0, 0.96], front: arm(97, 128, a, b) + arm(145, 128, c, d) };
    },
    // 背すじをのばして、細長くすわる
    tall: () => ({
      back: tail('M146 184 C 184 190 196 166 186 140', '146px 184px') +
        sh('M94 186 C 84 160 88 122 104 98 L138 98 C 154 122 158 160 148 186 Z') + '<path class="b" d="M100 187 C 99 178 112 176 114 187 M128 187 C 130 176 143 178 142 187"/>',
      tf: [0, -16, 0, 0.84],
    }),
    // 香箱すわり
    loaf: () => ({
      back: tail('M176 178 C 204 172 212 148 200 130', '176px 178px') + sh('M56 186 C 48 150 72 124 121 122 C 170 124 194 150 186 186 Z'),
      front: '<path class="b" d="M94 188 C 94 178 110 176 114 187 M128 187 C 132 176 148 178 148 188"/>',
      tf: [0, 40, 0, 0.86],
    }),
    // 伏せ（のびのび）
    flat: (o) => ({
      back: tail('M196 178 C 220 182 232 168 230 150', '196px 178px') +
        sh('M54 172 C 60 146 120 132 170 136 C 206 142 216 182 196 189 L60 190 C 46 188 46 178 54 172 Z') + ln('M168 189 C 164 172 178 162 196 168'),
      front: o.chin ? paw(48, 176, 14, 7) + paw(82, 180, 14, 7) : paw(42, 188, 13, 6) + paw(80, 189, 13, 6),
      tf: o.chin ? [-56, 46, 0, 0.72] : [-56, 50, 0, 0.72],
    }),
    // へそ天
    belly: () => ({
      back: tail('M184 168 C 204 170 214 158 212 140', '184px 168px') +
        sh('M64 168 C 62 146 80 132 108 130 C 140 128 176 134 188 152 C 194 164 186 180 166 182 C 140 186 96 186 78 182 C 70 180 64 176 64 168 Z') +
        sh('M112 132 C 110 118 108 104 112 96 C 116 92 122 94 122 100 C 122 110 122 122 124 132 Z') +
        sh('M136 132 C 138 118 142 106 148 100 C 152 96 158 100 156 106 C 152 114 150 124 150 134 Z') +
        sh('M166 140 C 172 128 180 118 188 116 C 194 116 196 122 192 126 C 186 132 182 140 180 148 Z') + ln('M104 160 Q130 168 156 158'),
      tf: [-55, 52, -8, 0.76],
    }),
    // 二本足で立つ
    stand2: (o) => {
      const A = o.arms || 'down';
      const arms = A === 'down' ? arm(102, 100, 98, 132) + arm(142, 100, 146, 132)
        : A === 'up' ? arm(102, 98, 62, 46) + arm(142, 98, 182, 46)
        : arm(102, 100, A[0], A[1]) + arm(142, 100, A[2], A[3]);
      const body = tail('M150 172 C 178 174 190 152 182 128', '150px 172px') +
        sh('M86 186 C 82 150 84 112 104 84 L140 84 C 160 112 162 150 158 186 C 158 192 148 192 146 186 L132 156 L112 156 C 108 166 104 178 98 188 C 94 194 86 192 86 186 Z');
      return A === 'up' ? { back: arms + body, tf: [1, -30, 0, 0.9] } : { back: body, tf: [1, -30, 0, 0.9], front: arms };
    },
    // 横向きにすわる（顔だけこっち）
    side: () => ({
      back: tail('M186 186 C 212 186 224 166 214 146', '186px 186px') +
        sh('M74 187 C 66 158 78 124 98 110 L134 110 C 174 116 202 150 196 187 Z') + ln('M150 187 C 148 164 164 150 186 156') +
        '<path class="b" d="M84 188 C 82 178 98 176 100 188 M102 188 C 102 178 117 178 117 188"/>',
      tf: [-24, -2, 0, 0.88],
    }),
    // 丸くなって寝る
    curl: () => ({
      back: sh('M42 176 C 32 140 80 116 132 118 C 190 120 214 150 202 178 C 192 194 58 196 42 176 Z') + ln('M150 128 C 176 134 190 152 186 170'),
      front: tail('M198 170 C 182 194 120 196 86 186', '198px 170px') + paw(110, 168, 12, 6),
      tf: [-44, 46, -22, 0.74], sleeping: true, neck: null,
    }),
    // 横になってくつろぐ
    lie: () => ({
      back: tail('M200 150 C 222 140 232 120 226 104', '200px 150px') +
        sh('M186 168 C 206 166 222 172 232 178 C 236 187 226 191 218 187 L188 184 Z') +
        sh('M58 160 C 70 138 120 128 168 132 C 204 136 214 178 196 186 L70 188 C 52 184 50 172 58 160 Z') + ln('M150 186 C 150 168 168 160 190 166'),
      front: paw(40, 182, 13, 6) + paw(58, 190, 13, 6),
      tf: [-54, 44, -14, 0.74],
    }),
    // 何かから、顔だけ出す
    peek: () => ({ back: '', tf: [0, 38, 0, 1], neck: null }),
    // 歩く（横向き）
    walk: () => ({
      back: tail('M186 104 C 206 96 212 66 196 48 C 192 42 186 42 184 48', '186px 104px') +
        sh('M90 108 C 104 94 160 88 184 96 C 198 104 200 124 190 134 L196 158 C 198 166 186 168 184 160 L174 140 C 164 142 152 142 144 141 L140 162 C 140 170 128 170 128 162 L128 140 L116 138 L104 156 C 100 164 90 160 94 154 L100 134 C 90 128 84 116 90 108 Z'),
      tf: [-16, 4, -4, 0.86],
    }),
    // おっさん座り（足を前に投げだす）
    lean: (o) => ({
      back: tail('M160 182 C 196 188 208 164 198 140', '160px 182px') +
        sh('M78 186 C 66 160 72 126 98 116 L144 116 C 170 126 176 160 164 186 Z') + ln('M104 156 Q121 166 138 156'),
      front: sh('M88 186 C 66 192 50 184 56 172 C 62 164 80 168 96 178 Z') + sh('M154 186 C 176 192 192 184 186 172 C 180 164 162 168 146 178 Z') +
        arm(96, 128, 86, 160) + arm(146, 128, ...(o.rarm || [156, 160])),
      tf: [0, -4, 0, 0.92],
    }),
    // 狩りのかまえ（おしりを上げる）
    crouch: () => ({
      back: tail('M190 130 C 212 112 214 88 200 78', '190px 130px') +
        sh('M54 186 C 58 166 88 158 112 154 C 140 138 170 118 190 126 C 206 134 202 160 194 186 C 192 192 182 192 182 186 L178 168 C 160 178 140 184 118 188 Z'),
      front: paw(54, 189, 12, 6) + paw(84, 190, 12, 6),
      tf: [-46, 56, 0, 0.74],
    }),
    // 鉄棒にぶらさがる
    hang: () => ({
      back: ln('M30 16 L210 16', true) + ln('M40 16 L40 0 M200 16 L200 0') + arm(90, 104, 92, 18, 13) + arm(152, 104, 150, 18, 13) +
        tail('M146 176 C 168 184 172 194 162 198', '146px 176px') +
        sh('M88 100 C 80 130 84 166 98 182 L144 182 C 158 166 162 130 154 100 Z') + paw(104, 186, 9, 6) + paw(138, 186, 9, 6),
      tf: [0, -6, 0, 0.82],
    }),
    // 大の字
    sprawl: () => ({
      back: arm(98, 116, 58, 84) + arm(144, 116, 184, 84) + arm(104, 172, 72, 192) + arm(138, 172, 170, 192) +
        tail('M150 180 C 178 196 206 190 218 176', '150px 180px') +
        sh('M88 102 C 72 130 76 170 98 184 L144 184 C 166 170 170 130 154 102 Z') + ln('M104 150 Q121 158 138 150'),
      tf: [0, -12, 0, 0.84],
    }),
    // 顔のアップ
    close: () => ({ back: sh('M22 200 C 28 166 74 150 121 150 C 168 150 214 166 220 200 Z'), tf: [0, 14, 0, 1.3], neck: null }),
  };

  // 組み立て：under（いちばん奥）→ 体 → mid → 頭（hp は頭といっしょに動く小物）→ held → 前足 → over
  function mk(body, face, o = {}) {
    const b = B[body](o);
    const [tx, ty, rot, s] = o.tf || b.tf;
    const svg = (o.under || '') + (b.back || '') + (o.mid || '') +
      `<g transform="${headTf(tx, ty, rot, s)}">${HEAD}${faceOf(face)}${o.hp || ''}</g>` + (o.held || '') + (o.noFront ? '' : b.front || '') + (o.over || '');
    const h = at(121, o.hatY || 56, tx, ty, rot, s);
    const n = at(121, 124, tx, ty, rot, s);
    const neck = o.neck !== undefined ? o.neck : b.neck !== undefined ? b.neck : { x: n.x, y: n.y, w: Math.round(74 * s) };
    const p = { svg, head: { ...h, r: rot }, neck };
    if (o.sleeping || (b.sleeping && o.sleeping !== false)) p.sleeping = true;
    return p;
  }

  // ポーズ全体を、ずらして小さくする（下に台を置くときなど）
  function shrink(p, tx, ty, s, under = '') {
    const m = (q) => ({ x: +(tx + q.x * s).toFixed(1), y: +(ty + q.y * s).toFixed(1) });
    const r = { ...p, svg: under + `<g transform="translate(${tx} ${ty}) scale(${s})">${p.svg}</g>`, head: { ...m(p.head), r: p.head.r } };
    r.neck = p.neck ? { ...m(p.neck), w: Math.round(p.neck.w * s) } : null;
    return r;
  }
  // ---- 小物（原点まわりに描いて g() で置く） ----
  const steam = (x, y) => ln(`M${x - 4} ${y} q-4 -7 1 -13 M${x + 5} ${y - 2} q-4 -7 1 -13`);
  const MUG = (k = 'prop-pink') => sh('M-12 -14 L-10 12 Q0 17 10 12 L12 -14 Z', k) + ln('M12 -8 C 21 -8 21 6 11 5') + steam(0, -20);
  const BOOK = (k = 'blue') => sh('M-32 -16 L0 -10 L32 -16 L30 14 L0 20 L-30 14 Z', k) + ln('M0 -10 L0 20 M-24 -6 L-8 -3 M-24 0 L-12 2');
  const OPENBOOK = sh('M-30 -2 Q-15 -9 0 -2 Q15 -9 30 -2 L30 9 Q15 2 0 9 Q-15 2 -30 9 Z') + ln('M0 -2 L0 9 M-24 0 L-6 2 M6 2 L24 0 M-24 4 L-6 6 M6 6 L24 4');
  const BLANKET = (k = 'blue') => sh('M64 190 C 50 160 62 126 98 118 L144 118 C 180 126 192 160 178 190 Z', k) + ln('M86 124 Q121 140 156 124 M96 150 L92 188 M146 150 L150 188 M70 166 Q121 178 172 166');
  const FUTON = sh('M12 166 C 60 154 182 154 230 166 L232 198 L10 198 Z', 'blue') + ln('M14 176 Q121 162 228 176') + dot(50, 180, 2) + dot(90, 176, 2) + dot(150, 176, 2) + dot(190, 180, 2) + dot(120, 188, 2);
  const UMBRELLA = (k = 'prop-purple', len = 96) => sh('M-54 0 Q-48 -38 0 -42 Q48 -38 54 0 Q41 -8 27 0 Q14 -8 0 0 Q-14 -8 -27 0 Q-41 -8 -54 0 Z', k) +
    ln('M0 -42 L-27 0 M0 -42 L27 0 M0 -42 L0 -48') + ln(`M0 -1 L0 ${len} q0 8 -7 8 q-6 0 -6 -6`, true);
  const BOXF = (w, h) => sh(`M${-w / 2 - 2} 0 L${-w / 2 - 18} -14 L${-w / 2 - 12} -20 L${-w / 2 + 4} -6 Z M${w / 2 + 2} 0 L${w / 2 + 18} -14 L${w / 2 + 12} -20 L${w / 2 - 4} -6 Z`, 'prop-straw') +
    sh(`M${-w / 2} 0 L${w / 2} 0 L${w / 2 - 4} ${h} L${-w / 2 + 4} ${h} Z`, 'prop-straw') + ln(`M-18 ${h / 2} L18 ${h / 2}`);
  const POT = sh('M-16 0 L16 0 L12 26 L-12 26 Z', 'brown') + ln('M0 0 C -2 -14 2 -26 0 -34') +
    sh('M0 -12 C -14 -22 -22 -12 -16 -6 C -10 -4 -4 -8 0 -12 Z', 'green') + sh('M0 -18 C 12 -28 22 -20 16 -12 C 10 -10 4 -14 0 -18 Z', 'green') +
    ov(-6, -40, 6, 6, 'prop-pink') + ov(6, -40, 6, 6, 'prop-pink') + ov(0, -48, 6, 6, 'prop-pink') + ov(0, -38, 6, 5, 'prop-pink') + ov(0, -42, 3.5, 3.5, 'yellow');
  const FLOWER = ln('M0 0 C 2 10 -2 22 0 34') + sh('M0 22 C 8 14 16 20 10 26 C 6 28 2 26 0 22 Z', 'green') +
    ov(-5, -3, 5, 5, 'prop-pink') + ov(5, -3, 5, 5, 'prop-pink') + ov(0, -9, 5, 5, 'prop-pink') + ov(0, 2, 5, 4, 'prop-pink') + ov(0, -3, 3, 3, 'yellow');
  const FISH = (k = 'blue') => sh('M-16 0 Q-4 -9 9 -2 L17 -9 L17 9 L9 2 Q-4 9 -16 0 Z', k) + dot(-9, -1.5, 1.4) + ln('M-3 -4 Q-1 0 -3 4');
  const YARN = ov(0, 0, 13, 13, 'prop-pink') + ln('M-10 -6 Q0 -2 6 -11 M-12 2 Q2 4 10 -7 M-8 9 Q4 6 12 2');
  const CUSHION = (w, k = 'prop-purple') => sh(`M${-w / 2} -6 Q0 -14 ${w / 2} -6 Q${w / 2 + 6} 4 ${w / 2} 12 Q0 18 ${-w / 2} 12 Q${-w / 2 - 6} 4 ${-w / 2} -6 Z`, k) +
    ln(`M${-w / 2} -6 l-5 -4 M${w / 2} -6 l5 -4 M${-w / 2} 12 l-5 4 M${w / 2} 12 l5 4`);
  const TOAST = sh('M-14 -10 Q-16 -18 -8 -18 Q0 -22 8 -18 Q16 -18 14 -10 L13 12 L-13 12 Z', 'prop-straw') + sh('M-9 -8 Q0 -12 9 -8 L9 8 L-9 8 Z', 'yellow');
  const ONIGIRI = sh('M0 -16 Q4 -16 16 6 Q18 12 12 12 L-12 12 Q-18 12 -16 6 Q-4 -16 0 -16 Z') + sh('M-7 2 L7 2 L7 12 L-7 12 Z', 'dark');
  const LEAF = (k = 'green') => sh('M0 0 C -6 -10 4 -20 14 -18 C 14 -8 8 0 0 0 Z', k) + ln('M0 0 L10 -14');
  const BUTTERFLY = sh('M0 0 C -10 -14 -18 -6 -12 2 C -16 8 -8 12 0 2 Z', 'yellow') + sh('M0 0 C 10 -14 18 -6 12 2 C 16 8 8 12 0 2 Z', 'prop-pink') + ln('M0 -3 L0 6 M0 -3 q-2 -6 -6 -8 M0 -3 q2 -6 6 -8');
  const BIRD = ov(0, 0, 11, 9, 'blue') + sh('M10 -4 L17 -1 L10 2 Z', 'yellow') + dot(5, -3, 1.3) + ln('M-6 0 Q-2 4 3 2 M-10 -2 L-17 -6 M-10 1 L-17 2 M-2 9 L-3 13 M3 9 L3 13');
  const MOON = sh('M0 -18 C 14 -16 20 6 6 16 C -4 22 -16 16 -18 8 C -6 12 6 4 6 -4 C 6 -10 4 -15 0 -18 Z', 'yellow');
  const LAPTOP = sh('M-30 -30 L30 -30 L28 4 L-28 4 Z', 'gray') + sh('M-38 4 L38 4 L42 12 L-42 12 Z', 'gray') + ov(0, -14, 4, 4);
  const PHONE = sh('M-8 -13 Q-8 -15 -6 -15 L6 -15 Q8 -15 8 -13 L8 13 Q8 15 6 15 L-6 15 Q-8 15 -8 13 Z', 'gray') + dot(0, 11, 1.2);
  const NOTE = sh('M-26 -10 L22 -12 L26 10 L-22 12 Z') + ln('M-18 -4 L14 -5 M-17 2 L16 1');
  const PENCIL = sh('M0 0 L28 -14 L32 -7 L4 7 Z', 'yellow') + sh('M0 0 L-6 6 L4 7 Z') + ln('M28 -14 L32 -7');
  const PLANE = sh('M0 0 L34 -10 L12 4 Z') + sh('M12 4 L34 -10 L16 11 Z') + ln('M-12 4 l-10 2 M-8 10 l-8 2');
  const BALLOON = (k = 'prop-red', L = 60) => ov(0, 0, 16, 19, k) + sh('M-3 18 L3 18 L0 22 Z', k) + ln(`M0 22 C -6 ${22 + L * 0.3} 6 ${22 + L * 0.6} 0 ${22 + L}`) + ln('M-8 -8 q2 -5 6 -6');
  const UCHIWA = ov(0, -18, 18, 17, 'blue') + ln('M0 -1 L0 22', true) + ln('M0 -18 L-11 -31 M0 -18 L11 -31 M0 -18 L-17 -14 M0 -18 L17 -14 M0 -18 L0 -35');
  const FLAG = ln('M0 0 L0 -64', true) + sh('M0 -64 L34 -54 L0 -44 Z', 'prop-red');
  const SIGN = sh('M-30 -52 L30 -52 L30 -16 L-30 -16 Z', 'yellow') + ln('M0 -16 L0 20', true) + dot(-10, -34, 2.2) + dot(0, -34, 2.2) + dot(10, -34, 2.2);
  const BALL = (r = 12, k = 'prop-red') => ov(0, 0, r, r, k) + ln(`M${-r} 0 Q0 ${r * 0.6} ${r} 0 M0 ${-r} Q${r * 0.5} 0 0 ${r}`);
  const BROOM = ln('M0 -70 L0 20', true) + sh('M-12 20 L12 20 L20 50 L-20 50 Z', 'prop-straw') + ln('M-8 26 L-12 48 M0 26 L0 48 M8 26 L12 48');
  const CAN = sh('M14 4 L38 -12 L41 -8 L16 10 Z', 'blue') + sh('M-16 -14 L16 -14 L14 14 L-14 14 Z', 'blue') + ln('M-14 -14 Q0 -30 14 -14') + ln('M44 -4 l2 6 M49 -10 l4 5 M41 4 l1 6');
  const DANGO = ln('M0 -40 L0 30', true) + ov(0, -26, 9, 9, 'prop-pink') + ov(0, -8, 9, 9) + ov(0, 10, 9, 9, 'green');
  const ICE = sh('M-10 0 L10 0 L0 30 Z', 'prop-straw') + ln('M-6 6 L4 16 M6 6 L-3 16') + ov(0, -6, 12, 11, 'prop-pink');
  const MELON = sh('M-26 0 A26 26 0 0 0 26 0 Z', 'green') + sh('M-22 0 A22 22 0 0 0 22 0 Z', 'prop-red') + dot(-8, 8, 1.4) + dot(4, 12, 1.4) + dot(10, 5, 1.4);
  const MIKAN = ov(0, 0, 11, 10, 'orange') + sh('M0 -10 C 2 -16 8 -16 10 -14 C 8 -10 4 -9 0 -10 Z', 'green');
  const ALARM = ov(-11, -14, 6, 5, 'prop-red', -30) + ov(11, -14, 6, 5, 'prop-red', 30) + ov(0, 0, 15, 15, 'prop-red') + ov(0, 0, 10, 10) +
    ln('M0 0 L0 -6 M0 0 L5 2 M-9 13 L-12 18 M9 13 L12 18 M-22 -18 l-5 -3 M22 -18 l5 -3 M-24 -8 l-6 0 M24 -8 l6 0');
  const CANDLE = '<circle class="w-apricot" cx="0" cy="-30" r="16"/>' + ov(0, 20, 16, 4, 'gray') + sh('M-7 -20 L7 -20 L7 20 L-7 20 Z') +
    sh('M0 -40 Q7 -30 0 -24 Q-7 -30 0 -40 Z', 'yellow') + ln('M0 -24 L0 -20');
  const LANTERN = '<circle class="w-apricot" cx="0" cy="0" r="26"/>' + ln('M0 -40 L0 -26') + ov(0, 0, 16, 24, 'prop-red') + sh('M-9 -27 L9 -27 L9 -21 L-9 -21 Z', 'dark') + sh('M-9 21 L9 21 L9 27 L-9 27 Z', 'dark') +
    ln('M-15 -8 Q0 -5 15 -8 M-16 2 Q0 5 16 2 M-14 12 Q0 15 14 12');
  const TERU = ln('M0 -40 L0 -16') + sh('M-8 2 L-18 22 Q0 26 18 22 L8 2 Z') + ov(0, -6, 10, 10) + dot(-4, -7, 1.3) + dot(4, -7, 1.3) + ln('M-3 -2 Q0 1 3 -2');
  const NOODLE = sh('M-16 -16 L16 -16 L12 18 L-12 18 Z') + ln('M-15 -6 L15 -6 M-14 2 L14 2') + sh('M-18 -20 L18 -20 L18 -15 L-18 -15 Z', 'yellow') +
    ln('M-20 -26 L24 -20 M-20 -30 L24 -24') + steam(0, -32);
  const LETTER = sh('M-18 -12 L18 -12 L18 12 L-18 12 Z') + ln('M-18 -12 L0 2 L18 -12') + '<path class="heart-ink" d="M0 4 c-2 -3 -6 -1 -4 2 l4 3 l4 -3 c2 -3 -2 -5 -4 -2 Z"/>';
  const CAMERA = sh('M-8 -12 L-4 -18 L6 -18 L10 -12 Z', 'gray') + sh('M-18 -12 L18 -12 L18 14 L-18 14 Z', 'gray') + ov(0, 1, 9, 9) + ov(0, 1, 5, 5, 'dark');
  const DUMBBELL = ln('M-34 0 L34 0', true) + sh('M-36 -11 L-26 -11 L-26 11 L-36 11 Z', 'dark') + sh('M26 -11 L36 -11 L36 11 L26 11 Z', 'dark');
  const HEART = (s = 1) => g(0, 0, '<path class="heart-ink" d="M0 -4 c-4 -6 -12 -2 -8 4 l8 7 l8 -7 c4 -6 -4 -10 -8 -4 Z"/>', 0, s);
  const NOTES = ln('M0 0 L0 -16 L8 -13 L8 -2') + '<ellipse class="ink-fill" cx="-3" cy="0" rx="4" ry="3"/><ellipse class="ink-fill" cx="5" cy="-2" rx="4" ry="3"/>';
  const NOTE1 = ln('M0 0 L0 -14 q4 2 6 6') + '<ellipse class="ink-fill" cx="-3" cy="0" rx="4" ry="3"/>';
  const BUBBLE = (r) => `<circle class="l thin" cx="0" cy="0" r="${r}"/>` + ln(`M${-r * 0.5} ${-r * 0.2} q${r * 0.1} ${-r * 0.35} ${r * 0.4} ${-r * 0.45}`);
  const SPARK = (r = 6) => ln(`M0 ${-r} L0 ${r} M${-r} 0 L${r} 0 M${-r * 0.5} ${-r * 0.5} L${r * 0.5} ${r * 0.5} M${-r * 0.5} ${r * 0.5} L${r * 0.5} ${-r * 0.5}`);
  const WINDOW = sh('M44 16 L196 16 L196 150 L44 150 Z', 'blue') + ln('M120 16 L120 150 M44 82 L196 82', true);
  const UKULELE = sh('M-24 0 C -24 -14 -8 -14 -2 -8 C 4 -12 14 -10 14 0 C 14 10 4 12 -2 8 C -8 14 -24 14 -24 0 Z', 'prop-straw') + sh('M14 -3 L50 -3 L50 3 L14 3 Z', 'brown') + ov(-6, 0, 4, 4, 'dark') + ln('M-20 0 L50 0');
  const SHOPBAG = sh('M2 -16 L10 -44 L15 -42 L8 -16 Z', 'green') + ln('M-8 -16 Q0 -30 8 -16') + sh('M-16 -16 L16 -16 L18 18 L-18 18 Z', 'prop-straw');
  const BENTO = sh('M-4 -8 L-14 -20 L-2 -14 Z M4 -8 L14 -20 L2 -14 Z', 'blue') + sh('M-28 -8 L28 -8 L28 12 L-28 12 Z', 'blue') + ln('M-28 -8 L28 12 M28 -8 L-28 12');
  const CRANE = sh('M-20 0 L0 -6 L20 -22 L8 0 L0 8 Z', 'prop-pink') + ln('M0 -6 L0 8 M-20 0 L-26 -8');
  const CACTUS = sh('M-14 0 L14 0 L10 22 L-10 22 Z', 'brown') + sh('M10 -16 Q18 -16 18 -24 Q22 -26 22 -18 Q22 -10 8 -10 Z', 'green') +
    sh('M-7 0 L-7 -30 Q0 -40 7 -30 L7 0 Z', 'green') + ln('M-7 -20 l-4 -2 M7 -14 l4 -1 M-7 -8 l-4 1 M0 -36 l0 -4') + ov(0, -38, 4, 3, 'prop-pink');
  const NEEDLES = ln('M-26 -20 L10 8 M26 -20 L-10 8', true) + dot(-26, -20, 2.4) + dot(26, -20, 2.4);
  const TELESCOPE = ln('M0 6 L-14 40 M0 6 L14 40 M0 6 L0 40') + sh('M-30 0 L24 -20 L28 -10 L-26 10 Z', 'blue') + sh('M24 -20 L32 -24 L36 -12 L28 -10 Z', 'blue');
  const GRASS = ln('M0 0 q-2 -10 -6 -14 M0 0 q0 -12 2 -18 M0 0 q4 -8 10 -12');
  const PUDDLE = ov(0, 0, 32, 6, 'blue') + ln('M-10 0 q10 -4 20 0');
  const BOOKS = sh('M-34 0 L34 0 L34 12 L-34 12 Z', 'prop-red') + sh('M-30 12 L30 12 L30 24 L-30 24 Z', 'blue') + sh('M-36 24 L36 24 L36 36 L-36 36 Z', 'yellow');
  const REMOTE = sh('M-5 -14 L5 -14 L5 14 L-5 14 Z', 'gray') + dot(0, -8, 1.6) + dot(0, -1, 1.2) + dot(0, 5, 1.2);
  const TUB = sh('M18 162 L222 162 L214 198 L26 198 Z', 'brown') + ov(120, 162, 102, 8, 'blue') + ln('M40 178 L200 178 M44 190 L196 190');
  const BASKET = sh('M-56 0 L56 0 L46 46 L-46 46 Z', 'prop-straw') + ln('M-40 0 L-30 46 M-14 0 L-10 46 M14 0 L10 46 M40 0 L30 46 M-52 16 L52 16 M-48 32 L48 32');
  const PILLOW = (w = 92) => sh(`M${-w / 2} -12 Q0 -18 ${w / 2} -12 Q${w / 2 + 6} 0 ${w / 2} 12 Q0 18 ${-w / 2} 12 Q${-w / 2 - 6} 0 ${-w / 2} -12 Z`);
  const KOTATSU = sh('M18 104 L224 104 L220 116 L22 116 Z', 'brown') + sh('M26 116 L216 116 C 222 140 228 170 232 198 L10 198 C 14 170 20 140 26 116 Z', 'prop-red') +
    ln('M40 140 L202 140 M30 170 L212 170') + g(190, 94, MIKAN) + g(170, 96, MIKAN);
  const TEA = sh('M-16 -16 L-12 16 Q0 24 12 16 L16 -16 Z') + ln('M-16 -10 Q0 -4 16 -10') + steam(0, -22);
  const BAG2 = sh('M-28 -26 L28 -26 L32 26 L-32 26 Z', 'prop-straw') + ln('M-28 -26 L-20 -18 L20 -18 L28 -26');
  const MUSIC = g(190, 60, NOTES) + g(206, 92, NOTE1) + g(40, 70, NOTE1);
  const RAIN = ln('M30 30 l-4 10 M60 60 l-4 10 M200 30 l-4 10 M216 80 l-4 10 M20 100 l-4 10 M190 120 l-4 10 M40 150 l-4 10');
  const STARS = star(40, 40) + star(200, 30, 6) + star(30, 110, 3) + star(214, 96, 4) + '<circle class="l thin" cx="62" cy="20" r="2.5"/>';
  const ZZ = (x, y) => zzz(x, y);
  const SWEAT = drop(168, 62);
  const MOTION = (x, y) => ln(`M${x} ${y} q-6 -4 -12 0 M${x + 2} ${y + 10} q-6 -4 -12 0`);
  // 頭にのせる・顔につける小物（頭の座標で描く）
  const H = {
    glasses: '<circle class="l thin" cx="100" cy="88" r="12"/><circle class="l thin" cx="142" cy="88" r="12"/>' + ln('M112 87 Q121 82 130 87 M88 85 L72 80 M154 85 L170 80'),
    sun: '<path class="ink-fill" d="M85 80 L115 80 Q115 99 100 99 Q85 99 85 80 Z M127 80 L157 80 Q157 99 142 99 Q127 99 127 80 Z"/>' + ln('M115 83 Q121 79 127 83 M85 82 L72 78 M157 82 L170 78') +
      '<path class="shine" d="M89 84 L96 84 L93 89 Z M131 84 L138 84 L135 89 Z"/>',
    crown: sh('M104 52 L102 30 L112 40 L121 26 L130 40 L140 30 L138 52 Z', 'yellow') + dot(121, 44, 2) + dot(108, 46, 1.6) + dot(134, 46, 1.6),
    ribbon: sh('M148 52 L134 42 L136 60 Z', 'prop-pink') + sh('M148 52 L162 42 L160 60 Z', 'prop-pink') + ov(148, 52, 4, 4, 'prop-pink'),
    phones: ln('M74 90 C 64 26 178 26 168 90', true) + ov(72, 96, 8, 13, 'prop-red') + ov(170, 96, 8, 13, 'prop-red'),
    beret: sh('M86 60 C 84 38 156 36 158 58 Q122 66 86 60 Z', 'prop-red') + ln('M121 42 l2 -7'),
    mikan: g(121, 42, MIKAN),
    leaf: g(112, 52, LEAF(), -10),
    towel: sh('M98 52 L144 52 L140 40 L102 40 Z') + ln('M100 46 L142 46'),
    cap: sh('M84 62 C 80 30 118 18 140 30 C 154 38 160 48 160 62 Q121 54 84 62 Z', 'blue') + sh('M84 62 Q121 54 160 62 L160 54 Q121 46 84 54 Z') + ov(150, 28, 7, 7) + dot(110, 40, 1.6) + dot(130, 44, 1.6),
    mask: sh('M78 78 Q100 72 121 80 Q142 72 164 78 L164 96 Q142 90 121 98 Q100 90 78 96 Z', 'prop-purple') + ln('M78 84 L70 82 M164 84 L172 82'),
    bedhair: ln('M114 52 q-8 -10 -2 -20 M124 52 q6 -10 16 -10 M119 52 q0 -10 3 -14'),
    sweat: SWEAT,
    fish: g(132, 118, FISH(), 10),
    toast: g(124, 122, TOAST, 6, 0.9),
    flower: g(130, 116, FLOWER, -60, 0.8),
    leafMouth: g(126, 114, LEAF(), 20),
    dango: g(140, 122, DANGO, 35, 0.8),
    bubble: g(140, 60, BUBBLE(7)) + g(158, 40, BUBBLE(4)),
  };

  // ---- 組み合わせたポーズ ----
  const L = {}; // 見本帳用のひとこと説明
  const SAY = {}; // なでたときのセリフが無いとき、似たポーズのセリフを使う
  const add = (name, ja, pose, say) => { P[name] = pose; L[name] = ja; if (say) SAY[name] = say; };
  const sit = (face, o) => mk('sit', face, o);
  const hold = (face, o) => mk('hold', face, o);

  // ===== なでたとき向け（にぎやか・おかしい） =====
  add('banzai', 'バンザイ', mk('stand2', 'happy', { arms: 'up', over: g(56, 40, SPARK(5)) + g(190, 40, SPARK(5)) }), 'upright');
  add('wave', '手をふる', sit('happy', { over: arm(146, 130, 172, 84) + ln('M188 72 q8 6 4 16 M196 64 q12 10 6 24') }), 'maneki');
  add('doya', 'ドヤ顔', mk('tall', 'doya', { tf: [0, -16, -6, 0.84], over: g(178, 40, SPARK(7)) + g(198, 66, SPARK(4)) }), 'sideeye');
  add('jito', 'ジト目', sit('jito'), 'stare');
  add('komari', '困り顔', sit('komari', { hp: H.sweat }), 'hide');
  add('kira', 'キラキラの目', hold('kira', { paws: [112, 146, 130, 146], over: g(48, 60, SPARK(6)) + g(194, 52, SPARK(7)) + g(206, 90, SPARK(4)) }), 'blink');
  add('wink', 'ウインク', sit('wink', { over: g(190, 56, SPARK(6)) }), 'blink');
  add('nyaa', 'にゃーと鳴く', sit('nyaa', { tf: [0, 0, -6, 1], over: ln('M178 96 l14 -4 M180 108 l16 2 M176 120 l12 8') }), 'upright');
  add('uruuru', 'うるうる', mk('loaf', 'tear'), 'hide');
  add('punch', 'ねこパンチ', sit('squint', { over: arm(146, 132, 196, 126) + ln('M206 112 l10 -6 M210 126 l12 0 M206 140 l10 6') }), 'sideeye');
  add('hunt', '狩りのかまえ', mk('crouch', 'round', { over: ln('M210 70 l6 -6 M218 84 l8 -2') }), 'stare');
  add('yarn', '毛糸玉であそぶ', mk('belly', 'happy', { held: g(130, 92, YARN) + ln('M118 100 C 100 110 104 126 90 128 C 80 130 86 146 74 150') }), 'roll');
  add('ballchase', 'ボールを追う', mk('crouch', 'kira', { under: g(22, 182, BALL(9)) + ln('M38 172 l6 -3 M38 182 l7 0') }), 'freeze');
  add('butterfly', 'ちょうちょを見つめる', sit('up', { over: g(150, 22, BUTTERFLY) + ln('M174 12 q8 6 14 0 q6 -6 14 0', false) }), 'cosmos');
  add('birdfriend', '小鳥と見つめあう', sit('dot', { over: g(48, 150, BIRD) }), 'stare');
  add('balloon', '風船をもつ', mk('stand2', 'kira', { arms: [100, 132, 166, 98], under: g(198, 18, BALLOON('prop-red', 60), 20) }), 'upright');
  add('crown', '王冠でドヤ', sit('doya', { hp: H.crown, hatY: 30, over: g(186, 40, SPARK(6)) }), 'sideeye');
  add('shades', 'サングラス', sit('open', { hp: H.sun }), 'stare');
  add('megane', 'メガネをくいっ', sit('side', { hp: H.glasses, over: arm(146, 132, 150, 96, 13) + g(186, 70, SPARK(5)) }), 'sideeye');
  add('flag', '旗をふる', mk('stand2', 'happy', { arms: [96, 132, 168, 82], under: g(170, 98, FLAG, 14) + ln('M210 40 q6 6 2 14') }), 'maneki');
  add('sign', '看板「…」', mk('stand2', 'dot', { arms: [110, 150, 134, 150], held: g(122, 172, SIGN) }), 'stare');
  add('fishmouth', '魚をくわえて逃げる', mk('walk', 'side', { hp: H.fish, over: MOTION(232, 120) }), 'sideeye');
  add('muscle', '筋トレ', hold('squint', { paws: [106, 146, 136, 146], held: g(121, 146, DUMBBELL, 0, 0.9), hp: H.sweat }), 'plank');
  add('hang', '鉄棒にぶらさがる', mk('hang', 'komari'), 'plank');
  add('music', '音楽をきく', sit('closed', { hp: H.phones, over: MUSIC }), 'blink');
  add('boxpeek', '箱から顔だけ', mk('peek', 'open', { over: g(121, 150, BOXF(150, 46)) + paw(96, 150, 10, 6) + paw(146, 150, 10, 6) }), 'hide');
  add('plane', '紙ひこうきを見送る', sit('up', { tf: [0, 0, -8, 1], over: g(170, 30, PLANE, -14) }), 'cosmos');
  add('bubbles', 'シャボン玉', sit('round', { over: g(46, 54, BUBBLE(12)) + g(190, 36, BUBBLE(9)) + g(204, 92, BUBBLE(6)) + g(30, 110, BUBBLE(5)) }), 'cosmos');
  add('heart', 'ハートをどうぞ', hold('happy', { paws: [110, 146, 132, 146], held: g(121, 146, HEART(2.6)) }), 'blink');
  add('daiji', '大の字', mk('sprawl', 'happy'), 'roll');
  add('wiggle', 'へそ天でくねくね', mk('belly', 'wink', { over: ln('M100 80 q-6 -4 -12 0 M196 104 q6 -4 12 0 M200 116 q6 -4 12 0') }), 'roll');
  add('closeup', '顔が近い', mk('close', 'round'), 'stare');
  add('closejito', '至近距離のジト目', mk('close', 'jito'), 'sideeye');
  add('tiltkomari', '首をかしげて困る', sit('komari', { tf: [-4, 4, -18, 1], hp: H.sweat }), 'tilt');
  add('peekwall', '柱のかげから', { svg: `<g transform="${headTf(56, 30, 18, 1)}">${HEAD}${faceOf('side')}</g>` + sh('M196 4 L230 4 L230 198 L196 198 Z', 'brown') + ln('M204 40 L222 40 M204 120 L222 120') + paw(196, 150, 7, 10), head: { ...at(121, 56, 56, 30, 18, 1), r: 18 }, neck: null }, 'hide');
  add('camera', 'カメラでパシャ', hold('wink', { paws: [100, 120, 142, 120], held: g(100, 106, CAMERA, 0, 1.1), tf: [0, -4, 0, 0.96], over: g(70, 78, SPARK(7)) }), 'freeze');
  add('gaan', 'ガーン', mk('tall', 'shock', { over: ln('M60 60 L60 76 M184 56 L184 74') }), 'freeze');
  add('tere', 'てれる', sit('tere', { over: arm(98, 132, 86, 108, 13) + arm(144, 132, 156, 108, 13) }), 'hide');
  add('ribbon', 'リボンでおめかし', sit('wink', { hp: H.ribbon, hatY: 52 }), 'blink');
  add('dango', 'お団子をほおばる', hold('mogu', { paws: [136, 140, 146, 136], held: g(146, 120, DANGO, 20, 0.9) }), 'groom');
  add('icecream', 'アイスをなめる', hold('nyaa', { paws: [114, 150, 128, 150], held: g(121, 130, ICE) }), 'groom');
  add('mikanhead', '頭にみかん', sit('dot', { hp: H.mikan, hatY: 32 }), 'stare');
  add('leafhead', '頭に葉っぱ', sit('dot', { hp: H.leaf, over: g(40, 40, LEAF(), 30) }), 'cosmos');
  add('sneak', '抜き足さし足', mk('walk', 'jito', { tf: [-16, 10, 0, 0.86], over: ln('M30 190 q6 -4 12 0 M220 190 q6 -4 12 0') }), 'sideeye');
  add('think', '考えごと', sit('up', { tf: [0, 0, -6, 1], over: arm(146, 132, 136, 118, 13) + dot(176, 54, 2) + dot(186, 44, 2.6) + dot(198, 32, 3.2) }), 'tilt');
  add('salute', '敬礼', mk('stand2', 'open', { arms: [98, 132, 156, 42] }), 'bow');
  add('clap', '拍手', hold('happy', { paws: [116, 140, 126, 138], over: ln('M108 128 l-6 -6 M134 126 l6 -6 M121 122 l0 -6') }), 'blink');
  add('tinybox', '小さい箱に入る', sit('dot', { over: g(121, 156, BOXF(84, 36)) }), 'stare');
  add('pawshow', '肉球を見せる', sit('open', { over: arm(146, 132, 168, 112, 16) + '<ellipse class="tongue" cx="171" cy="112" rx="4" ry="3"/>' }), 'maneki');

  // ===== 時間帯ごと（ふだん） =====
  // 明け方・深夜
  add('eyemask', 'アイマスクで寝る', mk('loaf', 'closed', { hp: H.mask, sleeping: true }));
  add('nightcap', 'ナイトキャップで寝る', mk('lie', 'closed', { hp: H.cap, hatY: 36, sleeping: true, over: ZZ(40, 80) }));
  add('bedhair', '寝ぐせ', sit('half', { hp: H.bedhair }));
  add('alarm', '目ざましを止める', mk('flat', 'closed', { noFront: true, under: g(30, 176, ALARM), over: arm(70, 176, 34, 160, 12) + paw(84, 189, 13, 6), sleeping: true }));
  add('futon', '布団から顔だけ', mk('peek', 'closed', { tf: [0, 42, 0, 0.92], under: g(121, 160, PILLOW(120)), over: FUTON, sleeping: true }));
  add('curl', '丸くなって寝る', mk('curl', 'closed'));
  add('curlblanket', '毛布で丸くなる', mk('curl', 'closed', { over: sh('M100 160 C 130 140 200 138 214 170 C 220 190 200 196 170 196 L110 196 C 96 190 94 172 100 160 Z', 'prop-pink') + ln('M130 150 L120 194 M170 146 L166 196') }));
  add('dawnwindow', '窓辺で朝を待つ', { svg: WINDOW + P.back.svg, head: P.back.head, neck: P.back.neck });
  add('sleepsit', 'すわったまま、うとうと', sit('closed', { tf: [0, 10, 12, 0.98], over: ZZ(170, 50), sleeping: true }));
  add('bellynap', 'へそ天で寝る', mk('belly', 'closed', { over: ZZ(30, 90), sleeping: true }));
  add('daijisleep', '大の字で寝る', mk('sprawl', 'closed', { over: ZZ(170, 40), sleeping: true }));
  add('flatsleep', 'のびのび寝る', mk('flat', 'closed', { sleeping: true, over: ZZ(110, 110) }));
  add('pillowhug', 'まくらを抱いて寝る', mk('lie', 'closed', { noFront: true, held: g(66, 180, PILLOW(70)), over: paw(48, 178, 12, 6) + paw(96, 180, 12, 6), sleeping: true }));
  add('midnight', '夜中に一点を見つめる', sit('round', { over: '<circle class="l thin" cx="200" cy="40" r="2"/>' }));
  add('stareloaf', '香箱でこっちを見る', mk('loaf', 'open'));
  add('halfloaf', '香箱でうとうと', mk('loaf', 'half'));
  // 朝
  add('coffee', 'コーヒーで目をさます', hold('half', { paws: [110, 134, 134, 140], held: g(122, 132, MUG()) }));
  add('toast', 'トーストをくわえて', mk('walk', 'open', { hp: H.toast, over: MOTION(232, 120) }));
  add('read', '読書', hold('half', { tf: [0, 2, 0, 0.96], paws: [96, 152, 146, 152], held: g(121, 150, BOOK()) }));
  add('phone', 'スマホを見る', hold('jito', { tf: [0, 2, 6, 0.96], paws: [114, 148, 130, 148], held: g(122, 140, PHONE) }));
  add('water', '水やり', mk('stand2', 'happy', { arms: [150, 120, 160, 120], under: g(210, 160, POT, 0, 0.9), held: g(156, 128, CAN, 0, 0.9) }));
  add('broom', 'ほうきでおそうじ', mk('stand2', 'closed', { arms: [144, 120, 150, 110], held: g(150, 128, BROOM, -18, 0.9) + ln('M180 186 q8 -4 16 0 M196 178 q6 -4 12 0') }));
  add('laptop', 'パソコンでおしごと', sit('half', { hp: H.glasses, over: g(121, 156, LAPTOP) }));
  add('diary', '日記を書く', mk('flat', 'half', { tf: [-56, 48, 6, 0.72], noFront: true, held: g(62, 184, NOTE) + paw(36, 188, 12, 6) + g(80, 182, PENCIL, -10) + paw(84, 186, 10, 6) }));
  add('letter', '手紙をとどける', mk('stand2', 'tere', { arms: [112, 124, 132, 124], held: g(122, 130, LETTER) }));
  add('newsglasses', 'メガネで新聞', { svg: P.newspaper.svg.replace('</g>\n      <path class="b" d="M60 124', H.glasses + '</g>\n      <path class="b" d="M60 124'), head: P.newspaper.head, neck: null });
  add('walk', 'おさんぽ', mk('walk', 'open'));
  add('shopping', 'おつかい', mk('walk', 'happy', { over: g(80, 146, SHOPBAG) }));
  add('teatime', 'お茶をひとくち', hold('closed', { paws: [104, 150, 138, 150], held: g(121, 148, TEA) }));
  // 昼
  add('sunflat', 'ひなたで伏せる', mk('flat', 'closed', { sleeping: true }));
  add('chin', '前足にあごをのせる', mk('flat', 'half', { chin: true }));
  add('cushion', '座布団で香箱', mk('loaf', 'closed', { under: g(121, 186, CUSHION(140)), sleeping: true }));
  add('flowerpot', '植木鉢のとなり', sit('happy', { under: g(32, 160, POT) }));
  add('smell', '花のにおいをかぐ', hold('closed', { paws: [112, 140, 120, 144], held: g(120, 108, FLOWER, 20, 0.9) }));
  add('umbrella', '傘をさす', sit('half', { tf: [-14, 6, 0, 0.92], under: g(170, 52, UMBRELLA('prop-purple', 70), 20), over: arm(144, 134, 146, 122, 13) + RAIN }));
  add('teruteru', 'てるてる坊主を見る', sit('up', { tf: [-10, 0, 0, 1], over: g(196, 60, TERU) }));
  add('fishing', '釣り', mk('side', 'half', { over: ln('M96 150 L220 30 L224 160', false) + ov(224, 160, 4, 6, 'prop-red') + arm(100, 130, 100, 150, 13) }));
  add('watermelon', 'スイカ', hold('mogu', { paws: [96, 144, 146, 144], held: g(121, 132, MELON, 0, 1.1) }));
  add('uchiwa', 'うちわであおぐ', sit('closed', { over: arm(146, 132, 160, 116, 13) + g(166, 110, UCHIWA, 20) + ln('M196 112 q6 -4 12 0 M194 122 q6 -4 12 0') }));
  add('basket', 'かごに入る', mk('peek', 'happy', { over: g(121, 150, BASKET) + paw(100, 152, 9, 6) + paw(142, 152, 9, 6) }));
  add('bento', 'お弁当', sit('kira', { over: g(121, 178, BENTO) }));
  add('sideways', '横向きにすわる', mk('side', 'open'));
  add('tallsit', '背すじをのばす', mk('tall', 'open'));
  add('lean', 'おっさん座り', mk('lean', 'half'));
  add('noodle', 'カップ麺を待つ', sit('dot', { over: g(121, 166, NOODLE) }));
  add('ballnap', 'ボールを抱いて昼寝', mk('lie', 'closed', { noFront: true, held: g(60, 176, BALL(14, 'blue')), over: paw(46, 166, 10, 6) + paw(76, 188, 12, 6), sleeping: true }));
  add('lieback', '横になってくつろぐ', mk('lie', 'half'));
  add('birdwatch', '鳥をねらう', mk('crouch', 'side', { tf: [-46, 56, 0, 0.74], over: g(200, 40, BIRD) }));
  add('butterflynose', '鼻にちょうちょ', sit('up', { tf: [0, 4, 0, 1], hp: g(121, 92, BUTTERFLY, 0, 0.9) }));
  add('boxnap', '箱の中で眠る', mk('loaf', 'closed', { tf: [0, 30, 0, 0.86], noFront: true, over: g(121, 150, BOXF(150, 46)), neck: null, sleeping: true }));
  add('leaves', '落ち葉の中で', sit('happy', { over: g(40, 60, LEAF('orange'), 40) + g(196, 40, LEAF('yellow'), -30) + g(60, 180, LEAF('orange'), 10) + g(196, 170, LEAF('yellow'), 70) + g(176, 100, LEAF('orange'), 200) }));
  add('origami', '折り紙の鶴', hold('kira', { paws: [108, 148, 134, 150], held: g(124, 142, CRANE) }));
  add('cactus', 'サボテンと見つめあう', sit('komari', { under: g(36, 158, CACTUS, 0, 1.2) }));
  add('grass', '草むらで伏せる', mk('flat', 'side', { over: g(30, 192, GRASS) + g(120, 194, GRASS) + g(150, 196, GRASS) + g(222, 194, GRASS) }));
  add('puddle', '水たまりをのぞく', mk('crouch', 'round', { tf: [-46, 58, 12, 0.74], under: g(46, 192, PUDDLE) }));
  add('books', '本の上で香箱', shrink(mk('loaf', 'half'), 24, -17, 0.8, g(121, 130, BOOKS, 0, 1.6)));
  add('icecreamday', 'アイスでひと休み', mk('side', 'mogu', { over: arm(100, 130, 112, 132, 13) + g(118, 116, ICE, 10, 0.8) }));
  // 夕方
  add('moon', '月を見る', { svg: g(190, 36, MOON) + P.back.svg + star(40, 30, 4), head: P.back.head, neck: P.back.neck });
  add('lantern', '提灯をもつ', mk('stand2', 'open', { arms: [100, 132, 160, 116], held: g(172, 160, LANTERN, 0, 0.9) + ln('M160 116 L172 124') }));
  add('ukulele', 'ウクレレ', hold('closed', { paws: [108, 156, 150, 138], held: g(116, 152, UKULELE, -24, 1.25), over: g(196, 56, NOTES) + g(40, 80, NOTE1) }));
  add('tv', 'テレビを見る', mk('lean', 'jito', { rarm: [162, 144], over: g(168, 138, REMOTE, 30) }));
  add('sunset', '夕日をながめる', mk('side', 'half', { over: ln('M206 40 q4 -4 8 0 q4 -4 8 0 M186 60 q3 -3 6 0 q3 -3 6 0') }));
  add('snack', '煮干しをかじる', mk('flat', 'mogu', { chin: true, hp: g(134, 118, FISH('gray'), 10, 0.8) }));
  add('sideloaf', '香箱でしっぽをゆらす', mk('loaf', 'side'));
  // 夜
  add('blanket', '毛布にくるまる', sit('half', { mid: BLANKET() }));
  add('kotatsu', 'こたつ', mk('peek', 'closed', { tf: [0, 64, 0, 0.84], under: KOTATSU, over: paw(98, 190, 10, 6) + paw(144, 190, 10, 6), sleeping: true }));
  add('candle', 'ろうそくのあかり', sit('open', { over: g(196, 160, CANDLE) }));
  add('stars', '星を見る', { svg: STARS + P.back.svg, head: P.back.head, neck: P.back.neck });
  add('bedread', '寝る前の読書', mk('flat', 'half', { tf: [-56, 46, 0, 0.72], noFront: true, held: g(70, 184, OPENBOOK, 0, 1.2) + paw(36, 186, 10, 6) + paw(104, 186, 10, 6) }));
  add('milk', '寝る前のホットミルク', hold('closed', { paws: [104, 146, 136, 146], held: g(121, 144, MUG('blue')) }));
  add('bath', 'お風呂', mk('peek', 'closed', { tf: [0, 46, 0, 0.92], hp: H.towel, hatY: 40, over: TUB + steam(50, 150) + steam(196, 150) }));
  add('knit', '編みもの', hold('half', { paws: [106, 150, 136, 150], held: g(121, 152, NEEDLES) + g(186, 182, YARN) + ln('M121 158 C 140 176 160 186 174 184') }));
  add('telescope', '望遠鏡をのぞく', mk('side', 'wink', { under: g(46, 150, TELESCOPE), over: star(210, 30, 5) + star(180, 50, 3) }));
  add('moonloaf', '月と香箱', mk('loaf', 'closed', { under: g(200, 40, MOON), sleeping: true }));
  add('cushionsit', '座布団でおすわり', sit('half', { under: g(121, 186, CUSHION(130, 'prop-red')) }));


  // ========== さらに増やしたポーズ（季節・しごとと趣味・ちょっと変） ==========
  Object.assign(C, { pumpkin: '#f0a35e', lilac: '#c9c2ec', teal: '#bfe0d8', bread: '#e8c283', choco: '#9b7458', sand: '#f3e3c0', glass: '#c4d8ee' });
  // 細い線の小物（小さいものは線を細くして、つぶれないように）
  const cl2 = (k) => (C[k] ? `class="b" style="fill:${C[k]};stroke-width:2"` : `class="b${k ? ' ' + k : ''}" style="stroke-width:2"`);
  const sh2 = (d, k = '') => `<path ${cl2(k)} d="${d}"/>`;
  const ov2 = (x, y, rx, ry, k = '') => `<ellipse ${cl2(k)} cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
  const rng = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const glassSh = (d) => `<path class="b" style="fill:#c4d8ee;fill-opacity:0.35" d="${d}"/>`;
  const S2BODY = 'M86 186 C 82 150 84 112 104 84 L140 84 C 160 112 162 150 158 186 C 158 192 148 192 146 186 L132 156 L112 156 C 108 166 104 178 98 188 C 94 194 86 192 86 186 Z';

  // ---- 体のかたち（追加） ----
  // 走る（横向き、顔はこっち）
  B.run = () => ({
    back: tail('M190 112 C 212 102 222 78 212 60', '190px 112px') + arm(176, 134, 226, 150, 14) + arm(166, 138, 208, 170, 14) +
      sh('M82 124 C 92 104 150 98 186 106 C 204 112 206 136 188 144 C 160 152 120 152 100 146 C 86 142 78 134 82 124 Z'),
    front: arm(104, 140, 52, 166, 14) + arm(118, 144, 80, 182, 14),
    tf: [-36, 2, -8, 0.8],
  });
  // 逆立ち（体はさかさま、頭は下でこっちを向く）
  B.handstand = () => ({
    back: `<g transform="rotate(180 122 118)">${tail('M150 172 C 178 174 190 152 182 128', '150px 172px')}${sh(S2BODY)}</g>` +
      arm(106, 146, 80, 188, 14) + arm(138, 146, 164, 188, 14),
    tf: [1, 66, 0, 0.78], neck: null,
  });
  // 背中を向けて、すわる（顔なし）。P.back を使う
  // 二本足：腕を体のうしろにまわす（頭の上に上げるときなど）
  const s2orig = B.stand2;
  B.stand2 = (o) => { const r = s2orig(o); if (o.armsBack && r.front) { r.back = r.front + r.back; r.front = ''; } return r; };
  const backWith = (under = '', over = '') => ({ svg: under + P.back.svg + over, head: P.back.head, neck: P.back.neck });

  // ---- 表情（追加） ----
  Object.assign(FACES, {
    // 手元を見る
    down: () => [100, 142].map((x) => `<g class="eye"><ellipse class="b" cx="${x}" cy="89" rx="8.5" ry="6.5"/><circle class="ink-fill" cx="${x}" cy="92" r="3"/><path class="l" d="M${x - 10} 87 Q${x} 84 ${x + 10} 87"/></g>`).join('') + nose(121, 102) + mouth(121, 102),
    // きりっと
    kiri: () => ln('M86 72 L108 78 M156 72 L134 78', true) + eye(100, 89) + eye(142, 89) + nose(121, 102) + flatMouth(121, 102),
    // 目がまわる
    guru: () => [100, 142].map((x) => ln(`M${x} 88 m-2 0 a2 2 0 1 1 4 0 a4 4 0 1 1 -8 0 a6 6 0 1 1 12 0 a8 8 0 1 1 -16 0`)).join('') + nose(121, 102) + wavyMouth(121, 102),
    // わあっ
    wow: () => roundEye(100, 88) + roundEye(142, 88) + nose(121, 101) + openMouth(121, 101),
    // べー
    pero: () => happyEye(100, 89) + eye(142, 88) + nose(121, 102) + mouth(121, 102) + '<path class="tongue" d="M116 111 Q121 109 126 111 Q127 122 121 122 Q115 122 116 111 Z"/>',
  });

  // ---- 小物（追加） ----
  const PETAL = sh2('M0 0 C -4 -4 -3 -8 0 -6 C 3 -8 4 -4 0 0 Z', 'prop-pink');
  const PETALS = (pts) => pts.map(([x, y, r]) => g(x, y, PETAL, r)).join('');
  const BLOSSOM = rng(5, (i) => g(0, 0, sh2('M0 0 C -5 -5 -4 -10 0 -8 C 4 -10 5 -5 0 0 Z', 'prop-pink'), i * 72)) + dot(0, 0, 1.4);
  const SAKURA = ln('M0 0 C 30 6 60 4 92 20 M40 4 C 52 -6 62 -8 72 -6', true) + g(28, 4, BLOSSOM) + g(60, 8, BLOSSOM, 20) + g(90, 20, BLOSSOM, 40) + g(72, -6, BLOSSOM, 10) + g(48, -2, BLOSSOM, 30, 0.8);
  const RING_BACK = sh('M-46 0 A46 14 0 0 1 46 0 L32 0 A32 8 0 0 0 -32 0 Z', 'prop-red');
  const RING_FRONT = sh('M-46 0 A46 14 0 0 0 46 0 L32 0 A32 8 0 0 1 -32 0 Z', 'prop-red') + sh2('M-30 6 L-22 7 L-24 13 L-34 11 Z') + sh2('M14 7 L24 6 L28 12 L18 13 Z');
  const WATER = (y) => sh(`M0 ${y} q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 L240 200 L0 200 Z`, 'blue');
  const MELONW = ov(0, 0, 26, 22, 'green') + ln('M-12 -19 q-5 9 0 19 q5 9 0 17 M2 -22 q-5 11 0 22 q5 10 0 20 M15 -17 q5 8 0 17 q-5 8 0 14');
  const MELONHALF = sh('M-24 0 A24 20 0 0 1 24 0 Z', 'green') + sh2('M-19 0 A19 15 0 0 1 19 0 Z', 'prop-red') + dot(-8, -6, 1.3) + dot(2, -9, 1.3) + dot(9, -4, 1.3);
  const MELONSLICE = sh('M-22 0 L22 0 L0 -26 Z', 'green') + sh2('M-17 -2 L17 -2 L0 -22 Z', 'prop-red') + dot(-5, -7, 1.2) + dot(4, -10, 1.2) + dot(1, -5, 1.2);
  const FIREWORK = (k, r = 26) => rng(12, (i) => {
    const a = (i * 30 * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), f = (v) => +v.toFixed(1);
    return ln(`M${f(c * r * 0.35)} ${f(s * r * 0.35)} L${f(c * r)} ${f(s * r)}`) + ov2(f(c * (r + 4)), f(s * (r + 4)), 2.4, 2.4, k);
  });
  const MOMIJI = (k = 'prop-red') => sh2('M0 -14 L3 -6 L11 -9 L7 -2 L13 2 L5 3 L6 10 L0 5 L-6 10 L-5 3 L-13 2 L-7 -2 L-11 -9 L-3 -6 Z', k) + ln('M0 5 L0 14');
  const SUSUKI = ln('M0 0 C 2 -30 6 -50 16 -66 M0 0 C -4 -26 -12 -44 -22 -54 M0 0 C 1 -20 -2 -40 0 -58') +
    ln('M16 -66 l-5 -2 M14 -60 l-6 -1 M11 -54 l-6 0 M-22 -54 l5 -2 M-18 -49 l6 -1 M0 -58 l-4 -3 M0 -52 l4 -3');
  const TSUKIMI = sh('M-24 18 L24 18 L20 30 L-20 30 Z', 'brown') + sh('M-30 12 L30 12 L30 18 L-30 18 Z', 'brown') +
    ov2(-14, 4, 8, 8) + ov2(0, 4, 8, 8) + ov2(14, 4, 8, 8) + ov2(-7, -8, 8, 8) + ov2(7, -8, 8, 8) + ov2(0, -20, 8, 8);
  const SNOWMAN = ov(0, 10, 22, 20) + ov(0, -20, 15, 14) + dot(-5, -22, 1.8) + dot(5, -22, 1.8) + sh2('M-2 -18 L9 -16 L-2 -14 Z', 'orange') +
    sh('M-11 -32 L11 -32 L8 -46 L-8 -46 Z', 'prop-red') + ln('M-20 2 L-36 -12 M20 2 L36 -10') + dot(0, 4, 1.6) + dot(0, 14, 1.6);
  const SNOW = (pts) => pts.map(([x, y, r]) => g(x, y, SPARK(r || 4))).join('');
  const KADOMATSU = sh2('M-14 30 L-14 -22 L-4 -32 L-4 30 Z', 'green') + sh2('M-4 30 L-4 -40 L6 -50 L6 30 Z', 'green') + sh2('M6 30 L6 -16 L16 -26 L16 30 Z', 'green') +
    ln('M-18 4 l-8 -8 M-18 4 l-10 0 M20 4 l8 -8 M20 4 l10 0') + sh('M-20 10 L22 10 L20 40 L-18 40 Z', 'prop-straw') + ln('M-19 20 L21 20 M-18 30 L20 30');
  const OMIKUJI = sh2('M-6 -18 L6 -18 L6 18 L-6 18 Z') + ln('M0 -12 L0 -6 M0 -2 L0 10');
  const KITE = sh('M-18 -22 L18 -22 L18 18 L-18 18 Z', 'prop-straw') + ln('M-18 -22 L18 18 M18 -22 L-18 18') + ov2(0, -2, 8, 8, 'prop-red') +
    ln('M0 18 q-6 8 0 16 q6 8 0 16 M-12 18 q-4 6 0 12 M12 18 q4 6 0 12');
  const MASU = sh('M-16 -8 L16 -8 L13 12 L-13 12 Z', 'prop-straw') + ov2(-6, -9, 3, 2.4, 'sand') + ov2(1, -10, 3, 2.4, 'sand') + ov2(7, -8, 3, 2.4, 'sand');
  const BEANS = (pts) => pts.map(([x, y]) => ov2(x, y, 3, 2.4, 'sand')).join('');
  const ONI = sh2('M-16 -12 L-20 -26 L-8 -18 Z M16 -12 L20 -26 L8 -18 Z', 'yellow') + ov(0, 0, 20, 18, 'prop-red') + ln('M-12 -6 L-4 -3 M12 -6 L4 -3') +
    dot(-7, 0, 2) + dot(7, 0, 2) + ln('M-8 9 Q0 13 8 9') + sh2('M-6 9 L-4 13 L-2 10 Z M6 9 L4 13 L2 10 Z');
  const EHOMAKI = sh('M-40 -7 L36 -7 L36 7 L-40 7 Z', 'dark') + ov2(36, 0, 5, 7) + dot(36, -2, 1.4) + ov2(36, 3, 1.6, 1.6, 'yellow');
  const PUMPKIN = ov(0, 0, 26, 20, 'pumpkin') + ln('M-10 -19 Q-16 0 -10 19 M10 -19 Q16 0 10 19') + sh2('M-2 -19 L-1 -27 L4 -27 L3 -19 Z', 'green');
  const JACK = PUMPKIN + sh2('M-15 -4 L-9 -11 L-5 -3 Z M15 -4 L9 -11 L5 -3 Z', 'dark') + sh2('M-14 4 Q0 16 14 4 L8 7 L4 4 L0 8 L-4 4 L-8 7 Z', 'dark');
  const CANDY = (k = 'prop-pink') => sh2('M-8 0 L-14 -6 L-14 6 Z M8 0 L14 -6 L14 6 Z', k) + ov2(0, 0, 8, 6, k);
  const XSTAR = sh2('M0 -8 L2.4 -2.5 L8 -2.5 L3.5 1 L5 7 L0 3.5 L-5 7 L-3.5 1 L-8 -2.5 L-2.4 -2.5 Z', 'yellow');
  const XTREE = sh('M-6 30 L6 30 L6 42 L-6 42 Z', 'brown') + sh('M0 -58 L22 -26 L12 -26 L30 2 L18 2 L36 30 L-36 30 L-18 2 L-30 2 L-12 -26 L-22 -26 Z', 'green') +
    ov2(-8, -18, 3.4, 3.4, 'prop-red') + ov2(10, -8, 3.4, 3.4, 'yellow') + ov2(-14, 10, 3.4, 3.4, 'blue') + ov2(16, 18, 3.4, 3.4, 'prop-red') + ov2(2, 14, 3.4, 3.4, 'prop-pink');
  const PRESENT = (w = 40, h = 30, k = 'prop-red') => sh(`M${-w / 2} 0 L${w / 2} 0 L${w / 2} ${h} L${-w / 2} ${h} Z`, k) + sh2(`M-4 0 L4 0 L4 ${h} L-4 ${h} Z`, 'yellow') +
    sh2('M0 0 C -12 -12 -18 -2 0 0 Z M0 0 C 12 -12 18 -2 0 0 Z', 'yellow');
  const STOCKING = sh('M-8 -18 L8 -18 L8 6 L18 10 Q24 18 14 20 L-4 20 Q-12 18 -8 8 Z', 'prop-red') + sh2('M-11 -26 L11 -26 L11 -17 L-11 -17 Z');
  const CAKE = sh('M-26 -8 L26 -8 L26 16 L-26 16 Z') + ln('M-26 4 L26 4') + sh2('M-30 16 L30 16 L28 22 L-28 22 Z', 'gray') +
    [-16, -4, 8, 18].map((x) => sh2(`M${x} -8 c-3 -4 -6 -2 -4 -6 c1 -3 7 -3 8 0 c2 4 -1 2 -4 6 Z`, 'prop-red')).join('') + ln('M0 -12 L0 -24') + sh2('M0 -32 Q4 -27 0 -24 Q-4 -27 0 -32 Z', 'yellow');
  const BOOT = (k = 'yellow') => sh('M-8 -20 L8 -20 L8 2 L20 4 Q26 12 20 16 L-8 16 Z', k) + ln('M-8 -14 L8 -14');
  const RAINHAT = sh('M80 64 Q86 30 121 28 Q156 30 162 64 Z', 'yellow') + sh('M64 66 Q121 50 178 66 Q182 74 172 74 Q121 60 70 74 Q60 74 64 66 Z', 'yellow');
  const HYDRANGEA = g(-8, 22, LEAF(), 200) + g(10, 20, LEAF(), -20) +
    [[0, 0], [10, -4], [-10, -3], [4, -12], [-6, -12], [9, 7], [-8, 7], [0, 10], [13, -12], [-14, -13]].map(([x, y]) => ov2(x, y, 6, 6, 'lilac') + dot(x, y, 0.9)).join('');
  const SNAIL = sh2('M-16 4 L14 4 Q20 4 20 -4 L18 -12 M18 -12 Q22 -4 22 2 Q20 8 12 8 L-16 8 Q-20 6 -16 4 Z', 'gray') +
    ov2(-2, -6, 10, 10, 'prop-straw') + ln('M-2 -6 m-4 0 a4 4 0 1 1 4 4') + ln('M20 -4 l-1 -9 M21 -4 l5 -8');
  const CARP = (k) => sh('M0 0 Q30 -4 52 2 L62 -5 L60 8 L62 21 L52 14 Q30 20 0 16 Z', k) + ov2(9, 7, 4, 4) + dot(9, 7, 1.4) + ln('M22 4 q4 4 0 8 M32 4 q4 4 0 8 M42 4 q4 4 0 8');
  const KOINOBORI = ln('M0 0 L0 -150', true) + ov2(0, -154, 5, 5, 'yellow') + g(2, -142, CARP('prop-red'), 8) + g(2, -112, CARP('blue'), 12, 0.85);
  const KABUTO = sh('M82 62 L121 30 L160 62 Z', 'gray') + sh('M74 66 L168 66 L162 58 L80 58 Z', 'gray') + sh2('M104 50 L96 26 L112 44 Z M138 50 L146 26 L130 44 Z', 'gray') + ln('M100 58 L121 38 L142 58');
  const KAKIGORI = sh('M-20 0 L20 0 L10 18 L-10 18 Z', 'glass') + sh2('M-4 18 L4 18 L6 24 L-6 24 Z', 'glass') + sh('M-22 0 Q-20 -28 0 -30 Q20 -28 22 0 Z') +
    sh2('M-22 0 Q-20 -28 0 -30 Q4 -16 -4 -8 Q-12 -2 -22 0 Z', 'prop-pink') + ln('M8 -24 L22 -40');
  const FURIN = ln('M0 -30 L0 -12') + sh2('M-10 2 Q-10 -12 0 -12 Q10 -12 10 2 Z', 'teal') + ln('M0 2 L0 8') + sh2('M-4 8 L4 8 L4 28 L-4 28 Z', 'prop-pink');
  const SPARKLER = ln('M0 0 L-24 -34') + ov2(0, 0, 3, 3, 'orange') + ln('M0 0 l6 4 M0 0 l-2 8 M0 0 l7 -3 M0 0 l4 9 M0 0 l9 2 M8 10 l2 1 M10 -2 l2 -1');
  const SUNFLOWER = ln('M0 0 L0 100', true) + g(0, 50, LEAF(), 40) + g(0, 70, LEAF(), 200) + rng(12, (i) => g(0, 0, sh2('M0 -10 Q5 -20 0 -28 Q-5 -20 0 -10 Z', 'yellow'), i * 30)) + ov(0, 0, 11, 11, 'choco');
  const TANABATA = ln('M0 0 C 6 -40 20 -80 40 -110', true) + ln('M10 -40 C 24 -48 34 -46 44 -40 M20 -80 C 8 -90 0 -92 -10 -90') +
    [[24, -46, 'prop-pink'], [42, -38, 'yellow'], [6, -86, 'blue'], [-8, -88, 'green'], [30, -92, 'prop-purple']].map(([x, y, k]) => sh2(`M${x - 4} ${y} L${x + 4} ${y} L${x + 4} ${y + 18} L${x - 4} ${y + 18} Z`, k)).join('');
  const FISHBOWL = sh('M-26 -16 Q-30 -22 -22 -24 Q0 -18 22 -24 Q30 -22 26 -16 Q38 12 0 26 Q-38 12 -26 -16 Z', 'blue') + ln('M-24 -4 Q0 2 24 -4') +
    sh2('M-8 8 Q0 2 6 8 L12 3 L12 13 L6 8 Q0 14 -8 8 Z', 'pumpkin');
  const CUKE = ln('M-26 6 L-30 34 M-14 8 L-12 34 M14 8 L12 34 M28 6 L32 34', true) + sh('M-42 -8 Q0 -14 40 -6 Q48 0 40 6 Q0 14 -42 8 Q-50 0 -42 -8 Z', 'green') +
    dot(-24, -2, 1.2) + dot(-8, 2, 1.2) + dot(10, -2, 1.2) + dot(26, 1, 1.2);
  const CUKE0 = sh('M-42 -8 Q0 -14 40 -6 Q48 0 40 6 Q0 14 -42 8 Q-50 0 -42 -8 Z', 'green') + dot(-24, -2, 1.2) + dot(-8, 2, 1.2) + dot(10, -2, 1.2) + dot(26, 1, 1.2);
  const KOTATSU0 = KOTATSU.split('<g transform="translate(190 94)">')[0];
  const YAKIIMO = sh('M-26 -6 Q0 -16 26 -4 Q32 4 22 8 Q0 14 -24 8 Q-32 2 -26 -6 Z', 'prop-purple') + sh2('M-6 -9 Q2 0 -4 10 L4 10 Q10 0 4 -11 Z', 'yellow');
  const KURI = sh2('M0 -10 Q8 -2 8 4 Q8 10 0 10 Q-8 10 -8 4 Q-8 -2 0 -10 Z', 'choco') + ln('M-7 4 Q0 7 7 4');
  const NABE = sh('M-56 0 Q-58 36 0 40 Q58 36 56 0 Z', 'brown') + ln('M-56 0 Q0 10 56 0') + sh2('M-64 4 L-56 2 L-56 10 L-64 10 Z M64 4 L56 2 L56 10 L64 10 Z', 'brown');
  const CHOCO = '<path class="heart-ink" style="fill:#9b7458" d="M0 -6 c-8 -12 -26 -4 -16 10 l16 14 l16 -14 c10 -14 -8 -22 -16 -10 Z"/>' + ln('M-14 -6 L14 14 M14 -6 L-14 14');
  const STRAWB = sh2('M0 -8 Q10 -8 8 2 Q4 12 0 12 Q-4 12 -8 2 Q-10 -8 0 -8 Z', 'prop-red') + sh2('M-5 -8 L0 -12 L5 -8 L0 -6 Z', 'green') + dot(-3, -1, 0.8) + dot(3, 1, 0.8) + dot(0, 5, 0.8);
  const ENVELOPE = sh('M-12 -18 L12 -18 L12 18 L-12 18 Z', 'prop-pink') + sh2('M-6 -8 L6 -8 L6 4 L-6 4 Z') + ln('M-3 -4 L3 -4 M-3 0 L3 0');
  const MOCHIPLATE = ov(0, 4, 22, 5, 'gray') + ov2(-6, 0, 9, 5) + ov2(8, 0, 9, 5);
  const FAN = ln('M0 10 L0 60', true) + sh('M-20 60 L20 60 L24 68 L-24 68 Z', 'gray') + ov(0, 0, 30, 30, 'glass') + ln('M0 0 L0 -26 M0 0 L22 14 M0 0 L-22 14') +
    ov2(0, 0, 6, 6, 'gray') + ln('M0 0 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0');
  // しごとと趣味
  const PAN = ln('M24 2 L56 12', true) + ov(0, 0, 26, 8, 'dark') + ov2(-2, -3, 12, 5) + ov2(-2, -4, 4.5, 3, 'yellow');
  const BIGPOT = sh('M-30 -14 L30 -14 L26 20 Q0 26 -26 20 Z', 'gray') + ln('M-34 -12 l-6 -4 M34 -12 l6 -4') + steam(0, -20);
  const LADLE = ln('M0 0 L18 -46', true) + ov(-2, 4, 9, 6, 'gray');
  const BOARD = sh('M-38 0 L38 0 L38 10 L-38 10 Z', 'brown');
  const CARROT = sh2('M-18 -4 L16 0 L-18 4 Z', 'orange') + ln('M-18 0 l-8 -5 M-18 0 l-8 4 M-18 0 l-9 0');
  const KNIFE = sh2('M0 0 L26 -6 L26 2 L0 4 Z', 'gray') + sh2('M-14 0 L0 -1 L0 4 L-14 4 Z', 'brown');
  const EASEL = ln('M-24 30 L0 -46 L24 30 M0 -46 L0 34', true) + sh('M-32 -40 L32 -40 L32 14 L-32 14 Z') + g(0, -14, FISH('blue'), 0, 1.3) + sh2('M-34 14 L34 14 L34 18 L-34 18 Z', 'brown');
  const PALETTE = sh('M-20 -12 Q4 -18 20 -8 Q26 4 14 10 Q4 12 -2 6 Q-8 2 -14 8 Q-24 6 -20 -12 Z', 'prop-straw') +
    ov2(-10, -6, 3.6, 3.6, 'prop-red') + ov2(0, -9, 3.6, 3.6, 'blue') + ov2(10, -6, 3.6, 3.6, 'yellow') + ov2(14, 3, 3.6, 3.6, 'green');
  const BRUSH = ln('M0 0 L24 -24') + sh2('M24 -24 L32 -32 L28 -21 Z', 'blue');
  const GUITAR = sh('M-30 0 C -30 -18 -10 -18 -4 -10 C 2 -16 18 -14 18 0 C 18 14 2 16 -4 10 C -10 18 -30 18 -30 0 Z', 'orange') + sh('M18 -3 L62 -3 L62 3 L18 3 Z', 'brown') +
    sh2('M62 -6 L74 -6 L74 6 L62 6 Z', 'brown') + ov(-8, 0, 5, 5, 'dark') + ln('M-26 -1.5 L62 -1.5 M-26 1.5 L62 1.5');
  const KEYS = (w = 140) => sh(`M${-w / 2 - 6} 0 L${w / 2 + 6} 0 L${w / 2 + 6} 30 L${-w / 2 - 6} 30 Z`, 'brown') + sh(`M${-w / 2} 0 L${w / 2} 0 L${w / 2} 20 L${-w / 2} 20 Z`) +
    rng(Math.floor(w / 14) - 1, (i) => ln(`M${-w / 2 + 14 * (i + 1)} 0 L${-w / 2 + 14 * (i + 1)} 20`)) +
    rng(Math.floor(w / 14) - 1, (i) => ([2, 6].includes(i % 7) ? '' : `<rect class="ink-fill" x="${-w / 2 + 14 * (i + 1) - 3}" y="0" width="6" height="11"/>`));
  const TAIKO = sh('M-30 -16 Q-38 4 -30 24 L30 24 Q38 4 30 -16 Z', 'prop-red') + ov(0, -16, 30, 8) + ln('M-31 -10 L31 -10 M-31 18 L31 18') +
    dot(-20, -10, 1.6) + dot(0, -9, 1.6) + dot(20, -10, 1.6);
  const BACHI = ln('M0 0 L0 -34', true) + ov2(0, -36, 3.4, 3.4, 'brown');
  const RECORDER = sh('M-3 0 L3 0 L4 50 L-4 50 Z', 'prop-straw') + dot(0, 14, 1.2) + dot(0, 22, 1.2) + dot(0, 30, 1.2) + dot(0, 38, 1.2);
  const MIC = sh('M-3 0 L3 0 L2 30 L-2 30 Z', 'dark') + ov(0, -8, 8, 9, 'gray') + ln('M-6 -10 L6 -10 M-6 -5 L6 -5');
  const TROWEL = ln('M0 -30 L0 -10', true) + sh2('M-6 -10 L6 -10 L0 8 Z', 'gray');
  const SPROUT = sh('M-14 0 L14 0 L11 20 L-11 20 Z', 'brown') + ln('M0 0 L0 -16') + sh2('M0 -12 C -8 -20 -16 -14 -12 -10 C -8 -8 -4 -10 0 -12 Z', 'green') + sh2('M0 -14 C 8 -22 16 -16 12 -12 C 8 -10 4 -12 0 -14 Z', 'green');
  const DAIKON = sh2('M-4 0 Q-22 -30 -12 -42 Q-2 -22 0 0 Z', 'green') + sh2('M4 0 Q22 -30 12 -44 Q2 -22 0 0 Z', 'green') + sh2('M0 0 Q-3 -36 2 -50 Q6 -30 2 0 Z', 'green') + sh('M-11 0 Q-13 30 0 52 Q13 30 11 0 Z');
  const OLDBOOT = sh('M-8 -16 L8 -16 L8 4 L22 6 Q26 14 18 16 L-8 16 Z', 'brown') + ln('M-8 -10 L8 -10');
  const TRIPOD = ln('M0 0 L-16 50 M0 0 L16 50 M0 0 L0 50') + g(0, -12, CAMERA, 0, 0.8);
  const HANSHI = sh('M-24 -32 L24 -32 L24 32 L-24 32 Z') + '<path class="l" style="stroke-width:5" d="M-2 -14 C 4 4 -4 20 -12 16 C -22 10 -16 -14 6 -16 C 22 -16 24 4 10 18"/>' + ov2(16, 26, 3, 3, 'prop-red');
  const FUDE = sh2('M0 0 L4 -2 L22 -38 L18 -40 Z', 'brown') + sh2('M0 0 L-3 9 L4 -2 Z', 'dark');
  const PAD = sh('M-22 -8 Q-26 -12 -16 -12 L16 -12 Q26 -12 22 -8 L28 8 Q30 16 20 14 L12 6 L-12 6 L-20 14 Q-30 16 -28 8 Z', 'gray') +
    ln('M-16 -4 L-8 -4 M-12 -8 L-12 0') + dot(10, -6, 1.8) + dot(16, -2, 1.8);
  const HANDHELD = sh('M-18 -12 L18 -12 L18 12 L-18 12 Z', 'gray') + sh2('M-10 -8 L10 -8 L10 6 L-10 6 Z', 'teal') + dot(-14, 0, 1.6) + dot(14, -2, 1.6) + dot(14, 3, 1.6);
  const DESKLAMP = '<circle class="w-apricot" cx="20" cy="-30" r="26"/>' + sh('M-14 40 L14 40 L14 46 L-14 46 Z', 'dark') + ln('M0 40 L-10 0 L14 -30', true) + sh('M4 -44 L30 -40 L28 -20 L8 -28 Z', 'yellow');
  const MAGNI = ln('M10 10 L28 28', true) + `<circle class="b" style="fill:#c4d8ee;fill-opacity:0.5" cx="0" cy="0" r="15"/>`;
  const KEYBOARD = sh('M-42 0 L42 0 L46 14 L-46 14 Z', 'gray') + ln('M-36 5 L36 5 M-38 9.5 L38 9.5');
  const HAMMER = ln('M0 6 L0 40', true) + sh2('M-12 -6 L12 -6 L12 6 L-12 6 Z', 'dark');
  const BIRDHOUSE = sh('M-16 0 L16 0 L16 30 L-16 30 Z', 'brown') + ov2(0, 12, 5, 5, 'dark') + sh('M-24 2 L0 -20 L24 2 L20 6 L0 -12 L-20 6 Z', 'prop-red');
  const ROLLER = ln('M0 0 L0 30 M0 0 L14 -4 L14 -16', true) + sh2('M-4 -16 L30 -16 L30 -28 L-4 -28 Z', 'yellow');
  const WHISK = ln('M0 0 L0 -26', true) + ln('M0 -26 C -10 -36 -8 -50 0 -52 C 8 -50 10 -36 0 -26 M0 -26 C -4 -36 -3 -50 0 -52 C 3 -50 4 -36 0 -26');
  const BOWL = sh('M-28 0 Q-26 24 0 26 Q26 24 28 0 Z', 'teal') + ov2(0, 0, 28, 5, 'sand');
  const OVEN = sh('M-40 -34 L40 -34 L40 34 L-40 34 Z', 'gray') + sh2('M-30 -18 L30 -18 L30 24 L-30 24 Z', 'dark') + '<rect x="-26" y="-14" width="52" height="34" fill="#f2b98a" opacity="0.6"/>' +
    g(0, 10, CAKE, 0, 0.5) + ln('M-30 -26 L30 -26') + dot(-24, -28, 2) + dot(-14, -28, 2);
  const COOKIE = sh2('M0 -12 L3.5 -4 L12 -4 L5 2 L8 11 L0 5.5 L-8 11 L-5 2 L-12 -4 L-3.5 -4 Z', 'bread') + dot(-2, 0, 1) + dot(3, 2, 1);
  const CHAWAN = sh('M-18 0 Q-16 18 0 18 Q16 18 18 0 Z', 'brown') + ov2(0, 0, 18, 4, 'green');
  const CHASEN = sh2('M-3 0 L3 0 L3 -16 L-3 -16 Z', 'prop-straw') + ln('M-3 0 L-7 10 M0 0 L0 11 M3 0 L7 10');
  const IKEBANA = sh('M-14 0 L14 0 L18 24 L-18 24 Z', 'teal') + ln('M0 0 C -6 -24 -20 -40 -30 -46 M0 0 C 4 -26 14 -44 26 -56 M0 0 C 0 -14 4 -24 8 -30') +
    g(-30, -46, BLOSSOM) + g(8, -30, BLOSSOM) + g(-12, -26, LEAF(), -40, 0.7) + g(16, -40, LEAF(), 20, 0.7);
  const PUZZLE = (k) => sh2('M-8 -8 L-2 -8 Q0 -13 2 -8 L8 -8 L8 -2 Q13 0 8 2 L8 8 L-8 8 Z', k);
  const SHOGI = sh('M-40 0 L40 0 L40 26 L-40 26 Z', 'prop-straw') + ln('M-40 9 L40 9 M-40 17 L40 17 M-20 0 L-20 26 M0 0 L0 26 M20 0 L20 26') +
    [[-28, 4], [-8, 13], [10, 4], [30, 21], [-30, 21]].map(([x, y]) => sh2(`M${x} ${y - 5} L${x + 4} ${y - 2} L${x + 4} ${y + 4} L${x - 4} ${y + 4} L${x - 4} ${y - 2} Z`, 'bread')).join('');
  const OTEDAMA = (k) => ov2(0, 0, 7, 6, k) + ln('M-3 -5 L3 5');
  const SKATE = sh('M-46 -4 L46 -4 Q52 -4 50 3 L-50 3 Q-52 -4 -46 -4 Z', 'orange') + ov2(-30, 8, 5, 5, 'dark') + ov2(30, 8, 5, 5, 'dark');
  const DESK = (y = 150) => sh(`M6 ${y} L234 ${y} L234 ${y + 10} L6 ${y + 10} Z`, 'brown') + ln(`M20 ${y + 10} L20 200 M220 ${y + 10} L220 200`, true);
  const SHIRT = sh2('M-12 0 L-4 -4 Q0 0 4 -4 L12 0 L16 8 L10 10 L10 26 L-10 26 L-10 10 L-16 8 Z', 'blue');
  const SOCK = (k = 'prop-pink') => sh2('M-4 0 L6 0 L6 14 L12 18 Q14 24 8 24 L-2 22 Q-6 20 -4 14 Z', k);
  const IRON = sh('M-22 6 L22 6 Q20 -8 4 -12 L-14 -12 Q-22 -6 -22 6 Z', 'teal') + ln('M-12 -12 Q-10 -22 4 -20 L8 -12');
  const VACUUM = ln('M0 0 L24 -70', true) + sh('M-26 -4 L14 -4 L18 8 L-30 8 Z', 'gray') + sh('M14 -70 L34 -70 L34 -56 L14 -56 Z', 'gray');
  const PLATE = ov(0, 0, 20, 20) + ov2(0, 0, 12, 12, 'gray');
  const WHEEL = ov(0, 10, 44, 9, 'gray') + sh('M-16 8 Q-20 -14 -10 -22 L10 -22 Q20 -14 16 8 Z', 'brown') + ln('M-10 -22 Q0 -18 10 -22 M-17 -6 Q0 -2 17 -6');
  const BONSAI = sh('M-24 0 L24 0 L20 12 L-20 12 Z', 'teal') + ln('M0 0 C -4 -10 6 -14 0 -26 C -4 -30 -12 -32 -18 -30', true) +
    ov2(-18, -34, 13, 8, 'green') + ov2(4, -32, 13, 8, 'green') + ov2(-4, -44, 10, 7, 'green');
  const SCISSORS = ov2(-6, 8, 4, 4) + ov2(4, 10, 4, 4) + ln('M-4 4 L12 -16 M2 6 L4 -18');
  const GLOBE = ln('M0 32 L0 40 M-14 42 L14 42', true) + ln('M-26 -8 A28 28 0 0 0 20 28', true) + ov(0, 0, 24, 24, 'blue') +
    sh2('M-12 -14 Q-2 -18 2 -8 Q-4 0 -12 -2 Q-18 -6 -12 -14 Z M6 4 Q16 2 16 12 Q10 18 4 12 Z', 'green');
  const MAP = sh('M-44 -26 L-14 -20 L14 -26 L44 -20 L44 26 L14 20 L-14 26 L-44 20 Z', 'sand') + ln('M-14 -20 L-14 26 M14 -26 L14 20') +
    ln('M-36 10 q10 -20 24 -6 q14 12 30 -10') + ln('M24 -10 l6 6 M30 -10 l-6 6');
  const TOPHAT = sh('M-16 0 L-14 -30 L14 -30 L16 0 Z', 'dark') + ov(0, 0, 26, 6, 'dark');
  const CLOUD = sh('M-54 10 Q-66 -6 -46 -12 Q-42 -32 -18 -26 Q0 -42 20 -28 Q44 -34 48 -12 Q68 -4 54 10 Z');
  const LAMPSHADE = sh('M78 66 L164 66 L148 16 L94 16 Z', 'yellow') + ln('M80 66 L80 74 M92 66 L92 74 M104 66 L104 74 M116 66 L116 74 M128 66 L128 74 M140 66 L140 74 M152 66 L152 74 M162 66 L162 74');
  const BIGBALL = (r) => ov(0, 0, r, r, 'prop-red') + sh2(`M${-r} -4 Q0 ${r * 0.25} ${r} -4 L${r} 6 Q0 ${r * 0.45} ${-r} 6 Z`, 'yellow') + ov2(-r * 0.4, -r * 0.45, 5, 3);
  const ROOMBA = ov(0, 4, 46, 10, 'gray') + sh('M-46 0 Q0 -14 46 0 L46 4 Q0 16 -46 4 Z', 'gray') + ov2(16, -3, 4, 2.4, 'teal');
  const DRAWER = sh('M20 64 L220 64 L220 200 L20 200 Z', 'brown') + sh('M20 112 L220 112 L220 156 L20 156 Z', 'brown') + ov2(120, 182, 8, 3, 'dark');
  const PIPE = sh('M50 120 L196 120 L196 176 L50 176 Z', 'green') + ov(196, 148, 8, 30, 'green') + ln('M60 132 L186 132');
  const BOWLBIG = sh('M-66 0 A66 14 0 0 0 66 0 Q62 46 0 50 Q-62 46 -66 0 Z', 'prop-red') + ln('M-50 30 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0') + ov(0, 54, 30, 5, 'prop-red');
  const NARUTO = ov2(0, 0, 9, 7) + ln('M0 0 m-1 0 a2 2 0 1 1 2 1 a4 4 0 1 1 -6 -2');
  const RICE = sh('M-60 -14 Q0 -22 60 -14 L64 20 Q0 28 -64 20 Z') + dot(-40, 0, 1) + dot(-10, 6, 1) + dot(24, -2, 1) + dot(44, 8, 1);
  const SHOJI = sh('M0 0 L240 0 L240 200 L0 200 Z', 'sand') + ln('M60 0 L60 200 M120 0 L120 200 M180 0 L180 200 M0 50 L240 50 M0 100 L240 100 M0 150 L240 150');
  const BUCKET = sh('M-40 -30 L40 -30 L32 30 L-32 30 Z', 'blue') + ln('M-40 -30 Q0 -70 40 -30') + ln('M-37 -10 L37 -10');
  const TISSUE = sh('M-50 -20 L50 -20 L50 24 L-50 24 Z', 'blue') + ln('M-30 -20 Q0 -10 30 -20') + g(-40, 6, BLOSSOM, 0, 0.8) + g(36, 8, BLOSSOM, 20, 0.8);
  const CONE = sh('M-34 0 L34 0 L0 76 Z', 'prop-straw') + ln('M-26 10 L8 60 M-6 2 L18 38 M16 4 L26 18 M26 10 L-8 60 M6 2 L-18 38 M-16 4 L-26 18');
  const SHELL = ov(0, 0, 34, 32, 'prop-straw') + ln('M0 0 m-6 0 a6 6 0 1 1 6 6 a12 12 0 1 1 -14 -14 a20 20 0 1 1 22 26');
  const CHAIR = sh('M60 70 L74 70 L74 160 L60 160 Z', 'brown') + sh('M60 150 L190 150 L190 162 L60 162 Z', 'brown') + ln('M66 162 L66 200 M184 162 L184 200', true);
  const PAPERBAG = sh('M36 112 L150 100 L154 190 L40 194 Z', 'prop-straw') + ln('M150 100 L162 96 L164 186 L154 190 M60 130 L74 140 M110 170 L124 164');
  const HOOP = (rx, ry) => `<ellipse class="l" style="stroke:#e9928c;stroke-width:5" cx="0" cy="0" rx="${rx}" ry="${ry}"/>`;
  const KENDAMA = ln('M0 0 L0 -20', true) + sh2('M-10 -20 L10 -20 L8 -26 L-8 -26 Z', 'brown') + ln('M0 0 C 20 6 30 -30 18 -50') + ov(18, -58, 8, 8, 'prop-red');
  const TRUMPET = sh('M0 -3 L34 -3 L34 3 L0 3 Z', 'yellow') + sh('M34 -3 L48 -12 L48 12 L34 3 Z', 'yellow') + ln('M12 -3 L12 -9 M18 -3 L18 -9 M24 -3 L24 -9');
  const POMPOM = (k) => rng(8, (i) => g(0, 0, sh2('M0 0 L-3 -14 L3 -14 Z', k), i * 45)) + ov2(0, 0, 6, 6, k);
  const BATON = ln('M0 0 L30 -30');
  const GLOVE = (k = 'prop-red') => ov(0, 0, 13, 12, k) + ov2(-10, 4, 5, 6, k) + sh2('M-8 10 L8 10 L8 16 L-8 16 Z');
  const BAT = sh('M0 0 L6 -2 L58 -10 Q64 -8 62 -2 L8 6 Z', 'bread');
  const GUM = ov(0, 0, 22, 20, 'prop-pink') + ln('M-10 -8 q2 -5 6 -6');
    const NINJACLOTH = sh('M20 30 L130 22 L134 196 L24 196 Z', 'sand') + ln('M30 70 L126 66 M30 120 L130 116 M30 168 L130 164 M70 30 L72 196');
  const MUSTACHE = '<path class="ink-fill" d="M121 106 C 112 102 100 104 96 112 C 104 110 112 112 121 110 C 130 112 138 110 146 112 C 142 104 130 102 121 106 Z"/>';
  const SWEAT2 = drop(168, 62) + drop(74, 70);

  // ---- 組み立てヘルパー ----
  const withHead = (p, x, y, r = 0) => ({ ...p, head: { x, y, r } });
  const noNeck = (p) => ({ ...p, neck: null });
  const S2 = (face, o) => mk('stand2', face, o);
  const peek = (face, o) => mk('peek', face, o);
  // 小さくして、別の場所へ（下に台をおく）
  const mini = (p, tx, ty, s, under = '', over = '') => { const r = shrink(p, tx, ty, s, under); r.svg += over; return r; };

  // ================= 季節 =================
  // 春
  add('hanami', 'お花見', sit('happy', { under: g(6, 24, SAKURA), over: PETALS([[46, 120, 10], [190, 60, -30], [210, 130, 40], [30, 150, 70], [176, 26, 0]]) + g(40, 172, DANGO, -30, 0.7) }));
  add('sakuranose', '鼻に花びら', sit('up', { tf: [0, 2, 0, 1], hp: g(124, 99, PETAL, 20, 1.9), over: PETALS([[60, 40, 20], [190, 70, -40], [200, 150, 60]]) }));
  add('hanafubuki', '花ふぶき', S2('happy', { arms: 'up', over: PETALS([[30, 30, 0], [60, 70, 40], [196, 30, -20], [214, 80, 60], [40, 130, 80], [200, 140, 10], [176, 12, 30], [26, 90, -30], [218, 180, 50], [20, 176, 0]]) }));
  add('koinobori', 'こいのぼり', mk('side', 'up', { tf: [-30, 4, -10, 0.86], under: `<g transform="translate(224 196) scale(-1.1 1.1)">${KOINOBORI}</g>` }));
  add('kabuto', '新聞紙のかぶと', sit('kiri', { hp: KABUTO, hatY: 30 }));
  add('ichigo', 'いちご狩り', hold('mogu', { paws: [112, 144, 132, 144], held: g(122, 138, STRAWB, 0, 1.4), under: g(36, 174, sh('M-30 0 L30 0 L24 20 L-24 20 Z', 'prop-straw') + g(-12, -4, STRAWB) + g(6, -6, STRAWB) + g(18, -2, STRAWB)) }));
  // 梅雨・夏
  add('ajisai', 'あじさいとかたつむり', sit('dot', { under: g(40, 150, HYDRANGEA, 0, 1.4), over: g(42, 120, SNAIL, 0, 0.8) + RAIN }));
  add('rainboots', '長ぐつと雨ぼうし', sit('happy', { hp: RAINHAT, hatY: 30, over: g(107, 176, BOOT(), 0, 0.95) + g(135, 176, BOOT(), 0, 0.95) + g(60, 192, PUDDLE, 0, 0.8) + RAIN }));
  add('tanabata', '七夕', sit('up', { tf: [-14, 0, -6, 0.96], under: g(166, 196, TANABATA, 0, 1.4), over: star(40, 30, 4) + star(70, 16, 3) }));
  add('swimring', '浮き輪でぷかぷか', peek('happy', { tf: [0, 34, 0, 0.9], under: g(121, 150, RING_BACK, 0, 1.3), over: WATER(156) + g(121, 150, RING_FRONT, 0, 1.3) + paw(62, 146, 9, 6) + paw(180, 146, 9, 6) }));
  add('beach', 'ビーチでひなたぼっこ', mk('belly', 'open', { hp: H.sun, under: sh('M10 150 L230 150 L232 196 L8 196 Z', 'sand') + sh('M30 160 L210 160 L216 192 L24 192 Z', 'prop-red') + ln('M28 172 L212 172 M26 184 L214 184') }));
  add('suikawari', 'スイカ割り', S2('kiri', { hp: sh('M70 80 Q121 72 172 80 L172 94 Q121 86 70 94 Z', 'prop-pink') + sh2('M172 86 L188 78 L186 96 Z', 'prop-pink'), armsBack: true, arms: [108, 26, 136, 24], under: ln('M90 36 L196 4', true), over: g(204, 180, MELONW, 0, 0.9) }));
  add('suikaseeds', 'スイカのたねを飛ばす', hold('nyaa', { paws: [128, 140, 150, 140], held: g(146, 130, MELONSLICE, -20, 1.1), over: dot(176, 98, 1.6) + dot(194, 92, 1.6) + dot(212, 88, 1.6) + ln('M180 104 l6 -2') }));
  add('kakigori', 'かき氷で頭キーン', sit('squint', { over: g(121, 168, KAKIGORI, 0, 1.1) + arm(152, 128, 174, 62, 13) + ln('M178 44 l8 -8 M186 58 l10 -2 M60 50 l-8 -8') }));
  add('furin', '風鈴の音', sit('closed', { over: g(190, 50, FURIN, 10) + ln('M40 70 q10 -6 20 0 M30 90 q10 -6 20 0 M206 104 q6 -4 12 0') }));
  add('senpuki', '扇風機に「あ〜」', sit('nyaa', { tf: [-20, 0, 0, 0.92], over: g(196, 120, FAN, 0, 0.9) + ln('M146 108 q6 -4 12 0 M148 120 q6 -4 12 0') }));
  add('hanabi', '花火を見る', backWith(g(50, 44, FIREWORK('prop-red', 24)) + g(186, 30, FIREWORK('yellow', 20)) + g(196, 96, FIREWORK('blue', 14))));
  add('senkou', '線香花火', hold('down', { paws: [116, 138, 128, 138], held: ln('M122 140 L122 166') + '<circle class="w-apricot" cx="122" cy="170" r="16"/>' + ov2(122, 170, 3.4, 3.4, 'orange') +
    ln('M122 170 l9 4 M122 170 l-8 5 M122 170 l3 10 M122 170 l-4 -9 M122 170 l10 -5 M134 182 l2 1 M108 178 l-2 1') }));
  add('himawari', 'ひまわりと背くらべ', mk('tall', 'up', { tf: [-24, -16, -6, 0.84], noFront: true, under: g(194, 52, SUNFLOWER, 0, 1.35) }));
  add('kingyo', '金魚鉢をのぞく', sit('down', { tf: [0, 6, 0, 1], over: g(121, 168, FISHBOWL, 0, 1.1) }));
  add('kyuuri', 'きゅうりの馬に乗る', mini(mk('loaf', 'closed'), 24, -9, 0.8, '', g(122, 152, CUKE, 0, 1.5)));
  // 秋
  add('momiji', 'もみじ狩り', hold('kira', { paws: [114, 146, 130, 146], held: g(122, 132, MOMIJI(), 0, 2.2), over: g(40, 50, MOMIJI('orange'), 20) + g(200, 40, MOMIJI(), -30) + g(200, 160, MOMIJI('yellow'), 40) }));
  add('ochiba', '落ち葉にダイブ', peek('happy', { tf: [0, 40, 10, 0.9], over: sh('M10 196 Q20 150 60 156 Q90 136 120 152 Q150 136 180 154 Q220 148 232 196 Z', 'orange') +
    g(40, 170, MOMIJI(), 10) + g(90, 158, MOMIJI('yellow'), -30) + g(150, 160, MOMIJI(), 50) + g(200, 170, MOMIJI('yellow'), 0) + g(120, 182, MOMIJI(), 80) + g(60, 110, MOMIJI(), -20) + g(196, 120, MOMIJI('yellow'), 30) }));
  add('tsukimi', 'お月見だんご', backWith(g(196, 34, MOON) + g(34, 196, SUSUKI, 0, 1.4), g(204, 160, TSUKIMI, 0, 1.0)));
  add('yakiimo', '焼きいも', hold('mogu', { paws: [110, 144, 136, 144], held: g(122, 140, YAKIIMO, -20, 1.3) + steam(130, 118) }));
  add('kuri', '栗ひろい', mk('crouch', 'kira', { under: g(30, 186, KURI) + g(150, 190, KURI) + g(200, 186, KURI) }));
  add('kabocha', 'かぼちゃから顔だけ', peek('wink', { tf: [0, 14, 0, 0.84], over: g(121, 160, sh('M-80 -24 Q0 -40 80 -24 Q100 10 70 36 L-70 36 Q-100 10 -80 -24 Z', 'pumpkin') + ln('M-40 -32 Q-50 0 -40 36 M40 -32 Q50 0 40 36')) }));
  add('obake', 'おばけのかっこう', { svg: tail('M170 184 C 200 190 210 170 204 150', '170px 184px') +
      sh('M64 190 C 60 120 70 40 121 36 C 172 40 182 120 178 190 L164 180 L150 192 L136 180 L121 192 L106 180 L92 192 L78 180 Z') +
      sh2('M86 50 L92 24 L106 44 Z M156 50 L150 24 L136 44 Z') + ov(100, 92, 7, 9, 'dark') + ov(142, 92, 7, 9, 'dark') + ln('M108 120 Q121 132 134 120'),
    head: { x: 121, y: 34, r: 0 }, neck: null });
  add('trickortreat', 'お菓子をくれないと', S2('pero', { arms: [100, 132, 146, 132], held: g(124, 152, JACK, 0, 0.9) + ln('M100 132 Q124 116 148 132'), over: g(40, 60, CANDY()) + g(200, 50, CANDY('yellow'), 30) }));
  // 冬
  add('yukidaruma', '雪だるまをつくる', mini(S2('happy', { arms: [96, 140, 160, 132] }), -6, 26, 0.84, '', g(186, 150, SNOWMAN, 0, 1.2) + SNOW([[30, 30], [200, 30, 3], [120, 20, 3], [220, 90, 3]])));
  add('yukidama', '雪玉をかまえる', S2('kiri', { arms: [100, 130, 166, 52], over: ov(172, 44, 13, 12) + SNOW([[30, 30], [50, 120, 3], [210, 110, 3], [200, 170]]) }));
  add('yukiname', '雪をなめる', sit('nyaa', { tf: [0, 0, -10, 1], over: SNOW([[40, 40], [200, 30, 5], [150, 18, 3], [60, 110, 3], [210, 100, 3], [30, 160, 3], [190, 150, 4]]) }));
  add('kotatsumikan', 'こたつでみかん', peek('mogu', { tf: [0, -12, 0, 0.84], over: KOTATSU0 + g(121, 106, MIKAN, 0, 0.9) + paw(102, 112, 8, 6) + paw(140, 112, 8, 6) + sh2('M176 104 Q184 96 194 102 Q188 108 176 104 Z', 'orange') + g(206, 96, MIKAN, 0, 0.9) }));
  add('kotatsukame', 'こたつから頭だけ', peek('closed', { tf: [-62, 86, -70, 0.6], under: KOTATSU, over: ZZ(70, 120), sleeping: true }));
  add('kotatsuue', 'こたつの上で丸くなる', shrink(mk('curl', 'closed', { over: ZZ(150, 120) }), 34, -36, 0.72, KOTATSU));
  add('kotatsupc', 'こたつでおしごと', peek('half', { tf: [0, -12, 0, 0.84], hp: H.glasses, over: KOTATSU0 + g(192, 100, sh('M-26 -26 L26 -26 L24 4 L-24 4 Z', 'gray') + ov2(0, -12, 4, 4)) + paw(100, 104, 9, 6) + paw(142, 104, 9, 6) }));
  add('nabe', 'お鍋をかこむ', hold('kira', { paws: [96, 150, 146, 150], over: g(121, 156, NABE, 0, 0.9) + steam(100, 150) + steam(144, 150) + ln('M150 140 L176 100 M156 142 L184 104') }));
  add('xmastree', 'ツリーのかざりつけ', mini(S2('happy', { arms: [96, 140, 170, 66] }), -16, 26, 0.84, g(180, 128, XTREE, 0, 1.25), g(140, 82, XSTAR, 0, 1.3)));
  add('present', 'プレゼントの箱に入る', peek('kira', { tf: [0, 30, 0, 0.9], hp: g(150, 50, sh2('M0 0 C -12 -12 -18 -2 0 0 Z M0 0 C 12 -12 18 -2 0 0 Z', 'yellow'), 20), over: g(121, 148, PRESENT(150, 50)) }));
  add('stocking', '靴下をつるして待つ', sit('up', { tf: [-20, 0, -6, 1], over: ln('M150 30 L230 30') + g(196, 60, STOCKING, 0, 1.3) + star(40, 40) }));
  add('xmascake', 'ケーキをじっと見る', sit('kira', { over: g(121, 170, CAKE, 0, 1.1) }));
  add('hatsuhinode', '初日の出', backWith('<circle class="w-apricot" cx="190" cy="150" r="44"/>' + g(190, 150, sh('M-26 0 A26 26 0 0 1 26 0 Z', 'orange')) + ln('M0 150 L60 150 M176 150 L240 150') + ln('M150 120 l-8 -6 M188 104 l0 -10 M222 118 l8 -6')));
  const kgTop = mini(mk('loaf', 'happy', { hp: H.mikan, hatY: 32 }), 54, 22, 0.56);
  add('kagami', '鏡もちになる', { svg: mini(mk('loaf', 'closed'), 20, 30, 0.84).svg + kgTop.svg + sh('M30 186 L210 186 L200 198 L40 198 Z', 'prop-straw'), head: kgTop.head, neck: null });
  add('kadomatsu', '門松のとなりで', sit('happy', { under: g(32, 150, KADOMATSU, 0, 1.1) }));
  add('tako', '凧あげ', mk('run', 'happy', { under: g(206, 30, KITE, 20) + ln('M58 162 Q150 120 200 50') }));
  add('omochi', 'おもちがのびる', hold('closed', { paws: [138, 156, 150, 150], held: g(160, 170, MOCHIPLATE) + sh2('M118 112 Q130 140 154 166 L160 166 Q134 136 124 112 Z') }));
  add('omikuji', 'おみくじ', hold('kira', { paws: [134, 124, 150, 126], held: g(152, 108, OMIKUJI, 10, 1.6) }));
  add('otoshidama', 'お年玉', hold('tere', { paws: [112, 146, 132, 146], held: g(122, 140, ENVELOPE, 0, 1.1) }));
  add('mamemaki', '豆まき', S2('kiri', { arms: [100, 132, 176, 50], held: g(102, 144, MASU), over: BEANS([[190, 30], [204, 50], [214, 22], [196, 70], [222, 66]]) }));
  add('onimen', '鬼のお面', sit('jito', { hp: g(121, 44, ONI, -8, 1), hatY: 18 }));
  add('ehomaki', '恵方巻をだまって食べる', hold('dot', { paws: [100, 150, 118, 140], held: g(111, 139, EHOMAKI, -70, 0.8) }));
  add('valentine', 'チョコをどうぞ', hold('tere', { paws: [112, 146, 132, 146], held: g(122, 140, CHOCO, 0, 1.2) }));

  // ================= しごとと趣味 =================
  add('fryegg', '目玉焼きをつくる', S2('down', { arms: [92, 130, 146, 136], held: g(98, 124, PAN, 0, 0.9) + ln('M150 100 q-4 -8 1 -14 M160 98 q-4 -8 1 -14') }));
  add('ajimi', '味見', S2('closed', { arms: [104, 140, 146, 116], under: '', over: g(176, 170, BIGPOT, 0, 1) + g(128, 88, LADLE, 122, 0.9) }));
  add('ninjin', 'にんじんを切る', hold('down', { paws: [110, 152, 140, 150], over: g(121, 162, BOARD) + g(108, 156, CARROT, 0, 0.9) + g(140, 156, KNIFE, -10, 0.8) + ov2(170, 162, 4, 3, 'orange') + ov2(180, 160, 4, 3, 'orange') }));
  add('onigiri', 'おにぎりをにぎる', hold('mogu', { paws: [110, 144, 134, 144], held: g(122, 140, ONIGIRI, 0, 1.1) }));
  add('easel', '絵を描く', mk('side', 'down', { hp: H.beret, hatY: 44, over: g(36, 150, EASEL, 0, 1.1) + arm(100, 132, 72, 118, 13) + g(70, 116, BRUSH, -90, 0.8) }));
  add('enogu', '絵の具まみれ', sit('happy', { hp: ov2(92, 104, 4, 3, 'blue') + ov2(150, 72, 4, 3, 'prop-red') + ov2(134, 112, 3, 3, 'yellow'), over: g(56, 168, PALETTE, 0, 1.2) + arm(146, 132, 170, 112, 13) + g(170, 108, BRUSH, -30, 0.9) }));
  add('guitar', 'ギターをひく', hold('closed', { paws: [110, 158, 150, 138], held: g(112, 156, GUITAR, -24, 1.1), over: g(196, 56, NOTES) + g(40, 80, NOTE1) }));
  add('piano', 'ピアノをひく', hold('closed', { tf: [0, -6, -6, 0.96], paws: [96, 150, 146, 150], over: g(121, 156, KEYS(150)) + MUSIC }));
  add('taiko', '太鼓をたたく', S2('kiri', { arms: [74, 54, 170, 54], armsBack: true, over: g(121, 172, TAIKO, 0, 1.1) + g(70, 52, BACHI, -30) + g(174, 52, BACHI, 30) + ln('M90 150 l-8 -6 M152 150 l8 -6') }), 'upright');
  add('recorder', 'リコーダー', hold('closed', { paws: [114, 134, 128, 150], held: g(121, 112, RECORDER, 0, 1), over: g(186, 60, NOTE1) + g(56, 70, NOTE1) }), 'blink');
  add('karaoke', 'カラオケ', S2('nyaa', { arms: [100, 132, 132, 112], held: g(128, 100, MIC, -10, 0.9), over: MUSIC + g(200, 30, SPARK(6)) }), 'upright');
  add('naeue', '苗を植える', mk('crouch', 'happy', { over: g(24, 170, SPROUT, 0, 1) }));
  add('daikon', '大根を抜く', S2('squint', { arms: [112, 122, 132, 122], hp: H.sweat, held: g(122, 150, DAIKON, 0, 0.9) + sh('M50 182 L194 182 L194 198 L50 198 Z', 'brown'), over: ln('M60 120 l-10 -4 M184 120 l10 -4') }), 'freeze');
  add('tomato', 'トマトの収穫', hold('kira', { paws: [112, 146, 132, 146], held: g(122, 140, ov(0, 0, 14, 12, 'prop-red') + sh2('M-6 -11 L0 -16 L6 -11 L0 -8 Z', 'green')) }));
  add('bigfish', '大物が釣れた', S2('kira', { arms: [92, 132, 152, 132], held: g(122, 138, FISH('blue'), -10, 3) + g(200, 40, SPARK(6)) }), 'upright');
  add('fishboot', '長靴が釣れた', mk('side', 'jito', { over: ln('M96 150 L200 40 L210 120') + g(212, 136, OLDBOOT, 0, 1) + arm(100, 130, 100, 150, 13) }));
  add('fishnap', '釣りをしながらうとうと', mk('side', 'closed', { tf: [-24, 4, 10, 0.88], over: ln('M96 150 L220 30 L224 170') + ov(224, 170, 4, 6, 'prop-red') + arm(100, 130, 100, 150, 13) + ZZ(150, 50), sleeping: true }));
  add('tripod', '星空を撮る', mk('side', 'wink', { under: g(32, 140, TRIPOD, 0, 1.1), over: star(200, 30, 5) + star(170, 18, 3) + star(220, 70, 3) + star(130, 20, 4) }));
  add('selfie', '自撮り', sit('wink', { tf: [-8, 0, -10, 1], over: arm(146, 132, 190, 70, 13) + g(196, 60, PHONE, 20, 1) + g(40, 40, SPARK(5)) }), 'blink');
  add('longscarf', '長すぎるマフラーを編む', hold('half', { paws: [106, 150, 136, 150], held: g(121, 152, NEEDLES) + sh('M121 158 C 150 176 190 170 212 180 L210 196 C 180 188 140 196 112 172 Z', 'prop-red') + ln('M150 174 l2 12 M176 176 l0 14 M198 180 l-2 12') }));
  add('shodo', '書道', hold('kiri', { paws: [110, 152, 144, 146], under: '', held: g(110, 168, HANSHI, 0, 0.6) + g(146, 150, FUDE, 10) }));
  add('game', 'ゲームに夢中', mk('lean', 'kiri', { rarm: [130, 150], over: g(112, 154, PAD, 0, 1.1) + ln('M170 70 l8 -6 M174 82 l10 -2') }));
  add('handheld', '寝ころんでゲーム', mk('flat', 'down', { chin: true, noFront: true, held: g(66, 178, HANDHELD) + paw(42, 182, 10, 6) + paw(90, 182, 10, 6) }));
  add('readlamp', 'スタンドの灯りで読書', hold('down', { tf: [-14, -4, 0, 0.96], paws: [84, 152, 134, 152], held: g(108, 150, BOOK('green')), under: g(196, 140, DESKLAMP, 0, 1.1) }));
  add('sakasa', '本がさかさま', hold('dot', { tf: [0, 2, 0, 0.96], paws: [96, 152, 146, 152], held: g(121, 150, BOOK('prop-red'), 180), over: ln('M186 70 l0 -12 M186 74 l0 1') }), 'stare');
  add('atsui', 'ぶあつい本', mk('flat', 'down', { tf: [-60, 46, 0, 0.72], noFront: true, held: g(110, 180, sh('M-50 -6 Q-25 -16 0 -6 Q25 -16 50 -6 L50 14 Q25 4 0 14 Q-25 4 -50 14 Z') + sh('M-52 14 L52 14 L52 20 L-52 20 Z', 'prop-red') + ln('M0 -6 L0 14 M-40 -2 L-10 0 M10 0 L40 -2 M-40 4 L-10 6 M10 6 L40 4')) + paw(60, 186, 10, 6) + paw(162, 186, 10, 6) }));
  add('tantei', '虫めがねで調べる', sit('side', { hp: g(144, 90, MAGNI, 0, 1.15), over: arm(146, 132, 170, 112, 13) }), 'sideeye');
  add('typing', 'カタカタ入力', hold('kiri', { paws: [104, 150, 140, 150], hp: H.glasses, over: g(121, 156, KEYBOARD) + ln('M86 140 l-8 -4 M86 148 l-10 0 M158 140 l8 -4 M158 148 l10 0') }));
  add('kaigi', 'オンライン会議', sit('open', { hp: H.phones + ln('M74 100 Q80 118 100 116'), over: g(121, 156, LAPTOP) + arm(152, 134, 190, 110, 13) }));
  add('diy', '日曜大工', hold('kiri', { paws: [104, 150, 154, 120], over: g(110, 152, BIRDHOUSE, 0, 1) + g(160, 120, HAMMER, -50, 0.9) + ln('M136 110 l6 -8 M126 106 l0 -10') }));
  add('penki', 'ペンキぬり', mini(S2('happy', { arms: [96, 140, 166, 70] }), -16, 26, 0.84, sh('M150 10 L230 10 L230 196 L150 196 Z', 'yellow') + ln('M176 10 L176 150 M200 10 L200 120'), g(130, 86, ROLLER, 0, 1)));
  add('mazeru', '生地をまぜる', hold('down', { paws: [104, 154, 136, 140], held: g(121, 160, BOWL, 0, 1.1) + g(134, 152, WHISK, 20, 0.9) }));
  add('oven', 'オーブンの前で待つ', sit('dot', { tf: [-24, 0, 0, 0.94], under: '', over: g(186, 156, OVEN, 0, 0.9) }));
  add('cookie', 'クッキーの型ぬき', hold('kira', { paws: [112, 146, 132, 146], held: g(122, 140, COOKIE, 0, 1.6), over: g(50, 176, COOKIE, 20) + g(196, 180, COOKIE, -10) }));
  add('sadou', 'お茶をたてる', hold('closed', { paws: [110, 156, 140, 148], held: g(121, 164, CHAWAN, 0, 1.2) + g(140, 150, CHASEN, 0, 1) }));
  add('ikebana', '生け花', sit('half', { under: g(40, 150, IKEBANA, 0, 1.1) }));
  add('puzzle', 'ジグソーパズル', mk('flat', 'down', { chin: true, under: '', over: g(112, 192, PUZZLE('blue')) + g(132, 190, PUZZLE('yellow'), 90) + g(156, 192, PUZZLE('green'), 180) + g(30, 140, PUZZLE('prop-pink'), 30) }));
  add('shogi', '将棋で長考', sit('up', { tf: [0, 0, -6, 1], over: g(121, 162, SHOGI) + arm(146, 132, 136, 118, 13) + dot(176, 54, 2) + dot(186, 44, 2.6) }));
  add('otedama', 'お手玉', S2('kira', { arms: [64, 112, 180, 112], over: g(100, 18, OTEDAMA('prop-red')) + g(140, 10, OTEDAMA('blue')) + g(186, 40, OTEDAMA('yellow')) + ln('M100 30 Q120 0 140 22') }), 'upright');
  add('yoga', 'ヨガ（木のポーズ）', mini(S2('closed', { arms: [117, -6, 127, -6], armsBack: true }), 20, 34, 0.84, '', ln('M40 190 q8 -4 16 0 M184 190 q8 -4 16 0')));
  add('nawatobi', 'なわとび', mini(S2('happy', { arms: [76, 140, 168, 140] }), 0, -10, 1, '<ellipse class="w-mask" cx="122" cy="196" rx="40" ry="3"/>', ln('M70 136 Q122 240 174 136') + ln('M50 120 l-8 -4 M194 120 l8 -4')), 'maneki');
  add('skateboard', 'スケボー', mini(S2('kira', { arms: [56, 96, 188, 96] }), 22, 6, 0.84, '', g(122, 172, SKATE, -4, 1.1) + MOTION(236, 150) + MOTION(236, 100)), 'upright');
  add('benkyou', '勉強中', hold('down', { tf: [0, -6, 0, 0.96], paws: [110, 150, 148, 146], hp: H.glasses, over: DESK(156) + g(110, 150, NOTE, 0, 0.9) + g(146, 146, PENCIL, -30, 0.8) + g(40, 134, BOOKS, 0, 0.6) }));
  add('sentaku', '洗濯物を干す', S2('happy', { arms: [70, 40, 176, 40], armsBack: true, under: ln('M0 32 L240 32'), over: g(72, 32, SOCK()) + g(176, 32, SOCK('blue')) + g(214, 36, SHIRT) + g(28, 36, SHIRT, 0, 0.9) }));
  add('airon', 'アイロンがけ', hold('kiri', { paws: [104, 154, 144, 154], over: g(121, 168, sh('M-60 -6 L60 -6 L60 10 L-60 10 Z', 'blue')) + g(144, 152, IRON, 0, 1) + steam(150, 138) }));
  add('soujiki', '掃除機にびっくり', mk('tall', 'shock', { tf: [-8, -16, -10, 0.84], over: g(186, 186, VACUUM, 0, 1) + ln('M150 160 l-8 -4 M152 170 l-10 0 M40 60 L40 76 M30 64 L30 74') }), 'freeze');
  add('osara', 'お皿洗い', hold('half', { paws: [104, 150, 136, 150], held: g(121, 152, PLATE) + g(150, 120, BUBBLE(6)) + g(90, 116, BUBBLE(4)) + g(164, 100, BUBBLE(3)) }));
  add('tougei', '陶芸', hold('down', { paws: [104, 160, 140, 160], over: g(121, 176, WHEEL, 0, 1) + ln('M60 180 q-6 -4 -12 0 M196 180 q6 -4 12 0') }));
  add('bonsai', '盆栽の手入れ', sit('half', { under: g(38, 164, BONSAI, 0, 1.2), over: arm(97, 132, 72, 132, 13) + g(62, 130, SCISSORS, -60, 0.9) }));
  add('chikyugi', '地球儀を回す', sit('kira', { over: g(186, 148, GLOBE, 0, 1) + arm(146, 132, 168, 140, 13) + MOTION(220, 112) }));
  add('rakugaki', 'らくがき', mk('flat', 'happy', { chin: true, noFront: true, held: g(110, 184, sh('M-34 -10 L34 -12 L36 12 L-34 12 Z') + `<g transform="translate(-6 0) scale(0.16) translate(-121 -84)">${HEAD}</g>` + ln('M12 -6 l14 4 M12 4 l12 0')) + paw(40, 184, 10, 6) + g(76, 184, PENCIL, -10, 0.8) + paw(78, 186, 9, 6) }));
  add('tejina', '手品（ハトが出る）', S2('doya', { arms: [100, 132, 166, 112], held: g(176, 118, TOPHAT, 180, 0.9) + g(178, 96, BIRD, -20, 1.1), over: g(210, 100, SPARK(6)) + g(160, 170, SPARK(4)) }), 'freeze');
  add('chizu', '地図を広げる', hold('komari', { paws: [82, 148, 160, 148], held: g(121, 150, MAP, 0, 1.2), hp: H.sweat }));

  // ================= ちょっと変 =================
  add('sakadachi', '逆立ち', mk('handstand', 'happy', { over: ln('M60 196 l-10 0 M180 196 l10 0') }), 'upright');
  add('kabe', '壁にはりつく', mk('sprawl', 'line', { under: sh('M12 6 L228 6 L228 196 L12 196 Z', 'sand') + ln('M12 56 L228 56 M12 106 L228 106 M12 156 L228 156 M80 6 L80 56 M160 56 L160 106 M60 106 L60 156 M190 106 L190 156 M120 156 L120 196'), over: ln('M40 30 l-10 -6 M200 30 l10 -6') }), 'plank');
  add('kamibukuro', '紙袋に半分入る', { svg: tail('M196 140 C 220 130 226 104 214 88', '196px 140px') +
      sh('M140 118 C 170 106 200 120 202 150 C 204 172 196 186 184 188 L150 188 Z') + paw(176, 191, 11, 6) + paw(204, 189, 10, 6) + PAPERBAG,
    head: { x: 96, y: 104, r: -6 }, neck: null });
  add('teacupin', 'ティーカップに入る', peek('closed', { tf: [0, 30, 0, 0.84], under: ov(121, 142, 64, 12, 'brown'), over: g(121, 142, sh('M-64 0 A64 12 0 0 0 64 0 Q60 50 0 54 Q-60 50 -64 0 Z', 'teal') + ln('M64 10 C 90 8 90 40 56 36')) + ov(121, 196, 84, 6, 'teal') + steam(60, 120) + steam(186, 120) }));
  add('tamanori', '玉乗り', mini(S2('komari', { arms: [52, 88, 192, 88], hp: H.sweat }), 41, 11, 0.66, g(122, 168, BIGBALL(30))), 'freeze');
  add('lampshade', 'ランプシェードをかぶる', sit('dot', { hp: LAMPSHADE, hatY: 16 }), 'stare');
  const lf = mk('loaf', 'closed');
  add('shokupan', '食パンになる', { ...lf, svg: lf.svg.replace('<path class="b" d="M56 186 C 48 150', `<path ${cl('bread')} d="M56 186 C 48 150`).replace('<g transform', sh2('M70 180 C 64 156 82 136 121 134 C 160 136 178 156 172 180 Z', 'sand') + '<g transform') });
  add('kumo', '雲にのってぷかぷか', mini(mk('loaf', 'happy'), 32, -30, 0.74, '', g(122, 150, CLOUD, 0, 1.5) + ln('M30 170 q10 -4 20 0 M190 176 q10 -4 20 0')));
  add('sushi', 'お寿司になる', mini(mk('loaf', 'dot'), 30, 6, 0.76, g(121, 168, RICE, 0, 1.15), sh('M150 106 L170 110 L172 180 L150 182 Z', 'dark')), 'stare');
  add('nekonabe', 'ねこ鍋', peek('closed', { tf: [0, 26, 0, 0.84], over: g(121, 150, NABE, 0, 1.2) + steam(50, 150) + steam(196, 146), sleeping: true }));
  add('uekibachi', '植木鉢から生える', peek('dot', { tf: [0, 20, 0, 0.8], over: g(121, 142, sh('M-50 0 L50 0 L40 54 L-40 54 Z', 'brown') + sh('M-56 -8 L56 -8 L56 4 L-56 4 Z', 'brown')) + g(196, 120, LEAF(), -40) + g(40, 110, LEAF(), 220) }));
  add('bin', '瓶に入る', { svg: mini(mk('curl', 'closed'), 50, 64, 0.6).svg + glassSh('M70 70 L170 70 L172 84 Q190 96 190 120 L190 186 Q190 196 180 196 L60 196 Q50 196 50 186 L50 120 Q50 96 68 84 Z') +
      sh('M66 56 L174 56 L174 70 L66 70 Z', 'brown'), head: { x: 120, y: 56, r: 0 }, neck: null, sleeping: true });
  add('hikidashi', '引き出しから出てくる', peek('open', { tf: [0, 8, 0, 0.84], under: sh('M20 64 L220 64 L220 112 L20 112 Z', 'brown'), over: sh('M20 112 L220 112 L220 156 L20 156 Z', 'brown') + ov2(120, 134, 8, 3, 'dark') + sh('M20 156 L220 156 L220 200 L20 200 Z', 'brown') + paw(80, 112, 10, 6) + paw(160, 112, 10, 6) }));
  add('shoji', '障子の穴から', { svg: SHOJI + `<g transform="translate(90 70)"><circle class="b" cx="0" cy="0" r="24" style="fill:#5b5b66"/>${'<clipPath id="shojihole"><circle cx="0" cy="0" r="22"/></clipPath>'}<g clip-path="url(#shojihole)"><rect x="-24" y="-24" width="48" height="48" fill="#fffdf8"/>${wash('w-mask', 0, 2, 15, 11)}${eye(0, 2)}</g></g>` +
      ln('M66 70 l-6 -4 M70 52 l-4 -6 M110 56 l6 -4 M114 82 l6 2'), head: { x: 90, y: 46, r: 0 }, neck: null }, 'stare');
  add('dokan', '土管を通りぬける', { svg: tail('M196 148 C 216 148 226 132 222 116', '196px 148px') + PIPE + ov(50, 148, 8, 30, 'dark') + `<g transform="${headTf(-62, 58, 0, 0.66)}">${HEAD}${faceOf('round')}</g>` + paw(30, 168, 8, 5) + paw(52, 172, 8, 5),
    head: headAt(-62, 58, 0, 0.66), neck: null }, 'freeze');
  const mr = mini(sit('jito'), -10, 50, 0.62);
  add('mirror', '鏡の中の自分と', { svg: mr.svg + sh('M130 20 L226 20 L226 196 L130 196 Z', 'brown') + glassSh('M138 28 L218 28 L218 188 L138 188 Z') +
      `<g transform="translate(250 50) scale(-0.62 0.62)">${sit('jito').svg}</g>`, head: mr.head, neck: mr.neck }, 'stare');
  add('ramen', 'ラーメンになる', peek('happy', { tf: [0, 22, 0, 0.84], under: '', over: g(121, 140, BOWLBIG, 0, 1) + ln('M70 140 q10 10 20 0 q10 -10 20 0 q10 10 20 0 q10 -10 20 0 q10 10 20 0') + g(164, 144, NARUTO, 0, 1) + ln('M170 70 L200 150 M180 66 L206 148', true) }), 'yawn');
  add('daruma', 'だるまになる', { svg: sh('M50 160 C 40 70 80 30 121 30 C 162 30 202 70 192 160 C 186 196 56 196 50 160 Z', 'prop-red') + ln('M70 150 q12 -10 20 4 M152 150 q12 -10 20 4 M100 170 L142 170') +
      `<g transform="${headTf(0, 10, 0, 0.82)}">${HEAD}${faceOf('kiri')}</g>`, head: headAt(0, 10, 0, 0.82), neck: null }, 'stare');
  add('nagagutsu', '長ぐつに入る', peek('open', { tf: [-20, 2, 0, 0.8], over: g(100, 140, sh('M-44 -40 L40 -40 L36 40 L90 44 Q104 56 90 60 L-44 60 Z', 'yellow') + ln('M-44 -28 L40 -28')) }));
  add('baketsu', 'バケツに入る', peek('half', { tf: [0, 26, 0, 0.84], over: g(121, 162, BUCKET, 0, 1.15) + paw(90, 130, 9, 6) + paw(152, 130, 9, 6) }));
  add('tissue', 'ティッシュ箱から', peek('round', { tf: [0, 24, 0, 0.8], hp: sh2('M108 56 Q100 34 116 20 Q122 34 132 22 Q144 38 134 56 Z'), hatY: 24, over: g(121, 168, TISSUE, 0, 1.4) }), 'freeze');
  add('icecone', 'アイスになる', mini(mk('loaf', 'happy'), 44, -20, 0.64, '', g(122, 100, sh('M-48 0 Q-40 -8 -30 -2 Q-20 6 -10 -2 Q0 -8 10 -2 Q20 6 30 -2 Q40 -8 48 0 L44 8 L-44 8 Z', 'prop-pink') + g(0, 8, CONE, 0, 1.0))), 'blink');
  add('katatsumuri', 'かたつむりになる', mk('loaf', 'open', { tf: [-34, 40, 0, 0.8], under: '', over: g(150, 140, SHELL, 0, 1) + ln('M78 92 l-6 -20 M98 90 l4 -20') + ov2(72, 70, 3, 3) + ov2(102, 68, 3, 3) }));
  add('fusen', '風船で飛んでいく', mini(S2('wow', { arms: 'up' }), 50, 60, 0.6, g(70, 40, BALLOON('prop-red', 40), -20) + g(120, 24, BALLOON('blue', 40)) + g(170, 40, BALLOON('yellow', 40), 20)), 'cosmos');
  add('hakoatama', '箱をかぶる', { svg: sitTorso() + sh('M74 40 L168 40 L166 128 L76 128 Z', 'prop-straw') + sh2('M84 40 L92 22 L104 40 Z M138 40 L150 22 L158 40 Z') + ln('M74 40 L60 28 M168 40 L182 28 M100 84 L142 84') + ov2(121, 100, 7, 4, 'dark'),
    head: { x: 121, y: 40, r: 0 }, neck: { x: 121, y: 128, w: 74 } }, 'stare');
  add('penguin', 'ペンギン歩き', S2('dot', { arms: [72, 128, 172, 128], over: ln('M40 176 l-6 6 M200 176 l6 6 M30 150 q-6 -4 -12 0') }), 'plank');
  const sdTop = mini(mk('loaf', 'dot'), 72.6, -24, 0.4);
  add('sandan', 'ねこが三段', { svg: mini(mk('loaf', 'closed'), 19.4, 30, 0.84).svg + mini(mk('loaf', 'half'), 48.4, -6, 0.6).svg + sdTop.svg, head: sdTop.head, neck: null }, 'stare');
  add('sakasama', 'さかさまにぶらさがる', { svg: ln('M30 6 L210 6', true) + `<g transform="rotate(180 122 96)">${S2('pero', { arms: [104, 150, 140, 150] }).svg}</g>`,
    head: { x: 122, y: 162, r: 180 }, neck: null }, 'freeze');
  add('sukima', 'すき間にはさまる', { svg: sh('M10 0 L88 0 L88 200 L10 200 Z', 'brown') + sh('M154 0 L232 0 L232 200 L154 200 Z', 'brown') +
      `<g transform="translate(121 100) scale(0.62 1) translate(-121 -92)">${HEAD}${faceOf('line')}</g>` + paw(104, 150, 7, 5) + paw(138, 150, 7, 5) + ln('M70 100 l-8 0 M172 100 l8 0'),
    head: { x: 121, y: 64, r: 0 }, neck: null }, 'plank');
  const ctn = mini(mk('hang', 'komari'), 36, 30, 0.7);
  add('curtain', 'カーテンにのぼる', { svg: sh('M10 0 L230 0 L230 10 L10 10 Z', 'brown') + sh('M30 10 Q60 100 30 200 L120 200 Q100 100 120 10 Z', 'blue') + sh('M120 10 Q150 100 120 200 L210 200 Q180 100 210 10 Z', 'blue') +
      ctn.svg.replace(/<path class="l" d="M30 16 L210 16"\/>|<path class="l thin" d="M40 16 L40 0 M200 16 L200 0"\/>/g, ''), head: ctn.head, neck: null }, 'freeze');
  add('roomba', 'お掃除ロボに乗る', mini(mk('loaf', 'jito'), 36, 35, 0.7, '', g(122, 174, ROOMBA, 0, 1.2) + MOTION(236, 170) + MOTION(30, 150)));
  add('hammock', 'ハンモック', peek('closed', { tf: [0, 40, -10, 0.8], under: ln('M14 30 L14 200 M226 30 L226 200', true), over: sh('M14 60 Q121 200 226 60 Q170 150 121 156 Q72 150 14 60 Z', 'prop-straw') + ln('M40 90 Q121 160 200 90'), sleeping: true }));
  add('isu', '人みたいに椅子にすわる', mk('lean', 'doya', { under: CHAIR, rarm: [168, 136], over: g(176, 126, TEA, 0, 0.7) }));
  add('kyuuribikkuri', 'きゅうりにびっくり', { svg: P.upright.svg + g(196, 176, CUKE0, -10, 0.8) + ln('M188 140 l6 -10 M204 146 l8 -6 M60 40 L60 56 M180 30 L180 48'), head: P.upright.head, neck: P.upright.neck }, 'freeze');
  add('bubblegum', 'ふうせんガム', sit('closed', { over: g(121, 124, GUM, 0, 1.2) }), 'yawn');
  add('peace', 'ピース', sit('wink', { over: arm(146, 132, 168, 92, 13) + ln('M164 84 l-4 -14 M172 84 l6 -12') + g(196, 50, SPARK(5)) }), 'maneki');
  add('ninja', '隠れ身の術', { svg: sitTorso() + headG('kiri', 0, 0) + NINJACLOTH + paw(136, 110, 7, 6), head: { x: 121, y: 56, r: 0 }, neck: null }, 'hide');
  add('hige', 'つけひげ', sit('doya', { hp: MUSTACHE }), 'sideeye');
  add('hero', 'マントで飛ぶ', mk('run', 'kiri', { under: sh('M112 108 L160 104 Q200 90 234 66 Q224 98 236 122 Q200 116 170 134 Z', 'prop-red'), over: MOTION(236, 160) }), 'upright');
  add('kendama', 'けん玉', hold('kira', { paws: [118, 152, 136, 152], held: g(134, 154, KENDAMA, 30, 1) }), 'freeze');
  add('hulahoop', 'フラフープ', S2('kiri', { arms: [74, 80, 170, 80], under: g(122, 140, HOOP(54, 12)), over: g(122, 140, '<path class="l" style="stroke:#e9928c;stroke-width:5" d="M-54 0 A54 12 0 0 0 54 0"/>') + ln('M50 150 q-6 -4 -12 0 M194 150 q6 -4 12 0') }), 'roll');
  add('rappa', 'ラッパ', hold('squint', { paws: [118, 136, 134, 136], held: g(126, 116, TRUMPET, 0, 1) + MUSIC }), 'yawn');
  add('ouen', 'ポンポンで応援', S2('happy', { arms: 'up', over: g(74, 50, POMPOM('prop-pink'), 0, 1.2) + g(170, 50, POMPOM('yellow'), 0, 1.2) }), 'maneki');
  add('shiki', '指揮者', S2('closed', { arms: [76, 122, 166, 60], armsBack: true, held: g(166, 60, BATON), over: MUSIC }), 'bow');
  add('boxing', 'ボクシング', S2('kiri', { arms: [104, 120, 144, 116], over: g(104, 118, GLOVE()) + g(146, 114, GLOVE()) + ln('M176 100 l10 -4 M178 112 l12 0') }), 'sideeye');
  add('yakyu', 'バットをかまえる', S2('kiri', { arms: [124, 112, 136, 110], over: g(130, 110, BAT, -30, 1) }), 'stare');
  add('jump', 'ジャンプ', mini(S2('wow', { arms: 'up' }), 20, -10, 0.86, '<ellipse class="w-mask" cx="122" cy="194" rx="40" ry="4"/>', ln('M70 180 l-6 6 M176 180 l6 6')), 'upright');
  add('bee', 'あっかんべー', sit('pero', { over: arm(98, 132, 92, 92, 13) }), 'sneeze');

  // ---- 見本帳とセリフの補い ----
  Object.assign(L, {
    sit: 'おすわり', stand: '横向きに立つ', loaf: '香箱で寝る', back: 'うしろ姿', stretch: 'のび', upright: 'びっくり立ち', groom: '毛づくろい',
    sideeye: '横目', blink: 'ゆっくりまばたき', roll: 'ごろーん', freeze: 'かたまる', stare: '真顔', tilt: '首かしげ', maneki: '招き猫', yawn: 'あくび',
    cosmos: '宇宙を見た顔', plank: '棒', bow: 'おじぎ', sneeze: 'くしゃみ', hide: '目をかくす', box: '箱からあふれる', float: '浮く', teacup: '湯のみ',
    gaze: '遠くを見る', tailstare: 'しっぽと向き合う', newspaper: '新聞', melt: 'とける', sunbath: 'ひなたでへそ天', sockhold: '靴下をだいて寝る', bag: '紙袋から顔',
  });
  window.PoseLabels = L;

  // 胸の前で物を持つポーズは、マフラーで手元が隠れないようにする
  ['kira', 'heart', 'camera', 'clap', 'dango', 'icecream', 'origami',
    'ichigo', 'suikaseeds', 'momiji', 'yakiimo', 'omochi', 'omikuji', 'otoshidama', 'ehomaki', 'valentine', 'onigiri', 'tomato', 'cookie',
    'recorder', 'kendama', 'rappa', 'karaoke', 'chizu', 'nabe', 'senkou', 'readlamp', 'sakasa', 'osara', 'bubblegum'].forEach((n) => { if (P[n]) P[n].neck = null; });
  window.Poses = P;
  // 派手な動き用（頭だけ回すときなどに使う）
  window.PoseParts = { sitTorso, headG };
  // なでたときに出てくるポーズ
  window.TapPoses = ['upright', 'groom', 'sideeye', 'blink', 'roll', 'freeze', 'stare', 'tilt', 'maneki', 'yawn', 'cosmos', 'plank', 'bow', 'sneeze', 'hide',
    'banzai', 'wave', 'doya', 'jito', 'komari', 'kira', 'wink', 'nyaa', 'uruuru', 'punch', 'hunt', 'yarn', 'ballchase', 'butterfly', 'birdfriend',
    'balloon', 'crown', 'shades', 'megane', 'flag', 'sign', 'fishmouth', 'muscle', 'hang', 'music', 'boxpeek', 'plane', 'bubbles', 'heart', 'daiji',
    'wiggle', 'closeup', 'closejito', 'tiltkomari', 'peekwall', 'camera', 'gaan', 'tere', 'ribbon', 'dango', 'icecream', 'mikanhead', 'leafhead',
    'sneak', 'think', 'salute', 'clap', 'tinybox', 'pawshow',
    'taiko', 'recorder', 'karaoke', 'daikon', 'bigfish', 'selfie', 'sakasa', 'tantei', 'tejina', 'otedama', 'nawatobi', 'skateboard', 'soujiki',
    'sakadachi', 'kabe', 'tamanori', 'lampshade', 'sushi', 'shoji', 'dokan', 'mirror', 'ramen', 'daruma', 'tissue', 'icecone', 'fusen',
    'hakoatama', 'penguin', 'sandan', 'sakasama', 'sukima', 'curtain', 'kyuuribikkuri', 'bubblegum', 'peace', 'ninja', 'hige', 'hero',
    'kendama', 'hulahoop', 'rappa', 'ouen', 'shiki', 'boxing', 'yakyu', 'jump', 'bee', 'kamibukuro', 'katatsumuri', 'enogu'];
  Object.assign(SAY, { kamibukuro: 'hide', katatsumuri: 'stare', enogu: 'blink' });
  // 時間帯ごとに、ときどき出てくるポーズ（いつものポーズが多め）
  window.DayPoses = {
    dawn: ['stretch', 'stretch', 'stretch', 'teacup', 'newspaper', 'eyemask', 'bedhair', 'alarm', 'futon', 'curl', 'dawnwindow', 'sleepsit',
      'coffee', 'halfloaf', 'nightcap'],
    morning: ['stretch', 'stretch', 'stretch', 'teacup', 'newspaper', 'bag', 'bedhair', 'coffee', 'toast', 'read', 'phone', 'water', 'broom',
      'laptop', 'diary', 'letter', 'newsglasses', 'walk', 'shopping', 'teatime'],
    day: ['sit', 'sit', 'sit', 'box', 'float', 'gaze', 'tailstare', 'melt', 'bag', 'teacup', 'sunbath', 'sunflat', 'chin', 'cushion', 'flowerpot',
      'smell', 'umbrella', 'teruteru', 'fishing', 'watermelon', 'uchiwa', 'basket', 'bento', 'sideways', 'tallsit', 'lean', 'noodle', 'ballnap',
      'lieback', 'birdwatch', 'butterflynose', 'boxnap', 'leaves', 'origami', 'cactus', 'grass', 'puddle', 'books', 'icecreamday', 'walk', 'read',
      'laptop', 'stareloaf'],
    evening: ['back', 'back', 'back', 'gaze', 'tailstare', 'box', 'newspaper', 'moon', 'lantern', 'ukulele', 'tv', 'sunset', 'snack', 'sideloaf',
      'shopping', 'walk', 'phone', 'sideways', 'lieback', 'uchiwa', 'chin'],
    night: ['loaf', 'loaf', 'loaf', 'sockhold', 'float', 'sunbath', 'melt', 'blanket', 'kotatsu', 'candle', 'stars', 'bedread', 'milk', 'bath',
      'knit', 'telescope', 'moonloaf', 'cushionsit', 'moon', 'pillowhug', 'halfloaf', 'midnight', 'curl', 'tv', 'read', 'stareloaf'],
    late: ['loaf', 'loaf', 'loaf', 'sockhold', 'sunbath', 'eyemask', 'nightcap', 'futon', 'curl', 'curlblanket', 'sleepsit', 'bellynap',
      'daijisleep', 'flatsleep', 'pillowhug', 'midnight', 'moonloaf', 'kotatsu'],
  };
  // 追加ぶん：出てくる時間帯（季節もののは、その月だけ）
  const TIMES = {
    // 季節（月は SEASON_MONTHS）
    hanami: 'day evening', sakuranose: 'morning day', hanafubuki: 'day', koinobori: 'morning day', kabuto: 'morning day', ichigo: 'day',
    ajisai: 'morning day', rainboots: 'morning day', tanabata: 'evening night', swimring: 'day', beach: 'day', suikawari: 'day',
    suikaseeds: 'day evening', kakigori: 'day', furin: 'day evening', senpuki: 'day night', hanabi: 'evening night', senkou: 'night',
    himawari: 'morning day', kingyo: 'day', kyuuri: 'evening', tomato: 'morning day', hammock: 'day',
    momiji: 'day', ochiba: 'day', tsukimi: 'evening night', yakiimo: 'day evening', kuri: 'day', kabocha: 'evening night', obake: 'evening night',
    trickortreat: 'evening', longscarf: 'night',
    yukidaruma: 'morning day', yukidama: 'day', yukiname: 'morning day night', kotatsumikan: 'evening night', kotatsukame: 'day night late',
    kotatsuue: 'day night', kotatsupc: 'morning day', nabe: 'evening night', xmastree: 'day evening', present: 'evening night',
    stocking: 'night late', xmascake: 'evening night', hatsuhinode: 'dawn morning', kagami: 'morning day', kadomatsu: 'morning day', tako: 'day',
    omochi: 'day evening', omikuji: 'morning day', otoshidama: 'morning', mamemaki: 'evening night', onimen: 'evening', ehomaki: 'evening night',
    valentine: 'day evening',
    // しごとと趣味（一年じゅう）
    fryegg: 'morning', ajimi: 'evening', ninjin: 'evening', onigiri: 'morning day', easel: 'day', guitar: 'evening night', piano: 'day evening',
    naeue: 'morning', fishboot: 'day', fishnap: 'day evening', tripod: 'night', shodo: 'morning day', game: 'evening night', handheld: 'night late',
    readlamp: 'night', atsui: 'day', typing: 'morning day', kaigi: 'morning day', diy: 'day', penki: 'day', mazeru: 'day evening',
    oven: 'day evening', cookie: 'day', sadou: 'morning day', ikebana: 'day', puzzle: 'night', shogi: 'evening', yoga: 'dawn morning',
    benkyou: 'evening night', sentaku: 'morning', airon: 'morning evening', osara: 'evening', tougei: 'day', bonsai: 'morning day',
    chikyugi: 'day', rakugaki: 'day', chizu: 'morning day',
    // ちょっと変（一年じゅう）
    kumo: 'day late', shokupan: 'morning', nekonabe: 'night late', uekibachi: 'day', bin: 'day night', hikidashi: 'morning night',
    nagagutsu: 'day', baketsu: 'day', roomba: 'morning day', isu: 'day evening', teacupin: 'day evening',
  };
  const SEASON_MONTHS = {
    hanami: [3, 4], sakuranose: [3, 4], hanafubuki: [4], koinobori: [4, 5], kabuto: [5], ichigo: [3, 4, 5],
    ajisai: [6], rainboots: [6, 7], tanabata: [7], swimring: [7, 8], beach: [7, 8], suikawari: [7, 8], suikaseeds: [7, 8], kakigori: [7, 8],
    furin: [7, 8], senpuki: [7, 8], hanabi: [7, 8], senkou: [8], himawari: [7, 8], kingyo: [7, 8], kyuuri: [8], tomato: [6, 7, 8, 9], hammock: [5, 6, 7, 8, 9],
    momiji: [10, 11], ochiba: [11], tsukimi: [9, 10], yakiimo: [10, 11, 12, 1, 2], kuri: [9, 10], kabocha: [10], obake: [10], trickortreat: [10],
    longscarf: [10, 11, 12, 1, 2],
    yukidaruma: [12, 1, 2], yukidama: [1, 2], yukiname: [12, 1, 2], kotatsumikan: [11, 12, 1, 2, 3], kotatsukame: [12, 1, 2], kotatsuue: [11, 12, 1, 2, 3],
    kotatsupc: [12, 1, 2], nabe: [11, 12, 1, 2], xmastree: [12], present: [12], stocking: [12], xmascake: [12], hatsuhinode: [1], kagami: [1],
    kadomatsu: [1], tako: [1], omochi: [1], omikuji: [1], otoshidama: [1], mamemaki: [2], onimen: [2], ehomaki: [2], valentine: [2],
  };
  const month = new Date().getMonth() + 1;
  Object.keys(TIMES).forEach((n) => {
    if (!P[n] || (SEASON_MONTHS[n] && !SEASON_MONTHS[n].includes(month))) return;
    TIMES[n].split(' ').forEach((t) => window.DayPoses[t].push(n));
  });
  // 見本帳用（季節で外れているものも、出る時間帯と月がわかるように）
  window.PoseTimes = TIMES;
  window.PoseMonths = SEASON_MONTHS;
  // なでたときのセリフが無いポーズは、似たポーズのセリフを借りる
  if (window.Messages && window.Messages.tap) {
    const tap = window.Messages.tap;
    Object.keys(SAY).forEach((n) => { if (!tap[n] && tap[SAY[n]]) tap[n] = tap[SAY[n]]; });
  }

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
