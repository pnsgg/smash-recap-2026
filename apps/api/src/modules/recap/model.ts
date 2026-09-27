import { t } from 'elysia'
import type { Player } from '#recap/domain/player'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'

export const playerRecapParamsSchema = t.Object({
  slug: t.String(),
})
export type PlayerRecapParams = typeof playerRecapParamsSchema.static

export const playerRecapQuerySchema = t.Object({
  videogameId: t.Optional(t.String()),
})
export type PlayerRecapQuery = typeof playerRecapQuerySchema.static

export const tournamentOrganizerRecapParamsSchema = t.Object({
  slug: t.String(),
})
export type TournamentOrganizerRecapParams = typeof tournamentOrganizerRecapParamsSchema.static

export function presentPlayerRecap(player: Player) {
  return {
    id: player.id,
    prefix: player.prefix,
    gamerTag: player.gamerTag,
    totalTournaments: player.tournaments.length,
    totalSets: player.totalSets(),
    dayOfWeekActivity: player.dayOfWeekActivity(),
    tournamentsByMonth: player.tournamentsByMonth(),
    cleanSweeps: player.cleanSweeps(),
    reverseSweeps: player.reverseSweeps(),
    decidingGameSets: player.decidingGameSets(),
    totalDisqualifications: player.totalDisqualifications(),
    bestPerformances: player.bestPerformances(5).map((perf) => ({
      tournamentName: perf.tournament.name,
      spr: perf.spr,
    })),
    worstPerformance: (() => {
      const perf = player.worstPerformance()
      return perf ? { tournamentName: perf.tournament.name, spr: perf.spr } : null
    })(),
    mostPlayedCharacters: player.mostPlayedCharacters(5).map((char) => ({
      characterId: char.character.id,
      characterName: char.character.name,
      count: char.count,
    })),
    highestUpset: (() => {
      const upset = player.highestUpset()
      return upset
        ? {
            tournamentName: upset.tournament.name,
            eventName: upset.event.name,
            factor: upset.factor,
          }
        : null
    })(),
    stageActivity: player.stageActivity().map((stat) => ({
      stageId: stat.stage.id,
      stageName: stat.stage.name,
      count: stat.count,
      winRate: stat.winRate,
    })),
    worstMatchups: player.worstMatchups(5).map((matchup) => ({
      characterId: matchup.character.id,
      characterName: matchup.character.name,
      count: matchup.count,
      lossCount: matchup.lossCount,
      looseRate: matchup.looseRate,
    })),
    nemesis: player.nemesis(3),
    eventTypeBreakdown: player.eventTypeBreakdown(),
    seriesPlayed: player.seriesPlayed(5).map((series) => ({
      name: series.name,
      count: series.tournaments.length,
      tournamentNames: series.tournaments.map((t) => t.name),
    })),
  }
}

export function presentTournamentOrganizerRecap(to: TournamentOrganizer) {
  return {
    id: to.id,
    gamerTag: to.gamerTag,
    totalTournaments: to.totalTournaments(),
    biggestTournaments: to.biggestTournaments(5).map((t) => ({
      tournamentName: t.tournament.name,
      attendees: t.attendees,
    })),
    gamesOrganized: to.gamesOrganized().map((g) => ({
      videogameId: g.videogame.id,
      videogameName: g.videogame.name,
      count: g.count,
    })),
    dayOfWeekActivity: to.dayOfWeekActivity(),
    tournamentsByMonth: to.tournamentsByMonth(),
    eventTypeBreakdown: to.eventTypeBreakdown().map((e) => ({
      type: e.type,
      count: e.count,
    })),
    seriesOrganized: to.seriesOrganized(5).map((series) => ({
      name: series.name,
      count: series.tournaments.length,
      tournamentNames: series.tournaments.map((t) => t.name),
    })),
  }
}
