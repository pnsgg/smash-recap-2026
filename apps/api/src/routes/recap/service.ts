import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import type { TournamentOrganizerRepository } from '#recap/domain/ports/tournament_organizer_repository'
import type { Player } from '#recap/domain/player'
import type { PlayerProfile } from '#recap/domain/player_profile'
import { type PlayerRanking, rankingsDuring } from '#recap/domain/player_ranking'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import type { PlayerId, UserSlug, VideogameId } from '#libs/ids'
import { startggClient } from '#libs/startgg/client.instance'
import { StartggPlayerRepository } from '#libs/startgg/player_repository'
import { StartggTournamentOrganizerRepository } from '#libs/startgg/tournament_organizer_repository'

export class PlayerRecapService {
  constructor(private readonly repository: PlayerRepository) {}

  async getRecap(
    slug: UserSlug,
    year: Date,
    videogameId: VideogameId
  ): Promise<{
    player: Player
    skippedEventCount: number
    nemesisProfile: PlayerProfile | null
    rivalProfile: PlayerProfile | null
    upsetOpponentProfile: PlayerProfile | null
    rankings: PlayerRanking[]
  }> {
    const recap = await this.repository.getPlayerRecap(slug, year, videogameId)
    const lookup = (id: PlayerId | undefined) =>
      id ? this.repository.getPlayerProfile(id).catch(() => null) : Promise.resolve(null)
    const nemesisId = recap.player.nemesis()?.opponentPlayerId
    const rivalId = recap.player.rival()?.opponentPlayerId
    const upsetOpponentId = recap.player.highestUpset()?.set.opponentOf(recap.player.id)?.playerId

    // One lookup per distinct opponent: the nemesis, the rival and the upset's loser are often the same player.
    const ids = [...new Set([nemesisId, rivalId, upsetOpponentId].filter((id): id is PlayerId => Boolean(id)))]
    const [profiles, rankings] = await Promise.all([
      Promise.all(ids.map(async (id) => [id, await lookup(id)] as const)).then((entries) => new Map(entries)),

      this.repository.getPlayerRankings(recap.player.id, videogameId).catch(() => []),
    ])
    const profileOf = (id: PlayerId | undefined) => (id ? (profiles.get(id) ?? null) : null)
    return {
      ...recap,
      nemesisProfile: profileOf(nemesisId),
      rivalProfile: profileOf(rivalId),
      upsetOpponentProfile: profileOf(upsetOpponentId),
      rankings: rankingsDuring(rankings, year.getFullYear()),
    }
  }
}

export class TournamentOrganizerRecapService {
  constructor(private readonly repository: TournamentOrganizerRepository) {}

  getRecap(slug: UserSlug, year: Date): Promise<TournamentOrganizer> {
    return this.repository.getTournamentOrganizerRecap(slug, year)
  }
}

export const playerRecapService = new PlayerRecapService(new StartggPlayerRepository(startggClient, {}))
export const tournamentOrganizerRecapService = new TournamentOrganizerRecapService(
  new StartggTournamentOrganizerRepository(startggClient)
)
