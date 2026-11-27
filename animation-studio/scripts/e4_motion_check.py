"""Engine 4 clip motion check (rendered pixels): per-frame mean absolute difference between consecutive frames of a clip.
usage: python3 scripts/e4_motion_check.py <frames_dir_of_gray_pngs>   (ffmpeg -i clip.mp4 -vf scale=270:480,format=gray dir/%03d.png)
Classes: identical (< 0.15), almost static (< 0.6), moving (>= 0.6), cut (> 20). Owner targets: identical 0.5-1 %, almost static ~2.5 %, camera-moving 10-30 %+ ."""
import sys, glob
import numpy as np
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + "/*.png")); a = [np.asarray(Image.open(f), dtype=np.float32) for f in fs]
d = [float(np.abs(a[i] - a[i - 1]).mean()) for i in range(1, len(a))]
n = len(d); cut = [i + 1 for i, x in enumerate(d) if x > 20]
ident = sum(x < 0.15 for x in d); still = sum(0.15 <= x < 0.6 for x in d); move = sum(0.6 <= x <= 20 for x in d)
print(f"{len(a)} frames, {n} transitions; cuts at frames {cut}")
print(f"identical to previous: {ident} ({100*ident/n:.1f} %)   almost static: {still} ({100*still/n:.1f} %)   moving: {move} ({100*move/n:.1f} %)")
nc = [x for x in d if x <= 20]
print(f"mean diff {np.mean(nc):.2f}, min {min(nc):.2f}, max {max(nc):.2f}, largest non-cut jump at frame {1 + int(np.argmax([x if x <= 20 else 0 for x in d]))}")
