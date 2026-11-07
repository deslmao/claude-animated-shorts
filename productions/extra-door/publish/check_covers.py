"""Safe-area and small-size check sheet for the covers (approximate platform overlay zones, 1080x1920 frame)."""
import os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
# approximate UI overlay zones (x0, y0, x1, y1), from each app's current layout on a 9:16 phone
ZONES = {
    "YouTube Shorts": [(0, 0, 1080, 200), (930, 820, 1080, 1700), (0, 1520, 1080, 1920)],
    "TikTok":         [(0, 0, 1080, 220), (920, 780, 1080, 1660), (0, 1480, 1080, 1920)],
    "Instagram Reels":[(0, 0, 1080, 210), (940, 960, 1080, 1700), (0, 1500, 1080, 1920)],
}
def zones(img, boxes, grid=False):
    o = img.convert("RGBA"); lay = Image.new("RGBA", o.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for b in boxes: d.rectangle(b, fill=(255, 0, 60, 90), outline=(255, 0, 60, 255), width=4)
    if grid:  # profile-grid 3:4 crop
        d.rectangle((0, 0, 1080, 240), fill=(0, 0, 0, 170)); d.rectangle((0, 1680, 1080, 1920), fill=(0, 0, 0, 170))
        d.rectangle((0, 240, 1079, 1680), outline=(0, 255, 120, 255), width=6)
    o.alpha_composite(lay); return o.convert("RGB")
if __name__ == "__main__":
    c = Image.open(os.path.join(HERE, "cover-tiktok.jpg")).convert("RGB")
    tiles = [zones(c, z) for z in ZONES.values()] + [zones(c, [], grid=True)]
    sheet = Image.new("RGB", (4 * 540 + 5 * 20 + 400, 960 + 80), (24, 24, 28)); d = ImageDraw.Draw(sheet)
    for i, (t, name) in enumerate(zip(tiles, list(ZONES) + ["3:4 profile grid crop"])):
        x = 20 + i * 560; sheet.paste(t.resize((540, 960), Image.LANCZOS), (x, 60)); d.text((x, 20), name, fill=(240, 240, 240))
    # phone-size previews: a feed/search tile (about 180 px wide on a 1080 px screen) and a 3-column grid tile
    x = 20 + 4 * 560
    small = c.resize((180, 320), Image.LANCZOS); sheet.paste(small, (x, 60)); d.text((x, 20), "180 px tile", fill=(240, 240, 240))
    tiny = c.crop((0, 240, 1080, 1680)).resize((120, 160), Image.LANCZOS); sheet.paste(tiny, (x + 200, 60)); d.text((x + 200, 20), "grid 120 px", fill=(240, 240, 240))
    sheet.save(os.path.join(HERE, "cover-safe-area-check.jpg"), quality=90)
    print("ok")
