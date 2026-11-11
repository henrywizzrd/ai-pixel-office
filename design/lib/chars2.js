// =====================================================================
//  BỘ KHUNG NHÂN VẬT v2 — kiểu chibi isometric nhìn chéo 3/4
//  2 hướng vẽ tay:  'se' = chéo xuống-phải (thấy mặt)   'ne' = chéo lên-phải (thấy lưng)
//  'sw' và 'nw' = lật gương của 'se' và 'ne'.  Mỗi hướng 3 khung: [bước A, đứng, bước B].
//  Khung rộng 20, cao 40 (3 hàng trên cùng chừa chỗ cho tóc phồng).
//
//  Mã vùng: o viền | A a b da đầu | N n cổ | k mí | E e w mắt | M miệng
//           T t u thân | R r q tay | H h bàn tay | L l m chân | F f giày
// =====================================================================
(function (global) {
  const W = 20, CX = 10, PAD = 3;

  const SE = [
    '.......oooooo.......',
    '.....ooAAAAAAoo.....',
    '....oAAAAAAAAAAo....',
    '...oaAAAAAAAAAAAo...',
    '...oaAAAAAAAAAAAAo..',
    '..oaaAAAAAAAAAAAAo..',
    '..oaaAAAAAAAAAAAAAo.',
    '..obaAAAAkkAAAAkkAo.',
    '..oabaAAAEeAAAAEeAo.',
    '..obbaAAAewAAAAewAAo',
    '..oaaAAAAAAAAAAAAAo.',
    '...oaAAAAAAAAAAMAAo.',
    '...oaaAAAAAAAAAAAo..',
    '....oaaAAAAAAAAAo...',
    '.....ooaaaaaaaoo....',
    '.......onNNNo.......',
    '.....ooTTTTTTToo....',
    '...ooRRoTTTTTTTtoqo.',
    '...oRRRoTTTTTTTtoqo.',
    '...oRRroTTTTTTttoqo.',
    '...oRrroTTTTTTttoqo.',
    '...oRrroTTTTTTttoqo.',
    '...orrroTTTTTttuoqo.',
    '...oHHhoTTTTTttuoho.',
    '...oHhhoLLLLLLLlohho',
    '....ooooLLLLLLLlooo.',
    '.......oLLLLoLLLlo..',
    '.......oLLLLoLLLlo..',
    '.......oLLLLoLLLlo..',
    '.......oLLLloLLllo..',
    '.......oLLLloLLllo..',
    '.......oLLLloLLllo..',
    '......oFFFFfoFFFFfo.',
    '......oFFFFFoFFFFFfo',
    '......ooooooooooooo.',
  ];

  const NE = [
    '.......oooooo.......',
    '.....ooAAAAAAoo.....',
    '....oAAAAAAAAAAo....',
    '...oaAAAAAAAAAAAo...',
    '...oaAAAAAAAAAAAAo..',
    '..oaaAAAAAAAAAAAAo..',
    '..oaaAAAAAAAAAAAAAo.',
    '..oaaAAAAAAAAAAabAo.',
    '..oaaAAAAAAAAAAbabo.',
    '..oaaAAAAAAAAAAabbo.',
    '..oaaAAAAAAAAAAAAo..',
    '...oaaAAAAAAAAAAAo..',
    '...oaaaAAAAAAAAAo...',
    '....oaaaAAAAAAAo....',
    '.....oonaaaaaaoo....',
    '.......onNNNo.......',
    '.....ooTTTTTTToo....',
    '...ooRRoTTTuTTTtoqo.',
    '...oRRRoTTTuTTTtoqo.',
    '...oRRroTTTtTTttoqo.',
    '...oRrroTTTuTTttoqo.',
    '...oRrroTTTtTTttoqo.',
    '...orrroTTTuTttuoqo.',
    '...oHHhoTTTTTttuoho.',
    '...oHhhoLLLLLLLlohho',
    '....ooooLLLLLLLlooo.',
    '.......oLLLLoLLLlo..',
    '.......oLLLLoLLLlo..',
    '.......oLLLLoLLLlo..',
    '.......oLLLloLLllo..',
    '.......oLLLloLLllo..',
    '.......oLLLloLLllo..',
    '......oFFFFfoFFFFfo.',
    '......oFFFFfoFFFFfo.',
    '......ooooooooooooo.',
  ];

  // ---- tạo khung bước chân: chân trái dịch (dx, dy), chân phải dịch ngược lại; tay vung ngược chân ----
  const LEG0 = 26, ARM0 = 17, ARM1 = 25;
  const isLegL = (x) => x >= 6 && x <= 11, isLegR = (x) => x >= 12;
  function shiftRegion(rows, y0, y1, colTest, dx, dy) {
    const g = rows.map((r) => r.padEnd(W, '.').split(''));
    const src = rows.map((r) => r.padEnd(W, '.').split(''));
    for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) if (colTest(x)) g[y][x] = '.';
    for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) {
      if (!colTest(x) || src[y][x] === '.') continue;
      const ny = y + dy, nx = x + dx;
      if (ny < 0 || ny >= g.length || nx < 0 || nx >= W) continue;
      if (g[ny][nx] === '.' || g[ny][nx] === 'o') g[ny][nx] = src[y][x];
      else if (src[y][x] !== 'o') g[ny][nx] = src[y][x];
    }
    return g.map((r) => r.join(''));
  }
  function step(rows, which) {
    const s = which === 'A' ? 1 : -1;
    let out = rows;
    out = shiftRegion(out, LEG0, rows.length - 1, isLegL, -s, s > 0 ? 0 : -1);       // chân trái bước tới / nhấc
    out = shiftRegion(out, LEG0, rows.length - 1, isLegR, s, s > 0 ? -1 : 0);        // chân phải
    out = shiftRegion(out, ARM0, ARM1, (x) => x <= 7, 0, s > 0 ? -1 : 1);             // tay trái vung
    out = shiftRegion(out, ARM0, ARM1, (x) => x >= 16, 0, s > 0 ? 1 : -1);            // tay phải vung
    return out;
  }

  const pad = (rows) => [...Array(PAD).fill('.'.repeat(W)), ...rows];
  const BASE = {
    se: [pad(step(SE, 'A')), pad(SE), pad(step(SE, 'B'))],
    ne: [pad(step(NE, 'B')), pad(NE), pad(step(NE, 'A'))],
  };

  // ---- béo ra: phình bụng (lệch về phía trước theo hướng nhìn) ----
  const T0 = PAD + 16;
  function fatten(frames, dir, amount = 3) {
    const prof = [0, 1, 1, 2, 2, 3, 3, 3, 3, 2, 1];
    return frames.map((rows) => rows.map((r, y) => {
      const p = y - T0;
      if (p < 0 || p >= prof.length) return r;
      const k = Math.round((prof[p] * amount) / 3);
      if (!k) return r;
      // chỉ chèn thêm vải vào giữa thân (giữa 2 tay): bụng phình về phía trước nhiều hơn
      let a = -1, b = -1;
      for (let x = 0; x < r.length; x++) if ('Ttu'.includes(r[x])) { if (a < 0) a = x; b = x; }
      if (a < 0) return r;
      const kl = dir === 'se' ? Math.ceil(k / 2) : Math.ceil(k * 0.75), kr = dir === 'se' ? k : Math.ceil(k * 0.75);
      let pre = r.slice(0, a);
      const lead = pre.length - pre.replace(/^\.+/, '').length;
      pre = pre.slice(Math.min(lead, kl));
      const fill = r[a] === 'T' ? 'T' : 't';
      return (pre + fill.repeat(kl) + r.slice(a, b + 1) + 't'.repeat(kr) + r.slice(b + 1)).padEnd(W, '.');
    }));
  }

  // ---- màu ----
  const SKIN = { A: '#fbd3ac', a: '#eaa978', b: '#c47c50', N: '#eaa978', n: '#c47c50', H: '#fbd3ac', h: '#eaa978' };
  const OL = '#1c1214';
  function colorOf(ch, x, y, dir, look, row) {
    if (ch === 'o' || ch === 'k') return OL;
    if (SKIN[ch]) return look.skin && look.skin[ch] ? look.skin[ch] : SKIN[ch];
    if (ch === 'E') return look.eyes[0];
    if (ch === 'e') return look.eyes[1];
    if (ch === 'w') return '#ffffff';
    if (ch === 'M') return '#a8584a';
    const shade = { T: 0, t: 1, u: 2, R: 0, r: 1, q: 2, L: 0, l: 1, m: 2, F: 0, f: 1 }[ch];
    const region = { T: 'top', t: 'top', u: 'top', R: 'sleeve', r: 'sleeve', q: 'sleeve', L: 'pants', l: 'pants', m: 'pants', F: 'shoes', f: 'shoes' }[ch];
    if (!region) return null;
    const c = look.detail && look.detail(region, x, y - PAD, dir, shade, row);
    return c || look[region][Math.min(shade, look[region].length - 1)];
  }

  // Lớp phủ: i I j tóc (sáng/vừa/tối) | x X z phụ kiện | W w trắng/kem | Q viền | '_' = xoá pixel
  function overlay(rows, ov) {
    if (!ov) return rows;
    return rows.map((r, y) => {
      const o = ov[y];
      if (!o) return r;
      let out = '';
      const n = Math.max(r.length, o.length);
      for (let x = 0; x < n; x++) { const oc = o[x]; out += oc && oc !== '.' ? (oc === '_' ? '.' : oc) : r[x] || '.'; }
      return out;
    });
  }
  const extra = (look) => ({ i: look.hair[0], I: look.hair[1], j: look.hair[2], x: (look.acc || [])[0], X: (look.acc || [])[1], z: (look.acc || [])[2], W: '#f4efe6', w: '#d6cdbf', Q: OL });

  // dir: 'se' | 'sw' | 'ne' | 'nw'
  function drawFrame(iso, look, dir, frame, fx, fy) {
    const base = dir[0] === 's' ? 'se' : 'ne';
    const flip = dir[1] === 'w';
    const set = look.fat ? (look._fat2 || (look._fat2 = { se: fatten(BASE.se, 'se', look.fatAmount), ne: fatten(BASE.ne, 'ne', look.fatAmount) })) : BASE;
    const rows = overlay(set[base][frame], look.overlay && look.overlay[base]);
    const ex = extra(look);
    iso.blob(fx, fy, 7, 2, '#1e1410'); iso.commit(null, 0.25);
    const n = rows.length;
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        const ch = r[x];
        if (ch === '.') continue;
        const c = 'iIjxXzWwQ'.includes(ch) ? ex[ch] : colorOf(ch, x, y, base, look, r);
        if (!c) continue;
        const dx = x - CX;
        iso.put(fx + (flip ? -dx : dx), fy - (n - 1 - y), c);
      }
    });
    iso.commit(null);
  }

  global.Chars2 = { BASE, drawFrame, W, CX, PAD, SKIN, OL };
})(typeof window !== 'undefined' ? window : globalThis);
