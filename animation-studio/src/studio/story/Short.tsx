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
import { Captions } from "./Captions";
import type { Storyboard } from "./types";
import type { Narration } from "../voice/narration";

const load = () => Promise.resolve(true);
export const makeShort = (sb: Storyboard, narr?: Narration) => {
  const film = compile(sb, narr);
  const groups = sb.captions === false ? [] : captionGroups(film.timing.lines, film.total);
  const makeWorld = () => new SetWorld(film.shots, film.director, { clearShots: true });
  const Comp: React.FC = () => (
    <AbsoluteFill>
      <StudioFilm timeline={film.timeline} makeWorld={makeWorld} load={load} />
      {groups.length ? <Captions groups={groups} /> : null}
    </AbsoluteFill>
  );
  Comp.displayName = `Short-${sb.id}`;
  return { Comp, frames: film.total, film, groups };
};
