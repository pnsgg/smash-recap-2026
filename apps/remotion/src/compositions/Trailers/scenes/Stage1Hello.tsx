import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, springPresets } from "../../../lib/motion";
import { beamDrift, MisconvergeText } from "../components/MisconvergeText";
import { PixelSprite } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { color, font } from "../theme";
import { Headline } from "./Headline";
import { SceneColumn } from "./SceneColumn";

const HEY_AT = BEAT;
const PLAYER_AT = 2 * BEAT;

/** The hook: the tube warms up and the cabinet greets whoever is standing in front of it. */
export const Stage1Hello: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit, column } = useLayout();
  const face = spring({ frame: frame - 10, fps, config: springPresets.bouncy });
  const hey = spring({ frame: frame - HEY_AT, fps, config: springPresets.bouncy });
  const player = spring({ frame: frame - PLAYER_AT, fps, config: springPresets.bouncy });
  const drift = beamDrift(frame, [HEY_AT, PLAYER_AT], 16);
  // The face bobs on every beat once it is in
  const bob = frame >= 10 ? Math.abs(Math.sin(((frame - 10) / BEAT) * Math.PI)) * -14 : 0;
  const size = narrow ? fit("PLAYER 1!", kind === "tall" ? 200 : 170) : 190;
  const word = { fontFamily: font.display, fontWeight: 500, fontSize: size, lineHeight: 0.95, whiteSpace: "nowrap" } as const;
  const greet = narrow ? "Got a minute?\nLet's replay your season." : "Got a minute? Let's replay your season.";

  return (
    <SceneColumn wideTop={100} gap={narrow ? 56 : 90}>
      <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", alignItems: narrow ? "flex-start" : "center", gap: narrow ? 40 : 80 }}>
        <div style={{ transform: `translateY(${bob}px) scale(${face})`, transformOrigin: "center bottom" }}>
          <PixelSprite name="smile" pixel={narrow ? 24 : 30} color={color.accent} />
        </div>
        <div>
          <MisconvergeText
            drift={drift}
            style={{ ...word, opacity: frame >= HEY_AT ? 1 : 0, transform: `scale(${0.6 + 0.4 * hey})`, transformOrigin: "left bottom" }}
          >
            HEY,
          </MisconvergeText>
          <MisconvergeText
            drift={drift}
            fill={color.accent}
            style={{ ...word, opacity: frame >= PLAYER_AT ? 1 : 0, transform: `scale(${0.6 + 0.4 * player})`, transformOrigin: "left bottom" }}
          >
            PLAYER 1!
          </MisconvergeText>
        </div>
      </div>

      <Headline text={greet} from={3 * BEAT} size={narrow ? fit("Let's replay your season.", 60, column.width, 0.5) : 58} speed={4} cursor={false} />
    </SceneColumn>
  );
};
