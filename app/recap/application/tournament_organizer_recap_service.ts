import { inject } from '@adonisjs/core'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import type { UserSlug } from '#shared/domain/ids'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'
import { StartggTournamentOrganizerRepository } from '#shared/infrastructure/secondary/startgg/tournament_organizer_repository'

@inject()
export default class TournamentOrganizerRecapService {
  constructor(private client: StartggClient) {}

  async getRecap(slug: UserSlug, year: Date): Promise<TournamentOrganizer> {
    const repository = new StartggTournamentOrganizerRepository(this.client)
    return repository.getTournamentOrganizerRecap(slug, year)
  }
}
