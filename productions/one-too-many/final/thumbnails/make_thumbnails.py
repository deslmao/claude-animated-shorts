"""One Too Many: YouTube thumbnails (1280x720), five compositions.

The sources (source/*-2160x1215.jpg) are 16:9 bands of 2x engine stills (2160x3840) of the thumbnail set-ups in
animation-studio/src/studio/stories/one-too-many-thumbs.ts: the film's own set, cast, props and lights, staged for
16:9. They're rendered with:
    REMOTION_GL=swangle node scripts/stills.mjs Short-one-too-many-thumbs <prefix> 9,27,45,63,81 2
and cropped at y 1312 (E: y 892). Nothing here touches the finished film.

Run:  python3 -I make_thumbnails.py   (from this folder)
"""
import io, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_WOFF2 = os.path.join(HERE, "../../../../animation-studio/public/fonts/nunito-900.woff2")  # the caption font
PLUM = (20, 2, 30)        # the caption / character outline colour
WHITE = (255, 255, 255)
MAROON = (196, 52, 70)    # Carol's blazer, lifted for type
W, H = 1280, 720


def font(size):
    f = TTFont(FONT_WOFF2); f.flavor = None; buf = io.BytesIO(); f.save(buf); buf.seek(0)
    return ImageFont.truetype(buf, size)


def grade(img, centre, strength=0.42, warm_light=0.0):
    """One light: a soft fall-off around the subject into slightly cooler shadows, gentle contrast. The lit centre
    keeps its colours, so the toon palette (and Carol's maroon against the navy) is untouched."""
    a = np.asarray(img).astype(np.float32) / 255.0
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = centre
    r = np.sqrt(((xx - cx) / (W * 0.55)) ** 2 + ((yy - cy) / (H * 0.75)) ** 2)
    t = np.clip((r - 0.30) / 0.80, 0, 1); t = t * t * (3 - 2 * t)
    a = a * (1.0 - strength * t)[..., None]
    a = a * (1.0 + (0.45 * t)[..., None] * np.array([-0.07, -0.01, 0.06], np.float32))
    if warm_light:
        a = a * (1.0 + (warm_light * (1 - t))[..., None] * np.array([0.05, 0.02, -0.03], np.float32))
    a = np.clip((a - 0.5) * 1.10 + 0.5, 0, 1)
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))


def text(img, lines, x, y, align="left", gap=2):
    """lines: [(text, size, colour)]. Nunito Black with a thick plum outline and a soft plum shadow."""
    shadow = Image.new("L", img.size, 0); sd = ImageDraw.Draw(shadow)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    boxes = []
    for s, size, col in lines:
        f = font(size); stroke = max(6, round(size * 0.09))
        l, t, r, b = d.textbbox((0, 0), s, font=f, stroke_width=stroke)
        px = x - l if align == "left" else x - (r - l) - l if align == "right" else x - (r - l) / 2 - l
        sd.text((px + size * 0.03, y - t + size * 0.05), s, font=f, fill=255, stroke_width=stroke + 5, stroke_fill=255)
        d.text((px, y - t), s, font=f, fill=col, stroke_width=stroke, stroke_fill=PLUM)
        boxes.append((round(px + l), round(y), round(px + r), round(y + b - t)))
        y += (b - t) + gap
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    base = img.convert("RGBA")
    base = Image.composite(Image.new("RGBA", img.size, PLUM + (255,)), base, shadow.point(lambda v: int(v * 0.6)))
    base.alpha_composite(layer)
    return base.convert("RGB"), boxes


def src(name, box=None):
    """box: an optional 16:9 crop of the 2160x1215 source (a tighter frame that stays above 1280 px wide)"""
    im = Image.open(os.path.join(HERE, "source", f"{name}-2160x1215.jpg")).convert("RGB")
    return (im.crop(box) if box else im).resize((W, H), Image.LANCZOS)


def save(img, name):
    p = os.path.join(HERE, name); img.save(p, quality=95, subsampling=0, optimize=True); return p


CANDIDATES = {
    # A: the whole class facing us in navy; Carol a step apart, back turned, under the 31
    "A-the-line": lambda: text(grade(src("A-the-line", (520, 60, 2160, 982)), (790, 420), 0.45), [("WHO'S", 118, WHITE), ("NUMBER 31?", 96, WHITE)], 34, 22),
    # B: Ms Okoye mid-count, pointing at Carol
    "B-the-count": lambda: text(grade(src("B-the-count"), (720, 400), 0.40), [("COUNT", 112, WHITE), ("AGAIN.", 112, WHITE)], 1250, 24, align="right"),
    # C: sunset; the class's backs, and Carol the only one turned toward you
    "C-facing-you": lambda: text(grade(src("C-facing-you"), (690, 430), 0.35, warm_light=0.6), [("SHE'S NOT ON", 84, WHITE), ("THE REGISTER", 84, WHITE)], 34, 26),
    # D: the register itself: ON REGISTER 30, COUNTED 31, and Carol behind it (the register is the text)
    "D-the-register": lambda: (grade(src("D-the-register"), (640, 420), 0.40), []),
    # E: the three files from above, the 29-30-31 tags, Carol the odd one out
    "E-the-formation": lambda: text(grade(src("E-the-formation"), (1120, 400), 0.40), [("ONE TOO", 104, WHITE), ("MANY", 104, MAROON)], 34, 470),
}

if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "candidates"), exist_ok=True)
    outs = {}
    for name, make in CANDIDATES.items():
        im, boxes = make(); outs[name] = im
        print(name, save(im, os.path.join("candidates", f"{name}.jpg")), boxes)
    # the comparison sheet: each at full size and at mobile-grid size (320 px, about a phone's search result)
    sheet = Image.new("RGB", (W // 2 * 2 + 360, (H // 2 + 20) * 3 + 20), (24, 24, 30)); d = ImageDraw.Draw(sheet)
    for i, (name, im) in enumerate(outs.items()):
        cx, cy = (i % 2) * (W // 2 + 10) + 10, (i // 2) * (H // 2 + 20) + 10
        sheet.paste(im.resize((W // 2, H // 2), Image.LANCZOS), (cx, cy)); d.text((cx + 8, cy + 6), name, fill="yellow", font=font(22))
    for i, im in enumerate(outs.values()):
        sheet.paste(im.resize((320, 180), Image.LANCZOS), (W + 30, 10 + i * 196))
    save(sheet, "comparison-sheet.jpg")
