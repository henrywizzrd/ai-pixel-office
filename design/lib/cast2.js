// =====================================================================
//  DÀN NHÂN VẬT v2 (khung chibi 3/4). Lớp phủ neo ở góc trên trái khung 20×38.
//  Ký hiệu lớp phủ: i I j tóc (sáng/vừa/tối) · x X z phụ kiện · '_' xoá pixel
// =====================================================================
(function (global) {
  const TOP = 19;   // hàng đầu tiên của thân (đã tính 3 hàng đệm)

  // khoảng thân áo trên 1 hàng: [đầu, cuối]
  function torsoSpan(row) {
    let a = -1, b = -1;
    for (let x = 0; x < row.length; x++) if ('Ttu'.includes(row[x])) { if (a < 0) a = x; b = x; }
    return [a, b];
  }

  // ---------------- ÔNG SẾP ----------------
  const BOSS = {
    fat: true, fatAmount: 3,
    eyes: ['#3a2418', '#6a4430'],
    hair: ['#d0c8c0', '#a8a098', '#7a7068'],
    top: ['#3e4a6a', '#323d5a', '#26304a'],
    sleeve: ['#46527a', '#3a4566', '#2a3350'],
    pants: ['#3a3640', '#2e2a34', '#24212a'],
    shoes: ['#7a4430', '#55301e'],
    detail(region, x, y, dir, shade, row) {
      if (region === 'top' && dir === 'se') {
        const [a, b] = torsoSpan(row);
        const mid = Math.round(a + (b - a) * 0.58);
        const ty = y - (TOP - 3);
        if (ty >= 1 && ty <= 6 && x === mid) return '#c0392b';          // cà vạt
        if (ty >= 1 && ty <= 5 && x === mid + 1) return '#8a2a20';
        if (Math.abs(x - mid) <= (ty < 2 ? 1 : 3)) return shade ? '#d6cdbf' : '#f4efe6';   // sơ mi + bụng
      }
      if (region === 'pants' && y === TOP - 3 + 8) return '#1c1214';     // thắt lưng
      return null;
    },
    overlay: {
      se: [
        '....................',
        '....................',
        '.........IIi........',
        '........I...I.......',
        '.......I..I.........',
        '....................',
        '....................',
        '....................',
        '..IIi...............',
        '..IIii..............',
        '..IIi....II....II...',
        '..jI................',
        '..jI................',
        '....................',
        '.............IIIII..',
        '.............I...I..',
      ],
      ne: [
        '....................',
        '....................',
        '.........IIi........',
        '........I...I.......',
        '.......I..I.........',
        '....................',
        '....................',
        '....................',
        '..IIi...........iI..',
        '..IIii.........iiI..',
        '..IIiii.......iiIIj.',
        '..jIIiiiiiiiiiiIIj..',
        '...jIIIiiiiiiiIIj...',
        '....jjIIIIIIIIjj....',
      ],
    },
  };

  // ---------------- DEV ----------------
  const DEV = {
    eyes: ['#1c1214', '#4a7ab8'],
    hair: ['#7a4a2e', '#5a321e', '#2e1a10'],
    acc: ['#24242c', '#c0392b', '#ffffff'],
    top: ['#e0a83a', '#c08a2a', '#946620'],
    sleeve: ['#e0a83a', '#c08a2a', '#946620'],
    pants: ['#4a6a9a', '#3a5682', '#2c4266'],
    shoes: ['#f4efe6', '#c0392b'],
    detail(region, x, y, dir, shade, row) {
      if (region === 'top' && dir === 'se') {
        const [a, b] = torsoSpan(row);
        const mid = Math.round(a + (b - a) * 0.58);
        const ty = y - (TOP - 3);
        if ((x === mid - 1 || x === mid + 1) && ty >= 1 && ty <= 3) return '#f4efe6';     // dây rút
        if (ty >= 5 && ty <= 6 && Math.abs(x - mid) <= 2) return ty === 5 ? '#c08a2a' : '#946620';   // túi
      }
      if (region === 'top' && dir === 'ne') {
        const ty = y - (TOP - 3);
        if (ty <= 1) return shade ? '#946620' : '#c08a2a';                                  // mũ hoodie sau gáy
      }
      return null;
    },
    overlay: {
      se: [
        '......j...jj........',
        '.....jIj.jIIj.j.....',
        '....jIIjjIIIIjIj....',
        '...jIIIIIIIIIIIIj...',
        '..jIIiIIxxxxxIIIIj..',
        '..jIiixxIIIIIxxIIIj.',
        '.jIIixIIIIIIIIIxIIj.',
        '.jIIIIIIIIIIIIIIIIIj',
        '.jIIIjIIIIjIIIIjIIIj',
        '.jIIj.jIIj.jIIj.jIj.',
        '..jxxx.jj...jj..jj..',
        '..xXXx..............',
        '..xXXx..............',
        '..jxx...............',
      ],
      ne: [
        '......j...jj........',
        '.....jIj.jIIj.j.....',
        '....jIIjjIIIIjIj....',
        '...jIIIIIIIIIIIIj...',
        '..jIIiIIxxxxxIIIIj..',
        '..jIiixxIIIIIxxIIIj.',
        '.jIIixIIIIIIIIIxIIj.',
        '.jIIIIIIIIIIIIIIIIIj',
        '.jIIIIiIIIIIIiIIIIIj',
        '.jIIIIIIIIIIIIIxxxj.',
        '.jIIIIIIIIIIIIxXXx..',
        '.jIIIIIIIIIIIIxXXx..',
        '..jIIIIIIIIIIIjxx...',
        '...jIIIIIIIIIIIj....',
        '....jjIiIIiIjjj.....',
        '......jjjjjj........',
      ],
    },
  };

  global.CAST2 = { boss: BOSS, dev: DEV };
})(typeof window !== 'undefined' ? window : globalThis);
