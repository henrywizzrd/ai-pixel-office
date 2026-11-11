"""Gộp file *.src.html + các <script src> nội bộ thành 1 file HTML duy nhất (để gửi / mở trực tiếp).

Cách dùng:  python design/build.py
Kết quả:    design/catalog/catalog-1.src.html  ->  design/catalog/catalog-1.html
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).parent

for src in ROOT.rglob('*.src.html'):
    html = src.read_text(encoding='utf-8')

    def inline(m):
        path = (src.parent / m.group(1)).resolve()
        return '<script>\n' + path.read_text(encoding='utf-8') + '\n</script>'

    out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
    dst = src.with_name(src.name.replace('.src.html', '.html'))
    dst.write_text(out, encoding='utf-8')
    print('built', dst.relative_to(ROOT.parent))
