import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BAR, BEAT, springPresets } from "../../../lib/motion";
import { beamDrift, MisconvergeText } from "../components/MisconvergeText";
import { PixelSprite, type SpriteName } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { blink, caption, color, font } from "../theme";
import { SEASON } from "../timing";
import { SceneColumn } from "./SceneColumn";

const SEASON_AT = 6;
const REPLAY_AT = 2 * BEAT;
const LINES: { text: string; sprite: SpriteName }[] = [
  { text: "Every bracket.", sprite: "trophy" },
  { text: "Every set.", sprite: "star" },
  { text: "Every clutch moment.", sprite: "heart" },
];

/** The promise, VCR-style: the season rewinds, and the three things it is made of are counted off a beat apart. */
export const Stage2Replay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit } = useLayout();
  const tall = kind === "tall";
  const season = spring({ frame: frame - SEASON_AT, fps, config: springPresets.snappy });
  const replay = spring({ frame: frame - REPLAY_AT, fps, config: springPresets.heavy });
  // The layout camera eases the headline up as the list comes in on the second bar
  const pan = spring({ frame: frame - BAR, fps, config: springPresets.smooth });
  const drift = beamDrift(frame, [REPLAY_AT], 18);
  const seasonText = tall ? `YOUR ${SEASON}\nSEASON` : `YOUR ${SEASON} SEASON`;
  const replayText = tall ? "DESERVES\nA REPLAY." : "DESERVES A REPLAY.";
  const display = { fontFamily: font.display, fontWeight: 500, lineHeight: 1, whiteSpace: "pre" } as const;

  return (
    <SceneColumn wideTop={50} gap={narrow ? 48 : 60}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, transform: `translateY(${pan * -30}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: blink(frame, 16) ? 1 : 0.35 }}>
          <PixelSprite name="rewind" pixel={7} color={color.accent} />
          <span style={{ ...caption, fontSize: 40, color: color.accent }}>Replay</span>
        </div>
        <div
          style={{
            ...display,
            fontSize: fit(seasonText, 156),
            color: color.ink,
            opacity: frame >= SEASON_AT ? 1 : 0,
            transform: `translateX(${(1 - season) * -120}px)`,
          }}
        >
          {seasonText}
        </div>
        <MisconvergeText
          drift={drift}
          fill={color.accent}
          style={{
            ...display,
            fontSize: fit(replayText, tall ? 140 : 130),
            opacity: frame >= REPLAY_AT ? 1 : 0,
            transform: `scale(${1.25 - 0.25 * replay})`,
            transformOrigin: "left center",
          }}
        >
          {replayText}
        </MisconvergeText>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: narrow ? 18 : 22 }}>
        {LINES.map((line, i) => {
          const from = BAR + i * BEAT;
          const pop = spring({ frame: frame - from, fps, config: springPresets.bouncy });
          return (
            <div
              key={line.text}
              style={{ display: "flex", alignItems: "center", gap: 26, opacity: frame >= from ? 1 : 0, transform: `translateX(${(1 - pop) * 60}px)` }}
            >
              <PixelSprite name={line.sprite} pixel={8} color={color.victory} />
              <span style={{ fontFamily: font.text, fontWeight: 800, fontSize: kind === "square" ? 50 : 60, letterSpacing: "-0.02em", color: color.ink }}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </SceneColumn>
  );
};
