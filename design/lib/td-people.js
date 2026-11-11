// =====================================================================
//  NHÂN VẬT 2D TOP-DOWN (cỡ RPG Maker, 16×23) — vẽ tay từng pixel
//  Hướng: down (nhìn xuống), up (quay lưng), right (nhìn phải; left = lật gương)
//  Chân dùng chung: idle / bước A / bước B, ghép với phần thân trên của từng hướng.
// =====================================================================
(function (global) {
  const PAL = {
    o: '#3a3a50', S: '#ffd6b0', s: '#eba882', e: '#3a3a50', g: '#ffffff', c: '#f69784',
    // sếp
    h: '#cbcbcb', H: '#a8a8a8', m: '#9e9e9f', W: '#f8f8f8', w: '#d4dee6', T: '#d93232', V: '#4a5a8a', v: '#3a4670',
    P: '#46465e', p: '#3a3a50', K: '#6b4c2c', Y: '#f8d239',
    // dev
    r: '#805449', R: '#5c4a44', A: '#f2b22b', a: '#daa463', J: '#6c95b7', j: '#4d6e9a', N: '#f8f8f8', n: '#cbcbcb', X: '#46465e', x: '#d93232',
  };

  // ----- chân dùng chung (6 hàng cuối), ký tự L/l = quần, F = giày -----
  const LEGS = {
    down: {
      idle: ['..oLLLLLLLLLLo..', '..oLLLLooLLLLo..', '..oLLLo..oLLLo..', '..oLLLo..oLLLo..', '..oFFFo..oFFFo..', '..ooooo..ooooo..'],
      a:    ['..oLLLLLLLLLLo..', '..oLLLLooLLLLo..', '..oLLLo..oLLLo..', '..oFFFo..oLLLo..', '..ooooo..oFFFo..', '.........ooooo..'],
      b:    ['..oLLLLLLLLLLo..', '..oLLLLooLLLLo..', '..oLLLo..oLLLo..', '..oLLLo..oFFFo..', '..oFFFo..ooooo..', '..ooooo.........'],
    },
    right: {
      idle: ['...oLLLLLLLo....', '....oLLLLLo.....', '....oLLLLLo.....', '....oLLLLLo.....', '....oFFFFFFo....', '....oooooooo....'],
      a:    ['...oLLLoLLLo....', '..oLLLo.oLLLo...', '..oLLo...oLLo...', '.oLLo....oLLLo..', '.oFFFo...oFFFFo.', '.ooooo...oooooo.'],
      b:    ['...oLLLLLLLo....', '...oLLLoLLo.....', '..oLLLo.oLLo....', '..oLLo..oLLo....', '.oFFFo..oFFFo...', '.ooooo..ooooo...'],
    },
  };
  LEGS.up = LEGS.down;

  // ----- thân trên từng nhân vật (17 hàng) -----
  const BOSS = {
    legs: { L: 'P', F: 'K' },
    down: [
      '.....oooooo.....',
      '...ooSSgSSSoo...',
      '..oSSggSSSSSSo..',
      '.ohSSSSSSSSSSho.',
      '.ohSSeSSSSeSSho.',
      '.ohSSeSSSSeSSho.',
      '.ohcSSSssSSScho.',
      '..oSSmmmmmmSSo..',
      '..oSSSmSSmSSSo..',
      '...ooSSSSSSoo...',
      '..ooVVWTTWVVoo..',
      '.oVVVVWTTWVVVVo.',
      'oVVVVWWTTWWVVVvo',
      'oSoVVWWWWWWVVoSo',
      'oSoVVWWWWWWVVoso',
      '.ooVVWWWWWWVVoo.',
      '..oPPPPYYPPPPo..',
    ],
    up: [
      '.....oooooo.....',
      '...ooSSSSgSoo...',
      '..oSSSSSSggSSo..',
      '.ohSSSSSSSSSSho.',
      '.ohhSSSSSSSShho.',
      '.ohhhhhhhhhhhho.',
      '.ohhhhhhhhhhhho.',
      '..ohhhhhhhhhho..',
      '..oSSSSSSSSSSo..',
      '...ooSSSSSSoo...',
      '..ooVVVVVVVVoo..',
      '.oVVVVVVVVVVVVo.',
      'oVVVVVVvVVVVVVvo',
      'oSoVVVVvVVVVVoSo',
      'oSoVVVVvVVVVVoso',
      '.ooVVVVVVVVVVoo.',
      '..oPPPPPPPPPPo..',
    ],
    right: [
      '....oooooo......',
      '..ooSSgSSSoo....',
      '.oSSggSSSSSSo...',
      '.ohhSSSSSSSSSo..',
      '.ohhSSSSSSeSSo..',
      '.ohhhSSSSSeSSSo.',
      '.ohhSSSSSSSSSso.',
      '..ohSSSSSSmmmo..',
      '..oSSSSSSSSmo...',
      '...ooSSSSSoo....',
      '...ooVVVVWWo....',
      '..oVVVVVVWWWo...',
      '..oVVSSVVWWWWo..',
      '..oVVSSVVWWWWo..',
      '..oVVVVVVWWWWo..',
      '...oVVVVVWWWo...',
      '...oPPPPPPYPo...',
    ],
  };

  const DEV = {
    legs: { L: 'J', F: 'N' },
    down: [
      '....oooooooo....',
      '...orrRrrRrro...',
      '..orrrrrrrrrro..',
      '.oXrrRrrrrRrrXo.',
      '.oxrSSrSSSrSSxo.',
      '.oxSSeSSSSeSSxo.',
      '.oXSSeSSSSeSSXo.',
      '..oSSSSssSSSSo..',
      '..oSSSSSSSSSSo..',
      '...ooSScSSSoo...',
      '..ooAAAAAAAAoo..',
      '.oAAAAWAAWAAAAo.',
      '.oAAAAWAAWAAAAo.',
      '.oSoAAAAAAAAoSo.',
      '.oSoaaaaaaaaoso.',
      '..ooAAAAAAAAoo..',
      '..oJJJJJJJJJJo..',
    ],
    up: [
      '....oooooooo....',
      '...orrRrrRrro...',
      '..orrrrrrrrrro..',
      '.oXrrrrrrrrrrXo.',
      '.oxrrrRrrrRrrxo.',
      '.oxrrrrrrrrrrxo.',
      '.oXrrrrrrrrrrXo.',
      '..orrrrRrrrrro..',
      '..oSrrrrrrrrSo..',
      '...ooSSSSSSoo...',
      '..ooaAAAAAAaoo..',
      '.oAAAAAAAAAAAAo.',
      '.oAAAAAAAAAAAAo.',
      '.oSoAAAAAAAAoSo.',
      '.oSoaaaaaaaaoso.',
      '..ooAAAAAAAAoo..',
      '..oJJJJJJJJJJo..',
    ],
    right: [
      '....ooooooo.....',
      '...orrrRrrro....',
      '..orrrrrrrrrro..',
      '..orrrrrrrRrro..',
      '.oXXrrrSSrSSSo..',
      '.oxxXrSSSSeSSo..',
      '.oxxXSSSSSeSSSo.',
      '.oXXSSSSSSSSSo..',
      '..orSSSSSSScSo..',
      '...ooSSSSSSoo...',
      '...ooAAAAAAo....',
      '..oAAAAAAAAAo...',
      '..oAASSAAAWAo...',
      '..oAASSAAAAAo...',
      '..oaaaaaaaaao...',
      '...oAAAAAAAo....',
      '...oJJJJJJJo....',
    ],
  };

  function frameRows(who, dir, step) {
    const base = dir === 'left' ? 'right' : dir;
    const legs = LEGS[base][step].map((r) => r.replace(/L/g, who.legs.L).replace(/F/g, who.legs.F));
    return [...who[base], ...legs];
  }

  // Vẽ 1 khung. dir: down | up | left | right ; step: idle | a | b ; seated = chỉ vẽ phần trên (ngồi sau lưng ghế)
  function draw(iso, who, dir, step, fx, fy, { seated = false } = {}) {
    let rows = frameRows(who, dir, step);
    if (seated) rows = rows.slice(0, 12);
    const flip = dir === 'left';
    if (!seated) { iso.blob(fx, fy, 6, 2, '#3a3a50'); iso.commit(null, 0.2); }
    const n = rows.length;
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        const ch = r[x];
        if (ch === '.') continue;
        const dx = x - 8;
        iso.put(fx + (flip ? -dx - 1 : dx), fy - (n - 1 - y), PAL[ch] || '#ff00ff');
      }
    });
    iso.commit(null);
  }

  global.TDPeople = { draw, BOSS, DEV };
})(typeof window !== 'undefined' ? window : globalThis);
