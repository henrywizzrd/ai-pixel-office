"""SẾP — dựng từ model office-worker của Tyson (giữ nguyên nét, viền, cách đổ bóng):
  · đầu hói bóng, vài cọng tóc trên đỉnh, tóc hai bên mai, ria mép
  · người béo: nới thân + chân thêm 2–4 cột, bụng nhô
  · vest nâu, cà vạt đỏ đô (giữ), sơ mi trắng (giữ)
Chạy: python design/sprites/boss_tyson.py  → out/boss-tyson.aseprite / .png
"""
from tyson_grid import load, to_image, show
from aseprite_io import write_ase
import pathlib

OUT = pathlib.Path(__file__).parent / 'out'

rows, pal, _ = load('office-worker')
W = len(rows[0])

# --- màu: vest xanh → nâu; thêm màu đầu hói ---
pal.update({
    '1': '#1e0d06',   # viền vest
    '3': '#3a2012',   # vest tối
    '5': '#55311c',   # vest vừa
    '6': '#734628',   # vest gốc
    'x': '#a8786a',   # viền đầu hói
    'y': '#ffe2d2',   # vệt bóng đầu hói
})

# --- đầu hói (hàng 0–8 thay mới; từ hàng 9 giữ mặt gốc) ---
HEAD = [
    ".......x2xx2xx.........",
    ".....xxc2cc2cccxx......",
    "....xcccccccccyycx.....",
    "...xbcccccccccyycx.....",
    "...xbccccccccccccx.....",
    "..x7bccccccccccc7x.....",
    "..2474ccccccccc4742....",
    "..2474ccccccccc4442....",
    "..2472ccccccccc2442....",
]
for i, r in enumerate(HEAD):
    assert len(r) == W, (i, len(r))
    rows[i] = r
rows[14] = "....7ccc7777cccc24....."   # ria mép (2 hàng: trên sáng, dưới tối)
rows[15] = ".....2cc4444ccc4......."
assert len(rows[14]) == W and len(rows[15]) == W

# --- béo: chèn cột vào thân/chân (chọn ô màu nền gần vị trí đích để không nhân đôi viền) ---
OUTL = set('01.')


def widen(r, target, span=3):
    for d in range(span + 1):
        for c in (target + d, target - d):
            if 0 < c < len(r) and r[c] not in OUTL and r[c - 1] not in OUTL:
                return r[:c] + r[c] + r[c:]
    return r[:target] + '.' + r[target:]


NECK = 18
out = []
for y, r in enumerate(rows):
    if y < NECK:
        out.append('..' + r + '..')                    # đầu giữ nguyên, căn giữa
    elif y < 40:                                       # thân: +4 cột (bụng)
        k = 2 if 25 <= y <= 37 else 1
        rr = r
        for _ in range(k):
            rr = widen(rr, 6)
            rr = widen(rr, len(rr) - 7)
        pad = (W + 4 - len(rr)) // 2
        out.append('.' * pad + rr + '.' * (W + 4 - len(rr) - pad))
    elif y < 50:                                       # chân: +2 cột
        rr = widen(widen(r, 6), 16)
        out.append('.' + rr + '.')
    else:                                              # gấu quần + giày: chèn cột cố định
        rr = r[:6] + r[5] + r[6:]
        rr = rr[:17] + rr[16] + rr[17:]
        out.append('.' + rr + '.')
rows = out

if __name__ == '__main__':
    show(rows)
    im = to_image(rows, pal)
    used = sorted({ch for r in rows for ch in r if ch != '.'})
    write_ase(OUT / 'boss-tyson.aseprite', 64, 64, [im.tobytes()], tags=[('xuong', 0, 0)],
              palette=[tuple(int(pal[c][i:i + 2], 16) for i in (1, 3, 5)) + (255,) for c in used], layer='Sep')
    im.save(OUT / 'boss-tyson.png')
