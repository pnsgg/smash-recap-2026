import {
  FakePlayerRecapService,
  LICANE_DATA,
  ROUXCHOV_DATA,
} from '#tests/fakes/recap/fake_player_recap_service'
import { test } from '@japa/runner'
import PlayerRecapService from '#recap/application/player_recap_service'
import PlayerRecapController from '#recap/infrastructure/primary/player_recap_controller'
import { asVideogameId } from '#shared/domain/ids'

test.group('Player Recap', () => {
  test('get player recap by slug ({ slug })')
    .with([
      { slug: '541f04fd', expected: LICANE_DATA }, // Licane
      { slug: '89723908', expected: ROUXCHOV_DATA }, // RouxChov
    ])
    .run(async ({ client, swap }, { slug, expected }) => {
      swap(PlayerRecapService, () => new FakePlayerRecapService())

      const response = await client.get(`/api/v1/players/${slug}/recap`)

      response.assertStatus(200)
      response.assertBodyContains({
        data: {
          id: expected.id,
          gamerTag: expected.gamerTag,
          prefix: expected.prefix,
        },
      })
    })

  test('uses default videogameId when missing from query params', async ({
    client,
    assert,
    swap,
  }) => {
    const fakeService = new FakePlayerRecapService()
    swap(PlayerRecapService, () => fakeService)

    const response = await client.get('/api/v1/players/541f04fd/recap')

    response.assertStatus(200)
    assert.equal(fakeService.lastVideogameId, PlayerRecapController.DEFAULT_VIDEOGAME_ID)
  })

  test('uses custom videogameId when provided in query params', async ({
    client,
    assert,
    swap,
  }) => {
    const fakeService = new FakePlayerRecapService()
    swap(PlayerRecapService, () => fakeService)

    const meleeVideogameId = asVideogameId('1') // Melee
    const response = await client
      .get('/api/v1/players/541f04fd/recap')
      .qs({ videogameId: meleeVideogameId })

    response.assertStatus(200)
    assert.equal(fakeService.lastVideogameId, meleeVideogameId)
  })
})
