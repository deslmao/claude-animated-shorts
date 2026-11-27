// The generic Short (stage 1E; narration + captions in stage 2): any storyboard (+ its narration manifest) -> a film
// in the studio look, with word-by-word captions on top. One composition per storyboard is registered in Root.tsx as
// "Short-<id>" (so the cloud render farm can render it by name). The voice itself is muxed in at the join step from
// audio/Short-<id>.mp3 (written by `npm run voice`), so chunked renders never split the audio.
import React from "react";
import { AbsoluteFill } from "remotion";
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
  const Comp: React.FC = () => (
    <AbsoluteFill>
      <StudioFilm timeline={film.timeline} makeWorld={makeWorld} load={load} />
      {titles.length ? <TitleCards cards={titles} /> : null}
      {groups.length ? <Captions groups={groups} colors={sb.captionColors} viral={sb.captionStyle === "viral"} /> : null}
    </AbsoluteFill>
  );
  Comp.displayName = `Short-${sb.id}`;
  return { Comp, frames: film.total, film, groups };
};
