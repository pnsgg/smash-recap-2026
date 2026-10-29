import { describe, expect, test } from 'bun:test'
import { createRecapModule } from '#recap/index'
import { FakePlayerRecapService, LICANE_DATA } from '#tests/fakes/modules/recap/fake_player_recap_service'
import { FakeTournamentOrganizerRecapService } from '#tests/fakes/modules/recap/fake_tournament_organizer_recap_service'
import { FakeCacheClient } from '#tests/fakes/plugins/fake_cache_client'

describe('Recap summaries', () => {
  test('player summary returns the name and headline numbers only', async () => {
    const app = createRecapModule(new FakePlayerRecapService(), undefined, new FakeCacheClient())

    const response = await app.handle(new Request('http://localhost/players/541f04fd/summary'))

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(['gamerTag', 'id', 'prefix', 'totalSets', 'totalTournaments'])
    expect(body).toMatchObject({ id: LICANE_DATA.id, prefix: LICANE_DATA.prefix, gamerTag: LICANE_DATA.gamerTag })
    expect(typeof body.totalSets).toBe('number')
  })

  test('tournament organizer summary returns the name and tournament count', async () => {
    const app = createRecapModule(undefined, new FakeTournamentOrganizerRecapService(), new FakeCacheClient())

    const response = await app.handle(new Request('http://localhost/tournament-organizers/541f04fd/summary'))

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(['gamerTag', 'id', 'totalTournaments'])
    expect(body.gamerTag).toBe('Licane')
  })

  test('the summary reads the recap the full endpoint cached, without computing again', async () => {
    let calls = 0
    const service = new (class extends FakePlayerRecapService {
      override async getRecap(...args: Parameters<FakePlayerRecapService['getRecap']>) {
        calls += 1
        return super.getRecap(...args)
      }
    })()
    const app = createRecapModule(service, undefined, new FakeCacheClient())

    await app.handle(new Request('http://localhost/players/541f04fd/recap'))
    await Bun.sleep(1)
    const response = await app.handle(new Request('http://localhost/players/541f04fd/summary'))

    expect(response.status).toBe(200)
    expect(calls).toBe(1)
  })
})

