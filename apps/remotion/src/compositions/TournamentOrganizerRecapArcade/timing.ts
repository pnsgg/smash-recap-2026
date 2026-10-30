import { BAR } from "../../lib/motion";

export const FPS = 30;
export const SIZE = 600;

const ACT_BARS = {
  serviceMode: 4,
  gamesInstalled: 5,
  biggestCrowds: 5,
  series: 3,
  coinBox: 4,
  continue: 5,
} as const;

export type Act = keyof typeof ACT_BARS;
export const ACTS = Object.keys(ACT_BARS) as Act[];

export const START = Object.fromEntries(
  ACTS.map((name, i) => [name, ACTS.slice(0, i).reduce((sum, n) => sum + ACT_BARS[n] * BAR, 0)]),
) as Record<Act, number>;

export const LENGTH = Object.fromEntries(ACTS.map((n) => [n, ACT_BARS[n] * BAR])) as Record<Act, number>;

export const DURATION = ACTS.reduce((sum, n) => sum + ACT_BARS[n] * BAR, 0);
