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
    """Đọc file .aseprite (RGBA / Indexed / Grayscale, nhiều layer, cel nén hoặc thô)
    → (w, h, [frames RGBA bytes], palette) — dùng để nhận bản Tyson vẽ/sửa."""
    d = open(path, 'rb').read()
    _, magic, nf, w, h, depth = struct.unpack_from('<IHHHHH', d, 0)
    assert magic == 0xA5E0, 'không phải file aseprite'
    tidx, bpp = d[28], depth // 8
    pal, layers, frames, pos = {}, [], [], 128
    for _ in range(nf):
        fsize, fm, old, dur, new = struct.unpack_from('<IHHH2xI', d, pos)
        cp, cels = pos + 16, []
        for _ in range(new or old):
            csz, ct = struct.unpack_from('<IH', d, cp)
            body = d[cp + 6:cp + csz]
            if ct == 0x2019:
                _, first, last = struct.unpack_from('<III', body, 0); q = 20
                for i in range(first, last + 1):
                    fl, r, g, b, a = struct.unpack_from('<HBBBB', body, q); q += 6
                    if fl & 1: q += 2 + struct.unpack_from('<H', body, q)[0]
                    pal[i] = (r, g, b, a)
            elif ct == 0x2004:
                fl = struct.unpack_from('<H', body, 0)[0]
                L = struct.unpack_from('<H', body, 16)[0]
                layers.append((body[18:18 + L].decode('utf-8', 'replace'), fl))
            elif ct == 0x2005:
                li, x, y, op, typ = struct.unpack_from('<HhhBH', body, 0)
                if typ in (0, 2):
                    cw, ch = struct.unpack_from('<HH', body, 16)
                    px = zlib.decompress(body[20:]) if typ == 2 else body[20:]
                    cels.append((li, x, y, cw, ch, px))
            cp += csz
        canvas = bytearray(w * h * 4)
        for li, x, y, cw, ch, px in sorted(cels, key=lambda c: c[0]):
            if li < len(layers) and not layers[li][1] & 1:
                continue                                  # layer đang ẩn
            for j in range(ch):
                for i in range(cw):
                    k = (j * cw + i) * bpp
                    if bpp == 4: c = tuple(px[k:k + 4])
                    elif bpp == 1:
                        if px[k] == tidx: continue
                        c = pal.get(px[k], (255, 0, 255, 255))
                    else: c = (px[k], px[k], px[k], px[k + 1])
                    X, Y = x + i, y + j
                    if c[3] and 0 <= X < w and 0 <= Y < h:
                        canvas[(Y * w + X) * 4:(Y * w + X) * 4 + 4] = bytes(c)
        frames.append(bytes(canvas)); pos += fsize
    return w, h, frames, pal
