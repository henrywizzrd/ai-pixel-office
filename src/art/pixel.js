// Công cụ vẽ pixel art bằng canvas.

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  return [c, g];
}

// Tạo hàm vẽ hình chữ nhật gọn: r(x, y, w, h, màu)
export const rectFn = (g) => (x, y, w, h, c) => {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
};

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Làm sáng (amt > 0) hoặc tối (amt < 0) một màu hex
export function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Viền 1px màu tối quanh mọi pixel không trong suốt (kiểu sprite cổ điển)
export function outline(canvas, color = '#241b2e') {
  const g = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  const out = new Uint8ClampedArray(d);
  const [r, gg, b] = hexToRgb(color);
  const a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (a(x, y) !== 0) continue;
      if (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1)) {
        const i = (y * w + x) * 4;
        out[i] = r; out[i + 1] = gg; out[i + 2] = b; out[i + 3] = 255;
      }
    }
  g.putImageData(new ImageData(out, w, h), 0, 0);
}

// Random có seed để hoa văn sàn lần nào cũng giống nhau
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tạo sprite có chừa lề 1px để vẽ viền
export function sprite(w, h, draw, { outlined = true } = {}) {
  const [c, g] = makeCanvas(w + 2, h + 2);
  g.save();
  g.translate(1, 1);
  draw(rectFn(g), g, w, h);
  g.restore();
  if (outlined) outline(c);
  return c;
}
