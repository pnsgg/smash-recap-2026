import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import type { TournamentOrganizerRepository } from '#recap/domain/ports/tournament_organizer_repository'
import type { Player } from '#recap/domain/player'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import type { UserSlug, VideogameId } from '#shared/ids'
import { startggClient } from '#shared/startgg/client.instance'
import { StartggPlayerRepository } from '#shared/startgg/player_repository'
import { StartggTournamentOrganizerRepository } from '#shared/startgg/tournament_organizer_repository'

export class PlayerRecapService {
  constructor(private readonly repository: PlayerRepository) {}

  getRecap(slug: UserSlug, year: Date, videogameId: VideogameId): Promise<Player> {
    return this.repository.getPlayerRecap(slug, year, videogameId)
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
