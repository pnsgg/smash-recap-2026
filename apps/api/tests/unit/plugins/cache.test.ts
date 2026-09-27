import { describe, expect, test } from 'bun:test'
import { Elysia } from 'elysia'
import { cache } from '#plugins/cache'
import { FakeCacheClient } from '#tests/fakes/plugins/fake_cache_client'

const createApp = (ttlSeconds?: number) => {
  let calls = 0
  const app = new Elysia()
    .use(cache(new FakeCacheClient(), ttlSeconds))
    .get('/thing', () => {
      calls += 1
      return { calls }
    })
  return { app, getCalls: () => calls }
}

describe('cache plugin', () => {
  test('serves an identical second request from cache without re-invoking the handler', async () => {
    const { app, getCalls } = createApp()

    const first = await app.handle(new Request('http://localhost/thing'))
    const second = await app.handle(new Request('http://localhost/thing'))

    expect(await first.json()).toEqual({ calls: 1 })
    expect(await second.json()).toEqual({ calls: 1 })
    expect(getCalls()).toBe(1)
  })

  test('does not serve a different query string or path from cache', async () => {
    const { app, getCalls } = createApp()

    await app.handle(new Request('http://localhost/thing'))
    const different = await app.handle(new Request('http://localhost/thing?foo=bar'))

    expect(await different.json()).toEqual({ calls: 2 })
    expect(getCalls()).toBe(2)
  })

  test('re-invokes the handler once the TTL has elapsed', async () => {
    const { app, getCalls } = createApp(0.01)

    await app.handle(new Request('http://localhost/thing'))
    await new Promise((resolve) => setTimeout(resolve, 20))
    const afterTtl = await app.handle(new Request('http://localhost/thing'))

    expect(await afterTtl.json()).toEqual({ calls: 2 })
    expect(getCalls()).toBe(2)
  })
})
