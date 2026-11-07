"""Build the Video 05 (The Extra Door) covers from frames of the finished video.

The source frames in source/ are lossless-path engine stills of existing film frames (scripts/stills.mjs), which
match the final MP4's frames (about 40 dB PSNR). Nothing here touches the video, the storyboard or the engine.

Run:  python3 -I make_covers.py   (from this folder)
"""
import io, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_WOFF2 = os.path.join(HERE, "../../../animation-studio/public/fonts/nunito-900.woff2")  # the caption font
PLUM = (20, 2, 30)        # the caption / character outline colour, sampled from the video
WHITE = (255, 255, 255)
W, H = 1080, 1920


def font(size):
    f = TTFont(FONT_WOFF2); f.flavor = None; buf = io.BytesIO(); f.save(buf); buf.seek(0)
    return ImageFont.truetype(buf, size)


def grade(img, centre, strength=0.5, top_shade=0.0):
    """Controlled 'one light' look: a soft vignette around the subject and an optional shade at the top for the
    text. Colours inside the light are untouched."""
    a = np.asarray(img).astype(np.float32) / 255.0
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = centre
    r = np.sqrt(((xx - cx) / (W * 0.62)) ** 2 + ((yy - cy) / (H * 0.52)) ** 2)
    t = np.clip((r - 0.45) / 0.75, 0, 1); t = t * t * (3 - 2 * t)          # smoothstep
    k = 1.0 - strength * t
    if top_shade:
        s = np.clip((640 - yy) / 520, 0, 1); k = k * (1.0 - top_shade * s * s)
    a = a * k[..., None]
    # the shadows the light falls off into go slightly cold (a little blue, a little less red); the lit centre is unchanged
    cool = (0.35 * t)[..., None] * np.array([-0.06, -0.01, 0.05], np.float32)
    a = a * (1.0 + cool)
    # gentle contrast around mid-grey, keeps the toon colours
    a = np.clip((a - 0.5) * 1.06 + 0.5, 0, 1)
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))


def text_block(img, lines, cx, top, gap=6):
    """lines: [(text, size)]. Centred at cx. White Nunito Black, thick plum outline and a soft plum shadow."""
    shadow = Image.new("L", img.size, 0); sd = ImageDraw.Draw(shadow)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    y = top; boxes = []
    for text, size in lines:
        f = font(size); stroke = max(8, round(size * 0.085))
        l, t, r, b = d.textbbox((0, 0), text, font=f, stroke_width=stroke)
        x = cx - (r - l) / 2 - l
        sd.text((x + size * 0.03, y - t + size * 0.05), text, font=f, fill=255, stroke_width=stroke + 6, stroke_fill=255)
        d.text((x, y - t), text, font=f, fill=WHITE, stroke_width=stroke, stroke_fill=PLUM)
        boxes.append((round(x + l), round(y), round(x + r), round(y + b - t)))
        y += (b - t) + gap
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    base = img.convert("RGBA")
    base = Image.composite(Image.new("RGBA", img.size, PLUM + (255,)), base, shadow.point(lambda v: int(v * 0.55)))
    base.alpha_composite(layer)
    return base.convert("RGB"), boxes


def save(img, name):
    p = os.path.join(HERE, name); img.save(p, quality=95, subsampling=0, optimize=True); return p


if __name__ == "__main__":
    # main cover: frame 1462 (0:48.73), shot 19. Milo terrified, the dark old door with its brass handle pushed
    # through the wood behind him (left), an ordinary white door beside him (right).
    src = Image.open(os.path.join(HERE, "source/frame-1462-0m48.73s.jpg")).convert("RGB")
    g = grade(src, centre=(430, 1160), strength=0.42, top_shade=0.35)
    cover, boxes = text_block(g, [("THE 8TH", 140), ("DOOR?", 178)], cx=540, top=250)
    print("main text boxes", boxes)
    for n in ("cover-youtube-shorts.jpg", "cover-tiktok.jpg", "cover-instagram-reels.jpg"):
        print(save(cover, n))
