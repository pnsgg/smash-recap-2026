import type { PlayerRecapProps } from "@shared";
import { BAR } from "../../lib/motion";

export const MIN_STAGE_GAMES = 10;

const BEAT = BAR / 4;

/**
 * When each part of the results act starts: the "Best results" card, the best run on its own, the
 * other runs and the worst one as a list, then the biggest upset. Parts with no data are skipped and
 * the act ends on the beat after the last one.
 */
export const bonusPlan = (r: { bestRuns: number; worstRun: boolean; upset: boolean }) => {
  const list = r.bestRuns > 1 || r.worstRun;
  const runsAt = 40;
  const listAt = runsAt + (r.bestRuns > 0 ? (list ? 90 : 120) : 0);
  const upsetAt = listAt + (list ? 150 : 0);
  const end = upsetAt + (r.upset ? 120 : 0);
  return { runsAt, listAt, upsetAt, length: Math.ceil(Math.max(end, 120) / BEAT) * BEAT };
};

/** Stages played enough to rank by win rate. */
export const ratedStages = <T extends { count: number }>(stages: T[]) => stages.filter((s) => s.count >= MIN_STAGE_GAMES);

/** Stage screens the stage act shows: the most played, then the best and lowest win rates when there are rated stages. */
export const stageViewCount = (stages: { count: number }[]) => 1 + Math.min(ratedStages(stages).length, 2);

const EVENT_TYPE = { singles: "1", teams: "5" } as const;

export const deriveArcade = (recap: PlayerRecapProps) => {
  const stages = [...recap.stageActivity].sort((a, b) => b.count - a.count);
  const rated = ratedStages(stages);
  const byRate = [...rated].sort((a, b) => b.winRate - a.winRate || b.count - a.count);
  const bestStage = byRate[0] ?? null;
  const worstStage = byRate.length > 1 ? byRate[byRate.length - 1]! : null;

  const busiest = <T extends { count: number }>(rows: T[]) =>
    rows.reduce<T | null>((top, row) => (row.count > 0 && (!top || row.count > top.count) ? row : top), null);

  const singles = recap.eventTypeBreakdown[EVENT_TYPE.singles] ?? 0;
  const teams = recap.eventTypeBreakdown[EVENT_TYPE.teams] ?? 0;

  return {
    prefix: recap.prefix,
    tag: recap.gamerTag,
    avatarUrl: recap.avatarUrl,
    totalTournaments: recap.totalTournaments,
    totalSets: recap.totalSets,
    fighters: recap.mostPlayedCharacters,
    main: recap.mostPlayedCharacters[0] ?? null,
    stages,
    topStage: stages[0] ?? null,
    bestStage,
    worstStage,
    nemesis: recap.nemesis,
    rival: recap.rival,
    matchups: recap.worstMatchups.slice(0, 3),
    deciding: recap.decidingGameSets,
    cleanSweeps: recap.cleanSweeps,
    reverseSweeps: recap.reverseSweeps,
    bestRuns: recap.bestPerformances,
    worstRun: recap.worstPerformance,
    upset: recap.highestUpset,
    months: recap.tournamentsByMonth,
    days: recap.dayOfWeekActivity,
    busiestMonth: busiest(recap.tournamentsByMonth),
    busiestDay: busiest(recap.dayOfWeekActivity),
    series: recap.seriesPlayed.slice(0, 3),
    rankings: recap.rankings,
    events: { singles, teams, total: singles + teams },
    disqualifications: recap.totalDisqualifications,
  };
};

export type ArcadeData = ReturnType<typeof deriveArcade>;

const DAY_NAMES: Record<string, string> = {
  Sun: "SUNDAY",
  Mon: "MONDAY",
  Tue: "TUESDAY",
  Wed: "WEDNESDAY",
  Thu: "THURSDAY",
  Fri: "FRIDAY",
  Sat: "SATURDAY",
};

export const dayName = (day: string) => DAY_NAMES[day] ?? day.toUpperCase();
