import { FakeTournamentOrganizerRecapService } from '#tests/fakes/recap/fake_tournament_organizer_recap_service'
import { test } from '@japa/runner'
import TournamentOrganizerRecapService from '#recap/application/tournament_organizer_recap_service'

test.group('Tournament Organizer Recap', () => {
  test('get tournament organizer recap by slug ({ slug })')
    .with([
      { slug: '3d2f6e89' }, // Maskime
      { slug: 'e3a5b49b' }, // Clembs
      { slug: '1a10dc59' }, // Zang-Fu
    ])
    .run(async ({ client, swap }, { slug }) => {
      swap(TournamentOrganizerRecapService, () => new FakeTournamentOrganizerRecapService())

      const response = await client.get(`/api/v1/tournament-organizers/${slug}/recap`)

      response.assertStatus(200)
      response.assertBodyContains({
        data: {
          id: slug,
        },
      })
    })
})
