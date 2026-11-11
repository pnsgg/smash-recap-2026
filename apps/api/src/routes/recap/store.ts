import type { UserSlug, VideogameId } from '#libs/ids'
import { presentPlayerRecap, presentTournamentOrganizerRecap } from '#recap/presenter'
import type { PlayerRecapService, TournamentOrganizerRecapService } from '#recap/service'

export interface CacheClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, ex: 'EX', seconds: number) => Promise<'OK' | null>
  sadd: (key: string, member: string) => Promise<number>
}

export type PlayerRecap = ReturnType<typeof presentPlayerRecap>
export type TournamentOrganizerRecap = ReturnType<typeof presentTournamentOrganizerRecap>

export const RECAP_TTL_SECONDS = 24 * 60 * 60

/** Where each recap lives in the cache, and the patterns matching a whole season of them. */
export const recapKey = {
  player: (year: number, videogameId: VideogameId, slug: UserSlug) => `recap:player:${year}:${videogameId}:${slug}`,
  organizer: (year: number, slug: UserSlug) => `recap:organizer:${year}:${slug}`,
  allPlayers: (year: number) => `recap:player:${year}:*`,
  allOrganizers: (year: number) => `recap:organizer:${year}:*`,
  /**
   * Every distinct recap served this season, by kind. Sets that never expire: a recap joins the first
   * time it is served (computed or read from the cache) and stays after its cached copy expires.
   */
  seasonPlayers: (year: number) => `stats:${year}:recaps:player`,
  seasonOrganizers: (year: number) => `stats:${year}:recaps:organizer`,
}

const CACHE_READ_TIMEOUT_MS = 500

export class RecapStore {
  constructor(
    private readonly cache: CacheClient,
    private readonly players: PlayerRecapService,
    private readonly organizers: TournamentOrganizerRecapService
  ) {}

  player(slug: UserSlug, year: number, videogameId: VideogameId): Promise<PlayerRecap> {
    return this.cached(recapKey.player(year, videogameId, slug), recapKey.seasonPlayers(year), async () => {
      const { player, skippedEventCount, nemesisProfile, rivalProfile, upsetOpponentProfile, rankings } =
        await this.players.getRecap(slug, new Date(year, 0, 1), videogameId)
      return presentPlayerRecap(player, skippedEventCount, nemesisProfile, rivalProfile, upsetOpponentProfile, rankings)
    })
  }

  tournamentOrganizer(slug: UserSlug, year: number): Promise<TournamentOrganizerRecap> {
    return this.cached(recapKey.organizer(year, slug), recapKey.seasonOrganizers(year), async () =>
      presentTournamentOrganizerRecap(await this.organizers.getRecap(slug, new Date(year, 0, 1)))
    )
  }

  /** The cached recap, or a fresh one cached for next time. Either way it joins the season's set. */
  private async cached<T>(key: string, season: string, compute: () => Promise<T>): Promise<T> {
    const hit = await Promise.race([
      this.cache.get(key).catch(() => null),
      Bun.sleep(CACHE_READ_TIMEOUT_MS).then(() => null),
    ])
    if (hit !== null) {
      this.cache.sadd(season, key).catch(() => null)
      return JSON.parse(hit) as T
    }

    const value = await compute()
    this.cache.set(key, JSON.stringify(value), 'EX', RECAP_TTL_SECONDS).catch(() => null)
    this.cache.sadd(season, key).catch(() => null)
    return value
  }
}
