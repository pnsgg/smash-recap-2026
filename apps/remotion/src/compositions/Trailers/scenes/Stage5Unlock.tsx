import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, springPresets } from "../../../lib/motion";
import { PixelSprite } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { blink, caption, color, font } from "../theme";
import { Headline } from "./Headline";
import { SceneColumn } from "./SceneColumn";

/** What a recap holds, by the names the site gives them. No figures: those are the viewer's to unlock. */
const CARDS = ["Main", "Nemesis", "Biggest upset", "Best run", "Deciding games", "Busiest day"];
const GAP = 32;
const TEASE_AT = 7 * BEAT;

/**
 * Step 3 as an achievement wall: six locked cards, one unlocking on each beat to the high-score
 * jingle. Each opens on a blinking "?", because the answer is in your own recap. Three across on
 * the wide glass, two across on narrow ones.
 */
export const Stage5Unlock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kind, narrow, fit, column } = useLayout();
  const columns = narrow ? 2 : 3;
  const card = { width: (column.width - (columns - 1) * GAP) / columns, height: kind === "tall" ? 230 : narrow ? 150 : 200 };
  const title = kind === "tall" ? "UNLOCK\nYOUR RECAP" : "UNLOCK YOUR RECAP";

  return (
    <SceneColumn gap={narrow ? 40 : 46}>
      <Headline text={title} from={10} size={fit(title, kind === "tall" ? 140 : 110)} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: GAP }}>
        {CARDS.map((name, i) => {
          const at = (i + 1) * BEAT;
          const open = frame >= at;
          const pop = spring({ frame: frame - at, fps, config: springPresets.bouncy });
          const flash = open && frame - at < 3;
          return (
            <div
              key={name}
              style={{
                width: card.width,
                height: card.height,
                padding: narrow ? "20px 26px" : "28px 34px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: flash ? color.ink : color.raised,
                border: `5px solid ${open ? color.victory : color.raised2}`,
                boxShadow: `0 8px 0 ${open ? color.victoryDeep : color.raised2}`,
                transform: `scale(${open ? 0.92 + 0.08 * pop : 0.92})`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <PixelSprite name={open ? "star" : "lock"} pixel={narrow ? 7 : 8} color={open ? color.victory : color.muted} />
                <span
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: narrow ? 72 : 92,
                    lineHeight: 1,
                    color: open ? color.accent : color.raised2,
                    opacity: open && !blink(frame - at, 20) ? 0.4 : 1,
                  }}
                >
                  ?
                </span>
              </div>
              <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: narrow ? 44 : 58, lineHeight: 1, whiteSpace: "nowrap", color: open ? color.ink : color.muted }}>
                {open ? name : "Locked"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ ...caption, fontSize: narrow ? 36 : 44, color: color.ink, whiteSpace: "pre", opacity: frame >= TEASE_AT ? 1 : 0 }}>
        No spoilers here.{kind === "tall" ? "\n" : " "}
        <span style={{ color: color.accent }}>Yours are waiting.</span>
      </div>
    </SceneColumn>
  );
};
