import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../../lib/motion";
import { useLayout } from "../layout";
import { caption, color as palette, font } from "../theme";
import { PixelCounter } from "./PixelCounter";

const HEAD = 56;

/**
 * The electron beam painting the glass in a zigzag, one scan row at a time: even rows left to
 * right, odd rows back. `paint` 0..1 is how much of the raster is laid down; `erase` 0..1 is how
 * much the beam has wiped off again behind itself, in the same order. A hot head rides whichever
 * edge is moving.
 */
export const RasterZigzagWipe: React.FC<{
  paint: number;
  erase?: number;
  rows?: number;
  color?: string;
  beam?: string;
}> = ({ paint, erase = 0, rows = 9, color = palette.raised2, beam = palette.ink }) => {
  const end = Math.min(1, Math.max(0, paint)) * rows;
  const start = Math.min(1, Math.max(0, erase)) * rows;
  const erasing = erase > 0;
  const head = erasing ? start : end;
  const moving = erasing ? erase < 1 : paint > 0 && paint < 1;
  const row = 100 / rows;

  return (
    <AbsoluteFill>
      {Array.from({ length: rows }, (_, i) => {
        const from = Math.min(1, Math.max(0, start - i));
        const to = Math.min(1, Math.max(0, end - i));
        const side = i % 2 === 0 ? "left" : "right";
        const onRow = moving && head - i > 0 && head - i < 1;
        return (
          <div key={i}>
            {to > from ? (
              <div
                style={{
                  position: "absolute",
                  top: `${i * row}%`,
                  height: `${row + 0.15}%`,
                  [side]: `${from * 100}%`,
                  width: `${(to - from) * 100}%`,
                  backgroundColor: color,
                }}
              />
            ) : null}
            {onRow ? (
              <div
                style={{
                  position: "absolute",
                  top: `${i * row}%`,
                  height: `${row}%`,
                  [side]: `calc(${(head - i) * 100}% - ${HEAD / 2}px)`,
                  width: HEAD,
                  backgroundColor: beam,
                  boxShadow: `0 0 44px 12px ${beam}99`,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const PAINT = 6;
const HOLD = 4;
const ERASE = 8;

/**
 * A cut on the downbeat: the beam paints the outgoing stage over in its last frames, the call
 * (`STEP 01`, its name) flashes on the painted raster, and the beam wipes it off onto the new stage.
 * Narrow cabinets stack the name under the number.
 */
export const RasterCut: React.FC<{
  cuts: ReadonlyArray<{ at: number; label: string; number: number; name: string }>;
}> = ({ cuts }) => {
  const frame = useCurrentFrame();
  const { column, narrow, cabinet } = useLayout();
  const cut = cuts.find((c) => frame >= c.at - PAINT && frame < c.at + HOLD + ERASE);
  if (!cut) {
    return null;
  }
  const age = frame - cut.at;
  const paint = interpolate(age, [-PAINT, 0], [0, 1], clamp);
  const erase = interpolate(age, [HOLD, HOLD + ERASE], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <RasterZigzagWipe paint={paint} erase={erase} />
      {age >= -1 && age < HOLD + 3 ? (
        <div
          style={{
            position: "absolute",
            left: column.left,
            top: narrow ? cabinet.screen.height / 2 - 140 : 380,
            display: "flex",
            flexDirection: narrow ? "column" : "row",
            alignItems: narrow ? "flex-start" : "center",
            gap: narrow ? 24 : 30,
            clipPath: `inset(${erase * 140}% 0 0 0)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <span style={{ fontFamily: font.display, fontWeight: 500, fontSize: 120, lineHeight: 1, color: palette.ink }}>{cut.label}</span>
            <PixelCounter value={String(cut.number).padStart(2, "0")} pixel={17} color={palette.accent} unlit={false} />
          </div>
          <span style={{ ...caption, fontSize: 44, color: palette.muted, marginLeft: narrow ? 0 : 20 }}>{cut.name}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
