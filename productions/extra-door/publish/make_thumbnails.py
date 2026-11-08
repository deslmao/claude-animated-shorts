"""Door-focused thumbnails for Part 1 (the finished video's own frames; reuses make_covers.py's grade and type)."""
import os
from PIL import Image
from make_covers import grade, text_block, save, HERE

def build(src, out, lines, centre, top=250, strength=0.5, shade=0.35, crop=None):
    img = Image.open(os.path.join(HERE, "source", src)).convert("RGB")
    if crop:  # zoom: crop a 9:16 window and scale back to 1080x1920
        img = img.crop(crop).resize((1080, 1920), Image.LANCZOS)
    g = grade(img, centre=centre, strength=strength, top_shade=shade)
    im, boxes = text_block(g, lines, cx=540, top=top)
    print(out, boxes); save(im, os.path.join("thumbnails", out))

if __name__ == "__main__":
    # recommended: the old door square in the frame, the clean patch and nail above, the cold light under it, the photo
    build("frame-0400-0m13.33s.png", "recommended-whats-behind-it.jpg", [("WHAT'S", 104), ("BEHIND IT?", 100)], centre=(540, 1020), top=205, strength=0.32, shade=0.15)
    # alt 1: the brass handle that pushed out through the solid wood
    build("frame-1400-0m46.67s.png", "alt1-it-had-no-handle.jpg", [("IT HAD", 150), ("NO HANDLE", 118)], centre=(560, 1000), strength=0.4, shade=0.25)
    # alt 2: the cold light under the door, broken by shadows (zoomed on the gap)
    build("frame-0735-0m24.50s.png", "alt2-whos-knocking.jpg", [("WHO'S", 160), ("KNOCKING?", 122)], centre=(540, 1000), strength=0.45, shade=0.3)
