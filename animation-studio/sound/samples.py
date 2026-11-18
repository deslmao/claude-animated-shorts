# Recorded-style samples (opt-in, additions only): the sounds in sound/samples/specs.json, generated once with the
# ElevenLabs Sound Effects API (sound/samples_fetch.py) and committed as sound/samples/<name>.mp3.
#   el_*   one-shot effects (SFX); mono, or stereo when the spec says so (build.py keeps those wide, unpanned)
#   elb_*  ambience beds: seamless loops, stereo, looped with crossfades to any length
# Only storyboards that name them use them, so every existing soundtrack is unchanged.
import json
import os
import subprocess

import numpy as np

from dsp import SR, ns

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")
_SPEC = json.load(open(os.path.join(DIR, "specs.json"))) if os.path.exists(os.path.join(DIR, "specs.json")) else {"sfx": {}, "bed": {}}
_cache = {}


def decode(path, ch):
    key = (path, ch)
    if key not in _cache:
        p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
        x = np.frombuffer(p.stdout, np.float32).astype(np.float64)
        _cache[key] = x.reshape(-1, ch).T.copy() if ch == 2 else x
    return _cache[key].copy()


def _sfx(name, stereo):
    return lambda r: decode(os.path.join(DIR, f"{name}.mp3"), 2 if stereo else 1)


def _bed(name):
    def bed(dur, r):
        x = decode(os.path.join(DIR, f"{name}.mp3"), 2)
        n, L, f = ns(dur), x.shape[1], ns(1.0)
        out = np.zeros((2, n))
        # start at a seeded point in the loop, so two shots on one bed don't sound identical; 1 s crossfades
        seg = np.roll(x, -int(r.uniform(0, 0.6) * L), axis=1)
        m = min(L, n)
        out[:, :m] = seg[:, :m]
        at = m
        while at < n:   # each further pass overlaps the last by f samples (equal-power crossfade)
            k = min(f, at)
            m = min(L, n - at + k)
            a = np.sqrt(np.linspace(0, 1, k))
            out[:, at - k:at] = out[:, at - k:at] * a[::-1] + x[:, :k] * a
            out[:, at:at + m - k] = x[:, k:m]
            at += m - k
        return out
    return bed


SAMPLE_SFX = {name: _sfx(name, s.get("stereo", False)) for name, s in _SPEC["sfx"].items()}
SAMPLE_BEDS = {name: _bed(name) for name in _SPEC["bed"]}
SAMPLE_LEVEL = {name: s["level"] for name, s in _SPEC["sfx"].items() if "level" in s}
STEREO = {name for name, s in _SPEC["sfx"].items() if s.get("stereo")}
SCORE_DIR = os.path.join(DIR, "music")
