import { redis, type RedisClient } from 'bun'
import type { KeyCounter } from '#stats/domain/ports/key_counter'

export class RedisKeyCounter implements KeyCounter {
  constructor(private readonly client: RedisClient = redis) {}

  // SCAN walks the keyspace without blocking Redis the way KEYS would.
  async keys(pattern: string) {
    let cursor = '0'
    const found: string[] = []
    do {
      const [next, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 1000)
      cursor = next
      found.push(...keys)
    } while (cursor !== '0')
    return found
  }

  add(key: string, members: string[]) {
    return members.length > 0 ? this.client.sadd(key, ...members) : Promise.resolve(0)
  }

  size(key: string) {
    return this.client.scard(key)
  }
}
