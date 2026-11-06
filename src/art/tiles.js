// Tileset sàn + tường, vẽ bằng code. Thứ tự khớp với T trong src/world/map.js
import { makeCanvas, rectFn, seeded } from './pixel.js';

const S = 16;

const drawers = [
  // 0 VOID
  (r) => r(0, 0, S, S, '#141221'),
  // 1 WALL_TOP (đỉnh tường nhìn từ trên)
  (r) => {
    r(0, 0, S, S, '#3b3452');
    r(0, 0, S, 1, '#4a4266');
    r(0, 15, S, 1, '#2c2640');
  },
  // 2 WALL_LOW (mặt tường dưới + chân tường)
  (r) => {
    r(0, 0, S, S, '#efe3c8');
    r(0, 11, S, 1, '#d8c8a6');
    r(0, 12, S, 4, '#8a6446');
    r(0, 12, S, 1, '#a57a56');
  },
  // 3 F_WORK sàn gỗ
  (r, rand) => {
    r(0, 0, S, S, '#c89a6a');
    for (let y = 0; y < S; y += 4) {
      r(0, y + 3, S, 1, '#b08055');
      const seam = (y * 5 + 3) % 16;
      r(seam, y, 1, 3, '#b08055');
    }
    for (let i = 0; i < 6; i++) r((rand() * S) | 0, (rand() * S) | 0, 1, 1, '#d4a878');
  },
  // 4 F_MEET thảm xanh
  (r, rand) => {
    r(0, 0, S, S, '#4d6b98');
    for (let i = 0; i < 14; i++) r((rand() * S) | 0, (rand() * S) | 0, 1, 1, rand() > 0.5 ? '#5878a6' : '#45618a');
  },
  // 5 F_SERVER sàn kim loại
  (r) => {
    r(0, 0, S, S, '#8c98a5');
    r(0, 0, S, 1, '#a3aebb');
    r(0, 0, 1, S, '#a3aebb');
    r(0, 15, S, 1, '#6f7a86');
    r(15, 0, 1, S, '#6f7a86');
    for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) r(x, y, 1, 1, '#6f7a86');
  },
  // 6 F_PARTY thảm tím
  (r, rand) => {
    r(0, 0, S, S, '#563c78');
    for (let i = 0; i < 12; i++) r((rand() * S) | 0, (rand() * S) | 0, 1, 1, rand() > 0.5 ? '#634689' : '#4b3369');
  },
  // 7 F_LOUNGE gạch men
  (r) => {
    r(0, 0, S, S, '#e8e0cc');
    r(0, 0, 8, 8, '#ddd3bb');
    r(8, 8, 8, 8, '#ddd3bb');
    r(0, 15, S, 1, '#cbbfa5');
    r(15, 0, 1, S, '#cbbfa5');
  },
  // 8 F_DOOR ngưỡng cửa
  (r) => {
    r(0, 0, S, S, '#9b7550');
    r(0, 0, S, 1, '#b48c64');
    r(0, 8, S, 1, '#8a6646');
  },
  // 9 F_DANCE sàn nhảy nhiều màu
  (r) => {
    r(0, 0, 8, 8, '#ff6fa8');
    r(8, 0, 8, 8, '#6fd3ff');
    r(0, 8, 8, 8, '#ffe06f');
    r(8, 8, 8, 8, '#8cff8a');
    r(0, 0, 8, 1, '#ffffff55');
    r(8, 8, 8, 1, '#ffffff55');
  },
  // 10 F_MAT thảm cửa ra vào
  (r) => {
    r(0, 0, S, S, '#7a3b3b');
    r(1, 1, 14, 14, '#934848');
    r(3, 3, 10, 10, '#7a3b3b');
  },
  // 11 WALL_UP (mặt tường trên)
  (r) => {
    r(0, 0, S, S, '#efe3c8');
    r(0, 0, S, 2, '#c9b893');
    r(0, 2, S, 1, '#ddd0b0');
  },
];

// Mỗi tile được chừa lề 1px và "kéo giãn" mép (extrude) để không bị đường kẻ khi zoom lẻ.
// Dùng với addTilesetImage(..., margin = 1, spacing = 2)
export const TILE_MARGIN = 1;
export const TILE_SPACING = 2;

export function buildTileset() {
  const [tmp, tg] = makeCanvas(S, S);
  const r = rectFn(tg);
  const step = S + TILE_SPACING;
  const [c, g] = makeCanvas(TILE_MARGIN * 2 + step * drawers.length - TILE_SPACING, S + TILE_MARGIN * 2);
  drawers.forEach((draw, i) => {
    tg.clearRect(0, 0, S, S);
    draw(r, seeded(1000 + i));
    const x = TILE_MARGIN + i * step;
    const y = TILE_MARGIN;
    g.drawImage(tmp, x, y);
    g.drawImage(tmp, 0, 0, S, 1, x, y - 1, S, 1);          // mép trên
    g.drawImage(tmp, 0, S - 1, S, 1, x, y + S, S, 1);      // mép dưới
    g.drawImage(tmp, 0, 0, 1, S, x - 1, y, 1, S);          // mép trái
    g.drawImage(tmp, S - 1, 0, 1, S, x + S, y, 1, S);      // mép phải
  });
  return c;
}
