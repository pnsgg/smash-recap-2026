import { test } from '@japa/runner'

test.group('Tournament Organizer Recap', () => {
  test('get tournament organizer recap by slug ({ slug })')
    .with([
      { slug: '3d2f6e89' }, // Maskime
      { slug: 'e3a5b49b' }, // Clembs
      { slug: '1a10dc59' }, // Zang-Fu
    ])
    .run(async ({ client }, { slug }) => {
      const response = await client.get(`/api/v1/tournament-organizers/${slug}/recap`)

      response.assertStatus(200)
      response.assertBodyContains({
        data: {
          id: slug,
        },
      })
    })
    .timeout(60000) // Start.gg API can be slow
})
