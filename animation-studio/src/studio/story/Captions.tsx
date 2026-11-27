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
const SHORT_Y = 1344;    // px of 1920: the short style's centre, 70 % down (STUDY.md)
const MAX_W = 840;       // px of 1080: clear of the like / comment column on the right
const INK = "#1b1222";   // the plum outline ink of the characters

/** Engine 4 viral captions: 5.5 % of the frame height (106 px at 1080x1920), a heavy stroke and a hard drop shadow, centred horizontally at 72 % of the height (on the chest, not the chin; 27 % in a headstand shot, set per group in Short.tsx), was 66 % of the
 *  height (inside the mobile safe zone: below the face band, above the bottom UI), 1-3 words, key nouns in a pop colour (yellow, cyan, pink) */
export const VIRAL = { sizePx: 106, centerY: 1382, maxW: 860 };
export const Captions: React.FC<{ groups: CaptionGroup[]; colors?: Record<string, string>; viral?: boolean }> = ({ groups, colors, viral }) => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender("caption font"));
  useEffect(() => { loadFont().then(() => continueRender(handle)).catch((e) => cancelRender(e)); }, [handle]);
  const g = groups.find((x) => f >= x.f0 && f < x.f1);
  if (!g) return null;
  if (viral) {
    const size = VIRAL.sizePx, k = f - g.f0, pop = k >= 5 ? 1 : 1 + 0.14 * Math.sin((Math.PI * Math.max(0, k)) / 5) * (1 - k / 7);
    const words = g.text.split(" ");
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: g.y !== undefined ? Math.round(g.y * 1920) : VIRAL.centerY, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
          <div style={{ fontFamily: `${FAMILY}, "Arial Black", sans-serif`, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap", maxWidth: VIRAL.maxW, textAlign: "center",
            WebkitTextStroke: `${(size * 0.2).toFixed(1)}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${(size * 0.09).toFixed(1)}px 0 ${INK}, 0 ${(size * 0.14).toFixed(1)}px ${(size * 0.12).toFixed(1)}px rgba(0,0,0,0.55)`, transform: `scale(${pop.toFixed(3)})` }}>
            {words.map((w, j) => <span key={j} style={{ color: g.hi?.[j] ?? "#ffffff" }}>{j ? " " : ""}{w}</span>)}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  const chars = g.text.length, size = g.sub ? 76 : g.short ? Math.min(58, MAX_W / Math.max(1, chars * 0.6)) : Math.min(96, MAX_W / Math.max(1, chars * 0.6));
  const pop = 1 + 0.09 * Math.max(0, 1 - (f - g.f0) / 3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: g.y !== undefined ? Math.round(g.y * 1920) : g.short ? SHORT_Y : CENTER_Y, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
        <div style={{
          fontFamily: `${FAMILY}, "Arial Black", sans-serif`, fontWeight: 900, fontSize: size, lineHeight: 1, color: colors?.[g.who] ?? (g.voice ? colors?.[g.voice] : undefined) ?? "#ffffff",
          WebkitTextStroke: `${(size * 0.16).toFixed(1)}px ${INK}`, paintOrder: "stroke fill", letterSpacing: "0.01em",
          textShadow: `0 ${(size * 0.07).toFixed(1)}px 0 ${INK}`, whiteSpace: g.sub ? "normal" : "nowrap", maxWidth: MAX_W, textAlign: "center", ...(g.sub ? { lineHeight: 1.15 } : {}),
          transform: `scale(${pop.toFixed(3)})`,
        }}>{g.text}</div>
      </div>
    </AbsoluteFill>
  );
};
