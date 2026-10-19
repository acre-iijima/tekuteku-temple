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

  // ---- 見本帳とセリフの補い ----
  Object.assign(L, {
    sit: 'おすわり', stand: '横向きに立つ', loaf: '香箱で寝る', back: 'うしろ姿', stretch: 'のび', upright: 'びっくり立ち', groom: '毛づくろい',
    sideeye: '横目', blink: 'ゆっくりまばたき', roll: 'ごろーん', freeze: 'かたまる', stare: '真顔', tilt: '首かしげ', maneki: '招き猫', yawn: 'あくび',
    cosmos: '宇宙を見た顔', plank: '棒', bow: 'おじぎ', sneeze: 'くしゃみ', hide: '目をかくす', box: '箱からあふれる', float: '浮く', teacup: '湯のみ',
    gaze: '遠くを見る', tailstare: 'しっぽと向き合う', newspaper: '新聞', melt: 'とける', sunbath: 'ひなたでへそ天', sockhold: '靴下をだいて寝る', bag: '紙袋から顔',
  });
  window.PoseLabels = L;
  if (window.Messages && window.Messages.tap) {
    const tap = window.Messages.tap;
    Object.keys(SAY).forEach((n) => { if (!tap[n] && tap[SAY[n]]) tap[n] = tap[SAY[n]]; });
  }

  // 胸の前で物を持つポーズは、マフラーで手元が隠れないようにする
  ['kira', 'heart', 'camera', 'clap', 'dango', 'icecream', 'origami'].forEach((n) => { if (P[n]) P[n].neck = null; });
  window.Poses = P;
  // 派手な動き用（頭だけ回すときなどに使う）
  window.PoseParts = { sitTorso, headG };
  // なでたときに出てくるポーズ
  window.TapPoses = ['upright', 'groom', 'sideeye', 'blink', 'roll', 'freeze', 'stare', 'tilt', 'maneki', 'yawn', 'cosmos', 'plank', 'bow', 'sneeze', 'hide',
    'banzai', 'wave', 'doya', 'jito', 'komari', 'kira', 'wink', 'nyaa', 'uruuru', 'punch', 'hunt', 'yarn', 'ballchase', 'butterfly', 'birdfriend',
    'balloon', 'crown', 'shades', 'megane', 'flag', 'sign', 'fishmouth', 'muscle', 'hang', 'music', 'boxpeek', 'plane', 'bubbles', 'heart', 'daiji',
    'wiggle', 'closeup', 'closejito', 'tiltkomari', 'peekwall', 'camera', 'gaan', 'tere', 'ribbon', 'dango', 'icecream', 'mikanhead', 'leafhead',
    'sneak', 'think', 'salute', 'clap', 'tinybox', 'pawshow'];
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
