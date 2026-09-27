import {
  FakePlayerRecapService,
  LICANE_DATA,
  ROUXCHOV_DATA,
} from '#tests/fakes/modules/recap/fake_player_recap_service'
import { describe, expect, test } from 'bun:test'
import { createRecapModule } from '#recap/index'
import { asVideogameId } from '#shared/ids'
import { FakeCacheClient } from '#tests/fakes/plugins/fake_cache_client'

describe('Player Recap', () => {
  test.each([
    { slug: '541f04fd', expected: LICANE_DATA },
    { slug: '89723908', expected: ROUXCHOV_DATA },
  ])('get player recap by slug ($slug)', async ({ slug, expected }) => {
    const app = createRecapModule(
      new FakePlayerRecapService(),
      undefined,
      new FakeCacheClient()
    )

    const response = await app.handle(new Request(`http://localhost/players/${slug}/recap`))

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(body).toMatchObject({
      id: expected.id,
      gamerTag: expected.gamerTag,
      prefix: expected.prefix,
    })
  })

  test('uses default videogameId when missing from query params', async () => {
    const fakeService = new FakePlayerRecapService()
    const app = createRecapModule(fakeService, undefined, new FakeCacheClient())

    const response = await app.handle(new Request('http://localhost/players/541f04fd/recap'))

    expect(response.status).toBe(200)
    expect(fakeService.lastVideogameId).toBe(asVideogameId('1386'))
  })

  test('uses custom videogameId when provided in query params', async () => {
    const fakeService = new FakePlayerRecapService()
    const app = createRecapModule(fakeService, undefined, new FakeCacheClient())

    const meleeVideogameId = asVideogameId('1') // Melee
    const response = await app.handle(
      new Request(`http://localhost/players/541f04fd/recap?videogameId=${meleeVideogameId}`)
    )

    expect(response.status).toBe(200)
    expect(fakeService.lastVideogameId).toBe(meleeVideogameId)
  })
})
