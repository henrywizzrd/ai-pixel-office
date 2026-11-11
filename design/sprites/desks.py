"""BÀN LÀM VIỆC — top-down 3/4, nét Greg.
  ban-don  : bàn nhân viên 1 người (gỗ sáng, hộc kéo bên trái, chỗ để chân mở)
  ban-L    : bàn chữ L cho dev/designer (mặt trắng xám, chân kim loại, tủ hộc ở cánh phải)
  ban-sep  : bàn giám đốc (gỗ óc chó sậm, tấm lót da xanh, mặt trước kín, tay nắm vàng)
Chạy: python design/sprites/desks.py
"""
from kit import Canvas, export

# --- bảng màu ---
WOOD = dict(top='#c8955c', hi='#dcae74', face='#a8743f', dark='#7a4f2a', knob='#e9cf8c')
WAL = dict(top='#7a4528', hi='#94593a', face='#5c3220', dark='#40210f', inset='#6b3a24', gold='#e2b04a',
           pad='#3e5a48', padhi='#4f7058')
MOD = dict(top='#e2ded6', hi='#f4f2ec', face='#bdb8ae', metal='#4a4e58', metalhi='#6a6f7c', cab='#cfcac0', knob='#7c8090')


def drawer(c, x, y, w, h, fill, line, knob):
    c.rect(x, y, w, h, fill)
    c.hline(x, y + h - 1, w, line)
    c.rect(x + w // 2 - 1, y + h // 2 - 1, 2, 1, knob)


def ban_don():
    W, D, F = 36, 13, 12
    c = Canvas(W, D + F - 1)
    # mặt trước: hộc kéo trái, chân phải, vách sau chỗ để chân
    c.box(10, D - 1, 23, 7, WOOD['dark'])                         # vách sau (tối)
    c.box(0, D - 1, 12, F, WOOD['face'])                          # hộc trái
    drawer(c, 1, D, 10, 3, WOOD['face'], WOOD['dark'], WOOD['knob'])
    drawer(c, 1, D + 3, 10, 3, WOOD['face'], WOOD['dark'], WOOD['knob'])
    drawer(c, 1, D + 6, 10, 4, WOOD['face'], WOOD['face'], WOOD['knob'])
    c.box(W - 5, D - 1, 5, F, WOOD['face'])                       # chân phải
    # mặt trên
    c.box(0, 0, W, D, WOOD['top'], hi=WOOD['hi'])
    c.hline(1, D - 2, W - 2, WOOD['face'])                        # mép dày mặt bàn
    c.hline(4, 4, 9, WOOD['hi']); c.hline(18, 7, 11, WOOD['hi'])  # vân gỗ
    return c


def ban_L():
    W, D, F, RW, RD = 50, 13, 11, 15, 30   # RW/RD: cánh phải (rộng / sâu)
    c = Canvas(W, RD + F - 1)
    rx = W - RW
    # mặt trước cánh trái: chân kim loại + thanh giằng
    c.box(0, D - 1, 4, F, MOD['metal']); c.vline(1, D, F - 2, MOD['metalhi'])
    c.box(3, D - 1, rx - 2, 4, MOD['metal'])                     # thanh giằng sau
    # mặt trước cánh phải: tủ 2 hộc
    c.box(rx, RD - 1, RW, F, MOD['cab'])
    drawer(c, rx + 1, RD, RW - 2, 4, MOD['cab'], MOD['face'], MOD['knob'])
    drawer(c, rx + 1, RD + 4, RW - 2, 5, MOD['cab'], MOD['cab'], MOD['knob'])
    # mặt trên (hình chữ L liền khối)
    c.box(0, 0, W, D, MOD['top'], hi=MOD['hi'])
    c.box(rx, 0, RW, RD, MOD['top'], hi=MOD['hi'])
    c.rect(rx, 1, RW - 1, D - 1, MOD['top'])                      # xoá viền chỗ nối
    c.hline(1, 1, W - 2, MOD['hi'])
    c.hline(1, D - 2, rx - 1, MOD['face'])                        # mép dày cánh trái
    c.hline(rx + 1, RD - 2, RW - 2, MOD['face'])                  # mép dày cánh phải
    return c


def ban_sep():
    W, D, F = 58, 17, 13
    c = Canvas(W, D + F - 1)
    # mặt trước kín: 2 hộc 2 bên + tấm ốp giữa
    c.box(0, D - 1, W, F, WAL['face'])
    for x in (1, W - 15):
        for k in range(3):
            drawer(c, x, D + k * 3 + 0, 14, 3, WAL['face'], WAL['dark'], WAL['gold'])
        c.vline(x + 14 if x == 1 else x - 1, D, F - 2, WAL['dark'])
    c.rect(19, D + 2, W - 38, F - 5, WAL['inset']); c.hline(19, D + 2, W - 38, WAL['dark'])
    c.rect(19, D + F - 4, W - 38, 1, WAL['hi'])
    c.hline(1, D + F - 3, W - 2, WAL['dark'])                     # chân đế
    # mặt trên
    c.box(0, 0, W, D, WAL['top'], hi=WAL['hi'])
    c.hline(1, D - 2, W - 2, WAL['face'])
    c.box(14, 3, 30, 10, WAL['pad'], hi=WAL['padhi'])             # tấm lót da
    c.hline(4, 5, 7, WAL['hi']); c.hline(47, 10, 7, WAL['hi'])    # vân gỗ
    return c


if __name__ == '__main__':
    export('desks', (64, 48), [('ban-don', ban_don()), ('ban-L', ban_L()), ('ban-sep', ban_sep())])
    print('ok')
