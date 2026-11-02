// Stage 1D check: ~13 s across four sets with named camera moves, subtle acting (idle life, nods, talking hands and
// mouths, turning toward each other), effect cards and the new light presets (cool lab, night). Built on SetWorld.
import React from "react";
import { StudioFilm, Timeline } from "../look/StudioFilm";
import { SetWorld, WorldShot, Director } from "../scene/SetWorld";
import { plan, Move } from "../camera/moves";
import { LAYOUTS } from "../sets/layouts";
import { lookCard, contactShadow } from "../cards/person";
import { MILO, JUNO, GUS } from "../characters/cast";
import { act, Pose, Act } from "../characters/figure";
import { idle, nod, talk, layer, faceToward } from "../characters/acting";
import { fxNear, FxKind } from "../fx/effects";
import type { LightName } from "../scene/environment";
import type { V3 } from "../camera/keys";

const FPS = 30;
const S = (set: string) => LAYOUTS[set].spots;
type Def = { a: number; b: number; set: string; light: LightName; move: Move; cut?: boolean; kicks?: [number, number][] };
const DEFS: Def[] = [
  { a: 0, b: 84, set: "city", light: "day", move: { move: "frame", marks: [S("city").a, S("city").b, S("city").c], size: "full", from: 4, height: 1.5 } },
  { a: 84, b: 150, set: "city", light: "day", move: { move: "closeUp", mark: S("city").a, from: 10, punch: true }, cut: true, kicks: [[2.9, 0.8]] },
  { a: 150, b: 240, set: "office", light: "interior", move: { move: "overShoulder", over: S("office").b, at: S("office").a, side: 1 } },
  { a: 240, b: 315, set: "lab", light: "interiorCool", move: { move: "orbit", marks: [S("lab").a, S("lab").b], fromDeg: [-18, 22], size: "medium", height: 1.45 } },
  { a: 315, b: 400, set: "nature", light: "night", move: { move: "crane", marks: [S("nature").a, S("nature").b, S("nature").c], heights: [5.5, 1.5], size: "full", from: 6 } },
];
const SHOTS: WorldShot[] = DEFS.map((d, i) => { const p = plan(d.move, d.a - (i ? 4 : 0), d.b, { cut: true }); return { id: i + 1, a: d.a, b: d.b, set: d.set, light: d.light, keys: [p.key], dof: p.dof, kicks: d.kicks }; });
const XF: Record<number, number> = { 3: 8, 4: 8, 5: 10 };
const timeline: Timeline = {
  total: 400, flashes: [84],
  layersAt: (f) => {
    for (const s of SHOTS) { const x = XF[s.id]; if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }]; }
    return [{ id: (SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1]).id, alpha: 1 }];
  },
};

const director: Director = (shot, f, cam, _built, out) => {
  const t = f / FPS, sp = S(shot.set);
  const person = (L: typeof MILO, seed: number, m: V3, pose: Pose) => { out.places.push(lookCard(cam, L, m[0], m[1], m[2], { pose })); contactShadow(out, cam.sun, shot.light, m[0], m[1], m[2]); };
  const fx = (k: FxKind, m: V3, t0: number, life = 1.6) => { const c = fxNear(cam, k, m, t, t0, life); if (c) out.fx.push(c); };
  const toward = (a: V3, b: V3) => faceToward(cam.right.x, cam.right.z, [a[0], a[2]], [b[0], b[2]]);
  const A = (a: Act) => act(a);
  if (shot.id <= 2) {
    // Milo asks, Juno listens and nods, Gus idles; Milo's realisation punches in at 2.9 s
    const milo = t < 2.8 ? layer(A("neutral"), idle(t, 1), talk(t, 0.3, 2.6, 1), { facing: toward(sp.a, sp.b) }) : layer(A("shock"), idle(t, 1, 0.3));
    person(MILO, 1, sp.a, milo);
    person(JUNO, 2, sp.b, layer(A("neutral"), idle(t, 2), { headTilt: nod(t, 1.4, 2), facing: toward(sp.b, sp.a) }));
    person(GUS, 3, sp.c, layer(A("happy"), idle(t, 3), { facing: toward(sp.c, sp.a) }));
    fx("question", sp.a, 1.2, 1.3); fx("exclaim", sp.a, 2.85, 1.8);
  } else if (shot.id === 3) {
    person(MILO, 1, sp.b, layer(A("neutral"), idle(t, 1), { headTilt: nod(t, 6.4, 3), back: true }));
    person(JUNO, 2, sp.a, layer(A("neutral"), idle(t, 2, 0.6), talk(t, 5.1, 7.9, 2), { facing: toward(sp.a, sp.b) }));
  } else if (shot.id === 4) {
    person(JUNO, 2, sp.a, layer(t < 9.0 ? A("thinking") : A("idea"), idle(t, 2, 0.5)));
    person(GUS, 3, sp.b, layer(t < 9.3 ? A("neutral") : A("laugh"), idle(t, 3)));
    fx("idea", sp.a, 9.0, 1.4); fx("sparkle", sp.b, 9.4, 1.0);
  } else {
    person(MILO, 1, sp.a, layer(A("sleepy"), idle(t, 1, 0.4)));
    person(JUNO, 2, sp.b, layer(A("neutral"), idle(t, 2)));
    person(GUS, 3, sp.c, layer(A("happy"), idle(t, 3), { headTilt: nod(t, 11.8, 2) }));
    fx("zzz", sp.a, 11.0, 2.2);
  }
};

const load = () => Promise.resolve(true);
const makeWorld = () => new SetWorld(SHOTS, director);
export const MOVESTEST_FRAMES = 400;
export const MovesTest: React.FC = () => <StudioFilm timeline={timeline} makeWorld={makeWorld} load={load} />;
