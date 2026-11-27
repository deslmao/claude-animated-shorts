// The real shot list of a storyboard (markdown on stdout):  npm run shot-list -- <story-id>
// One row per shot: time, who speaks and what, the camera (move, lens, in-shot cuts), headstands, props, the pack sounds on its words.
import "./lib/dom-stub";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { compile } from "../src/studio/story/compile";
import { mmOfFov } from "../src/studio/engine4/camera";
import { runKeys } from "../src/studio/camera/keys";

declare const process: { argv: string[]; exit(n: number): never };
const sb = STORIES.find((s) => s.id === process.argv[2]);
if (!sb) { console.error("usage: npm run shot-list -- <story-id>"); process.exit(1); }
const film = compile(sb!, NARRATION[sb!.id]);
const mm = (f: number, s: (typeof film.shots)[number]) => `${Math.round(mmOfFov(runKeys(s.keys, f).fov))} mm`;
console.log(`| # | time | dur | line | camera | headstand | props | sounds on its words |\n|---|---|---|---|---|---|---|---|`);
film.shots.forEach((s, k) => {
  const spec = sb!.shots[k];
  const line = (typeof spec.say === "object" && !Array.isArray(spec.say) ? spec.say : { text: String(spec.say ?? ""), who: "narrator" }) as { text: string; who?: string };
  const cam = spec.camera as { move: string; on?: string | string[] };
  const cuts = (spec.cams ?? []).slice(1).map((c) => `${(c as { move: string }).move}`).join(", ");
  const flips = spec.actors.flatMap((a) => (a.keys ?? []).some((q) => q.flip) ? [`${a.who} ${(a.keys ?? []).map((q) => q.flip ?? 0).join("→")}`] : []);
  const props = [...new Set((spec.props ?? []).map((p) => (p.id === "e4Number" ? `3D ${p.variant}` : p.variant ? `${p.id}:${p.variant}` : p.id)))].join(", ");
  const sfx = (spec.sfx ?? []).map((x) => `${(x as { word?: string }).word ?? ""}→${x.name}`).join("; ");
  console.log(`| ${k + 1} | ${(s.a / 30).toFixed(1)} | ${((s.b - s.a) / 30).toFixed(1)} | **${line.who ?? "narrator"}**: ${line.text.replace(/\|/g, "/")} | ${cam.move}${cam.on ? ` on ${[cam.on].flat().join("+")}` : ""} ${mm(s.a, s)}${cuts ? `; cuts to ${cuts}` : ""} | ${flips.join(", ")} | ${props} | ${sfx} |`);
});
