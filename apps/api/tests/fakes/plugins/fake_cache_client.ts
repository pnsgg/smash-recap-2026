import type { CacheClient } from '#recap/store'

interface Entry {
  value: string
  expiresAt: number
}

export class FakeCacheClient implements CacheClient {
  private readonly store = new Map<string, Entry>()

  async get(key: string) {
    const entry = this.store.get(key)
    if (!entry || entry.expiresAt <= Date.now()) return null
    return entry.value
  }

  async set(key: string, value: string, _ex: 'EX', seconds: number) {
    this.store.set(key, { value, expiresAt: Date.now() + seconds * 1000 })
    return 'OK' as const
  }

  readonly sets = new Map<string, Set<string>>()

  async sadd(key: string, member: string) {
    const set = this.sets.get(key) ?? new Set<string>()
    const added = set.has(member) ? 0 : 1
    set.add(member)
    this.sets.set(key, set)
    return added
  }
}
