import type { Player } from '#recap/domain/player'
import type { PlayerProfile } from '#recap/domain/player_profile'
import type { SearchPlayerResult } from '#search/domain/player_search_result'
import type { PlayerId, UserSlug, VideogameId } from '#libs/ids'

export interface PlayerRepository {
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
  getPlayerRecap: (
    slug: UserSlug,
    year: Date,
    videoGameId: VideogameId
  ) => Promise<{ player: Player; skippedEventCount: number }>

  /**
   * Fetches another player's name and picture, e.g. to show who a nemesis is
   * @param playerId The start.gg player ID
   * @returns A promise that resolves to the profile, or null if start.gg doesn't know the player
   */
  getPlayerProfile: (playerId: PlayerId) => Promise<PlayerProfile | null>
}
