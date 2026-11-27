"""Engine 4 audio check (Phase 4):  python3 scripts/e4_audio_check.py <story-id>
Reads out/sound/<id>.plan.json and the stems out/sound/<id>/*.wav (written by npm run sound) and reports:
  - the SFX rhythm: every cue time, the gaps between them (target one hit every 1.5-2.5 s) and which cues are on a spoken word's own timestamp
  - the music duck: the level of the music stem inside each duck span (dialogue punchlines, major SFX hits) against its level in the clear
    (no voice, no span), in dB, and against the 8 dB target"""
import json, subprocess, sys
import numpy as np

id_ = sys.argv[1]
P = json.load(open(f"out/sound/{id_}.plan.json"))
SR = 48000

def load(name):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", f"out/sound/{id_}/{name}.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).astype(np.float64)

cues = sorted(P["cues"], key=lambda c: c["t"])
words = P["words"]
print(f"{len(cues)} SFX cues in {P['seconds']:.1f} s")
ts = [c["t"] for c in cues]
for c in cues:
    on = next((w for w in words if abs(w[0] - c["t"]) < 0.16), None)
    print(f"  {c['t']:6.2f} s  {c['name']:<16} {'MAJOR ' if c.get('major') else '      '} {'on a word (%.2fs)' % on[0] if on else c.get('why', '')}")
gaps = np.diff(ts) if len(ts) > 1 else np.array([])
lead = ts[0] if ts else 0
print(f"gaps between hits: mean {gaps.mean():.2f} s, max {gaps.max():.2f} s; first hit at {lead:.2f} s; last at {ts[-1]:.2f} s; hits per 10 s: {len(cues) / P['seconds'] * 10:.1f}")
word_sfx = [c for c in cues if any(abs(w[0] - c['t']) < 0.16 for w in words)]
print(f"cues on a spoken word's timestamp: {len(word_sfx)} of {len(cues)}")

m = load("music"); n = len(m)
spans = P.get("duck", {}).get("spans", [])
# 1. the duck, measured on a constant tone through the builder's own function: the depth under spans, under plain words, and in the clear
sys.path.insert(0, "sound")
import build  # noqa: E402
test = build.apply_duck(np.ones((2, n)), P, build.DUCK_DB)[0]
db = 20 * np.log10(np.maximum(test, 1e-9))
span_mask = np.zeros(n, bool)
for a, b in spans:
    span_mask[max(0, int(a * SR)):min(n, int(b * SR))] = True
voice = np.zeros(n, bool)
for a, b in words:
    voice[max(0, int((a - 0.05) * SR)):min(n, int((b + 0.25) * SR))] = True
core = np.zeros(n, bool)
for a, b in spans:
    core[int((a + 0.1) * SR):int((b - 0.1) * SR)] = True
print(f"duck (constant tone through apply_duck): in the clear {db[~span_mask & ~voice].mean():+.1f} dB, under plain words {db[voice & ~span_mask].mean():+.1f} dB, inside punchline / major-hit spans {db[core].mean():+.1f} dB (target -8), deepest {db.min():+.1f} dB")
# 2. the music cut (a recorded score cut to dead silence at the twist, back at the payoff)
mc = P.get("music", {}).get("cuts", [])
for c in mc:
    a, b = c["t"], c.get("resume", P["seconds"])
    inside = m[int((a + 0.03) * SR):int(b * SR)]
    before = m[int((a - 1.0) * SR):int(a * SR)]
    print(f"music cut {a:.2f}-{b:.2f} s: peak inside {20 * np.log10(max(np.abs(inside).max(), 1e-9)):.0f} dBFS (silence), the 1 s before it: {20 * np.log10(max(np.sqrt(np.mean(before ** 2)), 1e-9)):.0f} dBFS rms; sub-bass hit at {a:.2f} s: {'yes' if c.get('sub') else 'no'}")
# 3. the two masters
import os
for f in (P["out"], P.get("dual")):
    if f and os.path.exists(f):
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        t = r[r.rfind("Summary:"):]
        print(f"master {f}: {t.split('I:')[1].split('LUFS')[0].strip()} LUFS, true peak {t.split('Peak:')[1].split('dBFS')[0].strip()} dBFS")
# 4. grounded: no stadium / crowd sounds in the plan
bad = [c["name"] for c in cues if any(k in c["name"] for k in ("crowd", "stadium", "cheer", "applause", "gasp", "scream", "aww", "aye", "siren"))]
print("grounded SFX (no crowd / stadium / gasp sounds):", "PASS" if not bad else "FAIL " + ", ".join(bad))
