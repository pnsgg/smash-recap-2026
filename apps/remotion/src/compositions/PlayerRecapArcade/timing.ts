import type { PlayerRecapProps } from "@shared";
import { BAR } from "../../lib/motion";
import { bonusPlan, stageViewCount } from "./data";

export const FPS = 30;
export const SIZE = 600;

const ACT_BARS = {
  insertCoin: 4,
  playerSelect: 5,
  stageSelect: 7,
  challenger: 6,
  finalRound: 5,
  bonusStage: 6,
  coinLedger: 6,
  rankings: 4,
  continue: 5,
} as const;

export type Act = keyof typeof ACT_BARS;
export const ACTS = Object.keys(ACT_BARS) as Act[];

export const START = Object.fromEntries(
  ACTS.map((name, i) => [name, ACTS.slice(0, i).reduce((sum, n) => sum + ACT_BARS[n] * BAR, 0)]),
) as Record<Act, number>;

export const LENGTH = Object.fromEntries(ACTS.map((n) => [n, ACT_BARS[n] * BAR])) as Record<Act, number>;

export const DURATION = ACTS.reduce((sum, n) => sum + ACT_BARS[n] * BAR, 0);

/** Stage select: the grid until the first stage screen, then 4 seconds per screen (whole bars throughout). */
export const STAGE_VIEW_AT = [60, 180, 300] as const;
const STAGE_VIEW_FRAMES = 120;

type TimelineRecap = Pick<
  PlayerRecapProps,
  "mostPlayedCharacters" | "stageActivity" | "rankings" | "bestPerformances" | "worstPerformance" | "highestUpset"
>;

/**
 * Player select stops after its last step: the first pick (at frame 50), the second (140), then the
 * "also picked" list (210, the full act). Each ends 90-100 frames after its last step, on a beat.
 */
const PLAYER_SELECT_BARS = { 1: 2.5, 2: 4 } as const;

const actLength = (name: Act, recap: TimelineRecap) => {
  if (name === "bonusStage") {
    return bonusPlan({
      bestRuns: recap.bestPerformances.length,
      worstRun: recap.worstPerformance !== null,
      upset: recap.highestUpset !== null,
    }).length;
  }
  if (name === "stageSelect") return STAGE_VIEW_AT[0] + stageViewCount(recap.stageActivity) * STAGE_VIEW_FRAMES;
  if (name !== "playerSelect") return LENGTH[name];
  const fighters = recap.mostPlayedCharacters.length;
  return fighters === 1 || fighters === 2 ? PLAYER_SELECT_BARS[fighters] * BAR : LENGTH.playerSelect;
};

/** The acts this recap plays, when each starts and how long it runs: no characters, stages or rankings, no act. */
export const timeline = (recap: TimelineRecap) => {
  const acts = ACTS.filter(
    (name) =>
      !(name === "playerSelect" && recap.mostPlayedCharacters.length === 0) &&
      !(name === "stageSelect" && recap.stageActivity.length === 0) &&
      !(name === "rankings" && recap.rankings.length === 0),
  );
  const length = (name: Act) => actLength(name, recap);
  const start = Object.fromEntries(
    acts.map((name, i) => [name, acts.slice(0, i).reduce((sum, n) => sum + length(n), 0)]),
  ) as Partial<Record<Act, number>>;
  return { acts, start, duration: acts.reduce((sum, n) => sum + length(n), 0) };
};

export const POWER_ON = 42;
export const POWER_OFF = 30;
