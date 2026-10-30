import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { springPresets } from "../../../lib/motion";
import { color } from "../theme";

/**
 * An arcade microswitch button in start-button red (the one colour for everything you can press)
 * on its solid underside edge. On each frame in `presses` it snaps down onto the edge and springs
 * back up.
 */
export const ArcadeButton: React.FC<{ presses: ReadonlyArray<number>; size?: number }> = ({ presses, size = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const travel = size / 10;
  const last = [...presses].reverse().find((t) => frame >= t);
  const down = last === undefined ? 0 : 1 - spring({ frame: frame - last - 2, fps, config: springPresets.snappy });
  const depth = travel * (1 - Math.max(0, Math.min(1, down)));

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: down > 0.5 ? color.accentStrong : color.accent,
        boxShadow: `0 ${depth + 2}px 0 ${color.accentEdge}`,
        transform: `translateY(${travel - depth}px)`,
      }}
    />
  );
};
