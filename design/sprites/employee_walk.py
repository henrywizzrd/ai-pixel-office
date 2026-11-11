"""EMPLOYEE đi bộ — lấy nguyên 4 góc chéo trong bộ 8 góc Tyson vẽ (employee-8-angles.aseprite),
chỉ thêm chuyển động tối thiểu để giữ nguyên nét:
  · bước: rút ngắn 2 hàng ở đầu gối 1 ống chân → bàn chân nhấc lên, hông giữ nguyên
  · nhún: bỏ 1 hàng ở hông → thân hạ 1 px
Chu kỳ 4 frame: [nhấc chân trái, nhún, nhấc chân phải, nhún].
Hướng iso: xp = đi xuống-phải (mặt trước 3/4 phải) · yp = xuống-trái · xm = lên-trái (lưng) · ym = lên-phải (lưng)
Chạy: python design/sprites/employee_walk.py → out/employee-walk.aseprite, out/employee-walk.gif, ../lib/employee-sprites.js
"""
import json, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage
from aseprite_io import read_ase, write_ase

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'
SRC = HERE.parent / 'style' / 'tyson-models' / 'employee-8-angles.aseprite'


def cells():
    """→ danh sách 8 ảnh RGBA đã cắt sát, theo thứ tự đọc (hàng trên → dưới, trái → phải)"""
    w, h, fr, _ = read_ase(SRC)
    a = np.array(Image.frombytes('RGBA', (w, h), fr[0]))
    lab, _ = ndimage.label(ndimage.binary_dilation(a[:, :, 3] > 0, iterations=2))
    objs = sorted(ndimage.find_objects(lab), key=lambda s: (s[0].start // 60, s[1].start))
    out = []
    for s in objs:
        sub = a[s]
        ys, xs = np.nonzero(sub[:, :, 3])
        out.append(sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy())
    return out


C = cells()
# thứ tự trong sheet: 0 trước · 1 3/4 trước (quay phải) · 2 ngang · 3 3/4 sau (quay trái) · 4 sau · 5 3/4 sau (quay phải) · 6 ngang · 7 3/4 trước (quay trái)
DIAG = {'xp': C[1], 'yp': C[7], 'xm': C[3], 'ym': C[5]}


def leg_split(img, legs_h=15):
    """cột chia 2 ống chân: cột gần giữa có nhiều ô trống nhất trong vùng chân"""
    H, W = img.shape[:2]
    reg = img[H - legs_h:H - 3, :, 3] == 0
    mid = W // 2
    best = max(range(mid - 4, mid + 5), key=lambda x: (reg[:, x].sum(), -abs(x - mid)))
    return best


def lift(img, side, legs_h=15, dy=2):
    """nhấc 1 ống chân (side 'L' | 'R'): xoá dy hàng ở đầu gối của nửa đó, phần dưới dịch lên"""
    H, W = img.shape[:2]
    sp = leg_split(img, legs_h)
    out = img.copy()
    cols = slice(0, sp) if side == 'L' else slice(sp, W)
    knee = H - legs_h // 2 - 1
    part = img[:, cols].copy()
    new = np.concatenate([part[:knee - dy], part[knee:], np.zeros((dy, part.shape[1], 4), np.uint8)], axis=0)
    # giữ phần trên hông như cũ, chỉ thay vùng chân
    top = H - legs_h
    out[top:, cols] = new[top:]
    return out


def bob(img, legs_h=15):
    """thân hạ 1 px: bỏ 1 hàng ở hông, thêm 1 hàng trống trên đầu"""
    H = img.shape[0]
    hip = H - legs_h
    return np.concatenate([np.zeros((1,) + img.shape[1:], np.uint8), img[:hip - 1], img[hip:]], axis=0)


def cycle(img):
    return [lift(img, 'L'), bob(img), lift(img, 'R'), bob(img)]


WALK = {d: cycle(im) for d, im in DIAG.items()}


def pack(frames):
    """RGBA → lưới ký tự + bảng màu (cho trang HTML)"""
    cols = {}
    rows_all = []
    for f in frames:
        rows = []
        for y in range(f.shape[0]):
            r = ''
            for x in range(f.shape[1]):
                p = f[y, x]
                if p[3] == 0: r += '.'; continue
                hx = '#%02x%02x%02x' % tuple(p[:3])
                if hx not in cols: cols[hx] = len(cols)
                r += chr(0x30 + cols[hx]) if cols[hx] < 0x7e - 0x30 else chr(0xa1 + cols[hx])
            rows.append(r)
        rows_all.append(rows)
    sym = {}
    for hx, i in cols.items():
        sym[chr(0x30 + i) if i < 0x7e - 0x30 else chr(0xa1 + i)] = hx
    return {'pal': sym, 'w': max(f.shape[1] for f in frames), 'frames': rows_all}


if __name__ == '__main__':
    order = ['xp', 'yp', 'xm', 'ym']
    frames, tags = [], []
    for d in order:
        tags.append((d, len(frames), len(frames) + 3))
        for f in WALK[d]:
            c = Image.new('RGBA', (64, 64))
            c.alpha_composite(Image.fromarray(f), ((64 - f.shape[1]) // 2, 61 - f.shape[0]))
            frames.append(c)
    write_ase(OUT / 'employee-walk.aseprite', 64, 64, [f.tobytes() for f in frames], tags=tags, layer='Employee', duration=150)
    gif = []
    for k in range(4):
        g = Image.new('RGBA', (256, 64), (222, 226, 236, 255))
        for i in range(4): g.alpha_composite(frames[i * 4 + k], (i * 64, 0))
        gif.append(g.resize((1024, 256), Image.NEAREST).convert('RGB'))
    gif[0].save(OUT / 'employee-walk.gif', save_all=True, append_images=gif[1:], duration=150, loop=0)
    strip = Image.new('RGBA', (256, 256), (222, 226, 236, 255))
    for i, f in enumerate(frames): strip.alpha_composite(f, ((i % 4) * 64, (i // 4) * 64))
    strip.resize((768, 768), Image.NEAREST).save(OUT / 'employee-walk-sheet.png')
    data = {d: pack(WALK[d] + [DIAG[d]]) for d in order}   # frame 0–3 đi, frame 4 đứng yên
    (HERE.parent / 'lib' / 'employee-sprites.js').write_text(
        '// Sinh tự động bởi design/sprites/employee_walk.py — không sửa tay\nwindow.EMPLOYEE = ' + json.dumps(data, ensure_ascii=False) + ';\n',
        encoding='utf-8')
    print('ok', {d: len(data[d]['pal']) for d in data})
