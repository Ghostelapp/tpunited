"""Prepare deterministic runtime atlases from the checked-in raccoon artwork.

Requires Pillow, numpy and scipy. No model or network access is used.
"""
from pathlib import Path
import base64, io, re
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'
CELL = 384


def save_image(image, path, **options):
    # Atomic replacement also prevents file watchers from observing empty files.
    encoded = io.BytesIO()
    format = 'WEBP' if path.suffix == '.webp' else 'PNG'
    image.save(encoded, format=format, **options)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_bytes(encoded.getvalue())
    temporary.replace(path)


def remove_checker(image, light=170):
    rgb = np.asarray(image.convert('RGB')).astype(np.int16)
    # Flood only neutral, bright background connected to the image perimeter.
    # Enclosed white fur and eye highlights are protected by their dark outlines.
    candidate = (rgb.max(2) - rgb.min(2) <= 16) & (rgb.min(2) >= light)
    seeds = np.zeros(candidate.shape, bool)
    seeds[[0, -1], :] = True
    seeds[:, [0, -1]] = True
    bg = ndi.binary_propagation(seeds & candidate, mask=candidate)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    rgba = np.dstack((rgb.astype(np.uint8), alpha))
    rgba[bg, :3] = 0
    return Image.fromarray(rgba)


def keep_art(image):
    a = np.asarray(image).copy()
    labels, count = ndi.label(a[:, :, 3] > 32)
    sizes = np.bincount(labels.ravel())
    # Keep the character plus meaningful detached particles, discard isolated noise.
    keep = sizes >= max(12, sizes[1:].max(initial=0) * .0004)
    keep[0] = False
    a[~keep[labels]] = 0
    return Image.fromarray(a)


def pack(frames, target, scale):
    atlas = Image.new('RGBA', (CELL * 4, CELL * 3))
    for i, frame in enumerate(frames):
        frame = keep_art(frame)
        bounds = frame.getbbox()
        if not bounds:
            raise ValueError(f'Empty frame {i}')
        frame = frame.crop(bounds)
        alpha = np.asarray(frame)[:, :, 3]
        # Feet, rather than the center of the tail/effect bounding box, set the pivot.
        yy, xx = np.where(alpha[-18:] > 128)
        foot = (int(xx.min()) + int(xx.max())) / 2
        size = tuple(round(v * scale) for v in frame.size)
        frame = frame.resize(size, Image.Resampling.LANCZOS)
        px = round(192 - foot * scale)
        py = 352 - size[1]
        if px < 2 or py < 2 or px + size[0] > CELL - 2:
            raise ValueError(f'Frame {i} exceeds padding: {px}, {py}, {size}')
        atlas.alpha_composite(frame, (i % 4 * CELL + px, i // 4 * CELL + py))
    save_image(atlas, ASSETS / target.replace('.webp', '.png'))
    save_image(atlas, ASSETS / target, lossless=True, method=4)
    print(target, (ASSETS / target).stat().st_size, flush=True)
    return atlas


hero = Image.open(ROOT / 'art/source/raccoon-player.png')
# The generated source has unequal vertical spacing; rows are explicit.
hero_frames = []
for y0, y1 in [(70, 410), (440, 760), (780, 1060)]:
    for col in range(4):
        frame = hero.crop((col * 362, y0, (col + 1) * 362, y1))
        hero_frames.append(remove_checker(frame))
pack(hero_frames, 'raccoon-player.webp', .96)

admin = Image.open(ROOT / 'art/source/raccoon-admin.png').convert('RGBA')
admin_frames = []
for y0, y1 in [(40, 410), (440, 795)]:
    xs = [0, 300, 608, 914, 1254]
    for col in range(4):
        admin_frames.append(admin.crop((xs[col], y0, xs[col + 1], y1)))
# Attack effects overlap in the source. Assign bodies and their own magenta
# effect regions separately instead of including neighboring tails in a cell.
a = np.asarray(admin)
yy, xx = np.indices(a.shape[:2])
magenta = (a[:, :, 0].astype(int) > a[:, :, 1].astype(int) * 1.35) & (a[:, :, 2] > 110)
regions = [
    ((0, 850, 282, 1170), (150, 1040, 329, 1128)),
    ((290, 855, 584, 1170), (380, 900, 636, 1105)),
    ((580, 885, 909, 1170), (638, 810, 985, 1170)),
    ((946, 870, 1245, 1170), (1005, 810, 1254, 1170)),
]
def rectangle(box):
    x0,y0,x1,y1=box
    return (xx>=x0)&(xx<x1)&(yy>=y0)&(yy<y1)
for i,(body,effect) in enumerate(regions):
    mask=rectangle(body)
    if i==2: mask &= ~((xx<640)&(yy<1040))
    if i==3: mask &= ~((xx<994)&(yy<1045))
    mask |= rectangle(effect)&magenta
    frame=a.copy();frame[~mask]=0
    image=Image.fromarray(frame)
    admin_frames.append(image.crop(image.getbbox()))
pack(admin_frames, 'admin-founder-v1.webp', .76)

# Self-contained SVG item images: embed only their selected atlas rectangle.
items = Image.open(ASSETS / 'sheet-5.webp')
for path in (ASSETS / 'equipment').glob('*.svg'):
    svg = path.read_text()
    x, y, w, h = map(int, re.findall(r'viewBox="([^"]+)"', svg)[1].split())
    output = io.BytesIO()
    items.crop((x, y, x + w, y + h)).save(output, format='PNG', optimize=True)
    encoded = base64.b64encode(output.getvalue()).decode()
    tag = f'<image x="{x}" y="{y}" width="{w}" height="{h}" clip-path="url(#crop)" href="data:image/png;base64,{encoded}"/>'
    path.write_text(re.sub(r'<image[^>]+/>', tag, svg))

print('Prepared player/admin runtime atlases and 8 equipment SVGs.')

# Change only the old panda badge on the unused monster sheet; preserve all
# monster sprites and the original transparent atlas background.
monsters = Image.open(ASSETS / 'sheet-9.png').convert('RGBA')
reference = Image.open(ROOT / 'art/source/raccoon-monsters.png').convert('RGBA')
monsters.paste(reference.crop((10, 43, 60, 94)), (10, 43))
save_image(monsters, ASSETS / 'sheet-9.png', optimize=True)
save_image(monsters, ASSETS / 'sheet-9.webp', lossless=True, method=4)
