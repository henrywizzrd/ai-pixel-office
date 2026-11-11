// =====================================================================
//  NHÂN VẬT KHỐI VUÔNG KIỂU STEVE (Minecraft) — 16 × 32 px (chuẩn 1×2 ô 16px)
//  Đầu là khối 10×10 (mặt 8×8 đúng kiểu Steve) · thân 10×11 · tay 4 · chân 5.
//  Mỗi khối có viền riêng như hộp Minecraft, tô phẳng + mép sáng trên + cạnh tối phải.
//  Hướng: down / up / right (left = lật gương). Khung: idle | a | b.
//  Góc neo (fx, fy) = điểm giữa bàn chân.
// =====================================================================
(function (global) {
  const OL = '#393950';

  function shadeHex(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k))));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
  }

  function painter(iso, fx, fy, flip) {
    const ox = fx - 8, oy = fy - 31;
    const P = (x, y, c) => c && iso.put(flip ? ox + 15 - x : ox + x, oy + y, c);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(x + i, y + j, c); };
    const box = (x, y, w, h, c, { top = true, dark = 1 } = {}) => {
      R(x, y, w, h, OL);
      R(x + 1, y + 1, w - 2, h - 2, c);
      if (dark && w > 3) R(x + w - 1 - dark, y + 1, dark, h - 2, shadeHex(c, -0.2));
      if (top) R(x + 1, y + 1, w - 2 - (w > 3 ? dark : 0), 1, shadeHex(c, 0.22));
    };
    return { P, R, box };
  }

  // tay: ống tay + bàn tay 2px ở đáy
  function arm(p, x, y, look, h = 11) {
    p.box(x, y, 4, h, look.sleeve, { dark: 0 });
    p.R(x + 1, y + h - 3, 2, 2, look.skin);
    if (look.cuff) p.R(x + 1, y + h - 4, 2, 1, look.cuff);
  }
  function leg(p, x, y, look, w = 5, h = 12, pants = look.pants) {
    p.box(x, y, w, h, pants, { dark: 0 });
    p.R(x + 1, y + h - 3, w - 2, 2, look.shoes);
  }

  function draw(iso, look, dir, frame, fx, fy, { seated = false } = {}) {
    const flip = dir === 'left';
    const d = flip ? 'right' : dir;
    const p = painter(iso, fx, fy, flip);
    const f = look.fat ? 1 : 0;
    if (!seated) { iso.blob(fx, fy, 6, 2, OL); iso.commit(null, 0.22); }

    if (d === 'down' || d === 'up') {
      const lift = frame === 'a' ? [1, 0] : frame === 'b' ? [0, 1] : [0, 0];
      const sw = frame === 'a' ? [1, 0] : frame === 'b' ? [0, 1] : [0, 0];
      if (!seated) { leg(p, 3, 20 - lift[0], look); leg(p, 8, 20 - lift[1], look); }
      arm(p, 0 - f, 10 + sw[0], look);
      arm(p, 12 + f, 10 + sw[1], look);
      p.box(3 - f, 9, 10 + 2 * f, 12, look.top);
      look.torso && look.torso(p, d, f);
      p.box(3, 0, 10, 10, look.skin);
      if (d === 'down') { look.face && look.face(p, 'down'); look.hair && look.hair(p, 'down'); }
      else look.hair && look.hair(p, 'up');
    } else {
      const s = frame === 'a' ? 2 : frame === 'b' ? -2 : 0;
      if (!seated) {
        leg(p, 5 - s, 20, look, 5, 12, shadeHex(look.pants, -0.2));   // chân sau
        leg(p, 6 + s, 20, look, 5, 12);                                // chân trước
      }
      arm(p, 6 - s, 10, look, 11);                                      // tay sau (bị thân che phần lớn)
      p.box(5 - f, 9, 6 + 2 * f + (look.fat ? 1 : 0), 12, look.top);
      look.torso && look.torso(p, 'right', f);
      arm(p, 6 + s, 10, look, 11);                                      // tay trước
      p.box(3, 0, 10, 10, look.skin);
      look.face && look.face(p, 'right');
      look.hair && look.hair(p, 'right');
    }
    iso.commit(null);
  }

  // ------------------------------------------------------------------
  //  DÀN NHÂN VẬT  (mặt trong của đầu: x4..11, y1..8)
  // ------------------------------------------------------------------
  const EYE_W = '#f8f8f8';
  function eyes(p, d, iris, y = 5) {
    if (d === 'down') { p.R(5, y, 2, 1, EYE_W); p.P(6, y, iris); p.R(9, y, 2, 1, EYE_W); p.P(9, y, iris); }
    else if (d === 'right') { p.R(9, y, 2, 1, EYE_W); p.P(10, y, iris); }
  }

  const BOSS = {
    fat: true,
    skin: '#f2c49b', top: '#3f4d78', sleeve: '#3f4d78', pants: '#46465e', shoes: '#6b4c2c',
    torso(p, d, f) {
      if (d === 'down') {
        p.R(6, 10, 4, 10, '#f8f8f8');                       // sơ mi
        p.R(5, 15, 6, 4, '#f8f8f8');                        // bụng
        p.R(7, 10, 2, 6, '#d93232'); p.P(8, 15, '#a13a30'); // cà vạt
        p.R(3 - f, 19, 10 + 2 * f, 1, '#2a2a3c'); p.P(8, 19, '#f8d239');   // thắt lưng
      } else if (d === 'right') {
        p.R(10, 10, 2, 9, '#f8f8f8'); p.P(11, 11, '#d93232'); p.P(11, 12, '#d93232');
        p.R(5, 19, 8, 1, '#2a2a3c');
      } else {
        p.R(7, 11, 2, 8, '#34406a');
      }
    },
    face(p, d) {
      eyes(p, d, '#3a2a20');
      if (d === 'down') {
        p.R(5, 4, 2, 1, '#9e9e9f'); p.R(9, 4, 2, 1, '#9e9e9f');   // lông mày
        p.R(7, 6, 2, 1, '#d99a72');                               // mũi
        p.R(5, 7, 6, 1, '#a8a8a8');                               // ria mép
        p.P(4, 6, '#f69784'); p.P(11, 6, '#f69784');              // má hồng
      } else {
        p.R(9, 4, 2, 1, '#9e9e9f'); p.P(12, 6, '#f2c49b'); p.R(9, 7, 3, 1, '#a8a8a8');
      }
    },
    hair(p, d) {
      if (d === 'down') {
        p.R(4, 3, 1, 4, '#cbcbcb'); p.R(11, 3, 1, 4, '#a8a8a8');   // tóc mai bạc
        p.P(6, 1, '#a8a8a8'); p.P(8, 1, '#a8a8a8'); p.P(9, 2, '#a8a8a8');   // vài cọng tóc
        p.R(5, 1, 1, 1, '#ffffff');                                 // đầu hói bóng
      } else if (d === 'up') {
        p.R(4, 4, 8, 4, '#cbcbcb'); p.R(10, 4, 2, 4, '#a8a8a8');
        p.P(6, 1, '#a8a8a8'); p.P(8, 1, '#a8a8a8'); p.R(5, 2, 1, 1, '#ffffff');
      } else {
        p.R(4, 3, 4, 5, '#cbcbcb'); p.P(6, 5, '#d99a72');           // tóc bạc + tai
        p.P(8, 1, '#a8a8a8'); p.P(10, 1, '#a8a8a8'); p.P(7, 1, '#ffffff');
      }
    },
  };

  const DEV = {
    skin: '#f2c49b', top: '#f2b22b', sleeve: '#f2b22b', pants: '#5a7fae', shoes: '#f0f0f0', cuff: '#d99a2a',
    torso(p, d) {
      if (d === 'down') {
        p.P(6, 10, '#f8f8f8'); p.P(6, 11, '#f8f8f8'); p.P(9, 10, '#f8f8f8'); p.P(9, 11, '#f8f8f8');   // dây rút
        p.R(5, 15, 6, 3, '#d99a2a');                                  // túi bụng
      } else if (d === 'up') {
        p.R(5, 10, 6, 2, '#d99a2a');                                  // mũ trùm
      } else {
        p.R(6, 10, 2, 2, '#d99a2a');
      }
    },
    face(p, d) {
      eyes(p, d, '#3b6fd1');
      if (d === 'down') { p.R(7, 6, 2, 1, '#d99a72'); p.R(6, 7, 4, 1, '#c97a62'); }
      else { p.P(12, 6, '#f2c49b'); p.R(10, 7, 2, 1, '#c97a62'); }
    },
    hair(p, d) {
      const H = '#7a4a2e', H2 = '#5c3620', PHONE = '#46465e';
      if (d === 'down') {
        p.R(4, 1, 8, 2, H); p.R(4, 1, 8, 1, '#9a6440');
        p.P(4, 3, H); p.P(11, 3, H2); p.P(6, 3, H); p.P(10, 3, H);      // mái lởm chởm
        p.R(3, 0, 10, 1, PHONE);                                         // quai tai nghe
        p.R(2, 3, 2, 4, PHONE); p.R(12, 3, 2, 4, PHONE);                 // chụp tai
        p.P(2, 4, '#d93232'); p.P(13, 4, '#d93232');
      } else if (d === 'up') {
        p.R(4, 1, 8, 7, H); p.R(4, 1, 8, 1, '#9a6440'); p.R(10, 2, 2, 6, H2);
        p.R(3, 0, 10, 1, PHONE); p.R(2, 3, 2, 4, PHONE); p.R(12, 3, 2, 4, PHONE);
      } else {
        p.R(4, 1, 8, 2, H); p.R(4, 3, 4, 4, H); p.P(9, 3, H);
        p.R(3, 0, 10, 1, PHONE); p.R(5, 3, 3, 4, PHONE); p.R(6, 4, 1, 2, '#6a6a84');
      }
    },
  };

  global.Blocky = { draw, BOSS, DEV, OL };
})(typeof window !== 'undefined' ? window : globalThis);
