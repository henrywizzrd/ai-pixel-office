"""Bộ vẽ chung cho asset theo nét Greg: viền đen 1px, màu phẳng, ít đổ bóng.
Góc nhìn top-down 3/4: thấy mặt trên (rút ngắn) + mặt trước.
"""
import pathlib
from PIL import Image
from aseprite_io import write_ase

OUT = pathlib.Path(__file__).parent / 'out'; OUT.mkdir(exist_ok=True)
OL = '#10141f'


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h and c:
            self.im.putpixel((x, y), rgb(c) + (255,))

    def rect(self, x, y, w, h, c):
        for j in range(h):
            for i in range(w):
                self.px(x + i, y + j, c)

    def box(self, x, y, w, h, fill, hi=None, lo=None):
        """khối có viền; hi = vệt sáng hàng trên, lo = vệt tối hàng dưới"""
        self.rect(x, y, w, h, OL)
        self.rect(x + 1, y + 1, w - 2, h - 2, fill)
        if hi: self.rect(x + 1, y + 1, w - 2, 1, hi)
        if lo: self.rect(x + 1, y + h - 2, w - 2, 1, lo)

    def hline(self, x, y, w, c): self.rect(x, y, w, 1, c)
    def vline(self, x, y, h, c): self.rect(x, y, 1, h, c)


def export(name, size, items, bg=(168, 181, 178, 255), zoom=6):
    """items: [(tag, Canvas)] → out/<name>.aseprite (mỗi item 1 frame + tag), <name>-sheet.png, <name>-preview.png"""
    W, H = size
    frames = []
    for _, cv in items:
        f = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        f.alpha_composite(cv.im, ((W - cv.w) // 2, H - cv.h - 2))
        frames.append(f)
    write_ase(OUT / f'{name}.aseprite', W, H, [f.tobytes() for f in frames],
              tags=[(t, i, i) for i, (t, _) in enumerate(items)], layer=name)
    sheet = Image.new('RGBA', (W * len(frames), H))
    for i, f in enumerate(frames): sheet.paste(f, (i * W, 0))
    sheet.save(OUT / f'{name}-sheet.png')
    prev = Image.new('RGBA', sheet.size, bg); prev.alpha_composite(sheet)
    prev.resize((sheet.width * zoom, sheet.height * zoom), Image.NEAREST).save(OUT / f'{name}-preview.png')
    return frames
