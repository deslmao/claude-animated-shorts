import { Composition, Folder, staticFile } from "remotion";
import { Scene, myCompSchema } from "./Scene";
import { getMediaMetadata } from "./helpers/get-media-metadata";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { LookCheck, LOOKCHECK_FRAMES } from "./studio/checks/LookCheck";
import { FoundationTest, FOUNDATION_FRAMES } from "./studio/checks/FoundationTest";
import { CharacterSheet, SHEET_W, SHEET_H } from "./studio/checks/CharacterSheet";
import { CastTest, CASTTEST_FRAMES } from "./studio/checks/CastTest";
import { SetTour } from "./studio/checks/SetTour";
import { MovesTest, MOVESTEST_FRAMES } from "./studio/checks/MovesTest";
import { STORIES } from "./studio/stories";
import { makeShort } from "./studio/story/Short";
import { NARRATION } from "./studio/stories/voice";

// one composition per storyboard: "Short-<id>" (with its narration timing and captions, once `npm run voice` made it)
const SHORTS = STORIES.map((sb) => ({ id: sb.id, ...makeShort(sb, NARRATION[sb.id]) }));
// QA only (not a production): Pirate Democracy with the 2.0 blur correction, for before / after measurements of the
// transition blur on the same frames (same narration, so the same timing)
const PIRATE = STORIES.find((sb) => sb.id === "pirate-democracy")!;
// QA only: Video 03 with its ORIGINAL keys-bubble insert (the camera in the doorway's head trim, frames 1410-1425) on
// engine 3. The outline buffer must not trace faces the picture culls, so frame 1418 has no phantom lines (regression
// frame in tests/regression.json; the real storyboard's camera was moved below the lamp)
const DOOR = STORIES.find((sb) => sb.id === "doorway-effect")!;
const DOOR_QA = structuredClone(DOOR);
{ const c = DOOR_QA.shots[8].cams!.find((x) => (x as { word?: string }).word === "sofa")! as Record<string, unknown>;
  for (const k of ["pos", "look", "fov", "glide"]) delete c[k]; Object.assign(c, { move: "insert", on: "thoughtBubble", size: "close", from: 72 }); }
SHORTS.push({ id: "inkparity-qa", ...makeShort({ ...DOOR_QA, id: "inkparity-qa" }, NARRATION["doorway-effect"]) });
SHORTS.push({ id: "pirate-blurqa", ...makeShort({ ...PIRATE, id: "pirate-blurqa", controlledBlur: true }, NARRATION["pirate-democracy"]) });

// Welcome to the Remotion Three Starter Kit!
// Two compositions have been created, showing how to use
// the `ThreeCanvas` component and the `useVideoTexture` hook.

// You can play around with the example or delete everything inside the canvas.

// Remotion Docs:
// https://remotion.dev/docs

// @remotion/three Docs:
// https://remotion.dev/docs/three

// React Three Fiber Docs:
// https://docs.pmnd.rs/react-three-fiber/getting-started/introduction

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Scene"
        component={Scene}
        fps={30}
        durationInFrames={300}
        width={1280}
        height={720}
        schema={myCompSchema}
        defaultProps={{
          deviceType: "phone",
          phoneColor: "rgb(110, 152, 191)" as const,
          baseScale: 1,
          mediaMetadata: null,
          videoSrc: null,
        }}
        calculateMetadata={async ({ props }) => {
          const videoSrc =
            props.deviceType === "phone"
              ? staticFile("phone.mp4")
              : staticFile("tablet.mp4");

          const mediaMetadata = await getMediaMetadata(videoSrc);

          return {
            props: {
              ...props,
              mediaMetadata,
              videoSrc,
            },
          };
        }}
      />
      {/* The creator's original short "The Bridge That Fell for a Song" (templates/bridge), 1080x1920 @ 30 fps */}
      <Composition
        id="BridgeShort"
        component={BridgeShort}
        fps={30}
        durationInFrames={BRIDGE_FRAMES}
        width={1080}
        height={1920}
      />
      {/* Storyboard-driven shorts (stage 1E): one per storyboard in src/studio/stories */}
      <Folder name="Shorts">
        {SHORTS.map((s) => <Composition key={s.id} id={`Short-${s.id}`} component={s.Comp} fps={30} durationInFrames={s.frames} width={1080} height={1920} />)}
      </Folder>
      {/* Reusable studio library: test compositions (not videos) */}
      <Folder name="Studio">
        <Composition id="LookCheck" component={LookCheck} fps={30} durationInFrames={LOOKCHECK_FRAMES} width={1080} height={1920} />
        <Composition id="CharacterSheet" component={CharacterSheet} fps={30} durationInFrames={1} width={SHEET_W} height={SHEET_H} />
        <Composition id="MovesTest" component={MovesTest} fps={30} durationInFrames={MOVESTEST_FRAMES} width={1080} height={1920} />
        <Composition id="SetTour" component={SetTour} fps={30} durationInFrames={64} width={1080} height={1920} />
        <Composition id="CastTest" component={CastTest} fps={30} durationInFrames={CASTTEST_FRAMES} width={1080} height={1920} />
        <Composition id="FoundationTest" component={FoundationTest} fps={30} durationInFrames={FOUNDATION_FRAMES} width={1080} height={1920} />
      </Folder>
    </>
  );
};
