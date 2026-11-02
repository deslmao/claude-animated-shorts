// Registry of storyboards. Each becomes a composition "Short-<id>" (Root.tsx) that the cloud render farm can render.
import type { Storyboard } from "../story/types";
import { YAWN_DEMO } from "./yawn-demo";

export const STORIES: Storyboard[] = [YAWN_DEMO];
