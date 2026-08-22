import type { IPlayerRepository } from '#/domain/ports/player-repository'
import type { Player } from '#/domain/recap/player'
import { SearchPlayerResult } from '#/domain/search/player-search-result'
import { asPlayerId } from '#/domain/shared-kernel/ids'
import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { IStartggClient } from './startgg-client'
import { mapSearchPlayerResult } from './mappers/search-player-result-mapper'
import { searchPlayerByGamerTag } from './queries/search-player-by-gamertag'
import { getPlayerUserId } from './queries/get-player-user-id'
import { getPlayerEventIds } from './queries/get-player-event-ids'
import { getEvent } from './queries/get-event'
import { mapPlayerRecap, mapEmptyPlayer } from './mappers/player-recap-mapper'
import type { EventResult } from './mappers/player-recap-mapper'

type StartggPlayerRepositoryConfig = {
  videogameIds: number[]
  eventType?: number
}

export class StartggPlayerRepository implements IPlayerRepository {
  constructor(
    private readonly fetcher: IStartggClient,
    private readonly config: StartggPlayerRepositoryConfig,
  ) {}

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
            id: string | number
            gamerTag: string
          } => player?.id !== undefined && player.gamerTag !== null,
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
          }),
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
  async getPlayerRecap(slug: UserSlug, year: Date): Promise<Player> {
    // Phase 0 — resolve slug → user.id + player header
    const { data } = await this.fetcher.fetch(getPlayerUserId, {
      slug,
    })

    const user = data.user
    if (!user || !user.id) {
      throw new Error(`User not found for slug: ${slug}`)
    }

    const userId = user.id
    const gamerTag = user.player?.gamerTag || ''
    const prefix = user.player?.prefix || null

    const playerGlobalId = user.player?.id
    if (!playerGlobalId) {
      throw new Error(`Player ID not found for user slug: ${slug}`)
    }
    const playerId = asPlayerId(playerGlobalId.toString())

    // Phase 1 — collect event IDs for the year (sequential pagination, early stop)
    const eventIds = await this.fetchEventIdsForYear(slug, year)
    if (eventIds.length === 0) {
      return mapEmptyPlayer(playerId, { gamerTag, prefix })
    }

    // Phase 2 — fetch full event data
    const eventsResponses = await Promise.all(
      eventIds.map((eventId) =>
        this.fetcher.fetch(getEvent, { eventId, userId }),
      ),
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
  ): Promise<string[]> {
    const targetYear = year.getFullYear()
    const ids: string[] = []
    let page = 1

    for (;;) {
      const { data } = await this.fetcher.fetch(getPlayerEventIds, {
        slug,
        page,
        videogameIds: this.config.videogameIds.map((id) => id.toString()),
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
        const eventYear = new Date(
          (node.startAt as number) * 1000,
        ).getFullYear()
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
