import type { PlayerRecapProps } from "@shared";
import { BAR } from "../../lib/motion";

export const FPS = 30;
export const SIZE = 600;

const ACT_BARS = {
  insertCoin: 4,
  playerSelect: 5,
  stageSelect: 5,
  challenger: 5,
  finalRound: 5,
  bonusStage: 5,
  coinLedger: 5,
  continue: 5,
} as const;

export type Act = keyof typeof ACT_BARS;
export const ACTS = Object.keys(ACT_BARS) as Act[];

export const START = Object.fromEntries(
  ACTS.map((name, i) => [name, ACTS.slice(0, i).reduce((sum, n) => sum + ACT_BARS[n] * BAR, 0)]),
) as Record<Act, number>;

export const LENGTH = Object.fromEntries(ACTS.map((n) => [n, ACT_BARS[n] * BAR])) as Record<Act, number>;

export const DURATION = ACTS.reduce((sum, n) => sum + ACT_BARS[n] * BAR, 0);

/** The acts this recap plays, when each starts and how long it runs: no characters or no stages, no act. */
export const timeline = (recap: Pick<PlayerRecapProps, "mostPlayedCharacters" | "stageActivity">) => {
  const acts = ACTS.filter(
    (name) =>
      !(name === "playerSelect" && recap.mostPlayedCharacters.length === 0) &&
      !(name === "stageSelect" && recap.stageActivity.length === 0),
  );
  const start = Object.fromEntries(
    acts.map((name, i) => [name, acts.slice(0, i).reduce((sum, n) => sum + LENGTH[n], 0)]),
  ) as Partial<Record<Act, number>>;
  return { acts, start, duration: acts.reduce((sum, n) => sum + LENGTH[n], 0) };
};

export const POWER_ON = 42;
export const POWER_OFF = 30;
