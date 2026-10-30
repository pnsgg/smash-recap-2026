import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { springPresets } from "../../../lib/motion";
import { useLayout } from "../layout";
import { caption, color, font } from "../theme";
import { ArcadeButton } from "./ArcadeButton";

export type PanelCue = { from: number; button: "start" | 0 | 1 | 2 };
export type StickThrow = { from: number; x: number; y: number };

const STICK_TRAVEL = 34;

/**
 * The putty control panel under the tall cabinet's glass: a ball-top stick and three action
 * buttons for 1P, and the START button. It plays along with the score: each cue presses its
 * button and each throw tilts the stick, springing back to centre. It sits where Reels and TikTok
 * draw their own UI, so it carries no copy beyond its printed labels.
 */
export const ControlPanel: React.FC<{ presses: ReadonlyArray<PanelCue>; throws: ReadonlyArray<StickThrow> }> = ({ presses, throws }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { cabinet } = useLayout();
  if (!cabinet.panel) {
    return null;
  }
  const last = [...throws].reverse().find((t) => frame >= t.from);
  const hold = last ? 1 - spring({ frame: frame - last.from - 3, fps, config: springPresets.snappy }) : 0;
  const tilt = { x: (last?.x ?? 0) * hold * STICK_TRAVEL, y: (last?.y ?? 0) * hold * STICK_TRAVEL };
  const on = (button: PanelCue["button"]) => presses.filter((p) => p.button === button).map((p) => p.from);
  const printed = { ...caption, fontSize: 24, color: color.ground } as const;

  return (
    <div
      style={{
        position: "absolute",
        ...cabinet.panel,
        padding: "0 80px",
        display: "flex",
        alignItems: "center",
        gap: 80,
        backgroundColor: color.casing,
        borderRadius: "16px 16px 36px 36px",
        boxShadow: `inset 0 -14px 0 ${color.casingDeep}, inset 0 6px 0 #dcdad5`,
      }}
    >
      {/* Ball-top stick on its dust washer */}
      <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 40, borderRadius: "50%", backgroundColor: color.ground, opacity: 0.85 }} />
        <div
          style={{
            position: "absolute",
            left: 100 - 14 + tilt.x * 0.5,
            top: 100 - 70 + tilt.y * 0.5,
            width: 28,
            height: 76,
            borderRadius: 14,
            backgroundColor: color.raised2,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 100 - 50 + tilt.x,
            top: 100 - 110 + tilt.y,
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: color.accent,
            boxShadow: `inset -10px -12px 0 ${color.accentEdge}`,
          }}
        />
        <span style={{ ...printed, position: "absolute", left: 0, right: 0, bottom: -6, textAlign: "center" }}>1P</span>
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        {/* The middle button sits higher, in the usual arc that follows the fingers */}
        {([0, 1, 2] as const).map((b) => (
          <div key={b} style={{ marginTop: b === 1 ? -50 : 0 }}>
            <ArcadeButton presses={on(b)} size={110} />
          </div>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <ArcadeButton presses={on("start")} size={92} />
        <span style={{ ...printed, fontFamily: font.display, fontWeight: 700, fontSize: 30 }}>START</span>
      </div>
    </div>
  );
};
