// =====================================================================
//  VĂN PHÒNG 2D NHÌN TỪ TRÊN XUỐNG (3/4) — phong cách "Modern Office"
//  Tông lạnh: tường trắng tím nhạt, sàn gạch xám 16px, viền xanh than.
//  Vẽ thẳng trên màn hình (không chiếu iso). Dùng Iso.createIso làm "canvas pixel".
// =====================================================================
(function (global) {
  const C = {
    ol: '#3a3a50', ol2: '#46465e',
    // tường
    cap: '#f8f8f8', wall: '#ebe4f2', wallLine: '#e3dee6', wallShade: '#d8d0e0', base: '#c6bdd5', baseD: '#9da3b7',
    brick: '#aea697', brickL: '#c0b6a6', brickD: '#9b8b7f', mortar: '#d0c8b8',
    // sàn
    tile: '#a8a8a8', tileL: '#b1b1b1', tileD: '#9e9e9f', tileS: '#969696',
    plank: '#c0c0c1', plankL: '#cbcbcb', plankD: '#b1b1b1',
    // gỗ bàn
    wood: '#e0d0b0', woodL: '#ebdfc4', woodS: '#d4c09c', woodD: '#b89f7c', woodEdge: '#a8906c',
    cork: '#d0be9c', corkD: '#bda766',
    // vách ngăn / kim loại
    part: '#d8d0e0', partL: '#ebe4f2', partD: '#acafbf', metal: '#9e9e9f', metalD: '#6d6b6b',
    // ghế / đồ tối
    dark: '#565972', darkL: '#6c6e85', darkD: '#46465e',
    // màn hình
    scr: '#1652b9', scrL: '#4995e3', bezel: '#46465e',
    // màu nhấn
    red: '#d93232', yellow: '#f8d239', green: '#64b63b', greenD: '#4e8a3a', greenL: '#9bc246', orange: '#ed931e', white: '#f8f8f8',
    shadow: '#3a3a50',
  };

  function kit(iso) {
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) iso.put(x + i, y + j, c); };
    const P = (x, y, c) => iso.put(x, y, c);
    const done = (ol = C.ol) => iso.commit(ol);
    const shade = (x, y, w, h, a = 0.18) => { R(x, y, w, h, C.shadow); iso.commit(null, a); };   // bóng đổ mờ
    return { R, P, done, shade };
  }

  // ---------------------------------------------------------------
  //  KHUNG PHÒNG
  // ---------------------------------------------------------------
  // x0,y0 = góc trong trên-trái; w,h = kích thước trong; wallH = chiều cao tường sau
  function room(iso, { x0, y0, w, h, wallH = 32, wallKind = 'plain', floorKind = 'tile', doorsLeft = [], doorsRight = [] }) {
    const { R, P, done } = kit(iso);
    // sàn
    const fy = y0 + wallH;
    for (let y = fy; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++) {
        let c;
        if (floorKind === 'tile') {
          const tx = (x - x0) % 16, ty = (y - fy) % 16;
          c = C.tile;
          if (tx === 0 || ty === 0) c = C.tileL;
          else if (tx === 15 || ty === 15) c = C.tileD;
          else if (((x >> 4) * 7 + (y >> 4) * 3) % 5 === 0 && tx + ty < 8) c = C.tileL;   // vệt sáng nhẹ
        } else {
          const px = (x - x0) % 8, row = Math.floor((x - x0) / 8);
          const joint = (y - fy + row * 13) % 40;
          c = px === 0 ? C.plankD : joint === 0 ? C.plankD : px === 1 || joint === 1 ? C.plankL : C.plank;
        }
        P(x, y, c);
      }
    iso.commit(null);
    // bóng tường đổ xuống sàn
    R(x0, fy, w, 3, C.shadow); iso.commit(null, 0.16);
    // tường sau
    for (let y = y0; y < fy; y++)
      for (let x = x0; x < x0 + w; x++) {
        const ly = y - y0;
        let c;
        if (wallKind === 'brick') {
          const row = Math.floor(ly / 5), bx = (x - x0 + (row % 2) * 6) % 12;
          c = ly % 5 === 4 || bx === 11 ? C.mortar : (bx + row) % 5 === 0 ? C.brickL : (bx * 3 + row) % 7 === 0 ? C.brickD : C.brick;
        } else c = ly % 4 === 3 ? C.wallLine : C.wall;
        if (ly < 2) c = C.wallShade;
        if (ly >= wallH - 4) c = ly === wallH - 1 ? C.ol2 : ly === wallH - 4 ? C.partL : C.base;
        P(x, y, c);
      }
    iso.commit(null);
    // mép tường nhìn từ trên: dải trắng giữa 2 đường viền đậm
    const strip = (x, y, ww, hh) => { R(x, y, ww, hh, C.ol); R(x + 1, y + 1, Math.max(1, ww - 2), Math.max(1, hh - 2), C.cap); iso.commit(null); };
    strip(x0 - 5, y0 - 5, w + 10, 6);                // trên
    strip(x0 - 5, y0 + h - 1, w + 10, 6);            // dưới
    const side = (x, gaps) => {
      let y = y0 - 5;
      const cuts = [...gaps].sort((a, b) => a[0] - b[0]);
      for (const [g0, g1] of cuts) { strip(x, y, 6, y0 + g0 - y); y = y0 + g1; }
      strip(x, y, 6, y0 + h + 5 - y);
    };
    side(x0 - 5, doorsLeft);
    side(x0 + w - 1, doorsRight);
  }

  // ---------------------------------------------------------------
  //  ĐỒ TREO TƯỜNG
  // ---------------------------------------------------------------
  function airCon(iso, x, y) {
    const { R, done } = kit(iso);
    R(x, y, 32, 11, C.white); R(x, y + 8, 32, 3, C.part); R(x + 2, y + 9, 28, 1, C.partD); R(x + 22, y + 3, 5, 2, C.ol2); R(x + 4, y + 3, 6, 1, C.partD);
    done();
  }
  function whiteboard(iso, x, y, w = 48, h = 26, kind = 'blank') {
    const { R, P, done } = kit(iso);
    R(x, y, w, h, C.partD); R(x + 2, y + 2, w - 4, h - 6, C.white); R(x + 2, y + h - 4, w - 4, 4, C.part);
    if (kind === 'chart') {
      for (let i = 0; i < w - 12; i++) P(x + 6 + i, y + 6 + Math.round(Math.abs(Math.sin(i / 5)) * 6), C.red);
      for (let i = 0; i < 4; i++) R(x + 8 + i * 6, y + h - 8 - (i + 1) * 2, 3, (i + 1) * 2, C.partD);
      R(x + 6, y + 6, 8, 1, C.partD); R(x + 6, y + 9, 6, 1, C.partD);
    }
    R(x + w - 16, y + h - 3, 2, 1, C.red); R(x + w - 12, y + h - 3, 2, 1, C.scrL); R(x + w - 8, y + h - 3, 2, 1, C.green);
    done();
  }
  function frame(iso, x, y, w = 18, h = 18, kind = 'cork') {
    const { R, P, done } = kit(iso);
    R(x, y, w, h, C.partD); R(x + 2, y + 2, w - 4, h - 4, kind === 'cork' ? C.cork : C.white);
    if (kind === 'cork') { R(x + 4, y + 4, 4, 4, C.yellow); R(x + 9, y + 5, 4, 3, C.scrL); R(x + 5, y + 10, 5, 3, C.red); R(x + 11, y + 10, 3, 4, C.white); }
    else { R(x + 4, y + 4, 4, 3, C.red); R(x + 8, y + 4, 4, 3, C.yellow); R(x + 4, y + 7, 4, 3, C.scrL); R(x + 8, y + 7, 4, 3, C.green); R(x + 12, y + 5, 2, 5, C.orange); }
    done();
  }

  // ---------------------------------------------------------------
  //  ĐỒ ĐẶT SÀN (toạ độ = góc trên trái của hình)
  // ---------------------------------------------------------------
  function shelf(iso, x, y, w = 34, h = 40) {
    const { R, P, done, shade } = kit(iso);
    shade(x + 2, y + h - 2, w, 3);
    R(x, y, w, h, C.white);
    for (const px of [0, w / 2 - 1, w - 3]) R(x + px, y, 3, h, C.part);
    const shelves = [2, 14, 26];
    const items = [[[3, 8, C.scr], [10, 6, C.ol2], [20, 7, C.orange]], [[3, 9, C.orange], [12, 4, C.green], [20, 4, C.yellow], [25, 4, C.scrL]], [[4, 10, C.part], [18, 8, C.metal]]];
    shelves.forEach((sy, k) => {
      R(x + 3, y + sy + 9, w - 6, 2, C.partD);
      for (const [ix, iw, col] of items[k]) R(x + ix, y + sy + 3, iw, 6, col);
    });
    done();
  }
  function plant(iso, x, y, big = true) {
    const { R, P, done, shade } = kit(iso);
    const pw = big ? 12 : 8;
    shade(x + 1, y + (big ? 22 : 14), pw + 2, 2);
    R(x, y + (big ? 14 : 8), pw, big ? 9 : 7, C.metal); R(x, y + (big ? 14 : 8), pw, 2, C.part); R(x + 1, y + (big ? 21 : 13), pw - 2, 1, C.metalD);
    done();
    const cx = x + pw / 2, cy = y + (big ? 12 : 7);
    const leaves = big ? [[0, -9, 3, 5], [-5, -6, 3, 3], [5, -6, 3, 3], [-7, -1, 3, 2], [7, -1, 3, 2], [-3, 0, 3, 2], [3, 0, 3, 2], [0, -3, 2, 3]] : [[0, -4, 2, 3], [-3, -1, 2, 2], [3, -1, 2, 2]];
    for (const [dx, dy, rx, ry] of leaves) iso.blob(Math.round(cx + dx), cy + dy, rx, ry, C.greenD);
    for (const [dx, dy, rx, ry] of leaves) iso.blob(Math.round(cx + dx), cy + dy - 1, Math.max(1, rx - 1), Math.max(1, ry - 1), C.green);
    for (const [dx, dy] of leaves) P(Math.round(cx + dx) - 1, cy + dy - 2, C.greenL);
    done(C.ol);
  }
  function waterCooler(iso, x, y) {
    const { R, P, done, shade } = kit(iso);
    shade(x + 2, y + 34, 14, 3);
    R(x, y + 12, 14, 24, C.darkD); R(x + 1, y + 13, 12, 1, C.darkL); R(x + 3, y + 18, 8, 5, C.dark); R(x + 4, y + 26, 6, 1, C.metal); R(x + 4, y + 30, 6, 1, C.metal);
    P(x + 4, y + 20, C.scrL); P(x + 9, y + 20, C.red);
    done();
    iso.blob(x + 7, y + 7, 6, 6, '#b9c3d5'); iso.blob(x + 6, y + 6, 4, 4, '#d4dee6'); R(x + 3, y + 3, 2, 3, C.white); R(x + 5, y + 12, 4, 1, '#91a5cf');
    done();
  }
  function printerTable(iso, x, y) {
    const { R, P, done, shade } = kit(iso);
    shade(x + 2, y + 26, 34, 3);
    R(x, y + 14, 34, 10, C.wood); R(x, y + 14, 34, 2, C.woodL); R(x, y + 22, 34, 3, C.woodD); R(x + 2, y + 25, 2, 3, C.metalD); R(x + 30, y + 25, 2, 3, C.metalD);
    R(x + 4, y + 18, 26, 3, C.woodS);
    done();
    R(x + 14, y + 2, 18, 16, C.darkL); R(x + 14, y + 2, 18, 3, C.part); R(x + 17, y, 12, 4, C.white); R(x + 16, y + 10, 14, 4, C.dark); R(x + 18, y + 11, 3, 2, C.scrL);
    P(x + 27, y + 8, C.green); P(x + 25, y + 8, C.red);
    done();
    R(x + 2, y + 6, 10, 10, C.wallShade); R(x + 2, y + 6, 10, 2, C.white); done();
  }
  function suitcase(iso, x, y) {
    const { R, done, shade } = kit(iso);
    shade(x + 1, y + 20, 14, 2);
    R(x + 4, y, 6, 4, C.metal); R(x + 5, y + 1, 4, 3, C.wall);
    R(x, y + 4, 14, 17, C.darkD); R(x + 1, y + 5, 12, 2, C.dark); R(x + 4, y + 11, 6, 3, C.part);
    done();
  }

  // Ghế xoay nhìn từ phía sau (người ngồi quay mặt vào bàn phía trên)
  // Ghế xoay nhìn từ phía sau (theo ảnh mẫu): lưng cao bo tròn, tựa đầu sáng,
  // thân lưng lưới đan caro, đệm lưng sáng ở dưới, 2 tay vịn sẫm, 2 chân ghế
  function chair(iso, x, y, col = 'dark') {
    const { R, P, done, shade } = kit(iso);
    const m = col === 'brown'
      ? { hi: '#c7754b', a: '#b35e3f', b: '#a8583c', d: '#8a4632', arm: '#6b3a2a' }
      : { hi: '#7e8099', a: '#6c6e85', b: '#60637d', d: '#565972', arm: '#3a3a50' };
    shade(x + 2, y + 19, 15, 3);
    // 2 chân ghế
    R(x + 3, y + 17, 3, 3, m.arm); R(x + 10, y + 17, 3, 3, m.arm); P(x + 4, y + 17, m.d); P(x + 11, y + 17, m.d);
    // tay vịn
    R(x, y + 8, 2, 8, m.arm); R(x + 14, y + 8, 2, 8, m.arm); P(x + 1, y + 8, m.d); P(x + 14, y + 8, m.d);
    // lưng ghế
    R(x + 2, y + 1, 12, 15, m.d);
    R(x + 3, y, 10, 1, m.d);
    // tựa đầu: dải sáng + vạch tối bên dưới
    R(x + 3, y + 1, 10, 2, m.hi); R(x + 2, y + 3, 12, 1, m.d);
    // thân lưng: lưới đan caro
    for (let j = 4; j < 10; j++) for (let i = 3; i < 13; i++) P(x + i, y + j, (i + j) % 2 ? m.a : m.b);
    R(x + 2, y + 10, 12, 1, m.d);
    // đệm lưng
    R(x + 4, y + 11, 8, 3, m.a); R(x + 4, y + 11, 8, 1, m.hi);
    // mép đáy ghế
    R(x + 2, y + 14, 12, 2, m.d); R(x + 3, y + 15, 10, 1, m.arm);
    done();
  }

  // Cụm bàn cubicle: vách sau (bảng ghim), 2 cột vách bên, mặt bàn gỗ
  function cubicle(iso, x, y, opts = {}) {
    const { R, P, done, shade } = kit(iso);
    const w = 48;
    shade(x + 2, y + 34, w, 3);
    // chân bàn
    R(x + 4, y + 31, 3, 5, C.metalD); R(x + w - 7, y + 31, 3, 5, C.metalD);
    // mặt bàn
    R(x + 2, y + 12, w - 4, 20, C.wood);
    for (let i = 0; i < 18; i++) P(x + 4 + ((i * 17) % (w - 8)), y + 14 + ((i * 7) % 16), C.woodS);
    R(x + 2, y + 12, w - 4, 1, C.woodL); R(x + 2, y + 29, w - 4, 3, C.woodD); R(x + 2, y + 29, w - 4, 1, C.woodEdge);
    done();
    // vách sau: khung xám + tấm ghim
    R(x, y, w, 12, C.part); R(x, y, w, 2, C.partL); R(x + 3, y + 3, w - 6, 7, C.cork);
    for (let i = 0; i < w - 6; i += 2) P(x + 3 + i, y + 4 + (i % 4 === 0 ? 2 : 4), C.corkD);
    R(x, y + 10, w, 2, C.partD);
    done();
    // 2 cột vách bên
    for (const px of [x - 2, x + w - 2]) { R(px, y - 3, 4, 38, C.part); R(px, y - 3, 1, 38, C.partL); R(px + 3, y - 3, 1, 38, C.partD); }
    done();
    // đồ trên bàn
    const it = opts.items || ['crt', 'phone', 'lamp'];
    const by = y + 14;
    const hasLap = it.includes('laptop');
    if (hasLap) laptop(iso, x + 3, by - 4);
    if (it.includes('crt')) crt(iso, hasLap ? x + 21 : x + 15, by - 4, opts.screen);
    if (it.includes('dual')) { crt(iso, x + 5, by - 4, 'code'); crt(iso, x + 24, by - 4, opts.screen); }
    if (it.includes('phone') && !hasLap) phone(iso, x + 3, by + 3);
    if (it.includes('lamp')) lamp(iso, x + 36, by - 6);
    if (it.includes('papers')) papers(iso, x + 34, by + 7);
    if (it.includes('mug')) mug(iso, x + 38, by + 2);
    if (it.includes('photo')) photo(iso, x + 36, by - 2);
    keyboard(iso, hasLap ? x + 19 : x + 13, by + 11);
  }
  // Màn hình (theo ảnh mẫu): viền xám 2 lớp, màn xanh sáng có taskbar,
  // cột icon bên trái (xanh / đỏ / vàng), lưới 2×3 ô trắng bên phải, cổ ngắn + đế rộng
  const SCR = { bg: '#4280dd', bar: '#1652b9', icon: '#4995e3', tile: '#d8d0e0' };
  function screenContent(iso, x, y, w, h, kind) {
    const { R, P } = kit(iso);
    R(x, y, w, h, SCR.bg);
    R(x, y + h - 1, w, 1, SCR.bar);
    if (kind === 'code') {
      R(x, y, w, h - 1, '#26304a');
      for (let r = 0; r < Math.floor((h - 1) / 2); r++) R(x + 1 + (r % 2), y + 1 + r * 2, Math.min(w - 2, 4 + ((r * 3) % 5)), 1, ['#64b63b', '#f8d239', '#d8d0e0', '#4995e3'][r % 4]);
      return;
    }
    for (let r = 0; r < Math.min(3, h - 1); r++) P(x + 1, y + 1 + r * 2 - (r === 2 ? 1 : 0), SCR.icon);
    P(x + 3, y + 1, '#d93232'); P(x + 3, y + 3, '#f8d239');
    for (let r = 0; r < 3 && 1 + r * 2 < h - 1; r++) { P(x + w - 4, y + 1 + r * 2, SCR.tile); P(x + w - 2, y + 1 + r * 2, SCR.tile); }
  }
  function crt(iso, x, y, kind = 'desktop') {
    const { R, P, done } = kit(iso);
    // đế + cổ
    R(x + 4, y + 13, 10, 2, '#565972'); R(x + 4, y + 13, 10, 1, '#6c6e85');
    R(x + 7, y + 11, 4, 2, '#565972'); R(x + 8, y + 11, 2, 1, '#6c6e85');
    done();
    // vỏ màn hình
    R(x, y, 18, 12, '#60637d'); R(x + 1, y + 1, 16, 1, '#6c6e85'); R(x + 1, y + 10, 16, 1, '#565972');
    screenContent(iso, x + 2, y + 2, 14, 8, kind);
    done();
    iso.glow(x + 9, y + 6, 12, '#4995e3', 0.35);
  }
  // Laptop (theo ảnh mẫu): nắp viền xám nhạt + màn xanh, thân có bàn phím caro + touchpad sẫm
  function laptop(iso, x, y) {
    const { R, P, done } = kit(iso);
    // nắp
    R(x, y, 14, 9, '#acafbf'); R(x + 1, y + 1, 12, 1, '#b9c3d5');
    screenContent(iso, x + 2, y + 2, 10, 6, 'desktop');
    R(x, y + 9, 14, 1, '#565972');
    done();
    // thân + bàn phím caro
    R(x, y + 10, 14, 8, '#b9c3d5'); R(x + 1, y + 10, 12, 1, '#d4dee6');
    for (let j = 0; j < 2; j++) for (let i = 0; i < 10; i++) P(x + 2 + i, y + 12 + j, (i + j) % 2 ? '#f8f8f8' : '#9e9e9f');
    R(x + 5, y + 15, 4, 2, '#565972'); R(x + 1, y + 15, 3, 1, '#d4dee6');
    done();
    iso.glow(x + 7, y + 5, 10, '#4995e3', 0.3);
  }
  function keyboard(iso, x, y) {
    const { R, P, done } = kit(iso);
    R(x, y, 18, 5, C.metal); for (let i = 0; i < 8; i++) { P(x + 1 + i * 2, y + 1, C.partD); P(x + 2 + i * 2, y + 3, C.partD); }
    done();
    R(x + 21, y + 1, 4, 5, C.metalD); done();   // chuột
  }
  function phone(iso, x, y) {
    const { R, P, done } = kit(iso);
    R(x, y, 10, 10, C.metal); R(x + 1, y + 1, 3, 8, C.metalD); R(x + 5, y + 2, 4, 2, C.part); P(x + 6, y + 6, C.red); P(x + 8, y + 6, C.green);
    done();
  }
  function lamp(iso, x, y) {
    const { R, P, done } = kit(iso);
    R(x + 2, y + 14, 7, 3, C.metalD);
    for (let k = 0; k < 9; k++) P(x + 5 - (k > 5 ? k - 5 : 0), y + 13 - k, C.metal);
    R(x - 4, y + 2, 8, 4, C.part); R(x - 4, y + 2, 8, 1, C.white);
    done();
  }
  function papers(iso, x, y) {
    const { R, P, done } = kit(iso);
    R(x, y, 10, 8, C.white); for (let k = 0; k < 3; k++) R(x + 2, y + 2 + k * 2, 6, 1, C.part);
    done();
  }
  function mug(iso, x, y) { const { R, P, done } = kit(iso); R(x, y, 5, 5, C.red); R(x, y, 5, 1, '#fc5c46'); P(x + 5, y + 2, C.red); done(); }
  function photo(iso, x, y) { const { R, P, done } = kit(iso); R(x, y, 9, 11, C.part); R(x + 1, y + 1, 7, 8, '#ffb893'); R(x + 2, y + 1, 5, 3, C.orange); done(); }

  global.TD = { C, kit, room, airCon, whiteboard, frame, shelf, plant, waterCooler, printerTable, suitcase, chair, cubicle, crt, laptop, keyboard, phone, lamp, papers, mug };
})(typeof window !== 'undefined' ? window : globalThis);
