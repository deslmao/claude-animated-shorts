#!/usr/bin/env python3
"""What Ollie Says Part 1: level the new cast's narration clips (Mini, Leo, Kasia) to a common loudness after
`npm run short -- ollie-1 --until narration`. The soundtrack builder mixes clips as generated, and these library voices
come out between -14 and -40 LUFS. Targets: -21 LUFS (Ava's and Mark's level), Kate asleep -23, the two shouts -18.
Gain plus a -1 dBFS limiter only: durations and word timings are unchanged. Idempotent: originals are kept as
<hash>.orig.mp3 and every run re-derives from them. Run from anywhere; then: npm run short -- ollie-1 --until checks"""
import glob, json, os, shutil, subprocess
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../animation-studio/voice/cache")
CAST = {"nUX4UWK0Tf1qh5zvFZWR", "1tDEBGOo8EqEPApM49eJ", "2IG19NvuEAFSWMSkq7wB"}   # Mini, Leo, Kasia
def lufs(f):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(r.split("I:")[-1].split("LUFS")[0])
for j in sorted(glob.glob(f"{CACHE}/*.json")):
    d = json.load(open(j))
    if d.get("voiceId") not in CAST or not d.get("voice", "").startswith("ol"): continue
    target = -18.0 if d["text"] in ("Weź go!", "AVA!") else -23.0 if d["voice"] == "olKateNight" else -21.0
    m, o = j[:-5] + ".mp3", j[:-5] + ".orig.mp3"
    if not os.path.exists(o): shutil.copyfile(m, o)
    g = target - lufs(o)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", o, "-af", f"volume={g:.2f}dB,alimiter=limit=0.891:level=false", "-c:a", "libmp3lame", "-b:a", "128k", m], check=True)
    print(f"{d['voice']:12} {g:+6.1f} dB -> {lufs(m):6.1f} LUFS  {d['text'][:40]}")
