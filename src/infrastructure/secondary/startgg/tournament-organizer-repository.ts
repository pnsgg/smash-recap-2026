import type { ITournamentOrganizerRepository } from '#/domain/ports/tournament-organizer-repository'
import { TournamentOrganizer } from '#/domain/recap/tournament-organizer'
import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { IStartggClient } from './startgg-client'

export class StartggTournamentOrganizerRepository implements ITournamentOrganizerRepository {
  constructor(private readonly fetcher: IStartggClient) {}

  async getTournamentOrganizerRecap(
    slug: UserSlug,
    year: Date,
  ): Promise<TournamentOrganizer> {
    // TODO: Implement Phase 1 (get IDs) and Phase 2 (fetch details)
    return new TournamentOrganizer({
      id: slug,
      gamerTag: 'StubTO',
      tournaments: [],
    })
  }
}
