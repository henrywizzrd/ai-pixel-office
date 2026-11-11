// =====================================================================
//  THƯ VIỆN ĐỒ VẬT — đợt 1: làm việc, trang trí, đồ nhỏ
//
//  Mỗi món:
//    id, name, group      : mã, tên hiển thị, nhóm ('work' | 'decor' | 'small')
//    size                 : [dài theo u, sâu theo v] tính bằng ô 8px (để ghép phòng)
//    place                : 'wall'  = đặt sát tường
//                           'center'= đặt giữa sàn
//                           'onwall'= treo trên tường
//                           'desk'  = đặt trên mặt bàn (catalog tự kê 1 cái bàn bên dưới)
//    variants             : danh sách biến thể { name, ...màu }
//    draw(it, iso, c, Z)  : it = bộ vẽ cục bộ (u, v, z), c = biến thể, Z = độ cao đáy
// =====================================================================
(function (global) {
  const { mat: M, P } = global.Iso;

  // Bộ màu dùng lại nhiều lần
  const WOOD = {
    plum: { name: 'Gỗ mận', top: P.plum3, mid: P.plum2, dark: P.plum1, rim: P.plum4, ol: P.ink },
    coral: { name: 'Gỗ san hô', top: P.peach2, mid: P.cor4, dark: P.cor1, rim: P.sand, ol: P.mag1 },
    white: { name: 'Trắng kem', top: P.white, mid: P.cream1, dark: P.pk2, rim: P.white, ol: P.mag1 },
    brown: { name: 'Gỗ nâu đỏ', top: '#8e4a3a', mid: '#71382d', dark: '#592726', rim: '#a35d48', ol: '#24120c' },
  };
  const FABRIC = {
    cream: { name: 'Kem', top: P.white, mid: P.cream1, dark: P.pk2, rim: P.white, ol: P.mag1 },
    plum: { name: 'Mận', top: P.plum4, mid: P.plum3, dark: P.plum2, rim: P.pk1, ol: P.ink },
    coral: { name: 'San hô', top: P.peach2, mid: P.cor4, dark: P.cor1, rim: P.sand, ol: P.mag1 },
    mint: { name: 'Bạc hà', top: P.lime, mid: P.mint, dark: P.mint2, rim: P.white, ol: P.mint3 },
  };

  // Hàm tô 1 mặt có màu theo sáng/tối
  const shadeOf = (c) => (sh) => (sh ? c.dark : c.mid);

  // ---------------------------------------------------------------
  //  MÀN HÌNH: các kiểu nội dung
  // ---------------------------------------------------------------
  const SCREENS = {
    code(u, z, w, h) {
      const row = Math.floor((h - z) / 2);
      if ((h - z) % 2) return P.plum1;
      const len = [9, 5, 11, 7, 4, 10, 6][row % 7];
      const ind = [1, 3, 3, 5, 3, 1, 3][row % 7];
      return u >= ind && u < ind + len && u < w - 1 ? [P.mint, P.mustard, P.cor4, P.lime, P.pk2][row % 5] : P.plum1;
    },
    design(u, z, w, h) {
      if (z > h - 4) return P.plum3;
      if (u >= 2 && u < 8 && z >= 3 && z < 9) return P.cor4;
      if (u >= 9 && u < w - 2 && z >= 5 && z < 9) return P.mint;
      if (u >= 2 && u < w - 2 && z === 2) return P.mustard;
      return P.cream1;
    },
    chart(u, z) {
      const bars = [3, 6, 4, 8, 6, 9];
      const bi = Math.floor((u - 2) / 3);
      if (u >= 2 && (u - 2) % 3 < 2 && bi < bars.length && z >= 2 && z < 2 + bars[bi]) return [P.mint, P.mustard, P.cor4][bi % 3];
      return P.plum1;
    },
    off: () => P.plum1,
  };

  const ITEMS = [];
  const add = (def) => ITEMS.push(def);

  // =================================================================
  //  NHÓM 1: LÀM VIỆC
  // =================================================================
  add({
    id: 'desk', name: 'Bàn làm việc', group: 'work', size: [5, 3], place: 'wall',
    variants: [WOOD.plum, WOOD.coral, WOOD.white, WOOD.brown],
    draw(it, iso, c, Z = 0) {
      for (const lv of [1, 23]) { it.box({ u0: 1, u1: 3, v0: lv, v1: lv + 2, z0: Z, z1: Z + 21 }, M(c.mid, c.mid, c.dark)); iso.commit(c.ol); }
      it.box({ u0: 26, u1: 39, v0: 1, v1: 25, z0: Z, z1: Z + 21 }, {
        top: () => c.top,
        front: (u, z, w, h, sh) => (z === 10 ? c.dark : u === 6 && (z === 5 || z === 15) ? c.rim : sh ? c.dark : c.mid),
        side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      it.box({ u0: 0, u1: 40, v0: 0, v1: 26, z0: Z + 21, z1: Z + 24 }, M(c.top, c.mid, c.dark, c.rim));
      iso.commit(c.ol);
    },
  });

  add({
    id: 'exec-desk', name: 'Bàn giám đốc', group: 'work', size: [7, 4], place: 'wall',
    variants: [
      { ...WOOD.plum, name: 'Mận + da xanh', leather: P.mint2, leatherD: P.mint3 },
      { ...WOOD.coral, name: 'San hô + da mận', leather: P.plum3, leatherD: P.plum1 },
    ],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 14, u1: 42, v0: 17, v1: 20, z0: Z + 6, z1: Z + 23 }, M(c.dark, c.dark, c.dark)); iso.commit(c.ol);
      for (const u0 of [0, 42]) {
        it.box({ u0, u1: u0 + 14, v0: 2, v1: 27, z0: Z, z1: Z + 23 }, {
          top: () => c.top,
          front: (u, z, w, h, sh) => (z === 7 || z === 15 ? c.dark : u >= 5 && u < 9 && (z === 11 || z === 19 || z === 3) ? c.rim : sh ? c.dark : c.mid),
          side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
        });
        iso.commit(c.ol);
      }
      it.box({ u0: 0, u1: 56, v0: 0, v1: 29, z0: Z + 23, z1: Z + 27 }, {
        top: (u, v, w, d) => {
          if (u >= w - 1 || v >= d - 1) return c.rim;
          if (u >= 10 && u < 46 && v >= 6 && v < 22) return u === 10 || u === 45 || v === 6 || v === 21 ? c.leatherD : c.leather;
          return c.top;
        },
        front: (u, z, w, h, sh) => (z === 1 ? c.rim : sh ? c.dark : c.mid),
        side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
    },
  });

  // Ghế xoay: người ngồi quay mặt vào tường, lưng ghế hướng về người xem
  add({
    id: 'office-chair', name: 'Ghế xoay', group: 'work', size: [2, 2], place: 'center',
    variants: [FABRIC.cream, FABRIC.coral, FABRIC.mint, FABRIC.plum],
    draw(it, iso, c, Z = 0) {
      const SHELL = { top: P.plum3, mid: P.plum2, dark: P.plum1 };
      const BASE = M(P.plum3, P.plum2, P.plum1);
      // chân sao 5 cánh + bánh xe
      it.box({ u0: 7, u1: 9, v0: 1, v1: 15, z0: Z + 1, z1: Z + 3 }, BASE); iso.commit(P.ink);
      it.box({ u0: 1, u1: 15, v0: 7, v1: 9, z0: Z + 1, z1: Z + 3 }, BASE); iso.commit(P.ink);
      for (const [cu, cv] of [[7, 0], [7, 14], [0, 7], [14, 7]]) { it.box({ u0: cu, u1: cu + 2, v0: cv, v1: cv + 2, z0: Z, z1: Z + 1 }, M(P.ink, P.ink, P.ink)); iso.commit(null); }
      // trụ hơi
      it.box({ u0: 7, u1: 9, v0: 7, v1: 9, z0: Z + 3, z1: Z + 11 }, M(P.plum4, P.plum3, P.plum2)); iso.commit(P.ink);
      // đệm ngồi
      it.box({ u0: 2, u1: 14, v0: 2, v1: 13, z0: Z + 10, z1: Z + 11 }, M(P.plum2, P.plum1, P.plum1)); iso.commit(P.ink);
      it.box({ u0: 1, u1: 15, v0: 1, v1: 14, z0: Z + 11, z1: Z + 15 }, {
        top: (u, v, w, d) => ((u === 0 || u === w - 1) && (v === 0 || v === d - 1) ? null : u >= w - 1 || v >= d - 1 ? c.rim : (u === 1 || v === 1 ? c.mid : c.top)),
        front: (u, z, w, h, sh) => (z === h - 1 && (u === 0 || u === w - 1) ? null : sh ? c.dark : c.mid),
        side: (v, z, d, h, sh) => (z === h - 1 && (v === 0 || v === d - 1) ? null : sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      // tay vịn
      for (const u0 of [0, 14]) {
        it.box({ u0: u0 + 0.5, u1: u0 + 1.5, v0: 7, v1: 8, z0: Z + 15, z1: Z + 19 }, BASE); iso.commit(P.ink);
        it.box({ u0, u1: u0 + 2, v0: 3, v1: 10, z0: Z + 19, z1: Z + 21 }, M(P.plum3, P.plum2, P.plum1, P.plum4, true)); iso.commit(P.ink);
      }
      // thanh nối + lưng ghế: nhìn từ phía sau thấy vỏ nhựa màu mận, viền đệm màu vải
      it.box({ u0: 7, u1: 9, v0: 13, v1: 16, z0: Z + 12, z1: Z + 20 }, BASE); iso.commit(P.ink);
      it.box({ u0: 2, u1: 14, v0: 14, v1: 17, z0: Z + 18, z1: Z + 36 }, {
        top: (u, v, w, d) => ((u === 0 || u === w - 1) ? null : v === 0 ? c.top : SHELL.top),
        front: (u, z, w, h, sh) => {
          if (z >= h - 2 && (u === 0 || u === w - 1)) return null;
          if (z === h - 1 || u === 0 || u === w - 1) return c.mid;                 // viền đệm lộ ra
          if (z > 4 && z < h - 4 && u > 2 && u < w - 3) return sh ? SHELL.mid : SHELL.top;
          return sh ? SHELL.dark : SHELL.mid;
        },
        side: (v, z, d, h, sh) => (z >= h - 2 && (v === 0 || v === d - 1) ? null : v === 0 ? c.dark : sh ? SHELL.dark : SHELL.mid),
      });
      iso.commit(P.ink);
    },
  });

  add({
    id: 'ceo-chair', name: 'Ghế giám đốc', group: 'work', size: [3, 3], place: 'center',
    variants: [
      { name: 'Da mận', top: P.plum3, mid: P.plum2, dark: P.plum1, rim: P.plum4, ol: P.ink },
      { name: 'Da nâu đỏ', top: P.cor1, mid: P.mag3, dark: P.mag2, rim: P.cor3, ol: P.mag0 },
    ],
    draw(it, iso, c, Z = 0) {
      const BASE = M(P.plum3, P.plum2, P.plum1);
      it.box({ u0: 9, u1: 11, v0: 1, v1: 17, z0: Z, z1: Z + 2 }, BASE); iso.commit(P.ink);
      it.box({ u0: 2, u1: 18, v0: 8, v1: 10, z0: Z, z1: Z + 2 }, BASE); iso.commit(P.ink);
      it.box({ u0: 8, u1: 12, v0: 7, v1: 11, z0: Z + 2, z1: Z + 12 }, BASE); iso.commit(P.ink);
      it.box({ u0: 1, u1: 19, v0: 0, v1: 16, z0: Z + 12, z1: Z + 17 }, M(c.top, c.mid, c.dark, c.rim, true)); iso.commit(c.ol);
      for (const u0 of [0, 17]) { it.box({ u0, u1: u0 + 3, v0: 2, v1: 14, z0: Z + 17, z1: Z + 23 }, M(c.top, c.mid, c.dark, c.rim, true)); iso.commit(c.ol); }
      it.box({ u0: 2, u1: 18, v0: 13, v1: 18, z0: Z + 17, z1: Z + 44 }, {
        top: (u, v, w, d) => ((u === 0 || u === w - 1) ? null : c.top),
        front: (u, z, w, h, sh) => {
          if (z >= h - 2 && (u === 0 || u === w - 1)) return null;
          if (z > 3 && z < h - 3 && u > 1 && u < w - 2 && (u - 2) % 4 === 1 && (z % 6 === 2)) return c.dark;   // nút bọc da
          return sh ? c.dark : c.mid;
        },
        side: (v, z, d, h, sh) => (z >= h - 2 && (v === 0 || v === d - 1) ? null : sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
    },
  });

  // Màn hình kiểu PC cổ điển: viền dày màu kem, màn đen bóng có 2 vệt sáng dọc
  function drawMonitor(it, iso, c, Z, u0 = 0, v0 = 0) {
    const B = { top: P.white, mid: P.cream1, dark: P.pk2 };
    // chân đế + cổ
    it.box({ u0: u0 + 6, u1: u0 + 16, v0: v0, v1: v0 + 6, z0: Z, z1: Z + 1 }, M(B.top, B.mid, B.dark, null, true)); iso.commit(P.mag1);
    it.box({ u0: u0 + 9, u1: u0 + 13, v0: v0 + 1, v1: v0 + 3, z0: Z + 1, z1: Z + 5 }, M(B.mid, B.mid, B.dark)); iso.commit(P.mag1);
    // thân màn hình (dày 3)
    const scr = SCREENS[c.s];
    it.box({ u0, u1: u0 + 22, v0: v0, v1: v0 + 3, z0: Z + 4, z1: Z + 21 }, {
      top: () => B.top,
      side: (v, z, d, h, sh) => (sh ? B.dark : B.mid),
      front: (u, z, w, h) => {
        if (u < 2 || u >= w - 2 || z >= h - 2) return u === 0 || z === h - 1 ? B.top : B.mid;     // viền trên + 2 bên
        if (z < 3) return z === 1 && u >= w / 2 - 1 && u <= w / 2 ? P.pk2 : B.mid;                 // viền dưới dày + logo
        const su = u - 2, sz = z - 3, sw = w - 4, sh2 = h - 5;
        if (c.s === 'glossy') {
          if ((su === 1 || su === sw - 2) && sz > 1 && sz < sh2 - 2) return P.cream1;              // 2 vệt sáng dọc
          if (sz === sh2 - 1 && su > 2 && su < 6) return P.plum3;
          return P.ink;
        }
        if ((su === 0 || su === sw - 1) && sz > 1 && sz < sh2 - 2) return P.plum3;
        return scr(su, sz, sw, sh2);
      },
      emissive: c.s !== 'glossy', emTop: false,
    });
    iso.commit(P.mag1);
    if (c.s !== 'glossy') { const [gx, gy] = it.p(u0 + 11, v0 + 7, Z + 13); iso.glow(gx, gy, 15, '#8ff0ff', 0.35); }
  }

  add({
    id: 'monitor', name: 'Màn hình', group: 'work', size: [3, 1], place: 'desk',
    variants: [{ name: 'Đen bóng', s: 'glossy' }, { name: 'Code', s: 'code' }, { name: 'Thiết kế', s: 'design' }, { name: 'Biểu đồ', s: 'chart' }],
    draw(it, iso, c, Z = 0) { drawMonitor(it, iso, c, Z); },
  });

  // Thùng máy (case) đứng: mặt trước có khay ổ đĩa, đèn, khe đĩa mềm
  function drawTower(it, iso, Z, u0 = 0, v0 = 0) {
    it.box({ u0, u1: u0 + 10, v0, v1: v0 + 17, z0: Z, z1: Z + 22 }, {
      top: (u, v, w, d) => (u >= w - 1 || v >= d - 1 ? P.white : P.cream2),
      side: (v, z, d, h, sh) => (z === 3 || (v === 2 && z > 4 && z < h - 3) ? (sh ? P.pk1 : P.pk2) : sh ? P.pk2 : P.cream1),
      front: (u, z, w, h) => {
        if (u === 0 || u === w - 1 || z === h - 1) return P.white;
        if ((z === h - 4 || z === h - 7) && u > 1 && u < w - 2) return P.ink;                          // 2 khay ổ đĩa
        if (z === h - 5 && u > 1 && u < w - 2) return P.pk2;
        if (z === h - 9 && (u === w - 3 || u === w - 5)) return u === w - 3 ? P.mint : P.cor4;          // đèn nguồn / ổ cứng
        if (z === 6 && u > 1 && u < w - 2) return P.ink;                                                // khe đĩa mềm
        if (z === 5 && u >= Math.floor(w / 2) - 1 && u <= Math.floor(w / 2)) return P.ink;
        if (z < 3 && z > 0 && u % 2 === 1) return P.pk2;                                                // khe tản nhiệt
        return P.cream1;
      },
    });
    iso.commit(P.mag1);
  }

  add({
    id: 'pc-tower', name: 'Thùng máy (case)', group: 'work', size: [2, 2], place: 'desk',
    variants: [{ name: 'Kem cổ điển' }],
    draw(it, iso, c, Z = 0) { drawTower(it, iso, Z); },
  });

  add({
    id: 'laptop', name: 'Laptop', group: 'work', size: [2, 2], place: 'desk',
    variants: [
      { name: 'Bạc', top: P.white, mid: P.cream1, dark: P.pk2 },
      { name: 'Mận', top: P.plum4, mid: P.plum3, dark: P.plum2 },
    ],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 16, v0: 2, v1: 13, z0: Z, z1: Z + 1 }, {
        top: (u, v) => (v >= 3 && v < 8 && u >= 2 && u < 14 && (u + v) % 2 === 0 ? c.dark : v >= 9 && u >= 6 && u < 10 ? c.mid : c.top),
        front: () => c.mid, side: () => c.dark,
      });
      iso.commit(P.mag1);
      it.box({ u0: 0, u1: 16, v0: 1, v1: 2, z0: Z + 1, z1: Z + 12 }, {
        top: () => c.top, side: () => c.dark,
        front: (u, z, w, h) => (u < 1 || u >= w - 1 || z < 1 || z >= h - 1 ? c.mid : SCREENS.code(u - 1, z - 1, w - 2, h - 2)),
        emissive: true, emTop: false,
      });
      iso.commit(P.mag1);
      const [gx, gy] = it.p(8, 5, Z + 7); iso.glow(gx, gy, 11, '#8ff0ff', 0.3);
    },
  });

  function drawKeyboard(it, iso, c, Z, u0 = 0, v0 = 0) {
    it.box({ u0, u1: u0 + 22, v0, v1: v0 + 6, z0: Z, z1: Z + 2 }, {
      top: (u, v, w, d) => {
        if (u === 0 || u === w - 1 || v === 0 || v === d - 1) return c.base;
        if (v === d - 2 && u > 5 && u < w - 6) return c.key;           // phím cách dài
        if (v < d - 2 && u % 2 === 1) return c.key;
        return c.base;
      },
      front: () => c.side, side: () => c.side,
    });
    iso.commit(P.mag1);
    // chuột
    it.box({ u0: u0 + 25, u1: u0 + 29, v0: v0 + 1, v1: v0 + 7, z0: Z, z1: Z + 2 }, {
      top: (u, v, w, d) => ((u === 0 || u === w - 1) && (v === 0 || v === d - 1) ? null : v === 2 ? c.side : u === 1 && v < 2 ? c.key : c.base),
      front: () => c.side, side: () => c.side,
    });
    iso.commit(P.mag1);
  }

  add({
    id: 'keyboard', name: 'Bàn phím + chuột', group: 'work', size: [4, 1], place: 'desk',
    variants: [
      { name: 'Kem', base: P.white, key: P.pk2, side: P.cream1 },
      { name: 'Hồng đào', base: P.cream1, key: P.pk1, side: P.pk2 },
    ],
    draw(it, iso, c, Z = 0) { drawKeyboard(it, iso, c, Z); },
  });

  // Góc làm việc ghép sẵn: bàn + case + màn hình + phím chuột
  add({
    id: 'workstation', name: 'Góc làm việc (bộ)', group: 'work', size: [5, 3], place: 'wall',
    variants: [
      { ...WOOD.plum, name: 'Bàn mận · màn đen', s: 'glossy' },
      { ...WOOD.plum, name: 'Bàn mận · code', s: 'code' },
      { ...WOOD.coral, name: 'Bàn san hô · thiết kế', s: 'design' },
      { ...WOOD.white, name: 'Bàn kem · biểu đồ', s: 'chart' },
      { ...WOOD.brown, name: 'Bàn nâu đỏ · màn đen', s: 'glossy' },
      { ...WOOD.brown, name: 'Bàn nâu đỏ · code', s: 'code' },
    ],
    draw(it, iso, c, Z = 0) {
      ITEMS.find((i) => i.id === 'desk').draw(it, iso, c, Z);
      drawTower(it, iso, Z + 24, 1, 3);
      drawMonitor(it, iso, c, Z + 24, 14, 2);
      drawKeyboard(it, iso, { base: P.white, key: P.pk2, side: P.cream1 }, Z + 24, 12, 15);
    },
  });


  add({
    id: 'filing-cabinet', name: 'Tủ hồ sơ', group: 'work', size: [2, 3], place: 'wall',
    variants: [WOOD.white, WOOD.plum, WOOD.coral],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 16, v0: 0, v1: 18, z0: Z, z1: Z + 34 }, {
        top: (u, v, w, d) => (u >= w - 1 || v >= d - 1 ? c.rim : c.top),
        front: (u, z, w, h, sh) => {
          if (z === 11 || z === 22 || z === 0) return sh ? c.dark : P.pk1 === c.dark ? c.dark : c.dark;
          if (u >= 5 && u < 11 && (z === 7 || z === 18 || z === 29)) return c === WOOD.plum ? P.plum4 : P.plum3;   // tay nắm
          if (u >= 6 && u < 10 && (z === 4 || z === 15 || z === 26)) return P.white;                               // nhãn
          return sh ? c.dark : c.mid;
        },
        side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
    },
  });

  add({
    id: 'printer', name: 'Máy in + tủ', group: 'work', size: [3, 3], place: 'wall',
    variants: [WOOD.coral, WOOD.white, WOOD.plum],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 22, v0: 0, v1: 18, z0: Z, z1: Z + 20 }, {
        top: () => c.top,
        front: (u, z, w, h, sh) => (z === 9 ? c.dark : u === 10 && (z === 4 || z === 14) ? c.rim : sh ? c.dark : c.mid),
        side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      it.box({ u0: 2, u1: 20, v0: 2, v1: 16, z0: Z + 20, z1: Z + 30 }, {
        top: (u, v) => (v > 3 && v < 10 && u > 3 && u < 14 ? P.cream1 : P.white),
        front: (u, z) => (z === 4 ? P.plum2 : u > 12 && z === 7 ? P.mint : P.cream2),
        side: () => P.pk2,
      });
      iso.commit(P.mag1);
      it.box({ u0: 6, u1: 14, v0: 4, v1: 10, z0: Z + 30, z1: Z + 31 }, M(P.white, P.cream1, P.cream1)); iso.commit(P.mag1);
      it.box({ u0: 6, u1: 14, v0: 15, v1: 19, z0: Z + 23, z1: Z + 24 }, M(P.white, P.cream1, P.cream1)); iso.commit(P.mag1);
    },
  });

  // =================================================================
  //  NHÓM 7: TRANG TRÍ
  // =================================================================
  function pot(it, iso, z0, h, col, Z = 0, size = 14) {
    const o = (16 - size) / 2;
    it.box({ u0: o, u1: o + size, v0: o, v1: o + size, z0: Z + z0, z1: Z + h }, {
      top: (u, v, w, d) => (u > 1 && v > 1 && u < w - 2 && v < d - 2 ? P.brown : col.rim),
      front: (u, z, w, hh, sh) => (z === hh - 3 ? col.band : sh ? col.dark : col.mid),
      side: (v, z, d, hh, sh) => (z === hh - 3 ? col.band : sh ? col.dark : col.mid),
    });
    iso.commit(P.mag1);
  }
  const POTS = {
    white: { mid: P.white, dark: P.cream1, rim: P.white, band: P.cor4 },
    terra: { mid: P.cor4, dark: P.cor1, rim: P.peach, band: P.mag3 },
    plum: { mid: P.plum3, dark: P.plum2, rim: P.plum4, band: P.mustard },
  };

  add({
    id: 'big-plant', name: 'Cây lớn', group: 'decor', size: [2, 2], place: 'center',
    variants: [{ name: 'Cây bụi', kind: 'bush', pot: 'white' }, { name: 'Bàng Singapore', kind: 'fiddle', pot: 'terra' }, { name: 'Xương rồng', kind: 'cactus', pot: 'plum' }],
    draw(it, iso, c, Z = 0) {
      pot(it, iso, 0, 14, POTS[c.pot], Z);
      const [sx, sy] = it.p(8, 8, Z + 14);
      if (c.kind === 'bush') {
        const L = [[0, -10, 7, 6], [-7, -6, 5, 4], [7, -7, 5, 4], [-4, -18, 5, 5], [5, -17, 5, 5], [0, -25, 4, 5], [-8, -14, 4, 3], [9, -13, 3, 3]];
        for (const [dx, dy, rx, ry] of L) iso.blob(sx + dx, sy + dy, rx, ry, P.mint2);
        for (const [dx, dy, rx, ry] of L) iso.blob(sx + dx - 1, sy + dy - 1, rx - 2, ry - 2, P.mint);
        for (const [dx, dy] of L) iso.put(sx + dx - 2, sy + dy - 2, P.lime);
        iso.commit(P.mint3);
      } else if (c.kind === 'fiddle') {
        for (let k = 0; k < 30; k++) iso.put(sx, sy - k, P.brown);
        iso.commit(P.mag0);
        const L = [[-6, -12, 4, 3], [6, -16, 4, 3], [-5, -22, 4, 3], [5, -27, 4, 3], [0, -33, 3, 4], [-6, -31, 3, 3]];
        for (const [dx, dy, rx, ry] of L) { iso.blob(sx + dx, sy + dy, rx, ry, P.mint2); iso.blob(sx + dx, sy + dy - 1, rx - 1, ry - 1, P.mint); iso.put(sx + dx, sy + dy, P.mint2); iso.put(sx + dx - 1, sy + dy - 2, P.lime); }
        iso.commit(P.mint3);
      } else {
        const col = (x, top, bot, w) => { for (let y = top; y <= bot; y++) for (let dx = 0; dx < w; dx++) iso.put(sx + x + dx, sy + y, dx === 0 ? P.lime : dx === w - 1 ? P.mint2 : (y % 4 === 0 && dx === 2 ? P.white : P.mint)); };
        col(-3, -34, 0, 7);
        col(-9, -22, -14, 4); for (let dx = -9; dx < -3; dx++) for (let y = -14; y < -11; y++) iso.put(sx + dx, sy + y, P.mint);
        col(5, -26, -18, 4); for (let dx = 3; dx < 9; dx++) for (let y = -18; y < -15; y++) iso.put(sx + dx, sy + y, P.mint);
        iso.put(sx, sy - 36, P.mag4); iso.put(sx - 1, sy - 35, P.mag4); iso.put(sx + 1, sy - 35, P.mag4);
        iso.commit(P.mint3);
      }
    },
  });

  add({
    id: 'small-plant', name: 'Cây nhỏ', group: 'decor', size: [1, 1], place: 'desk',
    variants: [{ name: 'Sen đá', kind: 'succ', pot: 'terra' }, { name: 'Hoa hồng', kind: 'flower', pot: 'white' }, { name: 'Trầu bà rủ', kind: 'trail', pot: 'plum' }],
    draw(it, iso, c, Z = 0) {
      const pc = POTS[c.pot];
      it.box({ u0: 1, u1: 7, v0: 1, v1: 7, z0: Z, z1: Z + 6 }, {
        top: (u, v, w, d) => (u > 0 && v > 0 && u < w - 1 && v < d - 1 ? P.brown : pc.rim),
        front: (u, z, w, h, sh) => (sh ? pc.dark : pc.mid), side: (v, z, d, h, sh) => (sh ? pc.dark : pc.mid),
      });
      iso.commit(P.mag1);
      const [sx, sy] = it.p(4, 4, Z + 6);
      if (c.kind === 'succ') {
        iso.blob(sx, sy - 2, 4, 2, P.mint2); iso.blob(sx, sy - 3, 3, 1, P.mint); iso.put(sx, sy - 5, P.lime); iso.put(sx - 2, sy - 4, P.lime); iso.put(sx + 2, sy - 4, P.lime);
        iso.put(sx - 4, sy - 2, P.mag4); iso.put(sx + 4, sy - 2, P.mag4);
      } else if (c.kind === 'flower') {
        for (let k = 0; k < 5; k++) iso.put(sx, sy - k, P.mint2);
        iso.put(sx - 2, sy - 3, P.mint); iso.put(sx + 2, sy - 2, P.mint);
        for (const [dx, dy] of [[0, -7], [-3, -5], [3, -6]]) { iso.blob(sx + dx, sy + dy, 2, 2, P.cor1); iso.put(sx + dx, sy + dy - 1, P.cor4); }
      } else {
        iso.blob(sx, sy - 3, 4, 2, P.mint2); iso.blob(sx - 1, sy - 4, 2, 1, P.mint);
        for (let k = 0; k < 9; k++) { iso.put(sx - 5, sy - 2 + k, k % 3 === 0 ? P.mint : P.mint2); iso.put(sx + 5, sy - 1 + Math.floor(k * 0.7), k % 3 === 1 ? P.mint : P.mint2); }
      }
      iso.commit(P.mint3);
    },
  });

  add({
    id: 'rug', name: 'Thảm', group: 'decor', size: [8, 6], place: 'center',
    variants: [
      { name: 'Kẻ ô mận', kind: 'plaid', a: P.plum4, b: P.plum3, line: P.pk2, acc: P.mustard, ol: P.ink },
      { name: 'Sọc đào', kind: 'stripe', a: P.pk2, b: P.cor4, line: P.white, acc: P.cor1, ol: P.mag1 },
      { name: 'Thổ cẩm', kind: 'diamond', a: P.cor1, b: P.mag2, line: P.peach, acc: P.cream1, ol: P.mag0 },
    ],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 64, v0: 0, v1: 48, z0: Z, z1: Z + 1 }, {
        top: (u, v, w, d) => {
          if (u < 3 || v < 3 || u >= w - 3 || v >= d - 3) return c.b;
          if (u === 3 || v === 3 || u === w - 4 || v === d - 4) return c.line;
          const iu = u - 4, iv = v - 4, iw = w - 8, id = d - 8;
          if (c.kind === 'plaid') {
            if (iv % 14 < 2) return c.line;
            if (iu % 14 < 2) return c.b;
            return c.a;
          }
          if (c.kind === 'stripe') {
            const band = Math.floor(iv / 5) % 4;
            if (band === 1) return c.b;
            if (band === 3) return iu % 6 < 3 ? c.acc : c.a;
            return c.a;
          }
          // thổ cẩm: lưới hình thoi
          const du = ((iu % 16) + 16) % 16 - 8, dv = ((iv % 16) + 16) % 16 - 8;
          const r = Math.abs(du) + Math.abs(dv);
          if (r === 6 || r === 7) return c.line;
          if (r < 3) return c.acc;
          return c.a;
        },
        front: () => c.b, side: () => c.b,
      });
      iso.commit(c.ol);
    },
  });

  // Đồ treo tường: vẽ thành tấm mỏng sát tường (v từ 0 đến 1)
  add({
    id: 'painting', name: 'Tranh', group: 'decor', size: [3, 0], place: 'onwall', wallZ: 30,
    variants: [{ name: 'Hoàng hôn', kind: 'sunset' }, { name: 'Núi', kind: 'mountain' }, { name: 'Trừu tượng', kind: 'abstract' }],
    draw(it, iso, c, Z = 30) {
      it.box({ u0: 0, u1: 22, v0: 0, v1: 1, z0: Z, z1: Z + 26 }, {
        front: (u, z, w, h) => {
          if (u < 2 || u >= w - 2 || z < 2 || z >= h - 2) return P.plum2;
          if (u === 2 || z === h - 3) return P.cream1;
          if (c.kind === 'sunset') {
            if (z < h * 0.4) return P.mag3;
            if (Math.hypot(u - w / 2, z - h * 0.45) < 4) return P.mustard;
            return z < h * 0.7 ? P.cor4 : P.peach;
          }
          if (c.kind === 'mountain') {
            const ridge = h * 0.35 + Math.abs(((u * 3) % 22) - 11) * 0.9;
            if (z < ridge - 4) return P.mint3;
            if (z < ridge) return P.mint2;
            if (Math.hypot(u - w * 0.7, z - h * 0.75) < 2.5) return P.white;
            return P.sky;
          }
          if (u < w / 2 && z > h / 2) return P.mustard;
          if (Math.hypot(u - w * 0.65, z - h * 0.4) < 5) return P.cor4;
          if (u > w * 0.3 && u < w * 0.4) return P.plum3;
          return P.cream2;
        },
      });
      iso.commit(P.ink);
    },
  });

  add({
    id: 'clock', name: 'Đồng hồ', group: 'decor', size: [2, 0], place: 'onwall', wallZ: 40,
    variants: [{ name: 'Viền mận', face: P.white, rim: P.plum2 }, { name: 'Viền vàng', face: P.cream2, rim: P.mustD }, { name: 'Viền san hô', face: P.white, rim: P.cor1 }],
    draw(it, iso, c, Z = 40) {
      const R = 8.2, C = 8;
      it.box({ u0: 0, u1: 17, v0: 0, v1: 1, z0: Z, z1: Z + 17 }, {
        front: (u, z) => {
          const d = Math.hypot(u - C, z - C);
          if (d > R) return null;
          if (d > R - 1.6) return c.rim;
          // vạch giờ
          if ((u === C && (z === 2 || z === 14)) || (z === C && (u === 2 || u === 14))) return P.plum3;
          if (u === C && z >= C && z <= C + 5) return P.ink;             // kim phút
          if (z === C && u >= C && u <= C + 3) return P.ink;             // kim giờ
          if (u === C - 1 && z === C - 2) return P.cor4;                 // kim giây
          if (u === C - 2 && z === C - 3) return P.cor4;
          if (d < 2.5 && u < C && z > C) return P.cream1;                // bóng mặt kính
          return c.face;
        },
      });
      iso.commit(null);
      const [sx, sy] = it.p(C + 0.5, 0, Z + C + 0.5);
      iso.commit(null);
    },
  });

  add({
    id: 'window', name: 'Cửa sổ', group: 'decor', size: [4, 0], place: 'onwall', wallZ: 24,
    variants: [{ name: 'Cửa đôi', kind: 'double' }, { name: 'Có rèm', kind: 'curtain' }],
    draw(it, iso, c, Z = 24) {
      it.box({ u0: 0, u1: 32, v0: 0, v1: 1, z0: Z, z1: Z + 34 }, {
        front: (u, z, w, h) => {
          if (u < 2 || u >= w - 2 || z < 2 || z >= h - 2) return P.white;
          if (u === Math.floor(w / 2) || u === Math.floor(w / 2) - 1 || z === Math.floor(h / 2)) return P.white;
          if (iso.night) return z > h * 0.6 ? P.plum2 : P.plum1;
          if ((u + z) % 11 === 0 || (u + z) % 11 === 1) return P.white;
          return z > h * 0.55 ? P.cream2 : P.sand;
        },
      });
      iso.commit(P.mag1);
      it.box({ u0: -2, u1: 34, v0: 0, v1: 4, z0: Z - 2, z1: Z }, M(P.white, P.cream1, P.pk2)); iso.commit(P.mag1);
      if (c.kind === 'curtain') {
        for (const [u0, u1] of [[-4, 4], [28, 36]]) {
          it.box({ u0, u1, v0: 1, v1: 2, z0: Z - 4, z1: Z + 38 }, { front: (u, z) => (u % 3 === 0 ? P.mustD : P.mustard) });
          iso.commit(P.mag1);
        }
        it.box({ u0: -6, u1: 38, v0: 1, v1: 3, z0: Z + 38, z1: Z + 40 }, M(P.plum2, P.plum2, P.plum1)); iso.commit(P.ink);
      }
    },
  });

  add({
    id: 'wall-light', name: 'Đèn tuýp ngang', group: 'decor', size: [6, 0], place: 'onwall', wallZ: 50,
    variants: [{ name: 'Trắng ấm', glow: '#fff2c0', tube: P.white }, { name: 'Vàng', glow: '#ffd27a', tube: P.cream2 }],
    draw(it, iso, c, Z = 50, len = 48) {
      // giá đỡ + máng đèn + bóng tuýp phát sáng ở mép dưới
      for (const u of [4, len - 6]) { it.box({ u0: u, u1: u + 2, v0: 0, v1: 3, z0: Z + 3, z1: Z + 5 }, M(P.plum3, P.plum2, P.plum1)); iso.commit(P.ink); }
      it.box({ u0: 0, u1: len, v0: 2, v1: 6, z0: Z, z1: Z + 4 }, {
        top: () => P.cream2,
        front: (u, z) => (z === 0 ? c.tube : P.cream1),
        side: () => P.pk2,
        emissive: true, emTop: false,
      });
      iso.commit(P.mag1);
      it.box({ u0: 1, u1: len - 1, v0: 3, v1: 5, z0: Z - 1, z1: Z }, { top: () => c.tube, front: () => c.tube, side: () => c.tube, emissive: true });
      iso.commit(null);
      for (let u = 6; u < len; u += 12) { const [gx, gy] = it.p(u, 6, Z - 4); iso.glow(gx, gy, 16, c.glow, 0.5); }
    },
  });

  add({
    id: 'wall-shelf', name: 'Kệ treo tường', group: 'decor', size: [5, 1], place: 'onwall', wallZ: 46,
    variants: [WOOD.coral, WOOD.plum, WOOD.white],
    draw(it, iso, c, Z = 46) {
      it.box({ u0: 0, u1: 40, v0: 0, v1: 9, z0: Z - 2, z1: Z }, M(c.top, c.mid, c.dark, c.rim)); iso.commit(c.ol);
      const books = [[2, 5, 16, P.mag3, P.mag1], [7, 4, 13, P.mustard, P.mustD], [11, 4, 17, P.plum4, P.plum2], [15, 5, 14, P.mint2, P.mint3]];
      for (const [du, w, h, col, dk] of books) { it.box({ u0: du, u1: du + w, v0: 1, v1: 8, z0: Z, z1: Z + h }, M(col, col, dk, P.white)); iso.commit(P.ink); }
      // cúp
      const [cx, cy] = it.p(27, 4, Z + 10);
      iso.blob(cx, cy, 3, 3, P.mustard); iso.put(cx, cy + 4, P.mustD); for (let d = -1; d <= 1; d++) iso.put(cx + d, cy + 6, P.mustD);
      iso.put(cx - 1, cy - 1, P.white);
      iso.commit(P.mag1);
      // chậu cây nhỏ
      it.box({ u0: 33, u1: 38, v0: 2, v1: 7, z0: Z, z1: Z + 5 }, M(P.brown, P.cor4, P.cor1, P.peach)); iso.commit(P.mag1);
      const [px, py] = it.p(35.5, 4.5, Z + 5);
      iso.blob(px, py - 2, 3, 2, P.mint2); iso.put(px, py - 3, P.mint); iso.put(px + 3 * it.sgn, py + 2, P.mint2); iso.put(px + 3 * it.sgn, py + 4, P.mint);
      iso.commit(P.mint3);
    },
  });

  // =================================================================
  //  NHÓM 8: ĐỒ NHỎ KỂ CHUYỆN
  // =================================================================
  add({
    id: 'mug', name: 'Cốc', group: 'small', size: [1, 1], place: 'desk',
    variants: [{ name: 'San hô', c: P.cor4, d: P.cor1 }, { name: 'Vàng', c: P.mustard, d: P.mustD }, { name: 'Bạc hà', c: P.mint, d: P.mint2 }, { name: 'Mận', c: P.plum4, d: P.plum2 }],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 5, v0: 0, v1: 5, z0: Z, z1: Z + 6 }, {
        top: (u, v) => (u > 0 && v > 0 && u < 4 && v < 4 ? P.brown : P.white),
        front: (u, z) => (z === 3 ? P.white : c.c), side: () => c.d,
      });
      iso.commit(P.mag1);
      const [hx, hy] = it.p(5, 2.5, Z + 4);
      const s = it.sgn;
      iso.put(hx + s, hy - 1, c.c); iso.put(hx + 2 * s, hy, c.c); iso.put(hx + s, hy + 1, c.c);
      iso.commit(P.mag1);
      // hơi nóng
      const [tx, ty] = it.p(2.5, 2.5, Z + 9);
      iso.put(tx, ty, P.white); iso.put(tx + 1, ty - 1, P.white); iso.put(tx, ty - 2, P.white); iso.put(tx - 1, ty - 4, P.white);
      iso.commit(null, 0.6);
    },
  });

  add({
    id: 'snack-plate', name: 'Đĩa bánh', group: 'small', size: [2, 2], place: 'desk',
    variants: [{ name: 'Bánh quy', kind: 'cookie' }, { name: 'Bánh kem', kind: 'cake' }],
    draw(it, iso, c, Z = 0) {
      const [px, py] = it.p(7, 7, Z + 1);
      iso.blob(px, py, 7, 3, P.white); iso.blob(px, py + 1, 6, 2, P.cream1); iso.commit(P.pk1);
      if (c.kind === 'cookie') {
        for (const [dx, dy, col] of [[-3, -1, P.peach], [2, -2, P.cor3], [0, 1, P.peach], [4, 0, P.mag3]]) { iso.blob(px + dx, py + dy, 2, 1, col); iso.put(px + dx, py + dy, P.brown); }
        iso.commit(P.mag1);
      } else {
        it.box({ u0: 4, u1: 10, v0: 4, v1: 10, z0: Z + 1, z1: Z + 7 }, {
          top: (u, v) => ((u + v) % 4 === 0 ? P.mag4 : P.cream2),
          front: (u, z) => (z > 3 ? P.cream2 : z === 3 ? P.cor4 : P.peach2), side: (v, z) => (z > 3 ? P.cream1 : z === 3 ? P.cor1 : P.peach),
        });
        iso.commit(P.mag1);
        const [cx, cy] = it.p(7, 7, Z + 7); iso.put(cx, cy - 1, P.mag4); iso.put(cx, cy - 2, P.cor4); iso.commit(P.mag0);
      }
    },
  });

  add({
    id: 'book-stack', name: 'Chồng sách', group: 'small', size: [1, 1], place: 'desk',
    variants: [{ name: 'Ấm', cols: [[P.mag3, P.mag1], [P.mustard, P.mustD], [P.cor4, P.cor1]] }, { name: 'Mát', cols: [[P.mint2, P.mint3], [P.plum4, P.plum2], [P.lime, P.mint2]] }],
    draw(it, iso, c, Z = 0) {
      c.cols.forEach(([col, dk], k) => {
        const o = k % 2;
        it.box({ u0: o, u1: o + 9, v0: 1 - o, v1: 7 - o, z0: Z + k * 3, z1: Z + k * 3 + 3 }, {
          top: (u, v, w, d) => (u >= w - 1 || v >= d - 1 ? P.white : col),
          front: (u, z) => (z === 1 ? P.white : dk), side: (v, z) => (z === 1 ? P.cream1 : dk),
        });
        iso.commit(P.ink);
      });
    },
  });

  add({
    id: 'sticky-notes', name: 'Giấy note', group: 'small', size: [1, 1], place: 'desk',
    variants: [{ name: 'Nhiều màu' }],
    draw(it, iso, c, Z = 0) {
      const notes = [[0, 0, P.mustard], [5, 2, P.mint], [2, 6, P.cor4]];
      for (const [u, v, col] of notes) {
        it.box({ u0: u, u1: u + 5, v0: v, v1: v + 5, z0: Z, z1: Z + 1 }, { top: (a, b) => (b === 2 && a > 0 && a < 4 ? P.plum3 : col), front: () => col, side: () => col });
        iso.commit(P.mag1);
      }
      // bút
      const [bx, by] = it.p(10, 3, Z + 1);
      for (let k = 0; k < 6; k++) iso.put(bx + k * it.sgn, by + Math.floor(k / 2), k < 5 ? P.plum3 : P.mustard);
      iso.commit(P.ink);
    },
  });

  add({
    id: 'trophy', name: 'Cúp', group: 'small', size: [1, 1], place: 'desk',
    variants: [{ name: 'Vàng', c: P.mustard, d: P.mustD }, { name: 'Bạc', c: P.cream1, d: P.pk1 }],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 1, u1: 7, v0: 1, v1: 7, z0: Z, z1: Z + 3 }, M(P.plum3, P.plum2, P.plum1)); iso.commit(P.ink);
      const [cx, cy] = it.p(4, 4, Z + 3);
      iso.put(cx, cy - 1, c.d); iso.put(cx, cy - 2, c.d);
      for (let y = 0; y < 5; y++) for (let x = -3 + Math.floor(y / 2); x <= 3 - Math.floor(y / 2); x++) iso.put(cx + x, cy - 8 + y, y === 0 ? c.d : c.c);
      iso.put(cx - 4, cy - 7, c.c); iso.put(cx + 4, cy - 7, c.c); iso.put(cx - 4, cy - 6, c.c); iso.put(cx + 4, cy - 6, c.c);
      iso.put(cx - 1, cy - 7, P.white);
      iso.commit(P.mag1);
    },
  });

  add({
    id: 'backpack', name: 'Balo', group: 'small', size: [2, 1], place: 'center',
    variants: [
      { name: 'San hô', top: P.cor4, mid: P.mag4, dark: P.mag2, acc: P.cor3, ol: P.mag0 },
      { name: 'Bạc hà', top: P.mint, mid: P.mint2, dark: P.mint3, acc: P.lime, ol: P.ink },
      { name: 'Mận', top: P.plum4, mid: P.plum3, dark: P.plum2, acc: P.mustard, ol: P.ink },
    ],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 11, v0: 0, v1: 7, z0: Z, z1: Z + 13 }, {
        top: (u, v, w, d) => ((u === 0 || u === w - 1) && (v === 0 || v === d - 1) ? null : c.top),
        front: (u, z, w, h, sh) => {
          if (z === h - 1 && (u === 0 || u === w - 1)) return null;
          if (z > 2 && z < 7 && u > 1 && u < w - 2) return z === 6 ? c.dark : c.acc;     // túi trước
          return sh ? c.dark : c.mid;
        },
        side: (v, z, d, h, sh) => (z === h - 1 && (v === 0 || v === d - 1) ? null : sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
    },
  });

  add({
    id: 'sock', name: 'Chiếc tất rơi', group: 'small', size: [2, 1], place: 'center',
    variants: [{ name: 'Trắng sọc xanh', c: P.white, d: P.cream1, s: P.mint2 }, { name: 'Vàng sọc đỏ', c: P.mustard, d: P.mustD, s: P.cor1 }],
    draw(it, iso, c, Z = 0) {
      // ống tất nằm dọc theo u, bàn chân gập về phía +v
      it.box({ u0: 0, u1: 10, v0: 0, v1: 4, z0: Z, z1: Z + 2 }, {
        top: (u) => (u < 2 ? c.s : u === 3 ? c.s : c.c), front: (u) => (u < 2 || u === 3 ? c.s : c.d), side: () => c.d,
      });
      iso.commit(P.pk1);
      it.box({ u0: 7, u1: 11, v0: 4, v1: 9, z0: Z, z1: Z + 2 }, {
        top: (u, v) => (v >= 3 ? c.s : c.c), front: () => c.s, side: () => c.d,
      });
      iso.commit(P.pk1);
    },
  });

  add({
    id: 'trash-bin', name: 'Thùng rác', group: 'small', size: [1, 1], place: 'center',
    variants: [{ name: 'Mận', top: P.plum3, mid: P.plum2, dark: P.plum1, ol: P.ink }, { name: 'Kem', top: P.cream2, mid: P.cream1, dark: P.pk2, ol: P.mag1 }],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 8, v0: 0, v1: 8, z0: Z, z1: Z + 10 }, {
        top: (u, v, w, d) => (u > 0 && v > 0 && u < w - 1 && v < d - 1 ? ((u * v) % 5 === 0 ? P.white : P.cream1) : c.top),
        front: (u, z, w, h, sh) => (u % 2 ? c.mid : c.dark), side: (v, z, d, h, sh) => (v % 2 ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      const [px, py] = it.p(4, 4, Z + 11);
      iso.blob(px, py, 2, 1, P.white); iso.commit(P.pk1);   // giấy vo viên
    },
  });

  global.ITEMS = ITEMS;
  global.ITEM_GROUPS = { work: 'Làm việc', decor: 'Trang trí', small: 'Đồ nhỏ' };
})(typeof window !== 'undefined' ? window : globalThis);
