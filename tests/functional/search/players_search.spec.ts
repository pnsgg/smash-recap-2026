import { test } from '@japa/runner'

test.group('Players search', () => {
  test('search for a player by gamertag', async ({ client, assert }) => {
    const response = await client.get('/api/v1/players/search').qs({ gamertag: 'Licane' })

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body)
    assert.isTrue(body.length > 0, 'Expected to find at least one player')

    const firstResult = body[0]
    assert.property(firstResult, 'id')
    assert.property(firstResult, 'slug')
    assert.property(firstResult, 'gamerTag')
  }).timeout(30000)

  test('fails when gamertag is missing', async ({ client }) => {
    const response = await client.get('/api/v1/players/search')

    response.assertStatus(422)
  })
})
