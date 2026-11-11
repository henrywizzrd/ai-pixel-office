"""EMPLOYEE đi bộ v2 — dựa trên chu kỳ đi Tyson vẽ (walking-employee.aseprite, mặt 3/4 trước quay trái).
Cải thiện:
  1. Chọn 6 frame cùng 1 góc nhìn (3,4,5,9,10,11). Bản gốc xen kẽ frame 3/4 và frame gần nghiêng
     (6–8, 12–13) nên thân bị vặn qua lại khi chạy.
  2. Cố định đầu: căn đầu từng frame về cùng vị trí ngang → không bị lắc ngang.
  3. Mặt đất cố định: chân thấp nhất luôn chạm hàng 60 (không trồi/lún).
  4. Giữ nhịp nhún có sẵn trong nét vẽ (bước dài hạ 1 px).
  6. Xoá viền trắng sót lại từ layer nền.
  5. Dựng 3 hướng còn lại: lật gương = xuống-phải; 2 hướng lưng = thân trên từ bộ 8 góc + chân lấy từ chu kỳ đi.
Hướng iso: xp xuống-phải · yp xuống-trái (bản gốc) · xm lên-trái (lưng) · ym lên-phải (lưng)
Chạy: python design/sprites/employee_walk2.py
"""
import json, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage
from aseprite_io import read_ase, write_ase
import employee_walk as v1

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'
SRC = HERE.parent / 'style' / 'tyson-models' / 'walking-employee.aseprite'
GROUND = 60
LOOP = [3, 4, 5, 9, 10, 11]   # 6 frame cùng 1 góc 3/4 (bỏ 6–8, 12–13 bị xoay ngang làm thân vặn qua lại)
IDLE = 0
NECK = 18          # hàng cuối của đầu (tính trong canvas 64)
HIP = 47           # từ hàng này trở xuống là chân


def load_frames():
    w, h, fr, _ = read_ase(SRC)
    out = []
    for f in fr:
        a = np.array(Image.frombytes('RGBA', (w, h), f))
        white = (a[:, :, :3] == 255).all(2)          # layer nền trắng → trong suốt (chỉ vùng trắng chạm mép)
        lab, _ = ndimage.label(white)
        edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
        a[np.isin(lab, list(edge)), 3] = 0
        # viền gần trắng sát nền (khử răng cưa với nền trắng) → trong suốt
        for _ in range(2):
            near = (a[:, :, :3] > 225).all(2) & (a[:, :, 3] > 0)
            tr = ndimage.binary_dilation(a[:, :, 3] == 0) & near
            a[tr, 3] = 0
        out.append(a)
    return out


F = load_frames()


def shift(a, dx, dy):
    out = np.zeros_like(a)
    H, W = a.shape[:2]
    ys, xs = slice(max(0, dy), min(H, H + dy)), slice(max(0, dx), min(W, W + dx))
    yd, xd = slice(max(0, -dy), min(H, H - dy)), slice(max(0, -dx), min(W, W - dx))
    out[ys, xs] = a[yd, xd]
    return out


def top_row(a):
    return np.nonzero(a[:, :, 3].any(1))[0].min()


def bottom_row(a):
    return np.nonzero(a[:, :, 3].any(1))[0].max()


def head_dx(a, ref):
    """độ lệch ngang của đầu so với frame mẫu (so khớp vùng đầu)"""
    ta, tr = top_row(a), top_row(ref)
    A = a[ta:ta + 14, :, 3] > 0
    R = ref[tr:tr + 14, :, 3] > 0
    best = min(range(-4, 5), key=lambda d: (np.roll(R, d, axis=1) ^ A).sum())
    return best


REF = F[IDLE]
REF_TOP = top_row(REF)
HEAD = REF[REF_TOP:NECK + 1].copy()          # đầu chuẩn (tóc + mặt) lấy từ frame đứng yên


def stabilize(a, bob=0):
    a = shift(a, -head_dx(a, REF), 0)                       # đầu thẳng hàng
    return shift(a, 0, GROUND - bottom_row(a))              # chân chạm đất


BOBS = [0, 1, 0, 0, 1, 0]                    # bước dài (1) thân hạ 1 px — dùng cho 2 hướng lưng
WALK_YP = [stabilize(F[i].copy()) for i in LOOP]
IDLE_YP = REF.copy()
mirror = lambda a: a[:, ::-1].copy()


def legs_center(a):
    xs = np.nonzero(a[HIP:, :, 3].any(0))[0]
    return (xs.min() + xs.max()) / 2


def back_walk(cell, legs_frames, bobs):
    """thân lưng (từ bộ 8 góc) + chân từ chu kỳ đi"""
    base = np.zeros((64, 64, 4), np.uint8)
    h, w = cell.shape[:2]
    base[GROUND - h + 1:GROUND + 1, (64 - w) // 2:(64 - w) // 2 + w] = cell
    out = []
    for lf, b in zip(legs_frames, bobs):
        body = shift(base, 0, b)
        body[HIP:] = 0
        legs = lf.copy(); legs[:HIP] = 0
        legs = shift(legs, int(round(legs_center(base) - legs_center(lf))), 0)
        m = body[:, :, 3:4] > 0
        out.append(np.where(m, body, legs))
    idle = base
    return out, idle


XM, XM_IDLE = back_walk(v1.C[3], [mirror(f) for f in WALK_YP], BOBS)
YM, YM_IDLE = back_walk(v1.C[5], WALK_YP, BOBS)
WALK = {'xp': [mirror(f) for f in WALK_YP], 'yp': WALK_YP, 'xm': XM, 'ym': YM}
IDLE_F = {'xp': mirror(IDLE_YP), 'yp': IDLE_YP, 'xm': XM_IDLE, 'ym': YM_IDLE}


def crop(a):
    ys, xs = np.nonzero(a[:, :, 3])
    return a[:, xs.min():xs.max() + 1] if len(xs) else a


def pack(frames):
    """các frame cùng hướng → lưới ký tự cùng khung (cắt theo hộp chung) + bảng màu"""
    al = np.zeros((64, 64), bool)
    for f in frames: al |= f[:, :, 3] > 0
    ys, xs = np.nonzero(al)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    cols, rows_all = {}, []
    for f in frames:
        rows = []
        for y in range(y0, y1):
            r = ''
            for x in range(x0, x1):
                p = f[y, x]
                if p[3] == 0: r += '.'; continue
                hx = '#%02x%02x%02x' % tuple(p[:3])
                if hx not in cols: cols[hx] = len(cols)
                r += chr(0x100 + cols[hx])
            rows.append(r)
        rows_all.append(rows)
    return {'pal': {chr(0x100 + i): hx for hx, i in cols.items()}, 'w': int(x1 - x0), 'frames': rows_all}


if __name__ == '__main__':
    order = ['xp', 'yp', 'xm', 'ym']
    frames, tags = [], []
    for d in order:
        tags.append((d, len(frames), len(frames) + len(WALK[d]) - 1))
        frames += WALK[d]
    write_ase(OUT / 'employee-walk-v2.aseprite', 64, 64, [f.tobytes() for f in frames], tags=tags, layer='Employee', duration=120)
    # sheet + gif
    n = len(LOOP)
    sheet = Image.new('RGBA', (64 * n, 64 * 4), (222, 226, 236, 255))
    for r, d in enumerate(order):
        for k, f in enumerate(WALK[d]): sheet.alpha_composite(Image.fromarray(f), (k * 64, r * 64))
    sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(OUT / 'employee-walk-v2-sheet.png')
    gif = []
    for k in range(n):
        g = Image.new('RGBA', (256, 64), (222, 226, 236, 255))
        for i, d in enumerate(order): g.alpha_composite(Image.fromarray(WALK[d][k]), (i * 64, 0))
        gif.append(g.resize((1024, 256), Image.NEAREST).convert('RGB'))
    gif[0].save(OUT / 'employee-walk-v2.gif', save_all=True, append_images=gif[1:], duration=120, loop=0)
    data = {d: pack(WALK[d] + [IDLE_F[d]]) for d in order}       # frame cuối = đứng yên
    (HERE.parent / 'lib' / 'employee-sprites.js').write_text(
        '// Sinh tự động bởi design/sprites/employee_walk2.py — không sửa tay\nwindow.EMPLOYEE = ' + json.dumps(data, ensure_ascii=False) + ';\n',
        encoding='utf-8')
    print('ok', {d: (len(data[d]['frames']), len(data[d]['pal'])) for d in data})
