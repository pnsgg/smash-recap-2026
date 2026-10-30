import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BAR, BEAT, clamp, springPresets } from "../../../lib/motion";
import { ArcadeButton } from "../components/ArcadeButton";
import { PixelSprite } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { blink, caption, color, font } from "../theme";
import { Headline } from "./Headline";
import { SceneColumn } from "./SceneColumn";

const TYPE_AT = BEAT;
const KEYS = 6;
/** START is pressed on the downbeat of the second bar. */
export const TAG_PRESS_AT = BAR;
const ALT_AT = BAR + BEAT;
const EASY_AT = BAR + 2 * BEAT;

/**
 * Step 1 on the cabinet's putty control panel: a tag is keyed into the slot (masked, it is
 * whoever is watching), START is pressed on the downbeat, and the slot lights up green.
 */
export const Stage3YourTag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit, column } = useLayout();
  // One key per eighth note
  const keyed = Math.floor(interpolate(frame, [TYPE_AT, TYPE_AT + KEYS * (BEAT / 2)], [0, KEYS], clamp));
  const accepted = frame >= TAG_PRESS_AT;
  const glow = spring({ frame: frame - TAG_PRESS_AT, fps, config: springPresets.snappy });
  const easy = spring({ frame: frame - EASY_AT, fps, config: springPresets.bouncy });
  const title = kind === "tall" ? "TYPE YOUR\nGAMER TAG" : "TYPE YOUR GAMER TAG";
  const button = narrow ? 104 : 130;
  const key = narrow ? 40 : 48;

  return (
    <SceneColumn gap={narrow ? 44 : 52}>
      <Headline text={title} from={10} size={fit(title, kind === "tall" ? 140 : 110)} />

      <div
        style={{
          height: narrow ? 210 : 260,
          padding: narrow ? "0 36px" : "0 56px",
          display: "flex",
          alignItems: "center",
          gap: narrow ? 32 : 48,
          backgroundColor: color.casing,
          borderRadius: 24,
          boxShadow: `inset 0 -10px 0 ${color.casingDeep}`,
        }}
      >
        <div
          style={{
            flex: 1,
            height: narrow ? 110 : 130,
            padding: narrow ? "0 26px" : "0 36px",
            display: "flex",
            alignItems: "center",
            gap: narrow ? 14 : 18,
            backgroundColor: color.ground,
            borderRadius: 10,
            outline: `${accepted ? 6 : 0}px solid ${color.victory}`,
            outlineOffset: 4 * (1 - glow),
          }}
        >
          {keyed === 0 ? (
            <span style={{ fontFamily: font.text, fontWeight: 500, fontSize: narrow ? 36 : 52, letterSpacing: "-0.02em", color: color.muted, whiteSpace: "nowrap" }}>
              your start.gg gamer tag
            </span>
          ) : (
            Array.from({ length: keyed }, (_, i) => <div key={i} style={{ width: key, height: key * 1.33, backgroundColor: color.ink }} />)
          )}
          {!accepted && blink(frame, 16) ? <div style={{ width: 6, height: key * 1.6, backgroundColor: color.accent }} /> : null}
          {accepted ? (
            <span style={{ marginLeft: "auto", fontFamily: font.display, fontWeight: 700, fontSize: narrow ? 52 : 64, color: color.victory }}>OK!</span>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <ArcadeButton presses={[TAG_PRESS_AT]} size={button} />
          <span style={{ ...caption, fontSize: narrow ? 26 : 30, color: color.ground }}>Start</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: narrow ? 24 : 30 }}>
        <div style={{ ...caption, fontSize: narrow ? 34 : 42, opacity: frame >= ALT_AT ? 1 : 0 }}>Or paste your start.gg profile link</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            opacity: frame >= EASY_AT ? 1 : 0,
            transform: `scale(${frame >= EASY_AT ? easy : 0})`,
            transformOrigin: "left center",
          }}
        >
          <PixelSprite name="heart" pixel={10} color={color.accent} />
          <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: narrow ? fit("That's all it takes.", 84, column.width - 100, 0.55) : 84, lineHeight: 1, color: color.ink, whiteSpace: "nowrap" }}>
            That's all it takes.
          </span>
        </div>
      </div>
    </SceneColumn>
  );
};
