import type { TournamentOrganizerRecapProps } from "@shared";

const EVENT_TYPE = { singles: 1, teams: 5 } as const;

export const deriveOperator = (recap: TournamentOrganizerRecapProps) => {
  const busiest = <T extends { count: number }>(rows: T[]) =>
    rows.reduce<T | null>((top, row) => (row.count > 0 && (!top || row.count > top.count) ? row : top), null);
  const events = (type: number) => recap.eventTypeBreakdown.find((e) => e.type === type)?.count ?? 0;
  const singles = events(EVENT_TYPE.singles);
  const teams = events(EVENT_TYPE.teams);

  return {
    tag: recap.gamerTag,
    avatarUrl: recap.avatarUrl,
    totalTournaments: recap.totalTournaments,
    games: recap.gamesOrganized,
    events: { singles, teams, total: singles + teams },
    biggest: recap.biggestTournaments.filter((t) => t.attendees > 0),
    series: recap.seriesOrganized.slice(0, 2),
    months: recap.tournamentsByMonth,
    days: recap.dayOfWeekActivity,
    busiestMonth: busiest(recap.tournamentsByMonth),
    busiestDay: busiest(recap.dayOfWeekActivity),
  };
};

export type OperatorData = ReturnType<typeof deriveOperator>;
