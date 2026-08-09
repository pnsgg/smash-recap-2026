import { StartggPlayerRepository } from '#/infrastructure/secondary/startgg/player-repository'
import { searchPlayerByGamerTag } from '#/infrastructure/secondary/startgg/queries/search-player-by-gamertag'
import { getPlayerUserId } from '#/infrastructure/secondary/startgg/queries/get-player-user-id'
import { getPlayerEventIds } from '#/infrastructure/secondary/startgg/queries/get-player-event-ids'
import { getEvent } from '#/infrastructure/secondary/startgg/queries/get-event'
import { InMemoryFetcher } from '#tests/infrastructure/secondary/startgg/in-memory-fetcher'
import { asUserSlug } from '#/domain/shared-kernel/ids'
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

const fetcher = new InMemoryFetcher()
  .register(searchPlayerByGamerTag, ({ query }) => {
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
  })
  .register(getPlayerUserId, ({ slug }) => {
    if (slug === 'user/glutonny') {
      return {
        user: {
          id: 'user-glutonny-id',
          player: {
            id: 'user-glutonny-id',
            prefix: 'Solary',
            gamerTag: 'Glutonny',
          },
        },
      }
    }
    return {
      user: null,
    }
  })
  .register(getPlayerEventIds, ({ slug, page }) => {
    if (slug === 'user/glutonny') {
      if (page === 1) {
        return {
          user: {
            events: {
              pageInfo: { totalPages: 2 },
              nodes: [
                { id: 'event-1', startAt: 1785276620 },
                { id: 'event-2', startAt: 1785276620 },
              ],
            },
          },
        }
      } else if (page === 2) {
        return {
          user: {
            events: {
              pageInfo: { totalPages: 2 },
              nodes: [{ id: 'event-3', startAt: 1735689600 }],
            },
          },
        }
      }
    }
    return {
      user: {
        events: {
          pageInfo: { totalPages: 1 },
          nodes: [],
        },
      },
    }
  })
  .register(getEvent, ({ eventId }) => {
    if (eventId === 'event-1') {
      return {
        event: {
          id: 'event-1',
          name: 'Genesis X Singles',
          isOnline: false,
          type: 2,
          videogame: { id: '1386', name: 'Super Smash Bros. Ultimate' },
          tournament: {
            id: 'tourney-1',
            name: 'Genesis X',
            startAt: 1785276620,
            city: 'San Jose',
            addrState: 'CA',
            countryCode: 'US',
            lat: 37.3382,
            lng: -121.8863,
          },
          userEntrant: {
            id: '1001',
            name: 'Glutonny',
            phaseGroups: [
              {
                bracketType: 'DOUBLE_ELIMINATION' as const,
              },
            ],
            isOnline: false,
            isDisqualified: false,
            initialSeedNum: 4,
            players: [{ id: 'user-glutonny-id' }],
            standing: { placement: 3 },
            paginatedSets: {
              nodes: [
                {
                  id: 'set-1',
                  round: 3,
                  fullRoundText: 'Winners Semis',
                  completedAt: 1785276620,
                  winnerId: 1001,
                  phaseGroup: {
                    bracketType: 'DOUBLE_ELIMINATION' as const,
                  },
                  slots: [
                    {
                      entrant: {
                        id: '1001',
                        name: 'Glutonny',
                        isDisqualified: false,
                        players: [{ id: 'user-glutonny-id' }],
                        standing: { placement: 3 },
                      },
                      seed: { seedNum: 4 },
                      standing: { stats: { score: { value: 3 } } },
                    },
                    {
                      entrant: {
                        id: '1002',
                        name: 'MKLeo',
                        isDisqualified: false,
                        players: [{ id: 'user-mkleo-id' }],
                        standing: { placement: 5 },
                      },
                      seed: { seedNum: 1 },
                      standing: { stats: { score: { value: 1 } } },
                    },
                  ],
                  games: [
                    {
                      id: 'game-1',
                      orderNum: 1,
                      winnerId: 1001,
                      stage: { id: 'stage-battlefield', name: 'Battlefield' },
                      selections: [
                        {
                          entrant: { id: '1001' },
                          character: { id: '1313', name: 'Wario' },
                          selectionType: 'CHARACTER' as const,
                        },
                        {
                          entrant: { id: '1002' },
                          character: { id: '1275', name: 'Byleth' },
                          selectionType: 'CHARACTER' as const,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          entrants: {
            nodes: [
              {
                id: '1001',
                isDisqualified: false,
                initialSeedNum: 4,
                players: [{ id: 'user-glutonny-id' }],
                standing: { placement: 3 },
              },
              {
                id: '1002',
                isDisqualified: false,
                initialSeedNum: 1,
                players: [{ id: 'user-mkleo-id' }],
                standing: { placement: 5 },
              },
            ],
          },
        },
      }
    }

    if (eventId === 'event-2') {
      return {
        event: {
          id: 'event-2',
          name: 'Genesis X Doubles',
          isOnline: false,
          type: 2,
          videogame: { id: '1386', name: 'Super Smash Bros. Ultimate' },
          tournament: {
            id: 'tourney-1',
            name: 'Genesis X',
            startAt: 1785276620,
            city: 'San Jose',
            addrState: 'CA',
            countryCode: 'US',
            lat: 37.3382,
            lng: -121.8863,
          },
          userEntrant: {
            id: '1003',
            name: 'Glutonny & Partner',
            phaseGroups: [
              {
                bracketType: 'DOUBLE_ELIMINATION' as const,
              },
            ],
            isOnline: false,
            isDisqualified: false,
            initialSeedNum: 2,
            players: [{ id: 'user-glutonny-id' }],
            standing: { placement: 1 },
            paginatedSets: {
              nodes: [],
            },
          },
          entrants: {
            nodes: [
              {
                id: '1003',
                isDisqualified: false,
                initialSeedNum: 2,
                players: [{ id: 'user-glutonny-id' }],
                standing: { placement: 1 },
              },
            ],
          },
        },
      }
    }

    return { event: null }
  })

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

  describe('Getting player recap', () => {
    test('it should fetch player user ID, paginated events with early stop, events in parallel and map correctly', async () => {
      const year = new Date('2026-01-01')
      const player = await repository.getPlayerRecap(
        asUserSlug('user/glutonny'),
        year,
      )

      expect(player.gamerTag).toBe('Glutonny')
      expect(player.prefix).toBe('Solary')

      expect(player.tournaments.length).toBe(1)
      const tournament = player.tournaments[0]
      expect(tournament.name).toBe('Genesis X')
      expect(tournament.events.length).toBe(2)

      const eventSingles = tournament.events.find(
        (e) => e.name === 'Genesis X Singles',
      )
      expect(eventSingles).toBeDefined()
      expect(eventSingles?.isOnline).toBe(false)
      expect(eventSingles?.sets.length).toBe(1)
      const set = eventSingles?.sets[0]
      expect(set?.fullRoundText).toBe('Winners Semis')

      expect(set?.competitors.size).toBe(2)
      const setPlayer = set?.competitors.get(player.id)
      expect(setPlayer?.score).toBe(3)
      expect(setPlayer?.isDisqualified).toBe(false)
    })
  })
})
