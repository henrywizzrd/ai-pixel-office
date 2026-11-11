// =====================================================================
//  BỘ KHUNG NHÂN VẬT (base model) + HỆ THỐNG MẶC ĐỒ
//  Tỉ lệ: 21 × 47 px, đầu ~1/3 người, mắt anime 2×3, viền nâu, da 3 sắc độ.
//  3 hướng vẽ tay: front (đi xuống), back (đi lên), side (đi sang phải; sang trái = lật gương).
//  Mỗi hướng 3 khung: [bước A, đứng, bước B].
//
//  Mã vùng trong khung (mỗi ký tự = 1 pixel):
//    o viền | A a b  da đầu (sáng/vừa/tối) | N n cổ | k mí mắt | E e w mắt (đậm/nhạt/sáng) | M miệng
//    T t u  thân (sáng/vừa/tối) | R r q tay | H h bàn tay | L l m chân | F f bàn chân
// =====================================================================
(function (global) {
  const W = 21, CX = 10;

  // ------------------------------------------------------------------
  //  HƯỚNG TRƯỚC
  // ------------------------------------------------------------------
  const FRONT_HEAD = [
    '......ooooooooo......',
    '....ooAAAAAAAAAoo....',
    '...oAAAAAAAAAAAAAo...',
    '..oAAAAAAAAAAAAAAAo..',
    '..oAAAAAAAAAAAAAAao..',
    '.oaAAAAAAAAAAAAAAAao.',
    '.oaAAAAAAAAAAAAAAAao.',
    '.oaAAAAAAAAAAAAAAabo.',
    '.oaAAAkkAAAAAkkAAabo.',
    'oaaAAAEeAAAAAeEAAabbo',
    'oaaAAAewAAAAAweAAabbo',
    '.oaAAAeeAAAAAeeAAabo.',
    '.oaAAAAAAAAAAAAAAabo.',
    '..oaAAAAAAMAAAAAAbo..',
    '..oaaAAAAAAAAAAAabo..',
    '...oaaAAAAAAAAAaabo..',
    '....ooaaaaaaaaaoo....',
    '........oNNNo........',
  ];
  const FRONT_BODY = [
    '....ooTTTTnnnTTTToo..',
    '..ooRRoTTTTTTTTtoqroo',
    '..oRRoTTTTTTTTTtoqro.',
    '..oRRoTTTTTTTTTtoqro.',
    '..oRroTttTTTttTtoqro.',
    '..oRroTTTTTTTTTtoqro.',
    '..oRroTTTTTTTTttoqro.',
    '..orroTTTTtTTTTtoqqo.',
    '..orroTTTTTTTTttoqqo.',
    '..orroTTTTTTTTttoqqo.',
    '..oHHoTTTTTTTTttohho.',
    '..oHhoLLLLLLLLllohho.',
    '...ooLLLLLLLLLLlloo..',
  ];
  const FRONT_LEGS = [
    '....oLLLLLoLLLLlo....',
    '....oLLLLLoLLLLlo....',
    '....oLLLLLoLLLLlo....',
    '....oLLLLLoLLLLlo....',
    '....oLLLLlolLLLlo....',
    '....oLLLLlolLLLlo....',
    '....oLLLLlolLLLlo....',
    '....oLLLLlolLLLlo....',
    '....oLLLLlolLLLlo....',
    '....oLLLLlolLLLlo....',
    '....oLLLLlolLLLlo....',
    '...ooFFFFfooFFFFfoo..',
    '...oFFFFFfooFFFFFfo..',
    '...ooooooooooooooo...',
  ];

  // ------------------------------------------------------------------
  //  HƯỚNG SAU (gáy, không mặt)
  // ------------------------------------------------------------------
  const BACK_HEAD = FRONT_HEAD.map((r, i) => {
    if (i >= 8 && i <= 13) return r.replace(/[kEewM]/g, 'A');
    return r;
  });
  const BACK_BODY = FRONT_BODY.map((r, i) => (i >= 2 && i <= 9 ? r.slice(0, 10) + (i % 2 ? 'u' : 't') + r.slice(11) : r));   // sống lưng

  // ------------------------------------------------------------------
  //  HƯỚNG NGANG (nhìn sang phải)
  // ------------------------------------------------------------------
  const SIDE_HEAD = [
    '.......ooooooo.......',
    '.....ooAAAAAAAoo.....',
    '....oaAAAAAAAAAAo....',
    '...oaAAAAAAAAAAAAo...',
    '...oaAAAAAAAAAAAAo...',
    '..oaaAAAAAAAAAAAAAo..',
    '..oaaAAAAAAAAAAAAAo..',
    '..oaaAAAAAAAAAAAAAo..',
    '..oaabbaAAAAAAkkAAo..',
    '..oabaabAAAAAAEeAAo..',
    '..oabbabAAAAAAewAAAo.',
    '..oaabbaAAAAAAeeAAAo.',
    '..oaaAAAAAAAAAAAAAo..',
    '...oaAAAAAAAAAAAMAo..',
    '...oaaAAAAAAAAAAAo...',
    '....oaaAAAAAAAAAo....',
    '.....ooaaaaaaaoo.....',
    '........oNNNo........',
  ];
  const SIDE_BODY = [
    '.......ooTTTToo......',
    '......ouTTRRRTto.....',
    '......ouTRRRRrto.....',
    '......ouTRRRRrto.....',
    '......ouTRRRrrto.....',
    '......ouTRRRrrto.....',
    '......ouTRRRrrto.....',
    '......ouTRRrrqto.....',
    '......ouTRRrrqto.....',
    '......ouTRrrqqto.....',
    '......ouTHHHhhto.....',
    '......ouLHHhhhLo.....',
    '......ooLLLLLLlo.....',
  ];
  const SIDE_LEGS = [
    '.......oLLLLLlo......',
    '.......oLLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '.......omLLLLlo......',
    '......ooFFFFFFoo.....',
    '......oFFFFFFFFfo....',
    '......oooooooooo.....',
  ];
  // 2 khung bước chân nhìn ngang: chân trước bước ra, chân sau đạp ra sau
  const SIDE_LEGS_A = [
    '.......oLLLLLlo......',
    '......omLLLLLLlo.....',
    '......omLLolLLlo.....',
    '.....omLLooLLLLo.....',
    '.....omLlo.oLLLo.....',
    '....omLlo..oLLLlo....',
    '....omLlo...oLLlo....',
    '...omLlo....oLLLlo...',
    '...omLlo.....oLLlo...',
    '..ommlo......oLLLlo..',
    '..offo.......oFFFFfo.',
    '.offo........oFFFFFFo',
    '.ooo.........oooooooo',
    '.....................',
  ];
  const SIDE_LEGS_B = [
    '.......oLLLLLlo......',
    '......oLLLLLLlo......',
    '......oLLLoLLlo......',
    '......oLLLooLLo......',
    '......oLLlo.oLlo.....',
    '.....oLLLo..omLlo....',
    '.....oLLlo...omLo....',
    '....oLLLo....omLlo...',
    '....oLLlo.....omLo...',
    '...oFFFo......omLlo..',
    '..oFFFFFo......offo..',
    '..oFFFFFfo....offo...',
    '..oooooooo....ooo....',
    '.....................',
  ];

  // Ghép đầu + thân + chân thành 1 khung
  const build = (head, body, legs) => [...head, ...body, ...legs];

  // Khung bước chân hướng trước/sau: 1 chân nhấc lên 1px, tay vung nhẹ
  function stepFront(rows, which) {
    const out = rows.slice();
    const legStart = FRONT_HEAD.length + FRONT_BODY.length;
    const lo = which === 'A' ? 4 : 10, hi = which === 'A' ? 10 : 17;   // cột của chân được nhấc
    for (let y = legStart; y < out.length - 1; y++) {
      const below = out[y + 1];
      out[y] = out[y].slice(0, lo) + below.slice(lo, hi) + out[y].slice(hi);
    }
    out[out.length - 1] = out[out.length - 1].slice(0, lo) + '.'.repeat(hi - lo) + out[out.length - 1].slice(hi);
    return out;
  }

  const FRONT = build(FRONT_HEAD, FRONT_BODY, FRONT_LEGS);
  const BACK = build(BACK_HEAD, BACK_BODY, FRONT_LEGS);
  const SIDE = build(SIDE_HEAD, SIDE_BODY, SIDE_LEGS);
  const BASE = {
    front: [stepFront(FRONT, 'A'), FRONT, stepFront(FRONT, 'B')],
    back: [stepFront(BACK, 'B'), BACK, stepFront(BACK, 'A')],
    side: [build(SIDE_HEAD, SIDE_BODY, SIDE_LEGS_A), SIDE, build(SIDE_HEAD, SIDE_BODY, SIDE_LEGS_B)],
  };

  // ------------------------------------------------------------------
  //  BÉO RA: phình bụng 2 bên (trước/sau) hoặc phía trước (ngang)
  // ------------------------------------------------------------------
  function fatten(frames, dir, amount = 3) {
    const top = FRONT_HEAD.length;
    const prof = [0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 1];          // độ phình theo từng hàng thân
    return frames.map((rows) => rows.map((r, y) => {
      const k = y >= top && y < top + prof.length ? Math.round((prof[y - top] * amount) / 3) : 0;
      if (!k) return y >= top + prof.length && y < top + prof.length + 2 ? r : r;
      if (dir === 'side') {
        // đẩy phần trước bụng ra phía phải
        const i = r.lastIndexOf('t');
        const j = i >= 0 ? i : r.lastIndexOf('o');
        return (r.slice(0, j) + 'T'.repeat(k) + r.slice(j)).slice(0, W + 3);
      }
      const left = r.slice(0, CX), mid = r[CX], right = r.slice(CX + 1);
      const fillL = left.replace(/^\.+/, ''), padL = left.length - fillL.length;
      const fillR = right.replace(/\.+$/, ''), padR = right.length - fillR.length;
      const nl = '.'.repeat(Math.max(0, padL - k)) + fillL + 'T'.repeat(k);
      const nr = 'T'.repeat(k) + fillR + '.'.repeat(Math.max(0, padR - k));
      return nl.slice(-CX - 0) + mid + nr.slice(0, W - CX - 1 + 0);
    }));
  }

  // ------------------------------------------------------------------
  //  MẶC ĐỒ: vùng + sắc độ → màu
  // ------------------------------------------------------------------
  const SKIN = { A: '#fde2c4', a: '#f6c597', b: '#d98f5e', N: '#f6c597', n: '#d98f5e', H: '#fde2c4', h: '#f6c597' };
  const OL = '#3a1e12';

  function colorOf(ch, x, y, dir, look, fx, row) {
    if (ch === 'o') return OL;
    if (SKIN[ch]) return SKIN[ch];
    if (ch === 'k') return OL;
    if (ch === 'E') return look.eyes[0];
    if (ch === 'e') return look.eyes[1];
    if (ch === 'w') return '#ffffff';
    if (ch === 'M') return '#c96b5a';
    const shade = { T: 0, t: 1, u: 2, R: 0, r: 1, q: 2, L: 0, l: 1, m: 2, F: 0, f: 1 }[ch];
    const region = { T: 'top', t: 'top', u: 'top', R: 'sleeve', r: 'sleeve', q: 'sleeve', L: 'pants', l: 'pants', m: 'pants', F: 'shoes', f: 'shoes' }[ch];
    if (!region) return '#ff00ff';
    const custom = look.detail && look.detail(region, x, y, dir, shade, row);
    if (custom) return custom;
    return look[region][Math.min(shade, look[region].length - 1)];
  }

  // Ghép lớp phủ (tóc, ria, tai nghe...) lên khung. Lớp phủ: { front:[rows], back:[rows], side:[rows] } neo ở góc trên trái khung
  function overlay(rows, ov, extraW) {
    if (!ov) return rows;
    return rows.map((r, y) => {
      const o = ov[y];
      if (!o) return r;
      let s = r.padEnd(Math.max(r.length, o.length), '.');
      let out = '';
      for (let x = 0; x < s.length; x++) out += o[x] && o[x] !== '.' ? (o[x] === '_' ? '.' : o[x]) : s[x];
      return out;
    });
  }

  // Lớp phủ dùng ký hiệu riêng: i I j = tóc (sáng/vừa/tối), x X z = phụ kiện, W w = trắng/kem, Q = viền
  const HAIRPAL = (look) => ({ i: look.hair[0], I: look.hair[1], j: look.hair[2], x: look.acc ? look.acc[0] : '#000', X: look.acc ? look.acc[1] : '#000', z: look.acc ? look.acc[2] : '#000', W: '#f4efe6', w: '#d6cdbf', Q: '#3a1e12' });

  // Vẽ 1 khung lên iso (fx, fy = điểm giữa 2 bàn chân trên màn hình)
  function drawFrame(iso, look, dir, frame, fx, fy, { flip = false } = {}) {
    let rows = (look.fat ? look._fat || (look._fat = {
      front: fatten(BASE.front, 'front', look.fatAmount || 3), back: fatten(BASE.back, 'back', look.fatAmount || 3), side: fatten(BASE.side, 'side', look.fatAmount || 3),
    }) : BASE)[dir][frame];
    rows = overlay(rows, look.overlay && look.overlay[dir]);
    const hp = HAIRPAL(look);
    iso.blob(fx, fy, 8, 2, '#1e1410'); iso.commit(null, 0.25);
    const n = rows.length;
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        const ch = r[x];
        if (ch === '.') continue;
        const c = hp[ch] && 'iIjxXzWwQ'.includes(ch) ? hp[ch] : colorOf(ch, x, y, dir, look, flip, r);
        const dx = x - CX;
        iso.put(fx + (flip ? -dx : dx), fy - (n - 1 - y), c);
      }
    });
    iso.commit(null);
  }

  global.Chars = { BASE, W, CX, drawFrame, fatten, SKIN, OL };
})(typeof window !== 'undefined' ? window : globalThis);
