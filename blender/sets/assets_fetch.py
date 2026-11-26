# Fetch the Poly Haven (CC0) PBR textures for the Engine 4 sets into blender/sets/assets/ (git-ignored cache).
# Each texture gets its albedo (tinted to the set's palette where it's a painted surface), normal (OpenGL) and roughness
# maps at the resolution below. CC0: free for any use, no attribution needed.   python3 blender/sets/assets_fetch.py
import json, os, sys, time, urllib.request
from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "assets"); API = "https://api.polyhaven.com/files/"
RES = {"floor": "2k", "wall": "2k", "default": "1k"}
# role -> (Poly Haven id, albedo tint (multiply) or None, resolution)
KITCHEN = {
    "floor":   ("oak_wood_planks", None, "2k"),                  # warm oak boards
    "wall":    ("painted_plaster_wall", "#f4e3c6", "2k"),        # cream painted plaster
    "tiles":   ("long_white_tiles", "#fbf6ec", "1k"),            # the backsplash
    "counter": ("terrazzo_tiles", None, "1k"),                   # speckled terrazzo worktop
    "cabinet": ("white_planks_clean", "#8fb3a6", "1k"),          # sage-painted cabinet panels
    "wood":    ("wood_planks", None, "1k"),                      # the table, the cutting board, the shelf
    "ceiling": ("painted_plaster_wall", "#fff7ea", "1k"),
}

def get(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0: return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "thinkora-fetch"}), timeout=120) as r: data = r.read()
            open(dest, "wb").write(data); return
        except Exception as e:
            print("retry", url, e); time.sleep(2 * (i + 1))
    sys.exit(f"failed: {url}")

def tint(src, dst, hexcol):
    im = Image.open(src).convert("RGB"); c = tuple(int(hexcol.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
    ImageChops.multiply(im, Image.new("RGB", im.size, c)).save(dst, quality=92)

manifest = {}
for role, (aid, col, res) in KITCHEN.items():
    f = json.load(urllib.request.urlopen(urllib.request.Request(API + aid, headers={"User-Agent": "thinkora-fetch"}), timeout=60))
    d = os.path.join(OUT, "kitchen"); paths = {}
    for key, name in (("Diffuse", "diff"), ("nor_gl", "nor"), ("Rough", "rough")):
        dest = os.path.join(d, f"{role}_{name}_raw.jpg"); get(f[key][res]["jpg"]["url"], dest); paths[name] = dest
    final = os.path.join(d, f"{role}_diff.jpg")
    if col: tint(paths["diff"], final, col)
    else: Image.open(paths["diff"]).convert("RGB").save(final, quality=92)
    nor = os.path.join(d, f"{role}_nor.jpg"); Image.open(paths["nor"]).convert("RGB").save(nor, quality=88)
    rough = os.path.join(d, f"{role}_rough.jpg"); Image.open(paths["rough"]).convert("L").convert("RGB").save(rough, quality=88)
    manifest[role] = {"id": aid, "diff": final, "nor": nor, "rough": rough}; print("texture", role, aid, res)
json.dump(manifest, open(os.path.join(OUT, "kitchen", "manifest.json"), "w"), indent=1)

# ---- procedural decals for the kitchen (our own drawings): a child's drawing, a calendar note, a cereal box front, a dusk sky
from PIL import ImageDraw
def decals():
    d = os.path.join(OUT, "kitchen"); os.makedirs(d, exist_ok=True)
    im = Image.new("RGB", (512, 700), "#fbf8ef"); g = ImageDraw.Draw(im)                       # the child's drawing: house, sun, a pizza
    g.ellipse((340, 40, 460, 160), fill="#ffd23f"); [g.line((400 + 70 * c, 100 + 70 * s, 400 + 105 * c, 100 + 105 * s), fill="#ffb300", width=8) for c, s in ((1, 0), (-1, 0), (0, 1), (0, -1), (.7, .7), (-.7, .7), (.7, -.7), (-.7, -.7))]
    g.rectangle((70, 330, 330, 540), fill="#e85d4a"); g.polygon([(40, 330), (200, 190), (360, 330)], fill="#7a4b8f"); g.rectangle((170, 430, 240, 540), fill="#4aa3df"); g.rectangle((100, 370, 150, 420), fill="#ffe89a")
    g.pieslice((260, 520, 480, 700), 190, 350, fill="#f0b64a"); [g.ellipse((320 + 28 * k, 585 + 10 * (k % 2), 340 + 28 * k, 605 + 10 * (k % 2)), fill="#c8341c") for k in range(4)]
    g.line((20, 660, 490, 650), fill="#5ab552", width=14); im.save(os.path.join(d, "drawing.jpg"), quality=90)
    im = Image.new("RGB", (400, 520), "#fffdf5"); g = ImageDraw.Draw(im); g.rectangle((0, 0, 400, 90), fill="#e0524a")   # the calendar note: a grid, a ringed Friday
    for r in range(5):
        for c in range(7): g.rectangle((20 + c * 52, 130 + r * 70, 64 + c * 52, 186 + r * 70), outline="#9a9a9a", width=3)
    g.ellipse((20 + 4 * 52 - 6, 130 + 2 * 70 - 6, 64 + 4 * 52 + 6, 186 + 2 * 70 + 6), outline="#d3202a", width=7); im.save(os.path.join(d, "note.jpg"), quality=90)
    im = Image.new("RGB", (360, 520), "#f4b82e"); g = ImageDraw.Draw(im); g.ellipse((60, 90, 300, 330), fill="#fff3c4"); g.ellipse((100, 140, 260, 300), fill="#e8793a")   # the cereal box
    g.rectangle((0, 400, 360, 520), fill="#d6452f"); [g.ellipse((30 + 60 * k, 420, 70 + 60 * k, 460), fill="#f4b82e") for k in range(6)]; im.save(os.path.join(d, "cereal.jpg"), quality=90)
    im = Image.new("RGB", (8, 512)); px = im.load()                                                                   # the dusk sky outside the window (top to horizon)
    stops = [(0, (24, 38, 92)), (0.45, (66, 92, 160)), (0.78, (240, 150, 120)), (1.0, (255, 196, 140))]
    for y in range(512):
        t = y / 511.0
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                k = (t - t0) / (t1 - t0); col = tuple(int(c0[i] + (c1[i] - c0[i]) * k) for i in range(3))
        for x in range(8): px[x, y] = col
    im.save(os.path.join(d, "dusk.png"))
decals(); print("decals ok")
