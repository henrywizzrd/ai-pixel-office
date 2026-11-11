// =====================================================================
//  DÀN NHÂN VẬT — mỗi người = màu đồ + chi tiết + lớp phủ tóc/phụ kiện
//  Lớp phủ: i I j tóc (sáng/vừa/tối), x X z phụ kiện, '.' = giữ nguyên khung
// =====================================================================
(function (global) {
  const CX = 10, TORSO = 18;   // hàng bắt đầu thân

  // ---------------- ÔNG SẾP ----------------
  const BOSS = {
    fat: true, fatAmount: 4,
    eyes: ['#4a2e1e', '#7a5236'],
    hair: ['#c4bab0', '#a49a90', '#7a7068'],                 // tóc bạc
    top: ['#3e4a6a', '#34405e', '#2c3550'],                  // vest xanh than
    sleeve: ['#46527a', '#3e4a6a', '#2c3550'],
    pants: ['#3a3640', '#322e38', '#28252c'],
    shoes: ['#7a4430', '#5a2e1e'],
    detail(region, x, y, dir, shade, row) {
      const ty = y - TORSO;
      if (region === 'top' && dir === 'front') {
        if (ty >= 0 && ty <= 9 && (x === CX || x === CX + 1) && ty < 8) return x === CX ? '#c0392b' : '#8a2a20';    // cà vạt
        if (Math.abs(x - CX) <= (ty < 2 ? 1 : 3)) return shade ? '#d6cdbf' : '#f4efe6';                          // sơ mi + bụng
      }
      if (region === 'top' && dir === 'side') {
        const last = Math.max(row.lastIndexOf('T'), row.lastIndexOf('t'));
        if (x >= last - 2 && x <= last) return x === last - 1 && ty >= 0 && ty < 7 ? '#c0392b' : '#f4efe6';
      }
      if (region === 'pants' && y === TORSO + 11) return Math.abs(x - CX) === 0 && dir !== 'back' ? '#e0b84a' : '#28252c';  // thắt lưng
      return null;
    },
    overlay: {
      front: [
        '.....................',
        '........IIi..........',
        '.......I...II........',
        '..........I..I.......',
        '.....................',
        '.....................',
        '.Ii...............iI.',
        '.Ii...............iI.',
        '.Ij...............jI.',
        '.....................',
        '.....................',
        '.....................',
        '.....................',
        '........IIIII........',
        '.......I.....I.......',
      ],
      back: [
        '.....................',
        '........IIi..........',
        '.......I...II........',
        '..........I..I.......',
        '.....................',
        '.....................',
        '.Ii...............iI.',
        '.Ii...............iI.',
        '.Iii.............iiI.',
        'jIiiiiiiiiiiiiiiiiiIj',
        '.jIIiiiiiiiiiiiiiIIj.',
        '.....................',
        '.....................',
      ],
      side: [
        '.....................',
        '..........IIi........',
        '.........I...I.......',
        '...........I..I......',
        '.....................',
        '..jI.................',
        '..jIi................',
        '..jIii...............',
        '..jIi................',
        '..jI.................',
        '..jI.................',
        '...j.................',
        '.....................',
        '..............IIII...',
        '..............I......',
      ],
    },
  };

  // ---------------- DEV ----------------
  const DEV = {
    eyes: ['#2e1a10', '#5a3a24'],
    hair: ['#6a4430', '#4a2e1e', '#2e1a10'],
    acc: ['#2a2a33', '#c0392b', '#ffffff'],                  // tai nghe: viền đen, đệm đỏ
    top: ['#e0a83a', '#c08a2a', '#9a6a20'],                  // hoodie mù tạt
    sleeve: ['#e0a83a', '#c08a2a', '#9a6a20'],
    pants: ['#4a6a9a', '#3e5a86', '#34507a'],
    shoes: ['#f4efe6', '#c8c0b4'],
    detail(region, x, y, dir, shade) {
      const ty = y - TORSO;
      if (region === 'top' && dir === 'front') {
        if ((x === CX - 1 || x === CX + 1) && ty >= 1 && ty <= 4) return '#f4efe6';                 // dây rút
        if (ty >= 7 && ty <= 8 && Math.abs(x - CX) <= 3) return ty === 7 ? '#c08a2a' : '#9a6a20';   // túi bụng
      }
      if (region === 'top' && dir === 'back' && ty === 0) return '#c08a2a';                            // mũ hoodie
      if (region === 'shoes' && shade === 1) return '#c0392b';                                           // đế giày đỏ
      return null;
    },
    overlay: {
      front: [
        '......jjjjjjjjj......',
        '....xxxxxxxxxxxxx....',
        '...jIIiIIIIIiIIIIj...',
        '..jIIiiIIIIIiiIIIIj..',
        '..jIIIIIIIIIIIIIIIj..',
        '.jIIIIIIIIIIIIIIIIIj.',
        '.jIIIjIIIjIIIjIIIIIj.',
        '.jIj..jI...jI....IIj.',
        'xXj...............jXx',
        'xX.................Xx',
        'xX.................Xx',
        '.x.................x.',
      ],
      back: [
        '......jjjjjjjjj......',
        '....xxxxxxxxxxxxx....',
        '...jIIiIIIIIiIIIIj...',
        '..jIIiiIIIIIiiIIIIj..',
        '..jIIIIIIIIIIIIIIIj..',
        '.jIIIIIIIIIIIIIIIIIj.',
        '.jIIIIiIIIIIIiIIIIIj.',
        '.jIIIIIIIIIIIIIIIIIj.',
        'xXIIIIIIIIIIIIIIIIIXx',
        'xXIIIIIIIIIIIIIIIIIXx',
        'xXjIIIIIIIIIIIIIIIjXx',
        '.xjjIIIIIIIIIIIIIjjx.',
        '...jjIIIIIIIIIIIjj...',
        '....jjjIIIIIIIjjj....',
      ],
      side: [
        '.......jjjjjjj.......',
        '.....jjxxxxxxxjj.....',
        '....jIIiIIIIIiIIj....',
        '...jIIiiIIIIIIiIIj...',
        '...jIIIIIIIIIIIIIj...',
        '..jIIIIIIIIIIIIIIIj..',
        '..jIIIIIIIIIjIIjIIj..',
        '..jIIIIIIIIj.jI..Ij..',
        '..jIIxxxxIIj.........',
        '..jIIxXXxIj..........',
        '..jIIxXXxIj..........',
        '..jjIxxxxj...........',
        '...jjjIIj............',
      ],
    },
  };

  global.CAST = { 'Ông sếp (béo, hói)': BOSS, 'Dev': DEV };
  global.CAST_BY_ID = { boss: BOSS, dev: DEV };
})(typeof window !== 'undefined' ? window : globalThis);
