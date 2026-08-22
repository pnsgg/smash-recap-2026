import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { StartggPlayerRepository } from '#shared/infrastructure/secondary/startgg/player_repository'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'

const searchValidator = vine.create(
  vine.object({
    gamertag: vine.string().trim().minLength(1),
  })
)

export default class PlayersSearchController {
  private repository: StartggPlayerRepository

  constructor() {
    this.repository = new StartggPlayerRepository(new StartggClient(), {
      videogameIds: [1386], // Super Smash Bros. Ultimate
    })
  }

  async handle({ request, response }: HttpContext) {
    const payload = await searchValidator.validate(request.qs())

    const results = await this.repository.searchPlayerByGamerTag(payload.gamertag)

    return response.json(results)
  }
}
