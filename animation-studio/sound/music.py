# Background music (stage 3B): original light underscore composed and synthesized here for any storyboard, from mood
# presets. Each mood = key, tempo, a 4-bar chord progression, an instrument line-up and rhythm patterns; melodies are
# generated from a seeded motif with an AABA phrase shape (repetition is what makes a tune), so the same story always
# gets the same music and a different story gets different music. Built on the creator's instruments (instruments.py).
# Sections follow the storyboard (a shot's `mood` starts a new section, crossfaded); the music ends on a "button" chord
# on the last spoken word.
import numpy as np
from dsp import SR, ns, rng, place, fades, make_ir, convolve_st, pan, lp
import instruments as I

MAJ = [0, 2, 4, 5, 7, 9, 11]
MIN = [0, 2, 3, 5, 7, 8, 10]

# degree (0-based scale step) progressions per mood; one chord per bar
MOODS = {
    # light, inquisitive explainer bed: vibes arpeggios, plucked bass, brushes
    "curious": dict(root=55, scale=MAJ, bpm=100, prog=[0, 3, 5, 4], bass="pluck", chords="vibes_arp", lead="glock", perc="brush", density=0.55, swing=0.0),
    # bouncy comedy: staccato bass on 1 & 3, off-beat plucks, glockenspiel tune, soft snare backbeat
    "playful": dict(root=53, scale=MAJ, bpm=116, prog=[0, 5, 3, 4], bass="pluck_bounce", chords="pluck_off", lead="glock", perc="snare_soft", density=0.7, swing=0.18),
    # slow, dark, sparse: minor pad, lonely vibes, low pluck on the bar
    "mystery": dict(root=57, scale=MIN, bpm=84, prog=[0, 5, 3, 4], bass="pluck_low", chords="pad", lead="vibes", perc="none", density=0.35, swing=0.0),
    # warm and tender: pad + music box tune
    "warm": dict(root=51, scale=MAJ, bpm=88, prog=[0, 2, 3, 4], bass="pluck", chords="pad", lead="musicbox", perc="none", density=0.45, swing=0.0),
    # building tension: pulsing minor eighths, soft timpani on the bar, fragments of tune
    "tense": dict(root=50, scale=MIN, bpm=104, prog=[0, 0, 5, 4], bass="pulse", chords="pad", lead="vibes", perc="timpani", density=0.3, swing=0.0),
    # adventure / history / pirates: brass chords, march snare, fife tune
    "adventure": dict(root=58, scale=MAJ, bpm=120, prog=[0, 4, 5, 3], bass="brass_bass", chords="brass", lead="fife", perc="march", density=0.6, swing=0.0),
    # drift-phonk energy (Every Lie): pitched cowbell lead, 808 slides, hats with rolls, claps on 2 and 4
    "phonk": dict(root=49, scale=MIN, bpm=130, prog=[0, 0, 5, 6], bass="808", chords="none", lead="cowbell", perc="phonk", density=0.9, swing=0.0),
    # near-silence for a held comedy beat (a stare, the hush before a drop): only a barely audible sub drone
    "rest": dict(root=49, scale=MIN, bpm=130, prog=[0], bass="none", chords="sub", lead="none", perc="none", density=0.0, swing=0.0),
}


# ---- Video 08 "Float Away": the Pancake Theme and its story moods (additions; the moods above are unchanged)
# The Pancake Theme: a fixed, whistleable 4-bar melody (bar, beat, beats, scale degree; 0 = the tonic, 7 = its
# octave) over I-V-vi-I. A mood whose lead starts with "theme" plays it (each section states it from bar 1); in a
# minor mood the same degrees fall on the minor scale, so the motif stays recognisable but sad.
THEME = [(0, 0, .5, 4), (0, .5, .5, 4), (0, 1, .5, 5), (0, 1.5, .5, 4), (0, 2, 1, 2), (0, 3, 1, 0),
         (1, 0, .5, 1), (1, .5, .5, 2), (1, 1, 1, 3), (1, 2, 2, 1),
         (2, 0, .5, 4), (2, .5, .5, 4), (2, 1, .5, 5), (2, 1.5, .5, 4), (2, 2, 1, 7), (2, 3, 1, 6),
         (3, 0, .5, 5), (3, .5, .5, 4), (3, 1, 1, 2), (3, 2, 2, 0)]
MOODS.update({
    # world rule and comedy: pizzicato bounce, marimba stabs, finger-snap claps, a glockenspiel tune
    "quirky": dict(root=53, scale=MAJ, bpm=112, prog=[0, 3, 4, 0], bass="pizz", chords="marimba_off", lead="glock", perc="snaps", density=0.55, swing=0.08),
    "quirkyFull": dict(root=53, scale=MAJ, bpm=112, prog=[0, 3, 4, 0], bass="pizz", chords="marimba_off", lead="glock", perc="snaps_snare", density=0.7, swing=0.08),
    # the Pancake Theme, playful: marimba + whistle over pizzicato and brushes
    "pancake": dict(root=53, scale=MAJ, bpm=104, prog=[0, 4, 5, 0], bass="pizz", chords="marimba_off", lead="theme_whistle", perc="brush", density=0.6, swing=0.1),
    # Gus fading: the theme in minor, fragments only, on vibes over a soft pad
    "drift": dict(root=53, scale=MIN, bpm=76, prog=[0, 4, 5, 0], bass="none", chords="pad", lead="theme_frag", perc="none", density=0.3, swing=0.0),
    # birthday and stones: a slow piano heartbeat under one held string chord
    "hush": dict(root=53, scale=MIN, bpm=60, prog=[0], bass="heartbeat", chords="strings_low", lead="none", perc="none", density=0.0, swing=0.0),
    # the storm: sixteenth-note low strings, toms, timpani
    "storm": dict(root=50, scale=MIN, bpm=132, prog=[0, 0, 5, 6], bass="pulse16", chords="strings", lead="none", perc="toms", density=0.4, swing=0.0),
    "stormPulse": dict(root=50, scale=MIN, bpm=132, prog=[0], bass="pulse16", chords="none", lead="none", perc="none", density=0.0, swing=0.0),
    # true silence (no drone): the beat after "I was the last one"
    "silence": dict(root=53, scale=MAJ, bpm=60, prog=[0], bass="none", chords="none", lead="none", perc="none", density=0.0, swing=0.0),
    # the livestream: layers enter on story beats (rise1 -> rise4), uplifting, major, bouncy rather than epic
    "rise1": dict(root=53, scale=MAJ, bpm=120, prog=[0, 4, 5, 3], bass="none", chords="piano_ost", lead="none", perc="none", density=0.3, swing=0.0),
    "rise2": dict(root=53, scale=MAJ, bpm=120, prog=[0, 4, 5, 3], bass="pizz", chords="piano_ost", lead="none", perc="claps", density=0.4, swing=0.0),
    "rise3": dict(root=53, scale=MAJ, bpm=120, prog=[0, 4, 5, 3], bass="pizz", chords="piano_strings", lead="none", perc="kick_clap", density=0.5, swing=0.0),
    "rise4": dict(root=53, scale=MAJ, bpm=120, prog=[0, 4, 5, 3], bass="pizz", chords="piano_strings", lead="theme_brass", perc="kick_clap", density=0.7, swing=0.0),
    # the ending: the theme on piano with warm strings
    "warmTheme": dict(root=53, scale=MAJ, bpm=88, prog=[0, 4, 5, 0], bass="none", chords="strings", lead="theme_piano", perc="none", density=0.4, swing=0.0),
})

def _chord(m, deg, octave=0):
    """triad (root, third, fifth) midi numbers on a scale degree"""
    sc, root = m["scale"], m["root"] + 12 * octave
    return [root + sc[(deg + k) % 7] + 12 * ((deg + k) // 7) for k in (0, 2, 4)]


def _scale_notes(m, lo, hi):
    out = []
    for o in range(-3, 4):
        for s in m["scale"]:
            v = m["root"] + 12 * o + s
            if lo <= v <= hi:
                out.append(v)
    return sorted(out)


# rhythm patterns for the tune: (beat, length in beats) per bar
RHYTHMS = [
    [(0, 1), (1, 1), (2, 1.5), (3.5, 0.5)],
    [(0, 0.5), (0.5, 0.5), (1, 1), (2, 2)],
    [(0, 1.5), (1.5, 0.5), (2, 1), (3, 1)],
    [(0, 2), (2, 1), (3, 1)],
    [(0.5, 0.5), (1, 0.5), (1.5, 0.5), (2, 2)],
]


def _motif(m, r, bars=2):
    """a 2-bar melodic idea: rhythm + contour; chord tones on strong beats, steps in between"""
    notes = _scale_notes(m, m["root"] + 12, m["root"] + 29)
    out, idx = [], len(notes) // 2
    for b in range(bars):
        rh = RHYTHMS[int(r.integers(0, len(RHYTHMS)))]
        for beat, ln in rh:
            if r.uniform() > 0.25 + 0.75 * m["density"] and beat > 0:
                continue
            idx = int(np.clip(idx + r.choice([-2, -1, -1, 1, 1, 2, 0]), 2, len(notes) - 3))
            out.append((b, beat, ln, idx))
    return out, notes


def _snap(midi, chord_pcs, strong):
    """on strong beats pull the note to the nearest chord tone"""
    if not strong:
        return midi
    best = min(range(-2, 3), key=lambda d: (((midi + d) % 12) not in chord_pcs, abs(d)))
    return midi + best


def compose(sections, total, button_t, seed, gain_db=0.0, drop_t=None):
    """sections: [(mood, t0, t1)] covering 0..total; returns stereo music (2, N) and a cue list"""
    N = ns(total) + ns(3.0)
    out = np.zeros((2, N))
    cues = []
    for si, (mood, t0, t1) in enumerate(sections):
        m = MOODS[mood]
        r = rng(seed * 101 + si)
        beat = 60.0 / m["bpm"]
        bar = 4 * beat
        motif, notes = _motif(m, r)
        # the B phrase: same rhythm, contour transposed by a third (variation, not a new tune)
        motif_b = [(b, bt, ln, int(np.clip(i + 2, 0, len(notes) - 1))) for (b, bt, ln, i) in motif]
        sec = np.zeros((2, ns(t1 - t0) + ns(3.0)))
        nbars = int(np.ceil((t1 - t0) / bar)) + 1
        for k in range(nbars):
            bt0 = k * bar
            if bt0 > (t1 - t0) + 0.01:
                break
            deg = m["prog"][k % len(m["prog"])]
            ch = _chord(m, deg)
            pcs = {c % 12 for c in ch}
            soft = 0.55 if k == 0 else 1.0     # each section eases in
            sw = lambda b: b + (m["swing"] if (b % 1) == 0.5 else 0.0)
            # bass
            root = ch[0] - 24 if ch[0] - 24 >= 33 else ch[0] - 12
            if m["bass"] in ("pluck", "pluck_low"):
                for b in ([0, 2] if m["bass"] == "pluck" else [0]):
                    place(sec, pan(I.pluck(I.m2f(root), 0.75 * soft, r, 1.2, 0.35), -0.1), bt0 + b * beat)
            elif m["bass"] == "pluck_bounce":
                for b, n_ in [(0, root), (1, root + 7), (2, root), (3, root + 7)]:
                    place(sec, pan(I.pluck(I.m2f(n_), 0.7 * soft, r, 0.45, 0.4), -0.1), bt0 + sw(b) * beat)
            elif m["bass"] == "pulse":
                for e in range(8):
                    place(sec, pan(I.pluck(I.m2f(root), (0.55 + 0.15 * (e % 2 == 0)) * soft, r, 0.3, 0.3), -0.1), bt0 + e * beat / 2)
            elif m["bass"] == "808":
                for b, n_, d in [(0, root, 0.55), (1.5, root, 0.4), (2.5, root + 12, 0.5), (3.5, root + 7, 0.3)]:
                    place(sec, I.bass808(I.m2f(n_), d, 0.8 * soft, r, glide=I.m2f(root) if b == 2.5 else None), bt0 + b * beat)
            elif m["bass"] == "brass_bass":
                for b, n_ in [(0, root), (2, root + 7)]:
                    place(sec, pan(I.brass(I.m2f(n_), beat * 0.8, 0.55 * soft, r, "tuba"), -0.1), bt0 + b * beat)
            elif m["bass"] == "pizz":
                for b, n_ in [(0, root + 12), (2, root + 19), (3.5, root + 12)]:
                    place(sec, pan(I.pluck(I.m2f(n_), 0.6 * soft, r, 0.35, 0.6), -0.1), bt0 + sw(b) * beat)
            elif m["bass"] == "pulse16":
                for e in range(16):
                    place(sec, pan(I.pluck(I.m2f(root), (0.42 + 0.18 * (e % 4 == 0)) * soft, r, 0.18, 0.3), -0.1), bt0 + e * beat / 4)
            elif m["bass"] == "heartbeat":
                place(sec, pan(I.piano(I.m2f(root + 12), 0.4 * soft, r, 1.2), -0.05), bt0)
                place(sec, pan(I.piano(I.m2f(root + 12), 0.22 * soft, r, 1.0), -0.05), bt0 + 0.4 * beat)
            # chords
            if m["chords"] == "vibes_arp":
                for e, c in enumerate([ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1], ch[0] + 12, ch[2]]):
                    place(sec, pan(I.vibes(I.m2f(c), 0.32 * soft, r, 1.2), 0.25 if e % 2 else -0.25), bt0 + e * beat / 2)
            elif m["chords"] == "pluck_off":
                for b in (0.5, 1.5, 2.5, 3.5):
                    for c in ch:
                        place(sec, pan(I.pluck(I.m2f(c + 12), 0.28 * soft, r, 0.35, 0.6), 0.3), bt0 + sw(b) * beat)
            elif m["chords"] == "pad":
                place(sec, I.pad([I.m2f(c) for c in ch], bar * 0.98, 0.42 * soft, r, att=0.4, rel=0.8), bt0)
            elif m["chords"] == "sub":
                place(sec, I.subdrone(I.m2f(ch[0] - 12), bar * 0.98), bt0)
            elif m["chords"] == "brass":
                for b in (1, 3):
                    for c in ch:
                        place(sec, pan(I.brass(I.m2f(c), beat * 0.6, 0.32 * soft, r, "horn"), 0.25), bt0 + b * beat)
            elif m["chords"] == "marimba_off":
                for b in (1, 3):
                    for c in ch:
                        place(sec, pan(I.marimba(I.m2f(c + 12), 0.2 * soft, r, 0.5), 0.3), bt0 + sw(b) * beat)
            elif m["chords"] in ("strings", "strings_low"):
                v = 0.3 if m["chords"] == "strings" else 0.18
                place(sec, I.strings([I.m2f(c - (12 if m["chords"] == "strings_low" else 0)) for c in ch], bar * 0.98, v * soft, r), bt0)
            elif m["chords"] in ("piano_ost", "piano_strings"):
                for e, c in enumerate([ch[0], ch[2], ch[1] + 12, ch[2]] * 2):
                    place(sec, pan(I.piano(I.m2f(c), 0.32 * soft, r, 0.9), 0.15 if e % 2 else -0.15), bt0 + e * beat / 2)
                if m["chords"] == "piano_strings":
                    place(sec, I.strings([I.m2f(c) for c in ch], bar * 0.98, 0.22 * soft, r), bt0)
            # percussion
            if m["perc"] == "brush":
                for b in range(4):
                    place(sec, pan(I.brush(0.25 + 0.1 * (b % 2), r, 0.3, swish=(b % 2 == 1)), 0.15), bt0 + b * beat)
            elif m["perc"] == "snare_soft":
                for b in (1, 3):
                    place(sec, pan(I.snare(0.28 * soft, r, 0.25, 1.05, 0.6), 0.1), bt0 + sw(b) * beat)
                place(sec, pan(I.triangle(0.18, r, 0.8), 0.4), bt0)
            elif m["perc"] == "timpani":
                place(sec, I.timpani(I.m2f(ch[0] - 12), 0.45 * soft, r, 1.6), bt0)
            elif m["perc"] == "phonk":
                for e in range(8):  # 8th hats, a 16th roll on the last beat of every second bar
                    place(sec, pan(I.hat(0.55 if e % 2 == 0 else 0.4, r), 0.2), bt0 + e * beat / 2)
                if k % 2 == 1:
                    for q in range(4):
                        place(sec, pan(I.hat(0.35, r), 0.2), bt0 + 3 * beat + q * beat / 4)
                for b in (1, 3):
                    place(sec, pan(I.clap(0.6 * soft, r), -0.05), bt0 + b * beat)
            elif m["perc"] == "march":
                for b, v in [(0, 0.35), (1, 0.22), (1.5, 0.18), (2, 0.3), (3, 0.22), (3.5, 0.18)]:
                    place(sec, pan(I.snare(v * soft, r, 0.25), 0.1), bt0 + b * beat)
            elif m["perc"] in ("snaps", "snaps_snare"):
                for b in (1, 3):
                    place(sec, pan(I.clap(0.3 * soft, r), 0.1), bt0 + sw(b) * beat)
                if k % 2 == 0:
                    place(sec, pan(I.triangle(0.12, r, 0.8), 0.4), bt0)
                if m["perc"] == "snaps_snare":
                    for b in (1, 3):
                        place(sec, pan(I.snare(0.2 * soft, r, 0.22, 1.1, 0.6), 0.1), bt0 + sw(b) * beat)
                    for e in range(8):
                        place(sec, pan(I.hat(0.16, r), 0.25), bt0 + sw(e / 2) * beat)
            elif m["perc"] == "toms":
                for b, f_, v in [(0, 98, 0.55), (2.5, 82, 0.45), (3, 110, 0.5)]:
                    place(sec, pan(I.tom(f_, v * soft, r), -0.15), bt0 + b * beat)
                if k % 2 == 0:
                    place(sec, I.timpani(I.m2f(ch[0] - 12), 0.4 * soft, r, 1.6), bt0)
            elif m["perc"] == "claps":
                for b in (1, 3):
                    place(sec, pan(I.clap(0.38 * soft, r), -0.05), bt0 + b * beat)
            elif m["perc"] == "kick_clap":
                for b in range(4):
                    place(sec, I.kick(0.5 * soft, r), bt0 + b * beat)
                for b in (1, 3):
                    place(sec, pan(I.clap(0.4 * soft, r), -0.05), bt0 + b * beat)
                for b in (0.5, 1.5, 2.5, 3.5):
                    place(sec, pan(I.hat(0.2, r), 0.25), bt0 + b * beat)
            # the Pancake Theme (Video 08): a fixed melody, stated from the section's first bar
            if m["lead"].startswith("theme"):
                tb, sc = k % 4, m["scale"]
                if m["lead"] == "theme_frag" and (tb not in (0, 2) or (k // 4) % 2 == 1):
                    continue
                notes_t = [(bb, b, ln, m["root"] + 12 + sc[d % 7] + 12 * (d // 7)) for (bb, b, ln, d) in THEME if bb == tb]
                if m["lead"] == "theme_frag":
                    notes_t = notes_t[:4]
                v = 0.42 * soft
                if m["lead"] == "theme_whistle":
                    t0w, wy = I.whistle([(b * beat, ln * beat * 0.92, midi + 12, 0.8) for (_, b, ln, midi) in notes_t], r)
                    place(sec, pan(wy * 0.26 * soft, 0.2), bt0 + t0w)
                for (_, b, ln, midi) in notes_t:
                    dur = ln * beat * 0.92
                    if m["lead"] == "theme_whistle":
                        x = pan(I.marimba(I.m2f(midi + 12), v * 0.55, r, 0.7), -0.2)
                    elif m["lead"] == "theme_frag":
                        x = pan(I.vibes(I.m2f(midi), v * 0.7, r, max(1.0, dur + 0.6)), 0.2)
                    elif m["lead"] == "theme_brass":
                        x = pan(I.brass(I.m2f(midi), max(0.2, dur), v * 0.55, r, "horn"), 0.15)
                    elif m["lead"] == "theme_piano":
                        x = pan(I.piano(I.m2f(midi + 12), v * 0.8, r, 1.6), 0.15)
                    else:  # theme_musicbox
                        x = pan(I.musicbox(I.m2f(midi + 12), v * 0.8, r, 1.4), 0.2)
                    place(sec, x, bt0 + b * beat)
                continue
            # tune: AABA over 8 bars (A = motif, B = shifted motif), resting every 4th phrase pair for air
            phrase = (k // 2) % 4
            if k >= 1 and (k // 8) % 2 == 0 or k >= 1 and m["density"] > 0.5:
                src = motif_b if phrase == 2 else motif
                for (mb, b, ln, i) in src:
                    if mb != k % 2:
                        continue
                    midi = _snap(notes[i], pcs, b in (0, 2))
                    dur = ln * beat * 0.9
                    v = 0.5 * soft
                    if m["lead"] == "none":
                        continue
                    if m["lead"] == "cowbell":
                        x = pan(I.cowbell(I.m2f(midi + 12), v * 0.9, r, 0.3), 0.15)
                    elif m["lead"] == "glock":
                        x = pan(I.glock(I.m2f(midi + 12), v * 0.8, r, 1.2), 0.2)
                    elif m["lead"] == "vibes":
                        x = pan(I.vibes(I.m2f(midi), v, r, max(1.0, dur + 0.6)), 0.2)
                    elif m["lead"] == "musicbox":
                        x = pan(I.musicbox(I.m2f(midi + 12), v * 0.8, r, 1.4), 0.2)
                    else:  # fife
                        x = pan(I.fife(I.m2f(midi + 12), dur, v * 0.7, r), 0.2)
                    place(sec, x, bt0 + sw(b) * beat)
        sec = sec[:, : ns(t1 - t0) + ns(0.8)]
        # crossfade into the next section (0.6 s), fade in a new section over 0.3 s
        fi, fo = ns(0.3) if si else 0, ns(0.6)
        if fi:
            sec[:, :fi] *= np.linspace(0, 1, fi)
        if si < len(sections) - 1:
            sec[:, -fo:] *= np.linspace(1, 0, fo)
        place(out, sec, t0)
        cues.append((t0, f"music: {mood} ({m['bpm']} bpm)"))
    # the button: tonic chord on the last word, everything else fades under it
    m = MOODS[sections[-1][0]]
    r = rng(seed * 7 + 3)
    tonic = _chord(m, 0)
    b = np.zeros((2, ns(2.5)))
    for c in tonic:
        place(b, pan(I.pluck(I.m2f(c), 0.5, r, 1.6, 0.4), 0.0), 0)
    place(b, pan(I.glock(I.m2f(tonic[0] + 24), 0.45, r, 1.8), 0.2), 0)
    place(b, I.pad([I.m2f(c) for c in tonic], 1.2, 0.3, r, att=0.05, rel=1.2), 0)
    i = ns(button_t)
    if drop_t is not None and ns(drop_t) < i:  # a drop-out before the punchline: the bed fades in 0.1 s and stays out
        j, k = ns(drop_t), min(out.shape[1], ns(drop_t + 0.1))
        out[:, j:k] *= np.linspace(1, 0, k - j); out[:, k:] = 0
        cues.append((drop_t, "music: drop-out before the punchline"))
    if i < out.shape[1]:
        out[:, i:] *= np.linspace(1, 0, out.shape[1] - i) ** 2  # the running bed gives way to the button
        place(out, b, button_t)
        cues.append((button_t, "music: button chord on the last word"))
    out = out[:, : ns(total)]
    out[:, -ns(0.25):] *= np.linspace(1, 0, ns(0.25))  # never cut a ringing note at the last frame
    # a little room around the instruments
    ir = make_ir(1.1, seed=seed % 997 + 11, pre=0.01)
    wet = convolve_st(out, ir)[:, : out.shape[1]]
    out = out + 0.22 * wet
    # a "silence" section is truly silent: the previous section's tail and the room are cut (0.12 s fade), no drone
    for (mood, t0, t1) in sections:
        if mood == "silence":
            i0, i1 = ns(t0), min(out.shape[1], ns(t1))
            f = min(ns(0.12), i1 - i0)
            out[:, i0:i0 + f] *= np.linspace(1, 0, f)
            out[:, i0 + f:i1] = 0
    return out * 10 ** (gain_db / 20), cues
