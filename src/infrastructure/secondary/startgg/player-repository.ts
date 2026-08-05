import type { IPlayerRepository } from '#/domain/ports/player-repository'
import type { Player } from '#/domain/recap/player'
import { SearchPlayerResult } from '#/domain/search/player-search-result'
import type { PlayerId } from '#/domain/shared-kernel/ids'
import type { IStartggClient } from './startgg-client'
import { mapSearchPlayerResult } from './mappers/search-player-result-mapper'
import { searchPlayerByGamerTag } from './queries/search-player-by-gamertag'

export class StartggPlayerRepository implements IPlayerRepository {
  constructor(private readonly fetcher: IStartggClient) {}

  /**
   * Search for players matching the gamertag.
   * @param gamerTag the gamertag of the player to look for
   * @returns A promise that resolves to an array of players matching the gamertag
   */
  async searchPlayerByGamerTag(
    gamerTag: string,
  ): Promise<SearchPlayerResult[]> {
    const { data } = await this.fetcher.fetch(searchPlayerByGamerTag, {
      query: {
        filter: {
          hideTest: true,
          isUser: true,
          gamerTag,
        },
      },
    })

    const rawResults =
      data.players?.nodes
        ?.filter(
          (
            player,
          ): player is typeof player & {
            user: { id: string | number }
            gamerTag: string
          } => player?.user?.id !== undefined && player.gamerTag !== null,
        )
        .map((player) =>
          mapSearchPlayerResult({
            id: player.user.id,
            prefix: player.prefix,
            gamerTag: player.gamerTag,
            country: player.user.location?.country,
            profilePictureUrl: player.user.images?.[0]?.url,
            nbEvents: player.user.events?.pageInfo?.total,
          }),
        ) ?? []

    return SearchPlayerResult.rankResults(rawResults)
  }

  getPlayerRecap(_playerId: PlayerId, _year: Date): Promise<Player> {
    // TODO: Implement the method
    throw new Error('getPlayerRecap is not implemented yet')
  }
}
