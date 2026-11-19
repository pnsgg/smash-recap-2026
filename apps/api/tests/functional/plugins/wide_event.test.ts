import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { Elysia } from 'elysia'
import { type LogLevel, logger } from '#libs/logger'
import { annotate, append, increment, wideEventPlugin } from '#plugins/wide_event'
import { createRecapModule } from '#recap/index'
import { FakePlayerRecapService, LICANE_DATA } from '#tests/fakes/modules/recap/fake_player_recap_service'
import { FakeCacheClient } from '#tests/fakes/plugins/fake_cache_client'
import { asUserSlug } from '#libs/ids'
import { UserNotFoundError } from '#recap/domain/user_not_found_error'

type Line = { level: LogLevel; event: Record<string, any> }

let lines: Line[] = []
let restore: ReturnType<typeof logger.useSink>

beforeEach(() => {
  lines = []
  restore = logger.useSink((level, line) => lines.push({ level, event: JSON.parse(line) }))
})
afterEach(() => logger.useSink(restore))

const settle = () => Bun.sleep(5)

const deepWork = async () => {
  await Bun.sleep(1)
  increment('startgg', 'request_count')
  increment('startgg', 'request_count')
  append('recap', 'skipped_events', { event_id: '1' })
}

class PlayersWithUnknownSlug extends FakePlayerRecapService {
  override getRecap(...args: Parameters<FakePlayerRecapService['getRecap']>) {
    if (args[0] === 'unknown-slug') return Promise.reject(new UserNotFoundError(asUserSlug('unknown-slug')))
    return super.getRecap(...args)
  }
}

const app = new Elysia({ normalize: 'typebox' })
  .use(wideEventPlugin)
  .get('/health', () => ({ status: 'ok' }))
  .get('/work/:id', async ({ params }) => {
    annotate({ player: { id: params.id } })
    await deepWork()
    annotate({ player: { gamer_tag: 'Licane' } })
    return { ok: true }
  })
  .get('/static/:name', ({ params, status }) => {
    annotate({ http: { kind: 'static' } })
    return params.name === 'missing.png' ? status(404, 'Not found') : 'file'
  })
  .get('/crash', () => {
    throw new Error('boom')
  })
  .use(createRecapModule(new PlayersWithUnknownSlug(), undefined, new FakeCacheClient()))

describe('Wide event', () => {
  test('emits one event per request, with context added anywhere below the handler', async () => {
    const response = await app.handle(new Request('http://localhost/work/42?videogameId=1', { headers: { 'user-agent': 'test' } }))
    await settle()

    expect(lines).toHaveLength(1)
    const [{ level, event }] = lines
    expect(level).toBe('info')
    expect(event).toMatchObject({
      outcome: 'success',
      http: { method: 'GET', path: '/work/42', route: '/work/:id', status_code: 200, query: { videogameId: '1' }, user_agent: 'test' },
      player: { id: '42', gamer_tag: 'Licane' },
      startgg: { request_count: 2 },
      recap: { skipped_events: [{ event_id: '1' }], skipped_events_count: 1 },
    })
    expect(typeof event.duration_ms).toBe('number')
    expect(event.request_id).toBe(response.headers.get('x-request-id'))
  })

  test('keeps concurrent requests apart', async () => {
    await Promise.all(['1', '2', '3'].map((id) => app.handle(new Request(`http://localhost/work/${id}`))))
    await settle()

    expect(lines.map((l) => l.event.player.id).sort()).toEqual(['1', '2', '3'])
    expect(lines.every((l) => l.event.startgg.request_count === 2)).toBe(true)
    expect(new Set(lines.map((l) => l.event.request_id)).size).toBe(3)
  })

  test('reuses a valid incoming request id and replaces an invalid one', async () => {
    const kept = await app.handle(new Request('http://localhost/work/1', { headers: { 'x-request-id': 'edge-abc123' } }))
    const replaced = await app.handle(new Request('http://localhost/work/1', { headers: { 'x-request-id': 'bad id\n' } }))
    await settle()

    expect(kept.headers.get('x-request-id')).toBe('edge-abc123')
    expect(replaced.headers.get('x-request-id')).not.toBe('bad id\n')
    expect(lines.map((l) => l.event.request_id)).toEqual(['edge-abc123', replaced.headers.get('x-request-id')])
  })

  test('logs crashes at error level with the stack', async () => {
    const response = await app.handle(new Request('http://localhost/crash'))
    await settle()

    expect(response.status).toBe(500)
    expect(lines).toHaveLength(1)
    expect(lines[0].level).toBe('error')
    expect(lines[0].event).toMatchObject({ outcome: 'error', http: { status_code: 500, route: '/crash' }, error: { type: 'Error', message: 'boom' } })
    expect(lines[0].event.error.stack).toContain('boom')
  })

  test('logs expected failures at info level without a stack', async () => {
    const response = await app.handle(new Request('http://localhost/work/1', { method: 'POST' }))
    await settle()

    expect(response.status).toBe(404)
    expect(lines[0].level).toBe('info')
    expect(lines[0].event).toMatchObject({ outcome: 'error', http: { status_code: 404 } })
    expect(lines[0].event.error.stack).toBeUndefined()
  })

  test('skips successful health checks', async () => {
    await app.handle(new Request('http://localhost/health'))
    await settle()

    expect(lines).toHaveLength(0)
  })

  test('skips static files unless they fail', async () => {
    await app.handle(new Request('http://localhost/static/logo.png'))
    await app.handle(new Request('http://localhost/static/missing.png'))
    await settle()

    expect(lines.map((l) => [l.event.http.path, l.event.http.status_code])).toEqual([['/static/missing.png', 404]])
  })

  test('records the recap, the player and the cache outcome', async () => {
    await app.handle(new Request('http://localhost/players/541f04fd/recap'))
    await app.handle(new Request('http://localhost/players/541f04fd/recap'))
    await settle()

    const [miss, hit] = lines.map((l) => l.event)
    expect(miss).toMatchObject({
      recap: { kind: 'player', slug: '541f04fd', videogame_id: '1386' },
      player: { id: LICANE_DATA.id, gamer_tag: LICANE_DATA.gamerTag },
      cache: { outcome: 'miss', read: 'ok' },
    })
    expect(typeof miss.recap.compute_ms).toBe('number')
    expect(hit).toMatchObject({ cache: { outcome: 'hit' }, player: { id: LICANE_DATA.id } })
  })

  test('records a not-found player as an expected failure', async () => {
    const response = await app.handle(new Request('http://localhost/players/unknown-slug/recap'))
    await settle()

    expect(response.status).toBe(404)
    expect(lines[0].level).toBe('info')
    expect(lines[0].event).toMatchObject({
      http: { status_code: 404, route: '/players/:slug/recap' },
      error: { type: 'UserNotFoundError' },
    })
  })
})
