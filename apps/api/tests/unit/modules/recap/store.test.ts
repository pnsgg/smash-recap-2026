import { describe, expect, test } from 'bun:test'
import { asUserSlug, asVideogameId } from '#libs/ids'
import { UserNotFoundError } from '#recap/model'
import { RecapStore, RECAP_TTL_SECONDS, type CacheClient } from '#recap/store'
import { FakePlayerRecapService } from '#tests/fakes/modules/recap/fake_player_recap_service'
import { FakeTournamentOrganizerRecapService } from '#tests/fakes/modules/recap/fake_tournament_organizer_recap_service'
import { FakeCacheClient } from '#tests/fakes/plugins/fake_cache_client'

const ULTIMATE = asVideogameId('1386')

class CountingPlayerService extends FakePlayerRecapService {
  calls = 0
  override async getRecap(...args: Parameters<FakePlayerRecapService['getRecap']>) {
    this.calls += 1
    return super.getRecap(...args)
  }
}

const createStore = (cache: CacheClient = new FakeCacheClient()) => {
  const players = new CountingPlayerService()
  const store = new RecapStore(cache, players, new FakeTournamentOrganizerRecapService())
  return { store, players }
}

describe('RecapStore', () => {
  test('computes a recap once and serves the next request from the cache', async () => {
    const { store, players } = createStore()

    const first = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)
    await Bun.sleep(1) // the cache write is not awaited by the first request
    const second = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)

    expect(second).toEqual(first)
    expect(players.calls).toBe(1)
  })

  test('keeps recaps for a day, one entry per account, year and game', async () => {
    const writes: { key: string; seconds: number }[] = []
    const cache: CacheClient = {
      get: async () => null,
      set: async (key, _value, _ex, seconds) => {
        writes.push({ key, seconds })
        return 'OK'
      },
    }
    const { store } = createStore(cache)

    await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)
    await store.tournamentOrganizer(asUserSlug('541f04fd'), 2026)

    expect(writes).toEqual([
      { key: 'recap:player:2026:1386:541f04fd', seconds: RECAP_TTL_SECONDS },
      { key: 'recap:organizer:2026:541f04fd', seconds: RECAP_TTL_SECONDS },
    ])
    expect(RECAP_TTL_SECONDS).toBe(24 * 60 * 60)
  })

  test('does not cache an unknown account', async () => {
    const cache = new FakeCacheClient()
    const players = new (class extends FakePlayerRecapService {
      override async getRecap(): Promise<never> {
        throw new UserNotFoundError('user/00000000')
      }
    })()
    const store = new RecapStore(cache, players, new FakeTournamentOrganizerRecapService())

    await expect(store.player(asUserSlug('00000000'), 2026, ULTIMATE)).rejects.toBeInstanceOf(UserNotFoundError)
    expect(await cache.get('recap:player:2026:1386:00000000')).toBeNull()
  })

  test('computes anyway when the cache does not answer', async () => {
    const silent: CacheClient = {
      get: () => new Promise(() => {}),
      set: () => new Promise(() => {}),
    }
    const { store, players } = createStore(silent)

    const recap = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)

    expect(recap.gamerTag).toBe('Licane')
    expect(players.calls).toBe(1)
  })
})
