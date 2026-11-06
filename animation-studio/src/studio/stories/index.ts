// Registry of storyboards. Each becomes a composition "Short-<id>" (Root.tsx) that the cloud render farm can render.
import type { Storyboard } from "../story/types";
import { BURIEDTREASURE } from "./buried-treasure";
import { PIRATEDEMOCRACY } from "./pirate-democracy";
import { TICKLE } from "./tickle";
import { YAWN_DEMO } from "./yawn-demo";
import { CAPABILITIES } from "./capabilities";
import { INK_ORBIT } from "./ink-orbit";
import { DOORWAYEFFECT } from "./doorway-effect";
import { CAMERA_KIT } from "./camera-kit";

export const STORIES: Storyboard[] = [YAWN_DEMO, CAPABILITIES, TICKLE, PIRATEDEMOCRACY, BURIEDTREASURE, INK_ORBIT, DOORWAYEFFECT, CAMERA_KIT];
