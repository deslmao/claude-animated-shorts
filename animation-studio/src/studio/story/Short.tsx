// The generic Short (stage 1E): any storyboard -> a film in the studio look. One composition per storyboard is
// registered in Root.tsx as "Short-<id>" (so the cloud render farm can render it by name).
import React from "react";
import { StudioFilm } from "../look/StudioFilm";
import { SetWorld } from "../scene/SetWorld";
import { compile } from "./compile";
import type { Storyboard } from "./types";

const load = () => Promise.resolve(true);
export const makeShort = (sb: Storyboard) => {
  const film = compile(sb);
  const makeWorld = () => new SetWorld(film.shots, film.director);
  const Comp: React.FC = () => <StudioFilm timeline={film.timeline} makeWorld={makeWorld} load={load} />;
  Comp.displayName = `Short-${sb.id}`;
  return { Comp, frames: film.total };
};
