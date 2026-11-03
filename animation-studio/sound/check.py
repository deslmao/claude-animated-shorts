# Sound library self-test (stage 3B):  python3 sound/check.py [catalog.json]
# Renders every sound effect, every ambience bed (6 s) and every music mood (two sections, with the ending button), and
# fails if anything is silent, not finite, clips absurdly, has the wrong length, or if the storyboard catalogue
# (src/studio/sound/catalog.ts, exported by `npm run test:sound`) names something this library doesn't implement.
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import ns, rng, st, integrated, true_peak, momentary_max  # noqa: E402
from library import SFX, AMBIENCE  # noqa: E402
import music as M  # noqa: E402

fails = []


def check(kind, name, x, want_len=None):
    x = np.asarray(x, float)
    ok = np.isfinite(x).all() and np.abs(x).max() > 1e-4
    msg = ""
    if not np.isfinite(x).all():
        msg = "not finite"
    elif np.abs(x).max() <= 1e-4:
        msg = "silent"
    elif want_len is not None and abs(x.shape[-1] - want_len) > ns(0.05):
        ok, msg = False, f"length {x.shape[-1] / 48000:.2f} s"
    level = momentary_max(x) if kind == "sfx" else integrated(x)
    if ok and np.abs(x).max() > 8:
        ok, msg = False, f"peak {np.abs(x).max():.1f} (gain staging)"
    print(f"  {'ok  ' if ok else 'FAIL'} {kind:8s} {name:18s} {x.shape[-1] / 48000:5.2f} s  level {level:6.1f}  {msg}")
    if not ok:
        fails.append(f"{kind} {name}: {msg}")


print("sound effects")
for name, fn in SFX.items():
    check("sfx", name, fn(rng(1)))
print("ambience beds")
for name, fn in AMBIENCE.items():
    check("ambience", name, fn(6.0, rng(2)), ns(6.0))
print("music moods")
for mood in M.MOODS:
    x, cues = M.compose([(mood, 0.0, 6.0), ("curious" if mood != "curious" else "warm", 6.0, 12.0)], 12.0, 10.5, seed=5)
    check("music", mood, x, ns(12.0))
    tp = true_peak(x)
    if not np.isfinite(tp):
        fails.append(f"music {mood}: no true peak")

if len(sys.argv) > 1:
    cat = json.load(open(sys.argv[1]))
    for k, lib in [("sfx", SFX), ("ambience", AMBIENCE), ("moods", M.MOODS)]:
        missing = [n for n in cat[k] if n not in lib]
        extra = [n for n in lib if n not in cat[k]]
        if missing:
            fails.append(f"catalogue names {k} not implemented: {', '.join(missing)}")
        if extra:
            fails.append(f"implemented {k} missing from the catalogue (validator would reject them): {', '.join(extra)}")
    print(f"catalogue: {sum(len(v) for v in cat.values())} names compared")

print(f"\n{len(fails)} problem(s)" if fails else "\nall sounds render, all catalogue names implemented")
for f in fails:
    print("  " + f)
sys.exit(1 if fails else 0)
