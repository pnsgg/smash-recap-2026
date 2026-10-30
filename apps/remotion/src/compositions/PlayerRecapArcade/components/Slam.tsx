import { interpolate, spring, useVideoConfig } from "remotion";
import { clamp, springPresets } from "../../../lib/motion";
import { color } from "../theme";

const RED_GUN = "#ff2a3c";

export const Slam: React.FC<{
  frame: number;
  at: number;
  text: string;
  style: React.CSSProperties;
  fill?: string;
  from?: number;
  split?: number;
}> = ({ frame, at, text, style, fill = color.ink, from = 1.6, split = 7 }) => {
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const land = spring({ frame: frame - at, fps, config: springPresets.snappy });
  const scale = interpolate(land, [0, 1], [from, 1]);
  const d = interpolate(frame - at, [0, 2, 10], [split * 1.6, split, 0], clamp);
  const copy = (fillColor: string, dx: number) => (
    <div style={{ ...style, color: fillColor, position: "absolute", inset: 0, transform: `translateX(${dx}px)` }}>
      {text}
    </div>
  );
  return (
    <div style={{ position: "relative", transform: `scale(${scale})` }}>
      <div style={{ ...style, color: fill, opacity: 0 }}>{text}</div>
      {d > 0.2 ? copy(RED_GUN, d) : null}
      {d > 0.2 ? copy(color.cyan, -d) : null}
      {copy(fill, 0)}
    </div>
  );
};
