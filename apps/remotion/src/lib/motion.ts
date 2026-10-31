import { spring, interpolate } from "remotion";

export interface SpringConfig {
  damping: number;
  mass: number;
  stiffness: number;
  overshootClamping?: boolean;
}

export const springPresets = {
  snappy: { damping: 20, mass: 0.6, stiffness: 280 },
  smooth: { damping: 18, mass: 1, stiffness: 140 },
  heavy: { damping: 24, mass: 2, stiffness: 90 },
  bouncy: { damping: 10, mass: 0.8, stiffness: 180 },
} as const satisfies Record<string, SpringConfig>;

export const getSpringValue = ({
  frame,
  fps,
  delay = 0,
  config = springPresets.smooth,
  from = 0,
  to = 1,
}: {
  frame: number;
  fps: number;
  delay?: number;
  config?: SpringConfig;
  from?: number;
  to?: number;
}): number => {
  const spr = spring({
    frame: frame - delay,
    fps,
    config,
  });

  return interpolate(spr, [0, 1], [from, to]);
};

export const getBeatFrame = (
  beatNumber: number,
  bpm: number,
  fps: number,
): number => {
  const secondsPerBeat = 60 / bpm;
  return Math.round(beatNumber * secondsPerBeat * fps);
};

export const countUp = (value: number, progress: number): number =>
  Math.round(value * Math.min(1, Math.max(0, progress)));

const BEAT = getBeatFrame(1, 120, 30);
export const BAR = 4 * BEAT;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const track = ({
  frame,
  fps,
  initial,
  keyframes,
  config = springPresets.smooth,
}: {
  frame: number;
  fps: number;
  initial: number;
  keyframes: ReadonlyArray<{ at: number; to: number }>;
  config?: SpringConfig;
}): number => {
  let value = initial;
  let previous = initial;
  for (const { at, to } of keyframes) {
    value += (to - previous) * spring({ frame: frame - at, fps, config });
    previous = to;
  }
  return value;
};
