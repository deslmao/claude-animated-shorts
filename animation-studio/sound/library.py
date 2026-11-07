# Reusable sound library (stage 3B): every sound effect and ambience bed the studio can place, by name. Built on the
# creator's DSP kit (dsp.py / instruments.py / sfx_gen.py: verbatim copies of templates/audio, which stay untouched).
# Names and descriptions match src/studio/sound/catalog.ts (the storyboard validator's list); `python3 sound/check.py`
# proves every catalogue name is implemented and sounds sane. Every function takes a seeded numpy Generator, so the
# same storyboard always gives the same audio.
import numpy as np
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, peq, colored, smooth_noise, fades, phase, modal, widen, st
import instruments as I
import sfx_gen as G


def _env(t, a, d):
    return np.clip(t / max(a, 1e-4), 0, 1) * np.exp(-np.maximum(t - a, 0) / d)


def _sum(*parts):
    """add mono sounds of different lengths: each part is an array, or (array, start time s)"""
    ps = [(p, 0.0) if not isinstance(p, tuple) else p for p in parts]
    n = max(ns(o) + len(x) for x, o in ps)
    out = np.zeros(n)
    for x, o in ps:
        out[ns(o): ns(o) + len(x)] += x
    return out


def _chirp(f0, f1, dur, r, curve=1.0):
    t = tt(dur)
    f = f0 + (f1 - f0) * (t / dur) ** curve
    return np.sin(phase(f)), t


# ------------------------------------------------------------------ cartoon accents (effects marks, reactions)
def pop(r):
    """short bubbly pop: pitch drops fast, a soft click on top (exclaim / reveal)"""
    y, t = _chirp(r.uniform(900, 1100), 260, 0.09, r, 0.5)
    click = hp(r.standard_normal(len(t)), 2500) * np.exp(-t / 0.002) * 0.3
    return fades((y * _env(t, 0.002, 0.03) + click) * 0.9, 0.0005, 0.02)


def ding(r):
    """small bright bell (idea)"""
    f = I.m2f(88 + r.integers(-1, 2))
    return _sum(I.glock(f, 0.8, r, 1.6), 0.5 * I.glock(f * 1.5, 0.5, r, 1.2))


def blip_up(r):
    """rising two-tone blip (question)"""
    a, t = _chirp(500, 900, 0.07, r)
    b, _ = _chirp(700, 1300, 0.09, r)
    return np.concatenate([a * _env(t, 0.003, 0.05), np.zeros(ns(0.03)), b * _env(tt(0.09), 0.003, 0.06)]) * 0.7


def boing(r):
    """spring boing: a wobbling tone that settles (jump, bounce)"""
    t = tt(0.55)
    f = 180 * (1 + 0.6 * np.exp(-t / 0.08)) * (1 + 0.12 * np.sin(TAU * 14 * t) * np.exp(-t / 0.25))
    return fades(np.sin(phase(f)) * _env(t, 0.004, 0.2) * 0.9, 0.001, 0.05)


def poof(r):
    """soft dust poof (puff)"""
    t = tt(0.45)
    nz = colored(len(t), r, 0.8)
    y = lp(nz, 1800) * _env(t, 0.01, 0.12)
    return fades(y * 0.9, 0.002, 0.08)


def twinkle(r):
    """three quick high bell notes (sparkle / hearts / stars)"""
    out = np.zeros(ns(1.3))
    base = 84 + int(r.integers(0, 3))
    for k, m in enumerate([base, base + 4, base + 7, base + 12][: 3 + int(r.integers(0, 2))]):
        x = I.glock(I.m2f(m), 0.5, r, 1.0)
        i = ns(0.07 * k)
        out[i:i + len(x)] += x[: len(out) - i]
    return out * 0.8


def impact(r):
    """punchy low thump with a click (camera kick, landing)"""
    t = tt(0.4)
    f = 45 + 120 * np.exp(-t / 0.03)
    body = np.sin(phase(f)) * _env(t, 0.001, 0.09)
    click = bp(r.standard_normal(len(t)), 1500, 6000, 1) * np.exp(-t / 0.004) * 0.35
    return fades(body + click, 0.0005, 0.05)


def thud(r):
    """a body falling on the floor"""
    t = tt(0.5)
    body = np.sin(phase(70 + 60 * np.exp(-t / 0.04))) * _env(t, 0.002, 0.12)
    cloth = lp(colored(len(t), r, 0.5), 1200) * _env(t, 0.003, 0.06) * 0.5
    return fades(body + cloth, 0.001, 0.08)


def party_pop(r):
    """party popper crack + sparkle tail (confetti)"""
    t = tt(0.12)
    crack = bp(r.standard_normal(len(t)), 800, 7000, 2) * np.exp(-t / 0.012)
    tail = twinkle(r) * 0.6
    out = np.zeros(max(len(crack), ns(0.05) + len(tail)))
    out[: len(crack)] += crack
    out[ns(0.05): ns(0.05) + len(tail)] += tail
    return out


def drip(r):
    """water drop (sweat)"""
    y, t = _chirp(700, 1500, 0.06, r, 0.6)
    return fades(y * _env(t, 0.001, 0.025) * 0.8, 0.0005, 0.02)


def steam(r):
    """angry steam hiss"""
    t = tt(0.7)
    y = bp(r.standard_normal(len(t)), 2500, 9000, 2) * _env(t, 0.03, 0.25) * (1 + 0.3 * np.sin(TAU * 9 * t))
    return fades(y * 0.6, 0.01, 0.1)


def snore_soft(r):
    """one gentle snore in, out (zzz)"""
    t = tt(1.6)
    breath = lp(colored(len(t), r, 0.3), 700) * np.sin(np.pi * np.clip(t / 0.8, 0, 1)) ** 2
    hum = np.sin(phase(95 + 8 * np.sin(TAU * 30 * t))) * np.sin(np.pi * np.clip(t / 0.8, 0, 1)) ** 2 * 0.25
    out = (breath + hum) * 0.7
    out[ns(0.85):] += lp(colored(len(t) - ns(0.85), r, 0.5), 1500) * np.sin(np.pi * np.clip(tt(0.75) / 0.75, 0, 1))[: len(t) - ns(0.85)] ** 2 * 0.3
    return fades(out, 0.02, 0.1)


def ring_ding(r):
    """old telephone-like double ring (ring)"""
    out = np.zeros(ns(0.9))
    for k in range(2):
        x = _sum(I.glock(I.m2f(91), 0.6, r, 0.4), I.glock(I.m2f(95), 0.5, r, 0.4))
        out[ns(0.18 * k): ns(0.18 * k) + len(x)] += x[: len(out) - ns(0.18 * k)]
    return out


def sting_low(r):
    """low dramatic sting: soft timpani + pad swell (a shocking reveal)"""
    out = np.zeros(ns(1.6))
    x = I.timpani(I.m2f(38), 0.8, r, 1.6)
    out[: len(x)] += x[: len(out)]
    return out


# ------------------------------------------------------------------ motion (transitions, camera)
def swish_soft(r):
    return G.whoosh(0.55, r, peak=0.3, f_lo=300, f_hi=1500, width=0.8, tail=0.18, air=0.08) * 0.8


def whoosh_short(r):
    return G.whoosh(0.35, r, peak=0.12, f_lo=500, f_hi=3200, width=0.7, tail=0.12, air=0.2)


def whoosh_long(r):
    return G.whoosh(1.2, r, peak=0.55, f_lo=250, f_hi=1800, width=0.9, tail=0.35, air=0.1) * 0.8


def whoosh_low(r):
    return G.whoosh(0.9, r, peak=0.45, f_lo=120, f_hi=700, width=0.9, tail=0.3, air=0.03)


def flash_swish(r):
    """bright swish + shimmer for a white flash"""
    w = G.whoosh(0.5, r, peak=0.2, f_lo=1200, f_hi=6000, width=0.6, tail=0.15, air=0.3)
    sh = twinkle(r) * 0.35
    out = np.zeros(max(len(w), ns(0.15) + len(sh)))
    out[: len(w)] += w
    out[ns(0.15): ns(0.15) + len(sh)] += sh
    return out


# ------------------------------------------------------------------ footsteps (one step each; surface by set)
def step_hard(r):
    """shoe on pavement / tarmac"""
    t = tt(0.22)
    tap = bp(r.standard_normal(len(t)), 900, 5000, 1) * np.exp(-t / 0.006)
    heel = np.sin(phase(r.uniform(110, 150))) * np.exp(-t / 0.02) * 0.6
    sc = bp(r.standard_normal(len(t)), 600, 4000, 1) * np.clip(t / 0.02, 0, 1) * np.exp(-t / 0.05) * 0.15
    return fades((tap + heel + sc) * 0.8, 0.0005, 0.03)


def step_stone(r):
    """shoe on cobbles: brighter, a little gritty"""
    x = step_hard(r)
    g = bp(r.standard_normal(len(x)), 2000, 8000, 1) * np.exp(-np.arange(len(x)) / SR / 0.03) * 0.2
    return x + g


def step_floor(r):
    """shoe on an indoor floor: wood / tiles"""
    return G.stroll_step(r, scuff=0.3) * 0.7


def step_grass(r):
    """soft step on grass or a dirt path"""
    t = tt(0.28)
    crunch = lp(bp(r.standard_normal(len(t)), 400, 5000, 1), 3500) * np.clip(t / 0.03, 0, 1) * np.exp(-t / 0.07)
    thump = np.sin(phase(r.uniform(70, 95))) * np.exp(-t / 0.03) * 0.4
    return fades((crunch * 0.6 + thump) * 0.8, 0.002, 0.04)


# ------------------------------------------------------------------ objects and people (explicit storyboard cues)
def knock(r):
    out = np.zeros(ns(0.6))
    for k in range(3):
        t = tt(0.15)
        x = modal(0.15, [(r.uniform(180, 220), 1.0, 0.03), (r.uniform(420, 520), 0.5, 0.015)], r) + bp(r.standard_normal(len(t)), 800, 4000, 1) * np.exp(-t / 0.004) * 0.3
        out[ns(0.17 * k): ns(0.17 * k) + len(x)] += x
    return out


def clock_tick(r):
    t = tt(0.05)
    return bp(r.standard_normal(len(t)), 2000, 7000, 2) * np.exp(-t / 0.003) * 0.8


def cash(r):
    """cash register ding"""
    return _sum(I.glock(I.m2f(93), 0.7, r, 1.2), I.glock(I.m2f(100), 0.5, r, 1.0), G.clink(r) * 0.4)


def gasp(r):
    return G.whoa(r) * 0.8


def oof(r):
    return G.oof(r)


def applause(r):
    return G.applause(2.5, r, people=24)


def creak(r):
    return G.creak(0.8, r)


def crack(r):
    return G.wood_crack(r)


def splash(r):
    return G.splash_big(r) * 0.8


def bubbles(r):
    return G.bubbles(1.2, r, 14)


def clink(r):
    return G.clink(r)


def hammer(r):
    return G.hammer_hit(r)


def cannon(r):
    """distant cannon boom (history / pirates)"""
    t = tt(2.2)
    boom = lp(colored(len(t), r, 1.2), 400) * _env(t, 0.005, 0.5) * 1.4
    body = np.sin(phase(42 + 30 * np.exp(-t / 0.05))) * _env(t, 0.002, 0.35)
    crackle = bp(r.standard_normal(len(t)), 1000, 6000, 1) * _env(t, 0.001, 0.05) * 0.4
    return fades(boom + body + crackle, 0.001, 0.3)


def bell_ring(r):
    """ship / church bell"""
    f = I.m2f(67)
    return modal(2.5, [(f, 1.0, 1.4), (f * 2.0, 0.5, 0.9), (f * 2.4, 0.35, 0.6), (f * 3.0, 0.2, 0.4), (f * 4.16, 0.12, 0.25)], r) * 0.7


def wave_crash(r):
    """a sea wave breaking"""
    t = tt(2.4)
    nz = colored(len(t), r, 0.4)
    env = np.clip(t / 0.5, 0, 1) ** 2 * np.exp(-np.maximum(t - 0.5, 0) / 0.7)
    return fades(lp(nz, 2500) * env * 0.9, 0.05, 0.4)


# ------------------------------------------------------------------ tickling, machines, bodies (stage 6 revision)
def giggle(r):
    """a short burst of giggles: four or five quick breathy 'hee-hee-ha' syllables, falling a little (someone tickled)"""
    base = r.uniform(230, 290)
    parts, t0 = [], 0.0
    k = int(r.integers(4, 6))
    for i in range(k):
        d = r.uniform(0.075, 0.1)
        n = ns(d + 0.03)
        t = np.arange(n) / SR
        v = "i" if i < k - 1 else "a"
        f0 = base * (1.0 - 0.05 * i) * _track_lin(t, [(0, 1.12), (d * 0.35, 1.18), (d, 0.92)])
        forms = G.vowel_track(n, [(0, "E"), (0.02, v), (d, v)])
        amp = np.clip(t / 0.008, 0, 1) * np.clip((d + 0.02 - t) / 0.03, 0, 1) * (1.0 - 0.1 * i)
        y = G.vox(f0, forms, amp, r, r.uniform(1.15, 1.25), tilt=1.1, breath=0.55)
        h = hp(r.standard_normal(ns(0.03)), 1500) * _env(tt(0.03), 0.004, 0.012) * 0.6   # the "h" of each syllable
        parts += [(h, t0), (y, t0 + 0.012)]
        t0 += d + r.uniform(0.035, 0.055)
    return fades(_sum(*parts), 0.002, 0.04) * 0.8


def _track_lin(t, pts):
    return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])


def feather_swish(r):
    """a feather brushing across skin: a very soft, airy, high swish"""
    w = G.whoosh(0.32, r, peak=0.14, f_lo=2500, f_hi=7500, width=0.7, tail=0.1, air=0.6)
    return fades(hp(w, 1800), 0.01, 0.06) * 0.6


def servo(r):
    """a small robot servo whirr: a gear-toothed tone that rises then settles, with a soft click at the end"""
    d = 0.32
    t = tt(d)
    f = 210 + 90 * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.8
    ph = phase(f)
    tone = np.sign(np.sin(ph)) * 0.35 + 0.65 * np.sin(ph)               # buzzy: a motor, not a bell
    teeth = 1 + 0.35 * np.sin(phase(f * 7.5))                              # gear teeth
    body = bp(tone * teeth, 300, 3200, 1) * np.clip(t / 0.03, 0, 1) * np.clip((d - t) / 0.05, 0, 1)
    click = G.clink(r, f0=2600, dur=0.05, bright=0.6) * 0.25
    return fades(_sum(body * 0.7, (click, d - 0.04)), 0.003, 0.02)


def stumble(r):
    """a stumble: two quick shoe scuffs on the floor and a light body-weight thump"""
    sc = [bp(colored(ns(0.12), r, 0.6), 400, 3500, 1) * _env(tt(0.12), 0.01, 0.04) for _ in range(2)]
    t = tt(0.25)
    thump = lp(colored(len(t), r, 1.2), 300) * _env(t, 0.003, 0.07) * 1.2 + np.sin(phase(70 + 40 * np.exp(-t / 0.03))) * _env(t, 0.002, 0.06) * 0.6
    return fades(_sum((sc[0] * 0.8, 0.0), (sc[1] * 0.7, 0.11), (thump, 0.2)), 0.002, 0.05)


# ------------------------------------------------------------------ crews, votes, writing, money (pirate democracy revision)
def _aye(r, base, scale):
    """one voice shouting 'aye!' (a -> i), falling at the end"""
    d = r.uniform(0.32, 0.45)
    n = ns(d + 0.05)
    t = np.arange(n) / SR
    f0 = base * _track_lin(t, [(0, 1.45), (0.06, 1.6), (d, 1.2)])
    forms = G.vowel_track(n, [(0, "a"), (d * 0.45, "A"), (d, "i")])
    amp = np.clip(t / 0.025, 0, 1) * np.clip((d + 0.04 - t) / 0.09, 0, 1)
    return G.vox(f0, forms, amp, r, scale, tilt=0.95, breath=0.3)


def crowd_aye(r):
    """a crew voting: a ragged chorus of 'aye!' from about eight voices, then a short cheer"""
    parts = []
    for i in range(8):
        base, scale = r.uniform(95, 175), r.uniform(0.9, 1.15)
        parts.append((_aye(r, base, scale) * r.uniform(0.5, 1.0), r.uniform(0.0, 0.22)))
    for i in range(5):
        parts.append((G.hurrah(r, r.uniform(100, 170), r.uniform(0.9, 1.15)) * r.uniform(0.25, 0.45), r.uniform(0.35, 0.6)))
    y = _sum(*parts)
    return fades(lp(y, 6000), 0.005, 0.15) * 0.2


def crowd_murmur(r):
    """a crew meeting: a low murmur of several people talking at once (3 s)"""
    dur = 3.0
    y = sum(G.babble(dur, r, r.uniform(95, 180), r.uniform(0.9, 1.15), rate=3.8, active=0.7) * r.uniform(0.5, 1.0) for _ in range(6))
    return fades(lp(y, 2600), 0.4, 0.6) * 0.35


def quill_scratch(r):
    """a quill signing: quick scratchy strokes on parchment (about 1 s)"""
    out = np.zeros(ns(1.0))
    tm = 0.0
    while tm < 0.9:
        L = r.uniform(0.06, 0.16)
        x = bp(r.standard_normal(ns(L)), 2200, 7000, 1) * np.sin(np.pi * np.clip(tt(L) / L, 0, 1)) * r.uniform(0.5, 1.0)
        x *= 1 + 0.6 * (r.standard_normal(len(x)) > 1.6)   # paper grain ticks
        i = ns(tm); out[i:i + len(x)] += x[: len(out) - i]
        tm += L + r.uniform(0.02, 0.07)
    return fades(out, 0.005, 0.05) * 0.5


def coins_pour(r):
    """a handful of coins poured into a hand: a quick cascade of clinks and a settling jingle"""
    parts = []
    for i in range(14):
        tm = 0.03 * i + r.uniform(0, 0.03) + (0.25 if i > 9 else 0)
        parts.append((G.clink(r, f0=r.uniform(2600, 5200), dur=0.12, bright=0.8) * r.uniform(0.3, 0.8), tm))
    return fades(_sum(*parts), 0.002, 0.08) * 0.7


# ------------------------------------------------------------------ race day, 1904 (Video 04)
def engine(r):
    """an early motor car: a single-cylinder putter-putter (low chugs ~9 a second) with a rattle, 1.8 s, fading out"""
    d = 1.8
    out = np.zeros(ns(d))
    tm, rate = 0.0, r.uniform(8.0, 9.5)
    while tm < d - 0.12:
        L = 0.07
        t = tt(L)
        chug = lp(colored(len(t), r, 1.0), 420) * _env(t, 0.004, 0.025) * 1.4 + np.sin(phase(55 + 25 * np.exp(-t / 0.02))) * _env(t, 0.003, 0.03)
        i = ns(tm); out[i:i + len(chug)] += chug[: len(out) - i] * r.uniform(0.75, 1.0)
        tm += 1.0 / rate * r.uniform(0.9, 1.1)
    rattle = bp(colored(len(out), r, 0.4), 1800, 5200, 1) * 0.06 * (1 + 0.5 * np.sin(phase(np.full(len(out), rate))))
    return fades(out + rattle, 0.05, 0.5) * 0.7


def honk(r):
    """a rubber bulb horn: two reedy honks (a squeezed brass reed, ~330 Hz with a pitch dip)"""
    def one(d):
        t = tt(d)
        f = 330 * (1 + 0.06 * np.exp(-t / 0.03) - 0.05 * (t / d))
        ph = phase(f)
        reed = np.sign(np.sin(ph)) * 0.5 + 0.5 * np.sin(ph * 2)
        return bp(reed, 250, 3200, 1) * np.clip(t / 0.015, 0, 1) * np.clip((d - t) / 0.04, 0, 1)
    return fades(_sum((one(0.22), 0.0), (one(0.3), 0.3)), 0.003, 0.03) * 0.45


def backfire(r):
    """an old car breaking down: a sharp backfire bang, a metallic clank, then a long steam hiss"""
    t = tt(0.4)
    bang = lp(colored(len(t), r, 0.8), 2400) * _env(t, 0.001, 0.05) * 2.0 + np.sin(phase(60 + 80 * np.exp(-t / 0.02))) * _env(t, 0.001, 0.12) * 1.2
    clank = G.clink(r, f0=r.uniform(900, 1300), dur=0.25, bright=0.4) * 0.5
    th = tt(1.4)
    hiss = hp(colored(len(th), r, 0.0), 2500) * np.clip(th / 0.08, 0, 1) * np.exp(-th / 0.8) * 0.35
    return fades(_sum((bang, 0.0), (clank, 0.06), (hiss, 0.12)), 0.001, 0.2) * 0.8


def bark(r):
    """a farm dog: two quick woofs (a rough voiced burst with a falling pitch)"""
    def woof(base):
        d = r.uniform(0.13, 0.17)
        t = tt(d)
        f = base * (1.25 - 0.45 * (t / d))
        ph = phase(f)
        voiced = np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.35 * np.sin(3 * ph) + 0.4 * np.sign(np.sin(ph))
        rough = bp(colored(len(t), r, 0.6), 500, 2500, 1) * 0.6
        x = (voiced * 0.5 + rough) * np.clip(t / 0.01, 0, 1) * np.exp(-t / (d * 0.6))
        return peq(bp(x, 180, 3400, 1), 900, 6, 1.2)
    b0 = r.uniform(300, 360)
    return fades(_sum((woof(b0), 0.0), (woof(b0 * 0.95), 0.22)), 0.002, 0.05) * 0.55


def crack_egg(r):
    """an egg cracked on a rim: a sharp shell crack, a short crunch, a soft wet drop"""
    t = tt(0.06)
    crack = hp(colored(len(t), r, 0.2), 1800) * _env(t, 0.0005, 0.012) * 1.4
    tc = tt(0.12)
    crunch = bp(colored(len(tc), r, 0.4), 1500, 6000, 1) * _env(tc, 0.002, 0.04) * 0.6
    drop = G.clink(r, f0=r.uniform(500, 700), dur=0.1, bright=0.1) * 0.18
    return fades(_sum((crack, 0.0), (crunch, 0.03), (drop, 0.18)), 0.0005, 0.04) * 0.7


# ------------------------------------------------------------------ Video 05 (The Extra Door): a quiet house at night
def knock_heavy(r):
    """ONE slow, heavy knock on an old wooden door (cue it once per knock): a knuckle crack, a deep door-panel boom
    and a short hallway tail"""
    t = tt(0.9)
    body = modal(0.9, [(r.uniform(92, 104), 1.0, 0.11), (r.uniform(176, 190), 0.55, 0.06), (r.uniform(330, 360), 0.3, 0.03)], r)
    knuckle = bp(r.standard_normal(ns(0.03)), 900, 5000, 1) * np.exp(-tt(0.03) / 0.004) * 0.9
    tail = lp(colored(len(t), r, 0.9), 600) * np.exp(-t / 0.18) * 0.06
    return fades(_sum((body * 0.9, 0.0), (knuckle, 0.0), (tail, 0.01)), 0.0005, 0.12) * 0.9


def phone_buzz(r):
    """a phone vibrating in a hand: two short buzzes"""
    def buzz(d):
        t = tt(d)
        f = r.uniform(165, 180)
        x = np.sign(np.sin(phase(np.full(len(t), f)))) * 0.5 + np.sin(phase(np.full(len(t), 2 * f))) * 0.3
        return bp(x, 120, 2200, 1) * np.clip(t / 0.01, 0, 1) * np.clip((d - t) / 0.02, 0, 1) * 0.35
    return fades(_sum((buzz(0.32), 0.0), (buzz(0.32), 0.48)), 0.002, 0.02)


def phone_tap(r):
    """soft phone-screen typing: a quick run of glassy taps (about 1.4 s)"""
    out = []
    t0 = 0.0
    for k in range(13):
        tc = tt(0.03)
        x = bp(r.standard_normal(len(tc)), 1500, 6500, 1) * np.exp(-tc / 0.0035) * r.uniform(0.18, 0.28)
        out.append((x, t0))
        t0 += r.uniform(0.07, 0.13)
    return fades(_sum(*out), 0.0005, 0.02)


def latch_click(r):
    """a door latch releasing: a metallic click and the small thunk of the bolt"""
    t = tt(0.06)
    click = hp(colored(len(t), r, 0.2), 2500) * _env(t, 0.0004, 0.006) * 0.9
    ring = G.clink(r, f0=r.uniform(2400, 2800), dur=0.12, bright=0.6) * 0.35
    thunk = np.sin(phase(np.full(ns(0.08), r.uniform(150, 180)))) * np.exp(-tt(0.08) / 0.02) * 0.35
    return fades(_sum((click, 0.0), (ring, 0.002), (thunk, 0.035)), 0.0003, 0.05) * 0.8


SFX = {
    "pop": pop, "ding": ding, "blip_up": blip_up, "boing": boing, "poof": poof, "twinkle": twinkle, "impact": impact,
    "thud": thud, "party_pop": party_pop, "drip": drip, "steam": steam, "snore_soft": snore_soft, "ring_ding": ring_ding,
    "sting_low": sting_low, "swish_soft": swish_soft, "whoosh_short": whoosh_short, "whoosh_long": whoosh_long,
    "whoosh_low": whoosh_low, "flash_swish": flash_swish, "step_hard": step_hard, "step_stone": step_stone,
    "step_floor": step_floor, "step_grass": step_grass, "knock": knock, "clock_tick": clock_tick, "cash": cash,
    "gasp": gasp, "oof": oof, "applause": applause, "creak": creak, "crack": crack, "splash": splash, "bubbles": bubbles,
    "clink": clink, "hammer": hammer, "cannon": cannon, "bell_ring": bell_ring, "wave_crash": wave_crash,
    "giggle": giggle, "feather_swish": feather_swish, "servo": servo, "stumble": stumble,
    "crowd_aye": crowd_aye, "crowd_murmur": crowd_murmur, "quill_scratch": quill_scratch, "coins_pour": coins_pour,
    "engine": engine, "honk": honk, "backfire": backfire, "bark": bark, "crack_egg": crack_egg,
    "knock_heavy": knock_heavy, "phone_buzz": phone_buzz, "phone_tap": phone_tap, "latch_click": latch_click,
}


# ------------------------------------------------------------------ ambience beds (stereo, any length)
def _bed(dur, r, parts):
    n = ns(dur)
    out = np.zeros((2, n))
    for x, g in parts:
        x = st(x) if np.ndim(x) == 1 else x
        out += g * x[:, :n] if x.shape[1] >= n else g * np.pad(x, ((0, 0), (0, n - x.shape[1])))
    return out


def _wide(x, r):
    return widen(x, r, 13, 0.7)


def _room(dur, r, bright=500):
    return _wide(lp(colored(ns(dur), r, 1.0), bright) * (1 + 0.1 * smooth_noise(ns(dur), r, 0.2)), r)


def _traffic(dur, r, level=1.0):
    n = ns(dur)
    rumble = lp(colored(n, r, 1.6), 260) * (1 + 0.35 * smooth_noise(n, r, 0.15))
    passes = np.zeros(n)
    t0 = r.uniform(0.5, 3.0)
    while t0 < dur:
        L = r.uniform(2.5, 4.5)
        seg = bp(colored(ns(L), r, 0.8), 150, 1600, 1) * np.sin(np.pi * np.clip(tt(L) / L, 0, 1)) ** 2
        i = ns(t0)
        passes[i:i + len(seg)] += seg[: n - i] * r.uniform(0.4, 0.9)
        t0 += r.uniform(2.5, 6.0)
    return _wide((rumble + 0.6 * passes) * level, r)


def amb_city_day(dur, r):
    return _bed(dur, r, [(_traffic(dur, r), 1.0), (G.bird_chirps(dur, r, 0.25), 0.12), (G.breeze(dur, r, 0.6), 0.25)])


def amb_city_night(dur, r):
    return _bed(dur, r, [(_traffic(dur, r, 0.6), 1.0), (G.crickets(dur, r, 2), 0.1), (G.breeze(dur, r, 0.4), 0.2)])


def amb_square(dur, r):
    crowd = lp(G.babble(dur, r, 150.0, 1.0, rate=3.6, active=0.6), 1800)
    return _bed(dur, r, [(_wide(crowd, r), 0.5), (G.bird_chirps(dur, r, 0.35), 0.15), (G.breeze(dur, r, 0.6), 0.3)])


def amb_square_night(dur, r):
    return _bed(dur, r, [(G.crickets(dur, r, 3), 0.25), (G.breeze(dur, r, 0.5), 0.35)])


def amb_nature_day(dur, r):
    return _bed(dur, r, [(G.bird_chirps(dur, r, 0.6), 0.35), (G.bird_chirps(dur, r, 0.25, "blackbird"), 0.25), (G.breeze(dur, r, 1.0), 0.45)])


def amb_nature_night(dur, r):
    return _bed(dur, r, [(G.crickets(dur, r, 4), 0.35), (G.breeze(dur, r, 0.6), 0.35)])


def amb_room(dur, r):
    return _bed(dur, r, [(_room(dur, r), 1.0)])


def amb_office(dur, r):
    hvac = _wide(bp(colored(ns(dur), r, 0.6), 120, 900, 1), r)
    return _bed(dur, r, [(_room(dur, r, 700), 0.8), (hvac, 0.5)])


def amb_lab(dur, r):
    t = tt(dur)
    hum = (np.sin(TAU * 60 * t) + 0.4 * np.sin(TAU * 120 * t)) * 0.08
    bub = G.bubbles(dur, r, 2.0) * 0.15
    return _bed(dur, r, [(_room(dur, r, 600), 0.8), (hum, 1.0), (bub, 1.0)])


def amb_sea(dur, r):
    """open sea: slow waves, wind, distant gulls (pirates, ships, beaches)"""
    n = ns(dur)
    swell = lp(colored(n, r, 0.6), 1800) * (0.55 + 0.45 * np.sin(TAU * 0.11 * tt(dur) + r.uniform(0, TAU)) ** 2)
    gulls = np.zeros(n)
    t0 = r.uniform(1, 4)
    while t0 < dur - 1:
        g, tg = _chirp(r.uniform(1400, 1700), r.uniform(900, 1100), 0.35, r, 0.7)
        g = g * np.sin(np.pi * tg / 0.35) ** 2 * (1 + 0.3 * np.sin(TAU * 18 * tg))
        i = ns(t0)
        gulls[i:i + len(g)] += g[: n - i] * r.uniform(0.3, 0.6)
        t0 += r.uniform(3, 7)
    return _bed(dur, r, [(_wide(swell, r), 1.0), (G.breeze(dur, r, 1.2), 0.5), (gulls, 0.12)])


AMBIENCE = {
    "amb_city_day": amb_city_day, "amb_city_night": amb_city_night, "amb_square": amb_square,
    "amb_square_night": amb_square_night, "amb_nature_day": amb_nature_day, "amb_nature_night": amb_nature_night,
    "amb_room": amb_room, "amb_office": amb_office, "amb_lab": amb_lab, "amb_sea": amb_sea,
}
