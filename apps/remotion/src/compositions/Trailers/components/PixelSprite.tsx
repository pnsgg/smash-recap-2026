import { color as palette } from "../theme";

/** Hand-placed 1-bit sprites, one string per row, `#` lit. */
const SPRITES = {
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  star: ["...#...", "...#...", "#######", ".#####.", "..###..", ".##.##.", "##...##"],
  smile: ["..####..", ".#....#.", "#.#..#.#", "#......#", "#.#..#.#", "#..##..#", ".#....#.", "..####.."],
  lock: ["..###..", ".#...#.", ".#...#.", "#######", "###.###", "###.###", "#######"],
  rewind: ["...#....#", "..##...##", ".###..###", "####.####", ".###..###", "..##...##", "...#....#"],
  trophy: ["########", "#.####.#", "#.####.#", ".######.", "..####..", "...##...", "..####..", ".######."],
  arrow: ["#....", "##...", "###..", "####.", "###..", "##...", "#...."],
} as const;

export type SpriteName = keyof typeof SPRITES;

/** A sprite drawn as crisp SVG squares, `pixel` px each, so it stays sharp at any scale. */
export const PixelSprite: React.FC<{
  name: SpriteName;
  pixel?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ name, pixel = 10, color = palette.ink, style }) => {
  const rows = SPRITES[name];
  const width = rows[0].length;
  let d = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") d += `M${x} ${y}h1v1h-1z`;
  });

  return (
    <svg
      width={width * pixel}
      height={rows.length * pixel}
      viewBox={`0 0 ${width} ${rows.length}`}
      shapeRendering="crispEdges"
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      <path d={d} fill={color} />
    </svg>
  );
};
