// =====================================================================
//  ISO PIXEL ENGINE — dùng chung cho catalog và các phòng
//
//  Toạ độ thế giới (x, y, z), đơn vị pixel. Chiếu isometric 2:1:
//     sx = ox + x - y        sy = oy + (x + y) / 2 - z
//  Mặt "left" (y = y1) có độ sáng trung bình, mặt "right" (x = x1) tối nhất,
//  mặt trên sáng nhất. Ánh sáng chiếu từ trên, lệch trái.
//
//  Đồ vật được vẽ theo toạ độ cục bộ (u, v, z):
//     u = dọc theo bức tường mà đồ vật dựa vào
//     v = hướng ra xa tường (về phía người xem)
//  Hướng 'R' = dựa tường phải (mặt phẳng y = 0), 'L' = dựa tường trái (x = 0).
//  Hướng L chính là ảnh soi gương của hướng R.
// =====================================================================
(function (global) {
  const P = {
    ink: '#372240', plum1: '#4c2d54', plum2: '#513359', plum3: '#6b4870', plum4: '#8f5d82',
    mag0: '#520440', mag1: '#75125e', mag2: '#943672', mag3: '#a13f7d', mag4: '#c24c7d',
    cor1: '#c65b69', cor2: '#cb5f72', cor3: '#da6f75', cor4: '#eb8379',
    pk1: '#ebaaa2', pk2: '#ebb9b2', peach: '#fcaf7e', peach2: '#fcaf92', sand: '#fad1a9',
    cream1: '#f7dcd0', cream2: '#fcf2e3', white: '#fffbf5',
    mustard: '#e4d176', mustD: '#b8a24a', mint: '#6fd6a5', mint2: '#3fae8a', mint3: '#2f7f6e', lime: '#d4eda9',
    brown: '#7a3b2a', sky: '#bfe3f0',
  };

  const rgbCache = new Map();
  function rgb(hex) {
    if (!rgbCache.has(hex)) {
      const n = parseInt(hex.slice(1, 7), 16);
      rgbCache.set(hex, [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
    }
    return rgbCache.get(hex);
  }

  // Khối vật liệu: màu mặt trên / mặt sáng vừa / mặt tối + viền sáng cạnh trước
  // round = true: cắt 1px ở góc để khối trông bo tròn mềm
  function mat(top, mid, dark, rim, round = false) {
    return {
      top: (u, v, w, d) => {
        if (round && (u === 0 || u === w - 1) && (v === 0 || v === d - 1)) return null;
        return rim && (u >= w - 1 || v >= d - 1) ? rim : top;
      },
      front: (u, z, w, h, sh) => (round && z === h - 1 && (u === 0 || u === w - 1) ? null : sh ? dark : mid),
      side: (v, z, d, h, sh) => (round && z === h - 1 && (v === 0 || v === d - 1) ? null : sh ? dark : mid),
    };
  }

  function createIso(W, H, { ox, oy, bg = P.sand } = {}) {
    const main = new Uint8ClampedArray(W * H * 4);
    const emissive = new Uint8Array(W * H);
    const layer = new Int32Array(W * H).fill(-1);
    const layerEm = new Uint8Array(W * H);
    let touched = [];
    const colors = [];
    const colorIdx = new Map();
    const glows = [];
    const ci = (hex) => {
      if (!colorIdx.has(hex)) { colorIdx.set(hex, colors.length); colors.push(rgb(hex)); }
      return colorIdx.get(hex);
    };
    const S = { night: false, bg };

    function clear() {
      const clearA = S.bg === 'transparent' ? 0 : 255;
      const c = clearA ? rgb(S.night ? '#2a1c34' : S.bg) : [0, 0, 0];
      for (let i = 0; i < W * H; i++) {
        main[i * 4] = c[0]; main[i * 4 + 1] = c[1]; main[i * 4 + 2] = c[2]; main[i * 4 + 3] = clearA;
        emissive[i] = 1;
      }
      glows.length = 0;
    }

    function put(px, py, hex, em = false) {
      px = Math.round(px); py = Math.round(py);
      if (px < 0 || py < 0 || px >= W || py >= H || !hex) return;
      const i = py * W + px;
      if (layer[i] === -1) touched.push(i);
      layer[i] = ci(hex);
      layerEm[i] = em ? 1 : 0;
    }

    function box(b, st) {
      const { x0, x1, y0, y1, z0, z1 } = b;
      const em = !!st.emissive;
      const sxMin = Math.floor(ox + x0 - y1) - 1, sxMax = Math.ceil(ox + x1 - y0) + 1;
      const syMin = Math.floor(oy + (x0 + y0) / 2 - z1) - 1, syMax = Math.ceil(oy + (x1 + y1) / 2 - z0) + 1;
      for (let py = Math.max(0, syMin); py <= Math.min(H - 1, syMax); py++)
        for (let px = Math.max(0, sxMin); px <= Math.min(W - 1, sxMax); px++) {
          const u = px + 0.5 - ox, vy = py + 0.5 - oy;
          if (st.top) {
            const v = 2 * (vy + z1);
            const x = (u + v) / 2, y = (v - u) / 2;
            if (x >= x0 && x < x1 && y >= y0 && y < y1) {
              const c = st.top(Math.floor(x - x0), Math.floor(y - y0), x1 - x0, y1 - y0);
              if (c) { put(px, py, c, em && st.emTop !== false); continue; }
            }
          }
          if (st.left) {
            const x = u + y1, z = (x + y1) / 2 - vy;
            if (x >= x0 && x < x1 && z >= z0 && z < z1) {
              const c = st.left(Math.floor(x - x0), Math.floor(z - z0), x1 - x0, z1 - z0);
              if (c) { put(px, py, c, em); continue; }
            }
          }
          if (st.right) {
            const y = x1 - u, z = (x1 + y) / 2 - vy;
            if (y >= y0 && y < y1 && z >= z0 && z < z1) {
              const c = st.right(Math.floor(y - y0), Math.floor(z - z0), y1 - y0, z1 - z0);
              if (c) put(px, py, c, em);
            }
          }
        }
    }

    const proj = (x, y, z) => [Math.round(ox + x - y), Math.round(oy + (x + y) / 2 - z)];

    function blob(cx, cy, rx, ry, hex, em = false) {
      for (let y = -ry; y <= ry; y++)
        for (let x = -rx; x <= rx; x++)
          if ((x * x) / (rx * rx + 0.6) + (y * y) / (ry * ry + 0.6) <= 1) put(cx + x, cy + y, hex, em);
    }

    // Đẩy lớp tạm xuống ảnh chính, viền 1px phía trong bằng màu outline
    function commit(outline = P.ink, alpha = 1) {
      if (outline && S.olMap && S.olMap[outline]) outline = S.olMap[outline];
      const oc = outline ? ci(outline) : -1;
      for (const i of touched) {
        let c = layer[i];
        if (oc >= 0 && !layerEm[i]) {
          const x = i % W;
          if (x === 0 || x === W - 1 || layer[i - 1] === -1 || layer[i + 1] === -1 || layer[i - W] === -1 || layer[i + W] === -1) c = oc;
        }
        const [r, g, b] = colors[c];
        const k = i * 4;
        if (alpha >= 1) { main[k] = r; main[k + 1] = g; main[k + 2] = b; main[k + 3] = 255; emissive[i] = layerEm[i]; }
        else if (main[k + 3] === 0) { main[k] = r; main[k + 1] = g; main[k + 2] = b; main[k + 3] = Math.round(alpha * 255); }
        else { main[k] += (r - main[k]) * alpha; main[k + 1] += (g - main[k + 1]) * alpha; main[k + 2] += (b - main[k + 2]) * alpha; }
      }
      for (const i of touched) { layer[i] = -1; layerEm[i] = 0; }
      touched = [];
    }

    const glow = (x, y, rad, hex, a = 0.5) => glows.push([x, y, rad, hex, a]);

    // Đặt đồ vật: trả về bộ vẽ theo toạ độ cục bộ (u, v, z)
    function at(dir, U, V) {
      const R = dir !== 'L';
      return {
        dir: R ? 'R' : 'L',
        box(lb, st) {
          const { u0, u1, v0, v1, z0, z1 } = lb;
          if (R)
            box({ x0: U + u0, x1: U + u1, y0: V + v0, y1: V + v1, z0, z1 }, {
              top: st.top, emissive: st.emissive, emTop: st.emTop,
              left: st.front && ((x, z, w, h) => st.front(x, z, w, h, 0)),
              right: st.side && ((y, z, d, h) => st.side(y, z, d, h, 1)),
            });
          else
            box({ x0: V + v0, x1: V + v1, y0: U + u0, y1: U + u1, z0, z1 }, {
              top: st.top && ((x, y, w, d) => st.top(y, x, d, w)), emissive: st.emissive, emTop: st.emTop,
              right: st.front && ((y, z, d, h) => st.front(d - 1 - y, z, d, h, 1)),
              left: st.side && ((x, z, w, h) => st.side(x, z, w, h, 0)),
            });
        },
        p(u, v, z) { return R ? proj(U + u, V + v, z) : proj(V + v, U + u, z); },
        // hướng ngang trên màn hình khi u tăng: +1 với R, -1 với L
        get sgn() { return R ? 1 : -1; },
      };
    }

    // Kết xuất ra canvas (ban đêm: tối dần trừ pixel phát sáng, cộng quầng sáng)
    function finish(canvas) {
      if (S.night) {
        const tint = rgb('#5a4a8c');
        for (let i = 0; i < W * H; i++) {
          if (emissive[i]) continue;
          const k = i * 4;
          main[k] = (main[k] * tint[0]) / 255; main[k + 1] = (main[k + 1] * tint[1]) / 255; main[k + 2] = (main[k + 2] * tint[2]) / 255;
        }
        for (const [gx, gy, rad, hex, a] of glows) {
          const [r, g, b] = rgb(hex);
          for (let y = -rad; y <= rad; y++)
            for (let x = -rad; x <= rad; x++) {
              const d = Math.sqrt(x * x + y * y) / rad;
              if (d > 1) continue;
              const px = gx + x, py = gy + y;
              if (px < 0 || py < 0 || px >= W || py >= H) continue;
              const s = a * (d < 0.35 ? 0.6 : d < 0.7 ? 0.35 : 0.15);
              const k = (py * W + px) * 4;
              main[k] = Math.min(255, main[k] + r * s); main[k + 1] = Math.min(255, main[k + 1] + g * s); main[k + 2] = Math.min(255, main[k + 2] + b * s);
            }
        }
      }
      canvas.width = W; canvas.height = H;
      canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(main), W, H), 0, 0);
    }

    return {
      W, H, P, S, clear, put, box, blob, commit, proj, glow, at, finish,
      get night() { return S.night; },
    };
  }

  // Phòng nhỏ (góc 2 tường + sàn) để bày đồ vật trong catalog hoặc làm phòng thật
  function cornerRoom(iso, RX, RY, WH, theme = {}) {
    const { P } = iso;
    const T = {
      wallL: P.cream2, wallLlow: P.cream1, wallLline: P.pk1,
      wallR: P.plum3, wallRlow: P.plum2, wallRline: P.plum1,
      floorA: P.cor4, floorB: '#e57d77', seam: P.cor2, ...theme,
    };
    iso.box({ x0: -4, x1: 0, y0: -4, y1: RY, z0: -6, z1: WH }, {
      top: () => P.white,
      left: () => P.pk2,
      right: (y, z) => (z < 2 ? P.pk1 : z < 16 ? (z === 15 ? P.white : y % 12 === 0 ? T.wallLline : T.wallLlow) : z < 18 ? P.pk2 : T.wallL),
    });
    iso.commit(P.mag1);
    iso.box({ x0: 0, x1: RX, y0: -4, y1: 0, z0: -6, z1: WH }, {
      top: () => P.white,
      left: (x, z) => (z < 2 ? P.ink : z < 16 ? (z === 15 ? P.plum4 : x % 12 === 0 ? T.wallRline : T.wallRlow) : z < 18 ? P.plum4 : T.wallR),
      right: () => P.plum4,
    });
    iso.commit(P.ink);
    iso.box({ x0: 0, x1: RX, y0: 0, y1: RY, z0: -6, z1: 0 }, {
      top: (x, y) => {
        const row = Math.floor(y / 9);
        if (y % 9 === 0) return T.seam;
        if ((x + 56 - ((row * 37) % 56)) % 56 === 0) return T.seam;
        if (x < 3 || y < 3) return P.cor3;
        return row % 2 ? T.floorA : T.floorB;
      },
      left: (x, z) => (z === 5 ? P.cor2 : P.mag3),
      right: (y, z) => (z === 5 ? P.mag3 : P.mag2),
    });
    iso.commit(P.mag0);
  }

  global.Iso = { createIso, mat, cornerRoom, P, rgb };
})(typeof window !== 'undefined' ? window : globalThis);
