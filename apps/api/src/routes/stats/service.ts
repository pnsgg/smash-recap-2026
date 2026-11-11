import { env } from '#env'
import { RedisKeyCounter } from '#libs/redis/key_counter'
import { recapKey } from '#recap/store'
import type { KeyCounter } from '#stats/domain/ports/key_counter'
import type { StatsResponse } from '#stats/model'

/**
 * How many recaps exist: over the whole season (every distinct recap served, kept in a set that never
 * expires), and in the cache right now (computed within the last RECAP_TTL_SECONDS). Every cached recap
 * belongs to the season too, so the cached ones are added to its set before it is counted: the season
 * total can never fall below the cached one, and recaps cached before the set existed are not missed.
 */
export class StatsService {
  constructor(
    private readonly counter: KeyCounter,
    private readonly year: number
  ) {}

  async recapCounts(): Promise<StatsResponse> {
    const [players, organizers] = await Promise.all([
      this.tally(recapKey.allPlayers(this.year), recapKey.seasonPlayers(this.year)),
      this.tally(recapKey.allOrganizers(this.year), recapKey.seasonOrganizers(this.year)),
    ])
    return {
      season: { players: players.season, organizers: organizers.season },
      cached: { players: players.cached, organizers: organizers.cached },
    }
  }

  /** One kind of recap: the cached ones, then the season's set once they are in it. Never throws. */
  private async tally(cachedPattern: string, seasonKey: string) {
    const cached = await this.counter.keys(cachedPattern).catch(() => [])
    await this.counter.add(seasonKey, cached).catch(() => null)
    const season = await this.counter.size(seasonKey).catch(() => cached.length)
    return { cached: cached.length, season: Math.max(season, cached.length) }
  }
}

export const statsService = new StatsService(new RedisKeyCounter(), env.RECAP_YEAR)
