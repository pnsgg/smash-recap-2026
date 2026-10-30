import type { PlayerRecapProps, TournamentOrganizerRecapProps } from "@shared";
import { RECAP_YEAR } from "../config";

const nf = new Intl.NumberFormat("en");
export const formatNumber = (n: number) => nf.format(n);
export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;
export const formatSigned = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const WEEKDAYS: Record<string, string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

const MONTHS: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

const top = <T extends { count: number }>(items: T[]): T | undefined =>
  items.reduce<T | undefined>((best, item) => (!best || item.count > best.count ? item : best), undefined);

export const displayName = (prefix: string | null | undefined, gamerTag: string) =>
  prefix ? `${prefix} ${gamerTag}` : gamerTag;

export const busiestWeekday = (activity: { day: string; count: number }[]) => {
  const best = top(activity);
  return best && best.count > 0 ? { day: WEEKDAYS[best.day] ?? best.day, count: best.count } : null;
};

export const busiestMonth = (activity: { month: string; count: number }[]) => {
  const best = top(activity);
  return best && best.count > 0 ? { month: MONTHS[best.month] ?? best.month, count: best.count } : null;
};

/** One line of the recap menu: what is counted, and this account's value for it. */
export type StatLine = {
  id: string;
  name: string;
  description: string;
  value: string;
  /** Large figure for the pinned readout. */
  figure: string;
  /** Sentence under the figure in the readout, completed with the account's name. */
  caption: string;
};

export type StatGroup = { name: string; lines: StatLine[] };

export function playerStatGroups(recap: PlayerRecapProps): StatGroup[] {
  const who = displayName(recap.prefix, recap.gamerTag);
  const main = recap.mostPlayedCharacters[0];
  const second = recap.mostPlayedCharacters[1];
  const stage = top(recap.stageActivity);
  const matchup = recap.worstMatchups[0];
  const day = busiestWeekday(recap.dayOfWeekActivity);
  const best = recap.bestPerformances[0];
  const series = recap.seriesPlayed[0];
  const deciding = recap.decidingGameSets;

  return [
    {
      name: "Sets",
      lines: [
        {
          id: "sets",
          name: "Sets played",
          description: "Every set that reached a result",
          value: formatNumber(recap.totalSets),
          figure: formatNumber(recap.totalSets),
          caption: `sets played by ${who}`,
        },
        {
          id: "sweeps",
          name: "Clean sweeps",
          description: "Sets won without dropping a game",
          value: formatNumber(recap.cleanSweeps),
          figure: formatNumber(recap.cleanSweeps),
          caption: `sets ${who} won without dropping a game`,
        },
        {
          id: "reverse",
          name: "Reverse sweeps",
          description: "Down 0–2, won 3–2. And the other way round",
          value: `${recap.reverseSweeps.won} won, ${recap.reverseSweeps.lost} lost`,
          figure: `${recap.reverseSweeps.won}–${recap.reverseSweeps.lost}`,
          caption: `reverse sweeps won and lost by ${who}`,
        },
        {
          id: "deciding",
          name: "Deciding games",
          description: "Game 3 of a best of 3, game 5 of a best of 5",
          value: `${deciding.winCount} of ${deciding.count} won`,
          figure: deciding.count ? formatPercent(deciding.winRate) : "–",
          caption: `of last-game sets won by ${who}, ${deciding.winCount} of ${deciding.count}`,
        },
      ],
    },
    {
      name: "Rivals",
      lines: [
        {
          id: "nemesis",
          name: "Nemesis",
          description: "The opponent you lost the most sets to",
          value: recap.nemesis ? `${recap.nemesis.playerWonSet}–${recap.nemesis.opponentWonSet} in sets` : "None yet",
          figure: recap.nemesis ? `${recap.nemesis.playerWonSet}–${recap.nemesis.opponentWonSet}` : "–",
          caption: `${who}’s set record against their nemesis`,
        },
        {
          id: "upset",
          name: "Biggest upset",
          description: "Your best win against a higher seed",
          value: recap.highestUpset ? `Factor ${recap.highestUpset.factor}` : "None yet",
          figure: recap.highestUpset ? `${recap.highestUpset.factor}` : "–",
          caption: recap.highestUpset
            ? `upset factor, ${who}’s biggest win, at ${recap.highestUpset.tournamentName}`
            : `no upsets recorded for ${who} yet`,
        },
        {
          id: "matchup",
          name: "Toughest matchup",
          description: "The character you lose to most",
          value: matchup ? `${matchup.characterName}, ${formatPercent(matchup.looseRate)} lost` : "None yet",
          figure: matchup ? formatPercent(matchup.looseRate) : "–",
          caption: matchup ? `of games ${who} lost against ${matchup.characterName}` : `no matchup data for ${who} yet`,
        },
      ],
    },
    {
      name: "Characters and stages",
      lines: [
        {
          id: "main",
          name: "Main",
          description: "Your most played character, in games",
          value: main ? `${main.characterName}, ${formatNumber(main.count)}` : "None yet",
          figure: main ? formatNumber(main.count) : "–",
          caption: main ? `games ${who} played as ${main.characterName}` : `no character data for ${who} yet`,
        },
        {
          id: "second",
          name: "Second pick",
          description: "The character you went to next",
          value: second ? `${second.characterName}, ${formatNumber(second.count)}` : "None",
          figure: second ? formatNumber(second.count) : "–",
          caption: second ? `games ${who} played as ${second.characterName}` : `${who} stuck to one character`,
        },
        {
          id: "stage",
          name: "Most played stage",
          description: "With your win rate on it",
          value: stage ? `${stage.stageName}, ${formatPercent(stage.winRate)} won` : "None yet",
          figure: stage ? formatPercent(stage.winRate) : "–",
          caption: stage ? `of games ${who} won on ${stage.stageName}` : `no stage data for ${who} yet`,
        },
      ],
    },
    {
      name: "Calendar",
      lines: [
        {
          id: "tournaments",
          name: "Tournaments",
          description: "Every start.gg event you entered",
          value: formatNumber(recap.totalTournaments),
          figure: formatNumber(recap.totalTournaments),
          caption: `tournaments entered by ${who}`,
        },
        {
          id: "weekday",
          name: "Busiest day",
          description: "The weekday you compete on most",
          value: day ? `${day.day}, ${day.count}` : "None yet",
          figure: day ? `${day.count}` : "–",
          caption: day ? `tournaments ${who} played on a ${day.day}` : `no events for ${who} yet`,
        },
        {
          id: "spr",
          name: "Best run",
          description: "Seed performance: places above your seed",
          value: best ? `${formatSigned(best.spr)} at ${best.tournamentName}` : "None yet",
          figure: best ? formatSigned(best.spr) : "–",
          caption: best ? `places above seed for ${who}, at ${best.tournamentName}` : `no seeded events for ${who} yet`,
        },
        {
          id: "series",
          name: "Home series",
          description: "The recurring event you went back to most",
          value: series ? `${series.name}, ${series.count} times` : "None yet",
          figure: series ? `${series.count}` : "–",
          caption: series ? `editions of ${series.name} entered by ${who}` : `no recurring series for ${who} yet`,
        },
      ],
    },
  ];
}

export function organizerStatGroups(recap: TournamentOrganizerRecapProps, prefix?: string | null): StatGroup[] {
  const who = displayName(prefix, recap.gamerTag);
  const biggest = recap.biggestTournaments[0];
  const mainGame = top(recap.gamesOrganized);
  const day = busiestWeekday(recap.dayOfWeekActivity);
  const month = busiestMonth(recap.tournamentsByMonth);
  const series = recap.seriesOrganized[0];
  const eventCount = recap.gamesOrganized.reduce((sum, game) => sum + game.count, 0);

  return [
    {
      name: "Brackets",
      lines: [
        {
          id: "to-tournaments",
          name: "Tournaments run",
          description: "Every start.gg tournament you organised",
          value: formatNumber(recap.totalTournaments),
          figure: formatNumber(recap.totalTournaments),
          caption: `tournaments run by ${who}`,
        },
        {
          id: "to-biggest",
          name: "Biggest bracket",
          description: "Most attendees at one of your tournaments",
          value: biggest ? `${formatNumber(biggest.attendees)}, ${biggest.tournamentName}` : "None yet",
          figure: biggest ? formatNumber(biggest.attendees) : "–",
          caption: biggest ? `attendees at ${biggest.tournamentName}` : `no attendance data for ${who} yet`,
        },
        {
          id: "to-games",
          name: "Games run",
          description: "Distinct games across your events",
          value: `${recap.gamesOrganized.length} games`,
          figure: `${recap.gamesOrganized.length}`,
          caption: `games on ${who}’s brackets, across ${formatNumber(eventCount)} events`,
        },
        {
          id: "to-main-game",
          name: "Main game",
          description: "The game with the most events",
          value: mainGame ? `${mainGame.videogameName}, ${mainGame.count}` : "None yet",
          figure: mainGame ? formatNumber(mainGame.count) : "–",
          caption: mainGame ? `${mainGame.videogameName} events run by ${who}` : `no events for ${who} yet`,
        },
      ],
    },
    {
      name: "Calendar",
      lines: [
        {
          id: "to-weekday",
          name: "Busiest day",
          description: "The weekday your brackets run on most",
          value: day ? `${day.day}, ${day.count}` : "None yet",
          figure: day ? `${day.count}` : "–",
          caption: day ? `tournaments ${who} ran on a ${day.day}` : `no tournaments for ${who} yet`,
        },
        {
          id: "to-month",
          name: "Busiest month",
          description: "The month with the most tournaments",
          value: month ? `${month.month}, ${month.count}` : "None yet",
          figure: month ? `${month.count}` : "–",
          caption: month ? `tournaments ${who} ran in ${month.month}` : `no tournaments for ${who} yet`,
        },
        {
          id: "to-series",
          name: "Longest series",
          description: "Your recurring event with the most editions",
          value: series ? `${series.name}, ${series.count} editions` : "None yet",
          figure: series ? `${series.count}` : "–",
          caption: series ? `editions of ${series.name} run by ${who}` : `no recurring series for ${who} yet`,
        },
      ],
    },
  ];
}

/** Short summary sentence for a player, used on the top players screen and the recap page. */
export function playerSummary(recap: PlayerRecapProps) {
  const main = recap.mostPlayedCharacters[0];
  const endSentence = (s: string) => (s.endsWith(".") ? s : `${s}.`);
  const parts = [
    `${formatNumber(recap.totalTournaments)} tournaments and ${formatNumber(recap.totalSets)} sets in ${RECAP_YEAR}.`,
  ];
  if (recap.decidingGameSets.count > 0) {
    parts.push(
      endSentence(
        `Won ${recap.decidingGameSets.winCount} of ${recap.decidingGameSets.count} deciding games${main ? `, mostly as ${main.characterName}` : ""}`,
      ),
    );
  } else if (main) {
    parts.push(endSentence(`Mostly ${main.characterName}`));
  }
  return parts.join(" ");
}

const EMPTY_PLAYER_RECAP: PlayerRecapProps = {
  id: "",
  prefix: null,
  gamerTag: "",
  avatarUrl: null,
  totalTournaments: 0,
  totalSets: 0,
  dayOfWeekActivity: [],
  tournamentsByMonth: [],
  cleanSweeps: 0,
  reverseSweeps: { won: 0, lost: 0 },
  decidingGameSets: { count: 0, winCount: 0, winRate: 0 },
  totalDisqualifications: 0,
  bestPerformances: [],
  worstPerformance: null,
  mostPlayedCharacters: [],
  highestUpset: null,
  stageActivity: [],
  worstMatchups: [],
  nemesis: null,
  rival: null,
  eventTypeBreakdown: {},
  seriesPlayed: [],
  skippedEventCount: 0,
};

const EMPTY_ORGANIZER_RECAP: TournamentOrganizerRecapProps = {
  id: "",
  gamerTag: "",
  avatarUrl: null,
  totalTournaments: 0,
  biggestTournaments: [],
  gamesOrganized: [],
  dayOfWeekActivity: [],
  tournamentsByMonth: [],
  eventTypeBreakdown: [],
  seriesOrganized: [],
};

/**
 * The same lines with every value replaced by `mark`: "…" while a recap is on its way, "–" when
 * start.gg could not be reached. The readout falls back to each line's description.
 */
function markLines(groups: StatGroup[], mark: string): StatGroup[] {
  return groups.map((group) => ({
    ...group,
    lines: group.lines.map((line) => ({ ...line, value: mark, figure: mark, caption: line.description })),
  }));
}

export const placeholderPlayerStatGroups = (mark: string) => markLines(playerStatGroups(EMPTY_PLAYER_RECAP), mark);
export const placeholderOrganizerStatGroups = (mark: string) =>
  markLines(organizerStatGroups(EMPTY_ORGANIZER_RECAP), mark);
