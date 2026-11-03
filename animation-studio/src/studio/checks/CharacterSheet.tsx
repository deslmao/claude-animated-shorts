// Review sheets for the character library (flat 2D, no WebGL: renders in seconds). Pick a page with inputProps
// { page: "cast" | "roster" (themed characters + the pirate crowd) | "faces-milo" | "faces-juno" | "faces-gus" | "acts-milo" | "acts-juno" | "acts-gus" | "moves" | "crowd" }.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, getInputProps } from "remotion";
import { Pen } from "../characters/toon";
import { figureFront, figureSide, Look, Pose, SidePose, EXPRESSIONS, ACT_NAMES, act } from "../characters/figure";
import { MILO, JUNO, JUNO_OUT, GUS, crowd, Era, CAST } from "../characters/cast";
import { ROSTER } from "../characters/roster";

export const SHEET_W = 2000, SHEET_H = 2800;
type Cell = { look: Look; pose?: Pose; side?: SidePose; label: string; mirror?: boolean; silhouette?: boolean; scale?: number; crop?: "head" };

const drawCell = (g: CanvasRenderingContext2D, c: Cell, x: number, y: number, w: number, h: number) => {
  const cv = document.createElement("canvas"); cv.width = 600; cv.height = 1000;
  const cg = cv.getContext("2d")!;
  const p = new Pen(cg);
  if (c.side) figureSide(p, c.look, c.side); else figureFront(p, c.look, c.pose ?? {});
  if (c.silhouette) { cg.globalCompositeOperation = "source-in"; cg.fillStyle = "#1a1420"; cg.fillRect(0, 0, 600, 1000); }
  const crop = c.crop === "head" ? { sx: 60, sy: 120, sw: 480, sh: 420 } : { sx: 0, sy: 60, sw: 600, sh: 940 };
  const k = Math.min(w / crop.sw, (h - 40) / crop.sh) * (c.scale ?? 1);
  const dw = crop.sw * k, dh = crop.sh * k;
  g.save();
  g.translate(x + w / 2, y + h - 40 - dh);
  if (c.mirror) g.scale(-1, 1);
  g.drawImage(cv, crop.sx, crop.sy, crop.sw, crop.sh, -dw / 2, 0, dw, dh);
  g.restore();
  g.fillStyle = "#3a3346"; g.font = "600 26px sans-serif"; g.textAlign = "center";
  g.fillText(c.label, x + w / 2, y + h - 8);
};

const grid = (g: CanvasRenderingContext2D, cells: Cell[], cols: number, top: number, rowH: number, title?: string) => {
  if (title) { g.fillStyle = "#241726"; g.font = "700 44px sans-serif"; g.textAlign = "left"; g.fillText(title, 40, top + 50); top += 70; }
  const w = (SHEET_W - 80) / cols;
  cells.forEach((c, i) => drawCell(g, c, 40 + (i % cols) * w, top + Math.floor(i / cols) * rowH, w, rowH));
  return top + Math.ceil(cells.length / cols) * rowH;
};

const LEADS: [string, Look][] = [["Milo", MILO], ["Dr. Juno Park", JUNO], ["Gus", GUS]];
const pageOf = (page: string, g: CanvasRenderingContext2D) => {
  g.fillStyle = "#f3efe6"; g.fillRect(0, 0, SHEET_W, SHEET_H);
  const who = page.split("-")[1];
  const L = who === "juno" ? JUNO : who === "gus" ? GUS : MILO;
  if (page === "cast") {
    let y = grid(g, LEADS.map(([n, l]) => ({ look: l, pose: act("neutral"), label: n })), 3, 10, 900, "The cast");
    y = grid(g, LEADS.flatMap(([n, l]) => [
      { look: l, pose: { facing: -1 }, label: `${n.split(" ").pop()} 3/4 L` },
      { look: l, pose: { facing: 1 }, label: "3/4 R" },
      { look: l, side: { mode: "stand" }, label: "side" },
      { look: l, pose: { back: true }, label: "back" },
    ]), 12, y, 560, "Turnaround");
    y = grid(g, [...LEADS.map(([n, l]) => ({ look: l, pose: act("neutral"), label: `${n.split(" ").pop()} silhouette`, silhouette: true })),
      { look: JUNO_OUT, pose: act("explain"), label: "Juno (outside lab)" }], 4, y, 560, "Silhouettes + variant");
    // phone-size test: how big a character is in a typical medium shot on a phone (~180 px tall)
    g.fillStyle = "#241726"; g.font = "700 44px sans-serif"; g.textAlign = "left"; g.fillText("Phone size (~190 px tall)", 40, y + 50);
    LEADS.forEach(([n, l], i) => drawCell(g, { look: l, pose: act(["hello", "thinking", "laugh"][i] as "hello"), label: n.split(" ").pop()! }, 60 + i * 200, y + 60, 190, 260));
  } else if (page.startsWith("faces")) {
    grid(g, EXPRESSIONS.map((e) => ({ look: L, pose: { expr: e, facing: 0 }, label: e, crop: "head" as const })), 6, 10, 380, `${L.name}: expressions (${EXPRESSIONS.length})`);
  } else if (page.startsWith("acts")) {
    grid(g, ACT_NAMES.map((a) => ({ look: L, pose: act(a, { t: 0.4 }), label: a })), 6, 10, 520, `${L.name}: acting presets (${ACT_NAMES.length})`);
  } else if (page === "moves") {
    let y = 10;
    for (const [n, l] of LEADS) {
      y = grid(g, [
        { look: l, pose: { mode: "walk", phase: 0.15, expr: "smile" }, label: "walk" },
        { look: l, pose: { mode: "run", phase: 0.2, expr: "determined" }, label: "run" },
        { look: l, pose: { mode: "jump", jump: 1, expr: "excited" }, label: "jump" },
        { look: l, pose: { mode: "sit", expr: "neutral" }, label: "sit" },
        { look: l, pose: { mode: "fall", expr: "shock" }, label: "fall" },
        ...[0, 0.25, 0.5, 0.75].map((ph) => ({ look: l, side: { mode: "walk" as const, phase: ph, expr: "neutral" as const }, label: `side walk ${ph}` })),
        { look: l, side: { mode: "run", phase: 0.1, expr: "determined" }, label: "side run" },
        { look: l, side: { mode: "stand", point: true, expr: "talk" }, label: "side point" },
        { look: l, side: { mode: "sit", expr: "smile" }, label: "side sit" },
      ], 12, y, 560, n);
      y += 20;
    }
  } else if (page === "roster") {
    const themed = Object.entries(ROSTER).filter(([id]) => !(id in CAST));
    const y = grid(g, themed.flatMap(([id, l]) => [
      { look: l, pose: act("neutral"), label: id },
      { look: l, pose: { facing: -1, expr: "talk" }, label: "3/4 L" },
      { look: l, side: { mode: "stand" }, label: "side" },
      { look: l, pose: { back: true }, label: "back" },
    ]), 8, 10, 520, "Themed characters");
    grid(g, crowd(16, "pirate", 600).map((l, i) => ({ look: l, pose: act(["neutral", "happy", "explain", "suspicious", "shrug", "laugh"][i % 6] as "neutral", { t: 0.3 }), label: "pirate" })), 8, y, 400, "Pirate crew (extras)");
  } else if (page === "crowd") {
    let y = 10;
    for (const [era, n] of [["modern", 12], ["office", 6], ["lab", 6], ["fifties", 6], ["victorian", 6], ["medieval", 6]] as [Era, number][]) {
      y = grid(g, crowd(n, era, { modern: 0, office: 100, lab: 200, fifties: 300, victorian: 400, medieval: 500, pirate: 600 }[era]).map((l, i) => ({ look: l, pose: act(["neutral", "happy", "explain", "suspicious", "shrug", "laugh"][i % 6] as "neutral", { t: 0.3 }), label: era })), 12, y, 400, era === "modern" ? "Crowd generator" : undefined);
    }
  }
};

export const CharacterSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const page = ((getInputProps() as { page?: string }).page) ?? "cast";
  useLayoutEffect(() => { const g = ref.current?.getContext("2d"); if (g) pageOf(page, g); }, [page]);
  return <AbsoluteFill><canvas ref={ref} width={SHEET_W} height={SHEET_H} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
