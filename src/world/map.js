// Bản đồ văn phòng dạng lưới (mỗi ô = 16px).
// Sau này nếu dùng Tiled + asset itch.io thì thay hàm buildGrid() bằng dữ liệu từ file .json của Tiled.

export const TILE = 16;
export const MAP_W = 60;
export const MAP_H = 38;

// Chỉ số tile trong tileset (xem src/art/tiles.js)
export const T = {
  VOID: 0,
  WALL_TOP: 1,
  WALL_LOW: 2,   // mặt tường phần dưới (có chân tường)
  F_WORK: 3,
  F_MEET: 4,
  F_SERVER: 5,
  F_PARTY: 6,
  F_LOUNGE: 7,
  F_DOOR: 8,
  F_DANCE: 9,
  F_MAT: 10,
  WALL_UP: 11,   // mặt tường phần trên
};

export const isFloorTile = (t) => t >= 3 && t <= 10;

// Toạ độ phòng tính theo ô, bao gồm cả 2 đầu
export const ROOMS = {
  work:    { name: 'Phòng làm việc', x1: 1,  y1: 3,  x2: 37, y2: 21, floor: T.F_WORK },
  meeting: { name: 'Phòng họp',      x1: 40, y1: 3,  x2: 58, y2: 12, floor: T.F_MEET },
  server:  { name: 'Phòng server',   x1: 40, y1: 16, x2: 58, y2: 21, floor: T.F_SERVER },
  party:   { name: 'Phòng party',    x1: 1,  y1: 25, x2: 37, y2: 36, floor: T.F_PARTY },
  lounge:  { name: 'Pantry',         x1: 40, y1: 25, x2: 58, y2: 36, floor: T.F_LOUNGE },
};

// Cửa nối giữa các phòng (khoét xuyên tường)
const DOORS = [
  { x1: 38, y1: 8,  x2: 39, y2: 9  }, // làm việc ↔ họp
  { x1: 38, y1: 18, x2: 39, y2: 19 }, // làm việc ↔ server
  { x1: 48, y1: 13, x2: 49, y2: 15 }, // họp ↔ server
  { x1: 9,  y1: 22, x2: 10, y2: 24 }, // làm việc ↔ party (trái)
  { x1: 27, y1: 22, x2: 28, y2: 24 }, // làm việc ↔ party (phải)
  { x1: 49, y1: 22, x2: 50, y2: 24 }, // server ↔ pantry
  { x1: 38, y1: 30, x2: 39, y2: 31 }, // party ↔ pantry
];

// Cửa ra vào toà nhà (nhân viên đến và về ở đây)
export const ENTRANCE = { x: 0, y: 11 };

// Sàn nhảy trong phòng party
export const DANCE_FLOOR = { x1: 12, y1: 28, x2: 24, y2: 34 };

export function buildGrid() {
  const g = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(-1));
  const fill = (r, t) => {
    for (let y = r.y1; y <= r.y2; y++) for (let x = r.x1; x <= r.x2; x++) g[y][x] = t;
  };

  Object.values(ROOMS).forEach((r) => fill(r, r.floor));
  fill(DANCE_FLOOR, T.F_DANCE);
  DOORS.forEach((d) => fill(d, T.F_DOOR));
  g[ENTRANCE.y][0] = T.F_MAT;
  g[ENTRANCE.y + 1][0] = T.F_MAT;

  // Tường: ô nằm ngay trên sàn = mặt tường dưới, trên nữa = mặt tường trên, còn lại = đỉnh tường
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      if (g[y][x] === -1 && y + 1 < MAP_H && isFloorTile(g[y + 1][x])) g[y][x] = T.WALL_LOW;
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      if (g[y][x] === -1 && y + 1 < MAP_H && g[y + 1][x] === T.WALL_LOW) g[y][x] = T.WALL_UP;
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) if (g[y][x] === -1) g[y][x] = T.WALL_TOP;

  return g;
}

export function roomAt(x, y) {
  for (const [id, r] of Object.entries(ROOMS))
    if (x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2) return id;
  return null;
}
