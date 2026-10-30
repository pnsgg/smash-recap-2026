import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BAR, BEAT, clamp, springPresets } from "../../../lib/motion";
import { PixelSprite } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { caption, color, font } from "../theme";
import { SEASON } from "../timing";
import { Headline } from "./Headline";
import { SceneColumn } from "./SceneColumn";

const FIRST_AT = BEAT;
const DONE_AT = BAR + 2 * BEAT;
const PARTS = ["Tournaments", "Sets", "Characters", "Stages", "Rivals"];

/**
 * Step 2 as the cabinet's power-on self-test, reading start.gg instead of ROM banks: one part of
 * the season checked a beat, each passed OK in victory green. What it found stays a surprise.
 * The load meter stands beside the list on the wide glass and lies under it on narrow ones.
 */
export const Stage4Reading: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit } = useLayout();
  const progress = interpolate(frame, [FIRST_AT, DONE_AT], [0, 1], clamp);
  const done = spring({ frame: frame - DONE_AT, fps, config: springPresets.bouncy });
  const title = kind === "tall" ? "WE READ\nYOUR SEASON" : "WE READ YOUR SEASON";
  const row = kind === "tall" ? 88 : narrow ? 66 : 84;
  const lit = Math.round(progress * 10);
  const segment = (i: number) => (i < lit ? color.victory : color.raised2);

  return (
    <SceneColumn gap={narrow ? 36 : 30}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Headline text={title} from={10} size={fit(title, kind === "tall" ? 130 : 110)} />
        <div style={{ ...caption, fontSize: narrow ? 32 : 40, whiteSpace: "pre" }}>
          {kind === "tall" ? `Straight from start.gg,\nevery event of ${SEASON}` : `Straight from start.gg, every event of ${SEASON}`}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", gap: narrow ? 30 : 110 }}>
        <div style={{ flex: 1 }}>
          {PARTS.map((part, i) => {
            const from = FIRST_AT + i * BEAT;
            const shown = frame >= from;
            return (
              <div key={part} style={{ height: row, display: "flex", alignItems: "center", gap: 26, opacity: shown ? 1 : 0 }}>
                <span style={{ fontFamily: font.text, fontWeight: 800, fontSize: narrow ? 46 : 54, letterSpacing: "-0.02em", textTransform: "uppercase", color: color.ink }}>
                  {part}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: 10,
                    backgroundImage: `radial-gradient(circle, ${color.muted} 3px, transparent 3.5px)`,
                    backgroundSize: "22px 10px",
                    clipPath: `inset(0 ${(1 - interpolate(frame, [from, from + 6], [0, 1], clamp)) * 100}% 0 0)`,
                  }}
                />
                <span style={{ width: narrow ? 90 : 110, fontFamily: font.display, fontWeight: 700, fontSize: narrow ? 50 : 58, lineHeight: 1, color: frame >= from + 6 ? color.victory : color.raised2 }}>
                  OK
                </span>
              </div>
            );
          })}
        </div>

        {/* The load meter, a segment per tenth of the check */}
        <div style={{ width: narrow ? "100%" : 342, display: "flex", flexDirection: narrow ? "row" : "column-reverse", gap: 8 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={narrow ? { flex: 1, height: 30, backgroundColor: segment(i) } : { height: 33, backgroundColor: segment(i) }} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${frame >= DONE_AT ? done : 0})`, transformOrigin: "left center" }}>
        <PixelSprite name="star" pixel={9} color={color.victory} />
        <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: 72, lineHeight: 1, color: color.ink }}>All set!</span>
      </div>
    </SceneColumn>
  );
};
