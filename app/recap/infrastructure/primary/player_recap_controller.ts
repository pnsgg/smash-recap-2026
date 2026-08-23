import env from '#start/env'
import PlayerRecapTransformer from '#transformers/player_recap_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import type { UserSlug } from '#shared/domain/ids'
import { StartggPlayerRepository } from '#shared/infrastructure/secondary/startgg/player_repository'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'

export default class PlayerRecapController {
  private repository: StartggPlayerRepository

  constructor() {
    this.repository = new StartggPlayerRepository(new StartggClient(), {
      videogameIds: [1386], // Super Smash Bros. Ultimate
    })
  }

  async handle({ request, serialize }: HttpContext) {
    const slug = request.param('slug') as UserSlug
    const yearNumber = env.get('RECAP_YEAR')
    const yearDate = new Date(yearNumber, 0, 1)

    const player = await this.repository.getPlayerRecap(slug, yearDate)

    return serialize(PlayerRecapTransformer.transform(player))
  }
}
