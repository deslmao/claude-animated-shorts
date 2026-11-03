// Caption overlay (stage 2): white heavy rounded sans (Nunito Black, bundled in public/fonts, OFL), thin dark outline,
// lower-middle of the 9:16 frame, inside the area YouTube's Shorts buttons and title don't cover. Hard swaps with a
// 3-frame pop. The font is loaded before the first frame renders, so every chunk draws identical text.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { CaptionGroup } from "./caption-timing";

const FAMILY = "StudioCaption";
let fontReady: Promise<void> | null = null;
const loadFont = () => (fontReady ??= new FontFace(FAMILY, `url(${staticFile("fonts/nunito-900.woff2")}) format("woff2")`, { weight: "900" })
  .load().then((f) => { document.fonts.add(f); }));

const CENTER_Y = 1235;   // px of 1920: lower-middle, above the Shorts title / channel row (default; shots move it off faces)
const MAX_W = 840;       // px of 1080: clear of the like / comment column on the right
const INK = "#1b1222";   // the plum outline ink of the characters

export const Captions: React.FC<{ groups: CaptionGroup[] }> = ({ groups }) => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender("caption font"));
  useEffect(() => { loadFont().then(() => continueRender(handle)).catch((e) => cancelRender(e)); }, [handle]);
  const g = groups.find((x) => f >= x.f0 && f < x.f1);
  if (!g) return null;
  const chars = g.text.length, size = Math.min(96, MAX_W / Math.max(1, chars * 0.6));
  const pop = 1 + 0.09 * Math.max(0, 1 - (f - g.f0) / 3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: g.y !== undefined ? Math.round(g.y * 1920) : CENTER_Y, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
        <div style={{
          fontFamily: `${FAMILY}, "Arial Black", sans-serif`, fontWeight: 900, fontSize: size, lineHeight: 1, color: "#ffffff",
          WebkitTextStroke: `${(size * 0.16).toFixed(1)}px ${INK}`, paintOrder: "stroke fill", letterSpacing: "0.01em",
          textShadow: `0 ${(size * 0.07).toFixed(1)}px 0 ${INK}`, whiteSpace: "nowrap", maxWidth: MAX_W, textAlign: "center",
          transform: `scale(${pop.toFixed(3)})`,
        }}>{g.text}</div>
      </div>
    </AbsoluteFill>
  );
};
