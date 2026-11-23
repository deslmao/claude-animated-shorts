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
ee.taa_render_samples = 48
ee.use_gtao = True; ee.gtao_distance = 1.5
ee.use_bloom = True; ee.bloom_threshold = 1.0; ee.bloom_intensity = 0.06
ee.use_soft_shadows = True; ee.shadow_cascade_size = "4096"
ee.use_ssr = True
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"; sc.view_settings.exposure = -0.15
# ink: thin near-black outlines on silhouettes and creases (Freestyle), ~3 px at 1080 wide
sc.render.use_freestyle = True; sc.render.line_thickness_mode = "ABSOLUTE"; sc.render.line_thickness = 2.6 * SCALE
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
def mat(name, color, rough=0.75, metal=0.0, emit=None, estr=0.0, spec=0.3):
    key = (name, color, rough, metal, emit, estr)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(color); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Specular IOR Level" in b.inputs: b.inputs["Specular IOR Level"].default_value = spec
    if emit:
        b.inputs["Emission Color"].default_value = hexc(emit); b.inputs["Emission Strength"].default_value = estr
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
    B = mat(f"b{body}", body, rough=0.8); T = mat(f"t{trim}", trim, rough=0.55)
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
FROND = mat("frond", "#3e9e57", rough=0.7); FROND2 = mat("frond2", "#2f7f47", rough=0.7)
TRUNK = mat("trunk", "#b08a62", rough=0.9); NUT = mat("nut", "#6b4a2b", rough=0.8)
def palm(x, y, h=8.0, lean=0.0, seed=0):
    rnd = random.Random(seed); segs = 9; px, py, pz = x, y, 0.0
    ang = rnd.uniform(0, math.tau); dx, dy = math.cos(ang) * lean, math.sin(ang) * lean
    for i in range(segs):
        t = i / segs; r = 0.24 - 0.08 * t
        cyl(px, py, pz, r, h / segs * 1.02, TRUNK, verts=10)
        box(px, py, pz + h / segs * 0.92, r * 2.25, r * 2.25, 0.06, TRUNK)        # the trunk rings
        px += dx * (0.6 + t); py += dy * (0.6 + t); pz += h / segs
    for k in range(3): bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(px + 0.15 * math.cos(k * 2.1), py + 0.15 * math.sin(k * 2.1), pz - 0.15)); o = bpy.context.object; o.data.materials.append(NUT); link(o)
    for k in range(9):
        a = k / 9 * math.tau + rnd.uniform(-0.2, 0.2),
        a = a[0]; L = rnd.uniform(2.6, 3.4)
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
        o = bpy.context.object; me = o.data
        # a long tapered leaf that droops: build from the plane by scaling and bending with a simple deform
        o.scale = (L, 0.55, 1); bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=8); bpy.ops.object.mode_set(mode="OBJECT")
        for v in me.vertices:
            u = min(1.0, max(0.0, (v.co.x + L / 2) / L))
            v.co.y *= (1 - u) ** 0.6 * 1.0 + 0.05
            v.co.z = -0.9 * u * u * L * 0.35
            v.co.x += L / 2
        o.location = (px, py, pz); o.rotation_euler = (0, -0.25, a)
        o.data.materials.append(FROND if k % 2 else FROND2)
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
    nt.links.new(tx.outputs["Color"], em.inputs["Color"]); em.inputs["Strength"].default_value = 0.72
    nt.links.new(tx.outputs["Color"], df.inputs["Color"])
    nt.links.new(em.outputs[0], add.inputs[0]); nt.links.new(df.outputs[0], add.inputs[1])
    nt.links.new(tx.outputs["Alpha"], mix.inputs["Fac"]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(add.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    m.blend_method = "HASHED"; m.shadow_method = "HASHED"
    o.data.materials.append(m)
    return link(o, CARDS)

# ---------------------------------------------------------------- ground, sea, sky, sun
def ground(x0, x1, y0, y1, color, z=0.0, rough=0.9, name="ground"):
    return box((x0 + x1) / 2, (y0 + y1) / 2, z - 0.1, x1 - x0, y1 - y0, 0.1, mat(name, color, rough=rough))

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
    cr.elements[1].position = 0.55; cr.elements[1].color = hexc("#5f9be0")
    mid = cr.elements.new(0.14); mid.color = hexc("#f7d9b0")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 1.0
    D = Vector(light_dir).normalized()
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 50))
    s = bpy.context.object; s.data.energy = strength; s.data.color = hexc("#ffb878")[:3]; s.data.angle = math.radians(1.5)
    s.rotation_euler = D.to_track_quat("-Z", "Y").to_euler()
    # a soft violet-blue sky fill from the opposite side, so shadows stay coloured (never brown)
    F = Vector((-D.x, -D.y, D.z * 3)).normalized()
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 50)); f = bpy.context.object
    f.data.energy = 0.9; f.data.color = hexc("#8f9cff")[:3]; f.data.angle = math.radians(60); f.data.use_shadow = False
    f.rotation_euler = F.to_track_quat("-Z", "Y").to_euler()

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
    ground(-80, 80, -6, 6, "#55535f", name="asphalt")
    for xx in range(-60, 61, 6): box(xx, 0, 0.001, 2.6, 0.18, 0.01, mat("lane", "#f4e7c4", rough=0.6))
    ground(-80, 80, 6, 10, "#efdcc6", z=0.15, name="walk")
    ground(-80, 80, -9, -6, "#efdcc6", z=0.15, name="walk2")
    ground(-80, 80, -40, -9, "#f2d6a2", z=0.05, name="sand")
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
    cam = camera((-2.5, -17.0, 2.0), (1.5, 8, 5.5), lens=24)
    card("rico_34.png", -1.6, -8.2, 1.85, (cam.location.x, cam.location.y), z=0.15)
    card("lola_front.png", -0.4, -7.8, 1.62, (cam.location.x, cam.location.y), z=0.15)

def beach():
    sky_and_sun((0.4, -0.82, -0.42))
    ground(-80, 80, -16, 30, "#f7dca4", name="sand")
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
    cam = camera((-1.5, 7.5, 2.0), (1.5, -30, 1.6), lens=24)
    card("lola_34.png", -1.7, -0.6, 1.62, (cam.location.x, cam.location.y))
    card("rico_front.png", -0.4, -1.0, 1.85, (cam.location.x, cam.location.y))

def motel():
    sky_and_sun((0.5, 0.82, -0.22))
    ground(-60, 60, -40, 40, "#e9d3b8", name="lot")
    for k in range(-30, 31, 3): box(k, -10, 0.002, 0.12, 5, 0.01, mat("lane", "#f4e7c4", rough=0.6))
    # the motel: two storeys, an open walkway with a railing, doors in pastel, the office with a neon sign
    B = mat("motelbody", "#fbe3a8", rough=0.8); T = mat("moteltrim", "#2fb5a7", rough=0.55)
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
    cam = camera((-5.5, -22.0, 3.4), (0.5, 2, 2.6), lens=24)
    card("rico_side.png", -4.6, -14.2, 1.85, (cam.location.x, cam.location.y))
    card("lola_side.png", -3.5, -13.6, 1.62, (cam.location.x, cam.location.y))

{"street": street, "beach": beach, "motel": motel}[PLACE]()
sc.render.filepath = OUT
sc.render.image_settings.file_format = "PNG"
bpy.ops.render.render(write_still=True)
print("DONE", PLACE, OUT)
