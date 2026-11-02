# Lighting consistency test: Milo's face across every set and light (SetTour mode "lighting" stills).
#   python3 scripts/skin_consistency.py out/verify
# Samples Milo's cheeks (fixed patches: the close-up is shot-fitted identically in every set) and reports mean colour,
# brightness (luma) and warmth (R-B). PASS when every DAY / INTERIOR face is within +-8 % luma of their mean and within
# +-12 warmth (R-B, 0-255); golden-hour faces are reported separately (warmer by design).
import sys, glob, os
import numpy as np
from PIL import Image

d = sys.argv[1] if len(sys.argv) > 1 else "out/verify"
rows = []
for f in sorted(glob.glob(os.path.join(d, "*_lighting_*.jpg"))):
    im = np.asarray(Image.open(f).convert("RGB")).astype(float)
    h, w, _ = im.shape
    # the lighting close-up is shot-fitted identically in every set, so Milo's cheeks are at the same pixels in every
    # frame: sample two cheek patches (clear of eyes, brows, mouth and outline)
    patches = [im[int(h * 0.6):int(h * 0.68), int(w * 0.24):int(w * 0.32)], im[int(h * 0.6):int(h * 0.68), int(w * 0.66):int(w * 0.74)]]
    c = np.concatenate([q.reshape(-1, 3) for q in patches])
    skin = (c[:, 0] > c[:, 2] + 20) & (c[:, 0] > 150)
    n = int(skin.sum())
    if n < 0.9 * len(c):
        rows.append((os.path.basename(f), n, None)); continue
    m = c[skin].mean(0)
    rows.append((os.path.basename(f), n, m))
set_light = lambda name: (name.split("_")[0], "golden" if name.endswith("_1.jpg") else "day/interior")
base = [m for n, k, m in rows if m is not None and set_light(n)[1] != "golden"]
L = lambda m: 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]
meanL = np.mean([L(m) for m in base]); meanW = np.mean([m[0] - m[2] for m in base])
ok = True
print(f"{'still':32} {'skin px':>8} {'mean RGB':>16} {'luma':>6} {'dL%':>6} {'warmth':>7}")
for n, k, m in rows:
    if m is None: print(f"{n:32} {k:8}  face not found"); ok = False; continue
    dl = 100 * (L(m) - meanL) / meanL; warm = m[0] - m[2]; golden = set_light(n)[1] == "golden"
    flag = "" if golden or (abs(dl) <= 8 and abs(warm - meanW) <= 12) else "  <-- outside tolerance"
    if flag: ok = False
    print(f"{n:32} {k:8} {str(tuple(int(v) for v in m)):>16} {L(m):6.1f} {dl:6.1f} {warm:7.1f}{'  (golden: warmer by design)' if golden else ''}{flag}")
print("\nPASS" if ok else "\nFAIL")
sys.exit(0 if ok else 1)
