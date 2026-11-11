"""Xuất sprite (dạng lưới ký tự + bảng màu) ra design/lib/tyson-sprites.js cho các trang HTML.
Chạy sau khi sửa model/hướng/bước đi:  python design/sprites/export_js.py"""
import json, pathlib
from tyson_grid import load
import dev_views, boss_tyson

HERE = pathlib.Path(__file__).parent


def pack(frames, pal):
    used = sorted({c for f in frames for r in f for c in r if c != '.'})
    w = max(len(r) for f in frames for r in f)
    return {'pal': {c: pal[c] for c in used}, 'w': w,
            'frames': [[r.ljust(w, '.') for r in f] for f in frames]}


data = {}
wr, wp, _ = load('office-worker')
data['worker'] = {'xuong': pack([wr], wp)}
br, bp, _ = load('boss')                      # sếp do Tyson vẽ (thay bản boss_tyson.py)
data['boss'] = {'xuong': pack([br], bp)}
data['dev'] = {d: pack(dev_views.DIRS[d], dev_views.PAL) for d in dev_views.DIRS}
(HERE.parent / 'lib' / 'tyson-sprites.js').write_text(
    '// Sinh tự động bởi design/sprites/export_js.py — không sửa tay\nwindow.TYSON_SPRITES = ' + json.dumps(data) + ';\n',
    encoding='utf-8')
print('ok')
