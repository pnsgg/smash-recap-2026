import { InMemoryFetcher } from '#tests/unit/modules/shared/startgg/in_memory_fetcher'
import { describe, expect, test } from 'bun:test'
import type { ResultOf, VariablesOf } from 'gql.tada'
import { EventType } from '#recap/domain/event_type'
import { UserNotFoundError } from '#recap/model'
import { asPlayerId, asUserSlug } from '#libs/ids'
import { StartggPlayerRepository } from '#libs/startgg/player_repository'
import { getEvent } from '#libs/startgg/queries/get_event'
import { getPlayerEventIds } from '#libs/startgg/queries/get_player_event_ids'
import { getPlayerProfile } from '#libs/startgg/queries/get_player_profile'
import { getPlayerUserId } from '#libs/startgg/queries/get_player_user_id'
import { getVideogameCharacters } from '#libs/startgg/queries/get_videogame_characters'
import { searchPlayerByGamerTag } from '#libs/startgg/queries/search_player_by_gamertag'

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
          images: [{ url: 'https://images.start.gg/glutonny.jpg' }],
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
          slug: null,
          numEntrants: null,
          state: null,
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
            timezone: 'America/Los_Angeles',
            images: [{ url: 'https://images.start.gg/genesis-x.png' }],
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
              pageInfo: { totalPages: 1 },
              nodes: [
                {
                  id: 'set-1',
                  round: 3,
                  fullRoundText: 'Winners Semis',
                  bestOf: null,
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
                        initialSeedNum: 4,
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
                        initialSeedNum: 1,
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
          slug: null,
          numEntrants: null,
          state: null,
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
            timezone: 'America/Los_Angeles',
            images: [{ url: 'https://images.start.gg/genesis-x.png' }],
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
              pageInfo: { totalPages: 1 },
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
  .register(getVideogameCharacters, () => ({
    videogame: {
      characters: [
        {
          id: '1313',
          images: [
            { url: 'https://images.start.gg/wario-render.png', type: 'icon' },
            { url: 'https://images.start.gg/wario-stock.png', type: 'stockIcon' },
          ],
        },
      ],
    },
  }))
  .register(getPlayerProfile, ({ playerId }) => ({
    player:
      playerId === 'user-mkleo-id'
        ? {
            prefix: null,
            gamerTag: 'MKLeo',
            user: { images: [{ url: 'https://images.start.gg/mkleo.jpg' }] },
          }
        : null,
  }))

describe('Getting player recap — UserNotFoundError cases', () => {
  test('throws UserNotFoundError when user has no gamerTag', async () => {
    const localFetcher = new InMemoryFetcher().register(getPlayerUserId, () => ({
      user: {
        id: 'some-id',
        images: null,
        player: { id: 'some-player-id', prefix: null, gamerTag: null },
      },
    }))
    const repository = new StartggPlayerRepository(localFetcher, {})

    await expect(
      repository.getPlayerRecap(asUserSlug('user/nogamertag'), new Date('2026-01-01'), '1386' as any)
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  test('throws UserNotFoundError when user has no player id', async () => {
    const localFetcher = new InMemoryFetcher().register(getPlayerUserId, () => ({
      user: { id: 'some-id', images: null, player: { id: null, prefix: null, gamerTag: null } },
    }))
    const repository = new StartggPlayerRepository(localFetcher, {})

    await expect(
      repository.getPlayerRecap(asUserSlug('user/noplayer'), new Date('2026-01-01'), '1386' as any)
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })
})

describe('Searching for players', () => {
  const repository = new StartggPlayerRepository(fetcher, {
    eventType: 1,
  })

  test('when looking for Glutonny - it should return 3 results ordered by the number of events attended and ignore results with no events attended', async () => {
    const results = await repository.searchPlayerByGamerTag('Glutonny')

    expect(results).toHaveLength(3)
    expect(isSortedDesc(results.map((result) => result.nbEvents))).toBe(true)
    expect(results.map((result) => result.nbEvents).some((nbEvent) => nbEvent === 0)).toBe(false)
  })

  test('when looking for Licane - it should return 2 results ordered by the number of events attended and ignore results with no events attended', async () => {
    const results = await repository.searchPlayerByGamerTag('Licane')

    expect(results).toHaveLength(2)
    expect(isSortedDesc(results.map((result) => result.nbEvents))).toBe(true)
    expect(results.map((result) => result.nbEvents).some((nbEvent) => nbEvent === 0)).toBe(false)
  })

  test('Getting player recap - it should fetch player user ID, paginated events with early stop, events in parallel and map correctly', async () => {
    const year = new Date('2026-01-01')
    const { player } = await repository.getPlayerRecap(
      asUserSlug('user/glutonny'),
      year,
      // videogame ID is not filtered by this fake fetcher, any value works
      '1386' as any
    )

    expect(player.gamerTag).toBe('Glutonny')
    expect(player.prefix).toBe('Solary')

    expect(player.tournaments).toHaveLength(1)
    const tournament = player.tournaments[0]
    expect(tournament.name).toBe('Genesis X')
    expect(tournament.events).toHaveLength(2)

    const eventSingles = tournament.events.find((e: { name: string }) => e.name === 'Genesis X Singles')
    expect(eventSingles).toBeDefined()
    expect(eventSingles?.isOnline).toBe(false)
    expect(eventSingles?.sets).toHaveLength(1)
    const set = eventSingles?.sets[0]
    expect(set?.fullRoundText).toBe('Winners Semis')

    expect(set?.competitors.size).toBe(2)
    const setPlayer = set?.competitors.get(player.id)
    expect(setPlayer?.score).toBe(3)
    expect(setPlayer?.isDisqualified).toBe(false)

    const eventDoubles = tournament.events.find((e: { name: string }) => e.name === 'Genesis X Doubles')
    expect(eventDoubles).toBeDefined()
    expect(eventDoubles?.eventType).toBe(EventType.TEAMS)
    expect(eventDoubles?.isTeams()).toBe(true)
  })

  test('Getting player recap - it should carry the avatar, the tournament logos and the character pictures', async () => {
    const { player } = await repository.getPlayerRecap(
      asUserSlug('user/glutonny'),
      new Date('2026-01-01'),
      '1386' as any
    )

    expect(player.avatarUrl).toBe('https://images.start.gg/glutonny.jpg')
    expect(player.tournaments[0]?.imageUrl).toBe('https://images.start.gg/genesis-x.png')

    const characters = player.tournaments[0]!.events.flatMap((event) =>
      event.sets.flatMap((set) => set.games.flatMap((game) => game.selections.map((s) => s.character)))
    )
    expect(characters.find((c) => c.name === 'Wario')?.images).toEqual({
      renderUrl: 'https://images.start.gg/wario-render.png',
      stockIconUrl: 'https://images.start.gg/wario-stock.png',
    })
    expect(characters.find((c) => c.name === 'Byleth')?.images).toEqual({
      renderUrl: null,
      stockIconUrl: null,
    })
  })

  test('Getting player recap - a failed character pictures request still gives a recap, without pictures', async () => {
    const noPictures: typeof fetcher = Object.assign(Object.create(fetcher), {
      fetch: (document: unknown, variables: unknown) =>
        document === getVideogameCharacters
          ? Promise.reject(new Error('start.gg is down'))
          : fetcher.fetch(document as never, variables as never),
    })

    const { player } = await new StartggPlayerRepository(noPictures, {}).getPlayerRecap(
      asUserSlug('user/glutonny'),
      new Date('2026-01-01'),
      '1386' as any
    )

    expect(player.tournaments).toHaveLength(1)
    const wario = player.tournaments[0]!.events[0]!.sets[0]!.games[0]!.selections[0]!.character
    expect(wario.images).toEqual({ renderUrl: null, stockIconUrl: null })
  })

  test('Getting a player profile - it should return the tag and the avatar, or null for an unknown player', async () => {
    expect(await repository.getPlayerProfile(asPlayerId('user-mkleo-id'))).toEqual({
      prefix: null,
      gamerTag: 'MKLeo',
      avatarUrl: 'https://images.start.gg/mkleo.jpg',
    })
    expect(await repository.getPlayerProfile(asPlayerId('nobody'))).toBeNull()
  })

  test('Getting player recap - an event start.gg answers without data is skipped, not fatal', async () => {
    // start.gg returns only `errors` for an event over its 1000-object cap
    const capped: typeof fetcher = Object.assign(Object.create(fetcher), {
      fetch: (document: unknown, variables: { eventId?: string }) =>
        document === getEvent && variables.eventId === 'event-2'
          ? Promise.resolve({ data: undefined })
          : fetcher.fetch(document as never, variables as never),
    })
    const cappedRepository = new StartggPlayerRepository(capped, {})

    const { player, skippedEventCount } = await cappedRepository.getPlayerRecap(
      asUserSlug('user/glutonny'),
      new Date('2026-01-01'),
      '1386' as any
    )

    expect(player.tournaments[0]?.events).toHaveLength(1)
    expect(skippedEventCount).toBe(1)
  })
})


describe('Getting player recap — sets over several pages', () => {
  type EventData = Awaited<ReturnType<typeof fetcher.fetch<ResultOf<typeof getEvent>, VariablesOf<typeof getEvent>>>>['data']

  /**
   * Event 1 split over three pages of sets: page 1 is the fixture's set, page 2 a new set plus the
   * page-1 set again (start.gg can repeat one across pages), page 3 one more set.
   */
  const paged = (failingPage?: number) => {
    const requestedPages: number[] = []
    const client: typeof fetcher = Object.assign(Object.create(fetcher), {
      fetch: async (document: unknown, variables: VariablesOf<typeof getEvent>) => {
        if (document !== getEvent || variables.eventId !== 'event-1') {
          return fetcher.fetch(document as never, variables as never)
        }
        requestedPages.push(variables.setsPage)
        if (variables.setsPage === failingPage) return { data: undefined }

        const { data } = (await fetcher.fetch(getEvent, { ...variables, setsPage: 1 })) as { data: EventData }
        const event = data.event!
        const sets = event.userEntrant!.paginatedSets!
        const first = sets.nodes![0]!
        const nodes =
          variables.setsPage === 1
            ? [first]
            : variables.setsPage === 2
              ? [{ ...first, id: 'set-2' }, first]
              : [{ ...first, id: 'set-3' }]
        return {
          data: {
            event: {
              ...event,
              userEntrant: { ...event.userEntrant!, paginatedSets: { pageInfo: { totalPages: 3 }, nodes } },
            },
          },
        }
      },
    })
    return { client, requestedPages }
  }

  test('fetches the later pages of an event with more than one page, and counts each set once', async () => {
    const { client, requestedPages } = paged()

    const { player, skippedEventCount } = await new StartggPlayerRepository(client, {}).getPlayerRecap(
      asUserSlug('user/glutonny'),
      new Date('2026-01-01'),
      '1386' as any
    )

    const singles = player.tournaments[0]!.events.find((e) => e.name === 'Genesis X Singles')
    expect(singles?.sets.map((set) => String(set.id)).sort()).toEqual(['set-1', 'set-2', 'set-3'])
    expect(requestedPages.sort()).toEqual([1, 2, 3])
    expect(skippedEventCount).toBe(0)
  })

  test('an event with a single page of sets costs one request', async () => {
    const requested: Array<{ eventId: string; setsPage: number }> = []
    const client: typeof fetcher = Object.assign(Object.create(fetcher), {
      fetch: (document: unknown, variables: VariablesOf<typeof getEvent>) => {
        if (document === getEvent) requested.push({ eventId: variables.eventId, setsPage: variables.setsPage })
        return fetcher.fetch(document as never, variables as never)
      },
    })

    await new StartggPlayerRepository(client, {}).getPlayerRecap(
      asUserSlug('user/glutonny'),
      new Date('2026-01-01'),
      '1386' as any
    )

    expect(requested.filter((r) => r.eventId === 'event-1')).toEqual([{ eventId: 'event-1', setsPage: 1 }])
  })

  test('a later page start.gg answers without data skips the whole event instead of keeping part of its sets', async () => {
    const { client } = paged(3)

    const { player, skippedEventCount } = await new StartggPlayerRepository(client, {}).getPlayerRecap(
      asUserSlug('user/glutonny'),
      new Date('2026-01-01'),
      '1386' as any
    )

    expect(player.tournaments[0]!.events.map((e) => e.name)).toEqual(['Genesis X Doubles'])
    expect(skippedEventCount).toBe(1)
  })
})
