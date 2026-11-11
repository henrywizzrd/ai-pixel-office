// =====================================================================
//  VỎ PHÒNG "DÀY DẶN" — tham khảo phòng sàn đỏ:
//   - đỉnh tường là các khối đá xám chìa ra
//   - tường vữa xám + vết nứt gạch, nửa dưới ốp gỗ nan dọc + gờ ngang
//   - sàn gỗ lát xương cá ô vuông, tấm sàn dày thấy rõ từng lớp ván
// =====================================================================
(function (global) {
  const THEMES = {
    red: {
      ol: '#24120c',
      floor: ['#71382d', '#6a3229'], seam: '#47191c', floorL: '#8e4a3a', floorH: '#a35d48',
      slab: '#592726', slabD: '#47191c', slabSeam: '#301a05', slabL: '#71382d',
      wallL: '#7d705f', wallR: '#6e6152', crackL: '#90826f', crackD: '#5c5143', wallShadow: '#5f5446',
      wain: ['#71382d', '#673128'], wainLine: '#47191c', railTop: '#a35d48', rail: '#8e4a3a', railD: '#71382d',
      capTop: '#5a5048', capJoint: '#40372f', capFront: '#756a5e', capFrontD: '#5f554a', capHL: '#8a7f72',
    },
  };

  function thickRoom(iso, RX, RY, WH, themeName = 'red', { wainH = 30, wt = 6 } = {}) {
    const T = THEMES[themeName];
    // đồ nội thất vẽ sau sẽ dùng viền nâu đen cho hợp tông phòng
    iso.S.olMap = { [Iso.P.mag1]: '#3a1a12', [Iso.P.ink]: T.ol, [Iso.P.mag0]: T.ol };
    const SLAB = 12;

    // ---------------- tấm sàn + sàn lát xương cá ----------------
    iso.box({ x0: 0, x1: RX, y0: 0, y1: RY, z0: -SLAB, z1: 0 }, {
      top: (x, y) => {
        const B = 16;
        const bx = Math.floor(x / B), by = Math.floor(y / B);
        const lx = x % B, ly = y % B;
        if (lx === 0 || ly === 0) return T.seam;
        const along = (bx + by) % 2 === 0;           // thanh chạy theo x hay theo y
        const across = along ? ly : lx;
        const plank = Math.floor((across - 1) / 5);
        const pos = (across - 1) % 5;
        if (pos === 4) return T.seam;
        if (pos === 0) return T.floorL;
        const len = along ? lx : ly;
        if ((len * 7 + plank * 5 + bx * 3 + by) % 23 === 0) return T.floorH;   // vân gỗ
        if (x < 4 || y < 4) return T.seam;                                     // bóng chân tường
        return T.floor[(plank + bx + by) % 2];
      },
      left: (x, z, w, h) => {
        const layer = Math.floor((h - 1 - z) / 4);
        if ((h - 1 - z) % 4 === 3) return T.slabSeam;
        if ((x + layer * 9) % 18 === 0) return T.slabSeam;
        return z === h - 1 ? T.floorL : layer % 2 ? T.slab : T.slabL;
      },
      right: (y, z, d, h) => {
        const layer = Math.floor((h - 1 - z) / 4);
        if ((h - 1 - z) % 4 === 3) return T.slabSeam;
        if ((y + layer * 9) % 18 === 0) return T.slabSeam;
        return z === h - 1 ? T.slabL : layer % 2 ? T.slabD : T.slab;
      },
    });
    iso.commit(T.ol);

    // ---------------- bề mặt tường ----------------
    const wallFace = (base, along, z) => {
      if (z < wainH) {
        if (along % 5 === 0) return T.wainLine;
        return T.wain[Math.floor(along / 5) % 2];
      }
      if (z < wainH + 2) return T.wallShadow;                                 // bóng dưới gờ
      // vết nứt gạch rải rác
      const cell = Math.floor(along / 22) * 7 + Math.floor(z / 14) * 3;
      const ax = along % 22, az = z % 14;
      if (cell % 4 === 1 && az === 6 && ax > 6 && ax < 13) return T.crackD;
      if (cell % 4 === 1 && ax === 12 && az > 6 && az < 10) return T.crackD;
      if (cell % 4 === 1 && az === 7 && ax > 6 && ax < 12) return T.crackL;
      if (cell % 5 === 3 && ax === 4 && az > 2 && az < 7) return T.crackD;
      if (z > WH - 3) return T.wallShadow;                                     // bóng dưới khối đá
      return base;
    };

    // tường trái (mặt phẳng x = 0)
    iso.box({ x0: -wt, x1: 0, y0: -wt, y1: RY, z0: -SLAB, z1: WH }, {
      right: (y, z) => (z < SLAB ? T.slabD : wallFace(T.wallL, y, z - SLAB)),
      left: (x, z) => (z < SLAB ? T.slab : z - SLAB < wainH ? T.wainLine : T.wallShadow),   // mặt cắt phía trước
    });
    iso.commit(T.ol);
    // tường phải (mặt phẳng y = 0)
    iso.box({ x0: 0, x1: RX, y0: -wt, y1: 0, z0: -SLAB, z1: WH }, {
      left: (x, z) => (z < SLAB ? T.slabD : wallFace(T.wallR, x, z - SLAB)),
      right: (y, z) => (z < SLAB ? T.slabD : z - SLAB < wainH ? T.wainLine : T.crackD),
    });
    iso.commit(T.ol);

    // ---------------- gờ ngang trên ốp gỗ ----------------
    const RAIL = { top: () => T.railTop, left: () => T.rail, right: () => T.railD };
    iso.box({ x0: 0, x1: 3, y0: 0, y1: RY, z0: wainH - 1, z1: wainH + 1 }, RAIL); iso.commit(T.ol);
    iso.box({ x0: 0, x1: RX, y0: 0, y1: 3, z0: wainH - 1, z1: wainH + 1 }, RAIL); iso.commit(T.ol);

    // ---------------- khối đá trên đỉnh tường ----------------
    const BLK = 16, CAP = 9, OVER = 3;
    const capStyle = (alongTop) => ({
      top: (a, b) => {
        const along = alongTop === 'x' ? a : b;
        const across = alongTop === 'x' ? b : a;
        if (along % BLK === 0) return T.capJoint;
        if (across === 0) return T.capHL;
        return T.capTop;
      },
      left: (x, z, w, h) => (x % BLK === 0 ? T.capFrontD : z === h - 1 ? T.capHL : z === 0 ? T.capFrontD : T.capFront),
      right: (y, z, d, h) => (y % BLK === 0 ? T.capJoint : z === h - 1 ? T.capFront : T.capFrontD),
    });
    // tường phải trước (ở xa hơn), rồi tường trái
    iso.box({ x0: -wt - OVER, x1: RX, y0: -wt - OVER, y1: OVER, z0: WH, z1: WH + CAP }, capStyle('x'));
    iso.commit(T.ol);
    iso.box({ x0: -wt - OVER, x1: OVER, y0: -wt - OVER, y1: RY, z0: WH, z1: WH + CAP }, capStyle('y'));
    iso.commit(T.ol);
  }

  global.Rooms = { thickRoom, THEMES };
})(typeof window !== 'undefined' ? window : globalThis);
