import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, springPresets } from "../../../lib/motion";
import { PixelSprite } from "../components/PixelSprite";
import { useLayout } from "../layout";
import { caption, color, font } from "../theme";
import { Headline } from "./Headline";
import { SceneColumn } from "./SceneColumn";

/** Where the recap page shares to (apps/web/src/lib/share.ts), one per eighth note, then the image download. */
const TARGETS = ["X", "Bluesky", "Threads", "Reddit"];
const SAVE_AT = 2 * BEAT + 8;

const Chip: React.FC<{ label: string; from: number; size: number; primary?: boolean }> = ({ label, from, size, primary = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - from, fps, config: springPresets.bouncy });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: `${size * 0.3}px ${size * 0.5}px ${size * 0.25}px`,
        fontFamily: font.display,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1,
        backgroundColor: primary ? color.accent : color.raised2,
        color: primary ? color.ground : color.ink,
        boxShadow: `0 8px 0 ${primary ? color.accentEdge : color.raised}`,
        opacity: frame >= from ? 1 : 0,
        transform: `translateY(${(1 - pop) * 40}px) scale(${0.7 + 0.3 * pop})`,
      }}
    >
      {primary ? <PixelSprite name="arrow" pixel={size / 8} color={color.ground} style={{ transform: "rotate(90deg)" }} /> : null}
      {label}
    </div>
  );
};

/** Once it is yours, it goes to the group chat: the share targets pop in on eighth notes. */
export const Stage7Share: React.FC = () => {
  const frame = useCurrentFrame();
  const { kind, narrow, fit } = useLayout();
  const title = kind === "tall" ? "SHOW\nYOUR CREW" : "SHOW YOUR CREW";
  const chip = kind === "square" ? 48 : narrow ? 58 : 64;

  return (
    <SceneColumn wideTop={50} gap={narrow ? 48 : 60}>
      <Headline text={title} from={0} size={fit(title, kind === "tall" ? 160 : 140)} speed={4} />

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 30 }}>
          {TARGETS.map((target, i) => (
            <Chip key={target} label={target} size={chip} from={4 + Math.round((i * BEAT) / 2)} />
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <Chip label="Download image" size={chip} from={SAVE_AT} primary />
        </div>
      </div>

      <div style={{ ...caption, fontSize: narrow ? 36 : 44, color: color.ink, whiteSpace: "pre", opacity: frame >= 3 * BEAT ? 1 : 0 }}>
        {narrow ? "Share the link,\nor save the image." : "Share the link, or save the image."}
      </div>
    </SceneColumn>
  );
};
