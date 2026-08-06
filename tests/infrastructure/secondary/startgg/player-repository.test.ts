import { StartggPlayerRepository } from '#/infrastructure/secondary/startgg/player-repository'
import { searchPlayerByGamerTag } from '#/infrastructure/secondary/startgg/queries/search-player-by-gamertag'
import { InMemoryFetcher } from '#tests/infrastructure/secondary/startgg/in-memory-fetcher'
import { describe, expect, test } from 'vitest'

const isSortedDesc = <T>(array: T[]): boolean =>
  array.every(
    (value, index, elements) => !index || elements[index - 1] >= value,
  )

/** Minimal shape of a player node returned by the searchPlayerByGamerTag query */
type PlayerNode = {
  id: string
  prefix: string | null
  gamerTag: string
  user: {
    slug: string
    location: { country: string } | null
    images: { url: string }[]
    events: { pageInfo: { total: number } }
  }
}

const makePlayer = (
  overrides: {
    id: string
    gamerTag: string
    nbEvents: number
    slug?: string
  } & Partial<PlayerNode>,
): PlayerNode => ({
  id: overrides.id,
  prefix: null,
  gamerTag: overrides.gamerTag,
  user: {
    slug: overrides.slug ?? `user/${overrides.id}`,
    location: null,
    images: [],
    events: { pageInfo: { total: overrides.nbEvents } },
  },
})

const fetcher = new InMemoryFetcher().register(
  searchPlayerByGamerTag,
  ({ query }) => {
    const gamerTag = query.filter?.gamerTag as string | undefined

    const fixturesByGamerTag: Record<string, PlayerNode[]> = {
      Glutonny: [
        makePlayer({ id: '1', gamerTag: 'Glutonny', nbEvents: 312 }),
        makePlayer({ id: '2', gamerTag: 'Glutonny', nbEvents: 5 }),
        makePlayer({ id: '3', gamerTag: 'Glutonny', nbEvents: 1 }),
        makePlayer({ id: '4', gamerTag: 'Glutonny', nbEvents: 0 }),
      ],
      Licane: [
        makePlayer({ id: '10', gamerTag: 'Licane', nbEvents: 88 }),
        makePlayer({ id: '11', gamerTag: 'Licane', nbEvents: 14 }),
        makePlayer({ id: '12', gamerTag: 'Licane', nbEvents: 0 }),
      ],
    }

    return {
      players: {
        nodes: fixturesByGamerTag[gamerTag ?? ''] ?? [],
      },
    }
  },
)

describe('Searching for players', () => {
  const repository = new StartggPlayerRepository(fetcher, {
    videogameIds: [1386],
    eventType: 1,
  })

  describe("when looking for 'Glutonny'", () => {
    test('it should return 3 results ordered by the number of events attended and ignore results with no events attended', async () => {
      const results = await repository.searchPlayerByGamerTag('Glutonny')

      expect(results.length).toBe(3)
      expect(isSortedDesc(results.map((result) => result.nbEvents))).toBe(true)
      expect(
        results
          .map((result) => result.nbEvents)
          .some((nbEvent) => nbEvent === 0),
      ).toBe(false)
    })
  })

  describe("when looking for 'Licane'", () => {
    test('it should return 2 results ordered by the number of events attended and ignore results with no events attended', async () => {
      const results = await repository.searchPlayerByGamerTag('Licane')

      expect(results.length).toBe(2)
      expect(isSortedDesc(results.map((result) => result.nbEvents))).toBe(true)
      expect(
        results
          .map((result) => result.nbEvents)
          .some((nbEvent) => nbEvent === 0),
      ).toBe(false)
    })
  })
})
