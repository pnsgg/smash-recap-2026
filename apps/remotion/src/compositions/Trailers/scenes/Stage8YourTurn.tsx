import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BAR, BEAT, clamp, springPresets } from "../../../lib/motion";
import { ArcadeButton } from "../components/ArcadeButton";
import { beamDrift, MisconvergeText } from "../components/MisconvergeText";
import { PixelSprite } from "../components/PixelSprite";
import { RasterZigzagWipe } from "../components/RasterZigzagWipe";
import { useLayout } from "../layout";
import { blink, color, font } from "../theme";
import { SITE } from "../timing";
import { SceneColumn } from "./SceneColumn";

const PAINT = 20;
const KICKER_AT = BEAT;
const ADDRESS_AT = 2 * BEAT;
const HOW_AT = 3 * BEAT;
const START_AT = BAR;
const BYE_AT = 2 * BAR;
/** START pulses on every beat of the second bar, like the attract loop begging for a press. */
export const START_PRESSES = [0, 1, 2, 3].map((beat) => START_AT + beat * BEAT);

/**
 * The call to action. The beam paints the glass start-button red, the address drops onto it, and
 * a dark band rises with the start button pulsing on the beat, then waves goodbye before the
 * tube switches off.
 */
export const Stage8YourTurn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit, column } = useLayout();
  const paint = interpolate(frame, [0, PAINT], [0, 1], clamp);
  const kicker = spring({ frame: frame - KICKER_AT, fps, config: springPresets.bouncy });
  const address = spring({ frame: frame - ADDRESS_AT, fps, config: springPresets.bouncy });
  const how = interpolate(frame, [HOW_AT, HOW_AT + 10], [0, 1], clamp);
  const band = spring({ frame: frame - START_AT, fps, config: springPresets.snappy });
  const bye = spring({ frame: frame - BYE_AT, fps, config: springPresets.bouncy });
  const drift = beamDrift(frame, [ADDRESS_AT], 16);
  const bob = Math.abs(Math.sin((frame / BEAT) * Math.PI)) * -10;

  const strip = narrow ? { top: column.bottom - (kind === "tall" ? 250 : 190), height: kind === "tall" ? 250 : 190 } : { top: 650, height: 210 };
  const greeting = kind === "tall" ? "YOUR TURN,\nPLAYER 1!" : "YOUR TURN, PLAYER 1!";
  const tagline = narrow ? "Type your gamer tag.\nReplay your season." : "Type your gamer tag. Replay your season.";
  const button = narrow ? 96 : 120;
  const call = (text: string, room: number) => (narrow ? fit(text, 110, room) : 110);

  return (
    <AbsoluteFill>
      <RasterZigzagWipe paint={paint} color={color.accent} beam={color.ink} rows={10} />

      <SceneColumn wideTop={0} gap={narrow ? 36 : 28} bottom={narrow ? strip.top - 30 : undefined}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: frame >= KICKER_AT ? 1 : 0, transform: `scale(${kicker})`, transformOrigin: "left center" }}>
          <PixelSprite name="smile" pixel={kind === "tall" ? 12 : 9} color={color.ground} style={{ transform: `translateY(${bob}px)` }} />
          <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: fit(greeting, 84, column.width - 130), lineHeight: 1.05, color: color.ground, whiteSpace: "pre" }}>
            {greeting}
          </span>
        </div>
        <MisconvergeText
          drift={drift}
          fill={color.ground}
          style={{
            fontFamily: font.display,
            fontWeight: 500,
            fontSize: fit(SITE, 176),
            lineHeight: 1,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
            opacity: frame >= ADDRESS_AT ? 1 : 0,
            transform: `scale(${1.3 - 0.3 * address})`,
            transformOrigin: "left center",
          }}
        >
          {SITE.toUpperCase()}
        </MisconvergeText>
        <div
          style={{
            fontFamily: font.text,
            fontWeight: 800,
            fontSize: narrow ? 50 : 60,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            whiteSpace: "pre",
            color: color.ground,
            clipPath: `inset(0 ${(1 - how) * 100}% 0 0)`,
          }}
        >
          {tagline}
        </div>
      </SceneColumn>

      {frame >= START_AT ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            ...strip,
            paddingLeft: column.left,
            display: "flex",
            alignItems: "center",
            gap: narrow ? 36 : 44,
            backgroundColor: color.ground,
            transform: `scaleY(${band})`,
          }}
        >
          {frame < BYE_AT ? (
            <>
              <ArcadeButton presses={START_PRESSES} size={button} />
              <span
                style={{
                  fontFamily: font.display,
                  fontWeight: 500,
                  fontSize: call("PRESS START", column.width - button - 40),
                  lineHeight: 1,
                  color: color.ink,
                  opacity: blink(frame - START_AT) ? 1 : 0.35,
                }}
              >
                PRESS START
              </span>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 36, transform: `scale(${bye})`, transformOrigin: "left center" }}>
              <PixelSprite name="heart" pixel={narrow ? 11 : 14} color={color.accent} />
              <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: call("SEE YOU THERE!", column.width - 130), lineHeight: 1, color: color.ink }}>
                SEE YOU THERE!
              </span>
            </div>
          )}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
