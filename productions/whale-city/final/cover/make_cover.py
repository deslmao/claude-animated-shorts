"""The Whale City: the vertical cover for YouTube Shorts and Instagram Reels (1080x1920), one composition.

The source (source-2160x3840.jpg) is a 2x engine still of the cover set-up (shot 2) in
animation-studio/src/studio/stories/whale-city-thumb.ts: the film's own whale-city set and props, the sleeping whale
head-on at golden hour, its two closed eyes, the city on its back, its breath rising. Rendered with
    REMOTION_GL=swangle node scripts/stills.mjs Short-whale-city-thumb <prefix> 45 2
The title sits in the top safe area (clear of the platforms' buttons and captions at the bottom and right).

Run:  python3 -I make_cover.py   (from this folder)
"""
import io, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_WOFF2 = os.path.join(HERE, "../../../../animation-studio/public/fonts/nunito-900.woff2")  # the caption font
PLUM, WHITE, W, H = (20, 2, 30), (255, 255, 255), 1080, 1920


def font(size):
    f = TTFont(FONT_WOFF2); f.flavor = None; buf = io.BytesIO(); f.save(buf); buf.seek(0)
    return ImageFont.truetype(buf, size)


def grade(img, centre, strength=0.38):
    """one light: a soft fall-off around the whale into cooler shadows, a little more contrast; the toon colours kept"""
    a = np.asarray(img).astype(np.float32) / 255.0
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - centre[0]) / (W * 0.6)) ** 2 + ((yy - centre[1]) / (H * 0.8)) ** 2)
    t = np.clip((r - 0.35) / 0.8, 0, 1); t = t * t * (3 - 2 * t)
    a = a * (1.0 - strength * t)[..., None] * (1.0 + (0.4 * t)[..., None] * np.array([-0.07, -0.01, 0.07], np.float32))
    a = np.clip((a - 0.5) * 1.12 + 0.5, 0, 1)
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))


def text(img, s, size, cx, y):
    """centred Nunito Black, white with a thick plum outline and a soft plum shadow"""
    shadow = Image.new("L", img.size, 0); sd = ImageDraw.Draw(shadow)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    f = font(size); stroke = round(size * 0.09)
    l, t, r, b = d.textbbox((0, 0), s, font=f, stroke_width=stroke)
    x = cx - (r - l) / 2 - l
    sd.text((x + size * 0.03, y - t + size * 0.06), s, font=f, fill=255, stroke_width=stroke + 6, stroke_fill=255)
    d.text((x, y - t), s, font=f, fill=WHITE, stroke_width=stroke, stroke_fill=PLUM)
    base = img.convert("RGBA")
    base = Image.composite(Image.new("RGBA", img.size, PLUM + (255,)), base, shadow.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.6)))
    base.alpha_composite(layer)
    return base.convert("RGB"), (round(x + l), round(y), round(x + r), round(y + b - t))


if __name__ == "__main__":
    im = Image.open(os.path.join(HERE, "source-2160x3840.jpg")).convert("RGB").resize((W, H), Image.LANCZOS)
    im = grade(im, (540, 1000), strength=0.32)
    im, b1 = text(im, "DON'T", 190, 540, 250)
    im, b2 = text(im, "WAKE IT", 190, 540, 250 + (b1[3] - b1[1]) + 14)
    out = os.path.join(HERE, "..", "cover-vertical-1080x1920.jpg")
    im.save(out, quality=95, subsampling=0, optimize=True)
    print(out, im.size, "title", b1, b2)
