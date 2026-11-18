// Time / place cards (The Empty Seat v3): "THREE WEEKS EARLIER · MONDAY 7:52 AM · BUS 9" typed out at the top of a
// shot in the caption font, on a dark box that grows with its text (so the text always fits). A shot opts in with
// `title`; films without titles render exactly as before.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type TitleCard = { f0: number; f1: number; text: string; sub?: string };
const FAMILY = "StudioCaption";   // loaded by Captions (same font)

export const TitleCards: React.FC<{ cards: TitleCard[] }> = ({ cards }) => {
  const f = useCurrentFrame();
  const c = cards.find((x) => f >= x.f0 && f < x.f1);
  if (!c) return null;
  const n = Math.floor((f - c.f0) * 0.9), a = c.text.slice(0, n), b = (c.sub ?? "").slice(0, Math.max(0, n - c.text.length));
  const fade = Math.min(1, (c.f1 - f) / 6);
  const caret = (f % 16) < 9 ? "▌" : " ";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 80, top: 230, opacity: fade, background: "rgba(10,12,20,0.72)", borderRadius: 20, padding: "26px 36px", maxWidth: 920 }}>
        <div style={{ fontFamily: `${FAMILY}, "Arial Black", sans-serif`, fontWeight: 900, fontSize: 64, color: "#ffffff", letterSpacing: "0.02em", whiteSpace: "nowrap", minHeight: 70 }}>
          {a}{n < c.text.length ? caret : ""}
        </div>
        {c.sub ? <div style={{ fontFamily: `${FAMILY}, "Arial Black", sans-serif`, fontWeight: 900, fontSize: 38, color: "#f2c94c", letterSpacing: "0.03em", whiteSpace: "nowrap", marginTop: 10, minHeight: 44 }}>
          {b}{n >= c.text.length && n < c.text.length + c.sub.length ? caret : ""}
        </div> : null}
      </div>
    </AbsoluteFill>
  );
};
