import env from '#start/env'
import TournamentOrganizerRecapTransformer from '#transformers/tournament_organizer_recap_transformer'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TournamentOrganizerRecapService from '#recap/application/tournament_organizer_recap_service'
import type { UserSlug } from '#shared/domain/ids'

@inject()
export default class TournamentOrganizerRecapController {
  constructor(private service: TournamentOrganizerRecapService) {}

  async handle({ request, serialize }: HttpContext) {
    const slug = request.param('slug') as UserSlug
    const yearNumber = env.get('RECAP_YEAR')
    const yearDate = new Date(yearNumber, 0, 1)

    const recap = await this.service.getRecap(slug, yearDate)

    return serialize(TournamentOrganizerRecapTransformer.transform(recap))
  }
}
