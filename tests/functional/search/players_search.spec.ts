import { mock } from 'node:test'
import { test } from '@japa/runner'

test.group('Players search', (group) => {
  group.each.teardown(() => {
    mock.restoreAll()
  })

  test('search for a player by gamertag', async ({ client }) => {
    const mockResponseData = {
      data: {
        players: {
          nodes: [
            {
              id: 123,
              gamerTag: 'Glutonny',
              prefix: 'Solary',
              user: {
                slug: 'user/glutonny',
                location: { country: 'France' },
                images: [{ url: 'http://image.url' }],
                events: { pageInfo: { total: 100 } },
              },
            },
          ],
        },
      },
    }

    const mockFetch = mock.fn(async () => ({
      ok: true,
      json: async () => mockResponseData,
    }))
    mock.method(global, 'fetch', mockFetch)

    const response = await client.get('/api/v1/players/search?gamertag=Glutonny')

    response.assertStatus(404)
    response.assertBodyContains([
      {
        id: '123',
        slug: 'user/glutonny',
        prefix: 'Solary',
        gamerTag: 'Glutonny',
        country: 'France',
        profilePictureUrl: 'http://image.url',
        nbEvents: 100,
      },
    ])
  })

  test('fails when gamertag is missing', async ({ client }) => {
    const response = await client.get('/api/v1/players/search')

    response.assertStatus(422)
  })
})
