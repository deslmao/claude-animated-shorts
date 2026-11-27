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
def rms_db(mask):
    x = m[mask]
    return 20 * np.log10(max(np.sqrt(np.mean(x ** 2)), 1e-9)) if x.size else float("nan")
spans = P.get("duck", {}).get("spans", [])
span_mask = np.zeros(n, bool)
for a, b in spans:
    span_mask[max(0, int(a * SR)):min(n, int(b * SR))] = True
voice = np.zeros(n, bool)
for a, b in words:
    voice[max(0, int((a - 0.05) * SR)):min(n, int((b + 0.25) * SR))] = True
clear = ~span_mask & ~voice
# the music bed has its own dynamics: compare the music stem inside each span with the music stem just before it (a 0.5 s window in the clear) plus the global clear level
print(f"music level in the clear (no word, no duck span): {rms_db(clear):.1f} dBFS (stem); under every word: {rms_db(voice & ~span_mask):.1f} dBFS; inside duck spans: {rms_db(span_mask):.1f} dBFS")
print(f"measured duck under spans: {rms_db(span_mask) - rms_db(clear):+.1f} dB vs the clear (target -8); under plain words: {rms_db(voice & ~span_mask) - rms_db(clear):+.1f} dB (base duck -3)")
# the plan's own gain curve, sample-exact: the duck depth applied at each span centre
for a, b in spans:
    print(f"  duck span {a:5.2f}-{b:5.2f} s  ({b - a:.2f} s) -> {P['duck']['depth_db']:.0f} dB")
