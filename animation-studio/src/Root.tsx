import { Composition, Folder, staticFile } from "remotion";
import { Scene, myCompSchema } from "./Scene";
import { getMediaMetadata } from "./helpers/get-media-metadata";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { LookCheck, LOOKCHECK_FRAMES } from "./studio/checks/LookCheck";
import { FoundationTest, FOUNDATION_FRAMES } from "./studio/checks/FoundationTest";

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
      {/* Reusable studio library: test compositions (not videos) */}
      <Folder name="Studio">
        <Composition id="LookCheck" component={LookCheck} fps={30} durationInFrames={LOOKCHECK_FRAMES} width={1080} height={1920} />
        <Composition id="FoundationTest" component={FoundationTest} fps={30} durationInFrames={FOUNDATION_FRAMES} width={1080} height={1920} />
      </Folder>
    </>
  );
};
