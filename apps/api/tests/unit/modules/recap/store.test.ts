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

  test('computes again a cached player recap made before its newest fields existed', async () => {
    const cache = new FakeCacheClient()
    const { store, players } = createStore(cache)
    const fresh = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)
    await Bun.sleep(1)
    const { setRecord: _, bestFinishes: __, mostBeaten: ___, ...stale } = fresh
    await cache.set('recap:player:2026:1386:541f04fd', JSON.stringify(stale), 'EX', RECAP_TTL_SECONDS)

    const served = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)

    expect(served).toEqual(fresh)
    expect(players.calls).toBe(2)
  })

  test('computes again a cached player recap whose best finishes have no UltRank tier', async () => {
    const cache = new FakeCacheClient()
    const { store, players } = createStore(cache)
    const fresh = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)
    await Bun.sleep(1)
    // A finish as cached before the tier existed.
    const finish = { tournamentName: 'KAGARIBI#15', tournamentImageUrl: null, eventName: 'Singles', placement: 1, entrants: 300, topShare: 1 / 300, wins: [] }
    const stale = { ...fresh, bestFinishes: [finish] }
    await cache.set('recap:player:2026:1386:541f04fd', JSON.stringify(stale), 'EX', RECAP_TTL_SECONDS)

    await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)

    expect(players.calls).toBe(2)
  })

  test('keeps recaps for a day, one entry per account, year and game', async () => {
    const writes: { key: string; seconds: number }[] = []
    const cache: CacheClient = {
      get: async () => null,
      set: async (key, _value, _ex, seconds) => {
        writes.push({ key, seconds })
        return 'OK'
      },
      sadd: async () => 1,
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

  test('adds each recap served to its season set once, whether computed or read from the cache', async () => {
    const cache = new FakeCacheClient()
    const { store } = createStore(cache)

    await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)
    await Bun.sleep(1)
    await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)
    await store.player(asUserSlug('541f04fd'), 2026, asVideogameId('1'))
    await store.tournamentOrganizer(asUserSlug('541f04fd'), 2026)

    expect([...(cache.sets.get('stats:2026:recaps:player') ?? [])]).toEqual([
      'recap:player:2026:1386:541f04fd',
      'recap:player:2026:1:541f04fd',
    ])
    expect([...(cache.sets.get('stats:2026:recaps:organizer') ?? [])]).toEqual(['recap:organizer:2026:541f04fd'])
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
      sadd: () => new Promise(() => {}),
    }
    const { store, players } = createStore(silent)

    const recap = await store.player(asUserSlug('541f04fd'), 2026, ULTIMATE)

    expect(recap.gamerTag).toBe('Licane')
    expect(players.calls).toBe(1)
  })
})
