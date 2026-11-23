# Fetch the Poly Haven (CC0) assets the Miami look uses into blender/miami/assets/ (git-ignored cache).
# CC0: free to use, no attribution needed. We use their textures, sky and plants as materials and dressing; our
# buildings, palms, cars and cast stay our own.   python3 blender/miami/assets_fetch.py
import json, os, sys, urllib.request, hashlib, time

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets")
API = "https://api.polyhaven.com/files/"
RES = "2k"
TEXTURES = {              # role -> Poly Haven id
    "asphalt": "asphalt_02", "walk": "concrete_pavers_02", "sand": "coast_sand_01", "wetsand": "damp_beach_sand",
    "stucco": "white_stucco", "bark": "palm_tree_bark", "planks": "weathered_planks", "lawn": "leafy_grass",
}
HDRIS = {"sky": "kloofendal_48d_partly_cloudy_puresky", "sky_warm": "qwantani_late_afternoon_puresky"}
MODELS = {                # role -> id (1k textures, the meshes are the same at every resolution)
    "shrub_a": "shrub_02", "shrub_b": "shrub_04", "tropical": "pachira_aquatica_01", "calathea": "calathea_orbifolia_01",
    "potted": "potted_plant_02", "grass": "grass_bermuda_01", "shell": "lambis_shell",
}

def get(url, dest, md5=None):
    if os.path.exists(dest) and (md5 is None or hashlib.md5(open(dest, "rb").read()).hexdigest() == md5): return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "thinkora-fetch"}), timeout=120) as r:
                data = r.read()
            open(dest, "wb").write(data); return
        except Exception as e:
            print("retry", url, e); time.sleep(2 * (i + 1))
    sys.exit(f"failed: {url}")

def files(aid):
    with urllib.request.urlopen(urllib.request.Request(API + aid, headers={"User-Agent": "thinkora-fetch"}), timeout=60) as r:
        return json.load(r)

manifest = {"textures": {}, "hdris": {}, "models": {}}
for role, aid in TEXTURES.items():
    f = files(aid); maps = {}
    for key, name in (("Diffuse", "diff"), ("nor_gl", "nor"), ("Rough", "rough")):
        e = f[key][RES]["jpg"]; dest = os.path.join(OUT, "textures", aid, f"{name}.jpg"); get(e["url"], dest, e.get("md5")); maps[name] = os.path.relpath(dest, OUT)
    manifest["textures"][role] = {"id": aid, **maps}; print("texture", role, aid)
for role, aid in HDRIS.items():
    e = files(aid)["hdri"][RES]["hdr"]; dest = os.path.join(OUT, "hdri", f"{aid}.hdr"); get(e["url"], dest, e.get("md5"))
    manifest["hdris"][role] = {"id": aid, "file": os.path.relpath(dest, OUT)}; print("hdri", role, aid)
for role, aid in MODELS.items():
    g = files(aid)["gltf"]["1k"]["gltf"]; base = os.path.join(OUT, "models", aid)
    get(g["url"], os.path.join(base, f"{aid}.gltf"), g.get("md5"))
    for rel, e in g.get("include", {}).items(): get(e["url"], os.path.join(base, rel), e.get("md5"))
    manifest["models"][role] = {"id": aid, "file": os.path.relpath(os.path.join(base, f"{aid}.gltf"), OUT)}; print("model", role, aid)
json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
print("DONE", OUT)
