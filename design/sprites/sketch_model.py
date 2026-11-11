"""Vẽ lại model phác hoạ của Tyson (cô gái áo choàng trắng, búi tóc, nhìn chếch 3/4 sang phải).
~21×28. Viền màu (tóc nâu đen, áo xám, da nâu), mắt 1×2, không miệng, áo vạt chéo + đai lưng, tay áo rộng.
Chạy: python design/sprites/sketch_model.py  →  out/model-tyson.aseprite, out/model-tyson-compare.png
"""
import pathlib, sys
from PIL import Image
from aseprite_io import write_ase

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'; OUT.mkdir(exist_ok=True)

PAL = {
    'o': '#2e1c12', 'h': '#55361f', 'l': '#7a5638',                        # tóc
    'k': '#8a5a40', 's': '#f3c9a6', 'S': '#dcaa88', 'e': '#3a2416',         # da, mắt
    'G': '#7e7e88', 'g': '#bcbcc4', 'w': '#f2f2f5', 'W': '#ffffff',         # áo trắng
    'm': '#77777f', 'n': '#a4a4ae',                                         # đai lưng
}

W = 16
ROWS = [
    ".....oooo",          # 0  búi tóc
    "....ohhlho",         # 1
    "...oohhhhhoo",       # 2
    "..ohhlhhhhhho",      # 3
    "..ohhhhhhsshho",     # 4  mái
    "..ohhhhhsssssho",    # 5
    "..ohshhsesssesho",   # 6  tai + mắt
    "..ohkhhsesssesho",   # 7
    "..ohhhhkssssssko",   # 8
    ".ohhhhhhkSSSko",     # 9  cằm
    ".ohhhhhGkkskGo",     # 10 tóc rủ xuống vai
    ".ohhhhGwwsssgG",     # 11 cổ áo
    "..ooGwwwwgsgwG",     # 12 vạt chéo đi xuống trái
    "...GwWwwgwwwwG",     # 13
    "..GwWwgwwwwwwwG",    # 14
    "..GwGmmmmmmmmGwG",   # 15 đai lưng 3 hàng
    ".GwwGnnWnnnnnGwwG",  # 16
    ".GwwGmmmmmmmmGwwG",  # 17
    ".GwgGwWwgwwgwGgwG",  # 18 tay áo rộng
    ".kssGwWwgwwgwGssk",  # 19 bàn tay
    ".kSSkwwwgwwgwkSSk",  # 20
    "..kkGwwwgwwgwGkk",   # 21
    "...GwWwwgwwwgwG",    # 22 vạt áo loe
    "...GwWwwgwwwgwG",    # 23
    "..GwWwwwgwwwwgwG",   # 24
    "..GgwwwwwwwwwwggG",  # 25
    "..GggggggggggggGG",  # 26
    "...GGGGGGGGGGGGG",   # 27
]


def rgba(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def sprite():
    H = 32
    im = Image.new('RGBA', (W + 1, H), (0, 0, 0, 0))
    off = H - 1 - len(ROWS)
    for y, row in enumerate(ROWS):
        assert len(row) <= W + 1, (y, len(row))
        for x, ch in enumerate(row):
            if ch != '.':
                im.putpixel((x, off + y), rgba(PAL[ch]))
    return im


if __name__ == '__main__':
    im = sprite()
    write_ase(OUT / 'model-tyson.aseprite', im.width, im.height, [im.tobytes()], tags=[('dung', 0, 0)],
              palette=[rgba(c) for c in PAL.values()], layer='Model')
    z = 12
    prev = Image.new('RGBA', (im.width, im.height), (241, 241, 247, 255)); prev.alpha_composite(im)
    prev = prev.resize((im.width * z, im.height * z), Image.NEAREST)
    if len(sys.argv) > 1:   # so sánh cạnh ảnh phác hoạ gốc
        ref = Image.open(sys.argv[1]).convert('RGBA')
        ref = ref.resize((int(ref.width * prev.height / ref.height), prev.height))
        both = Image.new('RGBA', (ref.width + prev.width + 20, prev.height), (255, 255, 255, 255))
        both.paste(ref, (0, 0)); both.paste(prev, (ref.width + 20, 0))
        both.save(OUT / 'model-tyson-compare.png')
    prev.save(OUT / 'model-tyson-preview.png')
    print('ok')
