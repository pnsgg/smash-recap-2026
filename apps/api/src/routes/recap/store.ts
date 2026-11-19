import type { UserSlug, VideogameId } from '#libs/ids'
import { presentPlayerRecap, presentTournamentOrganizerRecap } from '#recap/presenter'
import type { PlayerRecapService, TournamentOrganizerRecapService } from '#recap/service'
import { annotate } from '#plugins/wide_event'

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

/**
 * A cached player recap made before `setRecord`, `bestFinishes` (with `ultrankTier`) and `mostBeaten` existed is
 * computed again.
 */
const isCurrentPlayerRecap = (recap: PlayerRecap) =>
  'setRecord' in recap &&
  'mostBeaten' in recap &&
  Array.isArray(recap.bestFinishes) &&
  recap.bestFinishes.every((finish) => 'ultrankTier' in finish)

export class RecapStore {
  constructor(
    private readonly cache: CacheClient,
    private readonly players: PlayerRecapService,
    private readonly organizers: TournamentOrganizerRecapService
  ) {}

  async player(slug: UserSlug, year: number, videogameId: VideogameId): Promise<PlayerRecap> {
    annotate({ recap: { kind: 'player', slug, year, videogame_id: videogameId } })
    const recap = await this.cached(recapKey.player(year, videogameId, slug), recapKey.seasonPlayers(year), isCurrentPlayerRecap, async () => {
      const { player, skippedEventCount, nemesisProfile, rivalProfile, upsetOpponentProfile, rankings } =
        await this.players.getRecap(slug, new Date(year, 0, 1), videogameId)
      return presentPlayerRecap(player, skippedEventCount, nemesisProfile, rivalProfile, upsetOpponentProfile, rankings)
    })
    annotate({
      player: {
        id: recap.id,
        gamer_tag: recap.gamerTag,
        tournament_count: recap.totalTournaments,
        set_count: recap.totalSets,
        skipped_event_count: recap.skippedEventCount,
      },
    })
    return recap
  }

  async tournamentOrganizer(slug: UserSlug, year: number): Promise<TournamentOrganizerRecap> {
    annotate({ recap: { kind: 'organizer', slug, year } })
    const recap = await this.cached(recapKey.organizer(year, slug), recapKey.seasonOrganizers(year), () => true, async () =>
      presentTournamentOrganizerRecap(await this.organizers.getRecap(slug, new Date(year, 0, 1)))
    )
    annotate({ organizer: { id: recap.id, gamer_tag: recap.gamerTag, tournament_count: recap.totalTournaments } })
    return recap
  }

  /** The cached recap, or a fresh one cached for next time. Either way it joins the season's set. */
  private async cached<T>(
    key: string,
    season: string,
    isCurrent: (value: T) => boolean,
    compute: () => Promise<T>
  ): Promise<T> {
    const readStarted = performance.now()
    let read: 'ok' | 'error' | 'timeout' = 'ok'
    const hit = await Promise.race([
      this.cache.get(key).catch((error: unknown) => {
        read = 'error'
        annotate({ cache: { read_error: error } })
        return null
      }),
      Bun.sleep(CACHE_READ_TIMEOUT_MS).then(() => {
        read = 'timeout'
        return null
      }),
    ])
    const cachedValue = hit === null ? null : (JSON.parse(hit) as T)
    const outcome = cachedValue === null ? 'miss' : isCurrent(cachedValue) ? 'hit' : 'stale'
    annotate({ cache: { key, outcome, read, read_ms: Math.round(performance.now() - readStarted) } })
    if (outcome === 'hit') {
      this.cache.sadd(season, key).catch(() => null)
      return cachedValue as T
    }

    const computeStarted = performance.now()
    const value = await compute()
    annotate({ recap: { compute_ms: Math.round(performance.now() - computeStarted) } })
    this.cache.set(key, JSON.stringify(value), 'EX', RECAP_TTL_SECONDS).catch(() => null)
    this.cache.sadd(season, key).catch(() => null)
    return value
  }
}
