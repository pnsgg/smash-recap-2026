import { InMemoryFetcher } from '#tests/unit/shared/infrastructure/secondary/startgg/in_memory_fetcher'
import { test } from '@japa/runner'
import { EventType } from '#recap/domain/event_type'
import { asUserSlug } from '#shared/domain/ids'
import { StartggPlayerRepository } from '#shared/infrastructure/secondary/startgg/player_repository'
import { getEvent } from '#shared/infrastructure/secondary/startgg/queries/get_event'
import { getPlayerEventIds } from '#shared/infrastructure/secondary/startgg/queries/get_player_event_ids'
import { getPlayerUserId } from '#shared/infrastructure/secondary/startgg/queries/get_player_user_id'
import { searchPlayerByGamerTag } from '#shared/infrastructure/secondary/startgg/queries/search_player_by_gamertag'

const isSortedDesc = <T>(array: T[]): boolean =>
  array.every((value, index, elements) => !index || elements[index - 1] >= value)

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
  } & Partial<PlayerNode>
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
          phases: [
            {
              phaseOrder: 1,
              phaseGroups: {
                nodes: [
                  {
                    id: 'phase-group-1',
                    bracketType: 'DOUBLE_ELIMINATION' as const,
                  },
                ],
              },
            },
          ],
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
                          participant: null,
                          selectionType: 'CHARACTER' as const,
                        },
                        {
                          entrant: { id: '1002' },
                          character: { id: '1275', name: 'Byleth' },
                          participant: null,
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
          phases: [
            {
              phaseOrder: 1,
              phaseGroups: {
                nodes: [
                  {
                    id: 'phase-group-2-swiss',
                    bracketType: 'SWISS' as const,
                  },
                ],
              },
            },
            {
              phaseOrder: 2,
              phaseGroups: {
                nodes: [
                  {
                    id: 'phase-group-2-de',
                    bracketType: 'DOUBLE_ELIMINATION' as const,
                  },
                ],
              },
            },
          ],
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

test.group('Searching for players', () => {
  const repository = new StartggPlayerRepository(fetcher, {
    videogameIds: [1386],
    eventType: 1,
  })

  test('when looking for Glutonny - it should return 3 results ordered by the number of events attended and ignore results with no events attended', async ({
    assert,
  }) => {
    const results = await repository.searchPlayerByGamerTag('Glutonny')

    assert.equal(results.length, 3)
    assert.equal(isSortedDesc(results.map((result) => result.nbEvents)), true)
    assert.equal(
      results.map((result) => result.nbEvents).some((nbEvent) => nbEvent === 0),
      false
    )
  })

  test('when looking for Licane - it should return 2 results ordered by the number of events attended and ignore results with no events attended', async ({
    assert,
  }) => {
    const results = await repository.searchPlayerByGamerTag('Licane')

    assert.equal(results.length, 2)
    assert.equal(isSortedDesc(results.map((result) => result.nbEvents)), true)
    assert.equal(
      results.map((result) => result.nbEvents).some((nbEvent) => nbEvent === 0),
      false
    )
  })

  test('Getting player recap - it should fetch player user ID, paginated events with early stop, events in parallel and map correctly', async ({
    assert,
  }) => {
    const year = new Date('2026-01-01')
    const player = await repository.getPlayerRecap(asUserSlug('user/glutonny'), year)

    assert.equal(player.gamerTag, 'Glutonny')
    assert.equal(player.prefix, 'Solary')

    assert.equal(player.tournaments.length, 1)
    const tournament = player.tournaments[0]
    assert.equal(tournament.name, 'Genesis X')
    assert.equal(tournament.events.length, 2)

    const eventSingles = tournament.events.find((e) => e.name === 'Genesis X Singles')
    assert.isDefined(eventSingles)
    assert.equal(eventSingles?.isOnline, false)
    assert.equal(eventSingles?.sets.length, 1)
    const set = eventSingles?.sets[0]
    assert.equal(set?.fullRoundText, 'Winners Semis')

    assert.equal(set?.competitors.size, 2)
    const setPlayer = set?.competitors.get(player.id)
    assert.equal(setPlayer?.score, 3)
    assert.equal(setPlayer?.isDisqualified, false)

    const eventDoubles = tournament.events.find((e) => e.name === 'Genesis X Doubles')
    assert.isDefined(eventDoubles)
    assert.equal(eventDoubles?.eventType, EventType.TEAMS)
    assert.equal(eventDoubles?.isTeams(), true)
  })
})
