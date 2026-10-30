import { pixelPath } from "../../../lib/pixelFont";
import { color, uncapped } from "../theme";

export const PixelText: React.FC<{ text: string; px: number; fill?: string; style?: React.CSSProperties }> = ({
  text,
  px,
  fill = color.ink,
  style,
}) => {
  const { d, width, height } = pixelPath(text);
  return (
    <svg
      width={width * px}
      height={height * px}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      style={{ display: "block", overflow: "visible", ...uncapped, ...style }}
    >
      <path d={d} fill={fill} />
    </svg>
  );
};

export const pixelWidth = (text: string, px: number) => pixelPath(text).width * px;

export const Sprite: React.FC<{
  rows: readonly string[];
  palette: Record<string, string>;
  px: number;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({ rows, palette, px, flip = false, style }) => {
  const width = Math.max(...rows.map((r) => r.length));
  const paths: Record<string, string> = {};
  rows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (!palette[c]) return;
      paths[c] = (paths[c] ?? "") + `M${flip ? width - 1 - x : x} ${y}h1v1h-1z`;
    });
  });
  return (
    <svg
      width={width * px}
      height={rows.length * px}
      viewBox={`0 0 ${width} ${rows.length}`}
      shapeRendering="crispEdges"
      style={{ display: "block", ...uncapped, ...style }}
    >
      {Object.entries(paths).map(([c, d]) => (
        <path key={c} d={d} fill={palette[c]} />
      ))}
    </svg>
  );
};
