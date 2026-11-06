// Bố trí nội thất và các vị trí ngồi/đứng.
// tx, ty = ô góc trên-trái của phần chiếm chỗ; w, h = số ô bị chặn (không đi xuyên qua được).
import { TILE } from './map.js';

// ---------- Bàn làm việc của từng nhân viên ----------
// key = id nhân viên (xem src/agents/roles.js), screen = kiểu màn hình
export const DESKS = {
  dev1:  { tx: 4,  ty: 5,  screen: 'code' },
  dev2:  { tx: 8,  ty: 5,  screen: 'code' },
  dev3:  { tx: 12, ty: 5,  screen: 'code' },
  dev4:  { tx: 16, ty: 5,  screen: 'code' },
  des1:  { tx: 4,  ty: 9,  screen: 'design' },
  des2:  { tx: 8,  ty: 9,  screen: 'design' },
  test1: { tx: 12, ty: 9,  screen: 'test' },
  test2: { tx: 16, ty: 9,  screen: 'test' },
  pm:    { tx: 28, ty: 5,  screen: 'chart' },
  ba:    { tx: 32, ty: 5,  screen: 'chart' },
  ops1:  { tx: 44, ty: 19, screen: 'terminal' },
  ops2:  { tx: 50, ty: 19, screen: 'terminal' },
};
// Bàn trống (hot desk) cho đẹp
export const SPARE_DESKS = [
  { tx: 24, ty: 9, screen: 'off' },
  { tx: 28, ty: 9, screen: 'off' },
  { tx: 32, ty: 9, screen: 'off' },
  { tx: 4, ty: 13, screen: 'off' },
  { tx: 8, ty: 13, screen: 'off' },
];

// Ghế ngồi ở bàn làm việc: ô ngay dưới nửa trái bàn, quay lưng về camera
export function deskSeat(d) {
  return { x: d.tx, y: d.ty + 1, face: 'up', px: (d.tx + 1) * TILE, py: (d.ty + 1) * TILE + 11, chair: 'desk' };
}

// ---------- Phòng họp ----------
export const MEETING_TABLE = { tx: 45, ty: 7, w: 12, h: 3 };
export const MEETING_SEATS = (() => {
  const seats = [];
  for (const x of [46, 48, 50, 52, 54]) {
    seats.push({ x, y: 6, face: 'down', px: x * TILE + 8, py: 7 * TILE + 6, chair: 'meet-back' });
    seats.push({ x, y: 10, face: 'up', px: x * TILE + 8, py: 10 * TILE + 10, chair: 'meet' });
  }
  seats.push({ x: 44, y: 8, face: 'right', px: 44 * TILE + 8, py: 8 * TILE + 14, chair: 'stool' });
  seats.push({ x: 57, y: 8, face: 'left', px: 57 * TILE + 8, py: 8 * TILE + 14, chair: 'stool' });
  return seats;
})();

// ---------- Pantry: bàn ăn trưa ----------
export const DINING_TABLES = [
  { tx: 43, ty: 29 },
  { tx: 49, ty: 32 },
  { tx: 55, ty: 29 },
];
export const LUNCH_SEATS = DINING_TABLES.flatMap((t) => [
  { x: t.tx - 1, y: t.ty,     face: 'right', px: (t.tx - 1) * TILE + 9, py: t.ty * TILE + 12, chair: 'stool' },
  { x: t.tx - 1, y: t.ty + 1, face: 'right', px: (t.tx - 1) * TILE + 9, py: (t.ty + 1) * TILE + 12, chair: 'stool' },
  { x: t.tx + 2, y: t.ty,     face: 'left',  px: (t.tx + 2) * TILE + 7, py: t.ty * TILE + 12, chair: 'stool' },
  { x: t.tx + 2, y: t.ty + 1, face: 'left',  px: (t.tx + 2) * TILE + 7, py: (t.ty + 1) * TILE + 12, chair: 'stool' },
]);

// ---------- Các điểm đứng ----------
export const SPOTS = {
  coffee:  { x: 46, y: 26, face: 'up' },
  fridge:  { x: 47, y: 26, face: 'up' },
  water:   { x: 23, y: 4,  face: 'up' },
  printer: { x: 35, y: 12, face: 'right' },
  books:   { x: 20, y: 4,  face: 'up' },
  arcade:  { x: 55, y: 26, face: 'up' },
  buffet:  { x: 30, y: 30, face: 'up' },
  dj:      { x: 17, y: 27, face: 'up' },
};

// ---------- Nội thất ----------
// key: tên texture (src/art/furniture.js). block: có chặn đường không (mặc định có)
export const FURNITURE = [
  // Phòng làm việc
  { key: 'bookshelf', tx: 20, ty: 3, w: 2, h: 1 },
  { key: 'water', tx: 23, ty: 3, w: 1, h: 1 },
  { key: 'printer', tx: 36, ty: 12, w: 1, h: 1 },
  { key: 'plant', tx: 1, ty: 3, w: 1, h: 1 },
  { key: 'plant', tx: 36, ty: 3, w: 1, h: 1 },
  { key: 'plant', tx: 1, ty: 21, w: 1, h: 1 },
  { key: 'plant', tx: 36, ty: 21, w: 1, h: 1 },
  { key: 'plant-big', tx: 19, ty: 3, w: 1, h: 1 },
  { key: 'rug-work', tx: 26, ty: 15, w: 7, h: 5, block: false, flat: true },
  { key: 'sofa-blue', tx: 27, ty: 19, w: 3, h: 1 },
  { key: 'coffee-table', tx: 28, ty: 17, w: 2, h: 1 },
  { key: 'armchair', tx: 31, ty: 17, w: 1, h: 1 },

  // Phòng họp
  { key: 'meeting-table', ...MEETING_TABLE },
  { key: 'plant', tx: 40, ty: 3, w: 1, h: 1 },
  { key: 'plant', tx: 58, ty: 3, w: 1, h: 1 },
  { key: 'plant', tx: 58, ty: 12, w: 1, h: 1 },

  // Phòng server
  ...[41, 42, 43, 45, 46, 52, 53, 55, 56, 57].map((x) => ({ key: 'rack', tx: x, ty: 16, w: 1, h: 1, anim: true })),
  { key: 'plant', tx: 58, ty: 21, w: 1, h: 1 },

  // Phòng party
  { key: 'dj-booth', tx: 16, ty: 26, w: 4, h: 1 },
  { key: 'speaker', tx: 13, ty: 26, w: 1, h: 1 },
  { key: 'speaker', tx: 22, ty: 26, w: 1, h: 1 },
  { key: 'buffet', tx: 29, ty: 28, w: 4, h: 2 },
  { key: 'sofa-red', tx: 3, ty: 35, w: 3, h: 1 },
  { key: 'sofa-red', tx: 31, ty: 35, w: 3, h: 1 },
  { key: 'plant', tx: 1, ty: 25, w: 1, h: 1 },
  { key: 'plant', tx: 36, ty: 25, w: 1, h: 1 },
  { key: 'plant-big', tx: 1, ty: 36, w: 1, h: 1 },

  // Pantry
  { key: 'counter', tx: 41, ty: 25, w: 5, h: 1 },
  { key: 'coffee', tx: 46, ty: 25, w: 1, h: 1 },
  { key: 'fridge', tx: 47, ty: 25, w: 1, h: 1 },
  { key: 'vending', tx: 53, ty: 25, w: 1, h: 1 },
  { key: 'arcade', tx: 55, ty: 25, w: 1, h: 1 },
  { key: 'arcade', tx: 56, ty: 25, w: 1, h: 1 },
  ...DINING_TABLES.map((t) => ({ key: 'dining-table', tx: t.tx, ty: t.ty, w: 2, h: 2 })),
  { key: 'sofa-green', tx: 52, ty: 35, w: 3, h: 1 },
  { key: 'plant', tx: 40, ty: 36, w: 1, h: 1 },
  { key: 'plant', tx: 58, ty: 36, w: 1, h: 1 },
];

// ---------- Đồ treo tường (không chặn đường) ----------
// px, py tính bằng pixel
export const WALL_DECOR = [
  // tường trên phòng làm việc (hàng 1-2)
  ...[3, 7, 13, 25, 33].map((x) => ({ key: 'window', px: x * TILE, py: TILE + 3 })),
  { key: 'whiteboard', px: 9 * TILE + 4, py: TILE + 2 },
  { key: 'clock', px: 30 * TILE + 2, py: TILE + 4 },
  { key: 'poster-ship', px: 17 * TILE, py: TILE + 3 },
  // phòng họp
  { key: 'tv', px: 49 * TILE, py: TILE },
  ...[42, 55].map((x) => ({ key: 'window', px: x * TILE, py: TILE + 3 })),
  // phòng server
  { key: 'sign-server', px: 49 * TILE - 4, py: 14 * TILE + 3 },
  // phòng party (hàng 23-24)
  { key: 'banner', px: 13 * TILE, py: 23 * TILE + 1 },
  ...[3, 6, 31, 34].map((x) => ({ key: 'balloons', px: x * TILE, py: 23 * TILE - 4 })),
  // pantry
  { key: 'menu-board', px: 42 * TILE, py: 23 * TILE + 2 },
  { key: 'window', px: 56 * TILE - 8, py: 23 * TILE + 3 },
];

// Vùng nhảy trong phòng party (các ô đi được sẽ được lọc khi chạy)
export const PARTY_AREA = { x1: 12, y1: 28, x2: 24, y2: 34 };
