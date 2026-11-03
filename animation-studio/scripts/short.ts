// One-command production (stage 4):  npm run short -- <story-id> [options]
// Runs every production stage in order and records progress in productions/<id>/status.json, so an interrupted
// production resumes from the last successful stage (a stage is skipped when it is done and its inputs are unchanged;
// when inputs change it is redone, and everything after it). Stages:
//   validate   storyboard errors (names, framing, timing, anchors, props, crowds)                 free, seconds
//   assets     every asset the storyboard uses exists in the library (reused / missing)          free, seconds
//   approval   narration cost: new lines, characters, credits, estimated length -> WAITS for the owner's approval
//              (recorded with --approve-narration <characters>, tied to the exact script text)
//   narration  generate only the missing lines (ElevenLabs, paid, only after approval)
//   sound      music + ambience + effects + mix (free, ~10 s)
//   checks     preflight (narration complete, soundtrack fresh) + library protection
//   review     review stills: every shot, every transition, speakers + a determinism spot check -> contact sheet;
//              WAITS until the frames have been looked at (--reviewed)
//   render     commit the production + render request, push, follow the GitHub Actions run (chunks, join, QA)
//   final      download the published MP4, re-run QA, check soundtrack alignment, final strip -> DONE
// Options: --approve-narration <chars>   record the owner's approval (chars must match the current cost)
//          --reviewed                    the review sheet has been looked at and passes
//          --redo <stage>                force a stage (and everything after it) to run again
//          --until <stage>               stop after that stage          --chunks <n>   render chunks (default 20)
//          --status                      print the status and exit
import "./lib/dom-stub";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { validate } from "../src/studio/story/validate";
import { compile } from "../src/studio/story/compile";
import { lineList } from "../src/studio/story/timing";
import { soundtrackFingerprint, SoundtrackInfo } from "../src/studio/story/fingerprint";
import { fnv } from "../src/studio/voice/narration";
import { VOICES } from "../src/studio/voice/voices";
import { ASSETS } from "../src/studio/library/registry";
import { autoMood } from "../src/studio/sound/cues";
import { ambienceFor } from "../src/studio/sound/catalog";

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const proc = globalThis as unknown as { process: { argv: string[]; env: Record<string, string | undefined>; exit(n: number): never } };
const argv = proc.process.argv.slice(2), id = argv.find((a) => !a.startsWith("--") && !/^\d+$/.test(a));
const opt = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const has = (k: string) => argv.includes(k);
/** a fingerprint of the drawing engine (every source file under src/studio and src/videos), for stale review sheets */
const engineHash = (() => {
  let memo: string | undefined;
  return () => {
    if (memo) return memo;
    const files: string[] = [];
    const walk = (d: string) => { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((x: { name: string }, y: { name: string }) => x.name.localeCompare(y.name))) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(ts|tsx)$/.test(e.name)) files.push(p); } };
    for (const d of ["src/studio", "src/videos"]) if (fs.existsSync(d)) walk(d);
    return (memo = fnv(files.map((p) => p + "\n" + fs.readFileSync(p, "utf8")).join("\n")));
  };
})();
const STAGES = ["validate", "assets", "approval", "narration", "sound", "checks", "review", "render", "final"] as const;
type Stage = (typeof STAGES)[number];
type StageState = { state: "done" | "waiting" | "failed"; at: string; inputs: string; detail: string; data?: Any };
type Status = { id: string; composition: string; stages: Partial<Record<Stage, StageState>>; approval?: Any; render?: Any; final?: Any };

const die = (m: string): never => { console.error(`short: ${m}`); return proc.process.exit(1); };
if (!id) die("usage: npm run short -- <story-id> [--approve-narration N] [--reviewed] [--redo stage] [--until stage] [--chunks n] [--status]");
const sb = STORIES.find((s) => s.id === id) ?? die(`no story "${id}" (stories: ${STORIES.map((s) => s.id).join(", ")}); register it in src/studio/stories/index.ts`);
const COMP = `Short-${sb.id}`, ROOT = path.resolve(".."), DIR = path.join(ROOT, "productions", sb.id), STATUS = path.join(DIR, "status.json");
fs.mkdirSync(DIR, { recursive: true });
const status: Status = fs.existsSync(STATUS) ? JSON.parse(fs.readFileSync(STATUS, "utf8")) : { id: sb.id, composition: COMP, stages: {} };
const save = () => fs.writeFileSync(STATUS, JSON.stringify(status, null, 1) + "\n");
const now = () => new Date().toISOString();
const run = (cmd: string, args: string[], env: Record<string, string> = {}, quiet = false) => {
  const r = spawnSync(cmd, args, { stdio: quiet ? "pipe" : "inherit", env: { ...(proc.process.env as Record<string, string>), ...env }, maxBuffer: 1 << 28 });
  return { ok: r.status === 0, out: r.stdout?.toString() ?? "", err: r.stderr?.toString() ?? "" };
};
const git = (...a: string[]) => run("git", ["-C", ROOT, ...a], {}, true);
const gh = async (p: string) => { const r = await fetch(`https://api.github.com/repos/${REPO}/${p}`, { headers: { Accept: "application/vnd.github+json" } }); if (!r.ok) throw new Error(`GitHub API ${p}: HTTP ${r.status}`); return r.json() as Promise<Any>; };
const REPO = (() => { const u = git("remote", "get-url", "origin").out.trim(); const m = u.match(/github\.com[/:]([^/]+\/[^/.]+)/) ?? u.match(/git\/([^/]+\/[^/.]+)/); return m ? m[1].replace(/\.git$/, "") : "deslmao/claude-animated-shorts"; })();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

if (has("--status")) { console.log(JSON.stringify(status.stages, null, 1)); proc.process.exit(0); }
if (opt("--redo")) { const k = STAGES.indexOf(opt("--redo") as Stage); if (k < 0) die(`unknown stage ${opt("--redo")}`); for (const s of STAGES.slice(k)) delete status.stages[s]; save(); }

// ---------------------------------------------------------------- stage implementations
const narr = () => NARRATION[sb.id];
const lines = lineList(sb), newLines = () => lines.filter((l) => !fs.existsSync(`voice/cache/${l.hash}.mp3`));
const scriptHash = fnv(JSON.stringify(lines.map((l) => [l.voice, l.who, l.line.text])));
const film = () => compile(sb, narr());

const stages: Record<Stage, { inputs: () => string; run: () => Promise<StageState> | StageState }> = {
  validate: {
    inputs: () => fnv(JSON.stringify(sb)) + (narr() ? "n" : ""),
    run: () => { const r = validate(sb, narr()); return r.errors.length ? st("failed", `${r.errors.length} storyboard error(s):\n  ${r.errors.join("\n  ")}`) : st("done", `valid; ${r.warnings.length} warning(s)${r.warnings.length ? `:\n  ${r.warnings.join("\n  ")}` : ""}`); },
  },
  assets: {
    inputs: () => fnv(JSON.stringify(sb)),
    run: () => {
      const used: [string, string][] = [];
      for (const ref of Object.values(sb.cast)) used.push(typeof ref === "string" ? ["character", ref] : ["extras", `extras:${ref.era ?? "modern"}`]);
      const mood = sb.music === false ? null : typeof sb.music === "string" ? sb.music : sb.music?.mood ?? autoMood(sb).mood;
      if (mood) used.push(["mood", mood]);
      for (const s of sb.shots) {
        used.push(["set", s.set], ["camera", s.camera.move]); if (s.light) used.push(["light", s.light]);
        const amb = s.ambience === false ? null : s.ambience ?? ambienceFor(s.set, s.light ?? "day"); if (amb) used.push(["ambience", amb]);
        for (const p of s.props ?? []) used.push(["prop", p.id]);
        for (const f of s.fx ?? []) used.push(["effect", f.kind]);
        for (const x of s.sfx ?? []) used.push(["sfx", x.name]);
        if (s.crowd) used.push(["extras", `extras:${s.crowd.era ?? "modern"}`]);
        for (const a of s.actors) { if (a.act) used.push(["act", a.act]); if (a.hold) used.push(["item", a.hold]); for (const b of a.beats ?? []) { if (b.act) used.push(["act", b.act]); if (b.hold) used.push(["item", b.hold]); } }
      }
      const uniq = [...new Map(used.map((u) => [u.join(":"), u])).values()];
      const missing = uniq.filter(([k, i]) => !ASSETS.some((a) => a.kind === k && a.id === i));
      const data = { reused: uniq.length - missing.length, missing: missing.map((m) => m.join(" ")), byKind: Object.fromEntries([...new Set(uniq.map((u) => u[0]))].map((k) => [k, uniq.filter((u) => u[0] === k).map((u) => u[1])])) };
      fs.writeFileSync(path.join(DIR, "assets.json"), JSON.stringify(data, null, 1) + "\n");
      return missing.length ? st("failed", `${missing.length} asset(s) missing from the library: ${data.missing.join(", ")} (create them: docs/LIBRARY.md "Adding an asset")`, data)
        : st("done", `${data.reused} library assets reused, none missing`, data);
    },
  },
  approval: {
    inputs: () => scriptHash,
    run: () => {
      const todo = newLines(), chars = todo.reduce((n, l) => n + l.line.text.length, 0), est = film().total / 30;
      if (!todo.length) return st("done", "all narration already generated (no cost)");
      const a = status.approval;
      if (a && a.scriptHash === scriptHash && a.chars === chars) return st("done", `approved by the owner (${a.at}): ${chars} characters`);
      const asked = Number(opt("--approve-narration"));
      if (has("--approve-narration")) {
        if (asked !== chars) return st("failed", `approval for ${asked} characters does not match the current cost of ${chars}: show the owner the current script and cost again`);
        status.approval = { scriptHash, chars, at: now(), by: "the owner, in the conversation" };
        return st("done", `approval recorded: ${chars} characters`);
      }
      const words = lines.reduce((n, l) => n + l.line.text.split(/\s+/).length, 0);
      const md = [`# ${sb.title ?? sb.id}: narration approval`, "", `**Cost:** ${todo.length} new lines, **${chars} characters** (about ${chars} credits on ${[...new Set(todo.map((l) => VOICES[l.voice].model))].join(", ")}).`,
        `**Estimated length:** ${est.toFixed(1)} s (${words} words; the real length is known after generation).`, `**Voice:** ${[...new Set(lines.map((l) => VOICES[l.voice].name))].join(", ")}.`, "", "## Script", "",
        ...sb.shots.flatMap((s, k) => lines.filter((l) => l.shot === k).map((l) => `${k + 1}. ${l.who === "narrator" ? "" : `**${l.who}:** `}${l.line.text}`)), "",
        `Approve in the conversation; then: \`npm run short -- ${sb.id} --approve-narration ${chars}\``].join("\n");
      fs.writeFileSync(path.join(DIR, "approval-request.md"), md + "\n");
      return st("waiting", `WAITING FOR APPROVAL: ${todo.length} new lines, ${chars} characters, ~${est.toFixed(0)} s. Request: productions/${sb.id}/approval-request.md`);
    },
  },
  narration: {
    inputs: () => scriptHash,
    run: () => {
      if (!newLines().length) return st("done", "all lines already generated (cached)");
      const r = run("npm", ["run", "voice", "--", sb.id, "--generate"]);
      return r.ok && !newLines().length ? st("done", `generated ${lines.length} lines (cache)`) : st("failed", "narration generation failed (see above)");
    },
  },
  sound: {
    inputs: () => soundtrackFingerprint(sb, narr()),
    run: () => {
      const info = `audio/${COMP}.json`;
      if (fs.existsSync(info) && (JSON.parse(fs.readFileSync(info, "utf8")) as SoundtrackInfo).fingerprint === soundtrackFingerprint(sb, narr())) return st("done", "soundtrack up to date");
      const r = run("npm", ["run", "sound", "--", sb.id]);
      return r.ok ? st("done", "soundtrack built: " + JSON.parse(fs.readFileSync(info, "utf8")).lufs + " LUFS") : st("failed", "soundtrack build failed (see above)");
    },
  },
  checks: {
    inputs: () => soundtrackFingerprint(sb, narr()),
    run: () => {
      const pf = run("npm", ["run", "preflight", "--", COMP], {}, true), lib = run("npm", ["run", "test:library"], {}, true);
      const tail = (s: string) => s.trim().split("\n").filter((l) => /FAIL|PASS|intact|broken/.test(l)).join("\n  ");
      return pf.ok && lib.ok ? st("done", `preflight PASS; library intact`) : st("failed", `checks failed:\n  ${tail(pf.out)}\n  ${tail(lib.out)}`);
    },
  },
  review: {
    // the picture depends on the storyboard AND the engine that draws it: an engine change makes the sheet stale, so a
    // sheet looked at before the change can never be passed with --reviewed
    inputs: () => fnv(soundtrackFingerprint(sb, narr()) + "|" + engineHash()),
    run: () => {
      const f = film(), sheet = path.join(DIR, "review.jpg"), RD = path.join(DIR, "review");
      const prev = status.stages.review;
      if (prev?.state === "waiting" && prev.inputs === stages.review.inputs() && fs.existsSync(sheet)) {
        return has("--reviewed") ? st("done", "review sheet looked at and passed", prev.data) : st("waiting", `WAITING FOR REVIEW: look at productions/${sb.id}/review.jpg, then rerun with --reviewed`, prev.data);
      }
      // frames: the hook, the middle of every shot, both sides of every transition, every speaking character
      const picks = new Map<number, string>([[4, "hook (first frames)"]]);
      f.shots.forEach((s, i) => {
        picks.set(Math.round((s.a + s.b) / 2), `shot ${i + 1} middle`);
        if (i > 0) { picks.set(s.a - 2, `before cut into shot ${i + 1}`); picks.set(s.a + 3, `after cut into shot ${i + 1} (${sb.shots[i].transition ?? "cut"})`); }
        const sp = f.timing.sb.shots[i].actors.find((a) => a.speech?.length);
        if (sp) picks.set(s.a + Math.round(((sp.speech![0].t0 + sp.speech![0].t1) / 2) * 30), `shot ${i + 1}: ${sp.who} speaking`);
      });
      picks.set(f.total - 3, "last frames");
      const frames = [...picks.keys()].filter((x) => x >= 0 && x < f.total).sort((a, b) => a - b);
      fs.rmSync(RD, { recursive: true, force: true }); fs.mkdirSync(RD, { recursive: true });
      const r = run("node", ["scripts/stills.mjs", COMP, `${RD}/f`, frames.join(","), "0.5"], { REMOTION_GL: proc.process.env.REMOTION_GL ?? "swangle" }, true);
      if (!r.ok) return st("failed", `review stills failed: ${r.err.slice(-400)}`);
      // determinism spot check: a mid-film frame rendered on its own must match the one rendered in sequence
      const probe = frames[Math.floor(frames.length / 2)];
      run("node", ["scripts/stills.mjs", COMP, `${RD}/solo_`, String(probe), "0.5"], { REMOTION_GL: proc.process.env.REMOTION_GL ?? "swangle" }, true);
      const same = fs.existsSync(`${RD}/solo_${probe}.jpg`) && fs.readFileSync(`${RD}/f${probe}.jpg`).equals(fs.readFileSync(`${RD}/solo_${probe}.jpg`));
      const py = run("python3", ["-I", "-c", `
import sys
from PIL import Image, ImageDraw
d, out, labels = sys.argv[1], sys.argv[2], sys.argv[3:]
ims = [Image.open(f"{d}/f{x.split(':')[0]}.jpg").resize((216, 384)) for x in labels]
cols = 8; rows = (len(ims) + cols - 1) // cols
o = Image.new("RGB", (cols * 220, rows * 410), "white"); dr = ImageDraw.Draw(o)
for k, (im, lab) in enumerate(zip(ims, labels)):
    x, y = (k % cols) * 220, (k // cols) * 410; o.paste(im, (x, y)); dr.text((x + 2, y + 388), lab.replace(":", " ")[:34], fill=(0, 0, 0))
o.save(out, quality=82)`, RD, sheet, ...frames.map((x) => `${x}:${picks.get(x)}`)], {}, true);
      if (!py.ok) return st("failed", `contact sheet failed: ${py.err.slice(-300)}`);
      const list = frames.map((x) => `| ${x} | ${(x / 30).toFixed(2)} s | ${picks.get(x)} |`).join("\n");
      fs.writeFileSync(path.join(DIR, "review.md"), `# ${COMP} review sheet\n\nreview.jpg: ${frames.length} frames. Determinism spot check (frame ${probe} alone vs in sequence): ${same ? "identical" : "DIFFERENT"}.\n\n| frame | time | why |\n|---|---|---|\n${list}\n`);
      if (!same) return st("failed", `determinism spot check failed at frame ${probe} (chunked renders would show seams)`);
      return st("waiting", `WAITING FOR REVIEW: ${frames.length} frames in productions/${sb.id}/review.jpg (determinism: identical); rerun with --reviewed once checked`, { frames });
    },
  },
  render: {
    inputs: () => soundtrackFingerprint(sb, narr()),
    run: async () => {
      const branch = git("rev-parse", "--abbrev-ref", "HEAD").out.trim();
      if (branch === "main" || branch === "master") return st("failed", "refusing to render from the default branch");
      let r: Any = status.render;
      // a new request when the inputs changed, or when the last run failed (a failed run is never reused: fix the cause,
      // then this files a fresh request; the attempt number makes render-request.json change so the push triggers it)
      if (!r || r.inputs !== stages.render.inputs() || (r.conclusion && r.conclusion !== "success")) {
        const chunks = Number(opt("--chunks") ?? 20), attempt = (r?.inputs === stages.render.inputs() ? (r?.attempt ?? 1) : 0) + 1;
        fs.writeFileSync(path.join(ROOT, "render-request.json"), JSON.stringify({ composition: COMP, chunks, preview: false, audio: "", note: `Production ${sb.id} (npm run short)${attempt > 1 ? `, attempt ${attempt}` : ""}` }, null, 2) + "\n");
        const paths = ["animation-studio/src", "animation-studio/voice", "animation-studio/audio", "animation-studio/tests", "animation-studio/sound", "docs", `productions/${sb.id}`, "render-request.json"];
        git("add", "-A", "--", ...paths);
        const diff = git("diff", "--cached").out;
        if (/sk_[A-Za-z0-9]{20,}/.test(diff)) return st("failed", "refusing to commit: something that looks like an API key is staged");
        const msg = `Production ${sb.id}: render request (npm run short)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: ${proc.process.env.CLAUDE_SESSION_URL ?? "https://claude.ai/code/session_01484eGDHiQxzfJwkdTsH3cA"}`;
        const c = git("commit", "-q", "-m", msg);
        if (!c.ok && !/nothing to commit/.test(c.out + c.err)) return st("failed", `commit failed: ${c.err}`);
        let pushed = false;
        for (const wait of [0, 2000, 4000, 8000, 16000]) { await sleep(wait); if (git("push", "-u", "origin", branch).ok) { pushed = true; break; } }
        if (!pushed) return st("failed", "push failed after retries");
        const sha = git("rev-parse", "HEAD").out.trim();
        r = status.render = { inputs: stages.render.inputs(), sha, branch, requested: now(), attempt };
        save();
      }
      // find the run for this commit, then follow it
      for (let i = 0; !r.runId && i < 40; i++) {
        const runs = await gh(`actions/runs?branch=${encodeURIComponent(r.branch)}&head_sha=${r.sha}&per_page=5`);
        const hit = runs.workflow_runs?.find((w: Any) => w.name === "Render video");
        if (hit) { r.runId = hit.id; r.runNumber = hit.run_number; r.url = hit.html_url; save(); console.log(`render run #${hit.run_number}: ${hit.html_url}`); }
        else await sleep(15000);
      }
      if (!r.runId) return st("failed", "no GitHub Actions run appeared for the render commit");
      let last = "";
      for (;;) {
        const w = await gh(`actions/runs/${r.runId}`);
        const jobs = (await gh(`actions/runs/${r.runId}/jobs?per_page=50`)).jobs as Any[];
        const done = jobs.filter((j) => j.name.startsWith("render") && j.status === "completed").length, all = jobs.filter((j) => j.name.startsWith("render")).length;
        const line = `run #${r.runNumber}: ${w.status}${all ? `, chunks ${done}/${all}` : ""}`;
        if (line !== last) { console.log(`  ${new Date().toLocaleTimeString()} ${line}`); last = line; }
        if (w.status === "completed") {
          r.conclusion = w.conclusion; save();
          if (w.conclusion !== "success") {
            const bad = jobs.filter((j) => j.conclusion && j.conclusion !== "success").map((j) => `${j.name}: ${j.conclusion}`);
            return st("failed", `render run #${r.runNumber} ${w.conclusion}: ${bad.join(", ")} (${r.url})`);
          }
          return st("done", `render run #${r.runNumber} succeeded: ${r.url}`);
        }
        await sleep(30000);
      }
    },
  },
  final: {
    inputs: () => String(status.render?.runNumber ?? ""),
    run: async () => {
      const tag = `video-${COMP}-run${status.render.runNumber}`, F = path.join(DIR, "final");
      fs.mkdirSync(F, { recursive: true });
      const mp4 = path.join(DIR, `${COMP}.mp4`);
      const dl = run("curl", ["-sSL", "-f", "-o", mp4, `https://github.com/${REPO}/releases/download/${tag}/${COMP}.mp4`], {}, true);
      if (!dl.ok) return st("failed", `could not download the release ${tag}`);
      const f = film(), qa = run("node", ["scripts/qa.mjs", mp4, F, "--frames", String(f.total), "--audio", "required"], {}, true);
      // soundtrack alignment: the published audio must line up with the built soundtrack (envelope cross-correlation)
      const al = run("python3", ["-I", "-c", `
import subprocess, sys, numpy as np
def env(p):
    x = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-vn","-ac","1","-ar","8000","-f","f32le","-"],capture_output=True).stdout, np.float32)
    n = len(x) // 80; return np.abs(x[:n*80]).reshape(n, 80).mean(1)
a, b = env(sys.argv[1]), env(sys.argv[2]); n = min(len(a), len(b)); a, b = a[:n] - a[:n].mean(), b[:n] - b[:n].mean()
c = np.correlate(a, b, "full"); lag = (np.argmax(c) - (n - 1)) * 0.01
print(f"{lag:.3f} {np.corrcoef(a, b)[0,1]:.3f}")`, mp4, `audio/${COMP}.mp3`], {}, true);
      const [lag, corr] = al.out.trim().split(" ").map(Number);
      run("ffmpeg", ["-v", "error", "-y", "-i", mp4, "-vf", `select='${f.shots.map((s) => `eq(n\\,${Math.round((s.a + s.b) / 2)})`).join("+")}',scale=216:384,tile=${f.shots.length}x1`, "-frames:v", "1", "-q:v", "3", path.join(DIR, "final_strip.jpg")], {}, true);
      const okAl = Number.isFinite(lag) && Math.abs(lag) <= 1 / 30 + 0.005 && corr > 0.9;
      status.final = { tag, release: `https://github.com/${REPO}/releases/tag/${tag}`, mp4: path.relative(ROOT, mp4), qa: qa.ok ? "PASSED" : "FAILED", alignment: { lagSeconds: lag, correlation: corr } };
      save();
      if (!qa.ok) return st("failed", `final QA failed (productions/${sb.id}/final/qa.md)`);
      if (!okAl) return st("failed", `published audio does not line up with the soundtrack (lag ${lag} s, correlation ${corr})`);
      return st("done", `PUBLISHED ${status.final.release} | QA passed | audio aligned (lag ${(lag * 1000).toFixed(0)} ms, r=${corr})`);
    },
  },
};
function st(state: StageState["state"], detail: string, data?: Any): StageState { return { state, at: now(), inputs: "", detail, ...(data ? { data } : {}) }; }

// ---------------------------------------------------------------- driver
const until = opt("--until") as Stage | undefined;
console.log(`\n${COMP}: production ${sb.title ?? sb.id}  (status: productions/${sb.id}/status.json)`);
for (const name of STAGES) {
  const s = stages[name], inputs = s.inputs(), prev = status.stages[name];
  const fresh = prev && prev.state === "done" && prev.inputs === inputs;
  if (fresh) { console.log(`  ok    ${name.padEnd(9)} ${prev!.detail.split("\n")[0]}  (unchanged)`); }
  else {
    if (prev && prev.state === "done") for (const later of STAGES.slice(STAGES.indexOf(name) + 1)) delete status.stages[later]; // inputs changed: redo downstream
    console.log(`  ...   ${name}`);
    const res = await s.run();
    res.inputs = inputs; status.stages[name] = res; save();
    console.log(`  ${res.state === "done" ? "ok   " : res.state === "waiting" ? "WAIT " : "FAIL "} ${name.padEnd(9)} ${res.detail}`);
    // new narration changes the word timings this bundle was built with: continue in a fresh build of this command
    if (name === "narration" && res.state === "done" && /^generated/.test(res.detail)) {
      console.log("\nnarration generated: continuing with the new word timings (fresh build)\n");
      const again = run("npm", ["run", "short", "--", ...argv.filter((a) => a !== "--approve-narration" && a !== opt("--approve-narration"))]);
      proc.process.exit(again.ok ? 0 : 1);
    }
    if (res.state !== "done") { console.log(`\nstopped at "${name}". Fix / approve, then run again: npm run short -- ${sb.id}`); proc.process.exit(res.state === "failed" ? 1 : 0); }
  }
  if (name === until) { console.log(`\nstopped after "${name}" (--until)`); proc.process.exit(0); }
}
console.log(`\nDONE: ${status.final?.release ?? ""}\n  video: ${status.final?.mp4 ?? ""}\n  QA: productions/${sb.id}/final/qa.md`);
