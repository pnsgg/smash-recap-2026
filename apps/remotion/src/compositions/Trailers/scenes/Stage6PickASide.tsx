import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BAR, BEAT, springPresets, track } from "../../../lib/motion";
import { PixelSprite } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { caption, color, font } from "../theme";
import { Headline } from "./Headline";
import { SceneColumn } from "./SceneColumn";

const GAP = 48;
const BOTH_AT = BAR + BEAT;
/** The cursor hops between the two sides on the beat before both light up. */
export const SIDE_HOPS = [
  { at: 2 * BEAT, to: 1 },
  { at: 3 * BEAT, to: 0 },
  { at: BAR, to: 1 },
] as const;

const SIDES = [
  { slot: "1P", title: "PLAYER", line: "Every set you played", chip: color.accent },
  { slot: "2P", title: "ORGANISER", line: "Every bracket you ran", chip: color.ink },
];

/**
 * Player select with two characters, the player recap and the organiser recap, and both are
 * playable. Side by side on the wide glass; stacked on narrow ones, where the cursor hops down
 * and the slot chip sits inline with the name to keep the tiles short.
 */
export const Stage6PickASide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit, column } = useLayout();
  const cursor = track({ frame, fps, initial: 0, keyframes: SIDE_HOPS, config: springPresets.snappy });
  const both = frame >= BOTH_AT;
  const cheer = spring({ frame: frame - BOTH_AT, fps, config: springPresets.bouncy });
  const tile = narrow
    ? { width: column.width, height: kind === "tall" ? 260 : 196 }
    : { width: (column.width - GAP) / 2, height: 380 };
  const step = (narrow ? tile.height : tile.width) + GAP;
  const title = kind === "tall" ? "PLAYER OR\nORGANISER?" : "PLAYER OR ORGANISER?";
  const name = narrow ? fit("ORGANISER", kind === "tall" ? 120 : 96, column.width - 200) : 130;
  const frameAt = (x: number) => (narrow ? { left: -16, top: x * step - 16 } : { left: x * step - 16, top: -16 });

  return (
    <SceneColumn gap={narrow ? 44 : 50}>
      <Headline text={title} from={4} speed={3} size={fit(title, kind === "tall" ? 140 : 110)} />

      <div style={{ position: "relative", display: "flex", flexDirection: narrow ? "column" : "row", gap: GAP }}>
        {SIDES.map((side, i) => {
          const drop = spring({ frame: frame - 4 - i * 3, fps, config: springPresets.snappy });
          return (
            <div
              key={side.slot}
              style={{
                ...tile,
                padding: narrow ? "26px 40px" : "40px 48px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: color.raised,
                borderTop: `6px solid ${color.raised2}`,
                transform: `translateY(${(1 - drop) * 60}px)`,
                opacity: drop > 0.01 ? 1 : 0,
              }}
            >
              <div style={{ display: "flex", flexDirection: narrow ? "row" : "column", alignItems: narrow ? "center" : "flex-start", gap: narrow ? 28 : 0, flex: narrow ? undefined : 1, justifyContent: narrow ? "flex-start" : "space-between" }}>
                <span
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: narrow ? 40 : 48,
                    lineHeight: 1,
                    padding: "8px 16px 5px",
                    backgroundColor: side.chip,
                    color: color.ground,
                  }}
                >
                  {side.slot}
                </span>
                <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: name, lineHeight: 1, color: color.ink }}>{side.title}</span>
              </div>
              <span style={{ ...caption, fontSize: narrow ? 34 : 42, color: color.ink }}>{side.line}</span>
            </div>
          );
        })}

        {/* The select cursor: one frame that hops sides, then a frame around each when both are picked */}
        {(both ? [0, 1] : frame >= BEAT ? [cursor] : []).map((x, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...frameAt(x),
              width: tile.width + 32,
              height: tile.height + 32,
              border: `8px solid ${both ? color.victory : color.accent}`,
              boxShadow: `0 8px 0 ${both ? color.victoryDeep : color.accentEdge}`,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${both ? cheer : 0})`, transformOrigin: "left center" }}>
        <PixelSprite name="heart" pixel={10} color={color.accent} />
        <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: narrow ? fit("Both get a recap!", 84, column.width - 100, 0.55) : 84, lineHeight: 1, color: color.ink, whiteSpace: "nowrap" }}>
          Both get a recap!
        </span>
      </div>
    </SceneColumn>
  );
};
