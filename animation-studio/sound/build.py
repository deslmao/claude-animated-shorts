# Soundtrack builder (stage 3B):  python3 sound/build.py <plan.json>
# The plan is written by `npm run sound -- <id>` (scripts/sound.ts) from the compiled storyboard: narration placement,
# word timings, shots (set / light / ambience), music sections and every sound-effect cue (what the picture does, when,
# and where it is on screen). This script synthesizes and mixes them:
#   voice   the generated narration clips, at their places (unchanged, it is the reference level)
#   music   mood sections (music.py), ducked 3 dB under every word, ~10 LU under the voice
#   ambience per shot from set + light (library.py), ~20 LU under the voice, crossfaded at cuts
#   sfx     each cue at its time and screen position, level relative to the voice per kind
#   master  -14 LUFS integrated, true peak <= -1.5 dBFS, exactly the film's length, 48 kHz stereo MP3 320k
# Writes the soundtrack, its fingerprint file (ties it to the storyboard) and a cue sheet for review.
import json
import os
import subprocess
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import SR, ns, rng, st, pan, place, integrated, momentary_max, true_peak, dbg, write_wav, fades  # noqa: E402
from library import SFX, AMBIENCE  # noqa: E402
import music as M  # noqa: E402

VOICE_REL = 0.0
MUSIC_REL = -10.0      # LU under the voice (creator's standard bed level; style bible: bed 5-10 dB under speech)
AMB_REL = -20.0
DUCK_DB = -3.0         # music dip while words are spoken (keyed from the word timings, not the audio)
TARGET = -14.0
CEIL = -1.5          # true-peak target; the sample-peak limiter sits 0.5 dB lower (MP3 overshoots between samples)
# default level of each effect, LU (momentary max) relative to the voice; storyboard gain_db adds to it
SFX_REL = {"step_hard": -17, "step_stone": -17, "step_floor": -17, "step_grass": -19, "swish_soft": -14, "whoosh_short": -11,
           "whoosh_long": -13, "whoosh_low": -12, "flash_swish": -10, "impact": -7, "thud": -8, "ding": -9, "pop": -9,
           "blip_up": -11, "boing": -10, "poof": -11, "twinkle": -12, "party_pop": -9, "drip": -13, "steam": -13,
           "snore_soft": -14, "ring_ding": -10, "sting_low": -9, "clock_tick": -18,
           "giggle": -13, "feather_swish": -19, "servo": -18, "stumble": -14,
           "crowd_aye": -10, "crowd_murmur": -18, "quill_scratch": -17, "coins_pour": -15}  # tickle-revision effects: subtle, under the voice
SFX_DEFAULT = -10


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


def decode(path):
    """any audio file -> mono float64 at 48 kHz"""
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).astype(np.float64)


def lu(x):
    v = integrated(x)
    return v if np.isfinite(v) else -99.0


def duck_curve(words, n, depth_db):
    """gain curve: depth_db while words are spoken (50 ms attack before a word, 250 ms release after)"""
    g = np.zeros(n)
    for t0, t1 in words:
        a, b = max(0, ns(t0 - 0.05)), min(n, ns(t1 + 0.25))
        g[a:b] = 1.0
    k = ns(0.08)
    if k > 1:
        g = np.convolve(g, np.ones(k) / k, mode="same")
    return dbg(depth_db * g)


def main(plan_path):
    P = json.load(open(plan_path))
    total, N, seed = P["seconds"], ns(P["seconds"]), int(P["seed"])
    cues = []
    # ---------------- voice
    voice = np.zeros((2, N))
    for v in P["voice"]:
        place(voice, decode(v["file"]), v["at"])
    Lv = lu(voice)
    log(f"voice: {len(P['voice'])} clips, {Lv:.1f} LUFS")
    # ---------------- music
    music = np.zeros((2, N))
    if P.get("music"):
        mu = P["music"]
        music, mcues = M.compose([tuple(s) for s in mu["sections"]], total, mu["button_t"], seed)
        music = music[:, :N]
        music *= duck_curve(P["words"], N, DUCK_DB)[None, :]
        music *= dbg(Lv + MUSIC_REL + mu.get("gain_db", 0.0) - lu(music))
        cues += mcues
        log(f"music: {', '.join(s[0] for s in mu['sections'])} -> {lu(music) - Lv:+.1f} LU vs voice")
    # ---------------- ambience: runs of shots sharing a bed play continuously, 0.25 s crossfades at changes
    amb = np.zeros((2, N))
    runs = []
    for s in P["shots"]:
        if runs and runs[-1][0] == s["ambience"]:
            runs[-1][2] = s["t1"]
        else:
            runs.append([s["ambience"], s["t0"], s["t1"]])
    for i, (name, t0, t1) in enumerate(runs):
        if not name:
            continue
        if name not in AMBIENCE:
            raise SystemExit(f"unknown ambience {name}")
        bed = AMBIENCE[name](t1 - t0 + 0.5, rng(seed * 31 + i))
        bed = st(bed)
        bed *= dbg(Lv + AMB_REL - lu(bed))
        f = ns(0.25)
        bed[:, :f] *= np.linspace(0, 1, f)
        bed[:, -f:] *= np.linspace(1, 0, f)
        place(amb, bed, max(0.0, t0 - 0.12))
        cues.append((t0, f"ambience: {name}"))
    # ---------------- effects
    sfx = np.zeros((2, N))
    for i, c in enumerate(P["cues"]):
        if c["name"] not in SFX:
            raise SystemExit(f"unknown sound effect {c['name']}")
        x = np.asarray(SFX[c["name"]](rng(seed * 1009 + i)), float)
        x = x if x.ndim == 1 else x.mean(0)
        x = fades(x, 0.001, 0.01)
        mm = momentary_max(x)
        if np.isfinite(mm):
            x = x * dbg(Lv + SFX_REL.get(c["name"], SFX_DEFAULT) + c.get("gain_db", 0.0) - mm)
        place(sfx, pan(x, float(np.clip(c.get("pan", 0.0), -0.8, 0.8))), max(0.0, c["t"]))
        cues.append((c["t"], f"sfx {c['name']}: {c.get('why', '')}"))
    # ---------------- mix + master
    g0 = dbg(TARGET - lu(voice + music + amb + sfx))
    mix = (voice + music + amb + sfx) * g0
    work = os.path.join("out", "sound", P["id"])
    os.makedirs(work, exist_ok=True)
    wav = os.path.join(work, "mix.wav")
    # the intermediate WAV keeps headroom (integer samples would clip peaks above full scale); the gain comes back in
    # ffmpeg's float pipeline right before the peak limiter
    head = min(1.0, 0.89 / max(1e-9, np.abs(mix).max()))
    write_wav(wav, mix * head, 24)
    for name, x in [("voice", voice), ("music", music), ("ambience", amb), ("sfx", sfx)]:  # stems at mix scale (review, analysis)
        write_wav(os.path.join(work, f"{name}.wav"), x * g0 * head, 24)
    back = -20 * np.log10(head)
    out = P["out"]

    def encode(gain_db, lim_db=CEIL - 0.5):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af",
                        f"volume={gain_db + back:.2f}dB,alimiter=limit={dbg(lim_db):.4f}:attack=2:release=40:level=false,atrim=end={total:.3f}",
                        "-ar", str(SR), "-ac", "2", "-c:a", "libmp3lame", "-b:a", "320k", out], check=True)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        s = r[r.rfind("Summary:"):]
        I_ = float(s.split("I:")[1].split("LUFS")[0])
        pk = float(s.split("Peak:")[1].split("dBFS")[0])
        return I_, pk

    # master: hit -14 LUFS (+-0.2) with the true peak at or under the ceiling. Raising the gain for loudness raises the
    # peaks, and the MP3 encode overshoots between samples, so iterate: correct the gain, and if the encoded true peak
    # is over the ceiling, lower the sample-peak limiter by the overshoot (+0.1 dB). A mix already in range is done
    # on the first pass (identical output to the one-pass master).
    g, lim = 0.0, CEIL - 0.5
    I_, pk = encode(g, lim)
    for _ in range(5):
        if abs(I_ - TARGET) <= 0.2 and pk <= CEIL:
            break
        if pk > CEIL:
            lim -= pk - CEIL + 0.1
        if abs(I_ - TARGET) > 0.2:
            g += TARGET - I_
        I_, pk = encode(g, lim)
    if abs(I_ - TARGET) > 0.5 or pk > CEIL + 0.2:
        raise SystemExit(f"mastering did not converge: {I_:.1f} LUFS, true peak {pk:.1f} dBFS")
    log(f"master: {I_:.1f} LUFS, true peak {pk:.1f} dBFS -> {out}")
    stems = {"voice_lufs": round(Lv, 2), "music_vs_voice_lu": round(lu(music) - Lv, 2) if P.get("music") else None,
             "ambience_vs_voice_lu": round(lu(amb) - Lv, 2) if np.abs(amb).max() > 0 else None, "sfx_cues": len(P["cues"])}
    info = {"composition": P["composition"], "fingerprint": P["fingerprint"], "engine": P["engine"], "frames": P["frames"],
            "seconds": total, "lines": len(P["voice"]), "lufs": round(I_, 2), "truePeak": round(pk, 2), "stems": stems,
            "built": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    json.dump(info, open(P["info"], "w"), indent=1)
    with open(P["cuesheet"], "w") as f:
        f.write(f"# {P['composition']} soundtrack cue sheet\n\n")
        f.write(f"Generated by `npm run sound -- {P['id']}`: {I_:.1f} LUFS, true peak {pk:.1f} dBFS, {total:.3f} s.\n")
        f.write(f"Voice {Lv:.1f} LUFS; music {stems['music_vs_voice_lu']} LU and ambience {stems['ambience_vs_voice_lu']} LU relative to the voice.\n\n")
        f.write("| time | frame | cue |\n|---|---|---|\n")
        for t, what in sorted(cues, key=lambda c: c[0]):
            f.write(f"| {t:6.2f} s | {round(t * 30):4d} | {what} |\n")
    log(f"cue sheet: {P['cuesheet']} ({len(cues)} cues)")


if __name__ == "__main__":
    main(sys.argv[1])
