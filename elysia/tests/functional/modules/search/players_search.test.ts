import { FakePlayersSearchService } from '#tests/fakes/modules/search/fake_players_search_service'
import { describe, expect, test } from 'bun:test'
import { createSearchModule } from '#search/index'

describe('Players search', () => {
  test('search for a player by gamertag', async () => {
    const app = createSearchModule(new FakePlayersSearchService())

    const response = await app.handle(
      new Request('http://localhost/players/search?gamertag=Licane')
    )

    expect(response.status).toBe(200)

    const body = (await response.json()) as Record<string, unknown>[]
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)

    const firstResult = body[0]
    expect(firstResult).toHaveProperty('id')
    expect(firstResult).toHaveProperty('slug')
    expect(firstResult).toHaveProperty('gamerTag')
  })

  test('fails when gamertag is missing', async () => {
    const app = createSearchModule(new FakePlayersSearchService())

    const response = await app.handle(new Request('http://localhost/players/search'))

    expect(response.status).toBe(422)
  })
})
