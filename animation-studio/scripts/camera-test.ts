// Camera clearance test (no rendering): every storyboard's camera, every frame, against its sets' real geometry
// (story/clearance.ts): inside scenery, scenery within 25 cm of the lens, the view blocked by a wall.
// Productions on engine 3+ (Video 03 on) FAIL on any problem; storyboards approved before it are reported only, so
// their approved pictures stay as they are.
//   npm run test:camera [-- <story-id>]
import "./lib/dom-stub";
import { STORIES } from "../src/studio/stories";
import { compile } from "../src/studio/story/compile";
import { cameraClearance } from "../src/studio/story/clearance";
import { NARRATION } from "../src/studio/stories/voice";
const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const only = proc.process.argv.slice(2).filter((a) => !a.startsWith("--"));
let fails = 0;
for (const sb of STORIES.filter((s) => !only.length || only.includes(s.id))) {
  const strict = (sb.engine ?? 1) >= 3;
  const probs = cameraClearance(sb, compile(sb, NARRATION[sb.id]) as never);
  if (!probs.length) { console.log(`ok    ${sb.id}: camera clear of the scenery on every frame`); continue; }
  for (const p of probs) console.log(`${strict ? "FAIL" : "note"}  ${sb.id}: ${p.msg}`);
  if (strict) fails += probs.length;
}
// negative tests: the check must catch the defects it was built for
const D = STORIES.find((s) => s.id === "doorway-effect")!;
const neg = (name: string, edit: (sb: typeof D) => void, want: "inside" | "clip" | "blocked", shot: number) => {
  const sb = structuredClone(D); edit(sb);
  const got = cameraClearance(sb, compile(sb, NARRATION["doorway-effect"]) as never).filter((p) => p.shot === shot && (p.kind === want || (want === "clip" && p.kind === "inside")));
  console.log(`${got.length ? "ok  " : "FAIL"}  negative: ${name} ${got.length ? `caught (${got[0].msg})` : "NOT caught"}`);
  if (!got.length) fails++;
};
// Video 03 as first rendered: the computed insert on the thought bubble put the camera in the doorway's head trim
neg("Video 03's original keys-bubble insert (frames 1410-1425)", (sb) => {
  const c = sb.shots[8].cams!.find((x) => (x as { word?: string }).word === "sofa")!; Object.assign(c, { move: "insert", on: "thoughtBubble", size: "close", from: 72 });
  for (const k of ["pos", "look", "fov", "glide"]) delete (c as Record<string, unknown>)[k];
}, "clip", 9);
// a camera behind the dividing wall looking at Milo through it
neg("a camera behind a wall", (sb) => { sb.shots[2].camera = { move: "at", pos: [-1.5, 1.4, 0.6], look: [2.3, 1.3, 0.6], fov: 40 }; }, "blocked", 3);
console.log(fails ? `\n${fails} camera clearance problem(s)` : "\ncamera clearance ok");
proc.process.exit(fails ? 1 : 0);
