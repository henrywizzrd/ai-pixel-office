// =====================================================================
//  NHÂN VẬT KIỂU HABBO — vẽ tay từng pixel
//  Viền nâu đen, mặt nhìn chéo 3/4 (mũi nhô ra phía trước), mắt chấm.
//  Hướng mặc định: nhìn chéo xuống-phải. flip = true để nhìn xuống-trái.
//  Mỗi ký tự = 1 pixel, '.' = trong suốt; hàng cuối là chân.
// =====================================================================
(function (global) {
  const PAL = {
    o: '#1e1410',
    // da
    S: '#f5cfa6', s: '#e0a878', d: '#c07e58', c: '#e8907a', e: '#1e1410', g: '#ffffff',
    // tóc sếp (bạc) + ria
    h: '#a49a90', H: '#7a7068', m: '#7a7068',
    // sơ mi, cà vạt, vest, quần, giày
    W: '#f4efe6', w: '#d6cdbf', T: '#c0392b', t: '#8a2a20',
    V: '#3e4a6a', v: '#2c3550', L: '#56648a',
    P: '#3a3640', p: '#28252c', B: '#28252c', Y: '#e0b84a', K: '#5a2e1e', k: '#7a4430',
    // dev: tóc nâu, hoodie mù tạt, quần jean, giày trắng, tai nghe
    r: '#4a2e1e', R: '#2e1a10', A: '#d99a3a', a: '#a8702a', Z: '#f4efe6',
    J: '#4a6a9a', j: '#34507a', N: '#f4efe6', n: '#c8c0b4', X: '#2a2a33', x: '#c0392b',
  };

  // Ông sếp: béo, hói bóng, vài cọng tóc vểnh, tóc mai bạc, ria mép, vest xanh than, cà vạt đỏ
  const BOSS = {
    cx: 12,
    rows: [
      '............hh..........',
      '...........h............',
      '........ooooHoo.........',
      '......ooSSgSHSSoo.......',
      '.....oSSggSHSSHSSo......',
      '....oSSSSSSSSSSSSSo.....',
      '....ohhSSSSSSSSSSSo.....',
      '...ohhhSSSSSSHHSSHHo....',
      '...ohhSddSSSSSSSSSSo....',
      '...ohSdSdSSSSSeSSSeo....',
      '...ohSddSSSSSSeSSSeSo...',
      '....ohSSSSSSSScSSSsSSo..',
      '....oSSSSSSSSSmmmmmsso..',
      '.....oSSSSSSSSmSSSmso...',
      '.....osSSSSSSSSSSSSso...',
      '......oossssssssssoo....',
      '......ooVVWWTWWVVoo.....',
      '.....oLVVVWWTTWWVVvo....',
      '....oLLVVVWWTtWWWVVvo...',
      '...oLLVVVWWWTtWWWWVVvo..',
      '...oLVoVVWWWTtWWWWWVvvo.',
      '...oLVoVWWWWTtWWWWWWvvo.',
      '...oLVoVWWWWWtWWWWWWwvo.',
      '...oLVoVWWWWWWWWWWWWwvo.',
      '...oLVoVWWWWWWWWWWWwwvo.',
      '...oSSoVVWWWWWWWWWwwvSSo',
      '...oSsoVVVWWWWWWWwwvvSso',
      '....oo.oVBBBBBYYBBBBvoo.',
      '........oPPPPPoPPPPpo...',
      '........oPPPPPoPPPPpo...',
      '........oPPPPPoPPPPpo...',
      '........oPPPPPoPPPPpo...',
      '........oPPPPPoPPPPpo...',
      '........oPPPPpooPPPpo...',
      '........oPPPPpooPPPpo...',
      '........oPPPPpooPPPpo...',
      '........oPPPPpooPPPpo...',
      '.......okkkkkko.okkkkko.',
      '.......oKKKKKKKooKKKKKKo',
      '.......oooooooo.ooooooo.',
    ],
  };

  // Dev: tóc nâu rối, tai nghe đỏ, hoodie mù tạt, quần jean, giày trắng
  const DEV = {
    cx: 11,
    rows: [
      '.......ooooooo..........',
      '.....ooRrrRrrRoo........',
      '....oRrrrrrrrrrRo.......',
      '...oRrrrrrrrrrrrRo......',
      '...oRrrrrrrrrrrrrRo.....',
      '..oRrrrrRrrrrRrrrrRo....',
      '..oRrrrSSSSrrSSSSrro....',
      '..oXrrSSSSSSSSSSSSSo....',
      '.oXXrSddSSSSSSSSSSSo....',
      '.oXxXSdSdSSSSeSSSeSo....',
      '.oXXXSddSSSSSeSSSeSSo...',
      '..oXrSSSSSSSSSSSSSsSo...',
      '...orSSSSSSSSSSSSsso....',
      '....oSSSSSSSSdddSso.....',
      '.....oossSSSSSSsoo......',
      '.......ossssso..........',
      '.....ooAAAAAAAAoo.......',
      '....oAAAaAAAAAAAAo......',
      '...oAAAoAAAAZAZAAao.....',
      '...oAAAoAAAAZAZAAao.....',
      '...oAAAoAAAAAAAAAao.....',
      '...oAAAoAAAAAAAAAao.....',
      '...oAAAoAAAAAAAAAao.....',
      '...oSSSoAAAAAAAAAaSo....',
      '...oSssoaaaaaaaaaaso....',
      '....oo.oJJJJJoJJJjoo....',
      '.......oJJJJJoJJJjo.....',
      '.......oJJJJJoJJJjo.....',
      '.......oJJJJJoJJJjo.....',
      '.......oJJJJJoJJJjo.....',
      '.......oJJJJjooJJjo.....',
      '.......oJJJJjooJJjo.....',
      '.......oJJJJjooJJjo.....',
      '.......oJJJJjooJJjo.....',
      '.......oJJJJjooJJjo.....',
      '......onnnnnnoonnnno....',
      '......oNNNNNNooNNNNNo...',
      '......oooooooo.oooooo...',
    ],
  };

  function draw(iso, spr, fx, fy, { flip = false, pal = PAL } = {}) {
    iso.blob(fx + (flip ? -1 : 1), fy, 9, 3, '#1e1410');
    iso.commit(null, 0.25);
    const n = spr.rows.length;
    spr.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        const dx = x - spr.cx;
        iso.put(fx + (flip ? -dx : dx), fy - (n - 1 - y), pal[ch] || '#ff00ff');
      }
    });
    iso.commit(null);
  }

  global.People = { draw, BOSS, DEV, PAL };
})(typeof window !== 'undefined' ? window : globalThis);
