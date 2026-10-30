import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { clamp } from "../../../lib/motion";
import { uncapped } from "../theme";
import { DURATION, POWER_OFF, SIZE } from "../timing";

const INSET = 0;
const RADIUS = 0;
const SNOW = 3;
const ROLL = 9;

export const Snow: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => (
  <svg width={SIZE} height={SIZE} style={{ position: "absolute", left: -INSET, top: -INSET, opacity, ...uncapped }}>
    <filter id={`arcade-snow-${frame}`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.6" numOctaves={2} seed={frame} />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="linear" slope={2.4} intercept={-0.7} />
        <feFuncG type="linear" slope={2.4} intercept={-0.7} />
        <feFuncB type="linear" slope={2.4} intercept={-0.7} />
      </feComponentTransfer>
    </filter>
    <rect width={SIZE} height={SIZE} filter={`url(#arcade-snow-${frame})`} />
  </svg>
);

// Scanlines and the tube's dark edges as SVG: the in-browser video export can't draw repeating or radial gradients.
const Glass: React.FC = () => (
  <svg width={SIZE} height={SIZE} style={{ position: "absolute", left: -INSET, top: -INSET, pointerEvents: "none", ...uncapped }}>
    <defs>
      <pattern id="arcade-scanlines" width={3} height={3} patternUnits="userSpaceOnUse">
        <rect y={2} width={3} height={1} fill="#000000" opacity={0.26} />
      </pattern>
      <radialGradient id="arcade-vignette" cx="50%" cy="50%" r="72%">
        <stop offset="62%" stopColor="#000000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0.75} />
      </radialGradient>
    </defs>
    <rect width={SIZE} height={SIZE} fill="url(#arcade-scanlines)" />
    <rect width={SIZE} height={SIZE} fill="url(#arcade-vignette)" />
  </svg>
);

export const Crt: React.FC<{ frame: number; cuts: readonly number[]; duration?: number; children: React.ReactNode }> = ({
  frame,
  cuts,
  duration = DURATION,
  children,
}) => {
  const offAt = duration - POWER_OFF;

  // Power on: dot (4–12), line (12–22), the picture opens (22–34), overexposed until it settles.
  const dot = interpolate(frame, [4, 12], [0, 1], clamp);
  const line = interpolate(frame, [12, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const open = interpolate(frame, [22, 34], [0.006, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  // Power off: the picture folds into the line (0–8), the line into the dot (8–18), the dot fades (18–28).
  const fold = interpolate(frame, [offAt, offAt + 8], [1, 0.006], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shrink = interpolate(frame, [offAt + 8, offAt + 18], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  const fade = interpolate(frame, [offAt + 18, offAt + 28], [1, 0], clamp);

  const powering = frame < 22;
  const off = frame >= offAt + 8;
  const scaleY = frame < offAt ? open : fold;
  const brightness =
    frame < offAt ? interpolate(frame, [22, 44], [2.4, 1], clamp) : interpolate(frame, [offAt, offAt + 8], [1, 2.4], clamp);

  const cut = [...cuts].reverse().find((at) => frame >= at - SNOW && frame < at + ROLL);
  const sinceCut = cut === undefined ? Infinity : frame - cut;
  const snowing = sinceCut < 0;
  const roll = sinceCut >= 0 && sinceCut < ROLL ? sinceCut / ROLL : 1;
  const rollY = interpolate(roll, [0, 1], [SIZE * 0.3, 0], { easing: Easing.out(Easing.cubic) });
  const tear = roll < 1 ? (random(`tear-${frame}`) - 0.5) * 30 * (1 - roll) : 0;

  const lineWidth = frame < offAt ? (SIZE - 2 * INSET) * line : (SIZE - 2 * INSET) * shrink;
  const lineVisible = (frame >= 12 && frame < 28) || (frame >= offAt + 4 && frame < offAt + 18);
  const dotVisible = (frame >= 4 && frame < 14) || (frame >= offAt + 16 && frame < offAt + 28);
  const dotSize = frame < offAt ? 4 + dot * 8 : 12;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050606" }}>
      <div style={{ position: "absolute", inset: INSET, borderRadius: RADIUS, overflow: "hidden", backgroundColor: "#020303" }}>
        {!powering && !off ? (
          <AbsoluteFill
            style={{
              transform: `translate(${tear}px, ${rollY}px) scaleY(${scaleY})`,
              filter: brightness === 1 ? undefined : `brightness(${brightness})`,
            }}
          >
            <div style={{ position: "absolute", left: -INSET, top: -INSET, width: SIZE, height: SIZE }}>{children}</div>
            {rollY > 0 ? <div style={{ position: "absolute", left: 0, right: 0, top: -30, height: 30, backgroundColor: "#000" }} /> : null}
          </AbsoluteFill>
        ) : null}

        {snowing ? <Snow frame={frame} opacity={1} /> : null}
        {roll < 1 ? <Snow frame={frame} opacity={0.22 * (1 - roll)} /> : null}

        {lineVisible ? (
          <div
            style={{
              position: "absolute",
              left: (SIZE - 2 * INSET - lineWidth) / 2,
              top: SIZE / 2 - INSET - 2,
              width: lineWidth,
              height: 4,
              backgroundColor: "#ffffff",
              boxShadow: "0 0 18px 6px rgba(255,255,255,0.65)",
              opacity: frame >= offAt ? 1 : interpolate(frame, [22, 28], [1, 0], clamp),
            }}
          />
        ) : null}
        {dotVisible ? (
          <div
            style={{
              position: "absolute",
              left: SIZE / 2 - INSET - dotSize / 2,
              top: SIZE / 2 - INSET - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: `0 0 ${10 + dotSize}px ${4 + dotSize / 2}px rgba(255,255,255,0.7)`,
              opacity: frame >= offAt ? fade : 1,
            }}
          />
        ) : null}

        <Glass />
      </div>
    </AbsoluteFill>
  );
};
