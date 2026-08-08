import type { Player } from '#/domain/recap/player'
import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { SearchPlayerResult } from '#/domain/search/player-search-result'

export interface IPlayerRepository {
  /**
   * Search for a player given a gamertag
   * @param gamerTag The gamer tag of the player to fetch
   * @returns A promise that resolves to a list of players matching the given gamerTag
   */
  searchPlayerByGamerTag: (gamerTag: string) => Promise<SearchPlayerResult[]>

  /**
   * Fetches a player by their slug and makes their recap for the given year
   * @param slug The start.gg user slug of the player (e.g. "user/abc123")
   * @param year The year of the recap to generate
   * @returns A promise that resolves to the player
   */
  getPlayerRecap: (slug: UserSlug, year: Date) => Promise<Player>
}
