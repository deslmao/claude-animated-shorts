// The generic Short (stage 1E; narration + captions in stage 2): any storyboard (+ its narration manifest) -> a film
// in the studio look, with word-by-word captions on top. One composition per storyboard is registered in Root.tsx as
// "Short-<id>" (so the cloud render farm can render it by name). The voice itself is muxed in at the join step from
// audio/Short-<id>.mp3 (written by `npm run voice`), so chunked renders never split the audio.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { StudioFilm } from "../look/StudioFilm";
import { SetWorld } from "../scene/SetWorld";
import { compile } from "./compile";
import { captionGroups } from "./caption-timing";
import { placeCaptions } from "./caption-place";
import { Captions } from "./Captions";
import { TitleCards, type TitleCard } from "./TitleCards";
import type { Storyboard } from "./types";
import type { Narration } from "../voice/narration";
import { PRELOADS } from "../look/preload";

const load = () => (PRELOADS.length ? Promise.all(PRELOADS).then(() => true) : Promise.resolve(true));
export const makeShort = (sb: Storyboard, narr?: Narration) => {
  const film = compile(sb, narr);
  const raw = sb.captions === false ? [] : captionGroups(film.timing.lines, film.total, sb.captionStyle, sb.captionKeys);
  // the viral style sits at one fixed height (72 %, on the chest); in a headstand shot (an actor flipped) the heads are on the floor, so it moves to the upper third (27 %)
  const high = new Set(sb.captionHigh ?? []), upside = (f: number) => high.has(film.shots.findIndex((s) => f >= s.a && f < s.b));
  const groups = sb.captionStyle === "viral" ? raw.map((g) => (upside(g.f0) ? { ...g, y: 0.27 } : g)) : placeCaptions(film, raw);   // the viral style sits at one fixed height in the mobile safe zone
  const titles: TitleCard[] = sb.shots.flatMap((s, k) => (s.title && film.shots[k] ? [{ f0: film.shots[k].a, f1: film.shots[k].b, ...s.title }] : []));
  const makeWorld = () => new SetWorld(film.shots, film.director, { clearShots: true, stable: (sb.engine ?? 1) >= 2 });
  const bi = sb.blurIn;
  // Engine 4 act-shift glitch cuts: 3 frames (the word's frame minus one, then two more) of a white flash and an RGB split on the picture
  const words = film.timing.lines.flatMap((l) => l.words), nz = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const glitches = (sb.glitch ?? []).map((g) => { const k = nz(g.word), ex = words.filter((x) => nz(x.w) === k), pre = words.filter((x) => nz(x.w).startsWith(k)), hit = ((ex.length >= (g.n ?? 1) ? ex : pre))[(g.n ?? 1) - 1]; return hit ? Math.max(0, Math.round(hit.t0 * 30) - 1) : -10; });
  const Comp: React.FC = () => {
    // an opt-in un-blur at the start (easeOutQuad: fast at first, then settles); the scene blurs, the captions do not
    const frame = useCurrentFrame(), gi = glitches.findIndex((f0) => frame >= f0 && frame < f0 + 3), gk = gi >= 0 ? frame - glitches[gi] : -1;
    const u = bi ? Math.min(1, frame / Math.max(1, bi.dur * 30)) : 1, px = bi ? bi.px * (1 - (1 - (1 - u) * (1 - u))) : 0;
    return (
    <AbsoluteFill>
      {gk >= 0 ? <svg width="0" height="0" style={{ position: "absolute" }}><filter id="e4ca" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" /><feOffset in="r" dx={-10 + gk * 3} dy="0" result="ro" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" /><feOffset in="b" dx={10 - gk * 3} dy="0" result="bo" />
        <feBlend in="ro" in2="g" mode="screen" result="rg" /><feBlend in="rg" in2="bo" mode="screen" /></filter></svg> : null}
      <AbsoluteFill style={gk >= 0 ? { filter: "url(#e4ca)", transform: `translateX(${[-14, 10, -5][gk]}px) scale(1.03)` } : px > 0.05 ? { filter: `blur(${px.toFixed(2)}px)`, transform: `scale(${(1 + px / 400).toFixed(4)})` } : undefined}>
        <StudioFilm timeline={film.timeline} makeWorld={makeWorld} load={load} />
      </AbsoluteFill>
      {gk >= 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: [0.85, 0.5, 0.2][gk], pointerEvents: "none" }} /> : null}
      {titles.length ? <TitleCards cards={titles} /> : null}
      {groups.length ? <Captions groups={groups} colors={sb.captionColors} viral={sb.captionStyle === "viral"} /> : null}
    </AbsoluteFill>
    );
  };
  Comp.displayName = `Short-${sb.id}`;
  return { Comp, frames: film.total, film, groups };
};
