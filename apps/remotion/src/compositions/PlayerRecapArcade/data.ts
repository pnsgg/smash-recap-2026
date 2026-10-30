import type { PlayerRecapProps } from "@shared";

export const MIN_STAGE_GAMES = 10;

const EVENT_TYPE = { singles: "1", teams: "5" } as const;

export const deriveArcade = (recap: PlayerRecapProps) => {
  const stages = [...recap.stageActivity].sort((a, b) => b.count - a.count);
  const rated = stages.filter((s) => s.count >= MIN_STAGE_GAMES);
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
    series: recap.seriesPlayed.slice(0, 2),
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
