import { FakeTournamentOrganizerRecapService } from '#tests/fakes/modules/recap/fake_tournament_organizer_recap_service'
import { describe, expect, test } from 'bun:test'
import { createRecapModule } from '#recap/index'

describe('Tournament Organizer Recap', () => {
  test.each([
    { slug: '3d2f6e89' }, // Maskime
    { slug: 'e3a5b49b' }, // Clembs
    { slug: '1a10dc59' }, // Zang-Fu
  ])('get tournament organizer recap by slug ($slug)', async ({ slug }) => {
    const app = createRecapModule(undefined, new FakeTournamentOrganizerRecapService())

    const response = await app.handle(
      new Request(`http://localhost/tournament-organizers/${slug}/recap`)
    )

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(body).toMatchObject({ id: slug })
  })
})
