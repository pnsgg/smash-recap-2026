/**
 * A 5×7 bitmap face for figures, drawn as SVG. Arcade score digits, with a flat-topped 5 and a slashed 0
 * so no figure can be misread (the display font draws 5 like an S).
 */
const G: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  "%": ["##...", "##..#", "...#.", "..#..", ".#...", "#..##", "...##"],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "-": ["....", "....", "....", "####", "....", "....", "...."],
  "–": ["....", "....", "....", "####", "....", "....", "...."],
  ",": ["..", "..", "..", "..", "..", ".#", "#."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
  ":": [".", ".", "#", ".", "#", ".", "."],
  " ": ["...", "...", "...", "...", "...", "...", "..."],
};

const ROWS = 7;

/** Returns the SVG path, its width in pixels, and whether every character was drawable. */
export function pixelPath(text: string) {
  let x = 0;
  let d = "";
  for (const ch of text) {
    const glyph = G[ch] ?? G[" "]!;
    glyph.forEach((row, y) => {
      for (let i = 0; i < row.length; i++) if (row[i] === "#") d += `M${x + i} ${y}h1v1h-1z`;
    });
    x += glyph[0]!.length + 1;
  }
  return { d, width: Math.max(1, x - 1), height: ROWS };
}

/** A standalone SVG string, for places that need an image (the downloadable recap card). */
export function pixelSvg(text: string, color: string, pixel = 10) {
  const { d, width, height } = pixelPath(text);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * pixel}" height="${height * pixel}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><path d="${d}" fill="${color}"/></svg>`;
}

export const pixelDataUri = (text: string, color: string, pixel = 10) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pixelSvg(text, color, pixel))}`;
