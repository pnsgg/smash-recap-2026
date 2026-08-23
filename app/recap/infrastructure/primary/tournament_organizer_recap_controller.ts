import env from '#start/env'
import TournamentOrganizerRecapTransformer from '#transformers/tournament_organizer_recap_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import type { UserSlug } from '#shared/domain/ids'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'
import { StartggTournamentOrganizerRepository } from '#shared/infrastructure/secondary/startgg/tournament_organizer_repository'

export default class TournamentOrganizerRecapController {
  private repository: StartggTournamentOrganizerRepository

  constructor() {
    this.repository = new StartggTournamentOrganizerRepository(new StartggClient())
  }

  async handle({ request, serialize }: HttpContext) {
    const slug = request.param('slug') as UserSlug
    const yearNumber = env.get('RECAP_YEAR')
    const yearDate = new Date(yearNumber, 0, 1)

    const organizer = await this.repository.getTournamentOrganizerRecap(slug, yearDate)

    return serialize(TournamentOrganizerRecapTransformer.transform(organizer))
  }
}
