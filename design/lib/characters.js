// =====================================================================
//  NHÂN VẬT — vẽ bằng các khối elip trên màn hình, tô 1 lần rồi viền 1 lần
//  Hướng mặc định: nhìn chéo xuống-phải (SE). flip = true để nhìn xuống-trái (SW).
//  fx, fy = toạ độ màn hình của điểm giữa 2 bàn chân.
// =====================================================================
(function (global) {
  const { P } = global.Iso;

  // Tô một elip với hàm chọn màu theo vị trí chuẩn hoá (nx, ny trong khoảng -1..1)
  function ellipse(iso, cx, cy, rx, ry, colorAt, flip) {
    for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++)
      for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1) continue;
        const c = colorAt(x / rx, y / ry, x, y);
        if (c) iso.put(cx + (flip ? -x : x), cy + y, c);
      }
  }

  // Bóng đổ elip dưới chân (vẽ riêng, bán trong suốt)
  function shadow(iso, fx, fy, rx) {
    iso.blob(fx, fy, rx, Math.max(1, Math.round(rx / 2.5)), P.ink);
    iso.commit(null, 0.22);
  }

  const SKIN = { base: P.sand, mid: P.peach, dark: P.cor3 };

  function person(iso, fx, fy, o) {
    const f = o.flip ? -1 : 1;
    const X = (dx) => fx + dx * f;              // lật ngang quanh fx
    const put = (dx, y, c) => c && iso.put(X(dx), y, c);
    const C = o.colors;
    shadow(iso, fx + f, fy, o.bodyRx + 1);

    // ---- chân + giày ----
    const legTop = fy - o.legH;
    for (let i = 0; i < 2; i++) {
      const lx = i === 0 ? -o.legGap / 2 - o.legW : o.legGap / 2;
      for (let y = legTop; y <= fy - 2; y++) for (let x = 0; x < o.legW; x++) put(lx + x, y, i === 1 || x === o.legW - 1 ? C.pantsD : C.pants);
      for (let x = -1; x < o.legW + (i ? 1 : 0); x++) { put(lx + x, fy - 1, x === -1 ? C.shoe : C.shoeL); put(lx + x, fy, C.shoe); }
    }

    // ---- thân ----
    const bcx = o.lean, bcy = legTop - o.bodyRy + o.bodySink;
    const shirtHalf = (ny) => o.openJacket ? Math.max(1, (o.shirtW / 2) * (0.6 + 0.6 * (ny + 1) / 2)) : 99;
    ellipse(iso, X(bcx), bcy, o.bodyRx, o.bodyRy, (nx, ny, x, y) => {
      const sx = x - 1;                                      // hơi lệch phải vì nhìn chéo
      const inShirt = Math.abs(sx) <= shirtHalf(ny);
      let c = inShirt ? C.shirt : C.jacket;
      if (!inShirt && nx > 0.35) c = C.jacketD;
      if (inShirt && nx > 0.45) c = C.shirtD;
      if (nx < -0.55 && ny < 0.1) c = inShirt ? C.shirt : C.jacketL;
      if (o.tie && (sx === 0 || sx === 1) && ny < 0.55 && ny > -0.95) c = sx === 1 ? C.tieD : C.tie;
      if (o.tie && sx >= -1 && sx <= 2 && ny <= -0.95 + 2 / o.bodyRy) c = C.tie;
      if (inShirt && !o.tie && sx === 0 && y % 3 === 0 && ny > -0.6 && ny < 0.7) c = C.shirtD;  // hàng cúc
      if (o.belt && ny > 0.62 && ny < 0.62 + 2.2 / o.bodyRy) c = Math.abs(sx) <= 1 ? P.mustard : C.belt;
      if (o.hood && ny < -0.62) c = nx > 0.3 ? C.jacketD : C.jacket;                          // mũ áo hoodie
      if (o.hood && Math.abs(sx) <= 1 && ny > -0.62 && ny < 0.2 && (sx === 0) && y % 2 === 0) c = C.jacketL; // dây rút
      return c;
    }, o.flip);

    // ---- tay ----
    const armY = bcy - o.bodyRy * 0.25;
    // tay buông xuôi, mép trong có đường tối để tách khỏi thân
    const ay = Math.round(armY + o.armRy * 0.35);
    ellipse(iso, X(bcx - o.bodyRx), ay, o.armRx, o.armRy, (nx) => (nx > 0.45 ? P.plum1 : nx > 0 ? C.jacket : C.jacketL), o.flip);
    ellipse(iso, X(bcx + o.bodyRx), ay, o.armRx, o.armRy, (nx) => (nx < -0.45 ? P.plum1 : C.jacketD), o.flip);
    const handY = Math.round(ay + o.armRy);
    for (const [dx, col] of [[bcx - o.bodyRx, SKIN.base], [bcx + o.bodyRx, SKIN.mid]]) {
      put(Math.round(dx), handY, col); put(Math.round(dx) + 1, handY, col); put(Math.round(dx), handY + 1, col); put(Math.round(dx) + 1, handY + 1, SKIN.mid);
    }

    // ---- đầu ----
    const hcx = bcx + o.headDx, hcy = bcy - o.bodyRy - o.headRy + o.neck;
    // tai
    for (const s of [-1, 1]) { put(hcx + s * Math.round(o.headRx), hcy + 1, s > 0 ? SKIN.mid : SKIN.base); put(hcx + s * Math.round(o.headRx), hcy + 2, SKIN.mid); }
    ellipse(iso, X(hcx), hcy, o.headRx, o.headRy, (nx, ny) => {
      if (o.jowls && ny > 0.55 && Math.abs(nx) < 0.75) return ny > 0.8 ? SKIN.mid : SKIN.base;   // cằm đôi
      if (nx > 0.5) return SKIN.mid;
      return SKIN.base;
    }, o.flip);
    const top = Math.round(hcy - o.headRy);

    if (o.hair === 'combover') {
      // tóc 2 bên mai + vài cọng trên đỉnh
      // tóc mai 2 bên (vành tóc quanh tai)
      const R = Math.round(o.headRx);
      for (const s of [-1, 1]) for (let y = -2; y <= 1; y++) { put(hcx + s * R, hcy + y, C.hair); if (y > -2) put(hcx + s * (R - 1), hcy + y - 1, s > 0 ? C.hair : C.hairL || C.hair); }
      // vài cọng tóc vắt ngang đỉnh đầu (comb-over), 1 cọng vểnh lên
      for (let k = -R + 2; k <= R - 2; k++) put(hcx + k, top + 2 + Math.round((k * k) / 14), C.hair);
      for (let k = -R + 3; k <= R - 3; k += 1) if (k % 2 === 0) put(hcx + k, top + 4 + Math.round((k * k) / 18), C.hair);
      put(hcx + 2, top, C.hair); put(hcx + 3, top - 1, C.hair); put(hcx + 4, top - 1, C.hair);
      // đỉnh đầu bóng loáng
      put(hcx - 2, top + 1, P.white); put(hcx - 1, top + 1, P.white); put(hcx - 2, top + 3, P.white);
    } else if (o.hair === 'full') {
      ellipse(iso, X(hcx), top + Math.round(o.headRy * 0.55), o.headRx + 0.6, o.headRy * 0.62, (nx, ny) => (ny > 0.5 && nx > -0.3 && nx < 0.85 ? null : nx > 0.5 ? C.hairD : C.hair), o.flip);
      put(hcx - 2, top + 1, C.hairL); put(hcx - 1, top + 1, C.hairL);
    }
    if (o.headphones) {
      for (let k = -Math.round(o.headRx); k <= Math.round(o.headRx); k++) put(hcx + k, top - 1 + Math.round((k * k) / (o.headRx * o.headRx) * 3), P.plum1);
      for (const s of [-1, 1]) for (let y = 0; y < 3; y++) for (let x = 0; x < 2; x++) put(hcx + s * (Math.round(o.headRx) + x), hcy + y, x === 1 ? P.plum1 : P.mag4);
    }

    // ---- mặt (lệch phải 1px vì nhìn chéo) ----
    const ey = hcy + o.eyeY;
    for (const ex of [-2, 2]) { put(hcx + ex + 1, ey, P.ink); put(hcx + ex + 1, ey + 1, P.ink); }   // mắt cao 2px
    if (o.brows) { put(hcx - 3 + 1, ey - 2, C.hair); put(hcx - 2 + 1, ey - 2, C.hair); put(hcx + 2 + 1, ey - 2, C.hair); put(hcx + 3 + 1, ey - 2, C.hair); }
    if (o.glasses) { for (const ex of [-2, 2]) { put(hcx + ex, ey, P.plum1); put(hcx + ex + 2, ey, P.plum1); put(hcx + ex + 1, ey - 1, P.plum1); put(hcx + ex + 1, ey + 1, P.plum1); } put(hcx + 2, ey, P.plum1); }
    put(hcx - 3 + 1, ey + 2, P.cor4); put(hcx + 4 + 1, ey + 2, P.cor4);          // má hồng
    put(hcx + 1, ey + 2, SKIN.dark);                                                 // mũi
    if (o.mustache) {
      for (let k = -2; k <= 2; k++) put(hcx + 1 + k, ey + 3, k > 0 ? C.hairD || P.plum2 : C.hair);
      put(hcx - 2, ey + 4, C.hair); put(hcx + 4, ey + 4, C.hairD || P.plum2);       // 2 đuôi ria trễ xuống
      put(hcx + 1, ey + 4, P.cor1);
    } else put(hcx + 1, ey + 3, P.cor1);

    iso.commit(P.ink);
  }

  // ---------------- Ông sếp theo 3 tỉ lệ ----------------
  const BOSS_COLORS = {
    shirt: P.white, shirtD: P.cream1, jacket: P.plum3, jacketD: P.plum2, jacketL: P.plum4,
    tie: P.cor1, tieD: P.mag3, pants: P.plum2, pantsD: P.plum1, shoe: P.ink, shoeL: P.plum1, belt: P.plum1,
    hair: P.plum4, hairD: P.plum2, hairL: P.pk1,
  };
  const BOSS_BASE = { colors: BOSS_COLORS, hair: 'combover', tie: true, openJacket: true, belt: true, mustache: true, brows: true, jowls: true, lean: 0, headDx: 0 };

  const BOSS = {
    chibi: { ...BOSS_BASE, label: 'A · Chibi (~30px, đầu 1/2)', headRx: 7, headRy: 7, neck: 2, eyeY: 1, bodyRx: 7.5, bodyRy: 6.5, bodySink: 1, shirtW: 5, armRx: 2, armRy: 3.5, legH: 4, legW: 3, legGap: 2 },
    cozy: { ...BOSS_BASE, label: 'B · Cozy (~36px, đầu 1/3) ★ vẽ tay', headRx: 6.5, headRy: 6.5, neck: 2, eyeY: 1, bodyRx: 9.5, bodyRy: 9, bodySink: 1, shirtW: 6, armRx: 2.4, armRy: 5.5, legH: 7, legW: 4, legGap: 2 },
    tall: { ...BOSS_BASE, label: 'C · Gần thật (~50px, đầu 1/5)', headRx: 5.5, headRy: 6, neck: 1, eyeY: 1, bodyRx: 9.5, bodyRy: 12, bodySink: 1, shirtW: 6, armRx: 2.4, armRy: 8, legH: 14, legW: 4, legGap: 2 },
  };

  // Nhân viên mẫu (dev mặc hoodie) để so dáng với sếp
  const DEV_B = {
    label: 'Dev (tham khảo)', colors: { shirt: P.mint, shirtD: P.mint2, jacket: P.mint, jacketD: P.mint2, jacketL: P.lime, tie: P.cor1, tieD: P.mag3, pants: P.plum2, pantsD: P.plum1, shoe: P.ink, shoeL: P.white, belt: P.plum1, hair: P.plum1, hairD: P.ink, hairL: P.plum3 },
    hair: 'full', hood: true, headphones: true, lean: 0, headDx: 0, headRx: 6.5, headRy: 6.5, neck: 2, eyeY: 1,
    bodyRx: 6, bodyRy: 8, bodySink: 1, shirtW: 0, armRx: 2, armRy: 5.5, legH: 8, legW: 3, legGap: 2, brows: false,
  };


  // =================================================================
  //  SPRITE VẼ TAY TỪNG PIXEL (dùng cho nhân vật chính thức)
  //  Mỗi ký tự là 1 pixel, '.' = trong suốt. Chân nhân vật ở hàng cuối, tâm ở cột 12.
  // =================================================================
  const PAL = {
    o: P.ink, S: P.sand, s: P.peach, d: P.cor3, c: P.cor4, e: P.ink, g: P.white,
    h: P.plum4, H: P.plum2, m: P.plum2, M: P.cor1,
    W: P.white, w: P.cream1, J: P.plum3, j: P.plum2, L: P.plum4, T: P.cor1, t: P.mag3,
    P: P.plum2, p: P.plum1, B: P.plum1, Y: P.mustard, K: P.ink, k: P.plum1,
  };

  function sprite(iso, rows, fx, fy, { flip = false, pal = PAL, cx = 12, shadowR = 10 } = {}) {
    iso.blob(fx + (flip ? -1 : 1), fy, shadowR, Math.max(1, Math.round(shadowR / 2.5)), P.ink);
    iso.commit(null, 0.22);
    const h = rows.length;
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const dx = x - cx;
        iso.put(fx + (flip ? -dx : dx), fy - (h - 1 - y), pal[ch] || P.ink);
      }
    });
    iso.commit(null);
  }

  // Ông sếp: béo, hói, vài cọng tóc vắt ngang + 1 cọng vểnh, ria mép, vest mận, cà vạt đỏ
  const BOSS_SPRITE = [
    '............hH',
    '...........h',
    '.......oooooooooo',
    '......oSgShhhhhSSo',
    '.....oSggShSSSSShSso',
    '....oSSSSSSSSSSSSSSso',
    '...ohSSSSSSSSSSSSSSsho',
    '...ohhSSHHSSSSHHSSshho',
    '..oShSSSSeSSSSSeSSsshSo',
    '..osShSSSeSSSdSeSSsshso',
    '...ohSScSSSmmmmmScsso',
    '...oSSSSSSmSSMSmSSsso',
    '....oSSSSsssssSSso',
    '.....oWssssssWoo',
    '....ooJJJWWWTWWwJjoo',
    '...oLJJJJJWWTtWJJJjjo',
    '..oLLJJJJJWWTtWWJJJjjo',
    '.oLLJJJJJWWWTtWWJJJjjjo',
    '.oLJoJJJJWWWTtWWWJJjojo',
    'oLLJoJJJWWWWTtWWWwJjojjo',
    'oLJJoJJJWWWWTtWWWwJjojjo',
    'oLJJoJJWWWWWTtWWWWwjojjo',
    'oLJJoJJWWWWWWtWWWWwjojjo',
    'oLJJoJJWWWWWWWWWWWwjojjo',
    'oJJJoJJWWWWWWWWWWWwjojjo',
    'oSSSoJJWWWWWWWWWWwwjosso',
    'oSSsoJJJWWWWWWWWwwjjosdo',
    '.ooo.oJJJWWWWWWwwjjjo.oo',
    '.....oBBBBBYYBBBBBBo',
    '.....oPPPPPpoPPPPppo',
    '.....oPPPPPpoPPPPppo',
    '.....oPPPPpo.oPPPppo',
    '.....oPPPPpo.oPPPppo',
    '....okKKKKKo.oKKKKKko',
    '....oooooooo.ooooooo'
  ];

  global.Characters = { person, sprite, BOSS, DEV_B, BOSS_SPRITE, PAL };
})(typeof window !== 'undefined' ? window : globalThis);
