// Nhân vật 16x24 vẽ bằng code. Mỗi nhân vật có 9 frame:
//   hàng ngang: [xuống-đứng, xuống-bước1, xuống-bước2, lên-đứng, lên-bước1, lên-bước2, ngang-đứng, ngang-bước1, ngang-bước2]
// Hướng trái = lật ngang frame "ngang".
import { makeCanvas, rectFn, outline, shade } from './pixel.js';

export const FW = 16;
export const FH = 24;
export const DIRS = ['down', 'up', 'side'];

function drawFrame(r, dir, step, L) {
  const skin = L.skin;
  const skinD = shade(skin, -0.15);
  const hair = L.hair;
  const shirt = L.shirt;
  const shirtD = shade(shirt, -0.2);
  const pants = L.pants;
  const shoe = '#2a2230';
  const eye = '#241b2e';
  const bob = step ? 1 : 0; // thân nhún xuống 1px khi bước

  // ----- Chân -----
  if (dir === 'side') {
    const front = step === 1 ? 2 : step === 2 ? -2 : 0;
    r(7 - front / 2, 18, 3, 4, shade(pants, -0.15)); // chân sau
    r(7 + front / 2, 18, 3, 4, pants);                // chân trước
    r(7 - front / 2, 22, 3, 1, shoe);
    r(7 + front / 2, 22, 4, 1, shoe);
  } else {
    const lUp = step === 1 ? 1 : 0;
    const rUp = step === 2 ? 1 : 0;
    r(5, 18, 3, 4 - lUp, pants); r(5, 22 - lUp, 3, 1, shoe);
    r(8, 18, 3, 4 - rUp, pants); r(8, 22 - rUp, 3, 1, shoe);
  }

  const y0 = bob; // dịch cả thân trên
  // ----- Thân -----
  if (dir === 'side') {
    r(5, 11 + y0, 6, 7, shirt); r(5, 17 + y0, 6, 1, shirtD);
    const sw = step === 1 ? 1 : step === 2 ? -1 : 0;
    r(7 + sw, 12 + y0, 2, 4, shirtD); r(7 + sw, 16 + y0, 2, 1, skin);
  } else {
    r(4, 11 + y0, 8, 7, shirt); r(4, 17 + y0, 8, 1, shirtD);
    const la = step === 1 ? -1 : 0;
    const ra = step === 2 ? -1 : 0;
    r(3, 12 + y0, 1, 4 + la, shirtD); r(3, 16 + y0 + la, 1, 1, skin);
    r(12, 12 + y0, 1, 4 + ra, shirtD); r(12, 16 + y0 + ra, 1, 1, skin);
    if (dir === 'down') r(6, 11 + y0, 4, 1, shade(shirt, 0.25)); // cổ áo
  }

  // ----- Đầu -----
  if (dir === 'down') {
    r(4, 4 + y0, 8, 7, skin); r(4, 10 + y0, 8, 1, skinD);
    r(6, 7 + y0, 1, 1, eye); r(9, 7 + y0, 1, 1, eye);
    r(5, 8 + y0, 1, 1, '#f3a0a0'); r(10, 8 + y0, 1, 1, '#f3a0a0');
    r(7, 9 + y0, 2, 1, skinD);
    // tóc
    r(5, 2 + y0, 6, 1, hair); r(4, 3 + y0, 8, 2, hair); r(4, 5 + y0, 1, 2, hair); r(11, 5 + y0, 1, 2, hair);
    if (L.hairStyle === 'long') { r(3, 4 + y0, 1, 8, hair); r(12, 4 + y0, 1, 8, hair); r(4, 7 + y0, 1, 4, hair); r(11, 7 + y0, 1, 4, hair); }
    if (L.hairStyle === 'bun') { r(6, 0 + y0, 4, 2, hair); }
    if (L.hairStyle === 'spiky') { r(5, 1 + y0, 1, 1, hair); r(8, 1 + y0, 1, 1, hair); r(10, 1 + y0, 1, 1, hair); }
    if (L.hairStyle === 'fringe') { r(5, 5 + y0, 4, 1, hair); }
  } else if (dir === 'up') {
    r(4, 3 + y0, 8, 8, hair); r(5, 2 + y0, 6, 1, hair);
    r(6, 10 + y0, 4, 1, skinD);
    if (L.hairStyle === 'long') { r(3, 4 + y0, 1, 8, hair); r(12, 4 + y0, 1, 8, hair); r(4, 11 + y0, 8, 2, hair); }
    if (L.hairStyle === 'bun') r(6, 0 + y0, 4, 2, hair);
    if (L.hairStyle === 'spiky') { r(5, 1 + y0, 1, 1, hair); r(8, 1 + y0, 1, 1, hair); r(10, 1 + y0, 1, 1, hair); }
  } else {
    r(5, 4 + y0, 7, 7, skin); r(5, 10 + y0, 7, 1, skinD);
    r(10, 7 + y0, 1, 1, eye); r(11, 8 + y0, 1, 1, '#f3a0a0');
    r(5, 2 + y0, 6, 1, hair); r(4, 3 + y0, 8, 2, hair); r(4, 5 + y0, 3, 4, hair);
    if (L.hairStyle === 'long') r(4, 5 + y0, 3, 8, hair);
    if (L.hairStyle === 'bun') r(3, 2 + y0, 3, 3, hair);
    if (L.hairStyle === 'spiky') { r(6, 1 + y0, 1, 1, hair); r(9, 1 + y0, 1, 1, hair); }
  }

  // ----- Phụ kiện theo vai trò -----
  const a = L.accessory;
  const ac = L.accent || '#ff6fa8';
  if (a === 'headphones') {
    r(4, 2 + y0, 8, 1, '#2b2f3a');
    if (dir === 'side') { r(6, 5 + y0, 3, 3, '#2b2f3a'); r(7, 6 + y0, 1, 1, ac); }
    else { r(3, 5 + y0, 1, 3, '#2b2f3a'); r(12, 5 + y0, 1, 3, '#2b2f3a'); r(3, 6 + y0, 1, 1, ac); r(12, 6 + y0, 1, 1, ac); }
  }
  if (a === 'beret') {
    r(3, 1 + y0, 9, 2, ac); r(4, 0 + y0, 6, 1, ac); r(4, 2 + y0, 7, 1, shade(ac, -0.3));
  }
  if (a === 'glasses' && dir !== 'up') {
    if (dir === 'down') { r(5, 7 + y0, 6, 1, '#241b2e'); r(6, 7 + y0, 1, 1, '#9fd8ff'); r(9, 7 + y0, 1, 1, '#9fd8ff'); }
    else { r(9, 7 + y0, 3, 1, '#241b2e'); r(10, 7 + y0, 1, 1, '#9fd8ff'); }
  }
  if (a === 'tie' && dir !== 'up') {
    if (dir === 'down') { r(7, 11 + y0, 2, 1, ac); r(7, 12 + y0, 2, 4, shade(ac, -0.15)); }
    else r(10, 12 + y0, 1, 3, ac);
  }
  if (a === 'beanie') {
    r(4, 1 + y0, 8, 3, ac); r(4, 4 + y0, 8, 1, shade(ac, -0.25)); r(7, 0 + y0, 2, 1, shade(ac, 0.3));
  }
  if (a === 'lanyard' && dir === 'down') {
    r(6, 11 + y0, 1, 3, ac); r(9, 11 + y0, 1, 3, ac); r(7, 14 + y0, 2, 2, '#ffffff');
  }
}

// look: { skin, hair, hairStyle, shirt, pants, accessory, accent }
export function buildCharacterSheet(look) {
  const [c, g] = makeCanvas(FW * 9, FH);
  const r0 = rectFn(g);
  DIRS.forEach((dir, di) =>
    [0, 1, 2].forEach((step) => {
      const ox = (di * 3 + step) * FW;
      const r = (x, y, w, h, col) => r0(ox + x, y, w, h, col);
      drawFrame(r, dir, step, look);
    }),
  );
  outline(c);
  return c;
}

export const frameIndex = (dir, step = 0) => DIRS.indexOf(dir) * 3 + step;
