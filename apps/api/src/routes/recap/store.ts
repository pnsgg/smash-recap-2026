import type { UserSlug, VideogameId } from '#libs/ids'
import { presentPlayerRecap, presentTournamentOrganizerRecap } from '#recap/presenter'
import type { PlayerRecapService, TournamentOrganizerRecapService } from '#recap/service'

export interface CacheClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, ex: 'EX', seconds: number) => Promise<'OK' | null>
}

export type PlayerRecap = ReturnType<typeof presentPlayerRecap>
export type TournamentOrganizerRecap = ReturnType<typeof presentTournamentOrganizerRecap>

export const RECAP_TTL_SECONDS = 24 * 60 * 60

const CACHE_READ_TIMEOUT_MS = 500

export class RecapStore {
  constructor(
    private readonly cache: CacheClient,
    private readonly players: PlayerRecapService,
    private readonly organizers: TournamentOrganizerRecapService
  ) {}

  player(slug: UserSlug, year: number, videogameId: VideogameId): Promise<PlayerRecap> {
    return this.cached(`recap:player:${year}:${videogameId}:${slug}`, async () => {
      const { player, skippedEventCount, nemesisProfile, rivalProfile } = await this.players.getRecap(
        slug,
        new Date(year, 0, 1),
        videogameId
      )
      return presentPlayerRecap(player, skippedEventCount, nemesisProfile, rivalProfile)
    })
  }

  tournamentOrganizer(slug: UserSlug, year: number): Promise<TournamentOrganizerRecap> {
    return this.cached(`recap:organizer:${year}:${slug}`, async () =>
      presentTournamentOrganizerRecap(await this.organizers.getRecap(slug, new Date(year, 0, 1)))
    )
  }

  private async cached<T>(key: string, compute: () => Promise<T>): Promise<T> {
    const hit = await Promise.race([
      this.cache.get(key).catch(() => null),
      Bun.sleep(CACHE_READ_TIMEOUT_MS).then(() => null),
    ])
    if (hit !== null) return JSON.parse(hit) as T

    const value = await compute()
    this.cache.set(key, JSON.stringify(value), 'EX', RECAP_TTL_SECONDS).catch(() => null)
    return value
  }
}
