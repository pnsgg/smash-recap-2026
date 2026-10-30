import { pixelPath, PIXEL_ROWS } from "../../../lib/pixelFont";
import { color as palette } from "../theme";

/**
 * A tabular score display in the 5×7 bitmap face. The box is sized for the final value and the
 * lit figure is right-aligned in it, so a roll-up never reflows; behind it every cell of the final
 * figure sits unlit (digits as 8s), like a scoreboard's dead segments. `progress` rolls a number
 * up and is clamped so the count never passes the real value. `drift` splits the red and cyan
 * guns off the figure on impacts.
 */
export const PixelCounter: React.FC<{
  value: number | string;
  progress?: number;
  format?: (n: number) => string;
  /** One bitmap pixel, in px; the figure is 7 of them tall. */
  pixel?: number;
  color?: string;
  /** Colour of the unlit cells, or `false` for none. */
  unlit?: string | false;
  drift?: number;
  style?: React.CSSProperties;
}> = ({ value, progress = 1, format = (n) => String(n), pixel = 12, color = palette.ink, unlit = palette.raised2, drift = 0, style }) => {
  const final = typeof value === "string" ? value : format(value);
  const shown = typeof value === "string" ? value : format(Math.round(value * Math.min(1, Math.max(0, progress))));
  const box = pixelPath(final);
  const lit = pixelPath(shown);
  const dead = pixelPath(final.replace(/\d/g, "8"));
  const shift = `translate(${box.width - lit.width} 0)`;
  // Gun offset in bitmap units, so it scales with the figure
  const d = Math.abs(drift) < 0.2 ? 0 : drift / pixel;

  return (
    <svg
      width={box.width * pixel}
      height={PIXEL_ROWS * pixel}
      viewBox={`0 0 ${box.width} ${PIXEL_ROWS}`}
      shapeRendering="crispEdges"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {unlit ? <path d={dead.d} fill={unlit} /> : null}
      {d ? (
        <>
          <path d={lit.d} fill={palette.gunRed} opacity={0.75} transform={`translate(${box.width - lit.width - d} ${d * 0.2})`} />
          <path d={lit.d} fill={palette.gunCyan} opacity={0.75} transform={`translate(${box.width - lit.width + d} ${-d * 0.2})`} />
        </>
      ) : null}
      <path d={lit.d} fill={color} transform={shift} />
    </svg>
  );
};
