import type { Player } from '#recap/domain/player'
import type { PlayerProfile } from '#recap/domain/player_profile'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'

export function presentPlayerRecap(
  player: Player,
  skippedEventCount: number,
  nemesisProfile: PlayerProfile | null = null,
  rivalProfile: PlayerProfile | null = null
) {
  const nemesis = player.nemesis()
  const rival = player.rival()
  const named = (profile: PlayerProfile | null) => ({
    prefix: profile?.prefix ?? null,
    gamerTag: profile?.gamerTag ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
  })
  return {
    id: player.id,
    prefix: player.prefix,
    gamerTag: player.gamerTag,
    avatarUrl: player.avatarUrl,
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
      tournamentImageUrl: perf.tournament.imageUrl,
      spr: perf.spr,
    })),
    worstPerformance: (() => {
      const perf = player.worstPerformance()
      return perf
        ? {
            tournamentName: perf.tournament.name,
            tournamentImageUrl: perf.tournament.imageUrl,
            spr: perf.spr,
          }
        : null
    })(),
    mostPlayedCharacters: player.mostPlayedCharacters(5).map((char) => ({
      characterId: char.character.id,
      characterName: char.character.name,
      ...char.character.images,
      count: char.count,
    })),
    highestUpset: (() => {
      const upset = player.highestUpset()
      return upset
        ? {
            tournamentName: upset.tournament.name,
            tournamentImageUrl: upset.tournament.imageUrl,
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
      ...matchup.character.images,
      count: matchup.count,
      lossCount: matchup.lossCount,
      looseRate: matchup.looseRate,
    })),
    nemesis: nemesis && { ...nemesis, ...named(nemesisProfile) },
    rival: rival && { ...rival, ...named(rivalProfile) },
    eventTypeBreakdown: player.eventTypeBreakdown(),
    seriesPlayed: player.seriesPlayed(5).map((series) => ({
      name: series.name,
      count: series.tournaments.length,
      tournamentNames: series.tournaments.map((t) => t.name),
      imageUrl: series.tournaments.find((t) => t.imageUrl)?.imageUrl ?? null,
    })),
    skippedEventCount,
  }
}

export function presentTournamentOrganizerRecap(to: TournamentOrganizer) {
  return {
    id: to.id,
    gamerTag: to.gamerTag,
    avatarUrl: to.avatarUrl,
    totalTournaments: to.totalTournaments(),
    biggestTournaments: to.biggestTournaments(5).map((t) => ({
      tournamentName: t.tournament.name,
      tournamentImageUrl: t.tournament.imageUrl,
      attendees: t.attendees,
    })),
    gamesOrganized: to.gamesOrganized().map((g) => ({
      videogameId: g.videogame.id,
      videogameName: g.videogame.name,
      imageUrl: g.videogame.imageUrl,
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
      imageUrl: series.tournaments.find((t) => t.imageUrl)?.imageUrl ?? null,
    })),
  }
}

export function presentPlayerSummary(recap: ReturnType<typeof presentPlayerRecap>) {
  return {
    id: recap.id,
    prefix: recap.prefix,
    gamerTag: recap.gamerTag,
    totalTournaments: recap.totalTournaments,
    totalSets: recap.totalSets,
  }
}

export function presentTournamentOrganizerSummary(recap: ReturnType<typeof presentTournamentOrganizerRecap>) {
  return {
    id: recap.id,
    gamerTag: recap.gamerTag,
    totalTournaments: recap.totalTournaments,
  }
}
