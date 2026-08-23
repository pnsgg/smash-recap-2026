import env from '#start/env'
import PlayerRecapTransformer from '#transformers/player_recap_transformer'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PlayerRecapService from '#recap/application/player_recap_service'
import type { UserSlug } from '#shared/domain/ids'

@inject()
export default class PlayerRecapController {
  constructor(private service: PlayerRecapService) {}

  async handle({ request, serialize }: HttpContext) {
    const slug = request.param('slug') as UserSlug
    const yearNumber = env.get('RECAP_YEAR')
    const yearDate = new Date(yearNumber, 0, 1)

    const player = await this.service.getRecap(slug, yearDate)

    return serialize(PlayerRecapTransformer.transform(player))
  }
}
