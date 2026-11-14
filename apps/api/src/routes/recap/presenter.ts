import type { Character } from '#recap/domain/character'
import type { Player } from '#recap/domain/player'
import type { PlayerProfile } from '#recap/domain/player_profile'
import type { PlayerRanking } from '#recap/domain/player_ranking'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import { ultrankTier } from '#libs/ultrank/tiers'

/** A beaten opponent's character, by name and stock icon, or nulls when start.gg has none. */
const characterOf = (character: Character | null) => ({
  characterName: character?.name ?? null,
  stockIconUrl: character?.images.stockIconUrl ?? null,
})

export function presentPlayerRecap(
  player: Player,
  skippedEventCount: number,
  nemesisProfile: PlayerProfile | null = null,
  rivalProfile: PlayerProfile | null = null,
  upsetOpponentProfile: PlayerProfile | null = null,
  rankings: PlayerRanking[] = []
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
    setRecord: player.setRecord(),
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
    bestFinishes: player.bestFinishes(5).map((p) => ({
      tournamentName: p.tournament.name,
      tournamentImageUrl: p.tournament.imageUrl,
      eventName: p.event.name,
      ultrankTier: ultrankTier(p.event.slug),
      placement: p.placement,
      entrants: p.entrants,
      topShare: p.topShare,
      wins: p.wins.map((win) => ({ name: win.name, seed: win.seed, ...characterOf(win.character) })),
    })),
    mostBeaten: player.mostBeaten(10).map((opponent) => ({
      name: opponent.name,
      count: opponent.count,
      ...characterOf(opponent.character),
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
      if (!upset) return null
      const mine = upset.set.competitors.get(player.id)
      const theirs = upset.set.opponentOf(player.id)
      return {
        tournamentName: upset.tournament.name,
        tournamentImageUrl: upset.tournament.imageUrl,
        eventName: upset.event.name,
        factor: upset.factor,
        playerSeed: mine?.seed?.initialSeed ?? null,
        // An upset needs both event seeds, so the opponent always has one here.
        opponent: theirs?.seed
          ? { opponentPlayerId: theirs.playerId, seed: theirs.seed.initialSeed, ...named(upsetOpponentProfile) }
          : null,
      }
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
    rankings: rankings.map((r) => ({
      rank: r.rank,
      previousRank: r.previousRank,
      seriesName: r.seriesName,
      title: r.title,
      imageUrl: r.imageUrl,
    })),
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
