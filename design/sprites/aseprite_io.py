"""Ghi file .aseprite (RGBA, 1 layer, nhiều frame, có tag + palette) — không cần cài Aseprite."""
import struct, zlib

def _s(txt):
    b = txt.encode('utf-8'); return struct.pack('<H', len(b)) + b

def _chunk(t, data):
    return struct.pack('<IH', 6 + len(data), t) + data

def write_ase(path, w, h, frames, tags=(), palette=(), layer='Nhan vat', duration=200):
    """frames: list[bytes RGBA w*h*4]; tags: [(name, from, to)]; palette: [(r,g,b,a)]"""
    body = b''
    for fi, rgba in enumerate(frames):
        chunks = []
        if fi == 0:
            if palette:
                pd = struct.pack('<III8x', len(palette), 0, len(palette) - 1)
                for r, g, b, a in palette: pd += struct.pack('<HBBBB', 0, r, g, b, a)
                chunks.append(_chunk(0x2019, pd))
            chunks.append(_chunk(0x2004, struct.pack('<HHHHHHB3x', 3, 0, 0, 0, 0, 0, 255) + _s(layer)))
            if tags:
                td = struct.pack('<H8x', len(tags))
                for name, a, b in tags: td += struct.pack('<HHBH6x3sx', a, b, 0, 0, b'\0\0\0') + _s(name)
                chunks.append(_chunk(0x2018, td))
        cel = struct.pack('<HhhBHh5x', 0, 0, 0, 255, 2, 0) + struct.pack('<HH', w, h) + zlib.compress(rgba)
        chunks.append(_chunk(0x2005, cel))
        cd = b''.join(chunks)
        body += struct.pack('<IHHH2xI', 16 + len(cd), 0xF1FA, len(chunks), duration, len(chunks)) + cd
    head = struct.pack('<IHHHHHIHII B3xH BBhhHH84x', 128 + len(body), 0xA5E0, len(frames), w, h, 32, 1, 100, 0, 0, 0, 0, 1, 1, 0, 0, 16, 16)
    assert len(head) == 128, len(head)
    open(path, 'wb').write(head + body)

def read_ase(path):
    """Đọc lại file .aseprite (RGBA, cel nén) → (w, h, [frames RGBA bytes]) — dùng để nhận bản Tyson sửa."""
    d = open(path, 'rb').read()
    _, magic, nf, w, h, depth = struct.unpack_from('<IHHHHH', d, 0)
    assert magic == 0xA5E0 and depth == 32, 'chỉ hỗ trợ RGBA'
    pos, frames = 128, []
    for _ in range(nf):
        fsize, fm, old, dur, new = struct.unpack_from('<IHHH2xI', d, pos)
        n = new or old; cp = pos + 16
        canvas = bytearray(w * h * 4)
        for _ in range(n):
            csz, ct = struct.unpack_from('<IH', d, cp)
            if ct == 0x2005:
                li, x, y, op, ctype = struct.unpack_from('<HhhBH', d, cp + 6)
                cw, ch = struct.unpack_from('<HH', d, cp + 6 + 16)
                raw = d[cp + 6 + 20: cp + csz]
                px = zlib.decompress(raw) if ctype == 2 else raw
                for j in range(ch):
                    for i in range(cw):
                        X, Y = x + i, y + j
                        if 0 <= X < w and 0 <= Y < h and px[(j * cw + i) * 4 + 3]:
                            canvas[(Y * w + X) * 4:(Y * w + X) * 4 + 4] = px[(j * cw + i) * 4:(j * cw + i) * 4 + 4]
            cp += csz
        frames.append(bytes(canvas)); pos += fsize
    return w, h, frames
