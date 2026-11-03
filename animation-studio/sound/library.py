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


SFX = {
    "pop": pop, "ding": ding, "blip_up": blip_up, "boing": boing, "poof": poof, "twinkle": twinkle, "impact": impact,
    "thud": thud, "party_pop": party_pop, "drip": drip, "steam": steam, "snore_soft": snore_soft, "ring_ding": ring_ding,
    "sting_low": sting_low, "swish_soft": swish_soft, "whoosh_short": whoosh_short, "whoosh_long": whoosh_long,
    "whoosh_low": whoosh_low, "flash_swish": flash_swish, "step_hard": step_hard, "step_stone": step_stone,
    "step_floor": step_floor, "step_grass": step_grass, "knock": knock, "clock_tick": clock_tick, "cash": cash,
    "gasp": gasp, "oof": oof, "applause": applause, "creak": creak, "crack": crack, "splash": splash, "bubbles": bubbles,
    "clink": clink, "hammer": hammer, "cannon": cannon, "bell_ring": bell_ring, "wave_crash": wave_crash,
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
