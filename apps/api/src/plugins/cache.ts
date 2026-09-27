import { redis } from 'bun'
import { Elysia } from 'elysia'

export interface CacheClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, ex: 'EX', seconds: number) => Promise<'OK' | null>
}

const DEFAULT_TTL_SECONDS = 10 * 60 // 10 minutes

export const cache = (client: CacheClient = redis, ttlSeconds: number = DEFAULT_TTL_SECONDS) =>
  new Elysia({ name: 'cache' })
    .onBeforeHandle({ as: 'scoped' }, async ({ request }) => {
      const cached = await client.get(request.url)
      if (cached !== null) return JSON.parse(cached)
    })
    .onAfterHandle({ as: 'scoped' }, async ({ request, responseValue }) => {
      await client.set(request.url, JSON.stringify(responseValue), 'EX', ttlSeconds)
    })
