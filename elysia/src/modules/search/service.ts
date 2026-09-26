import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import type { SearchPlayerResult } from '#search/domain/player_search_result'
import { startggClient } from '#shared/startgg/client.instance'
import { StartggPlayerRepository } from '#shared/startgg/player_repository'

export class PlayersSearchService {
  constructor(private readonly repository: PlayerRepository) {}

  searchPlayerByGamerTag(gamertag: string): Promise<SearchPlayerResult[]> {
    return this.repository.searchPlayerByGamerTag(gamertag)
  }
}

export const playersSearchService = new PlayersSearchService(
  new StartggPlayerRepository(startggClient, {})
)
