// Nội thất vẽ bằng code. Mỗi hàm trả về 1 canvas (hoặc mảng canvas nếu có animation).
// Kích thước rộng = số ô * 16; chiều cao có thể cao hơn phần chiếm chỗ (đồ cao dựa vào tường).
import { sprite, shade } from './pixel.js';

const WOOD = '#b98a5b';
const WOOD_D = '#8a5f3c';
const WOOD_L = '#d4a878';
const METAL = '#3a3f4c';

// ---------- Bàn làm việc ----------
const SCREENS = {
  code: (r) => {
    r(10, 1, 12, 8, '#1e2a44');
    r(11, 2, 5, 1, '#ff79c6'); r(17, 2, 3, 1, '#8be9fd');
    r(12, 4, 7, 1, '#50fa7b'); r(12, 6, 4, 1, '#f1fa8c'); r(17, 6, 3, 1, '#8be9fd');
  },
  design: (r) => {
    r(10, 1, 12, 8, '#fdf6ec');
    r(11, 2, 4, 4, '#ff6fa8'); r(16, 3, 5, 2, '#6fd3ff'); r(13, 6, 7, 2, '#ffd166');
  },
  test: (r) => {
    r(10, 1, 12, 8, '#1f3a2e');
    r(11, 2, 2, 1, '#50fa7b'); r(14, 2, 6, 1, '#cfe8da');
    r(11, 4, 2, 1, '#ff5555'); r(14, 4, 5, 1, '#cfe8da');
    r(11, 6, 2, 1, '#50fa7b'); r(14, 6, 6, 1, '#cfe8da');
  },
  chart: (r) => {
    r(10, 1, 12, 8, '#f4f1e8');
    r(11, 6, 2, 2, '#6fd3ff'); r(14, 4, 2, 4, '#ff6fa8'); r(17, 3, 2, 5, '#8cff8a'); r(20, 2, 1, 6, '#ffd166');
  },
  terminal: (r) => {
    r(10, 1, 12, 8, '#0b0f0b');
    r(11, 2, 8, 1, '#50fa7b'); r(11, 4, 5, 1, '#50fa7b'); r(11, 6, 9, 1, '#50fa7b'); r(11, 7, 1, 1, '#c8ffd0');
  },
  off: (r) => r(10, 1, 12, 8, '#1c2230'),
};

export function desk(screen = 'code') {
  return sprite(32, 26, (r) => {
    // chân bàn + tấm chắn
    r(2, 17, 2, 9, WOOD_D); r(28, 17, 2, 9, WOOD_D);
    r(1, 16, 30, 6, shade(WOOD_D, -0.1));
    // mặt bàn
    r(0, 11, 32, 6, WOOD);
    r(0, 11, 32, 1, WOOD_L);
    r(0, 16, 32, 1, WOOD_D);
    // màn hình
    r(9, 0, 14, 10, '#2b2f3a');
    SCREENS[screen](r);
    r(15, 10, 2, 2, '#2b2f3a');
    r(13, 11, 6, 1, '#2b2f3a');
    // bàn phím, chuột, cốc, giấy
    r(10, 13, 12, 2, '#d9d9e0'); r(10, 13, 12, 1, '#f0f0f4');
    r(23, 13, 2, 2, '#d9d9e0');
    if (screen !== 'off') {
      r(26, 12, 3, 3, '#e74c3c'); r(26, 12, 3, 1, '#ff7a6a');
      r(2, 12, 5, 3, '#f4f1e8'); r(3, 13, 3, 1, '#c8c2b4');
    }
    if (screen === 'design') { r(2, 12, 6, 4, '#3a3f4c'); r(3, 13, 4, 2, '#6c7385'); }
  });
}

// ---------- Ghế ----------
export const chairDesk = () =>
  sprite(14, 12, (r) => {
    r(1, 0, 12, 7, '#3b3f55'); r(2, 1, 10, 1, '#55597a');
    r(6, 7, 2, 3, '#222'); r(2, 10, 10, 2, '#2a2a33');
  });
export const chairMeet = () =>
  sprite(12, 10, (r) => {
    r(0, 0, 12, 6, '#c0392b'); r(1, 1, 10, 1, '#e05a4a');
    r(5, 6, 2, 3, '#333'); r(2, 9, 8, 1, '#333');
  });
export const chairMeetBack = () =>
  sprite(12, 8, (r) => {
    r(0, 0, 12, 8, '#c0392b'); r(1, 1, 10, 1, '#e05a4a');
  });
export const stool = () =>
  sprite(10, 6, (r) => {
    r(0, 0, 10, 4, '#d35400'); r(1, 0, 8, 1, '#f08a3c'); r(2, 4, 1, 2, '#555'); r(7, 4, 1, 2, '#555');
  });

// ---------- Phòng làm việc ----------
export const plant = () =>
  sprite(16, 24, (r) => {
    r(4, 17, 8, 7, '#c0643c'); r(3, 16, 10, 2, '#d87a4e'); r(5, 19, 6, 1, '#a8532f');
    r(5, 6, 6, 10, '#3f8f4a'); r(2, 9, 5, 6, '#4fae5a'); r(9, 8, 5, 7, '#4fae5a');
    r(6, 2, 4, 6, '#5cc068'); r(7, 4, 1, 10, '#2f6e38'); r(4, 11, 1, 1, '#7ad686'); r(11, 10, 1, 1, '#7ad686');
  });
export const plantBig = () =>
  sprite(16, 32, (r) => {
    r(3, 24, 10, 8, '#7a7f8c'); r(2, 23, 12, 2, '#9aa0ad');
    r(7, 10, 2, 14, '#6b4a2f');
    r(2, 2, 12, 10, '#3f8f4a'); r(0, 5, 6, 7, '#4fae5a'); r(10, 4, 6, 8, '#4fae5a'); r(4, 0, 8, 5, '#5cc068');
    r(5, 3, 1, 1, '#7ad686'); r(12, 6, 1, 1, '#7ad686'); r(2, 8, 1, 1, '#7ad686');
  });
export const bookshelf = () =>
  sprite(32, 34, (r) => {
    r(0, 0, 32, 34, '#6b4a2f'); r(0, 0, 32, 1, '#8a6446');
    const cols = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22', '#ecf0f1', '#1abc9c'];
    for (let s = 0; s < 3; s++) {
      const y = 2 + s * 10;
      r(2, y, 28, 8, '#3e2a1a');
      let x = 3;
      let i = s * 3;
      while (x < 28) {
        const w = 2 + ((i * 7) % 2);
        const h = 6 + ((i * 3) % 3);
        r(x, y + 8 - h, w, h, cols[i % cols.length]);
        x += w + (i % 4 === 0 ? 1 : 0);
        i++;
      }
      r(0, y + 8, 32, 2, '#8a6446');
    }
  });
export const waterCooler = () =>
  sprite(14, 28, (r) => {
    r(2, 1, 10, 12, '#7fc4ff'); r(3, 2, 2, 9, '#c4e6ff'); r(4, 0, 6, 1, '#5aa8e6');
    r(1, 13, 12, 15, '#e6ebf0'); r(1, 13, 12, 1, '#ffffff');
    r(3, 16, 2, 2, '#3498db'); r(9, 16, 2, 2, '#e74c3c');
    r(3, 20, 8, 1, '#b8c0c8');
  });
export const printer = () =>
  sprite(16, 22, (r) => {
    r(0, 8, 16, 14, '#4a4f5c');
    r(1, 4, 14, 10, '#d9dbe0'); r(1, 4, 14, 1, '#f2f3f5');
    r(3, 0, 10, 5, '#ffffff'); r(4, 1, 6, 1, '#c8c2b4'); r(4, 3, 7, 1, '#c8c2b4');
    r(11, 7, 2, 1, '#50fa7b'); r(3, 11, 10, 2, '#2b2f3a');
  });
export const sofa = (col) => () =>
  sprite(48, 24, (r) => {
    const d = shade(col, -0.25);
    const l = shade(col, 0.2);
    r(0, 0, 48, 12, col); r(1, 1, 46, 1, l);
    r(4, 10, 40, 10, l); r(4, 10, 40, 1, shade(col, 0.35));
    r(23, 10, 2, 10, col);
    r(0, 4, 5, 18, d); r(43, 4, 5, 18, d); r(0, 4, 5, 1, col); r(43, 4, 5, 1, col);
    r(4, 20, 40, 3, d);
  });
export const armchair = () =>
  sprite(16, 22, (r) => {
    r(0, 0, 16, 10, '#e67e22'); r(3, 8, 10, 9, '#f5a050'); r(0, 4, 3, 16, '#b85f12'); r(13, 4, 3, 16, '#b85f12'); r(3, 17, 10, 3, '#b85f12');
  });
export const coffeeTable = () =>
  sprite(32, 14, (r) => {
    r(0, 0, 32, 8, WOOD); r(0, 0, 32, 1, WOOD_L); r(2, 8, 2, 6, WOOD_D); r(28, 8, 2, 6, WOOD_D);
    r(6, 2, 4, 3, '#ffffff'); r(20, 1, 6, 4, '#3498db');
  });
export function rug(w, h, a, b) {
  return () =>
    sprite(w, h, (r) => {
      r(0, 0, w, h, a);
      r(3, 3, w - 6, h - 6, b);
      r(6, 6, w - 12, h - 12, a);
      for (let x = 2; x < w - 2; x += 4) { r(x, 0, 1, 1, b); r(x, h - 1, 1, 1, b); }
    }, { outlined: false });
}

// ---------- Đồ treo tường ----------
export const windowSprite = () =>
  sprite(26, 20, (r) => {
    r(0, 0, 26, 20, '#8a6446');
    r(2, 2, 22, 16, '#9fd8ff'); r(2, 2, 22, 6, '#c4e9ff');
    r(12, 2, 2, 16, '#8a6446'); r(2, 9, 22, 2, '#8a6446');
    r(4, 3, 3, 1, '#ffffff'); r(16, 4, 2, 1, '#ffffff');
    r(-1, 19, 28, 2, '#a57a56');
  });
export const whiteboard = () =>
  sprite(40, 24, (r) => {
    r(0, 0, 40, 22, '#b8c0c8'); r(2, 2, 36, 18, '#ffffff');
    r(4, 5, 12, 1, '#3498db'); r(4, 8, 8, 1, '#3498db'); r(20, 4, 10, 8, '#ffffff');
    r(20, 4, 10, 1, '#e74c3c'); r(20, 11, 10, 1, '#e74c3c'); r(20, 4, 1, 8, '#e74c3c'); r(29, 4, 1, 8, '#e74c3c');
    r(31, 8, 4, 1, '#2ecc71'); r(4, 13, 20, 1, '#555'); r(4, 16, 14, 1, '#555');
    r(6, 22, 28, 2, '#8a8f99'); r(10, 21, 3, 1, '#e74c3c'); r(15, 21, 3, 1, '#3498db');
  });
export const clock = () =>
  sprite(12, 12, (r) => {
    r(2, 0, 8, 12, '#ffffff'); r(0, 2, 12, 8, '#ffffff'); r(1, 1, 10, 10, '#ffffff');
    r(5, 2, 1, 4, '#2b2f3a'); r(5, 5, 4, 1, '#e74c3c');
  });
export const posterShip = () =>
  sprite(18, 20, (r) => {
    r(0, 0, 18, 20, '#2c3e50'); r(2, 2, 14, 12, '#16a085');
    r(8, 4, 2, 8, '#ecf0f1'); r(6, 10, 6, 2, '#e74c3c'); r(7, 13, 4, 1, '#f39c12');
    r(3, 16, 12, 2, '#ecf0f1');
  });
export const tv = () =>
  sprite(48, 26, (r) => {
    r(0, 0, 48, 26, '#1d1f27'); r(2, 2, 44, 22, '#203a5c');
    r(5, 17, 4, 5, '#6fd3ff'); r(11, 13, 4, 9, '#ff6fa8'); r(17, 9, 4, 13, '#8cff8a'); r(23, 6, 4, 16, '#ffd166');
    r(31, 5, 12, 1, '#ffffff'); r(31, 8, 9, 1, '#9fb4cc'); r(31, 11, 11, 1, '#9fb4cc'); r(31, 14, 7, 1, '#9fb4cc');
  });
export const signServer = () =>
  sprite(40, 10, (r) => {
    r(0, 0, 40, 10, '#2b2f3a'); r(1, 1, 38, 8, '#50fa7b22');
    for (let i = 0; i < 6; i++) r(4 + i * 6, 4, 4, 2, '#50fa7b');
  });
export const banner = () =>
  sprite(176, 14, (r) => {
    r(0, 0, 176, 1, '#8a6446');
    const cols = ['#ff6fa8', '#6fd3ff', '#ffe06f', '#8cff8a', '#c39bff'];
    for (let i = 0; i < 22; i++) {
      const x = i * 8;
      const c = cols[i % cols.length];
      for (let k = 0; k < 6; k++) r(x + 1 + (k >> 1), 1 + k * 2, 6 - (k >> 1) * 2, 2, c);
    }
  }, { outlined: false });
export const balloons = () =>
  sprite(16, 26, (r) => {
    const b = (x, y, c) => { r(x, y + 1, 6, 5, c); r(x + 1, y, 4, 7, c); r(x + 1, y + 1, 1, 2, '#ffffffaa'); };
    r(4, 8, 1, 16, '#ddd'); r(8, 6, 1, 18, '#ddd'); r(11, 9, 1, 15, '#ddd');
    b(0, 3, '#ff5c8a'); b(6, 0, '#ffd166'); b(10, 4, '#6fd3ff');
  });
export const menuBoard = () =>
  sprite(30, 20, (r) => {
    r(0, 0, 30, 20, '#6b4a2f'); r(2, 2, 26, 16, '#2d3a2e');
    r(5, 4, 10, 1, '#ffffff'); r(5, 8, 14, 1, '#ffd166'); r(5, 11, 12, 1, '#ffd166'); r(5, 14, 9, 1, '#ffd166');
    r(22, 8, 3, 1, '#ffffff'); r(22, 11, 3, 1, '#ffffff'); r(22, 14, 3, 1, '#ffffff');
  });

// ---------- Phòng họp ----------
export const meetingTable = () =>
  sprite(192, 54, (r) => {
    r(4, 44, 4, 10, WOOD_D); r(184, 44, 4, 10, WOOD_D);
    r(0, 4, 192, 40, '#8b5a3c'); r(0, 4, 192, 2, '#a8734f'); r(2, 8, 188, 34, '#9a6544');
    r(0, 44, 192, 6, '#6e4329');
    for (const x of [16, 48, 80, 112, 144]) {
      r(x - 4, 8, 10, 6, '#d9dbe0'); r(x - 3, 9, 8, 4, '#6fd3ff');   // laptop hàng trên
      r(x - 3, 32, 8, 6, '#f4f1e8'); r(x - 2, 34, 5, 1, '#c8c2b4');  // giấy hàng dưới
    }
    r(92, 20, 8, 6, '#2c3e50'); r(93, 21, 6, 2, '#5d6d7e');          // máy chiếu / loa hội nghị
    r(60, 22, 2, 4, '#7fc4ff'); r(130, 21, 2, 4, '#7fc4ff');         // chai nước
  });

// ---------- Phòng server (2 frame đèn nháy) ----------
export function rack() {
  return [0, 1].map((f) =>
    sprite(16, 30, (r) => {
      r(0, 0, 16, 30, '#22252e'); r(0, 0, 16, 1, '#3a3f4c');
      for (let i = 0; i < 5; i++) {
        const y = 2 + i * 5;
        r(2, y, 12, 4, METAL); r(2, y, 12, 1, '#4a5060');
        const on = (i + f) % 2 === 0;
        r(3, y + 2, 1, 1, on ? '#50fa7b' : '#1f5f30');
        r(5, y + 2, 1, 1, (i * 3 + f) % 3 === 0 ? '#ffb86c' : '#5a4020');
        r(7, y + 2, 1, 1, f ? '#6fd3ff' : '#245a70');
        r(9, y + 1, 4, 2, '#2b2f3a');
      }
    }),
  );
}

// ---------- Phòng party ----------
export const djBooth = () =>
  sprite(64, 28, (r) => {
    r(0, 10, 64, 18, '#1d1f27'); r(0, 10, 64, 2, '#3a3f4c');
    r(0, 20, 64, 2, '#ff6fa8'); r(0, 23, 64, 1, '#6fd3ff');
    r(6, 4, 52, 8, '#2b2f3a');
    for (const x of [10, 42]) { r(x, 5, 12, 6, '#111'); r(x + 3, 6, 6, 4, '#444'); r(x + 5, 7, 2, 2, '#ff6fa8'); }
    r(26, 3, 12, 7, '#d9dbe0'); r(27, 4, 10, 4, '#c39bff');
  });
export const speaker = () =>
  sprite(16, 26, (r) => {
    r(0, 0, 16, 26, '#1d1f27'); r(1, 1, 14, 1, '#3a3f4c');
    r(4, 3, 8, 7, '#3a3f4c'); r(6, 5, 4, 3, '#111');
    r(2, 12, 12, 12, '#3a3f4c'); r(4, 14, 8, 8, '#111'); r(6, 16, 4, 4, '#555');
  });
export const buffet = () =>
  sprite(64, 40, (r) => {
    r(0, 6, 64, 26, '#ffffff'); r(0, 6, 64, 2, '#f0f0f0');
    r(0, 28, 64, 12, '#e74c3c'); for (let x = 0; x < 64; x += 8) r(x, 28, 4, 12, '#c0392b');
    // bánh kem
    r(6, 4, 16, 12, '#f5d0a9'); r(6, 4, 16, 4, '#ff9ecb'); r(8, 10, 12, 1, '#ff6fa8');
    r(10, 0, 1, 4, '#ffe06f'); r(14, 0, 1, 4, '#6fd3ff'); r(18, 0, 1, 4, '#8cff8a');
    // pizza
    r(28, 10, 14, 10, '#e9a23b'); r(29, 11, 12, 8, '#f6c35b'); r(31, 13, 2, 2, '#c0392b'); r(36, 15, 2, 2, '#c0392b'); r(33, 17, 2, 1, '#2ecc71');
    // ly & chai
    for (const x of [46, 50, 54]) { r(x, 10, 3, 5, '#ffd166'); r(x, 10, 3, 1, '#ffffff'); }
    r(58, 4, 3, 12, '#2ecc71'); r(59, 2, 1, 2, '#2ecc71');
    r(46, 18, 12, 4, '#f39c12'); r(47, 18, 2, 1, '#fff3c4');
  });
export function discoBall() {
  return [0, 1, 2].map((f) =>
    sprite(14, 14, (r) => {
      r(3, 0, 8, 14, '#c8ccd4'); r(0, 3, 14, 8, '#c8ccd4'); r(1, 1, 12, 12, '#c8ccd4');
      for (let y = 1; y < 13; y += 3)
        for (let x = 1; x < 13; x += 3) r(x, y, 2, 2, ((x + y) / 3 + f) % 3 === 0 ? '#ffffff' : '#8f96a3');
    }),
  );
}

// ---------- Pantry ----------
export const counter = () =>
  sprite(80, 24, (r) => {
    r(0, 6, 80, 18, '#c9a27a'); r(0, 4, 80, 4, '#ececec'); r(0, 4, 80, 1, '#ffffff');
    for (let x = 2; x < 78; x += 16) { r(x, 10, 14, 12, '#b78f68'); r(x + 6, 14, 2, 3, '#7a5a3a'); }
    r(30, 4, 14, 3, '#9aa0ad'); r(36, 0, 2, 4, '#9aa0ad'); r(36, 0, 4, 1, '#9aa0ad');
    r(6, 0, 5, 4, '#e74c3c'); r(60, 0, 8, 4, '#f39c12');
  });
export const coffeeMachine = () =>
  sprite(16, 26, (r) => {
    r(0, 10, 16, 16, '#c9a27a'); r(0, 8, 16, 3, '#ececec');
    r(2, 0, 12, 12, '#2b2f3a'); r(3, 1, 10, 3, '#c0392b'); r(10, 5, 2, 1, '#50fa7b');
    r(5, 6, 6, 4, '#111'); r(6, 7, 4, 3, '#6b3e1e');
  });
export const fridge = () =>
  sprite(16, 32, (r) => {
    r(0, 0, 16, 32, '#e6ebf0'); r(0, 0, 16, 1, '#ffffff'); r(0, 11, 16, 1, '#b8c0c8');
    r(12, 3, 2, 6, '#9aa0ad'); r(12, 14, 2, 10, '#9aa0ad');
    r(3, 15, 4, 4, '#ffd166'); r(4, 20, 3, 3, '#6fd3ff');
  });
export const vending = () =>
  sprite(16, 32, (r) => {
    r(0, 0, 16, 32, '#c0392b'); r(0, 0, 16, 2, '#e05a4a');
    r(2, 4, 9, 18, '#2b2f3a');
    const c = ['#ffd166', '#6fd3ff', '#8cff8a', '#ff6fa8'];
    for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) r(3 + x * 3, 5 + y * 4, 2, 3, c[(x + y) % 4]);
    r(12, 6, 2, 6, '#ececec'); r(2, 25, 9, 4, '#111');
  });
export const arcade = () =>
  sprite(16, 32, (r) => {
    r(0, 0, 16, 32, '#5b2c83'); r(0, 0, 16, 3, '#ff6fa8');
    r(2, 5, 12, 10, '#111'); r(3, 6, 10, 8, '#2d6cdf'); r(5, 9, 2, 2, '#ffe06f'); r(9, 8, 2, 2, '#ff6fa8');
    r(0, 16, 16, 4, '#7d3fb3'); r(4, 15, 1, 2, '#111'); r(3, 14, 3, 1, '#e74c3c'); r(9, 17, 2, 1, '#50fa7b'); r(12, 17, 2, 1, '#ffd166');
    r(2, 22, 12, 8, '#4a2370'); r(6, 25, 4, 2, '#ffd166');
  });
export const diningTable = () =>
  sprite(32, 40, (r) => {
    r(0, 6, 32, 26, '#d9b48a'); r(0, 6, 32, 1, '#ecd0ad'); r(0, 30, 32, 4, '#b08a62');
    r(3, 34, 2, 6, '#8a6446'); r(27, 34, 2, 6, '#8a6446');
    // 4 phần cơm
    for (const [x, y] of [[3, 9], [19, 9], [3, 20], [19, 20]]) {
      r(x, y, 10, 8, '#ffffff'); r(x + 2, y + 2, 6, 4, '#f6e7c1'); r(x + 3, y + 3, 3, 2, '#c0392b'); r(x + 6, y + 2, 2, 2, '#2ecc71');
    }
  });

// Danh mục texture → hàm vẽ
export const FURNITURE_ART = {
  'desk-code': () => desk('code'),
  'desk-design': () => desk('design'),
  'desk-test': () => desk('test'),
  'desk-chart': () => desk('chart'),
  'desk-terminal': () => desk('terminal'),
  'desk-off': () => desk('off'),
  'chair-desk': chairDesk,
  'chair-meet': chairMeet,
  'chair-meet-back': chairMeetBack,
  'chair-stool': stool,
  plant,
  'plant-big': plantBig,
  bookshelf,
  water: waterCooler,
  printer,
  'sofa-blue': sofa('#3b6fd1'),
  'sofa-red': sofa('#c0392b'),
  'sofa-green': sofa('#2e8b57'),
  armchair,
  'coffee-table': coffeeTable,
  'rug-work': rug(112, 80, '#c0533a', '#e9a23b'),
  'rug-dance': rug(240, 144, '#2b1d3d', '#c39bff'),
  window: windowSprite,
  whiteboard,
  clock,
  'poster-ship': posterShip,
  tv,
  'sign-server': signServer,
  banner,
  balloons,
  'menu-board': menuBoard,
  'meeting-table': meetingTable,
  rack,
  'dj-booth': djBooth,
  speaker,
  buffet,
  'disco-ball': discoBall,
  counter,
  coffee: coffeeMachine,
  fridge,
  vending,
  arcade,
  'dining-table': diningTable,
};
