import { random } from "remotion";
import { color } from "../theme";

/**
 * How far the red and cyan guns sit off the white at `frame`: each impact kicks them apart and
 * they reconverge over a few frames with a seeded sideways jitter. Pure function of the frame.
 */
export const beamDrift = (frame: number, impacts: ReadonlyArray<number>, amplitude = 14, settle = 5) =>
  impacts.reduce((sum, at) => {
    const age = frame - at;
    if (age < 0 || age > settle * 4) {
      return sum;
    }
    return sum + amplitude * Math.exp(-age / settle) * (0.55 + random(`beam-${at}-${age}`) * 0.9);
  }, 0);

/**
 * Display type whose red and cyan guns drift off the phosphor by `drift` px, drawn as two
 * hard-edged text shadows so the split reads at any size. At zero drift it is clean phosphor.
 */
export const MisconvergeText: React.FC<{
  children: React.ReactNode;
  drift: number;
  fill?: string;
  style?: React.CSSProperties;
}> = ({ children, drift, fill = color.ink, style }) => {
  const d = Math.abs(drift) < 0.2 ? 0 : drift;
  return (
    <div
      style={{
        color: fill,
        textShadow: d ? `${-d}px ${d * 0.2}px 0 ${color.gunRed}b3, ${d}px ${-d * 0.2}px 0 ${color.gunCyan}b3` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
