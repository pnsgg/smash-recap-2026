import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import type { TournamentOrganizerRepository } from '#recap/domain/ports/tournament_organizer_repository'
import type { Player } from '#recap/domain/player'
import type { PlayerProfile } from '#recap/domain/player_profile'
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
  }> {
    const recap = await this.repository.getPlayerRecap(slug, year, videogameId)
    const lookup = (id: PlayerId | undefined) =>
      id ? this.repository.getPlayerProfile(id).catch(() => null) : Promise.resolve(null)
    const nemesisId = recap.player.nemesis()?.opponentPlayerId
    const rivalId = recap.player.rival()?.opponentPlayerId
    const [nemesisProfile, rivalProfile] =
      nemesisId === rivalId
        ? await lookup(nemesisId).then((profile) => [profile, profile])
        : await Promise.all([lookup(nemesisId), lookup(rivalId)])
    return { ...recap, nemesisProfile, rivalProfile }
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
