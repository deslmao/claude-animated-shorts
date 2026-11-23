# An original sunny 80s-Miami-style city of our own, built procedurally in Blender (headless), for design stills.
# Our own buildings, palms and cars (no real models, no game assets); signs use made-up words only. Our 2D cast stands
# in it as camera-facing cards, the grammar measured in STUDY.md (full, detailed sets; the subject the brightest thing;
# light from the front / above; golden-hour long shadows).
#   blender -b --factory-startup -P blender/miami/miami.py -- <street|beach|motel> <out.png> [scale]
import bpy, sys, math, os, random

argv = sys.argv[sys.argv.index("--") + 1:]
PLACE, OUT = argv[0], argv[1]
SCALE = float(argv[2]) if len(argv) > 2 else 1.0
HERE = os.path.dirname(os.path.abspath(__file__))
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y = int(1080 * SCALE), int(1920 * SCALE)
sc.render.engine = "BLENDER_EEVEE"
ee = sc.eevee
ee.taa_render_samples = 32
ee.use_gtao = True; ee.gtao_distance = 1.5
ee.use_bloom = True; ee.bloom_threshold = 1.0; ee.bloom_intensity = 0.06
ee.use_soft_shadows = True; ee.shadow_cascade_size = "4096"
ee.use_ssr = True
ee.use_volumetric_lights = True; ee.volumetric_start = 2; ee.volumetric_end = 420; ee.volumetric_tile_size = "8"
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"; sc.view_settings.exposure = -0.15
# ink: thin near-black outlines on silhouettes and creases (Freestyle), ~3 px at 1080 wide
sc.render.use_freestyle = False; sc.render.line_thickness_mode = "ABSOLUTE"; sc.render.line_thickness = 2.6 * SCALE
vl = sc.view_layers[0]; vl.use_freestyle = True
fs = vl.freestyle_settings; fs.crease_angle = math.radians(140)
ls = fs.linesets.new("ink") if not fs.linesets else fs.linesets[0]
ls.select_by_visibility = True; ls.select_by_edge_types = True
ls.select_silhouette = True; ls.select_border = True; ls.select_crease = True
ls.linestyle = ls.linestyle or bpy.data.linestyles.new("inkstyle")
ls.linestyle.color = (0.03, 0.025, 0.035); ls.linestyle.thickness = 2.6 * SCALE
ls.select_by_collection = True
INKED = bpy.data.collections.new("inked"); sc.collection.children.link(INKED)
CARDS = bpy.data.collections.new("cards"); sc.collection.children.link(CARDS)
ls.collection = INKED

def hexc(h, a=1.0):
    h = h.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), a)

MATS = {}
def surface(m, kind, color):
    """procedural surface detail (STUDY: textured materials, never flat fills): colour variation plus a bump"""
    nt = m.node_tree; n = nt.nodes; L = nt.links; b = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord")
    base = hexc(color); dark = tuple(c * 0.78 for c in base[:3]) + (1,); light = tuple(min(1, c * 1.12) for c in base[:3]) + (1,)
    noise = n.new("ShaderNodeTexNoise"); L.new(tc.outputs["Object"], noise.inputs["Vector"])
    cfg = {"stucco": (14, 0.55, 0.25), "asphalt": (38, 0.6, 0.35), "sand": (22, 0.5, 0.3), "bark": (9, 0.6, 0.6), "tiles": (6, 0.5, 0.2), "lawn": (30, 0.6, 0.3)}[kind]
    noise.inputs["Scale"].default_value = cfg[0]; noise.inputs["Detail"].default_value = 8; noise.inputs["Roughness"].default_value = cfg[1]
    big = n.new("ShaderNodeTexNoise"); L.new(tc.outputs["Object"], big.inputs["Vector"]); big.inputs["Scale"].default_value = 0.35; big.inputs["Detail"].default_value = 3
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["A"].default_value = dark; mix.inputs["B"].default_value = light
    mul = n.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; L.new(noise.outputs["Fac"], mul.inputs[0]); L.new(big.outputs["Fac"], mul.inputs[1]); mul.inputs[1].default_value = 1
    add = n.new("ShaderNodeMath"); add.operation = "ADD"; L.new(noise.outputs["Fac"], add.inputs[0]); L.new(big.outputs["Fac"], add.inputs[1])
    half = n.new("ShaderNodeMath"); half.operation = "MULTIPLY"; L.new(add.outputs[0], half.inputs[0]); half.inputs[1].default_value = 0.5
    L.new(half.outputs[0], mix.inputs["Factor"]); col = mix.outputs["Result"]
    if kind == "asphalt" or kind == "tiles":
        vor = n.new("ShaderNodeTexVoronoi"); vor.feature = "DISTANCE_TO_EDGE"; L.new(tc.outputs["Object"], vor.inputs["Vector"])
        vor.inputs["Scale"].default_value = 0.6 if kind == "asphalt" else 2.4
        ramp = n.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (0.25, 0.25, 0.28, 1)
        ramp.color_ramp.elements[1].position = 0.0025 if kind == "asphalt" else 0.012; ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
        L.new(vor.outputs["Distance"], ramp.inputs["Fac"])
        crack = n.new("ShaderNodeMix"); crack.data_type = "RGBA"; crack.blend_type = "MULTIPLY"; crack.inputs["Factor"].default_value = 1
        L.new(col, crack.inputs["A"]); L.new(ramp.outputs["Color"], crack.inputs["B"]); col = crack.outputs["Result"]
    if kind == "bark":
        wave = n.new("ShaderNodeTexWave"); wave.wave_type = "RINGS" if False else "BANDS"; wave.bands_direction = "Z"; L.new(tc.outputs["Object"], wave.inputs["Vector"])
        wave.inputs["Scale"].default_value = 3.2; wave.inputs["Distortion"].default_value = 3
        mw = n.new("ShaderNodeMix"); mw.data_type = "RGBA"; mw.blend_type = "MULTIPLY"; mw.inputs["Factor"].default_value = 0.45
        L.new(col, mw.inputs["A"]); L.new(wave.outputs["Color"], mw.inputs["B"]); col = mw.outputs["Result"]
    L.new(col, b.inputs["Base Color"])
    bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = cfg[2]; bump.inputs["Distance"].default_value = 0.02
    L.new(noise.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], b.inputs["Normal"])

def mat(name, color, rough=0.75, metal=0.0, emit=None, estr=0.0, spec=0.3, tex=None):
    key = (name, color, rough, metal, emit, estr, tex)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(color); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Specular IOR Level" in b.inputs: b.inputs["Specular IOR Level"].default_value = spec
    if emit:
        b.inputs["Emission Color"].default_value = hexc(emit); b.inputs["Emission Strength"].default_value = estr
    if tex: surface(m, tex, color)
    MATS[key] = m; return m

def link(o, coll=INKED):
    for c in o.users_collection: c.objects.unlink(o)
    coll.objects.link(o); return o

def box(x, y, z, sx, sy, sz, m, bevel=0.0, rot=0.0, coll=INKED):
    """an axis box centred at (x, y) with its base at z; size sx, sy, sz"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + sz / 2), rotation=(0, 0, rot))
    o = bpy.context.object; o.scale = (sx, sy, sz); bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new("bev", "BEVEL"); md.width = bevel; md.segments = 3
    o.data.materials.append(m); return link(o, coll)

def cyl(x, y, z, r, h, m, verts=24, rot=(0, 0, 0), coll=INKED):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=(x, y, z + h / 2), rotation=rot)
    o = bpy.context.object; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return link(o, coll)

def text(s, x, y, z, size, m, rot=(math.pi / 2, 0, 0), extrude=0.04, align="CENTER"):
    bpy.ops.object.text_add(location=(x, y, z), rotation=rot)
    o = bpy.context.object; o.data.body = s; o.data.size = size; o.data.extrude = extrude
    o.data.align_x = align; o.data.align_y = "CENTER"
    o.data.materials.append(m); return link(o)

# ---------------------------------------------------------------- palette (pastel deco, golden hour)
PASTELS = ["#f4a9c0", "#8fd9c6", "#f7d27a", "#a9c4f0", "#f5b48f", "#c3a9ea", "#8fd0ea"]
TRIMS = ["#2fb5a7", "#ff7a8a", "#f2a541", "#5b8fd6", "#e36c9a", "#3fb3c9"]
GLASS = mat("glass", "#3d5f86", rough=0.15, spec=0.6)
WHITE = mat("trimwhite", "#f7f3ea", rough=0.6)
NEON = ["#ff4fa3", "#3ff0e0", "#ffd24a", "#a46bff"]

# ---------------------------------------------------------------- art-deco hotel
def hotel(x, y, w, d, floors, body, trim, sign, face=-1, tower=True):
    """an art-deco hotel: facade toward -y (face=-1) at y; w along x, d deep"""
    fh = 3.2; h = floors * fh + 1.2
    B = mat(f"b{body}", body, rough=0.8, tex="stucco"); T = mat(f"t{trim}", trim, rough=0.55)
    cy_ = y + d / 2 * (-face)
    box(x, cy_, 0, w, d, h, B, bevel=0.05)
    # stepped parapet and a racing-stripe band near the top
    box(x, cy_, h, w * 0.7, d * 0.8, 0.9, B, bevel=0.04); box(x, cy_, h + 0.9, w * 0.4, d * 0.6, 0.7, B, bevel=0.04)
    box(x, y + face * 0.04, h - 0.7, w * 1.001, 0.1, 0.28, T)
    for k in range(3): box(x, y + face * 0.05, h - 1.2 - k * 0.22, w * 0.6, 0.06, 0.08, T)
    # ground floor: a shopfront with a shaded porch and a canopy
    box(x, y + face * 0.3, 2.6, w * 0.98, 0.9, 0.18, T)                 # canopy
    for i in range(int(w // 2.2)):
        gx = x - w / 2 + 1.1 + i * 2.2
        box(gx, y + face * 0.03, 0.4, 1.6, 0.08, 1.9, GLASS)
        for k in range(4):                                                   # a striped awning over each window
            box(gx - 0.6 + k * 0.4, y + face * 0.75, 2.05, 0.4, 0.9, 0.08, T if k % 2 == 0 else WHITE, rot=0)
    for i in range(int(w // 3) + 1):                                         # pilasters up the facade
        box(x - w / 2 + 0.2 + i * (w - 0.4) / max(1, int(w // 3)), y + face * 0.06, 2.8, 0.22, 0.12, h - 3.6, WHITE)
    # upper floors: windows under "eyebrow" ledges
    for f in range(1, floors):
        z = f * fh + 0.6
        box(x, y + face * 0.35, z + 1.55, w * 0.96, 0.7, 0.1, WHITE)    # eyebrow ledge
        n = int(w // 1.9)
        for i in range(n):
            gx = x - w / 2 + (w / n) * (i + 0.5)
            box(gx, y + face * 0.02, z, 1.15, 0.06, 1.35, GLASS)
    # the rounded corner tower with porthole windows and the vertical fin sign
    if tower:
        tx = x + w / 2 - 1.6
        cyl(tx, y + face * 1.2, 0, 1.9, h + 2.2, B, verts=40)
        for f in range(1, floors + 1):
            box(tx, y + face * (1.2 + 1.8), f * fh + 0.2, 0.06, 0.1, 0.06, WHITE)
            cyl(tx, y + face * 3.07, f * fh - 0.9, 0.42, 0.06, GLASS, rot=(math.pi / 2, 0, 0))
        fin_x = x - w / 2 + 1.4
        box(fin_x, y + face * 0.9, 3.4, 0.35, 1.6, h - 1.6, T)
        nm = mat(f"neon{sign}", "#ffffff", emit=random.choice(NEON), estr=6.0)
        for k, ch in enumerate(sign):
            o = text(ch, fin_x - 0.21 * 0, y + face * 1.72, h - 0.9 - k * 1.05, 0.95, nm, rot=(math.pi / 2, 0, 0 if face < 0 else math.pi), extrude=0.03)
    # name across the canopy
    text(sign, x, y + face * 0.78, 2.72, 0.42, mat("signpaint", "#1d2340", rough=0.5), extrude=0.02)
    return h

# ---------------------------------------------------------------- palm tree
def frond_mat(name, color):
    """a palm frond: leaflets cut by the UVs (alpha), a midrib, colour variation, light passing through"""
    m = mat(name, color, rough=0.6); nt = m.node_tree; n = nt.nodes; L = nt.links; b = n["Principled BSDF"]
    uv = n.new("ShaderNodeUVMap"); sep = n.new("ShaderNodeSeparateXYZ"); L.new(uv.outputs[0], sep.inputs[0])
    mx = n.new("ShaderNodeMath"); mx.operation = "MULTIPLY"; mx.inputs[1].default_value = 34; L.new(sep.outputs["X"], mx.inputs[0])
    fr = n.new("ShaderNodeMath"); fr.operation = "FRACT"; L.new(mx.outputs[0], fr.inputs[0])
    gt = n.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.28; L.new(fr.outputs[0], gt.inputs[0])
    dy = n.new("ShaderNodeMath"); dy.operation = "SUBTRACT"; dy.inputs[1].default_value = 0.5; L.new(sep.outputs["Y"], dy.inputs[0])
    ab = n.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; L.new(dy.outputs[0], ab.inputs[0])
    rib = n.new("ShaderNodeMath"); rib.operation = "LESS_THAN"; rib.inputs[1].default_value = 0.06; L.new(ab.outputs[0], rib.inputs[0])
    a = n.new("ShaderNodeMath"); a.operation = "MAXIMUM"; L.new(gt.outputs[0], a.inputs[0]); L.new(rib.outputs[0], a.inputs[1])
    L.new(a.outputs[0], b.inputs["Alpha"])
    if "Subsurface Weight" in b.inputs: b.inputs["Subsurface Weight"].default_value = 0.25
    m.blend_method = "HASHED"; m.shadow_method = "HASHED"; return m
FROND = frond_mat("frond", "#4aa35a"); FROND2 = frond_mat("frond2", "#337f45"); DEADF = frond_mat("frondDead", "#a3874f")
TRUNK = mat("trunk", "#b08a62", rough=0.9, tex="bark"); NUT = mat("nut", "#6b4a2b", rough=0.8)
def palm(x, y, h=8.0, lean=0.0, seed=0):
    rnd = random.Random(seed); segs = 9; px, py, pz = x, y, 0.0
    ang = rnd.uniform(0, math.tau); dx, dy = math.cos(ang) * lean, math.sin(ang) * lean
    for i in range(segs):
        t = i / segs; r = 0.24 - 0.08 * t
        cyl(px, py, pz, r, h / segs * 1.02, TRUNK, verts=10)
        box(px, py, pz + h / segs * 0.92, r * 2.25, r * 2.25, 0.06, TRUNK)        # the trunk rings
        px += dx * (0.6 + t); py += dy * (0.6 + t); pz += h / segs
    for k in range(3): bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(px + 0.15 * math.cos(k * 2.1), py + 0.15 * math.sin(k * 2.1), pz - 0.15)); o = bpy.context.object; o.data.materials.append(NUT); link(o)
    NF = 14
    for k in range(NF):
        a = k / NF * math.tau + rnd.uniform(-0.2, 0.2); L = rnd.uniform(2.6, 3.6)
        dead = k % 7 == 3
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
        o = bpy.context.object; me = o.data
        # a long tapered leaf that droops: build from the plane by scaling and bending with a simple deform
        o.scale = (L, 0.95, 1); bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=8); bpy.ops.object.mode_set(mode="OBJECT")
        for v in me.vertices:
            u = min(1.0, max(0.0, (v.co.x + L / 2) / L))
            v.co.y *= (1 - u) ** 0.6 * 1.0 + 0.05
            v.co.z = (-1.7 if dead else -0.9) * u * u * L * 0.35
            v.co.x += L / 2
        o.location = (px, py, pz); o.rotation_euler = (rnd.uniform(-0.15, 0.15), -0.25 + (0.6 if dead else rnd.uniform(-0.25, 0.3)), a)
        o.data.materials.append(DEADF if dead else (FROND if k % 2 else FROND2))
        md = o.modifiers.new("thick", "SOLIDIFY"); md.thickness = 0.03
        link(o)

# ---------------------------------------------------------------- an 80s pastel car (our own design, not a real model)
def car(x, y, rot, body, top="#f7f3ea"):
    B = mat(f"car{body}", body, rough=0.35, spec=0.6); T = mat(f"cartop{top}", top, rough=0.5)
    CH = mat("chrome", "#d9dde2", rough=0.2, metal=0.9); TY = mat("tyre", "#1f1f26", rough=0.9)
    parts = []
    def P(o): parts.append(o); return o
    P(box(0, 0, 0.38, 1.9, 4.6, 0.62, B, bevel=0.08))                       # the long low body, square-edged
    P(box(0, -0.35, 1.0, 1.66, 2.2, 0.55, T, bevel=0.06))                  # the cabin (a contrasting roof)
    P(box(0, -0.35, 1.06, 1.7, 2.0, 0.4, GLASS, bevel=0.03))               # glass band
    P(box(0, 2.32, 0.42, 1.92, 0.1, 0.2, CH)); P(box(0, -2.32, 0.42, 1.92, 0.1, 0.2, CH))   # bumpers
    P(box(0, 0, 0.72, 1.92, 4.0, 0.05, CH))                                # a chrome side stripe
    for sx in (-0.72, 0.72):
        P(box(sx, 2.31, 0.66, 0.4, 0.06, 0.14, mat("lamp", "#fff3c9", emit="#fff3c9", estr=2.0)))
        P(box(sx, -2.31, 0.66, 0.4, 0.06, 0.14, mat("tail", "#ff5a6a", emit="#ff3a4a", estr=1.5)))
    for sx in (-0.88, 0.88):
        for sy in (-1.45, 1.45):
            P(cyl(sx - 0.12 * (1 if sx < 0 else -1), sy, 0.36, 0.36, 0.26, TY, verts=20, rot=(0, math.pi / 2, 0)))
    for o in parts:
        o.location = (o.location.x, o.location.y, o.location.z)
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts: o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join()
    o = bpy.context.object; o.location = (x, y, 0); o.rotation_euler = (0, 0, rot); return o

# ---------------------------------------------------------------- set dressing (STUDY.md: their sets are 1.3-2.4x fuller)
LEAF = mat("leafy", "#3f8a45", rough=0.8, tex="lawn"); LEAF2 = mat("leafy2", "#5aa250", rough=0.8, tex="lawn")
FLOWERS = [mat(f"flower{c}", c, rough=0.6) for c in ("#ff5c8a", "#ffd24a", "#ffffff", "#c86bff")]
def bush(x, y, r=0.7, z=0.0, seed=0, flowers=True):
    rnd = random.Random(seed)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r, location=(x, y, z + r * 0.7)); o = bpy.context.object
    o.scale = (1, rnd.uniform(0.8, 1.2), 0.85); tx = bpy.data.textures.new(f"bt{seed}", "CLOUDS"); tx.noise_scale = 0.35
    md = o.modifiers.new("lumpy", "DISPLACE"); md.texture = tx; md.strength = r * 0.45
    o.data.materials.append(LEAF if seed % 2 else LEAF2); bpy.ops.object.shade_smooth(); link(o)
    if flowers:
        for k in range(10):
            t, ph = rnd.uniform(0, math.tau), rnd.uniform(0.2, 1.3)
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.06, location=(x + math.cos(t) * math.sin(ph) * r * 1.05, y + math.sin(t) * math.sin(ph) * r * 1.05, z + r * 0.7 + math.cos(ph) * r * 0.9))
            f = bpy.context.object; f.data.materials.append(FLOWERS[seed % 4]); link(f)

def hedge(x0, x1, y, z=0.0, h=0.9, seed=0):
    for k, xx in enumerate([x0 + i * 0.9 for i in range(int((x1 - x0) / 0.9) + 1)]): bush(xx, y, r=0.55, z=z, seed=seed + k, flowers=k % 3 == 0)

def lamp(x, y, z=0.0):
    P = mat("lamp_pole", "#2d5f6a", rough=0.5); G = mat("globe", "#fff1cf", emit="#ffe3a8", estr=1.2)
    cyl(x, y, z, 0.08, 4.6, P, verts=10); box(x, y, z, 0.32, 0.32, 0.5, P)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(x, y, z + 4.85)); o = bpy.context.object; o.data.materials.append(G); link(o)

def trashcan(x, y, z=0.0, c="#2fb5a7"):
    cyl(x, y, z, 0.32, 0.95, mat(f"bin{c}", c, rough=0.5), verts=16); cyl(x, y, z + 0.95, 0.35, 0.08, mat("binlid", "#e7e2d8", rough=0.5), verts=16)

def newsbox(x, y, z=0.0, c="#f25f7a", word="DAILY SOL"):
    box(x, y, z, 0.55, 0.45, 1.05, mat(f"news{c}", c, rough=0.5), bevel=0.03); box(x, y - 0.23, z + 0.55, 0.42, 0.02, 0.3, GLASS)
    text(word, x, y - 0.245, z + 0.92, 0.07, mat("signpaint", "#1d2340", rough=0.5), extrude=0.005)

def phonebooth(x, y, z=0.0):
    F = mat("booth", "#d7dde3", rough=0.4, metal=0.4)
    box(x, y, z, 0.9, 0.9, 2.3, GLASS); box(x, y, z + 2.3, 1.0, 1.0, 0.22, F, bevel=0.03)
    for sx in (-0.45, 0.45):
        for sy in (-0.45, 0.45): box(x + sx, y + sy, z, 0.06, 0.06, 2.3, F)
    text("FONO", x, y - 0.52, z + 2.41, 0.12, mat("neonB", "#ffffff", emit="#ff4fa3", estr=7.0), extrude=0.01)

def trafficlight(x, y, z=0.0, rot=0.0):
    P = mat("tlpole", "#3d4a52", rough=0.5)
    cyl(x, y, z, 0.09, 5.4, P, verts=10); box(x + 1.4 * math.cos(rot), y + 1.4 * math.sin(rot), z + 5.2, 2.8, 0.12, 0.12, P, rot=rot)
    hx, hy = x + 2.5 * math.cos(rot), y + 2.5 * math.sin(rot); box(hx, hy, z + 4.1, 0.38, 0.32, 1.1, mat("tlhead", "#2b2d36", rough=0.5))
    for k, c in enumerate(["#ff4a4a", "#3a3020", "#2a3a2a"]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, location=(hx, hy - 0.17, z + 4.95 - k * 0.32)); o = bpy.context.object
        o.data.materials.append(mat(f"tl{k}", c, emit=c if k == 0 else None, estr=4.0 if k == 0 else 0)); link(o)

def streetsign(x, y, z, word, c="#2f6a43"):
    cyl(x, y, z, 0.04, 3.0, mat("signpole", "#9aa0a6", rough=0.4), verts=8)
    box(x, y, z + 2.8, 1.5, 0.05, 0.34, mat(f"ss{c}", c, rough=0.5)); text(word, x, y - 0.03, z + 2.97, 0.17, WHITE, extrude=0.005)

def cafe(x, y, z=0.0, n=3, c="#ff8aa0"):
    for i in range(n):
        tx = x + i * 2.2; cyl(tx, y, z, 0.04, 0.75, WHITE, verts=8); cyl(tx, y, z + 0.75, 0.42, 0.04, WHITE, verts=16)
        for s in (-1, 1): box(tx + s * 0.62, y, z, 0.42, 0.42, 0.45, mat(f"chair{c}", c, rough=0.6), bevel=0.02); box(tx + s * 0.62 + s * 0.19, y, z + 0.45, 0.05, 0.42, 0.45, mat(f"chair{c}", c, rough=0.6))
        cyl(tx, y, z, 0.03, 2.3, WHITE, verts=8)
        bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=1.2, radius2=0.04, depth=0.45, location=(tx, y, z + 2.4)); o = bpy.context.object; o.data.materials.append(mat(f"umb{c}", c, rough=0.6)); link(o)

def balcony_rows(x, y, w, floors, face=-1, every=2):
    R_ = mat("rail", "#f7f3ea", rough=0.5)
    for f in range(1, floors, every):
        z = f * 3.2 + 0.4
        box(x, y + face * 0.6, z, w * 0.5, 1.1, 0.12, WHITE)
        box(x, y + face * 1.12, z + 0.95, w * 0.5, 0.05, 0.05, R_)
        for k in range(int(w * 0.5 / 0.28)): box(x - w * 0.25 + k * 0.28, y + face * 1.12, z, 0.03, 0.03, 0.95, R_)

def ac_units(x, y, w, floors, face=-1, seed=0):
    rnd = random.Random(seed); U = mat("acunit", "#d9dcd6", rough=0.6)
    for f in range(1, floors):
        for k in range(2):
            if rnd.random() < 0.55: box(x + rnd.uniform(-w / 2.6, w / 2.6), y + face * 0.25, f * 3.2 + 0.2, 0.75, 0.5, 0.5, U, bevel=0.02)

def rooftop(x, y, h, seed=0):
    rnd = random.Random(seed); T = mat("tank", "#b9b2a6", rough=0.7)
    cyl(x + rnd.uniform(-3, 3), y + rnd.uniform(1, 4), h + 0.9, 0.9, 1.6, T, verts=16)
    cyl(x + rnd.uniform(-4, 4), y + rnd.uniform(1, 4), h + 0.9, 0.04, 3.5, mat("ant", "#6e7175", rough=0.4), verts=6)
    box(x + rnd.uniform(-3, 3), y + rnd.uniform(2, 5), h + 0.9, 1.4, 1.0, 0.8, mat("roofbox", "#cfc7ba", rough=0.8))

def crosswalk(x, y0, y1):
    for k in range(int((y1 - y0) / 0.9)): box(x, y0 + 0.45 + k * 0.9, 0.003, 3.2, 0.5, 0.01, mat("zebra", "#f4efe2", rough=0.6))

def beachchair(x, y, rot, c):
    C = mat(f"bc{c}", c, rough=0.7); Fm = mat("bcframe", "#f7f3ea", rough=0.5)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y, 0.35), rotation=(0.35, 0, rot)); o = bpy.context.object; o.scale = (0.6, 1.6, 1); o.data.materials.append(C)
    md = o.modifiers.new("t", "SOLIDIFY"); md.thickness = 0.03; link(o)
    for s in (-1, 1): box(x + s * 0.3 * math.cos(rot), y + s * 0.3 * math.sin(rot), 0, 0.04, 1.4, 0.35, Fm, rot=rot)

def sailboat(x, y, s=1.0, c="#f7f3ea"):
    box(x, y, -0.1, 1.4 * s, 4.5 * s, 0.6 * s, mat(f"hull{c}", c, rough=0.4), bevel=0.2 * s)
    cyl(x, y, 0.5 * s, 0.05 * s, 6 * s, WHITE, verts=6)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y + 0.9 * s, 3.4 * s), rotation=(math.pi / 2, 0, math.pi / 2)); o = bpy.context.object
    o.scale = (2.0 * s, 5.0 * s, 1); o.data.materials.append(mat("sail", "#fff6ea", rough=0.6)); link(o)

def gulls(cam_pos, look, n=6, seed=5):
    from mathutils import Vector
    rnd = random.Random(seed); fwd = Vector((look[0] - cam_pos[0], look[1] - cam_pos[1], 0)).normalized(); side = Vector((-fwd.y, fwd.x, 0))
    G = mat("gull", "#f4f4f4", rough=0.6)
    for k in range(n):
        c = Vector(cam_pos) + fwd * rnd.uniform(25, 60) + side * rnd.uniform(-12, 12); c.z = rnd.uniform(9, 22)
        for sgn in (-1, 1):
            bpy.ops.mesh.primitive_plane_add(size=1, location=c + side * sgn * 0.32, rotation=(0, sgn * 0.35, math.atan2(fwd.y, fwd.x) + math.pi / 2))
            o = bpy.context.object; o.scale = (0.7, 0.16, 1); o.data.materials.append(G); link(o)

def pier(x0, y0, length, w=4.0):
    W = mat("pierwood", "#a8835a", rough=0.85, tex="bark")
    box(x0, y0 - length / 2, 1.6, w, length, 0.25, W)
    for k in range(int(length / 4)):
        for s in (-1, 1): cyl(x0 + s * (w / 2 - 0.2), y0 - k * 4, -1, 0.18, 2.7, W, verts=8)
        box(x0 + w / 2 - 0.1, y0 - k * 4, 1.85, 0.1, 0.1, 1.0, W); box(x0 - w / 2 + 0.1, y0 - k * 4, 1.85, 0.1, 0.1, 1.0, W)

def stones(x0, x1, y0, y1, n=40, seed=3, color="#e8dcc6"):
    rnd = random.Random(seed); S = mat(f"shell{color}", color, rough=0.6)
    for k in range(n):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=rnd.uniform(0.04, 0.11), location=(rnd.uniform(x0, x1), rnd.uniform(y0, y1), 0.02)); o = bpy.context.object
        o.scale = (1, rnd.uniform(0.6, 1.3), 0.5); o.data.materials.append(S); link(o)

# ---------------------------------------------------------------- the cast: camera-facing cards (our own 2D characters)
def card(png, x, y, height, cam_xy, z=0.0):
    img = bpy.data.images.load(os.path.join(HERE, "cast", png))
    w, h = img.size; aspect = w / h
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    o = bpy.context.object; o.scale = (height * aspect, height, 1); bpy.ops.object.transform_apply(scale=True)
    for v in o.data.vertices: v.co.y, v.co.z = 0, v.co.y + height / 2
    o.location = (x, y, z)
    o.rotation_euler = (0, 0, math.atan2(cam_xy[1] - y, cam_xy[0] - x) - math.pi / 2 + math.pi)
    o.rotation_euler = (0, 0, math.atan2(-(cam_xy[0] - x), (cam_xy[1] - y)) + math.pi)
    m = bpy.data.materials.new(png); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); tx = nt.nodes.new("ShaderNodeTexImage"); tx.image = img
    em = nt.nodes.new("ShaderNodeEmission"); df = nt.nodes.new("ShaderNodeBsdfDiffuse"); add = nt.nodes.new("ShaderNodeAddShader")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(tx.outputs["Color"], em.inputs["Color"]); em.inputs["Strength"].default_value = 0.6
    nt.links.new(tx.outputs["Color"], df.inputs["Color"])
    nt.links.new(em.outputs[0], add.inputs[0]); nt.links.new(df.outputs[0], add.inputs[1])
    nt.links.new(tx.outputs["Alpha"], mix.inputs["Fac"]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(add.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    m.blend_method = "HASHED"; m.shadow_method = "HASHED"
    o.data.materials.append(m)
    return link(o, CARDS)

# ---------------------------------------------------------------- ground, sea, sky, sun
def ground(x0, x1, y0, y1, color, z=0.0, rough=0.9, name="ground", tex=None):
    return box((x0 + x1) / 2, (y0 + y1) / 2, z - 0.1, x1 - x0, y1 - y0, 0.1, mat(name, color, rough=rough, tex=tex))

def sea(y_edge, x0=-200, x1=200):
    S = mat("sea", "#21c4c6", rough=0.22, spec=0.35, emit="#18b8c4", estr=0.35)
    n = S.node_tree.nodes; b = n["Principled BSDF"]
    wave = n.new("ShaderNodeTexWave"); wave.inputs["Scale"].default_value = 0.6; wave.inputs["Distortion"].default_value = 6
    bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.05
    S.node_tree.links.new(wave.outputs["Fac"], bump.inputs["Height"]); S.node_tree.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    o = box((x0 + x1) / 2, y_edge - 300, -0.18, x1 - x0, 600, 0.1, S, coll=sc.collection)
    box((x0 + x1) / 2, y_edge - 0.6, -0.15, x1 - x0, 1.4, 0.06, mat("foam", "#f4fbf7", rough=0.6), coll=sc.collection)
    return o

def sky_and_sun(light_dir, strength=5.5):
    """a golden-hour gradient sky (peach horizon, warm blue top) and a low warm sun; light_dir = the way the light travels"""
    from mathutils import Vector
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; nt = w.node_tree
    bg = nt.nodes["Background"]; tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB"); cr = ramp.color_ramp
    cr.elements[0].position = 0.0; cr.elements[0].color = hexc("#ffc48f")
    cr.elements[1].position = 0.5; cr.elements[1].color = hexc("#4f90e6")
    mid = cr.elements.new(0.14); mid.color = hexc("#f7d9b0")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 1.0
    D = Vector(light_dir).normalized()
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 50))
    s = bpy.context.object; s.data.energy = strength; s.data.color = hexc("#ffb878")[:3]; s.data.angle = math.radians(1.5)
    s.rotation_euler = D.to_track_quat("-Z", "Y").to_euler(); s.data.use_contact_shadow = True
    # a soft violet-blue sky fill from the opposite side, so shadows stay coloured (never brown)
    F = Vector((-D.x, -D.y, D.z * 3)).normalized()
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 50)); f = bpy.context.object
    f.data.energy = 0.9; f.data.color = hexc("#8f9cff")[:3]; f.data.angle = math.radians(60); f.data.use_shadow = False
    f.rotation_euler = F.to_track_quat("-Z", "Y").to_euler()

def atmosphere(cam_pos, look, density=0.0016):
    """warm golden haze (atmospheric depth) plus painted cumulus far behind the scene, turned to the lens"""
    nt = sc.world.node_tree; vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value = hexc("#ffd6ad"); vol.inputs["Density"].default_value = density; vol.inputs["Anisotropy"].default_value = 0.35
    nt.links.new(vol.outputs[0], nt.nodes["World Output"].inputs["Volume"])
    from mathutils import Vector
    fwd = Vector((look[0] - cam_pos[0], look[1] - cam_pos[1], 0)).normalized(); side = Vector((-fwd.y, fwd.x, 0))
    rnd = random.Random(3)
    for k in range(9):
        d = rnd.uniform(260, 380); off = rnd.uniform(-1, 1) * d * 0.45; zc = rnd.uniform(70, 170)
        c = Vector(cam_pos) + fwd * d + side * off; c.z = zc
        bpy.ops.mesh.primitive_plane_add(size=1, location=c); o = bpy.context.object
        o.scale = (rnd.uniform(90, 160), rnd.uniform(40, 70), 1); o.rotation_euler = (math.pi / 2, 0, math.atan2(fwd.y, fwd.x) + math.pi / 2)
        m = bpy.data.materials.new(f"cloud{k}"); m.use_nodes = True; n = m.node_tree.nodes; n.clear(); Lk = m.node_tree.links
        out = n.new("ShaderNodeOutputMaterial"); tc = n.new("ShaderNodeTexCoord"); no = n.new("ShaderNodeTexNoise"); no.inputs["Scale"].default_value = 2.2; no.inputs["Detail"].default_value = 10
        grad = n.new("ShaderNodeTexGradient"); grad.gradient_type = "SPHERICAL"
        mp = n.new("ShaderNodeMapping"); mp.inputs["Location"].default_value = (-0.5, -0.5, 0)
        Lk.new(tc.outputs["Generated"], mp.inputs["Vector"]); Lk.new(mp.outputs[0], grad.inputs["Vector"]); Lk.new(tc.outputs["Generated"], no.inputs["Vector"])
        mm = n.new("ShaderNodeMath"); mm.operation = "MULTIPLY"; Lk.new(no.outputs["Fac"], mm.inputs[0]); Lk.new(grad.outputs["Fac"], mm.inputs[1])
        ramp = n.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].position = 0.18; ramp.color_ramp.elements[1].position = 0.34; Lk.new(mm.outputs[0], ramp.inputs["Fac"])
        em = n.new("ShaderNodeEmission"); em.inputs["Color"].default_value = hexc("#fff0e0"); em.inputs["Strength"].default_value = 1.15
        tr = n.new("ShaderNodeBsdfTransparent"); mx = n.new("ShaderNodeMixShader")
        Lk.new(ramp.outputs["Color"], mx.inputs["Fac"]); Lk.new(tr.outputs[0], mx.inputs[1]); Lk.new(em.outputs[0], mx.inputs[2]); Lk.new(mx.outputs[0], out.inputs["Surface"])
        m.blend_method = "BLEND"; m.shadow_method = "NONE"; o.data.materials.append(m)

def skyline(y0, n=40, x0=-160, x1=160):
    """the rest of the city, far off and hazed: towers and blocks in muted pastels"""
    rnd = random.Random(11)
    for i in range(n):
        x = rnd.uniform(x0, x1); y = y0 + rnd.uniform(0, 120); w = rnd.uniform(10, 24); h = rnd.uniform(10, 38)
        box(x, y, 0, w, rnd.uniform(10, 22), h, mat(f"far{i % 5}", ["#e7c6cf", "#cfe3df", "#efe0bd", "#d3d8ec", "#ecd2c2"][i % 5], rough=0.9), coll=sc.collection)

def grass(x0, x1, y0, y1, z=0.0, count=2600, color="#4f9a4a", length=0.32):
    """a strip of real grass blades (hair particles), STUDY: foliage everywhere"""
    bpy.ops.mesh.primitive_plane_add(size=1, location=((x0 + x1) / 2, (y0 + y1) / 2, z)); o = bpy.context.object
    o.scale = (x1 - x0, y1 - y0, 1); bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat("soil", "#6b5a3e", rough=1)); o.data.materials.append(mat(f"blade{color}", color, rough=0.7))
    ps = o.modifiers.new("grass", "PARTICLE_SYSTEM").particle_system.settings
    ps.type = "HAIR"; ps.count = count; ps.hair_length = length; ps.material = 2; ps.use_advanced_hair = True
    ps.root_radius = 0.6; ps.tip_radius = 0.0; ps.radius_scale = 0.012; ps.child_type = "INTERPOLATED"; ps.rendered_child_count = 6
    ps.brownian_factor = 0.06; ps.length_random = 0.5
    sc.collection.objects.link(o) if o.name not in sc.collection.objects else None

def camera(pos, look, lens=32):
    bpy.ops.object.camera_add(location=pos); c = bpy.context.object; c.data.lens = lens
    d = [look[i] - pos[i] for i in range(3)]
    c.rotation_euler = (math.atan2(math.hypot(d[0], d[1]), -d[2]), 0, math.atan2(d[1], d[0]) - math.pi / 2)
    sc.camera = c; c.data.sensor_fit = "VERTICAL"; c.data.sensor_height = 24
    c.data.dof.use_dof = True; c.data.dof.aperture_fstop = 5.6
    c.data.dof.focus_distance = math.dist(pos, look)
    return c

def mist(start, depth, color="#ffd7a8"):
    sc.world.node_tree.nodes["Background"]  # (Eevee volumetric haze would be costly; a light fog via the sky density)

# ---------------------------------------------------------------- the places
SIGNS = ["SOLVANA", "MIRALUX", "CORALEE", "PALMETTA", "BAYLUNE", "VELOMAR"]

def street():
    sky_and_sun((0.55, 0.8, -0.21))
    ground(-80, 80, -6, 6, "#55535f", name="asphalt", tex="asphalt")
    for xx in range(-60, 61, 6): box(xx, 0, 0.001, 2.6, 0.18, 0.01, mat("lane", "#f4e7c4", rough=0.6))
    ground(-80, 80, 6, 10, "#efdcc6", z=0.15, name="walk", tex="tiles")
    ground(-80, 80, -9, -6, "#efdcc6", z=0.15, name="walk2", tex="tiles")
    ground(-80, 80, -40, -9, "#f2d6a2", z=0.05, name="sand", tex="sand")
    for xx in range(-60, 61, 3): box(xx, 6.05, 0.0, 2.9, 0.15, 0.17, WHITE)
    sea(-40)
    x = -46
    for i, (w, fl) in enumerate([(14, 4), (16, 3), (13, 5), (17, 3), (14, 4), (15, 3)]):
        hotel(x + w / 2, 10.5, w, 14, fl, PASTELS[i % len(PASTELS)], TRIMS[i % len(TRIMS)], SIGNS[i], face=-1, tower=i % 2 == 0)
        x += w + 1.2
    for xx in range(-42, 43, 9): palm(xx, 8.4, h=random.uniform(7.5, 10), lean=0.08, seed=xx)
    for xx in range(-38, 39, 11):
        if not -9 < xx + 3 < 6: palm(xx + 3, -7.6, h=random.uniform(7, 9.5), lean=0.1, seed=xx + 99)
    LAMP = mat("lamp_pole", "#2d5f6a", rough=0.5); GLOBE = mat("globe", "#fff1cf", emit="#ffe3a8", estr=1.2)
    for xx in range(-40, 41, 8):
        for yy in (6.6, -6.6):
            cyl(xx + 4, yy, 0.15, 0.07, 4.4, LAMP, verts=10)
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(xx + 4, yy, 4.7)); o = bpy.context.object; o.data.materials.append(GLOBE); link(o)
    BENCH = mat("bench", "#f7f3ea", rough=0.6)
    for xx in (-12, 9, 24): box(xx, 7.6, 0.15, 2.0, 0.6, 0.45, BENCH); box(xx, 7.85, 0.6, 2.0, 0.1, 0.45, BENCH)
    for xx in (-20, 2, 13): cyl(xx, 6.9, 0.15, 0.22, 0.75, mat("hydrant", "#f25f7a", rough=0.5), verts=12)
    for xx in range(-44, 45, 5): box(xx, 9.2, 0.15, 1.4, 0.7, 0.55, mat("planter", "#e6b98a", rough=0.8)); box(xx, 9.2, 0.7, 1.2, 0.5, 0.25, FROND)
    car(-6.5, -2.2, math.pi / 2, "#6fd6c9"); car(3.2, 2.3, -math.pi / 2, "#f59ab4"); car(16, -2.4, math.pi / 2, "#fbd36b")
    skyline(150, n=55)
    for xx in range(-44, 45, 5): grass(xx - 0.6, xx + 0.6, 8.95, 9.45, z=0.95, count=500, length=0.22)
    # dressing: hedges with flowers under the hotels, café tables, bins, news boxes, a phone booth, a crossing,
    # traffic lights, street signs, a row of parked cars, balconies, AC units, rooftop clutter, curbs
    hedge(-44, 44, 9.75, z=0.15, seed=10)
    cafe(-30, 8.0, z=0.15, n=3, c="#ff8aa0"); cafe(8, 8.0, z=0.15, n=2, c="#7fd6e9")
    for xx in (-24, -6, 19, 33): trashcan(xx, 6.9, z=0.15, c=random.choice(["#2fb5a7", "#ff8aa0", "#f2a541"]))
    newsbox(-16, 6.9, z=0.15); newsbox(-15.3, 6.9, z=0.15, c="#3fb3c9", word="SOL TIMES"); phonebooth(4.8, 7.4, z=0.15)
    crosswalk(-10.5, -6, 6); crosswalk(28, -6, 6)
    trafficlight(-12.6, 6.6, z=0.15, rot=-math.pi / 2); trafficlight(-8.4, -6.6, z=0.15, rot=math.pi / 2)
    streetsign(-13.2, 6.5, 0.15, "MARINO DR"); streetsign(-7.6, -6.5, 0.15, "CALLE SOLANA", c="#2f4f8f")
    for k, xx in enumerate([-36, -29, -22, 10, 22, 29, 36]): car(xx, 4.6, -math.pi / 2, ["#c9a7f0", "#7fd6e9", "#ffb36b", "#f59ab4", "#8fd9c6", "#fbd36b", "#f7f3ea"][k])
    for k, xx in enumerate([-33, -18, 26, 34]): car(xx, -4.7, math.pi / 2, ["#ff8aa0", "#a9c4f0", "#f7d27a", "#c3a9ea"][k])
    box(0, 6.05, 0.0, 160, 0.3, 0.16, mat("curb", "#d8d2c6", rough=0.7)); box(0, -6.05, 0.0, 160, 0.3, 0.16, mat("curb", "#d8d2c6", rough=0.7))
    x = -46
    for i, (w, fl) in enumerate([(14, 4), (16, 3), (13, 5), (17, 3), (14, 4), (15, 3)]):
        balcony_rows(x + w / 2 + 1.5, 10.5, w, fl, every=1 if i % 2 else 2); ac_units(x + w / 2, 10.5, w, fl, seed=i); rooftop(x + w / 2, 10.5, fl * 3.2 + 2.1, seed=i)
        x += w + 1.2
    for xx in range(-40, 41, 10): bush(xx + 2.5, -7.8, r=0.6, z=0.15, seed=xx + 300)
    grass(-80, 80, -12.0, -9.3, z=0.06, count=9000, color="#8fa75a", length=0.18)
    # looking down the street (STUDY.md: their wides run deep, so every layer adds detail)
    cam = camera((-17.0, -7.6, 1.9), (14.0, 4.5, 4.2), lens=24)
    atmosphere(cam.location, (14.0, 4.5, 4.2))
    card("gordon_34.png", -12.6, -7.0, 1.85, (cam.location.x, cam.location.y), z=0.15)
    card("lucy_front.png", -12.0, -7.9, 1.62, (cam.location.x, cam.location.y), z=0.15)

def beach():
    sky_and_sun((0.4, -0.82, -0.42))
    ground(-80, 80, -16, 30, "#f7dca4", name="sand", tex="sand")
    sea(-16)
    # the lifeguard hut: stilts, a striped pastel cabin, a ramp, a flag of our own
    L = mat("hutpink", "#f7a8c4", rough=0.7); S = mat("hutmint", "#9fe3d1", rough=0.7)
    for sx in (-1.2, 1.2):
        for sy in (-1.0, 1.0): cyl(-5.6 + sx, -10.5 + sy, 0, 0.12, 2.2, WHITE, verts=8)
    box(-5.6, -10.5, 2.2, 3.2, 2.8, 0.2, WHITE)
    for k in range(5): box(-5.6 - 1.4 + k * 0.7, -2, 2.4, 0.7, 2.6, 2.0, L if k % 2 == 0 else S)
    box(-5.6, -10.5, 4.4, 3.8, 3.2, 0.25, mat("hutroof", "#2fb5a7", rough=0.6), bevel=0.05)
    box(-5.6, -9.05, 2.9, 2.4, 0.06, 1.0, GLASS)
    text("SURFIO", -5.6, -8.95, 3.95, 0.45, mat("signpaint", "#1d2340", rough=0.5), rot=(math.pi / 2, 0, math.pi))
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-7.3, -7.9, 1.1), rotation=(0, -0.42, 0)); r = bpy.context.object; r.scale = (2.6, 1.0, 1); r.data.materials.append(WHITE); link(r)
    cyl(-4.0, -9.1, 4.6, 0.04, 2.2, WHITE, verts=8); box(-3.55, -9.1, 6.25, 0.9, 0.04, 0.55, mat("flag", "#ff7a8a"))
    # umbrellas and towels
    for i, (ux, uy, c) in enumerate([(2.5, -7.5, "#ff8aa0"), (-9.5, -3, "#7fd6e9"), (1.5, -9, "#ffd36b"), (-6.5, -10, "#c9a7f0"), (2.5, -3.5, "#8fd9c6"), (-11, -7, "#ffb36b")]):
        cyl(ux, uy, 0, 0.04, 2.3, WHITE, verts=8)
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=1.5, radius2=0.05, depth=0.55, location=(ux, uy, 2.4)); o = bpy.context.object; o.data.materials.append(mat(f"umb{c}", c, rough=0.6)); link(o)
        box(ux + 0.9, uy - 0.6, 0.005, 0.9, 1.9, 0.02, mat(f"towel{c}", c, rough=0.9), rot=0.3)
    # a surfboard rack, a cooler, beach balls
    for k, c in enumerate(["#ff7a8a", "#3fb3c9", "#f7d27a", "#c3a9ea"]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(-3.2 + k * 0.32, -4.2, 1.1)); o = bpy.context.object; o.scale = (0.12, 0.42, 1.15); o.rotation_euler = (0.15, 0, 0); o.data.materials.append(mat(f"board{c}", c, rough=0.4)); link(o)
    box(-2.7, -4.5, 0, 1.6, 0.12, 0.5, WHITE); box(-0.3, -6.8, 0, 0.7, 0.45, 0.45, mat("cooler", "#3fb3c9", rough=0.5), bevel=0.05)
    for (bx, by, c) in [(1.2, -5.2, "#ff4fa3"), (-5.5, -8.0, "#ffd24a")]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(bx, by, 0.22)); o = bpy.context.object; o.data.materials.append(mat(f"ball{c}", c, rough=0.4)); link(o)
    for (px, py, h) in [(-10, -4, 9), (-7, 1, 7.5), (12, -1, 9.5), (15, -6, 8), (-14, -9, 8.5), (9, 3, 8), (7.5, -5, 8.8), (-5.5, -3, 7.8)]: palm(px, py, h=h, lean=0.12, seed=int(px * 10 + py))
    for k in range(5): bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(-3 + k * 2.2, -14.6, -0.3)); o = bpy.context.object; o.scale = (2.4, 0.5, 0.35); o.data.materials.append(mat("wet", "#d9b98a", rough=0.3)); link(o)
    # the beach-front hotels behind, across the dunes
    for i, xx in enumerate(range(-40, 41, 16)): hotel(xx, 26, 14, 10, 3 + i % 2, PASTELS[(i + 2) % 7], TRIMS[i % 6], SIGNS[(i + 2) % 6], face=-1, tower=i % 2 == 1)
    # dressing: beach chairs, more towels, a volleyball net, seaweed and shells, a pier and sailboats out at sea,
    # dune grass tufts and a fence, bushes, gulls
    for k, (bx, by, r_, c) in enumerate([(3.6, -3.0, 0.3, "#ff8aa0"), (4.6, -3.2, 0.2, "#7fd6e9"), (-8.2, -5.0, -0.2, "#ffd36b"), (-9.2, -5.4, -0.3, "#c9a7f0"), (8.0, -6.5, 0.1, "#8fd9c6")]): beachchair(bx, by, r_, c)
    for s_ in (-1, 1): cyl(11 + s_ * 3.5, -1.5, 0, 0.05, 2.4, WHITE, verts=8)
    box(11, -1.5, 1.6, 7.0, 0.03, 0.8, mat("net", "#2b2d36", rough=0.9))
    for k in range(14): box(-12 + k * 1.9, -14.3 + random.uniform(-0.4, 0.4), 0.01, random.uniform(0.6, 1.4), 0.12, 0.04, mat("seaweed", "#4f6a3a", rough=0.9), rot=random.uniform(-0.5, 0.5))
    stones(-14, 14, -14, 0, n=90)
    pier(-26, -16, 70); sailboat(18, -60, 1.3); sailboat(-8, -95, 1.6, c="#ffd0dc"); sailboat(40, -120, 2.0)
    for k in range(16): box(-20 + k * 2.6, 9.0, 0, 0.12, 0.12, 1.1, mat("fence", "#b8956a", rough=0.9, tex="bark"))
    box(0, 9.0, 0.85, 42, 0.05, 0.08, mat("fence", "#b8956a", rough=0.9, tex="bark"))
    for (bx, by) in [(-12, 6), (-9, 3.5), (10.5, 5), (14, 2)]: bush(bx, by, r=0.8, seed=int(bx * 3), flowers=False)
    cam = camera((-1.5, 7.5, 2.0), (1.5, -30, 1.6), lens=24)
    gulls(cam.location, (1.5, -30, 1.6), n=7)
    grass(-30, -8, 8, 14, count=4000, color="#8aa64e", length=0.5); grass(6, 30, 6, 12, count=4000, color="#8aa64e", length=0.5)
    atmosphere(cam.location, (1.5, -30, 1.6), density=0.0011)
    card("lucy_34.png", -1.7, -0.6, 1.62, (cam.location.x, cam.location.y))
    card("gordon_front.png", -0.4, -1.0, 1.85, (cam.location.x, cam.location.y))

def motel():
    sky_and_sun((0.5, 0.82, -0.22))
    ground(-60, 60, -40, 40, "#6a6872", name="lot", tex="asphalt")
    for k in range(-30, 31, 3): box(k, -10, 0.002, 0.12, 5, 0.01, mat("lane", "#f4e7c4", rough=0.6))
    # the motel: two storeys, an open walkway with a railing, doors in pastel, the office with a neon sign
    B = mat("motelbody", "#fbe3a8", rough=0.8, tex="stucco"); T = mat("moteltrim", "#2fb5a7", rough=0.55)
    box(0, 8, 0, 30, 6, 6.6, B, bevel=0.04)
    box(0, 4.6, 3.1, 30.4, 1.4, 0.22, WHITE)                       # the upper walkway slab
    for xx in range(-14, 15, 2): cyl(xx, 4.0, 0, 0.09, 3.1, WHITE, verts=8)
    box(0, 3.95, 4.2, 30.2, 0.06, 0.08, T); box(0, 3.95, 3.7, 30.2, 0.05, 0.05, T)
    box(0, 4.8, 6.6, 31, 2.2, 0.3, T, bevel=0.04)                   # the roof eave
    for row, z in ((0, 0.2), (1, 3.45)):
        for i, xx in enumerate(range(-13, 14, 3)):
            box(xx, 4.97, z, 1.0, 0.08, 2.1, mat(f"door{i%4}", ["#ff8aa0", "#7fd6e9", "#c9a7f0", "#ffb36b"][i % 4], rough=0.6))
            box(xx + 1.25, 4.97, z + 0.9, 0.9, 0.06, 0.8, GLASS)
    # the tall roadside sign: a pole, a pastel board, neon made-up words
    SX = 2.2
    cyl(SX, -2, 0, 0.18, 9, mat("pole", "#e7e2d8", rough=0.5), verts=12)
    box(SX, -2, 7.0, 5.2, 0.5, 2.6, mat("signboard", "#f7a8c4", rough=0.6), bevel=0.15)
    text("MOTEL", SX, -2.3, 8.6, 0.9, mat("neonA", "#ffffff", emit="#3ff0e0", estr=7.0))
    text("PALOMI", SX, -2.3, 7.7, 0.95, mat("neonB", "#ffffff", emit="#ff4fa3", estr=7.0))
    text("NO VACANSA", SX, -2.3, 6.9, 0.42, mat("neonC", "#ffffff", emit="#ffd24a", estr=5.0))
    # the pool: a white coping, a turquoise glow, a ladder and loungers
    box(4, -3, -0.02, 12.4, 7.4, 0.14, WHITE)
    P = mat("pool", "#33d6e8", rough=0.05, emit="#33d6e8", estr=0.25, spec=0.8)
    box(4, -3, 0.0, 12, 7, 0.13, P)
    for k in range(4): box(-1 + k * 3.3, -7.6, 0.02, 0.9, 2.0, 0.4, mat(f"lounger{k}", ["#ffffff", "#ff8aa0"][k % 2], rough=0.6))
    for (px, py, h) in [(-13, -6, 8.5), (12.5, -1, 9.5), (-3, 1.5, 7), (16, -8, 8)]: palm(px, py, h=h, lean=0.1, seed=int(px * 7 + py))
    car(-10.5, -11, math.pi / 2 + 0.25, "#c9a7f0"); car(11, -12.5, math.pi / 2 - 0.2, "#7fd6e9")
    skyline(140, n=55)
    grass(-16, 16, 11.2, 13, count=3000, length=0.35); grass(-15, -6, -9, -4, count=2500, length=0.3)
    # dressing: hedges along the motel, a vending machine and an ice box, the office block with its own neon,
    # pool ladder and a diving board, wheel stops, lamp posts, bins, potted plants
    hedge(-15, 15, 10.9, seed=40)
    box(-15.6, 4.6, 0, 1.0, 0.8, 1.9, mat("vend", "#e5484d", rough=0.4), bevel=0.04); box(-15.6, 4.18, 0.5, 0.8, 0.02, 1.2, mat("vendglow", "#fff2d6", emit="#fff2d6", estr=1.6))
    box(-14.2, 4.6, 0, 1.2, 0.8, 1.1, mat("icebox", "#e9eef2", rough=0.4), bevel=0.04); text("HIELO", -14.2, 4.18, 0.8, 0.22, mat("signpaint", "#2f6bbf", rough=0.5), extrude=0.005)
    box(19, 3, 0, 6, 5, 3.6, mat("office", "#f4a9c0", rough=0.8, tex="stucco"), bevel=0.04); box(19, 0.45, 0.4, 3.4, 0.08, 2.0, GLASS)
    text("OFICINA", 19, 0.4, 3.0, 0.5, mat("neonA", "#ffffff", emit="#3ff0e0", estr=7.0))
    for k in range(3): cyl(-1.4, -6.55 + k * 0.0, 0.0, 0.03, 1.1, mat("chrome", "#d9dde2", rough=0.2, metal=0.9), verts=8)
    box(9.6, -3, 0.12, 0.6, 2.6, 0.08, WHITE); box(9.6, -1.8, 0, 0.5, 0.3, 0.12, WHITE)
    for xx in range(-14, 15, 3): box(xx, -15.0, 0.0, 1.4, 0.25, 0.14, mat("wheelstop", "#f2d27a", rough=0.6))
    for xx in (-12, 0, 12): lamp(xx, -17.5)
    for xx in (-6, 6): trashcan(xx, 4.2, c="#2fb5a7")
    for (bx, by) in [(-1.5, -7.6), (10, -7.6), (14, -6)]: bush(bx, by, r=0.55, seed=int(bx * 5 + 7))
    car(-3.5, -12.8, math.pi / 2 - 0.1, "#ffb36b"); car(3.5, -13.0, math.pi / 2 + 0.06, "#f7f3ea"); car(15, -12.5, math.pi / 2, "#8fd9c6")
    cam = camera((-5.5, -22.0, 3.4), (0.5, 2, 2.6), lens=24)
    atmosphere(cam.location, (0.5, 2, 2.6))
    card("gordon_side.png", -4.6, -14.2, 1.85, (cam.location.x, cam.location.y))
    card("lucy_side.png", -3.5, -13.6, 1.62, (cam.location.x, cam.location.y))

{"street": street, "beach": beach, "motel": motel}[PLACE]()
sc.render.filepath = OUT
sc.render.image_settings.file_format = "PNG"
bpy.ops.render.render(write_still=True)
print("DONE", PLACE, OUT)
