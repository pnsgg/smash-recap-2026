import { pixelPath } from "../lib/pixelFont";

type Props = { value: string; className?: string; label?: string };

/** A figure in the bitmap score face. Sized by `font-size` (the glyphs are one em tall), coloured by `color`. */
export function PixelNumber({ value, className = "", label }: Props) {
  const { d, width, height } = pixelPath(value);
  return (
    <svg
      className={`pixel-number ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: `${width / height}em`, height: "1em" }}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label ?? value}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}
