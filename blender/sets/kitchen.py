# Engine 4, Phase 1: Maya's kitchen (Everyday Impossible #1, "The Friday Pizza"). An original room: our own geometry with
# bevelled cabinets, Poly Haven CC0 PBR textures (albedo, normal, roughness), kitbashed hero props, a dusk window and a
# warm pendant lamp. Built once here, the INDIRECT light baked once in Cycles into a lightmap, then exported as glTF for
# the three.js renderer (which adds the live lights, shadows, ambient occlusion and atmosphere on top).
#   blender -b --factory-startup -P blender/sets/kitchen.py -- <out_dir> <stages> [lightmap_px=1024] [samples=128]
#   stages: build (always) , preview (an Eevee look-dev image), bake (Cycles indirect lightmap), export (glb + exr)
# Coordinates in this file are THREE.js ones (x right, y up, z toward the camera); P() maps them into Blender's z-up.
import bpy, bmesh, math, os, sys, json, random
from mathutils import Vector, Matrix

args = sys.argv[sys.argv.index("--") + 1:]
OUT = args[0]; STAGES = set(args[1].split(",")); LM = int(args[2]) if len(args) > 2 else 1024; SAMPLES = int(args[3]) if len(args) > 3 else 128
HERE = os.path.dirname(os.path.abspath(__file__)); ASSETS = os.path.join(HERE, "assets", "kitchen"); os.makedirs(OUT, exist_ok=True)
MAN = json.load(open(os.path.join(ASSETS, "manifest.json")))
random.seed(5)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
P = lambda x, y, z: Vector((x, -z, y))                           # three -> Blender
T3 = lambda v: (v.x, v.z, -v.y)                                   # Blender -> three

# ------------------------------------------------------------------------------------------------ materials
SPEC = {}                                                         # name -> {"size": metres per texture tile or None}
def hexc(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)

def _img(nt, path, cs):
    n = nt.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(path, check_existing=True); n.image.colorspace_settings.name = cs; return n

def pbr(name, role, size, nstrength=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]; t = MAN[role]
    uv = nt.nodes.new("ShaderNodeUVMap"); uv.uv_map = "UVMap"
    d = _img(nt, t["diff"], "sRGB"); n = _img(nt, t["nor"], "Non-Color"); r = _img(nt, t["rough"], "Non-Color")
    for x in (d, n, r): nt.links.new(uv.outputs[0], x.inputs["Vector"])
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = nstrength
    nt.links.new(d.outputs["Color"], b.inputs["Base Color"]); nt.links.new(n.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"]); nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    SPEC[name] = {"size": size}; return m

def decal(name, file, rough=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    uv = nt.nodes.new("ShaderNodeUVMap"); uv.uv_map = "UVMap"; d = _img(nt, os.path.join(ASSETS, file), "sRGB")
    nt.links.new(uv.outputs[0], d.inputs["Vector"]); nt.links.new(d.outputs["Color"], b.inputs["Base Color"]); b.inputs["Roughness"].default_value = rough
    SPEC[name] = {"size": None, "unit": True}; return m

def plain(name, col, rough=0.5, metal=0.0, emit=None, estr=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(col); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit: b.inputs["Emission Color"].default_value = hexc(emit); b.inputs["Emission Strength"].default_value = estr
    SPEC[name] = {"size": 1.0}; return m

MAT = {
    "floor": pbr("floor", "floor", 1.3), "wall": pbr("wall", "wall", 1.6, 0.6), "tiles": pbr("tiles", "tiles", 0.9), "counter": pbr("counter", "counter", 0.8),
    "cabinet": pbr("cabinet", "cabinet", 0.8), "wood": pbr("wood", "wood", 0.9), "ceiling": pbr("ceiling", "ceiling", 1.6, 0.4),
    "drawing": decal("drawing", "drawing.jpg"), "note": decal("note", "note.jpg"), "cereal": decal("cerealbox", "cereal.jpg"),
    "white": plain("white", "#f4efe6", 0.45), "steel": plain("steel", "#cfd4d8", 0.28, 1.0), "brass": plain("brass", "#c9a24a", 0.3, 1.0),
    "kick": plain("kick", "#2a2a30", 0.7), "fridge": plain("fridge", "#cfe3da", 0.32), "dark": plain("dark", "#16161a", 0.6), "sinkdark": plain("sinkdark", "#6a6e72", 0.4, 1.0),
    "kettle": plain("kettle", "#c8402e", 0.22), "mugblue": plain("mugblue", "#3f7fbf", 0.25), "mugyellow": plain("mugyellow", "#f0c23a", 0.25), "ceramic": plain("ceramic", "#f7f4ee", 0.2),
    "bread": plain("bread", "#e8c98a", 0.8), "orange": plain("orange", "#f08a1c", 0.55), "cerealfill": plain("cerealfill", "#d7a24a", 0.8),
    "rug": plain("rug", "#b5543a", 0.95), "rugedge": plain("rugedge", "#e8cfa8", 0.95),
    "magR": plain("magR", "#d9332b", 0.4), "magY": plain("magY", "#f2c12e", 0.4), "magB": plain("magB", "#2f78c8", 0.4), "magG": plain("magG", "#38a05a", 0.4), "magP": plain("magP", "#e56aa0", 0.4),
    "lamp": plain("lampshade", "#f7e3c0", 0.6, 0.0, "#ffb866", 2.2), "bulb": plain("bulb", "#fff2d6", 0.4, 0.0, "#ffe2b0", 14.0), "cord": plain("cord", "#2a2a2a", 0.7),
}
# the dusk sky outside the window: an emissive gradient picture
sky = bpy.data.materials.new("sky"); sky.use_nodes = True; nt = sky.node_tree; b = nt.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0, 0, 0, 1); uvn = nt.nodes.new("ShaderNodeUVMap"); uvn.uv_map = "UVMap"; sk = _img(nt, os.path.join(ASSETS, "dusk.png"), "sRGB")
nt.links.new(uvn.outputs[0], sk.inputs["Vector"]); nt.links.new(sk.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = 1.0
SPEC["sky"] = {"size": None, "unit": True}; MAT["sky"] = sky
MAT["silhouette"] = plain("silhouette", "#141a2e", 0.9); MAT["winlit"] = plain("winlit", "#ffd9a0", 0.5, 0.0, "#ffc070", 3.0)

# ------------------------------------------------------------------------------------------------ geometry helpers
PARTS = []
def _finish(name, bm, mat, bevel=0.0, seg=2, smooth=True):
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=seg, profile=0.5, affect="EDGES")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    me.materials.append(MAT[mat]); ob["mat"] = MAT[mat].name; PARTS.append(ob)
    for p in me.polygons: p.use_smooth = smooth
    return ob

def box(name, c, s, mat, bevel=0.0, roty=0.0, rotz=0.0):
    """an axis box: centre c, size s (three coords); roty turns it about the vertical, rotz about the depth axis (a tilted plate)"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * s[0], v.co.y * s[2], v.co.z * s[1]))
    if roty: bmesh.ops.rotate(bm, verts=bm.verts[:], cent=(0, 0, 0), matrix=Matrix.Rotation(roty, 3, "Z"))
    if rotz: bmesh.ops.rotate(bm, verts=bm.verts[:], cent=(0, 0, 0), matrix=Matrix.Rotation(rotz, 3, "Y"))
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=P(*c))
    return _finish(name, bm, mat, bevel)

def seg(name, a, b, r0, r1, mat, n=14, caps=True, bevel=0.0):
    """a cone / cylinder between two points (three coords)"""
    pa, pb = P(*a), P(*b); d = pb - pa; L = d.length
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=n, radius1=r0, radius2=r1, depth=L)
    q = Vector((0, 0, 1)).rotation_difference(d.normalized()); bmesh.ops.rotate(bm, verts=bm.verts[:], cent=(0, 0, 0), matrix=q.to_matrix())
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=(pa + pb) / 2)
    return _finish(name, bm, mat, bevel)

def ball(name, c, r, mat, sq=(1, 1, 1), n=16):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=n, v_segments=max(6, n // 2), radius=r)
    for v in bm.verts: v.co = Vector((v.co.x * sq[0], v.co.y * sq[2], v.co.z * sq[1]))
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=P(*c)); return _finish(name, bm, mat)

def arc(name, pts, r, mat):
    for i in range(len(pts) - 1): seg(f"{name}{i}", pts[i], pts[i + 1], r, r, mat, 8)

# ------------------------------------------------------------------------------------------------ the room
X0, X1, Z0, Z1, H, T = -2.2, 2.2, -2.4, 3.6, 2.7, 0.12            # the room: x from X0 to X1, z from Z0 (back wall) to Z1 (front), height H, wall thickness T
WX0, WX1, WY0, WY1 = -0.7, 0.7, 1.05, 2.15                         # the window opening in the back wall
cz = (Z0 + Z1) / 2
box("floor", (0, -0.05, cz), (X1 - X0 + 2 * T, 0.1, Z1 - Z0 + 2 * T), "floor")
box("ceiling", (0, H + 0.05, cz), (X1 - X0 + 2 * T, 0.1, Z1 - Z0 + 2 * T), "ceiling")
box("wallL", (X0 - T / 2, H / 2, cz), (T, H, Z1 - Z0 + 2 * T), "wall"); box("wallR", (X1 + T / 2, H / 2, cz), (T, H, Z1 - Z0 + 2 * T), "wall")
box("wallF", (0, H / 2, Z1 + T / 2), (X1 - X0, H, T), "wall")
bz = Z0 - T / 2
box("wallBl", ((X0 + WX0) / 2, H / 2, bz), (WX0 - X0, H, T), "wall"); box("wallBr", ((WX1 + X1) / 2, H / 2, bz), (X1 - WX1, H, T), "wall")
box("wallBlow", (0, WY0 / 2, bz), (WX1 - WX0, WY0, T), "wall"); box("wallBhi", (0, (WY1 + H) / 2, bz), (WX1 - WX0, H - WY1, T), "wall")
# window frame, mullion, sill; the dusk outside (a sky picture, and the roof of Number 9 across the garden as a silhouette)
fw = 0.05
box("winTop", (0, WY1 - fw / 2, Z0 + 0.03), (WX1 - WX0, fw, 0.08), "white", 0.006); box("winBot", (0, WY0 + fw / 2, Z0 + 0.03), (WX1 - WX0, fw, 0.08), "white", 0.006)
box("winL", (WX0 + fw / 2, (WY0 + WY1) / 2, Z0 + 0.03), (fw, WY1 - WY0, 0.08), "white", 0.006); box("winR", (WX1 - fw / 2, (WY0 + WY1) / 2, Z0 + 0.03), (fw, WY1 - WY0, 0.08), "white", 0.006)
box("winMid", (0, (WY0 + WY1) / 2, Z0 + 0.03), (0.03, WY1 - WY0, 0.05), "white", 0.004); box("winCross", (0, (WY0 + WY1) / 2 + 0.1, Z0 + 0.03), (WX1 - WX0, 0.03, 0.05), "white", 0.004)
box("sill", (0, WY0 + 0.012, Z0 + 0.09), (WX1 - WX0 + 0.14, 0.025, 0.2), "white", 0.008)
skyp = box("skyplane", (0, 1.7, Z0 - T - 1.6), (8.0, 4.4, 0.02), "sky")
# skirting boards
for nm, c, s in (("skL", (X0 + 0.008, 0.045, cz), (0.016, 0.09, Z1 - Z0)), ("skR", (X1 - 0.008, 0.045, cz), (0.016, 0.09, Z1 - Z0)), ("skF", (0, 0.045, Z1 - 0.008), (X1 - X0, 0.09, 0.016))):
    box(nm, c, s, "white", 0.003)

# ------------------------------------------------------------------------------------------------ the counter run (back wall)
CX0, CX1, CD = -2.2, 1.2, 0.6
box("kick", ((CX0 + CX1) / 2, 0.05, Z0 + CD / 2 - 0.03), (CX1 - CX0, 0.1, CD - 0.06), "kick")
box("carcass", ((CX0 + CX1) / 2, 0.48, Z0 + CD / 2 - 0.01), (CX1 - CX0, 0.76, CD - 0.02), "cabinet", 0.006)
ndoor = 6; dw = (CX1 - CX0 - 0.03) / ndoor
for i in range(ndoor):
    x = CX0 + 0.015 + dw * (i + 0.5)
    box(f"door{i}", (x, 0.48, Z0 + CD + 0.0), (dw - 0.012, 0.72, 0.022), "cabinet", 0.005)
    box(f"dhandle{i}", (x + (0.2 if i % 2 == 0 else -0.2), 0.72, Z0 + CD + 0.022), (0.014, 0.12, 0.016), "brass", 0.004)
box("worktop", ((CX0 + CX1) / 2, 0.88, Z0 + CD / 2 + 0.02), (CX1 - CX0, 0.04, CD + 0.04), "counter", 0.007)
# backsplash tiles (the window gap is left open)
for nm, x0, x1, y0, y1 in (("tileL", X0, WX0, 0.9, 1.6), ("tileR", WX1, CX1, 0.9, 1.6), ("tileLow", WX0, WX1, 0.9, WY0)):
    box(nm, ((x0 + x1) / 2, (y0 + y1) / 2, Z0 + 0.006), (x1 - x0, y1 - y0, 0.012), "tiles", 0.002)
# the sink and tap
box("sink", (0.0, 0.902, Z0 + 0.32), (0.7, 0.008, 0.42), "steel", 0.004); box("sinkwell", (0.0, 0.906, Z0 + 0.32), (0.6, 0.006, 0.32), "sinkdark", 0.003)
seg("tapbase", (0, 0.9, Z0 + 0.1), (0, 0.935, Z0 + 0.1), 0.026, 0.02, "steel"); seg("tapneck", (0, 0.935, Z0 + 0.1), (0, 1.04, Z0 + 0.1), 0.012, 0.012, "steel")
arc("tapspout", [(0, 1.04, Z0 + 0.1), (0, 1.07, Z0 + 0.13), (0, 1.07, Z0 + 0.2), (0, 1.045, Z0 + 0.245), (0, 1.02, Z0 + 0.25)], 0.011, "steel")
seg("taplever", (0.012, 0.99, Z0 + 0.1), (0.075, 1.0, Z0 + 0.1), 0.007, 0.007, "steel")
# upper cabinets, left of the window
UX0, UX1, UY0, UY1, UD = X0, -0.85, 1.65, 2.3, 0.34
box("upper", ((UX0 + UX1) / 2, (UY0 + UY1) / 2, Z0 + UD / 2 - 0.01), (UX1 - UX0, UY1 - UY0, UD - 0.02), "cabinet", 0.006)
for i in range(2):
    x = UX0 + 0.015 + (UX1 - UX0 - 0.03) / 2 * (i + 0.5)
    box(f"udoor{i}", (x, (UY0 + UY1) / 2, Z0 + UD), (0.66, UY1 - UY0 - 0.03, 0.022), "cabinet", 0.005)
    box(f"uhandle{i}", (x + (0.27 if i == 0 else -0.27), UY0 + 0.14, Z0 + UD + 0.022), (0.014, 0.12, 0.016), "brass", 0.004)
# a small shelf right of the window with a clock above it
box("shelf", (1.0, 1.6, Z0 + 0.1), (0.5, 0.03, 0.2), "wood", 0.005)
for nm, x, h, m in (("jar1", 0.86, 0.14, "magY"), ("jar2", 1.0, 0.11, "magG"), ("jar3", 1.13, 0.16, "magB")): seg(nm, (x, 1.615, Z0 + 0.1), (x, 1.615 + h, Z0 + 0.1), 0.04, 0.04, m)

# ------------------------------------------------------------------------------------------------ the fridge, its magnets and the drawing
FX0, FX1, FY1, FZ = 1.3, 2.1, 1.85, Z0 + 0.75
box("fridge", ((FX0 + FX1) / 2, FY1 / 2 + 0.015, (Z0 + FZ) / 2), (FX1 - FX0, FY1 - 0.03, FZ - Z0), "fridge", 0.025)
box("fseam", ((FX0 + FX1) / 2, 1.22, FZ + 0.001), (FX1 - FX0 - 0.01, 0.007, 0.004), "dark"); box("fseamV", (FX1 - 0.02, 0.9, FZ + 0.001), (0.004, 0.62, 0.004), "dark")
box("fhandleTop", (FX0 + 0.06, 1.52, FZ + 0.03), (0.022, 0.3, 0.024), "steel", 0.008); box("fhandleBot", (FX0 + 0.06, 0.86, FZ + 0.03), (0.022, 0.4, 0.024), "steel", 0.008)
box("drawing", (1.78, 1.52, FZ + 0.0035), (0.2, 0.28, 0.003), "drawing", rotz=math.radians(-5)); box("note", (1.58, 1.3, FZ + 0.0035), (0.14, 0.18, 0.003), "note", rotz=math.radians(4))
for nm, x, y, m, col in (("m1", 1.69, 1.69, "magR", 1), ("m2", 1.88, 1.69, "magB", 1), ("m3", 1.5, 1.45, "magY", 1), ("m4", 1.95, 1.38, "magG", 1), ("m5", 1.68, 1.33, "magP", 1)):
    seg(nm, (x, y, FZ + 0.002), (x, y, FZ + 0.016), 0.024, 0.021, m, 14)
seg("m6", (1.9, 1.5, FZ + 0.002), (1.9, 1.5, FZ + 0.014), 0.03, 0.026, "orange", 3, bevel=0.0)     # a pizza-slice magnet (a triangular prism)

# ------------------------------------------------------------------------------------------------ hero props on the counter
KX = -1.55; KZ = Z0 + 0.28
seg("kettleBody", (KX, 0.9, KZ), (KX, 1.04, KZ), 0.095, 0.072, "kettle", 24); ball("kettleDome", (KX, 1.04, KZ), 0.072, "kettle", (1, 0.55, 1), 18)
seg("kettleLid", (KX, 1.075, KZ), (KX, 1.1, KZ), 0.014, 0.008, "steel"); seg("kettleBase", (KX, 0.9, KZ), (KX, 0.915, KZ), 0.1, 0.1, "steel")
arc("kettleSpout", [(KX + 0.07, 0.98, KZ), (KX + 0.12, 1.03, KZ), (KX + 0.155, 1.075, KZ)], 0.012, "kettle")
arc("kettleHandle", [(KX - 0.075, 1.08, KZ), (KX - 0.13, 1.05, KZ), (KX - 0.145, 0.995, KZ), (KX - 0.1, 0.945, KZ), (KX - 0.082, 0.935, KZ)], 0.011, "dark")
TX = -0.95; TZ = Z0 + 0.3
box("toaster", (TX, 0.985, TZ), (0.3, 0.17, 0.18), "steel", 0.032, 3); box("toasterTop", (TX, 1.0, TZ), (0.2, 0.004, 0.012), "dark")
for dz in (-0.04, 0.04):
    box(f"slot{int(dz*100)}", (TX, 1.0705, TZ + dz), (0.2, 0.003, 0.022), "dark"); box(f"bread{int(dz*100)}", (TX, 1.095, TZ + dz), (0.13, 0.055, 0.012), "bread", 0.01, 2)
box("lever", (TX + 0.16, 1.0, TZ), (0.02, 0.03, 0.05), "dark", 0.004); box("dial", (TX - 0.16, 0.975, TZ), (0.016, 0.034, 0.034), "dark", 0.006)
BX, BZ = 0.82, Z0 + 0.34
box("board", (BX, 0.912, BZ), (0.44, 0.024, 0.28), "wood", 0.007, roty=math.radians(10))
ball("orange1", (BX - 0.07, 0.962, BZ + 0.02), 0.04, "orange"); ball("orange2", (BX + 0.04, 0.962, BZ - 0.03), 0.04, "orange"); ball("leaf", (BX - 0.07, 1.0, BZ + 0.02), 0.012, "magG", (1.6, 0.4, 1))
box("knife", (BX + 0.12, 0.928, BZ + 0.07), (0.2, 0.004, 0.026), "steel", 0.001, roty=math.radians(32)); box("knifeH", (BX + 0.2, 0.93, BZ + 0.1), (0.08, 0.014, 0.02), "dark", 0.004, roty=math.radians(32))

# ------------------------------------------------------------------------------------------------ the table, chairs, rug and what's on the table
TXc, TZc = 0.35, -0.3
box("rug", (TXc, 0.006, TZc + 0.1), (2.2, 0.012, 1.6), "rug", 0.005); box("rugIn", (TXc, 0.013, TZc + 0.1), (1.9, 0.004, 1.3), "rugedge", 0.002); box("rugIn2", (TXc, 0.016, TZc + 0.1), (1.78, 0.004, 1.18), "rug", 0.002)
box("tabletop", (TXc, 0.75, TZc), (1.3, 0.04, 0.8), "wood", 0.008)
for i, (dx, dz) in enumerate(((-0.58, -0.33), (0.58, -0.33), (-0.58, 0.33), (0.58, 0.33))): box(f"leg{i}", (TXc + dx, 0.365, TZc + dz), (0.06, 0.73, 0.06), "wood", 0.006)
box("apronF", (TXc, 0.7, TZc + 0.35), (1.14, 0.07, 0.02), "wood", 0.004); box("apronB", (TXc, 0.7, TZc - 0.35), (1.14, 0.07, 0.02), "wood", 0.004)
def chair(nm, x, z, dr):
    box(nm + "seat", (x, 0.45, z), (0.42, 0.04, 0.42), "wood", 0.008)
    for i, (dx, dz) in enumerate(((-0.18, -0.18), (0.18, -0.18), (-0.18, 0.18), (0.18, 0.18))): box(f"{nm}l{i}", (x + dx, 0.215, z + dz), (0.034, 0.43, 0.034), "wood", 0.004)
    box(nm + "back", (x, 0.72, z - dr * 0.2), (0.42, 0.5, 0.03), "wood", 0.008); box(nm + "rail", (x, 0.58, z - dr * 0.2), (0.38, 0.05, 0.02), "wood", 0.004)
chair("chA", TXc - 0.3, TZc + 0.78, -1); chair("chB", TXc + 0.45, TZc + 0.74, -1); chair("chC", TXc, TZc - 0.8, 1)
# cereal: a bowl with the cereal in it, a spoon, a box; two mugs
bx, bz = TXc - 0.28, TZc + 0.1
seg("bowl", (bx, 0.77, bz), (bx, 0.83, bz), 0.052, 0.088, "ceramic", 28, True); seg("bowlcereal", (bx, 0.829, bz), (bx, 0.834, bz), 0.075, 0.075, "cerealfill", 28)
for k in range(10): ball(f"o{k}", (bx + 0.045 * math.cos(k * 2.4) * (0.4 + (k % 3) * 0.25), 0.842, bz + 0.045 * math.sin(k * 2.4) * (0.4 + (k % 3) * 0.25)), 0.014, "cerealfill", (1, 0.55, 1), 10)
seg("spoon", (bx + 0.16, 0.775, bz + 0.07), (bx + 0.05, 0.842, bz + 0.0), 0.006, 0.006, "steel", 8); ball("spoonH", (bx + 0.045, 0.846, bz - 0.005), 0.016, "steel", (1.2, 0.35, 0.8), 10)
box("cerealbox", (TXc + 0.38, 0.91, TZc - 0.2), (0.17, 0.28, 0.06), "cereal", 0.004, roty=math.radians(-14))
for nm, x, z, m in (("mugA", TXc + 0.1, TZc + 0.16, "mugblue"), ("mugB", TXc + 0.22, TZc - 0.04, "mugyellow")):
    seg(nm, (x, 0.77, z), (x, 0.865, z), 0.038, 0.04, m, 22); arc(nm + "h", [(x + 0.04, 0.84, z), (x + 0.075, 0.835, z), (x + 0.082, 0.8, z), (x + 0.05, 0.785, z), (x + 0.038, 0.788, z)], 0.007, m)
# the pendant lamp over the table: cord, shade (emissive), bulb
LP = (TXc, 1.72, TZc)
seg("cord", (LP[0], 1.86, LP[2]), (LP[0], H, LP[2]), 0.004, 0.004, "cord", 6); seg("shade", (LP[0], LP[1] - 0.1, LP[2]), (LP[0], LP[1] + 0.12, LP[2]), 0.23, 0.055, "lamp", 32)
ball("bulb", (LP[0], LP[1] - 0.115, LP[2]), 0.05, "bulb", (1, 1, 1), 16)
# a wall clock on the left wall and a coat hook rail by the front-left corner
seg("clock", (X0 + 0.004, 1.95, -0.6), (X0 + 0.04, 1.95, -0.6), 0.17, 0.17, "white", 36); seg("clockrim", (X0 + 0.004, 1.95, -0.6), (X0 + 0.034, 1.95, -0.6), 0.18, 0.18, "dark", 36)
box("hand1", (X0 + 0.046, 1.99, -0.6), (0.004, 0.1, 0.012), "dark"); box("hand2", (X0 + 0.046, 1.95, -0.54), (0.004, 0.012, 0.09), "dark")

# ------------------------------------------------------------------------------------------------ join, UVs, lightmap UVs, smoothing
def uv0(ob):
    me = ob.data; bm = bmesh.new(); bm.from_mesh(me); layer = bm.loops.layers.uv.get("UVMap") or bm.loops.layers.uv.new("UVMap"); sp = SPEC[ob["mat"]]; size = sp["size"]
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs((n.x, n.y, n.z)[i]))                  # Blender axis of the face normal
        for lp in f.loops:
            v = lp.vert.co; x, y, z = v.x, v.z, -v.y                                              # back to three coords
            if sp.get("unit"):   # decals / the sky: 0..1 across the front face
                bb = [ob.bound_box[i] for i in range(8)]; bx0 = min(b[0] for b in bb); bx1 = max(b[0] for b in bb); bz0 = min(b[2] for b in bb); bz1 = max(b[2] for b in bb)
                u, w = (v.x - bx0) / max(bx1 - bx0, 1e-6), (v.z - bz0) / max(bz1 - bz0, 1e-6)
            elif ax == 2: u, w = x / size, z / size          # a horizontal face (Blender z = three y): (x, z)
            elif ax == 0: u, w = z / size, y / size          # a face looking along x
            else: u, w = x / size, y / size                  # a face looking along z
            lp[layer].uv = (u, w)
    bm.to_mesh(me); bm.free()
for ob in PARTS: uv0(ob)
bpy.ops.object.select_all(action="DESELECT")
for ob in PARTS: ob.select_set(True)
bpy.context.view_layer.objects.active = PARTS[0]; bpy.ops.object.join()
kit = bpy.context.view_layer.objects.active; kit.name = "kitchen"; me = kit.data
me.use_auto_smooth = True; me.auto_smooth_angle = math.radians(38)
# a second UV map for the lightmap (a unique, non-overlapping atlas)
lm_uv = me.uv_layers.new(name="Lightmap"); me.uv_layers.active = lm_uv
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0035, area_weight=0.6, correct_aspect=True, scale_to_bounds=False)
bpy.ops.uv.pack_islands(margin=0.0035, rotate=True); bpy.ops.object.mode_set(mode="OBJECT")
me.uv_layers.active = me.uv_layers["UVMap"]
print("KITCHEN", len(me.vertices), "verts", len(me.polygons), "faces", len(me.materials), "materials")

# ------------------------------------------------------------------------------------------------ lights (the bake's twins of the live three.js lights)
def light(nm, kind, loc, col, watts, **kw):
    l = bpy.data.lights.new(nm, kind); l.color = col; l.energy = watts
    for k, v in kw.items(): setattr(l, k, v)
    o = bpy.data.objects.new(nm, l); sc.collection.objects.link(o); o.location = P(*loc); return o
win = light("window", "AREA", (0, 1.6, Z0 + 0.25), (0.62, 0.74, 1.0), 260.0, shape="RECTANGLE", size=1.3, size_y=1.0)
win.rotation_euler = (math.radians(-90 + 14), 0, 0)                                        # into the room (+three z), slightly downward
lamp = light("lamp", "SPOT", (LP[0], LP[1] - 0.12, LP[2]), (1.0, 0.72, 0.42), 300.0, spot_size=math.radians(150), spot_blend=0.85, shadow_soft_size=0.05)

# ------------------------------------------------------------------------------------------------ a look-dev camera
def camera(nm, pos, look, lens):
    cd = bpy.data.cameras.new(nm); cd.lens = lens; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 24
    co = bpy.data.objects.new(nm, cd); sc.collection.objects.link(co); co.location = P(*pos)
    co.rotation_euler = (P(*look) - P(*pos)).to_track_quat("-Z", "Y").to_euler(); return co
cam = camera("cam", (1.0, 1.35, 1.7), (-0.2, 1.0, -1.2), 22)
sc.camera = cam

# ------------------------------------------------------------------------------------------------ stages
if "preview" in STAGES:
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 540, 960
    ee = sc.eevee; ee.taa_render_samples = 24; ee.use_gtao = True; ee.use_soft_shadows = True; ee.use_ssr = True; ee.use_bloom = True
    sc.view_settings.view_transform = "Filmic"; sc.view_settings.exposure = 0.0
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.03, 0.04, 0.08, 1)
    sc.render.filepath = os.path.join(OUT, "preview.png"); bpy.ops.render.render(write_still=True); print("PREVIEW", sc.render.filepath)

def bake():
    import numpy as np
    sc.render.engine = "CYCLES"; cy = sc.cycles; cy.device = "CPU"; cy.samples = SAMPLES; cy.use_denoising = False; cy.max_bounces = 6; cy.sample_clamp_indirect = 4.0
    w = bpy.data.worlds.new("bakeworld"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0, 0, 0, 1)
    img = bpy.data.images.new("kitchen_lm", LM, LM, alpha=False, float_buffer=True); img.colorspace_settings.name = "Non-Color"
    for m in me.materials:                                                                        # the bake target node, active in every material
        n = m.node_tree.nodes.new("ShaderNodeTexImage"); n.image = img; m.node_tree.nodes.active = n
    me.uv_layers.active = me.uv_layers["Lightmap"]
    bpy.ops.object.select_all(action="DESELECT"); kit.select_set(True); bpy.context.view_layer.objects.active = kit
    b = sc.render.bake; b.use_pass_direct = False; b.use_pass_indirect = True; b.use_pass_color = False; b.margin = 6; b.margin_type = "EXTEND"; b.use_clear = True
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"INDIRECT"}, margin=6, margin_type="EXTEND", use_clear=True)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(LM, LM, 4)[:, :, :3]
    mask = (px.sum(-1) > 1e-7).astype(np.float32)
    def blur(a, s=1.6):                                                                         # a mask-aware gaussian: smooths the bake's noise without bleeding in the empty atlas
        r = int(s * 3); k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2); k /= k.sum()
        def b1(x, ax):
            pad = [(0, 0)] * x.ndim; pad[ax] = (r, r); xp = np.pad(x, pad, mode="edge"); out = np.zeros_like(x)
            for i, kv in enumerate(k): out += kv * np.take(xp, np.arange(i, i + x.shape[ax]), axis=ax)
            return out
        return b1(b1(a, 0), 1)
    num = blur(px * mask[..., None]); den = blur(mask)[..., None]; sm = np.where(den > 1e-4, num / np.maximum(den, 1e-4), 0)
    out = np.where(mask[..., None] > 0, sm, px)
    rgba = np.concatenate([out, np.ones((LM, LM, 1), np.float32)], -1)
    img.pixels = rgba.flatten().tolist(); img.update()
    print("LIGHTMAP mean", float(out[mask > 0].mean()), "max", float(out.max()), "coverage", float(mask.mean()))
    img.filepath_raw = os.path.join(OUT, "kitchen_lm.exr"); img.file_format = "OPEN_EXR"; sc.render.image_settings.file_format = "OPEN_EXR"; sc.render.image_settings.color_depth = "16"; sc.render.image_settings.exr_codec = "ZIP"
    img.save_render(os.path.join(OUT, "kitchen_lm.exr"), scene=sc); print("BAKED", os.path.join(OUT, "kitchen_lm.exr"))
    for m in me.materials:                                                                        # remove the target nodes again before the export
        for n in [n for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image == img]: m.node_tree.nodes.remove(n)

def export():
    # the glTF exporter only writes a second UV set that a material's texture uses: route a 1x1 white "occlusion" texture through
    # the Lightmap UVs (three.js reads TEXCOORD_1 as uv1 and the engine assigns the real lightmap; the occlusion map is dropped)
    ng = bpy.data.node_groups.new("glTF Material Output", "ShaderNodeTree"); ng.interface.new_socket(name="Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
    white = bpy.data.images.new("lm_dummy", 4, 4); white.pixels = [1.0] * 64; white.pack()
    for m in me.materials:
        nt = m.node_tree; g = nt.nodes.new("ShaderNodeGroup"); g.node_tree = ng
        u = nt.nodes.new("ShaderNodeUVMap"); u.uv_map = "Lightmap"; t = nt.nodes.new("ShaderNodeTexImage"); t.image = white
        nt.links.new(u.outputs[0], t.inputs["Vector"]); nt.links.new(t.outputs["Color"], g.inputs["Occlusion"])
    bpy.ops.object.select_all(action="DESELECT"); kit.select_set(True); bpy.context.view_layer.objects.active = kit
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "kitchen.glb"), export_format="GLB", use_selection=True, export_image_format="JPEG", export_jpeg_quality=86,
                              export_texcoords=True, export_normals=True, export_materials="EXPORT", export_cameras=False, export_lights=False, export_apply=True, export_yup=True)
    print("EXPORTED", os.path.join(OUT, "kitchen.glb"), os.path.getsize(os.path.join(OUT, "kitchen.glb")) // 1024, "KB")

if "bake" in STAGES: bake()
if "export" in STAGES: export()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "kitchen.blend"))
print("DONE")
