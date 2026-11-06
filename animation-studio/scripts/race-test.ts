// Race 1904 engine tests (Video 04). No rendering:
//   track    a prop travelling with an actor sits at the actor (minus `behind` along the walk, plus `offset` in the
//            actor's frame), turns to the walk heading, and reports distance and speed (wheels, legs)
//   ride     an actor riding (walk mode "ride") is carried along without a profile walk or footsteps
//   validate tracked props need a rig and an actor in the shot; they have no fixed footprint to check
//   music    musicDrop gives the soundtrack plan a drop-out time at the end of the named word; no drop-out otherwise
//   crowd    the runner1904 era: sleeveless vests (bare arms), knee shorts, no hats or glasses
//   theme    the race1904 assets are in the library; display props validate their text
import "./lib/dom-stub";
import { trackPose, compile } from "../src/studio/story/compile";
import { validate } from "../src/studio/story/validate";
import { soundPlan, footstepTimes } from "../src/studio/sound/cues";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { extra } from "../src/studio/characters/cast";
import { PROPS } from "../src/studio/props/registry";
import { ROSTER } from "../src/studio/characters/roster";
import { ITEMS } from "../src/studio/characters/items";
import { SETS } from "../src/studio/sets";
import type { ActorSpec, Storyboard } from "../src/studio/story/types";
const proc = (globalThis as unknown as { process: { exit(n: number): void } }).process;
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? "ok  " : "FAIL"}  ${m}`); if (!c) fails++; };
const near = (a: number, b: number, e = 1e-6) => Math.abs(a - b) < e;

// track: an actor walking +x from x=0 to x=10 over 0..2 s
const a: ActorSpec = { who: "milo", at: [0, 0, 0], walk: { to: [10, 0, 0], t0: 0, t1: 2, mode: "ride" } } as ActorSpec;
const p0 = trackPose("raceRoad", a, { who: "milo" }, 1), p1 = trackPose("raceRoad", a, { who: "milo", behind: 1.5 }, 1), p2 = trackPose("raceRoad", a, { who: "milo", offset: [0.35, 0.25] }, 1);
ok(near(p0.heading, Math.PI / 2), "a tracked prop turns to the walk heading (+x = 90 degrees)");
ok(near(p1.pos[0], p0.pos[0] - 1.5) && near(p1.pos[2], p0.pos[2]), "behind: 1.5 puts it 1.5 m back along the walk (a dog chasing)");
ok(near(p2.pos[0], p0.pos[0] + 0.25) && near(p2.pos[2], p0.pos[2] - 0.35), "offset [x, z] is in the actor's own frame (a car around its rider)");
ok(near(p0.dist, 5, 1e-3) && p0.speed > 4, `distance and speed reported (${p0.dist.toFixed(2)} m, ${p0.speed.toFixed(1)} m/s at mid-walk)`);
ok(trackPose("raceRoad", a, { who: "milo" }, 2.5).speed === 0, "speed 0 once the walk is over (wheels and legs stop)");

// ride: no footsteps
ok(footstepTimes("raceRoad", a, 2).length === 0, "a ride makes no footsteps");
const runner = { ...a, walk: { ...a.walk!, mode: "run" as const } };
ok(footstepTimes("raceRoad", runner, 2).length > 3, "a run does (unchanged)");

// validator rules for tracked props
const base = (props: unknown[], actors: unknown[]): Storyboard => ({ id: "t", cast: { milo: "miloRunner" }, shots: [{ dur: 2, set: "raceRoad", camera: { move: "view", view: "road wide" }, actors, props }] } as unknown as Storyboard);
const v1 = validate(base([{ id: "motorCar1904", at: "carEnd", track: { who: "gus" } }], [{ who: "milo", at: "a" }]));
ok(v1.errors.some((e) => e.includes("travels with \"gus\"")), "a tracked prop whose actor isn't in the shot is an error");
const v2 = validate(base([{ id: "appleTree", at: "a", track: { who: "milo" } }], [{ who: "milo", at: "a" }]));
ok(v2.errors.some((e) => e.includes("can't move (no rig)")), "a prop without a rig can't travel with someone");
const v3 = validate(base([{ id: "farmDog", at: "a", track: { who: "milo", behind: 1.2 } }], [{ who: "milo", at: "a", walk: { to: "c", t0: 0, t1: 2, mode: "run" } }]));
ok(!v3.errors.some((e) => e.includes("stands on")), "a tracked prop on its actor's mark is not 'standing on' them");

// music drop-out
const mar = STORIES.find((s) => s.id === "marathon-1904")!, filmM = compile(mar, NARRATION[mar.id]), pm = soundPlan(filmM, mar);
ok(pm.drop_t !== undefined && pm.drop_t < pm.button_t && pm.button_t - pm.drop_t < 1.2, `marathon-1904: the music drops out at ${pm.drop_t?.toFixed(2)} s, before the button at ${pm.button_t.toFixed(2)} s`);
const others = STORIES.filter((s) => s.id !== "marathon-1904").map((s) => soundPlan(compile(s, NARRATION[s.id]), s));
ok(others.every((p) => p.drop_t === undefined), "no other storyboard has a drop-out (their soundtrack plans are unchanged)");

// runner1904 crowd
const rs = Array.from({ length: 24 }, (_, i) => extra(i, "runner1904"));
ok(rs.every((l) => l.bare?.arms && !!l.shorts && !l.hat && !l.glasses), "runner1904 extras: bare arms, knee shorts, no hats or glasses");
ok(Array.from({ length: 24 }, (_, i) => JSON.stringify(extra(i, "victorian"))).every((j) => !j.includes("shorts")), "other eras unchanged (no shorts)");

// theme assets
ok(["motorCar1904", "farmDog", "appleTree", "finishArch", "finishTape", "arrowSign", "waterTable"].every((k) => PROPS[k]), "race1904 props in the library");
ok(["miloRunner", "hicks", "carvajal", "taunyane", "mashiani", "handlerA", "handlerB", "gusOfficial", "juno1904"].every((k) => ROSTER[k]), "race1904 characters in the roster");
ok(["egg", "vial", "hipFlask", "appleRotten"].every((k) => ITEMS[k]), "race1904 items in the library");
ok(!!SETS.raceRoad, "the raceRoad set is registered");
ok(PROPS.finishArch.param!.ok("BOSTON 1905") && !PROPS.finishArch.param!.ok("<- WRONG WAY ->") && PROPS.arrowSign.param!.ok("COURSE"), "banner / arrow sign text is validated like the other displays");

console.log(fails ? `\n${fails} race test(s) failed` : "\nrace 1904 ok");
if (fails) proc.exit(1);
