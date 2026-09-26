import type { Player } from '#recap/domain/player'
import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import { UserNotFoundError } from '#recap/domain/user_not_found_error'
import { SearchPlayerResult } from '#search/domain/player_search_result'
import { asPlayerId } from '#shared/ids'
import type { UserSlug, VideogameId } from '#shared/ids'
import {
  mapEmptyPlayer,
  mapPlayerRecap,
} from '#shared/startgg/mappers/player_recap_mapper'
import type { EventResult } from '#shared/startgg/mappers/player_recap_mapper'
import { mapSearchPlayerResult } from '#shared/startgg/mappers/search_player_result_mapper'
import { getEvent } from '#shared/startgg/queries/get_event'
import { getPlayerEventIds } from '#shared/startgg/queries/get_player_event_ids'
import { getPlayerUserId } from '#shared/startgg/queries/get_player_user_id'
import { searchPlayerByGamerTag } from '#shared/startgg/queries/search_player_by_gamertag'
import type { StartggClientInterface } from '#shared/startgg/client'

type StartggPlayerRepositoryConfig = {
  eventType?: number
}

export class StartggPlayerRepository implements PlayerRepository {
  constructor(
    private readonly fetcher: StartggClientInterface,
    private readonly config: StartggPlayerRepositoryConfig
  ) {}

  /**
   * Search for players matching the gamertag.
   * @param gamerTag the gamertag of the player to look for
   * @returns A promise that resolves to an array of players matching the gamertag
   */
  async searchPlayerByGamerTag(gamerTag: string): Promise<SearchPlayerResult[]> {
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
            player
          ): player is typeof player & {
            id: string | number
            gamerTag: string
          } => player?.id !== undefined && player.gamerTag !== null
        )
        .map((player) =>
          mapSearchPlayerResult({
            id: player.id,
            slug: player.user?.slug,
            prefix: player.prefix,
            gamerTag: player.gamerTag,
            country: player.user?.location?.country,
            profilePictureUrl: player.user?.images?.[0]?.url,
            nbEvents: player.user?.events?.pageInfo?.total,
          })
        ) ?? []

    return SearchPlayerResult.rankResults(rawResults)
  }

  /**
   * Fetches the player's yearly recap stats by their start.gg user slug.
   * Runs in 3 phases:
   * - Phase 0: Resolves user ID and metadata from the slug.
   * - Phase 1: Gathers all event IDs attended by the user for the target year.
   * - Phase 2: Fetches full dataset for each event.
   *
   * @param slug The start.gg user slug of the player (e.g. "user/abc123")
   * @param year The target year for the recap
   * @returns A promise that resolves to the hydrated Player domain entity
   */
  async getPlayerRecap(slug: UserSlug, year: Date, videoGameId: VideogameId): Promise<Player> {
    // Phase 0 — resolve slug → user.id + player header
    const { data } = await this.fetcher.fetch(getPlayerUserId, {
      slug,
    })

    const user = data.user
    if (!user || !user.id) {
      throw new UserNotFoundError(slug)
    }

    const userId = user.id
    const gamerTag = user.player?.gamerTag || ''
    const prefix = user.player?.prefix || null

    const playerGlobalId = user.player?.id
    if (!playerGlobalId) {
      throw new UserNotFoundError(slug)
    }
    const playerId = asPlayerId(playerGlobalId.toString())

    // Phase 1 — collect event IDs for the year (sequential pagination, early stop)
    const eventIds = await this.fetchEventIdsForYear(slug, year, videoGameId)
    if (eventIds.length === 0) {
      return mapEmptyPlayer(playerId, { gamerTag, prefix })
    }

    // Phase 2 — fetch full event data
    const eventsResponses = await Promise.all(
      eventIds.map((eventId) => this.fetcher.fetch(getEvent, { eventId, userId }))
    )

    const rawEvents = eventsResponses
      .map((r) => r.data.event)
      .filter((e): e is EventResult => e !== null)

    return mapPlayerRecap(playerId, { gamerTag, prefix }, rawEvents)
  }

  /**
   * Helper that paginates through the player's events on start.gg, collecting IDs
   * that belong to the target year. Stops paginating early as soon as it encounters
   * events from an older year.
   *
   * @param slug The start.gg user slug
   * @param year The target year
   * @returns A promise resolving to an array of event IDs
   */
  private async fetchEventIdsForYear(
    slug: UserSlug,
    year: Date,
    videoGameId: VideogameId
  ): Promise<string[]> {
    const targetYear = year.getFullYear()
    const ids: string[] = []
    let page = 1

    for (;;) {
      const { data } = await this.fetcher.fetch(getPlayerEventIds, {
        slug,
        page,
        videogameIds: [videoGameId],
        eventType: this.config.eventType,
      })

      const events = data.user?.events
      if (!events || !events.nodes || events.nodes.length === 0) {
        break
      }

      const nodes = events.nodes
      const totalPages = events.pageInfo?.totalPages || 1

      for (const node of nodes) {
        if (!node) continue
        const eventYear = new Date((node.startAt as number) * 1000).getFullYear()
        if (eventYear === targetYear && node.id) {
          ids.push(node.id.toString())
        }
      }

      const hasOldEvents = nodes.some((n) => {
        if (!n) return false
        return new Date((n.startAt as number) * 1000).getFullYear() < targetYear
      })

      if (hasOldEvents || page >= totalPages) {
        break
      }

      page++
    }

    return ids
  }
}
