"""Losslessly encode atlas images, retaining PNG originals for external references.
Requires Pillow with WebP support. Run from the repository root.
"""
from pathlib import Path
from PIL import Image
import re, base64, io
root = Path('public/assets')
before = after = 0
for source in [*root.glob('sheet-*.png'),root/'city.png']:
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.save(target, 'WEBP', lossless=True, method=4, exact=True)
        with Image.open(target) as result:
            assert image.convert('RGBA').tobytes()==result.convert('RGBA').tobytes(), source
    before += source.stat().st_size
    after += target.stat().st_size
# NFT artwork SVGs embed a whole atlas. Preserve self-contained metadata images,
# but embed only the pixels inside their original crop, with unchanged geometry.
for source in (root/'equipment').glob('*.svg'):
    svg=source.read_text()
    matches=list(re.finditer(r'viewBox="(\d+) (\d+) (\d+) (\d+)"',svg));match=matches[1] if len(matches)>1 else None
    embedded=re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)',svg)
    if not match or not embedded: continue
    x,y,w,h=map(int,match.groups())
    with Image.open(io.BytesIO(base64.b64decode(embedded[1]))) as image:
        crop=image.crop((x,y,x+w,y+h))
        data=io.BytesIO();crop.save(data,'PNG',optimize=True)
    # Existing clip and outer viewBox stay intact.
    svg=re.sub(r'<image\b[^>]*>',lambda m: re.sub(r'(?:x|y|width|height)="[^"]*"','',m[0]).replace('<image ',f'<image x="{x}" y="{y}" width="{w}" height="{h}" '),svg)
    svg=svg.replace(embedded[1],base64.b64encode(data.getvalue()).decode())
    source.write_text(svg)
print(f'Atlas/city bytes: {before} -> {after} ({100*(1-after/before):.1f}% smaller), identical RGBA pixels')
