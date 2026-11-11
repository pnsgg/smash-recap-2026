import { describe, expect, test } from 'bun:test'
import { createStatsModule } from '#stats/index'
import { StatsService } from '#stats/service'
import { FakeKeyCounter } from '#tests/fakes/plugins/fake_key_counter'

const stats = async (keys: string[], sets: Record<string, string[]> = {}) => {
  const app = createStatsModule(new StatsService(new FakeKeyCounter(keys, sets), 2026))
  const response = await app.handle(new Request('http://localhost/stats'))
  expect(response.status).toBe(200)
  return (await response.json()) as Record<string, unknown>
}

describe('Stats', () => {
  test('counts nothing in an empty cache', async () => {
    expect(await stats([])).toEqual({
      season: { players: 0, organizers: 0 },
      cached: { players: 0, organizers: 0 },
    })
  })

  test('counts this season’s cached recaps by kind', async () => {
    const body = await stats([
      'recap:player:2026:1386:user/541f04fd',
      'recap:player:2026:1:user/541f04fd',
      'recap:player:2026:1386:user/830dec1e',
      'recap:organizer:2026:user/3d2f6e89',
      'recap:player:2025:1386:user/541f04fd',
      'recap:organizer:2025:user/3d2f6e89',
    ])
    expect(body.cached).toEqual({ players: 3, organizers: 1 })
  })

  test('counts the season’s recaps, including those no longer cached', async () => {
    const body = await stats(['recap:player:2026:1386:user/541f04fd'], {
      'stats:2026:recaps:player': ['recap:player:2026:1386:user/541f04fd', 'recap:player:2026:1386:user/830dec1e'],
      'stats:2026:recaps:organizer': ['recap:organizer:2026:user/3d2f6e89'],
      'stats:2025:recaps:player': ['recap:player:2025:1386:user/541f04fd'],
    })
    expect(body).toEqual({
      season: { players: 2, organizers: 1 },
      cached: { players: 1, organizers: 0 },
    })
  })

  test('counts recaps cached before the season set had them', async () => {
    const body = await stats(
      ['recap:player:2026:1386:user/541f04fd', 'recap:player:2026:1386:user/830dec1e'],
      { 'stats:2026:recaps:player': ['recap:player:2026:1386:user/541f04fd', 'recap:player:2026:1:user/541f04fd'] }
    )
    expect(body).toEqual({
      season: { players: 3, organizers: 0 },
      cached: { players: 2, organizers: 0 },
    })
  })
})
