import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../../lib/motion";
import { useLayout } from "../layout";
import { blink, caption, color, font } from "../theme";

/** Frames where the marquee's tube stutters before it holds, like a fluorescent striking. */
const STRIKE = [2, 3, 6, 9, 10];

/**
 * The backlit marquee over the glass: a start-button red panel with a solid underside edge, the
 * SmashRecap wordmark, a square power LED blinking `1.1s steps(1)`, and the attract-mode slug.
 * It strikes on with the tube and goes dark with it at the end.
 */
export const ArcadeMarquee: React.FC<{ year: number; powerOff: number }> = ({ year, powerOff }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { cabinet, narrow } = useLayout();
  const struck = frame >= 11 || STRIKE.includes(frame);
  const fade = interpolate(frame, [durationInFrames - powerOff + 8, durationInFrames - 2], [1, 0.3], clamp);
  const lamp = struck ? fade : 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: cabinet.frame,
        right: cabinet.frame,
        top: cabinet.marquee.top,
        height: cabinet.marquee.height,
        padding: narrow ? "0 26px" : "0 34px",
        borderRadius: "22px 22px 8px 8px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        backgroundColor: color.accent,
        boxShadow: `inset 0 -7px 0 ${color.accentEdge}`,
        filter: `brightness(${lamp})`,
        color: color.ground,
      }}
    >
      <div style={{ width: 20, height: 20, backgroundColor: color.ground, opacity: blink(frame) ? 1 : 0.3 }} />
      <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: narrow ? 38 : 44, lineHeight: 1, letterSpacing: "-0.01em" }}>
        SmashRecap
      </span>
      <span style={{ ...caption, fontSize: narrow ? 22 : 26, color: color.ground, marginLeft: "auto" }}>
        {narrow ? "" : "Attract mode // "}Season {year}
      </span>
    </div>
  );
};
