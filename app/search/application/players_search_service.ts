import { inject } from '@adonisjs/core'
import { SearchPlayerResult } from '#search/domain/player_search_result'
import { StartggPlayerRepository } from '#shared/infrastructure/secondary/startgg/player_repository'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'

@inject()
export default class PlayersSearchService {
  constructor(private client: StartggClient) {}

  async searchPlayerByGamerTag(gamertag: string): Promise<SearchPlayerResult[]> {
    const repository = new StartggPlayerRepository(this.client, {
      videogameIds: [1386], // Super Smash Bros. Ultimate
    })
    return repository.searchPlayerByGamerTag(gamertag)
  }
}
