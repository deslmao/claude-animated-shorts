
import { ThreeCanvas } from "@remotion/three";
import { Video } from "@remotion/media";
import { zColor } from "@remotion/zod-types";
import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { CanvasTexture } from "three";
import { z } from "zod";
import { MediabunnyMetadata } from "./helpers/get-media-metadata";
import { getPhoneLayout } from "./helpers/layout";
import { Phone } from "./Phone";

const container: React.CSSProperties = {
  backgroundColor: "white",
};

export const myCompSchema = z.object({
  phoneColor: zColor(),
  deviceType: z.enum(["phone", "tablet"]),
});

type MyCompSchemaType = z.infer<typeof myCompSchema>;

export const Scene: React.FC<
  {
    readonly baseScale: number;
    mediaMetadata: MediabunnyMetadata | null;
    videoSrc: string | null;
  } & MyCompSchemaType
> = ({ baseScale, phoneColor, mediaMetadata, videoSrc }) => {
  const { width, height } = useVideoConfig();

  const canvasTexture = useMemo(() => {
    if (!mediaMetadata) return null;

    return new OffscreenCanvas(
      mediaMetadata.dimensions.width,
      mediaMetadata.dimensions.height,
    );
  }, [mediaMetadata]);

  const texture = useMemo(() => {
    if (!canvasTexture) return null;
    return new CanvasTexture(canvasTexture);
  }, [canvasTexture]);

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      if (!canvasTexture || !texture) return;

      const context = canvasTexture.getContext("2d");
      if (!context) return;

      context.drawImage(frame, 0, 0);
      texture.needsUpdate = true;
    },
    [canvasTexture, texture],
  );

  if (!mediaMetadata || !videoSrc || !texture) {
    throw new Error("Video metadata or texture is not available");
  }

  const aspectRatio =
    mediaMetadata.dimensions.width / mediaMetadata.dimensions.height;

  const layout = getPhoneLayout(aspectRatio, baseScale);

  return (
    <AbsoluteFill style={container}>
      <Video
        src={videoSrc}
        onVideoFrame={onVideoFrame}
        headless
        muted
      />

      <ThreeCanvas linear width={width} height={height}>
        <ambientLight intensity={1.5} color={0xffffff} />
        <pointLight position={[10, 10, 0]} />

        <Phone
          phoneColor={phoneColor}
          phoneLayout={layout}
          videoTexture={texture}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
