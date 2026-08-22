import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { EventType } from '#recap/domain/event_type'
import { asPlayerId } from '#shared/domain/ids'
import {
  mapEmptyPlayer,
  mapPlayerRecap,
} from '#shared/infrastructure/secondary/startgg/mappers/player_recap_mapper'
import type { EventResult } from '#shared/infrastructure/secondary/startgg/mappers/player_recap_mapper'

test.group('PlayerRecapMapper' + ' - ' + 'throws validation errors on missing properties', () => {
  const playerId = asPlayerId('player-123')
  const playerHeader = {
    gamerTag: 'Rouxchov',
    prefix: 'PNS',
  }
  test('mapEmptyPlayer initializes player with empty tournaments list', ({ assert }) => {
    const result = mapEmptyPlayer(playerId, playerHeader)
    assert.equal(result.id, playerId)
    assert.equal(result.gamerTag, 'Rouxchov')
    assert.equal(result.prefix, 'PNS')
    assert.lengthOf(result.tournaments, 0)
  })
  test('successfully maps valid player events payload with sets, games, and selections', ({
    assert,
  }) => {
    const rawEvents: EventResult[] = [
      {
        id: 'event-1',
        name: 'Ultimate Singles',
        type: 1,
        isOnline: false,
        videogame: {
          id: '1386',
          name: 'Super Smash Bros. Ultimate',
        },
        phases: [
          {
            phaseOrder: 1,
            phaseGroups: {
              nodes: [
                {
                  id: null,
                  bracketType: 'DOUBLE_ELIMINATION',
                },
              ],
            },
          },
        ],
        tournament: {
          id: 'tournament-1',
          name: 'PNS BloomBagarre',
          lat: 43.6,
          lng: 1.433333,
          city: 'Toulouse',
          addrState: 'Occitanie',
          countryCode: 'FR',
          startAt: 1783188000,
        },
        userEntrant: {
          id: 'entrant-1',
          name: 'PNS | Rouxchov',
          isDisqualified: false,
          initialSeedNum: 10,
          players: [{ id: 'player-123' }],
          standing: {
            placement: 9,
          },
          paginatedSets: {
            nodes: [
              {
                id: 'set-1',
                winnerId: 22253157,
                round: 2,
                fullRoundText: 'Winners Round 2',
                completedAt: 1785278000,
                phaseGroup: {
                  bracketType: 'DOUBLE_ELIMINATION',
                },
                slots: [
                  {
                    entrant: {
                      id: '22253157',
                      name: 'Dapoce',
                      isDisqualified: false,
                      players: [
                        {
                          id: '3739330',
                        },
                      ],
                      standing: {
                        placement: 17,
                      },
                    },
                    seed: {
                      seedNum: 19,
                    },
                    standing: {
                      stats: {
                        score: {
                          value: 2,
                        },
                      },
                    },
                  },
                  {
                    entrant: {
                      id: 'entrant-1',
                      name: 'PNS | Rouxchov',
                      isDisqualified: false,
                      players: [
                        {
                          id: 'player-123',
                        },
                      ],
                      standing: {
                        placement: 9,
                      },
                    },
                    seed: {
                      seedNum: 10,
                    },
                    standing: {
                      stats: {
                        score: {
                          value: 1,
                        },
                      },
                    },
                  },
                ],
                games: [
                  {
                    id: 'game-1',
                    orderNum: 1,
                    winnerId: 22253157,
                    stage: {
                      id: '378',
                      name: 'Pokémon Stadium 2',
                    },
                    selections: [
                      {
                        entrant: {
                          id: '22253157',
                        },
                        character: {
                          id: '1337',
                          name: 'Wolf',
                        },
                        participant: {
                          player: {
                            id: '3739330',
                          },
                        },
                        selectionType: 'CHARACTER',
                      },
                      {
                        entrant: {
                          id: 'entrant-1',
                        },
                        character: {
                          id: '1530',
                          name: 'Banjo-Kazooie',
                        },
                        participant: null,
                        selectionType: 'CHARACTER',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    ]

    const result = mapPlayerRecap(playerId, playerHeader, rawEvents)

    assert.equal(result.id, playerId)
    assert.lengthOf(result.tournaments, 1)

    const tournament = result.tournaments[0]
    assert.equal(tournament.id, 'tournament-1')
    assert.equal(tournament.name, 'PNS BloomBagarre')
    assert.equal(tournament.address?.city, 'Toulouse')
    assert.equal(tournament.address?.state, 'Occitanie')
    assert.equal(tournament.address?.countryCode, 'FR')
    assert.equal(tournament.address?.latitude, 43.6)
    assert.equal(tournament.address?.longitude, 1.433333)

    const event = tournament.events[0]
    assert.equal(event.id, 'event-1')
    assert.equal(event.name, 'Ultimate Singles')
    assert.equal(event.eventType, EventType.SINGLES)
    assert.equal(event.lastBracketType, BracketType.DOUBLE_ELIMINATION)
    assert.lengthOf(event.participants, 2)

    const set = event.sets[0]
    assert.equal(set.id, 'set-1')
    assert.equal(set.round, 2)
    assert.equal(set.fullRoundText, 'Winners Round 2')
    assert.equal(set.winnerId, '3739330')
    assert.equal(set.bracketType, BracketType.DOUBLE_ELIMINATION)
    assert.lengthOf(set.games, 1)

    const game = set.games[0]
    assert.equal(game.id, 'game-1')
    assert.equal(game.orderNum, 1)
    assert.equal(game.winnerId, '3739330')
    assert.equal(game.stage?.name, 'Pokémon Stadium 2')
    assert.lengthOf(game.selections, 2)

    const sel1 = game.selections[0]
    assert.equal(sel1.playerId, '3739330')
    assert.equal(sel1.character.name, 'Wolf')

    const sel2 = game.selections[1]
    assert.equal(sel2.playerId, playerId)
    assert.equal(sel2.character.name, 'Banjo-Kazooie')
  })
  test('successfully maps Teams events payload', ({ assert }) => {
    const rawEvents: EventResult[] = [
      {
        id: 'event-2',
        name: 'Ultimate Teams',
        type: 5,
        isOnline: true,
        videogame: { id: '1386', name: 'Super Smash Bros. Ultimate' },
        phases: [
          {
            phaseOrder: 1,
            phaseGroups: {
              nodes: [
                {
                  id: null,
                  bracketType: 'DOUBLE_ELIMINATION',
                },
              ],
            },
          },
        ],
        tournament: {
          id: 'tournament-1',
          name: 'PNS BloomBagarre',
          lat: null,
          lng: null,
          city: null,
          addrState: null,
          countryCode: null,
          startAt: 1783188000,
        },
        userEntrant: {
          id: 'entrant-1',
          name: 'PNS | Rouxchov',
          isDisqualified: false,
          initialSeedNum: 1,
          standing: { placement: 1 },
          players: [{ id: 'player-123' }],
          paginatedSets: null,
        },
      },
    ]

    const result = mapPlayerRecap(playerId, playerHeader, rawEvents)
    assert.isNull(result.tournaments[0].address)
    assert.equal(result.tournaments[0].events[0].eventType, EventType.TEAMS)
  })
  test('filters out disqualified entrants', ({ assert }) => {
    const rawEvents: EventResult[] = [
      {
        id: 'event-1',
        name: 'Disqualified Event',
        type: 1,
        isOnline: false,
        videogame: { id: '1386', name: 'Game' },
        phases: [
          {
            phaseOrder: 1,
            phaseGroups: {
              nodes: [
                {
                  id: null,
                  bracketType: 'DOUBLE_ELIMINATION',
                },
              ],
            },
          },
        ],
        tournament: {
          id: 't1',
          name: 'T1',
          lat: null,
          lng: null,
          city: null,
          addrState: null,
          countryCode: null,
          startAt: 0,
        },
        userEntrant: {
          id: 'entrant-1',
          name: 'Rouxchov',
          isDisqualified: true,
          initialSeedNum: 10,
          players: null,
          standing: { placement: 9 },
          paginatedSets: null,
        },
      },
    ]

    const result = mapPlayerRecap(playerId, playerHeader, rawEvents)
    assert.lengthOf(result.tournaments[0].events, 0)
  })
  test('skips events missing userEntrant or userEntrant.id', ({ assert }) => {
    const rawEvents: EventResult[] = [
      {
        id: 'event-1',
        name: 'Event',
        type: 1,
        isOnline: false,
        videogame: { id: '1386', name: 'Game' },
        phases: null,
        tournament: {
          id: 't1',
          name: 'T1',
          lat: null,
          lng: null,
          city: null,
          addrState: null,
          countryCode: null,
          startAt: 0,
        },
        userEntrant: null,
      },
    ]

    const result = mapPlayerRecap(playerId, playerHeader, rawEvents)
    assert.lengthOf(result.tournaments[0].events, 0)
  })
  test('skips sets with no competitors', ({ assert }) => {
    const rawEvents: EventResult[] = [
      {
        id: 'event-1',
        name: 'Event',
        type: 1,
        isOnline: false,
        videogame: { id: '1386', name: 'Game' },
        phases: [
          {
            phaseOrder: 1,
            phaseGroups: {
              nodes: [
                {
                  id: null,
                  bracketType: 'DOUBLE_ELIMINATION',
                },
              ],
            },
          },
        ],
        tournament: {
          id: 't1',
          name: 'T1',
          lat: null,
          lng: null,
          city: null,
          addrState: null,
          countryCode: null,
          startAt: 0,
        },
        userEntrant: {
          id: 'entrant-1',
          name: 'Rouxchov',
          isDisqualified: false,
          initialSeedNum: 10,
          players: [{ id: 'player-123' }],
          standing: { placement: 9 },
          paginatedSets: {
            nodes: [
              {
                id: 'set-1',
                winnerId: 22253157,
                round: 2,
                fullRoundText: 'Winners Round 2',
                completedAt: 1785278000,
                phaseGroup: { bracketType: 'DOUBLE_ELIMINATION' },
                slots: [],
                games: [],
              },
            ],
          },
        },
      },
    ]

    const result = mapPlayerRecap(playerId, playerHeader, rawEvents)
    assert.lengthOf(result.tournaments[0].events[0].sets, 0)
  })
  test('skips invalid character selections gracefully', ({ assert }) => {
    const rawEvents: EventResult[] = [
      {
        id: 'event-1',
        name: 'Event',
        type: 1,
        isOnline: false,
        videogame: { id: '1386', name: 'Game' },
        phases: [
          {
            phaseOrder: 1,
            phaseGroups: {
              nodes: [
                {
                  id: null,
                  bracketType: 'DOUBLE_ELIMINATION',
                },
              ],
            },
          },
        ],
        tournament: {
          id: 't1',
          name: 'T1',
          lat: null,
          lng: null,
          city: null,
          addrState: null,
          countryCode: null,
          startAt: 0,
        },
        userEntrant: {
          id: 'entrant-1',
          name: 'Rouxchov',
          isDisqualified: false,
          initialSeedNum: 10,
          players: [{ id: 'player-123' }],
          standing: { placement: 9 },
          paginatedSets: {
            nodes: [
              {
                id: 'set-1',
                winnerId: 12345,
                round: 2,
                fullRoundText: 'Winners Round 2',
                completedAt: 1785278000,
                phaseGroup: { bracketType: 'DOUBLE_ELIMINATION' },
                slots: [
                  {
                    entrant: {
                      id: 'entrant-1',
                      name: 'Rouxchov',
                      isDisqualified: false,
                      standing: { placement: 9 },
                      players: [{ id: 'player-123' }],
                    },
                    seed: null,
                    standing: null,
                  },
                ],
                games: [
                  {
                    id: 'game-1',
                    orderNum: 1,
                    winnerId: 12345,
                    stage: null,
                    selections: [
                      null, // should continue
                      {
                        entrant: null,
                        character: null,
                        participant: null,
                        selectionType: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    ]

    const result = mapPlayerRecap(playerId, playerHeader, rawEvents)
    assert.lengthOf(result.tournaments[0].events[0].sets[0].games[0].selections, 0)
  })
  type MockEvent = {
    id?: string | null
    name?: string | null
    type?: number | null
    isOnline?: boolean | null
    videogame: {
      id?: string | null
      name?: string | null
    }
    phases?:
      | {
          phaseOrder?: number | null
          phaseGroups?: {
            nodes?:
              | {
                  id?: string | null
                  bracketType?: string | null
                }[]
              | null
          } | null
        }[]
      | null
    tournament?: {
      id?: string | null
      name?: string | null
      lat?: number | null
      lng?: number | null
      city?: string | null
      addrState?: string | null
      countryCode?: string | null
      startAt?: number | null
    } | null
    userEntrant: {
      id?: string | null
      name?: string | null
      isDisqualified?: boolean | null
      initialSeedNum?: number | null
      players?: { id?: string | null }[] | null
      standing: {
        placement?: number | null
      }
      paginatedSets?: {
        nodes?:
          | {
              id?: string | null
              winnerId?: string | number | null
              round?: number | null
              fullRoundText?: string | null
              completedAt?: number | null
              phaseGroup?: {
                bracketType?: string | null
              } | null
              slots?:
                | {
                    entrant?: {
                      id?: string | null
                      name?: string | null
                      isDisqualified?: boolean | null
                      standing?: {
                        placement?: number | null
                      } | null
                      players?: { id?: string | null }[] | null
                    } | null
                    seed?: {
                      seedNum?: number | null
                    } | null
                    standing?: {
                      stats?: {
                        score?: {
                          value?: number | null
                        } | null
                      } | null
                    } | null
                  }[]
                | null
              games?:
                | {
                    id?: string | null
                    orderNum?: number | null
                    winnerId?: string | number | null
                    stage?: {
                      id?: string | null
                      name?: string | null
                    } | null
                    selections?:
                      | {
                          entrant?: {
                            id?: string | null
                          } | null
                          character?: {
                            id?: string | null
                            name?: string | null
                          } | null
                          participant?: {
                            player?: {
                              id?: string | null
                            } | null
                          } | null
                          selectionType?: string | null
                        }[]
                      | null
                  }[]
                | null
            }[]
          | null
      } | null
    }
  }

  // INNER TESTS
  ;(() => {
    const makeBaseEvent = (): MockEvent => ({
      id: 'event-1',
      name: 'Event',
      type: 1,
      isOnline: false,
      videogame: { id: '1386', name: 'Game' },
      phases: [
        {
          phaseOrder: 1,
          phaseGroups: {
            nodes: [
              {
                id: null,
                bracketType: 'DOUBLE_ELIMINATION',
              },
            ],
          },
        },
      ],
      tournament: {
        id: 't1',
        name: 'T1',
        lat: null,
        lng: null,
        city: null,
        addrState: null,
        countryCode: null,
        startAt: 0,
      },
      userEntrant: {
        id: 'entrant-1',
        name: 'Rouxchov',
        isDisqualified: false,
        initialSeedNum: 10,
        players: [{ id: 'player-123' }],
        standing: { placement: 9 },
        paginatedSets: null,
      },
    })

    test('videogame ID is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.videogame.id = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: Videogame ID is missing'
      )
    })

    test('videogame name is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.videogame.name = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: Videogame name is missing'
      )
    })

    test('standing placement is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.standing.placement = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: User entrant placement is missing'
      )
    })

    test('initial seed number is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.initialSeedNum = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: User entrant initial seed is missing'
      )
    })

    test('entrant name is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.name = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: User entrant name is missing'
      )
    })

    test('event ID is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.id = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: Event ID is missing'
      )
    })

    test('event name is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.name = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: Event name is missing'
      )
    })

    test('event type is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.type = null
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: Event type is missing'
      )
    })

    test('event type code is unsupported', ({ assert }) => {
      const event = makeBaseEvent()
      event.type = 3
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map event. Reason: Unsupported event type code: 3'
      )
    })

    test('competitor name is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.paginatedSets = {
        nodes: [
          {
            id: 'set-1',
            winnerId: 'entrant-2',
            round: 1,
            fullRoundText: 'Winners 1',
            phaseGroup: { bracketType: 'DOUBLE_ELIMINATION' },
            slots: [
              {
                entrant: {
                  id: 'entrant-2',
                  name: null,
                  players: [{ id: 'player-456' }],
                },
              },
            ],
          },
        ],
      }
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map set. Reason: Entrant name is missing'
      )
    })

    test('set ID is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.paginatedSets = {
        nodes: [
          {
            id: null,
            winnerId: 'entrant-1',
            round: 1,
            fullRoundText: 'Winners 1',
            phaseGroup: { bracketType: 'DOUBLE_ELIMINATION' },
            slots: [
              {
                entrant: {
                  id: 'entrant-1',
                  name: 'Rouxchov',
                  players: [{ id: 'player-123' }],
                },
              },
            ],
          },
        ],
      }
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map set. Reason: Set ID is missing'
      )
    })

    test('set fullRoundText is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.paginatedSets = {
        nodes: [
          {
            id: 'set-1',
            winnerId: 'entrant-1',
            round: 1,
            fullRoundText: null,
            phaseGroup: { bracketType: 'DOUBLE_ELIMINATION' },
            slots: [
              {
                entrant: {
                  id: 'entrant-1',
                  name: 'Rouxchov',
                  players: [{ id: 'player-123' }],
                },
              },
            ],
          },
        ],
      }
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map set. Reason: Set fullRoundText is missing'
      )
    })

    test('game orderNum is missing', ({ assert }) => {
      const event = makeBaseEvent()
      event.userEntrant.paginatedSets = {
        nodes: [
          {
            id: 'set-1',
            winnerId: 'entrant-1',
            round: 1,
            fullRoundText: 'Winners 1',
            phaseGroup: { bracketType: 'DOUBLE_ELIMINATION' },
            slots: [
              {
                entrant: {
                  id: 'entrant-1',
                  name: 'Rouxchov',
                  players: [{ id: 'player-123' }],
                },
              },
            ],
            games: [
              {
                id: 'game-1',
                orderNum: null,
                winnerId: 'entrant-1',
                stage: null,
                selections: [],
              },
            ],
          },
        ],
      }
      assert.throws(
        () => mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
        'Cannot map game. Reason: orderNum is missing'
      )
    })
  })()
})
