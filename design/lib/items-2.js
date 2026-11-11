// =====================================================================
//  THƯ VIỆN ĐỒ VẬT — đợt 2: ngồi nghỉ + phòng họp
//  Cùng quy ước với items.js (u dọc tường, v ra xa tường, 2 hướng R/L)
// =====================================================================
(function (global) {
  const { mat: M, P } = global.Iso;
  const ITEMS = global.ITEMS;
  const add = (def) => ITEMS.push(def);
  global.ITEM_GROUPS.lounge = 'Ngồi nghỉ';
  global.ITEM_GROUPS.meeting = 'Phòng họp';

  const FABRIC = {
    plum: { name: 'Nhung mận', top: P.plum4, mid: P.plum3, dark: P.plum2, rim: P.pk1, ol: P.ink, leg: P.cream1 },
    coral: { name: 'Nhung san hô', top: P.peach2, mid: P.cor4, dark: P.cor1, rim: P.sand, ol: P.mag1, leg: P.plum2 },
    cream: { name: 'Vải kem', top: P.white, mid: P.cream1, dark: P.pk2, rim: P.white, ol: P.mag1, leg: P.plum2 },
    mint: { name: 'Nhung bạc hà', top: P.lime, mid: P.mint, dark: P.mint2, rim: P.white, ol: P.mint3, leg: P.cream1 },
  };
  const WOOD = {
    plum: { name: 'Gỗ mận', top: P.plum3, mid: P.plum2, dark: P.plum1, rim: P.plum4, ol: P.ink, leg: P.cream1 },
    coral: { name: 'Gỗ san hô', top: P.peach2, mid: P.cor4, dark: P.cor1, rim: P.sand, ol: P.mag1, leg: P.cream1 },
    white: { name: 'Trắng kem', top: P.white, mid: P.cream1, dark: P.pk2, rim: P.white, ol: P.mag1, leg: P.plum2 },
  };

  // Vật liệu bọc nệm: góc bo tròn + mép "lông vải" lởm chởm ở cạnh xa (thành viền lởm chởm khi tô viền)
  function plush(c, { fuzz = true, round = true, light = 0 } = {}) {
    return {
      // Góc bo: góc xa (phía tường) cắt trống để thành viền tròn; góc gần tô tối hơn
      // thay vì để trống, tránh lỗ thủng lốm đốm trên đệm
      top: (u, v, w, d) => {
        if (round && u === 0 && v === 0) return null;
        if (round && (u === 0 || u === w - 1) && (v === 0 || v === d - 1)) return c.mid;
        if (fuzz && (u === 0 || v === 0) && (u + v) % 2 === 0) return null;
        if (u >= w - 1 || v >= d - 1) return c.rim;
        return light && u > 1 && v > 1 && u < 4 ? c.rim : c.top;
      },
      front: (u, z, w, h, sh) => {
        if (round && (z === h - 1 || z === 0) && (u === 0 || u === w - 1)) return sh ? P.ink : c.dark;
        return sh ? c.dark : c.mid;
      },
      side: (v, z, d, h, sh) => {
        if (round && (z === h - 1 || z === 0) && (v === 0 || v === d - 1)) return v === 0 && z === h - 1 ? null : sh ? P.ink : c.dark;
        if (fuzz && v === 0 && z % 2 === 0) return null;
        return sh ? c.dark : c.mid;
      },
    };
  }

  // =================================================================
  //  NHÓM 2: NGỒI NGHỈ
  // =================================================================
  // Sofa n chỗ, lưng dựa tường, người ngồi nhìn ra phía +v
  function drawSofa(it, iso, c, Z, seats) {
    const SW = 15;                                // bề rộng mỗi chỗ ngồi
    const W = seats * SW + 12;
    const legM = M(c.leg, c.leg, c.leg);
    for (const [lu, lv] of [[2, 3], [W - 4, 3], [2, 22], [W - 4, 22]]) { it.box({ u0: lu, u1: lu + 2, v0: lv, v1: lv + 2, z0: Z, z1: Z + 3 }, legM); iso.commit(c.ol); }
    it.box({ u0: 1, u1: W - 1, v0: 2, v1: 25, z0: Z + 3, z1: Z + 9 }, M(c.mid, c.mid, c.dark)); iso.commit(c.ol);
    // lưng sofa
    it.box({ u0: 3, u1: W - 3, v0: 2, v1: 9, z0: Z + 9, z1: Z + 27 }, plush(c)); iso.commit(c.ol);
    // tay vịn bên u thấp (ở phía sau đệm)
    it.box({ u0: 0, u1: 7, v0: 2, v1: 26, z0: Z + 6, z1: Z + 19 }, plush(c, { light: 1 })); iso.commit(c.ol);
    // đệm lưng + đệm ngồi từng chỗ
    for (let k = 0; k < seats; k++) {
      const u0 = 6 + k * SW;
      it.box({ u0: u0 + 1, u1: u0 + SW - 1, v0: 6, v1: 11, z0: Z + 12, z1: Z + 25 }, plush(c, { fuzz: false })); iso.commit(c.ol);
      it.box({ u0, u1: u0 + SW, v0: 10, v1: 25, z0: Z + 9, z1: Z + 14 }, plush(c, { fuzz: false, light: 1 })); iso.commit(c.ol);
    }
    // tay vịn bên u cao (ở phía trước đệm)
    it.box({ u0: W - 7, u1: W, v0: 2, v1: 26, z0: Z + 6, z1: Z + 19 }, plush(c, { light: 1 })); iso.commit(c.ol);
  }

  add({
    id: 'sofa-3', name: 'Sofa 3 chỗ', group: 'lounge', size: [7, 4], place: 'wall',
    variants: [FABRIC.plum, FABRIC.coral, FABRIC.cream, FABRIC.mint],
    draw(it, iso, c, Z = 0) { drawSofa(it, iso, c, Z, 3); },
  });
  add({
    id: 'sofa-2', name: 'Sofa 2 chỗ', group: 'lounge', size: [5, 4], place: 'wall',
    variants: [FABRIC.coral, FABRIC.plum, FABRIC.cream, FABRIC.mint],
    draw(it, iso, c, Z = 0) { drawSofa(it, iso, c, Z, 2); },
  });
  add({
    id: 'armchair', name: 'Ghế bành', group: 'lounge', size: [4, 4], place: 'center',
    variants: [FABRIC.mint, FABRIC.coral, FABRIC.plum, FABRIC.cream],
    draw(it, iso, c, Z = 0) { drawSofa(it, iso, c, Z, 1); },
  });

  add({
    id: 'ottoman', name: 'Ghế đôn', group: 'lounge', size: [2, 2], place: 'center',
    variants: [FABRIC.plum, FABRIC.coral, FABRIC.cream, FABRIC.mint],
    draw(it, iso, c, Z = 0) {
      for (const [lu, lv] of [[1, 1], [15, 1], [1, 15], [15, 15]]) { it.box({ u0: lu, u1: lu + 2, v0: lv, v1: lv + 2, z0: Z, z1: Z + 3 }, M(c.leg, c.leg, c.leg)); iso.commit(c.ol); }
      const st = plush(c);
      it.box({ u0: 0, u1: 18, v0: 0, v1: 18, z0: Z + 3, z1: Z + 13 }, {
        ...st,
        top: (u, v, w, d) => {
          const base = st.top(u, v, w, d);
          if (!base) return null;
          if ((u === 6 || u === 12) && (v === 6 || v === 12)) return c.dark;   // nút bọc
          return base;
        },
      });
      iso.commit(c.ol);
    },
  });

  add({
    id: 'coffee-table', name: 'Bàn trà', group: 'lounge', size: [5, 3], place: 'center',
    variants: [WOOD.plum, WOOD.coral, WOOD.white],
    draw(it, iso, c, Z = 0) {
      const legM = M(c.leg, c.leg, c.leg === P.cream1 ? P.pk2 : P.plum1);
      for (const [lu, lv] of [[1, 1], [33, 1], [1, 18], [33, 18]]) { it.box({ u0: lu, u1: lu + 2, v0: lv, v1: lv + 2, z0: Z, z1: Z + 13 }, legM); iso.commit(P.mag1); }
      it.box({ u0: 2, u1: 34, v0: 2, v1: 19, z0: Z + 4, z1: Z + 6 }, M(c.mid, c.mid, c.dark)); iso.commit(c.ol);   // kệ dưới
      it.box({ u0: 0, u1: 36, v0: 0, v1: 21, z0: Z + 13, z1: Z + 16 }, {
        top: (u, v, w, d) => {
          if (u >= w - 1 || v >= d - 1) return c.rim;
          if ((u + v) % 13 === 0 && u > 3 && u < w - 6) return c.rim;     // vệt bóng mặt bàn
          return c.top;
        },
        front: (u, z, w, h, sh) => (sh ? c.dark : c.mid), side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      // tạp chí trên kệ dưới
      it.box({ u0: 6, u1: 16, v0: 5, v1: 13, z0: Z + 6, z1: Z + 7 }, M(P.mustard, P.mustD, P.mustD)); iso.commit(P.mag1);
    },
  });

  add({
    id: 'tv-stand', name: 'Kệ TV + TV', group: 'lounge', size: [7, 2], place: 'wall',
    variants: [{ ...WOOD.white, name: 'Kệ kem · TV tắt', on: false }, { ...WOOD.plum, name: 'Kệ mận · TV bật', on: true }, { ...WOOD.coral, name: 'Kệ san hô · TV tắt', on: false }],
    draw(it, iso, c, Z = 0) {
      const W = 56;
      for (const [lu, lv] of [[2, 2], [W - 4, 2], [2, 12], [W - 4, 12]]) { it.box({ u0: lu, u1: lu + 2, v0: lv, v1: lv + 2, z0: Z, z1: Z + 3 }, M(P.plum2, P.plum2, P.plum1)); iso.commit(P.ink); }
      it.box({ u0: 0, u1: W, v0: 0, v1: 15, z0: Z + 3, z1: Z + 17 }, {
        top: (u, v, w, d) => (u >= w - 1 || v >= d - 1 ? c.rim : c.top),
        front: (u, z, w, h, sh) => {
          if (u === Math.floor(w / 3) || u === Math.floor((2 * w) / 3)) return c.dark;
          if (z === h - 4 && u > w / 3 && u < (2 * w) / 3) return c.dark;
          if ((u === Math.floor(w / 3) - 3 || u === Math.floor((2 * w) / 3) + 3) && z > 4 && z < 9) return c.rim;   // tay nắm
          return sh ? c.dark : c.mid;
        },
        side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      // máy chơi game + tay cầm trên kệ
      it.box({ u0: 4, u1: 14, v0: 5, v1: 12, z0: Z + 17, z1: Z + 19 }, M(P.white, P.cream1, P.pk2)); iso.commit(P.mag1);
      const [gx, gy] = it.p(47, 9, Z + 17); iso.blob(gx, gy, 3, 1, P.plum2); iso.put(gx - 1, gy, P.mint); iso.put(gx + 2, gy - 1, P.cor4); iso.commit(P.ink);
      // TV
      it.box({ u0: 22, u1: 34, v0: 3, v1: 9, z0: Z + 17, z1: Z + 18 }, M(P.plum2, P.plum1, P.plum1)); iso.commit(P.ink);
      it.box({ u0: 26, u1: 30, v0: 4, v1: 6, z0: Z + 18, z1: Z + 21 }, M(P.plum2, P.plum1, P.plum1)); iso.commit(P.ink);
      it.box({ u0: 6, u1: 50, v0: 3, v1: 5, z0: Z + 20, z1: Z + 46 }, {
        top: () => P.plum2, side: () => P.plum1,
        front: (u, z, w, h) => {
          if (u === 0 || u === w - 1 || z === 0 || z === h - 1) return P.plum2;
          if (c.on) {
            if (z < h * 0.35) return P.mint2;
            if (Math.hypot(u - w * 0.7, z - h * 0.72) < 4) return P.mustard;
            const hill = h * 0.35 + Math.sin(u / 5) * 3;
            if (z < hill + 3) return P.mint;
            return P.sky;
          }
          const k = (u + (h - z)) % 26;
          if (k > 3 && k < 9) return P.plum4;           // vệt phản chiếu chéo
          if (k === 11) return P.plum4;
          return P.plum3;
        },
        emissive: c.on, emTop: false,
      });
      iso.commit(P.ink);
      if (c.on) { const [tx, ty] = it.p(28, 9, Z + 33); iso.glow(tx, ty, 26, '#8ff0ff', 0.35); }
    },
  });

  // =================================================================
  //  NHÓM 3: PHÒNG HỌP
  // =================================================================
  add({
    id: 'meeting-table', name: 'Bàn họp dài', group: 'meeting', size: [9, 4], place: 'center',
    variants: [
      { ...WOOD.plum, name: 'Gỗ mận' },
      { ...WOOD.coral, name: 'Gỗ san hô' },
      { ...WOOD.white, name: 'Trắng kem' },
    ],
    draw(it, iso, c, Z = 0) {
      const W = 72, D = 30;
      // 2 chân tấm + thanh ngang
      for (const u0 of [8, W - 11]) { it.box({ u0, u1: u0 + 3, v0: 6, v1: D - 6, z0: Z, z1: Z + 21 }, M(c.mid, c.mid, c.dark)); iso.commit(c.ol); }
      it.box({ u0: 11, u1: W - 11, v0: D / 2 - 1, v1: D / 2 + 1, z0: Z + 14, z1: Z + 17 }, M(c.mid, c.mid, c.dark)); iso.commit(c.ol);
      it.box({ u0: 0, u1: W, v0: 0, v1: D, z0: Z + 21, z1: Z + 24 }, {
        top: (u, v, w, d) => {
          if (u >= w - 1 || v >= d - 1) return c.rim;
          if (v === Math.floor(d / 2) && u > 4 && u < w - 4) return c.mid;              // đường ghép giữa mặt bàn
          if ((u + v) % 17 === 0 && u > 6 && u < w - 8) return c.rim;                     // vệt bóng
          return c.top;
        },
        front: (u, z, w, h, sh) => (z === h - 1 ? c.rim : sh ? c.dark : c.mid),
        side: (v, z, d, h, sh) => (sh ? c.dark : c.mid),
      });
      iso.commit(c.ol);
      // giấy tờ + chai nước
      for (const [u, v] of [[12, 4], [40, 4], [24, 20], [52, 20]]) { it.box({ u0: u, u1: u + 7, v0: v, v1: v + 6, z0: Z + 24, z1: Z + 25 }, { top: (a, b) => (b % 2 === 1 && a > 0 && a < 5 ? P.pk2 : P.white), front: () => P.cream1, side: () => P.cream1 }); iso.commit(P.mag1); }
      for (const [u, v] of [[30, 6], [62, 18]]) { it.box({ u0: u, u1: u + 3, v0: v, v1: v + 3, z0: Z + 24, z1: Z + 31 }, { top: () => P.white, front: (a, z) => (z > 4 ? P.white : P.mint), side: (a, z) => (z > 4 ? P.cream1 : P.mint2) }); iso.commit(P.mint3); }
    },
  });

  // Ghế họp: không bánh xe, chân chữ U. 'out' = người ngồi quay ra phía người xem (thấy mặt trước đệm)
  add({
    id: 'meeting-chair', name: 'Ghế họp', group: 'meeting', size: [2, 2], place: 'center',
    variants: [
      { ...FABRIC.plum, name: 'Mận · quay vào', out: false },
      { ...FABRIC.plum, name: 'Mận · quay ra', out: true },
      { ...FABRIC.coral, name: 'San hô · quay vào', out: false },
      { ...FABRIC.coral, name: 'San hô · quay ra', out: true },
    ],
    draw(it, iso, c, Z = 0) {
      const LEG = M(P.plum2, P.plum2, P.plum1);
      const backV = c.out ? 0 : 12;
      const legs = [[1, 1], [13, 1], [1, 13], [13, 13]];
      for (const [lu, lv] of legs) { it.box({ u0: lu, u1: lu + 2, v0: lv, v1: lv + 2, z0: Z, z1: Z + 11 }, LEG); iso.commit(P.ink); }
      const seat = plush(c, { fuzz: false });
      if (c.out) { it.box({ u0: 1, u1: 15, v0: backV, v1: backV + 3, z0: Z + 11, z1: Z + 29 }, plush(c, { fuzz: false })); iso.commit(c.ol); }
      it.box({ u0: 0, u1: 16, v0: 0, v1: 15, z0: Z + 11, z1: Z + 15 }, seat); iso.commit(c.ol);
      if (!c.out) {
        it.box({ u0: 1, u1: 15, v0: backV, v1: backV + 3, z0: Z + 15, z1: Z + 29 }, {
          ...plush(c, { fuzz: false }),
          front: (u, z, w, h, sh) => (z === h - 1 && (u === 0 || u === w - 1) ? null : u > 1 && u < w - 2 && z > 2 && z < h - 3 ? (sh ? c.dark : c.mid) : sh ? P.plum1 : P.plum2),
        });
        iso.commit(c.ol);
      }
    },
  });

  add({
    id: 'whiteboard', name: 'Bảng trắng', group: 'meeting', size: [6, 0], place: 'onwall', wallZ: 26,
    variants: [{ name: 'Biểu đồ', kind: 'chart' }, { name: 'Kanban', kind: 'kanban' }, { name: 'Brainstorm', kind: 'brain' }],
    draw(it, iso, c, Z = 26) {
      const W = 48, H = 30;
      it.box({ u0: 0, u1: W, v0: 0, v1: 1, z0: Z, z1: Z + H }, {
        front: (u, z, w, h) => {
          if (u < 2 || u >= w - 2 || z < 2 || z >= h - 2) return u === 0 || z === h - 1 ? P.cream1 : P.pk1;
          const iu = u - 2, iz = h - 3 - z;   // iz: 0 = mép trên
          if (c.kind === 'chart') {
            const bars = [6, 10, 8, 14, 12];
            const bi = Math.floor((iu - 4) / 4);
            if (iu >= 4 && (iu - 4) % 4 < 2 && bi < 5 && z - 2 < bars[bi]) return [P.cor4, P.mustard, P.mint2, P.plum4, P.cor1][bi];
            if (iu >= 28 && iu < 42 && (iz === 4 || iz === 8 || iz === 12)) return iz === 4 ? P.plum3 : P.plum4;
            if (iu >= 30 && iu < 36 && iz >= 16 && iz < 21) return P.mustard;
            return P.white;
          }
          if (c.kind === 'kanban') {
            const col = Math.floor(iu / 15);
            if (iu % 15 === 14) return P.pk1;
            if (iz === 2 && iu % 15 > 2 && iu % 15 < 10) return P.plum3;
            const notes = [[0, 5, P.mustard], [0, 13, P.mint], [1, 5, P.cor4], [1, 13, P.mustard], [2, 5, P.mint], [0, 20, P.cor4]];
            for (const [nc, nz, nc2] of notes) if (col === nc && iu % 15 >= 2 && iu % 15 < 10 && iz >= nz && iz < nz + 6) return nc2;
            return P.white;
          }
          // brainstorm: vòng tròn ở giữa + nhánh
          const dx = iu - 22, dz = iz - 12;
          const d = Math.hypot(dx, dz * 1.4);
          if (Math.abs(d - 6) < 0.8) return P.cor1;
          if ((Math.abs(dz) < 1 && Math.abs(dx) > 7 && Math.abs(dx) < 14) || (Math.abs(dx - dz * 1.2) < 0.8 && d > 7 && d < 12)) return P.plum3;
          for (const [nu, nz, col] of [[2, 3, P.mustard], [36, 4, P.mint], [3, 17, P.cor4], [37, 18, P.mustard]]) if (iu >= nu && iu < nu + 6 && iz >= nz && iz < nz + 5) return col;
          return P.white;
        },
      });
      iso.commit(P.plum2);
      it.box({ u0: 6, u1: W - 6, v0: 0, v1: 4, z0: Z - 2, z1: Z }, M(P.cream1, P.pk1, P.pk1)); iso.commit(P.mag1);
      for (const [u, col] of [[12, P.cor1], [15, P.plum3], [18, P.mint2]]) { it.box({ u0: u, u1: u + 2, v0: 1, v1: 3, z0: Z, z1: Z + 1 }, M(col, col, col)); iso.commit(null); }
    },
  });

  add({
    id: 'wall-tv', name: 'TV treo tường', group: 'meeting', size: [6, 0], place: 'onwall', wallZ: 34,
    variants: [{ name: 'Dashboard', kind: 'dash' }, { name: 'Gọi video', kind: 'call' }, { name: 'Tắt', kind: 'off' }],
    draw(it, iso, c, Z = 34) {
      const W = 46, H = 27;
      const avatarCols = [P.cor4, P.mint, P.mustard, P.plum4];
      it.box({ u0: 0, u1: W, v0: 0, v1: 2, z0: Z, z1: Z + H }, {
        top: () => P.plum2, side: () => P.plum1,
        front: (u, z, w, h) => {
          if (u === 0 || u === w - 1 || z === 0 || z === h - 1) return P.plum1;
          const iu = u - 1, iz = h - 2 - z;
          if (c.kind === 'off') { const k = (u + (h - z)) % 24; return k > 3 && k < 8 ? P.plum4 : P.plum3; }
          if (c.kind === 'call') {
            const cw = Math.floor((w - 2) / 2), ch = Math.floor((h - 2) / 2);
            const ci = Math.floor(iu / cw) + 2 * Math.floor(iz / ch);
            const lu = iu % cw, lz = iz % ch;
            if (lu === cw - 1 || lz === ch - 1) return P.ink;
            const head = Math.hypot(lu - cw / 2, lz - ch * 0.4);
            if (head < 3) return P.pk2;
            if (lz > ch * 0.62 && Math.abs(lu - cw / 2) < 6) return avatarCols[ci % 4];
            return ci % 2 ? P.plum3 : P.plum2;
          }
          // dashboard
          if (iz < 3) return iu < 10 ? P.mint : P.plum2;
          if (iu < 20 && iz > 5) { const bars = [10, 14, 9, 17, 12, 15]; const bi = Math.floor(iu / 3); if (iu % 3 < 2 && h - 3 - iz < bars[bi % 6]) return [P.mint, P.mustard, P.cor4][bi % 3]; return P.plum1; }
          if (iu > 22 && iz > 5 && iz < 14) { const dd = Math.hypot(iu - 31, iz - 9.5); if (dd < 4.5) return iu > 31 ? P.cor4 : P.mint; }
          if (iu > 22 && iz > 16 && iz % 3 === 0 && iu < 40) return P.pk2;
          return P.plum1;
        },
        emissive: c.kind !== 'off', emTop: false,
      });
      iso.commit(P.ink);
      if (c.kind !== 'off') { const [gx, gy] = it.p(W / 2, 6, Z + H / 2); iso.glow(gx, gy, 26, '#8ff0ff', 0.35); }
    },
  });

  add({
    id: 'projector-screen', name: 'Màn chiếu', group: 'meeting', size: [6, 0], place: 'onwall', wallZ: 24,
    variants: [{ name: 'Đang chiếu', on: true }, { name: 'Trống', on: false }],
    draw(it, iso, c, Z = 24) {
      const W = 50, H = 32;
      it.box({ u0: 0, u1: W, v0: 0, v1: 1, z0: Z, z1: Z + H }, {
        front: (u, z, w, h) => {
          if (u === 0 || u === w - 1) return P.cream1;
          if (z === 0) return P.plum2;
          if (!c.on) return z > 2 ? P.white : P.cream1;
          const iz = h - 1 - z;
          if (iz > 2 && iz < 6 && u > 4 && u < 24) return P.plum3;                   // tiêu đề slide
          if (u > 4 && u < 22 && iz > 9 && iz < 26 && iz % 4 === 1) return P.plum4;    // gạch đầu dòng
          if (u > 27 && u < 46 && iz > 9 && iz < 27) { const bh = [8, 12, 6, 15, 10]; const bi = Math.floor((u - 28) / 4); if ((u - 28) % 4 < 3 && h - 5 - iz < bh[bi % 5]) return [P.cor4, P.mint2, P.mustard][bi % 3]; }
          return P.white;
        },
      });
      iso.commit(P.mag1);
      it.box({ u0: -2, u1: W + 2, v0: 0, v1: 4, z0: Z + H, z1: Z + H + 4 }, M(P.cream2, P.cream1, P.pk2)); iso.commit(P.mag1);   // hộp cuốn màn
      const [hx, hy] = it.p(W / 2, 1, Z - 1); iso.put(hx, hy, P.plum2); iso.put(hx, hy + 1, P.plum2); iso.commit(null);           // dây kéo
    },
  });

  add({
    id: 'projector', name: 'Máy chiếu', group: 'meeting', size: [2, 2], place: 'desk',
    variants: [{ name: 'Đang bật', on: true }, { name: 'Tắt', on: false }],
    draw(it, iso, c, Z = 0) {
      it.box({ u0: 0, u1: 14, v0: 0, v1: 11, z0: Z, z1: Z + 5 }, {
        top: (u, v) => ((v === 3 || v === 5 || v === 7) && u > 7 && u < 12 ? P.pk2 : P.white),
        front: (u, z, w, h) => {
          const d = Math.hypot(u - 4, z - 2.5);
          if (d < 2) return c.on ? P.white : P.plum2;
          if (d < 2.8) return P.plum1;
          return P.cream1;
        },
        side: () => P.pk2, emissive: c.on, emTop: false,
      });
      iso.commit(P.mag1);
      if (c.on) { const [lx, ly] = it.p(4, 12, Z + 3); iso.glow(lx, ly, 16, '#fff2c0', 0.55); }
    },
  });

  add({
    id: 'conf-speaker', name: 'Loa hội nghị', group: 'meeting', size: [1, 1], place: 'desk',
    variants: [{ name: 'Mận' }],
    draw(it, iso, c, Z = 0) {
      const [sx, sy] = it.p(5, 5, Z + 2);
      iso.blob(sx, sy, 6, 3, P.plum2); iso.blob(sx, sy - 1, 5, 2, P.plum3);
      for (let k = -3; k <= 3; k += 2) iso.put(sx + k, sy - 1, P.plum1);
      iso.put(sx - 4, sy + 1, P.mint, true); iso.put(sx, sy + 2, P.mint, true); iso.put(sx + 4, sy + 1, P.mint, true);
      iso.commit(P.ink);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
