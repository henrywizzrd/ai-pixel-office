"""NHÂN VIÊN — theo bộ 9 nhân vật tham khảo (chibi-RPG ~20×32, nhìn chếch 3/4 về bên trái,
viền màu (viền mỗi mảng là sắc tối của chính nó, không dùng đen), mắt 1×2, không miệng, áo 3 tông có nếp gấp).
Nhân viên văn phòng trẻ: tóc nâu đen bù xù, sơ mi xanh nhạt xắn tay, dây đeo thẻ đỏ, quần âu xám xanh, giày nâu.

Chạy:  python design/sprites/staff_rpg.py
Ra:    out/staff.aseprite · out/staff-preview.png · ../lib/staff-sprite.js (dữ liệu cho trang HTML)
"""
import json, pathlib
from PIL import Image
from aseprite_io import write_ase

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'; OUT.mkdir(exist_ok=True)

PAL = {
    # tóc
    'o': '#2a1a14', 'h': '#4a3024', 'l': '#6e4a34',
    # da
    'k': '#7a4e3a', 's': '#e6b994', 'S': '#cf9a76', 'e': '#4a3222',
    # sơ mi xanh nhạt
    'B': '#3e5878', 'd': '#7a9cc4', 'b': '#a6c4e2', 'c': '#d2e4f4',
    # dây thẻ + thẻ
    'r': '#c8372d', 'w': '#f4f4f0', 'g': '#9aa0aa',
    # quần
    'P': '#232634', 'p': '#3c4258', 'q': '#545c78',
    # giày
    'F': '#2e1e16', 'f': '#5a3c2a',
}

ROWS = [
    "......ooooo.........",  # 0
    "....oohlhhhoo.......",  # 1
    "...ohllhhhhhho......",  # 2
    "..ohhhhhhhhhhho.....",  # 3
    "..ohhlhhhhhhhhho....",  # 4
    "..ohhsshhshhhhho....",  # 5
    "..ohssssssshhhho....",  # 6
    "..kssessesshhho.....",  # 7
    "..kssessesssho......",  # 8
    "..ksssssssssko......",  # 9
    "...kSssssssk........",  # 10
    "....kkSSSkk.........",  # 11
    "....BBcrSrcBB.......",  # 12
    "...BbccbrbrbbbB.....",  # 13
    "..BbbcbbrbrbbbbB....",  # 14
    "..BbdbbbbrrbbbdbB...",  # 15
    "..BbdBbbbwwbbBbdB...",  # 16
    "..BddBbbbwgbbBddB...",  # 17
    "..BcdBbbbbbbbBdcB...",  # 18
    "..kssBdbbbbbdBssk...",  # 19
    "..kSSkBdbbbdBkSSk...",  # 20
    "...kk.PPPPPPP.kk....",  # 21
    ".....PqppppqpP......",  # 22
    ".....PqppPppqP......",  # 23
    ".....PqpP.PqpP......",  # 24
    ".....PFFP.PFFP......",  # 25
    "....FffFF.FfffF.....",  # 26
    "....FFFF..FFFFF.....",  # 27
]


def rgba(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def sprite():
    W, H = 20, 32
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    off = H - 1 - len(ROWS)
    for y, row in enumerate(ROWS):
        assert len(row) == W, (y, len(row), row)
        for x, ch in enumerate(row):
            if ch != '.':
                im.putpixel((x, off + y), rgba(PAL[ch]))
    return im


if __name__ == '__main__':
    im = sprite()
    write_ase(OUT / 'staff.aseprite', 20, 32, [im.tobytes()], tags=[('dung', 0, 0)],
              palette=[rgba(c) for c in PAL.values()], layer='Nhan vien')
    prev = Image.new('RGBA', (20, 32), (222, 226, 236, 255)); prev.alpha_composite(im)
    prev.resize((200, 320), Image.NEAREST).save(OUT / 'staff-preview.png')
    # dữ liệu cho JS: danh sách hàng + bảng màu
    js = 'window.STAFF_SPRITE = ' + json.dumps({'rows': ROWS, 'pal': PAL, 'w': 20, 'h': 32}) + ';\n'
    (HERE.parent / 'lib' / 'staff-sprite.js').write_text(js, encoding='utf-8')
    print('ok')
