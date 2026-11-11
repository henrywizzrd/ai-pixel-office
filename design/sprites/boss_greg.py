"""SẾP — theo model "Greg 32×32" (chibi đầu to, viền đen 1px, màu phẳng, mắt 2 chấm 1×2, không miệng).
Bộ vest nâu, cà vạt đỏ, tóc nâu đậm hơi hói, ria mép.
Khung 32×32, nhân vật 16×22, chân chạm hàng 30.

Chạy:  python design/sprites/boss_greg.py
Ra:    design/sprites/out/boss.aseprite  (4 frame + tag: xuong / len / phai / trai)
       design/sprites/out/boss-sheet.png (128×32)  ·  boss-preview.png (phóng to x10)
"""
import pathlib
from PIL import Image
from aseprite_io import write_ase

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'; OUT.mkdir(exist_ok=True)

PAL = {
    'o': '#10141f',  # viền (lấy theo Greg)
    's': '#d7b594',  # da
    'g': '#da863e',  # cam: vạch cằm, tai
    'h': '#3b2418',  # tóc nâu đậm
    'H': '#5a3826',  # tóc sáng
    'B': '#7a4c2c',  # vest nâu
    'b': '#5c3820',  # vest nâu tối (ve áo, nếp)
    'w': '#ece6da',  # sơ mi
    'r': '#c8372d',  # cà vạt
    'y': '#e2b04a',  # cúc áo
    'p': '#4a2e1c',  # quần nâu đậm
    'f': '#1c1c28',  # giày
}

FRONT = [
    "....oooooooo....",
    "..oosssshsssoo..",
    ".ohssssssssssho.",
    ".ohhsssssssshho.",
    ".ohhsssssssshho.",
    ".ohssssssssssho.",
    ".ohssossssossho.",
    ".ohssossssossho.",
    ".ohssssssssssho.",
    ".ossshhhhhhssso.",
    ".osssssssssssso.",
    "..oggggggggggo..",
    "..obbbwrrwbbbo..",
    ".oBBbBwrrwBbBBo.",
    ".oBBBBBrrBBBBBo.",
    "oBoBBBBrrBBBBoBo",
    "oBoBBBBBBBBBBoBo",
    "osoBBBByBBBBBoso",
    ".oooppppppppooo.",
    "..oppppooppppo..",
    "..offfo..offfo..",
    "...ooo....ooo...",
]

BACK = [
    "....oooooooo....",
    "..oossssssssoo..",
    ".ossshsssshssso.",
    ".ohssssssssssho.",
    ".ohhhsssssshhho.",
    ".ohhhhhhhhhhhho.",
    ".ohHhhhhhhhhhho.",
    ".ohHhhhhhhhhhho.",
    ".ohhhhhhhhhhhho.",
    ".ohhhhhhhhhhhho.",
    ".ohhhhhhhhhhhho.",
    "..ohhhhhhhhhho..",
    "..oBBBBggBBBBo..",
    ".oBBBBBBBBBBBBo.",
    ".oBBBBBbbBBBBBo.",
    "oBoBBBBbbBBBBoBo",
    "oBoBBBBbbBBBBoBo",
    "osoBBBBBBBBBBoso",
    ".oooppppppppooo.",
    "..oppppooppppo..",
    "..offfo..offfo..",
    "...ooo....ooo...",
]

# 3/4 nhìn sang phải (như Greg nhưng lật hướng): gáy tóc bên trái, mặt bên phải
RIGHT = [
    "....oooooooo....",
    "..oohhsssshsoo..",
    ".ohhhssssssssso.",
    ".ohhhssssssssso.",
    ".ohhhhsssssssso.",
    ".ohhhhsssssssso.",
    ".ohhhgssosssoso.",
    ".ohhhgssosssoso.",
    ".ohhhssssssssgo.",
    ".ohhsssshhhhsso.",
    ".ohssssssssssso.",
    "..oggggggggggo..",
    "..oBBBBBBBwrwo..",
    ".oBBBBBBBBwrwBo.",
    ".oBBBBBBBBBrBBo.",
    "oBoBBBBBBBBBBoBo",
    "oBoBBBBBBBBBBoBo",
    "osoBBBBBBBByBoso",
    ".oooppppppppooo.",
    "...opppo.opppo..",
    "...offfo.offfo..",
    "....ooo...ooo...",
]


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def frame(rows, flip=False):
    im = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        assert len(row) == 16, (y, row, len(row))
        for x, ch in enumerate(row):
            if ch == '.':
                continue
            X = 8 + (15 - x if flip else x)
            im.putpixel((X, 31 - len(rows) + y), hexrgb(PAL[ch]) + (255,))
    return im


if __name__ == '__main__':
    frames = [frame(FRONT), frame(BACK), frame(RIGHT), frame(RIGHT, flip=True)]
    names = ['xuong', 'len', 'phai', 'trai']
    write_ase(OUT / 'boss.aseprite', 32, 32, [f.tobytes() for f in frames],
              tags=[(n, i, i) for i, n in enumerate(names)],
              palette=[hexrgb(c) + (255,) for c in PAL.values()], layer='Sep')
    sheet = Image.new('RGBA', (128, 32))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * 32, 0))
    sheet.save(OUT / 'boss-sheet.png')
    prev = Image.new('RGBA', (128, 32), (168, 181, 178, 255))
    prev.alpha_composite(sheet)
    prev.resize((1280, 320), Image.NEAREST).save(OUT / 'boss-preview.png')
    print('ok')
