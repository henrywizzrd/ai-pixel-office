"""Tiện ích đọc model Tyson (.aseprite) thành lưới ký tự + bảng màu, và ghi lại."""
import pathlib
from PIL import Image
from aseprite_io import read_ase, write_ase

STYLE = pathlib.Path(__file__).parent.parent / 'style' / 'tyson-models'
SYM = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&*+-<>?@^~'


def load(name):
    """→ (rows: list[str] đã crop sát, pal: {sym: '#hex'} xếp theo độ sáng, bbox)"""
    w, h, fr, _ = read_ase(STYLE / f'{name}.aseprite')
    im = Image.frombytes('RGBA', (w, h), fr[0])
    bb = im.getbbox(); im = im.crop(bb)
    cols = sorted({im.getpixel((x, y))[:3] for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3]},
                  key=sum)
    m = {c: SYM[i] for i, c in enumerate(cols)}
    rows = [''.join(m[im.getpixel((x, y))[:3]] if im.getpixel((x, y))[3] else '.' for x in range(im.width))
            for y in range(im.height)]
    return rows, {m[c]: '#%02x%02x%02x' % c for c in cols}, bb


def to_image(rows, pal, size=(64, 64), feet_y=60):
    """đặt lưới vào canvas, chân chạm hàng feet_y, căn giữa ngang"""
    W = max(len(r) for r in rows)
    im = Image.new('RGBA', size, (0, 0, 0, 0))
    ox, oy = (size[0] - W) // 2, feet_y - len(rows) + 1
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != '.':
                h = pal[ch]; im.putpixel((ox + x, oy + y), tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return im


def show(rows):
    for i, r in enumerate(rows): print('%2d %s' % (i, r))
