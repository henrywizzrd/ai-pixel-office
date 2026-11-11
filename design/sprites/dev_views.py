"""DEV — 4 hướng + bước đi, dựng từ model dev.aseprite của Tyson.
  xuong : bản gốc của Tyson (3/4 trước)
  len   : sinh từ bản gốc (lật gương, mặt → tóc gáy, mặt trước áo → lưng áo + mũ hoodie)
  phai  : vẽ tay theo nét Tyson (dev_side.txt), trai = lật gương
Bước đi: 4 frame/hướng [bước trái, đứng, bước phải, đứng] — nhấc chân, nhún người 1px.
Chạy: python design/sprites/dev_views.py → out/dev-4dir.aseprite (16 frame, tag theo hướng) + PNG
"""
import pathlib
from PIL import Image
from tyson_grid import load, to_image
from aseprite_io import write_ase

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'

FRONT, PAL, _ = load('dev')
W = max(len(r) for r in FRONT)
FRONT = [r.ljust(W, '.') for r in FRONT]
HAIR = set('2569ce')


def grid(rows):
    return [list(r) for r in rows]


def rows_of(g):
    return [''.join(r) for r in g]


def mirror(rows):
    w = max(len(r) for r in rows)
    return [r.ljust(w, '.')[::-1] for r in rows]


# ---------------------------------------------------------------- LƯNG
def make_back():
    g = grid(FRONT)
    src = grid(FRONT)
    # 1) đầu: mọi pixel không phải tóc trong hàng 0–15 → vân tóc lấy từ hàng 2–7 cùng cột
    for y in range(0, 16):
        xs = [x for x in range(W) if g[y][x] != '.']
        if not xs: continue
        x0, x1 = min(xs), max(xs)
        for x in range(x0, x1 + 1):
            if g[y][x] == '.': continue
            if x in (x0, x1): g[y][x] = '2'; continue
            if g[y][x] not in HAIR or g[y][x] == '2':
                ty = 2 + (y + x) % 6
                t = src[ty][x] if src[ty][x] in HAIR and src[ty][x] != '2' else 'e'
                g[y][x] = t
    # 2) gáy + cổ
    g[15] = list('.....2e5e5e6e5e2..'.ljust(W, '.'))
    g[16] = list('......9rrrrrr9....'.ljust(W, '.'))
    g[17] = list('......9orrrro9....'.ljust(W, '.'))
    # 3) thân: phủ vân hoodie lên vùng thân (cột 5–17), bỏ dây rút / túi / laptop nằm giữa thân và tay
    for y in range(18, 40):
        for x in range(5, 18):
            c = g[y][x]
            if c == '.': continue
            if c in '3' and (x in (5,) or y in (39,)): continue
            # nền vải: trái tối → phải sáng (sau khi lật gương sẽ khớp hướng sáng), lốm đốm thưa như bản gốc
            base = 'g' if x < 8 else 'j' if x < 13 else 'k'
            n = (x * 7 + y * 5) % 11
            g[y][x] = ('f' if base == 'g' else 'g') if n == 0 else ('j' if base == 'k' else 'k') if n == 5 else base
        if 33 <= y <= 38: g[y][11] = 'f' if y % 2 else 'g'      # nếp gấp lưng
    # 4) mũ hoodie gấp sau gáy
    HOOD = ["....3333333....",
            "...3gjjjjjjg3..",
            "...3fgjjjjgf3..",
            "....3fggggf3...",
            ".....33333....."]
    for j, r in enumerate(HOOD):
        for i, c in enumerate(r):
            if c != '.': g[18 + j][3 + i] = c
    # 5) đường viền mép thân
    for y in range(20, 40):
        if g[y][4] not in '.': g[y][4] = '3' if g[y][4] not in 'trob9' else g[y][4]
    return mirror(rows_of(g))


BACK = make_back()
SIDE = [r for r in (HERE / 'dev_side.txt').read_text().split('\n') if r]


# ---------------------------------------------------------------- BƯỚC ĐI
def lift_leg(rows, x0, x1, top, dy=2):
    """nhấc 1 ống chân (cột x0..x1, từ hàng top tới đáy) lên dy px"""
    g = grid([r.ljust(W + 4, '.') for r in rows])
    H = len(g)
    block = [[g[y][x] for x in range(x0, x1 + 1)] for y in range(top, H)]
    for y in range(top, H):
        for x in range(x0, x1 + 1): g[y][x] = '.'
    for j, r in enumerate(block):
        for i, c in enumerate(r):
            if c != '.' and 0 <= top + j - dy: g[top + j - dy][x0 + i] = c
    return rows_of(g)


def bob(rows, legs_top):
    """nhún: phần trên (đầu+thân) hạ 1px, chân giữ nguyên"""
    up, low = rows[:legs_top], rows[legs_top:]
    w = max(len(r) for r in rows)
    up = ['.' * w] + up[:-1]
    # hàng cuối của thân đè lên hàng đầu của chân
    merged = [''.join(a if a != '.' else b for a, b in zip(up[-1].ljust(w, '.'), low[0].ljust(w, '.')))]
    return up[:-1] + merged + low[1:] if False else up + low


def walk_front(rows, gap):
    a = lift_leg(rows, 0, gap, 44)
    b = lift_leg(rows, gap + 1, W + 3, 44)
    return [a, bob(rows, 42), b, bob(rows, 42)]


def stride(rows, s):
    """nhìn ngang: bàn chân sau lùi s, chân trước tiến s (lệch dần theo chiều cao ống chân)"""
    g = grid([('..' + r).ljust(W + 6, '.') for r in rows])
    H = len(g)
    out = [list('.' * len(g[0])) for _ in range(H)]
    split = 11 + 2
    for y in range(H):
        k = 0 if y < 44 else round(s * (y - 44) / (H - 44))
        for x, c in enumerate(g[y]):
            if c == '.': continue
            nx = x - k if (y >= 44 and x < split) else x + k if y >= 44 else x
            if 0 <= nx < len(out[0]): out[y][nx] = c
    return rows_of(out)


def walk_side(rows):
    return [stride(rows, 3), ['..' + r for r in bob(rows, 40)], stride(rows, -2), ['..' + r for r in bob(rows, 40)]]


DIRS = {
    'xuong': walk_front(FRONT, 11),
    'len': walk_front(BACK, W - 12),
    'phai': walk_side(SIDE),
}
for d in DIRS:   # cùng 1 hướng: mọi frame cùng độ rộng → không bị xê dịch khi phát
    w = max(len(r) for f in DIRS[d] for r in f)
    DIRS[d] = [[r.ljust(w, '.') for r in f] for f in DIRS[d]]
DIRS['trai'] = [mirror(f) for f in DIRS['phai']]
STAND = {d: DIRS[d][1] for d in DIRS}

if __name__ == '__main__':
    frames, tags = [], []
    for d in ('xuong', 'len', 'phai', 'trai'):
        tags.append((d, len(frames), len(frames) + 3))
        frames += [to_image(f, PAL) for f in DIRS[d]]
    write_ase(OUT / 'dev-4dir.aseprite', 64, 64, [f.tobytes() for f in frames], tags=tags, layer='Dev', duration=150)
    sheet = Image.new('RGBA', (64 * 4, 64 * 4))
    for i, f in enumerate(frames): sheet.paste(f, ((i % 4) * 64, (i // 4) * 64))
    sheet.save(OUT / 'dev-4dir-sheet.png')
    stand = Image.new('RGBA', (64 * 4, 64), (222, 226, 236, 255))
    for i, d in enumerate(('xuong', 'len', 'phai', 'trai')): stand.alpha_composite(to_image(STAND[d], PAL), (i * 64, 0))
    stand.resize((64 * 4 * 5, 64 * 5), Image.NEAREST).save(OUT / 'dev-4dir-stand.png')
    bgs = Image.new('RGBA', sheet.size, (222, 226, 236, 255)); bgs.alpha_composite(sheet)
    bgs.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(OUT / 'dev-4dir-walk.png')
    # GIF xem nhanh: 4 hướng đi cạnh nhau, phóng to x4
    gif = []
    for k in range(4):
        fr = Image.new('RGBA', (64 * 4, 64), (222, 226, 236, 255))
        for i, d in enumerate(('xuong', 'len', 'phai', 'trai')): fr.alpha_composite(to_image(DIRS[d][k], PAL), (i * 64, 0))
        gif.append(fr.resize((64 * 4 * 4, 64 * 4), Image.NEAREST).convert('RGB'))
    gif[0].save(OUT / 'dev-walk.gif', save_all=True, append_images=gif[1:], duration=160, loop=0)
    print('ok', len(frames))
