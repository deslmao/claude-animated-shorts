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
from samples import SAMPLE_LEVEL, STEREO, SCORE_DIR, decode as decode_sample  # noqa: E402
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
           "crowd_aye": -10, "crowd_murmur": -18, "quill_scratch": -17, "coins_pour": -15,
           "engine": -16, "honk": -11, "backfire": -8, "bark": -11, "crack_egg": -13,
           "claw_ticks": -15, "dog_breath": -15, "dog_sigh": -14, "tag_jingle": -16, "heartbeat": -11,
           "bus_doors": -11, "air_brake": -12, "bus_pullaway": -14, "glass_slap": -6, "indicator": -17, "monitor_beep": -16, "monitor_flat": -15, "radio_squelch": -14, "breath_fast": -13}  # race day 1904 (Video 04)  # tickle-revision effects: subtle, under the voice
SFX_DEFAULT = -10
# custom SFX (Engine 4, Phase 4): assets/sfx/<name>.mp3|wav (generated with sound/sfx_fetch.py). A custom file wins over a catalogue sound of the same name.
CUSTOM_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "sfx")
MUSIC_ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "music")   # recorded scores (public domain / CC0): assets/music/<file>.mp3
CUSTOM_REL = {"sub_hit": -9, "paper_rustle": -14, "fridge_door": -13, "toast_tick": -13, "lever_clunk": -12, "toaster_pop": -11, "toast_sizzle": -11, "mug_shatter": -8, "slice_bite": -13, "kettle_click": -13, "heartbeat": -12, "shimmer_chime": -11, "crowd_swell": -13, "whoosh_soft": -13, "box_thud": -8, "plate_clink": -12, "clock_tick_six": -13}


def custom_file(name):
    for ext in ("mp3", "wav"):
        p = os.path.join(CUSTOM_DIR, f"{name}.{ext}")
        if os.path.exists(p):
            return p
    return None


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


def decode(path):
    """any audio file -> mono float64 at 48 kHz"""
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).astype(np.float64)


# voice effects (a preset's fx). uncanny: ~3 semitones down at the same length (asetrate lowers the pitch and slows
# it; atempo restores the length), a hollow double echo, and the natural voice faint underneath
FX = {"uncanny": "asetrate={sr}*0.84,aresample={sr},atempo=1.1905,aecho=0.8:0.6:45|110:0.35|0.22,lowpass=f=6500",
      # radio (The Empty Seat v2: the bus dispatch radio): a narrow band, squashed and lightly clipped, no dry voice
      "radio": "highpass=f=420,lowpass=f=3200,acompressor=threshold=-24dB:ratio=8:attack=2:release=60,volume=2.2,alimiter=limit=0.7",
      # door (Don't Eat It: Mum at the front door): through a closed door down a hallway: muffled, a little room echo
      "door": "lowpass=f=1300,highpass=f=110,aecho=0.7:0.5:28|61:0.28|0.16,volume=1.9,alimiter=limit=0.8"}
FX_DRY = {"uncanny": 0.22}


def decode_fx(path, fx):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-af", FX[fx].format(sr=SR), "-f", "f32le", "-"], capture_output=True, check=True)
    low, dry = np.frombuffer(p.stdout, np.float32).astype(np.float64), decode(path)
    n = max(len(low), len(dry)); out = np.zeros(n); out[:len(low)] += low; out[:len(dry)] += dry * FX_DRY.get(fx, 0.0)
    return out


def lu(x):
    v = integrated(x)
    return v if np.isfinite(v) else -99.0


def duck_g(words, n):
    """0..1 envelope: 1 while words are spoken (50 ms attack before a word, 250 ms release after)"""
    g = np.zeros(n)
    for t0, t1 in words:
        a, b = max(0, ns(t0 - 0.05)), min(n, ns(t1 + 0.25))
        g[a:b] = 1.0
    k = ns(0.08)
    if k > 1:
        g = np.convolve(g, np.ones(k) / k, mode="same")
    return g


def duck_curve(words, n, depth_db):
    """gain curve: depth_db while words are spoken"""
    return dbg(depth_db * duck_g(words, n))


def apply_duck(music, P, depth_db):
    """the music's duck: depth_db (a few dB) under every spoken word; with an Engine 4 plan the music ducks 8 dB (the plan's depth) under the
    spans of dialogue punchlines and major SFX hits (the deeper of the two applies, so they never stack)"""
    n = music.shape[1]
    db = depth_db * duck_g(P["words"], n)
    if P.get("duck"):
        d = P["duck"]; m = np.zeros(n)
        for a, b in d["spans"]:
            m[max(0, ns(a)):min(n, ns(b))] = 1.0
        k = ns(0.06)
        m = np.convolve(m, np.ones(k) / k, mode="same")
        db = np.minimum(db, d["depth_db"] * m)
    return music * dbg(db)[None, :]


def main(plan_path):
    P = json.load(open(plan_path))
    total, N, seed = P["seconds"], ns(P["seconds"]), int(P["seed"])
    cues = []
    # ---------------- voice
    voice = np.zeros((2, N))
    for v in P["voice"]:
        x = decode_fx(v["file"], v["fx"]) if v.get("fx") in FX else decode(v["file"])
        if "from" in v:  # a piece of a line with pauses inside it (cut in a measured silence; 5 ms fades against clicks)
            x = x[int(round(v["from"] * SR)): int(round(v["to"] * SR)) if "to" in v else len(x)].copy()
            f = min(len(x) // 2, int(0.005 * SR))
            if f > 0:
                x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        place(voice, x, v["at"])
    Lv = lu(voice)
    log(f"voice: {len(P['voice'])} clips, {Lv:.1f} LUFS")
    # ---------------- music
    music = np.zeros((2, N))
    if P.get("music") and P["music"].get("file"):
        # a recorded score (opt-in: storyboard music { file }): sound/samples/music/<file>.mp3 from 0 s, written to the
        # film's timings, so its own silences and hits land where they were planned; ducked and levelled like a mood bed
        mu = P["music"]
        sp = os.path.join(MUSIC_ASSETS, f"{mu['file']}.mp3")
        x = decode_sample(sp if os.path.exists(sp) else os.path.join(SCORE_DIR, f"{mu['file']}.mp3"), 2)[:, :N]
        music[:, :x.shape[1]] = x
        f = ns(0.6)
        music[:, max(0, x.shape[1] - f):x.shape[1]] *= np.linspace(1, 0, min(f, x.shape[1]))
        if mu.get("curve"):  # a volume curve over the score (dB at times, linear between): its silences and swells
            ts, dbs = zip(*mu["curve"])
            music *= dbg(np.interp(np.arange(N) / SR, ts, dbs))[None, :]
        music = apply_duck(music, P, mu.get("duck_db", DUCK_DB))
        music *= dbg(Lv + MUSIC_REL + mu.get("gain_db", 0.0) - lu(music))
        # Engine 4 hard cuts: dead silence from the cut (15 ms fade), the score coming back at `resume` (15 ms fade in)
        for c in mu.get("cuts", []):
            a = ns(c["t"]); b = ns(c["resume"]) if "resume" in c else N; f = ns(0.015)
            env = np.ones(N); env[a:b] = 0.0
            if a >= f: env[a - f:a] = np.linspace(1, 0, f)
            if b < N and b + f <= N: env[b:b + f] = np.linspace(0, 1, f)
            music *= env[None, :]
            cues.append((c["t"], "music: hard cut to silence" + (f", back at {c['resume']:.2f} s" if "resume" in c else "")))
        cues.append((0.0, f"music: score {mu['file']}"))
        log(f"music: score {mu['file']} ({x.shape[1] / SR:.1f} s) -> {lu(music) - Lv:+.1f} LU vs voice")
    elif P.get("music"):
        mu = P["music"]
        music, mcues = M.compose([tuple(s) for s in mu["sections"]], total, mu["button_t"], seed, **({"drop_t": mu["drop_t"]} if "drop_t" in mu else {}))
        music = music[:, :N]
        music = apply_duck(music, P, DUCK_DB)
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
        cf = custom_file(c["name"])
        if c["name"] == "sub_hit" and cf is None:   # a low sub-bass hit: a sine dropping 62 -> 38 Hz, a fast attack and a 0.9 s decay
            tt = np.arange(int(0.9 * SR)) / SR; fr = 38 + 24 * np.exp(-tt * 6.0)
            x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 4.2) * (1 - np.exp(-tt * 250))
        elif cf is None and c["name"] not in SFX:
            raise SystemExit(f"unknown sound effect {c['name']} (not in the catalogue and no assets/sfx/{c['name']}.mp3|wav)")
        else:
            x = decode(cf) if cf else np.asarray(SFX[c["name"]](rng(seed * 1009 + i)), float)
        wide = c["name"] in STEREO and x.ndim == 2   # a stereo sample (riser, boom) stays wide and unpanned
        x = x if x.ndim == 1 or wide else x.mean(0)
        x = fades(x, 0.001, 0.01)
        mm = momentary_max(x)
        if np.isfinite(mm):
            x = x * dbg(Lv + (CUSTOM_REL.get(c["name"], SFX_DEFAULT) if cf else SFX_REL.get(c["name"], SAMPLE_LEVEL.get(c["name"], SFX_DEFAULT))) + c.get("gain_db", 0.0) - mm)
        place(sfx, x if wide else pan(x, float(np.clip(c.get("pan", 0.0), -0.8, 0.8))), max(0.0, c["t"]))
        cues.append((c["t"], f"sfx {c['name']}: {c.get('why', '')}"))
    # ---------------- mix + master
    g0 = dbg(TARGET - lu(voice + music + amb + sfx))
    mix = (voice + music + amb + sfx) * g0
    work = os.path.join("out", "sound", P["id"])
    os.makedirs(work, exist_ok=True)
    def master(mix, g0, out, wav, stems):
        # the intermediate WAV keeps headroom (integer samples would clip peaks above full scale); the gain comes back in
        # ffmpeg's float pipeline right before the peak limiter
        head = min(1.0, 0.89 / max(1e-9, np.abs(mix).max()))
        write_wav(wav, mix * head, 24)
        for name, x in stems:  # stems at mix scale (review, analysis)
            write_wav(os.path.join(work, f"{name}.wav"), x * g0 * head, 24)
        back = -20 * np.log10(head)

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
        return I_, pk
    I_, pk = master(mix, g0, P["out"], os.path.join(work, "mix.wav"), [("voice", voice), ("music", music), ("ambience", amb), ("sfx", sfx)])
    # Engine 4 dual export: the same film without the music (narration + SFX + ambience), mastered on its own, for native-audio posts
    if P.get("dual"):
        bed = voice + amb + sfx
        g1 = dbg(TARGET - lu(bed))
        master(bed * g1, g1, P["dual"], os.path.join(work, "mix_nomusic.wav"), [])
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
