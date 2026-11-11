/** What the stats need from the cache: its keys, and sets that remember them. */
export interface KeyCounter {
  /** Keys matching a pattern, where `*` matches anything. */
  keys: (pattern: string) => Promise<string[]>
  /** Adds members to a set. */
  add: (key: string, members: string[]) => Promise<unknown>
  /** How many members a set has. */
  size: (key: string) => Promise<number>
}
