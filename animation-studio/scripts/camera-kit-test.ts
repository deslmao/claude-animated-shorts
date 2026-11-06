// Camera kit tests (Video 04 upgrade, reference clip 3). No rendering:
//   swoop    eases with most of the travel early, a small overshoot, lands exactly on its framing, arcs sideways,
//            and is a rush for the controlled blur (heavy smear only while travelling, sharp on landing)
//   macro    a macro insert on a held item / a display fills ~70 % of the frame width, centred, under the ceiling
//   glance   an eye-glance beat sets the gaze and "camera" returns it; it survives act changes
//   display  in-world text props accept valid text and the validator rejects invalid text
// The camera-kit QA storyboard (stories/camera-kit.ts) exercises all of it; regression frames check the pictures.
import "./lib/dom-stub";
import * as THREE from "three";
import { STORIES } from "../src/studio/stories";
import { compile, basePoseAt, GLANCE, MACRO_FILL, MACRO_HELD_SPAN, swoopFrames } from "../src/studio/story/compile";
import { validate } from "../src/studio/story/validate";
import { runKeys, swoopEase } from "../src/studio/camera/keys";
import { LAYOUTS } from "../src/studio/sets/layouts";
import { PROPS } from "../src/studio/props/registry";
import type { Storyboard } from "../src/studio/story/types";
const proc = (globalThis as unknown as { process: { exit(n: number): void } }).process;
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? "ok  " : "FAIL"}  ${m}`); if (!c) fails++; };

// swoop ease
const us = Array.from({ length: 101 }, (_, i) => swoopEase(i / 100)), peak = Math.max(...us);
ok(Math.abs(swoopEase(1) - 1) < 1e-9 && Math.abs(swoopEase(0)) < 1e-9, "swoop ease starts at 0 and lands exactly on 1");
ok(swoopEase(0.5) > 0.8, `swoop ease rushes early (${(swoopEase(0.5) * 100).toFixed(0)} % of the travel by half time)`);
ok(peak > 1.005 && peak < 1.04, `swoop overshoot is small (${((peak - 1) * 100).toFixed(1)} %)`);

const sb = STORIES.find((s) => s.id === "camera-kit")!;
const film = compile(sb) as unknown as { shots: { a: number; keys: Parameters<typeof runKeys>[0]; shutterCap?: (f: number) => number }[]; timing: { sb: Storyboard } };
const shot = film.shots[0], spec = film.timing.sb.shots[0], cams = spec.cams!;
const camAt = (f: number) => { const c = runKeys(shot.keys, f), k = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 3000); k.position.set(...c.pos); k.lookAt(...c.look); k.updateMatrixWorld(); k.updateProjectionMatrix(); return { c, k }; };
// swoop lands on its framing and arcs on the way
const sw = cams[0] as { t?: number; swoop?: number | true }, f0 = shot.a + Math.round((sw.t ?? 0) * 30), n = swoopFrames(sw.swoop);
const land = camAt(f0 + n).c, settled = camAt(f0 + n + 6).c, mid = camAt(f0 + Math.round(n / 2)).c, start = camAt(f0 - 1).c;
ok(Math.hypot(land.pos[0] - settled.pos[0], land.pos[1] - settled.pos[1], land.pos[2] - settled.pos[2]) < 0.05, "swoop has landed on its framing when its travel ends");
{ const d = [settled.pos[0] - start.pos[0], settled.pos[2] - start.pos[2]], L = Math.hypot(d[0], d[1]), m = [mid.pos[0] - start.pos[0], mid.pos[2] - start.pos[2]], side = Math.abs(m[0] * d[1] - m[1] * d[0]) / (L || 1);
  ok(side > 0.01, `swoop travels on a sideways arc (${(side * 100).toFixed(0)} cm off the straight line mid-way)`); }
// controlled blur: a rush while travelling, back to the insert's level on landing
ok(!!shot.shutterCap && shot.shutterCap(f0 + 1) > shot.shutterCap(f0 + n + 2), `swoop smears while it rushes (cap ${shot.shutterCap?.(f0 + 1).toFixed(0)} px) and lands sharp (cap ${shot.shutterCap?.(f0 + n + 2).toFixed(0)} px)`);

// macro on the held keys: centred, the item filling ~MACRO_FILL of the width
{ const { c, k } = camAt(f0 + n + 4), look = new THREE.Vector3(...c.look), right = new THREE.Vector3().setFromMatrixColumn(k.matrixWorld, 0);
  const a = look.clone().addScaledVector(right, -MACRO_HELD_SPAN / 2).project(k), b = look.clone().addScaledVector(right, MACRO_HELD_SPAN / 2).project(k);
  const w = (b.x - a.x) / 2; ok(Math.abs(w - MACRO_FILL) < 0.12, `macro on a held item fills ${(w * 100).toFixed(0)} % of the frame width (target ${MACRO_FILL * 100} %)`); }
// macro on the score board: its text face fills ~MACRO_FILL of the width, the camera under the ceiling
{ const bt = cams[2] as { t?: number; swoop?: number | true }, fb = shot.a + Math.round((bt.t ?? 0) * 30) + swoopFrames(bt.swoop) + 4, { c, k } = camAt(fb);
  const span = PROPS.scoreBoard.focus!.span, look = new THREE.Vector3(...c.look), right = new THREE.Vector3().setFromMatrixColumn(k.matrixWorld, 0);
  const w = (look.clone().addScaledVector(right, span / 2).project(k).x - look.clone().addScaledVector(right, -span / 2).project(k).x) / 2;
  ok(Math.abs(w - MACRO_FILL) < 0.12, `macro on a display frames its text: ${(w * 100).toFixed(0)} % of the frame width`);
  ok(c.pos[1] <= (LAYOUTS.apartment.ceiling ?? 99) - 0.29, `macro camera stays under the ceiling (y ${c.pos[1].toFixed(2)} m)`); }

// eye glances
{ const milo = spec.actors.find((x) => x.who === "milo")!;
  const lk = (t: number) => basePoseAt(milo, t).base.look;
  ok(lk(2.5) === undefined, "no glance before the first glance beat");
  ok(JSON.stringify(lk(3.0)) === JSON.stringify(GLANCE.left), "a glance beat turns the eyes left");
  ok(lk(4.0) === undefined, `"camera" returns the eyes to the lens`);
  const m2 = structuredClone(milo); m2.beats = [{ t: 0.5, look: "right" }, { t: 1.0, act: "shock" }];
  ok(JSON.stringify(basePoseAt(m2, 1.5).base.look) === JSON.stringify(GLANCE.right), "a glance holds through a later act change"); }

// in-world text displays
ok(PROPS.signBoard.param!.ok("FINISH") && PROPS.scoreBoard.param!.ok("3:28:53"), "display props accept a word and a time");
ok(!PROPS.signBoard.param!.ok("") && !PROPS.signBoard.param!.ok("THIS TEXT IS FAR TOO LONG") && !PROPS.signBoard.param!.ok("WIN😀"), "display props reject empty, too long and unsupported text");
{ const bad = structuredClone(sb); bad.shots[0].props![0].variant = "THIS TEXT IS FAR TOO LONG"; const r = validate(bad);
  ok(r.errors.some((e) => e.includes("signBoard") && e.includes("not a valid")), "the validator rejects a display with invalid text"); }

console.log(fails ? `\n${fails} camera kit test(s) FAILED` : "\ncamera kit ok");
proc.exit(fails ? 1 : 0);
