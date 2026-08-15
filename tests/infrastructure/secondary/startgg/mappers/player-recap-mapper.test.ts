import { describe, expect, test } from 'vitest'
import {
  mapPlayerRecap,
  mapEmptyPlayer,
} from '#/infrastructure/secondary/startgg/mappers/player-recap-mapper'
import type { EventResult } from '#/infrastructure/secondary/startgg/mappers/player-recap-mapper'
import { EventType } from '#/domain/recap/event-type'
import { BracketType } from '#/domain/recap/bracket-type'
import { asPlayerId } from '#/domain/shared-kernel/ids'

describe('PlayerRecapMapper', () => {
  const playerId = asPlayerId('player-123')
  const playerHeader = {
    gamerTag: 'Rouxchov',
    prefix: 'PNS',
  }

  test('mapEmptyPlayer initializes player with empty tournaments list', () => {
    const result = mapEmptyPlayer(playerId, playerHeader)
    expect(result.id).toBe(playerId)
    expect(result.gamerTag).toBe('Rouxchov')
    expect(result.prefix).toBe('PNS')
    expect(result.tournaments).toHaveLength(0)
  })

  test('successfully maps valid player events payload with sets, games, and selections', () => {
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

    expect(result.id).toBe(playerId)
    expect(result.tournaments).toHaveLength(1)

    const tournament = result.tournaments[0]
    expect(tournament.id).toBe('tournament-1')
    expect(tournament.name).toBe('PNS BloomBagarre')
    expect(tournament.address?.city).toBe('Toulouse')
    expect(tournament.address?.state).toBe('Occitanie')
    expect(tournament.address?.countryCode).toBe('FR')
    expect(tournament.address?.latitude).toBe(43.6)
    expect(tournament.address?.longitude).toBe(1.433333)

    const event = tournament.events[0]
    expect(event.id).toBe('event-1')
    expect(event.name).toBe('Ultimate Singles')
    expect(event.eventType).toBe(EventType.SINGLES)
    expect(event.lastBracketType).toBe(BracketType.DOUBLE_ELIMINATION)
    expect(event.participants).toHaveLength(2)

    const set = event.sets[0]
    expect(set.id).toBe('set-1')
    expect(set.round).toBe(2)
    expect(set.fullRoundText).toBe('Winners Round 2')
    expect(set.winnerId).toBe('3739330')
    expect(set.bracketType).toBe(BracketType.DOUBLE_ELIMINATION)
    expect(set.games).toHaveLength(1)

    const game = set.games[0]
    expect(game.id).toBe('game-1')
    expect(game.orderNum).toBe(1)
    expect(game.winnerId).toBe('3739330')
    expect(game.stage?.name).toBe('Pokémon Stadium 2')
    expect(game.selections).toHaveLength(2)

    const sel1 = game.selections[0]
    expect(sel1.playerId).toBe('3739330')
    expect(sel1.character.name).toBe('Wolf')

    const sel2 = game.selections[1]
    expect(sel2.playerId).toBe(playerId)
    expect(sel2.character.name).toBe('Banjo-Kazooie')
  })

  test('successfully maps Teams events payload', () => {
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
    expect(result.tournaments[0].address).toBeNull()
    expect(result.tournaments[0].events[0].eventType).toBe(EventType.TEAMS)
  })

  test('filters out disqualified entrants', () => {
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
    expect(result.tournaments[0].events).toHaveLength(0)
  })

  test('skips events missing userEntrant or userEntrant.id', () => {
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
    expect(result.tournaments[0].events).toHaveLength(0)
  })

  test('skips sets with no competitors', () => {
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
    expect(result.tournaments[0].events[0].sets).toHaveLength(0)
  })

  test('skips invalid character selections gracefully', () => {
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
    expect(
      result.tournaments[0].events[0].sets[0].games[0].selections,
    ).toHaveLength(0)
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

  describe('throws validation errors on missing properties', () => {
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

    test('videogame ID is missing', () => {
      const event = makeBaseEvent()
      event.videogame.id = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: Videogame ID is missing')
    })

    test('videogame name is missing', () => {
      const event = makeBaseEvent()
      event.videogame.name = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: Videogame name is missing')
    })

    test('standing placement is missing', () => {
      const event = makeBaseEvent()
      event.userEntrant.standing.placement = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: User entrant placement is missing')
    })

    test('initial seed number is missing', () => {
      const event = makeBaseEvent()
      event.userEntrant.initialSeedNum = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow(
        'Cannot map event. Reason: User entrant initial seed is missing',
      )
    })

    test('entrant name is missing', () => {
      const event = makeBaseEvent()
      event.userEntrant.name = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: User entrant name is missing')
    })

    test('event ID is missing', () => {
      const event = makeBaseEvent()
      event.id = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: Event ID is missing')
    })

    test('event name is missing', () => {
      const event = makeBaseEvent()
      event.name = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: Event name is missing')
    })

    test('event type is missing', () => {
      const event = makeBaseEvent()
      event.type = null
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: Event type is missing')
    })

    test('event type code is unsupported', () => {
      const event = makeBaseEvent()
      event.type = 3
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map event. Reason: Unsupported event type code: 3')
    })

    test('competitor name is missing', () => {
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
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map set. Reason: Entrant name is missing')
    })

    test('set ID is missing', () => {
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
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map set. Reason: Set ID is missing')
    })

    test('set fullRoundText is missing', () => {
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
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map set. Reason: Set fullRoundText is missing')
    })

    test('game orderNum is missing', () => {
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
      expect(() =>
        mapPlayerRecap(playerId, playerHeader, [event as EventResult]),
      ).toThrow('Cannot map game. Reason: orderNum is missing')
    })
  })
})
