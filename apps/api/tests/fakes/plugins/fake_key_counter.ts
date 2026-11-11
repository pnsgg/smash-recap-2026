import type { KeyCounter } from '#stats/domain/ports/key_counter'

/** Fixed keys, matched against Redis-style patterns where `*` matches anything, and sets that grow. */
export class FakeKeyCounter implements KeyCounter {
  private readonly sets: Map<string, Set<string>>

  constructor(
    private readonly cachedKeys: string[],
    sets: Record<string, string[]> = {}
  ) {
    this.sets = new Map(Object.entries(sets).map(([key, members]) => [key, new Set(members)]))
  }

  async keys(pattern: string) {
    const regex = new RegExp(`^${pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`)
    return this.cachedKeys.filter((key) => regex.test(key))
  }

  async add(key: string, members: string[]) {
    const set = this.sets.get(key) ?? new Set<string>()
    for (const member of members) set.add(member)
    this.sets.set(key, set)
    return members.length
  }

  async size(key: string) {
    return this.sets.get(key)?.size ?? 0
  }
}
