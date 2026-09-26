import vine from '@vinejs/vine'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PlayersSearchService from '#search/application/players_search_service'

const searchValidator = vine.create(
  vine.object({
    gamertag: vine.string().trim().minLength(1),
  })
)

@inject()
export default class PlayersSearchController {
  constructor(private searchService: PlayersSearchService) {}

  async handle({ request, response }: HttpContext) {
    const payload = await searchValidator.validate(request.qs())

    const results = await this.searchService.searchPlayerByGamerTag(payload.gamertag)

    return response.json(results)
  }
}
