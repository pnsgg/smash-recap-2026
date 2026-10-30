import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../../lib/motion";
import { blink, color, font } from "../theme";

/**
 * A line to the viewer in the display face, typed on by the beam a few characters a frame, with
 * the block cursor riding the write head and blinking `1.1s steps(1)` once it is done. `\n` breaks
 * lines. The box is always sized for the finished text, so typing never moves the layout.
 */
export const Headline: React.FC<{
  text: string;
  from: number;
  size?: number;
  fill?: string;
  /** Characters written per frame. */
  speed?: number;
  cursor?: boolean;
  style?: React.CSSProperties;
}> = ({ text, from, size = 110, fill = color.ink, speed = 2, cursor = true, style }) => {
  const frame = useCurrentFrame();
  const written = Math.floor(interpolate(frame, [from, from + text.length / speed], [0, text.length], clamp));
  const started = frame >= from;
  const showCursor = cursor && started && (written < text.length || blink(frame - from));
  const block = (visible: boolean) => (
    <span
      style={{
        display: "inline-block",
        width: size * 0.5,
        height: size * 0.8,
        marginLeft: size * 0.08,
        verticalAlign: "-0.08em",
        backgroundColor: visible ? fill : "transparent",
      }}
    />
  );

  return (
    <div
      style={{
        position: "relative",
        fontFamily: font.display,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: "-0.01em",
        color: fill,
        whiteSpace: "pre",
        ...style,
      }}
    >
      <div style={{ visibility: "hidden" }}>
        {text}
        {cursor ? block(false) : null}
      </div>
      {started ? (
        <div style={{ position: "absolute", inset: 0 }}>
          {text.slice(0, written)}
          {showCursor ? block(true) : null}
        </div>
      ) : null}
    </div>
  );
};
