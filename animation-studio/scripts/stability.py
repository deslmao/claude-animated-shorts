#!/usr/bin/env python3
"""Temporal stability (flicker / crawl) of a lossless frame sequence (Visual Storytelling 2.0, P4).

    python3 scripts/stability.py <png dir> [--roi x,y,w,h] [--heat out.png] [--label name] [--json out.json]

For every pixel the temporal SECOND difference |f(t+1) - 2 f(t) + f(t-1)| (luma, 0-255): smooth camera motion and
steady fades score near zero, while a line that pops on and off between frames (aliasing crawl, flicker) scores
high. Reported per frame triple and over the run:
  flicker    mean second difference over the frame (or the region of interest)
  crawl px   share of pixels whose second difference exceeds 24 (a visible pop), in per mille
  p99        99th percentile
and a heat map (the run's mean second difference, x6). With --ref (the same frames at 2x size): ref_error = mean
error against that anti-aliased reference, ref_crawl = how much the error jitters frame to frame (the outline crawl
under camera motion, which plain second differences can't separate from the motion itself). Sharpness: mean gradient magnitude in the ROI (higher =
crisper), so a fix that blurs the flicker away shows up as lost sharpness.
"""
import argparse, glob, json, os, sys
import numpy as np
from PIL import Image

def load(path, roi):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    y = 0.2126 * im[..., 0] + 0.7152 * im[..., 1] + 0.0722 * im[..., 2]
    if roi: x0, y0, w, h = roi; y = y[y0:y0 + h, x0:x0 + w]
    return y

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir"); ap.add_argument("--roi"); ap.add_argument("--heat"); ap.add_argument("--label", default="")
    ap.add_argument("--json")
    ap.add_argument("--ref", help="the same frames rendered at 2x the size (downscaled here): an anti-aliased reference")
    a = ap.parse_args()
    files = sorted(glob.glob(os.path.join(a.dir, "*.png")))
    if len(files) < 3: sys.exit(f"need at least 3 frames in {a.dir}")
    roi = tuple(int(v) for v in a.roi.split(",")) if a.roi else None
    fr = [load(f, roi) for f in files]
    d2 = [np.abs(fr[i + 1] - 2 * fr[i] + fr[i - 1]) for i in range(1, len(fr) - 1)]
    per = [float(x.mean()) for x in d2]
    allv = np.stack(d2)
    gy, gx = np.gradient(np.stack(fr).mean(axis=0))
    res = {
        "label": a.label, "frames": len(files), "roi": roi,
        "flicker": round(float(allv.mean()), 3),
        "flicker_max_frame": round(max(per), 3),
        "crawl_per_mille": round(float((allv > 24).mean()) * 1000, 3),
        "p99": round(float(np.percentile(allv, 99)), 2),
        "sharpness": round(float(np.hypot(gx, gy).mean()), 3),
    }
    # against a 2x supersampled reference: aliasing is the error vs the reference, CRAWL is how much that error
    # jitters from frame to frame (smooth camera motion is in the reference too, so it cancels out)
    if a.ref:
        rf = sorted(glob.glob(os.path.join(a.ref, "*.png")))
        if len(rf) != len(files): sys.exit("reference frame count differs")
        def lref(p):
            im = Image.open(p).convert("RGB"); im = im.resize((im.width // 2, im.height // 2), Image.BOX)
            y = np.asarray(im).astype(np.float32); y = 0.2126 * y[..., 0] + 0.7152 * y[..., 1] + 0.0722 * y[..., 2]
            if roi: x0, y0, w, h = roi; y = y[y0:y0 + h, x0:x0 + w]
            return y
        err = [f - lref(r) for f, r in zip(fr, rf)]
        res["ref_error"] = round(float(np.mean([np.abs(e).mean() for e in err])), 3)
        jit = np.stack([np.abs(err[i + 1] - 2 * err[i] + err[i - 1]) for i in range(1, len(err) - 1)])
        res["ref_crawl"] = round(float(jit.mean()), 3)
        res["ref_crawl_per_mille"] = round(float((jit > 24).mean()) * 1000, 3)
        if a.heat: Image.fromarray(np.clip(jit.mean(axis=0) * 6, 0, 255).astype(np.uint8)).save(a.heat.replace(".png", "-crawl.png"))
    if a.heat:
        Image.fromarray(np.clip(allv.mean(axis=0) * 6, 0, 255).astype(np.uint8)).save(a.heat)
    print(json.dumps(res))
    if a.json:
        with open(a.json, "w") as f: json.dump(res, f)

if __name__ == "__main__":
    main()
