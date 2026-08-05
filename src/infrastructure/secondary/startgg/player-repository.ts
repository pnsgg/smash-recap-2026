import type { IPlayerRepository } from '#/domain/ports/player-repository'
import type { Player } from '#/domain/recap/player'
import type { SearchPlayerResult } from '#/domain/search/player-search-result'
import type { PlayerId } from '#/domain/shared-kernel/ids'
import { PlayerFactory } from '#tests/factories/player-factory.ts'
import type { IFetcher } from './fetcher'
import { SearchPlayerRusultMapper } from './mappers/search-player-result-mapper'
import { searchPlayerByGamerTag } from './queries/search-player-by-gamertag'

export class StartggPlayerRepository implements IPlayerRepository {
  constructor(private readonly fetcher: IFetcher) {}

  /**
   * Search for players matching the gamertag. If multiple players have the same gamertag, sort them
   * by number of events attended and filter out players with no event attended
   * @param gamerTag the gamertag of the player to look for
   * @returns A promise that resolve to an array of players matching the gamertag
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

    const results =
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
          SearchPlayerRusultMapper.map({
            id: player.user.id,
            prefix: player.prefix,
            gamerTag: player.gamerTag,
            country: player.user.location?.country,
            profilePictureUrl: player.user.images?.[0]?.url,
            nbEvents: player.user.events?.pageInfo?.total,
          }),
        )
        .sort((p1, p2) => p2.nbEvents - p1.nbEvents)
        .filter((player) => player.nbEvents > 0) || []

    return Promise.resolve(results)
  }

  getPlayerRecap(playerId: PlayerId, year: Date): Promise<Player> {
    // TODO: Implement fetching player to create the model
    const player = PlayerFactory.merge({
      id: playerId
    }).make();
    return Promise.resolve(player)
  }
}
