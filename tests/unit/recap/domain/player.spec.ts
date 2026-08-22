import { CharacterFactory } from '#tests/factories/character_factory'
import { EventFactory } from '#tests/factories/event_factory'
import { GameFactory } from '#tests/factories/game_factory'
import { PlayerFactory } from '#tests/factories/player_factory'
import { SeedFactory } from '#tests/factories/seed_factory'
import { SetFactory } from '#tests/factories/set_factory'
import { StageFactory } from '#tests/factories/stage_factory'
import { TournamentFactory } from '#tests/factories/tournament_factory'
import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { EventType } from '#recap/domain/event_type'
import { GameSelection } from '#recap/domain/game'
import { SetPlayer } from '#recap/domain/set'
import { asPlayerId } from '#shared/domain/ids'

test.group('Player - bestPerformances and worstPerformance', () => {
  test('bestPerformances returns empty list if player has no tournaments with valid SPR', ({
    assert,
  }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.bestPerformances(5), [])
  })

  test('worstPerformance returns null if player has no tournaments with valid SPR', ({
    assert,
  }) => {
    const player = PlayerFactory.build()
    assert.isNull(player.worstPerformance())
  })

  test('returns correct sorted performances based on SPR', ({ assert }) => {
    const playerId = asPlayerId('player-1')

    const t1 = TournamentFactory.build()
    const t2 = TournamentFactory.build()
    const t3 = TournamentFactory.build()

    t1.getPlayerSPR = () => 2
    t2.getPlayerSPR = () => 5
    t3.getPlayerSPR = () => -1

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [t1, t2, t3],
    })

    const best = player.bestPerformances(5)
    assert.lengthOf(best, 2)
    assert.deepEqual(best[0], { tournament: t2, spr: 5 })
    assert.deepEqual(best[1], { tournament: t1, spr: 2 })

    t1.getPlayerSPR = () => 3
    t2.getPlayerSPR = () => 1
    t3.getPlayerSPR = () => 4

    const worst = player.worstPerformance()
    assert.isNotNull(worst)
    assert.equal(worst?.tournament, t2)
    assert.equal(worst?.spr, 1)
  })
})

test.group('Player - cleanSweeps', () => {
  test('should be 0 if the player did not attend any tournament this year', ({ assert }) => {
    const player = PlayerFactory.build()

    assert.equal(player.cleanSweeps(), 0)
  })

  test('should count clean sweeps', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: TournamentFactory.buildList(2, {
        events: [
          EventFactory.build({
            sets: SetFactory.buildList(10, {
              competitors: new Map()
                .set(
                  playerId,
                  new SetPlayer({
                    isDisqualified: false,
                    playerId,
                    score: 3,
                    seed: SeedFactory.build(),
                  })
                )
                .set(
                  opponentId,
                  new SetPlayer({
                    isDisqualified: false,
                    playerId: opponentId,
                    score: 0,
                    seed: SeedFactory.build(),
                  })
                ),
              winnerId: playerId,
            }),
          }),
        ],
      }),
    })

    assert.equal(player.cleanSweeps(), 20)
  })
})

test.group('Player - constructor', () => {
  test('initializes correctly with valid gamerTag', ({ assert }) => {
    assert.doesNotThrow(() => PlayerFactory.build())
  })

  test('throws error if gamerTag is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, gamerTag) => {
      assert.throws(() => PlayerFactory.build({ gamerTag }), 'Invalid parameter gamer tag')
    })
})

test.group('Player - dayOfWeekActivity', () => {
  test('should not contains values if the player did not attend any tournaments this year', ({
    assert,
  }) => {
    const player = PlayerFactory.build()

    assert.deepEqual(player.dayOfWeekActivity(), [
      { count: 0, day: 'Sun' },
      { count: 0, day: 'Mon' },
      { count: 0, day: 'Tue' },
      { count: 0, day: 'Wed' },
      { count: 0, day: 'Thu' },
      { count: 0, day: 'Fri' },
      { count: 0, day: 'Sat' },
    ])
  })

  test('should contains values if the player did attend tournaments this year', ({ assert }) => {
    const player = PlayerFactory.build({
      tournaments: [
        ...TournamentFactory.buildList(100, {
          startDate: new Date('2026-07-25'),
        }),
        ...TournamentFactory.buildList(1, {
          startDate: new Date('2026-07-26'),
        }),
        ...TournamentFactory.buildList(5, {
          startDate: new Date('2026-07-28'),
        }),
        ...TournamentFactory.buildList(3, {
          startDate: new Date('2026-07-29'),
        }),
        ...TournamentFactory.buildList(2, {
          startDate: new Date('2026-07-30'),
        }),
        ...TournamentFactory.buildList(9, {
          startDate: new Date('2026-07-31'),
        }),
        ...TournamentFactory.buildList(6, {
          startDate: new Date('2026-08-03'),
        }),
      ],
    })

    assert.deepEqual(player.dayOfWeekActivity(), [
      { count: 1, day: 'Sun' },
      { count: 6, day: 'Mon' },
      { count: 5, day: 'Tue' },
      { count: 3, day: 'Wed' },
      { count: 2, day: 'Thu' },
      { count: 9, day: 'Fri' },
      { count: 100, day: 'Sat' },
    ])
  })
})

test.group('Player - decidingGameSets', () => {
  test('should return 0 count and win rate if player played no sets', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.decidingGameSets(), {
      count: 0,
      winCount: 0,
      winRate: 0,
    })
  })

  test('should count deciding game sets and calculate win rate correctly', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player1Won = new SetPlayer({
      playerId,
      seed: SeedFactory.build(),
      score: 3,
      isDisqualified: false,
    })
    const player2Lost = new SetPlayer({
      playerId: opponentId,
      seed: SeedFactory.build(),
      score: 2,
      isDisqualified: false,
    })

    const player1Lost = new SetPlayer({
      playerId,
      seed: SeedFactory.build(),
      score: 2,
      isDisqualified: false,
    })
    const player2Won = new SetPlayer({
      playerId: opponentId,
      seed: SeedFactory.build(),
      score: 3,
      isDisqualified: false,
    })

    const player1NotDeciding = new SetPlayer({
      playerId,
      seed: SeedFactory.build(),
      score: 3,
      isDisqualified: false,
    })
    const player2NotDeciding = new SetPlayer({
      playerId: opponentId,
      seed: SeedFactory.build(),
      score: 0,
      isDisqualified: false,
    })

    const setWon = SetFactory.build({
      competitors: new Map([
        [playerId, player1Won],
        [opponentId, player2Lost],
      ]),
      winnerId: playerId,
      games: [
        GameFactory.build({ orderNum: 1, winnerId: playerId }),
        GameFactory.build({ orderNum: 2, winnerId: opponentId }),
        GameFactory.build({ orderNum: 3, winnerId: playerId }),
        GameFactory.build({ orderNum: 4, winnerId: opponentId }),
        GameFactory.build({ orderNum: 5, winnerId: playerId }),
      ],
    })

    const setLost = SetFactory.build({
      competitors: new Map([
        [playerId, player1Lost],
        [opponentId, player2Won],
      ]),
      winnerId: opponentId,
      games: [
        GameFactory.build({ orderNum: 1, winnerId: opponentId }),
        GameFactory.build({ orderNum: 2, winnerId: playerId }),
        GameFactory.build({ orderNum: 3, winnerId: opponentId }),
        GameFactory.build({ orderNum: 4, winnerId: playerId }),
        GameFactory.build({ orderNum: 5, winnerId: opponentId }),
      ],
    })

    const setNotDeciding = SetFactory.build({
      competitors: new Map([
        [playerId, player1NotDeciding],
        [opponentId, player2NotDeciding],
      ]),
      winnerId: playerId,
      games: [
        GameFactory.build({ orderNum: 1, winnerId: playerId }),
        GameFactory.build({ orderNum: 2, winnerId: playerId }),
        GameFactory.build({ orderNum: 3, winnerId: playerId }),
      ],
    })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [setWon, setLost, setNotDeciding],
            }),
          ],
        }),
      ],
    })

    assert.deepEqual(player.decidingGameSets(), {
      count: 2,
      winCount: 1,
      winRate: 0.5,
    })
  })
})

test.group('Player - encounteredCharacters', () => {
  test('should return empty list if there are no opponent characters encountered', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.encounteredCharacters(), new Set())
  })

  test('should return unique characters played by opponents', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const myChar = CharacterFactory.build({ name: 'Marth' })
    const charFox = CharacterFactory.build({ name: 'Fox' })
    const charFalco = CharacterFactory.build({ name: 'Falco' })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 2,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponentId,
                      new SetPlayer({
                        playerId: opponentId,
                        seed: SeedFactory.build(),
                        score: 1,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  games: [
                    GameFactory.build({
                      orderNum: 1,
                      selections: [
                        new GameSelection(playerId, myChar),
                        new GameSelection(opponentId, charFox),
                      ],
                    }),
                    GameFactory.build({
                      orderNum: 2,
                      selections: [
                        new GameSelection(playerId, myChar),
                        new GameSelection(opponentId, charFox),
                      ],
                    }),
                    GameFactory.build({
                      orderNum: 3,
                      selections: [
                        new GameSelection(playerId, myChar),
                        new GameSelection(opponentId, charFalco),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })

    const characters = player.encounteredCharacters()
    assert.equal(characters.size, 2)
    const names = Array.from(characters.keys()).map((c) => c.name)
    assert.include(names, 'Fox')
    assert.include(names, 'Falco')
  })
})

test.group('Player - equals', () => {
  test('returns true if player IDs are the same', ({ assert }) => {
    const p1 = PlayerFactory.build({ id: asPlayerId('1') })
    const p2 = PlayerFactory.build({ id: asPlayerId('1') })
    assert.equal(p1.equals(p2), true)
  })

  test('returns false if player IDs are different', ({ assert }) => {
    const p1 = PlayerFactory.build({ id: asPlayerId('1') })
    const p2 = PlayerFactory.build({ id: asPlayerId('2') })
    assert.equal(p1.equals(p2), false)
  })
})

test.group('Player - eventTypeBreakdown', () => {
  test('returns empty counts if player played no tournaments', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.eventTypeBreakdown(), {
      [EventType.SINGLES]: 0,
      [EventType.TEAMS]: 0,
    })
  })

  test('correctly counts singles and teams events', ({ assert }) => {
    const player = PlayerFactory.build({
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({ eventType: EventType.SINGLES }),
            EventFactory.build({ eventType: EventType.SINGLES }),
            EventFactory.build({ eventType: EventType.TEAMS }),
          ],
        }),
        TournamentFactory.build({
          events: [
            EventFactory.build({ eventType: EventType.TEAMS }),
            EventFactory.build({ eventType: EventType.SINGLES }),
          ],
        }),
      ],
    })

    assert.deepEqual(player.eventTypeBreakdown(), {
      [EventType.SINGLES]: 3,
      [EventType.TEAMS]: 2,
    })
  })
})

test.group('Player - headToHead', () => {
  test('should return empty list if player played no sets', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.headToHead(10), [])
  })

  test('should aggregate wins and losses against opponents and sort properly', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponent1Id = asPlayerId('2')
    const opponent2Id = asPlayerId('3')

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 2,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponent1Id,
                      new SetPlayer({
                        playerId: opponent1Id,
                        seed: SeedFactory.build(),
                        score: 1,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  winnerId: playerId,
                }),
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 1,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponent1Id,
                      new SetPlayer({
                        playerId: opponent1Id,
                        seed: SeedFactory.build(),
                        score: 2,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  winnerId: opponent1Id,
                }),
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 0,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponent1Id,
                      new SetPlayer({
                        playerId: opponent1Id,
                        seed: SeedFactory.build(),
                        score: 2,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  winnerId: opponent1Id,
                }),
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 2,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponent2Id,
                      new SetPlayer({
                        playerId: opponent2Id,
                        seed: SeedFactory.build(),
                        score: 0,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  winnerId: playerId,
                }),
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 2,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponent2Id,
                      new SetPlayer({
                        playerId: opponent2Id,
                        seed: SeedFactory.build(),
                        score: 1,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  winnerId: playerId,
                }),
              ],
            }),
          ],
        }),
      ],
    })

    const resultTotal = player.headToHead(10, 'total')
    assert.lengthOf(resultTotal, 2)
    assert.deepEqual(resultTotal[0], {
      opponentPlayerId: opponent1Id,
      playerWonSet: 1,
      opponentWonSet: 2,
      totalSets: 3,
      winRate: 1 / 3,
    })
    assert.deepEqual(resultTotal[1], {
      opponentPlayerId: opponent2Id,
      playerWonSet: 2,
      opponentWonSet: 0,
      totalSets: 2,
      winRate: 1.0,
    })

    const resultWinRate = player.headToHead(10, 'winRate')
    assert.equal(resultWinRate[0].opponentPlayerId, opponent2Id)
    assert.equal(resultWinRate[1].opponentPlayerId, opponent1Id)

    const resultDiff = player.headToHead(10, 'diff')
    assert.equal(resultDiff[0].opponentPlayerId, opponent2Id)
    assert.equal(resultDiff[1].opponentPlayerId, opponent1Id)
  })
})

test.group('Player - highestUpset', () => {
  test('should return null if there are no tournaments or sets played', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.isNull(player.highestUpset())
  })

  test('should return null if player won no sets or achieved no upsets', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              lastBracketType: BracketType.DOUBLE_ELIMINATION,
              sets: [
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build({
                          initialSeed: 1,
                          finalPlacement: 1,
                        }),
                        score: 3,
                        isDisqualified: false,
                      }),
                    ],
                    [
                      opponentId,
                      new SetPlayer({
                        playerId: opponentId,
                        seed: SeedFactory.build({
                          initialSeed: 2,
                          finalPlacement: 2,
                        }),
                        score: 0,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  winnerId: playerId,
                }),
              ],
            }),
          ],
        }),
      ],
    })

    assert.isNull(player.highestUpset())
  })

  test('should return the set with the highest upset factor', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const expectedSet = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build({
              initialSeed: 4,
              finalPlacement: 1,
            }),
            score: 3,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: SeedFactory.build({
              initialSeed: 2,
              finalPlacement: 2,
            }),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      winnerId: playerId,
    })

    const minorUpsetSet = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build({
              initialSeed: 3,
              finalPlacement: 1,
            }),
            score: 3,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: SeedFactory.build({
              initialSeed: 2,
              finalPlacement: 2,
            }),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      winnerId: playerId,
    })

    const event = EventFactory.build({
      lastBracketType: BracketType.DOUBLE_ELIMINATION,
      sets: [minorUpsetSet, expectedSet],
    })

    const tournament = TournamentFactory.build({
      events: [event],
    })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [tournament],
    })

    const upset = player.highestUpset()
    assert.isNotNull(upset)
    assert.deepEqual(upset?.set.id, expectedSet.id)
    assert.equal(upset?.factor, 2)
  })
})

test.group('Player - mostPlayedCharacters', () => {
  test('should return empty list if player did not play any games or characters', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.mostPlayedCharacters(3), [])
  })

  test('should count, sort, and limit character usage', ({ assert }) => {
    const playerId = asPlayerId('1')
    const charFox = CharacterFactory.build({ name: 'Fox' })
    const charMarth = CharacterFactory.build({ name: 'Marth' })
    const charFalco = CharacterFactory.build({ name: 'Falco' })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [
                SetFactory.build({
                  competitors: new Map([
                    [
                      playerId,
                      new SetPlayer({
                        playerId,
                        seed: SeedFactory.build(),
                        score: 3,
                        isDisqualified: false,
                      }),
                    ],
                  ]),
                  games: [
                    GameFactory.build({
                      orderNum: 1,
                      selections: [new GameSelection(playerId, charFox)],
                    }),
                    GameFactory.build({
                      orderNum: 2,
                      selections: [new GameSelection(playerId, charFox)],
                    }),
                    GameFactory.build({
                      orderNum: 3,
                      selections: [new GameSelection(playerId, charFox)],
                    }),
                    GameFactory.build({
                      orderNum: 4,
                      selections: [new GameSelection(playerId, charMarth)],
                    }),
                    GameFactory.build({
                      orderNum: 5,
                      selections: [new GameSelection(playerId, charMarth)],
                    }),
                    GameFactory.build({
                      orderNum: 6,
                      selections: [new GameSelection(playerId, charFalco)],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })

    const result = player.mostPlayedCharacters(2)
    assert.lengthOf(result, 2)
    assert.deepEqual(result[0], { character: charFox, count: 3 })
    assert.deepEqual(result[1], { character: charMarth, count: 2 })
  })
})

test.group('Player - reverseSweeps', () => {
  test('should return 0 won and lost if player did not attend any tournament', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.reverseSweeps(), { won: 0, lost: 0 })
  })

  test('should count won and lost reverse sweeps correctly', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player1 = new SetPlayer({
      playerId,
      seed: SeedFactory.build({ initialSeed: 1, finalPlacement: 5 }),
      score: 3,
      isDisqualified: false,
    })
    const player2 = new SetPlayer({
      playerId: opponentId,
      seed: SeedFactory.build({ initialSeed: 2, finalPlacement: 5 }),
      score: 2,
      isDisqualified: false,
    })

    const setWon = SetFactory.build({
      competitors: new Map([
        [playerId, player1],
        [opponentId, player2],
      ]),
      winnerId: playerId,
      games: [
        GameFactory.build({ orderNum: 1, winnerId: opponentId }),
        GameFactory.build({ orderNum: 2, winnerId: opponentId }),
        GameFactory.build({ orderNum: 3, winnerId: playerId }),
        GameFactory.build({ orderNum: 4, winnerId: playerId }),
        GameFactory.build({ orderNum: 5, winnerId: playerId }),
      ],
    })

    const setLost = SetFactory.build({
      competitors: new Map([
        [playerId, player1],
        [opponentId, player2],
      ]),
      winnerId: opponentId,
      games: [
        GameFactory.build({ orderNum: 1, winnerId: playerId }),
        GameFactory.build({ orderNum: 2, winnerId: playerId }),
        GameFactory.build({ orderNum: 3, winnerId: opponentId }),
        GameFactory.build({ orderNum: 4, winnerId: opponentId }),
        GameFactory.build({ orderNum: 5, winnerId: opponentId }),
      ],
    })

    const setLostNotReverseSweep = SetFactory.build({
      competitors: new Map([
        [playerId, player1],
        [opponentId, player2],
      ]),
      winnerId: opponentId,
      games: [
        GameFactory.build({ orderNum: 1, winnerId: opponentId }),
        GameFactory.build({ orderNum: 2, winnerId: playerId }),
        GameFactory.build({ orderNum: 3, winnerId: opponentId }),
        GameFactory.build({ orderNum: 4, winnerId: playerId }),
        GameFactory.build({ orderNum: 5, winnerId: opponentId }),
      ],
    })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [setWon, setLost, setLostNotReverseSweep],
            }),
          ],
        }),
      ],
    })

    assert.deepEqual(player.reverseSweeps(), { won: 1, lost: 1 })
  })
})

test.group('Player - stageActivity', () => {
  test('should return empty list if there is no stage activity', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.stageActivity(), [])
  })

  test('should aggregate stage usage counts and win rates, excluding DQ sets', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const stageBF = StageFactory.build({ name: 'Battlefield' })
    const stageFD = StageFactory.build({ name: 'Final Destination' })
    const stageSV = StageFactory.build({ name: 'Smashville' })

    const game1 = GameFactory.build({
      orderNum: 1,
      stage: stageBF,
      winnerId: playerId,
    })

    const game2 = GameFactory.build({
      orderNum: 2,
      stage: stageBF,
      winnerId: opponentId,
    })

    const game3 = GameFactory.build({
      orderNum: 3,
      stage: stageFD,
      winnerId: playerId,
    })

    const game4 = GameFactory.build({
      orderNum: 1,
      stage: stageSV,
      winnerId: playerId,
    })

    const validSet = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: SeedFactory.build(),
            score: 1,
            isDisqualified: false,
          }),
        ],
      ]),
      games: [game1, game2, game3],
    })

    const dqSet = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 1,
            isDisqualified: true,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: SeedFactory.build(),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      games: [game4],
    })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [validSet, dqSet],
            }),
          ],
        }),
      ],
    })

    const result = player.stageActivity()
    assert.lengthOf(result, 2)

    const bfStats = result.find((r) => r.stage.name === 'Battlefield')
    assert.isDefined(bfStats)
    assert.equal(bfStats?.count, 2)
    assert.equal(bfStats?.winRate, 0.5)

    const fdStats = result.find((r) => r.stage.name === 'Final Destination')
    assert.isDefined(fdStats)
    assert.equal(fdStats?.count, 1)
    assert.equal(fdStats?.winRate, 1.0)
  })
})

test.group('Player - totalDisqualifications', () => {
  test('should be 0 if the player did not attend any tournaments this year', ({ assert }) => {
    const player = PlayerFactory.build()

    assert.equal(player.totalDisqualifications(), 0)
  })

  test('should be 0 if the opponent is the one who DQed', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: TournamentFactory.buildList(5, {
        events: [
          EventFactory.build({
            sets: SetFactory.buildList(10, {
              competitors: new Map()
                .set(
                  playerId,
                  new SetPlayer({
                    isDisqualified: false,
                    playerId,
                    score: 0,
                    seed: SeedFactory.build(),
                  })
                )
                .set(
                  opponentId,
                  new SetPlayer({
                    isDisqualified: true,
                    playerId: opponentId,
                    score: 0,
                    seed: SeedFactory.build(),
                  })
                ),
              winnerId: playerId,
            }),
          }),
        ],
      }),
    })

    assert.equal(player.totalDisqualifications(), 0)
  })

  test('should count DQs if the player is the one who DQed', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: TournamentFactory.buildList(5, {
        events: [
          EventFactory.build({
            sets: SetFactory.buildList(10, {
              competitors: new Map()
                .set(
                  playerId,
                  new SetPlayer({
                    isDisqualified: true,
                    playerId,
                    score: 0,
                    seed: SeedFactory.build(),
                  })
                )
                .set(
                  opponentId,
                  new SetPlayer({
                    isDisqualified: false,
                    playerId: opponentId,
                    score: 0,
                    seed: SeedFactory.build(),
                  })
                ),
              winnerId: playerId,
            }),
          }),
        ],
      }),
    })

    assert.equal(player.totalDisqualifications(), 50)
  })
})

test.group('Player - totalSets', () => {
  test('should count total number of sets player by the player', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: TournamentFactory.buildList(5, {
        events: [
          EventFactory.build({
            sets: SetFactory.buildList(10, {
              competitors: new Map()
                .set(
                  playerId,
                  new SetPlayer({
                    isDisqualified: false,
                    playerId,
                    score: 3,
                    seed: SeedFactory.build(),
                  })
                )
                .set(
                  opponentId,
                  new SetPlayer({
                    isDisqualified: false,
                    playerId: opponentId,
                    score: 2,
                    seed: SeedFactory.build(),
                  })
                ),
              winnerId: playerId,
            }),
          }),
        ],
      }),
    })

    assert.equal(player.totalSets(), 50)
  })
})

test.group('Player - tournamentsByMonth', () => {
  test('should not contains values if the player did not attend any tournaments this year', ({
    assert,
  }) => {
    const player = PlayerFactory.build()

    assert.deepEqual(player.tournamentsByMonth(), [
      { count: 0, month: 'Jan' },
      { count: 0, month: 'Feb' },
      { count: 0, month: 'Mar' },
      { count: 0, month: 'Apr' },
      { count: 0, month: 'May' },
      { count: 0, month: 'Jun' },
      { count: 0, month: 'Jul' },
      { count: 0, month: 'Aug' },
      { count: 0, month: 'Sep' },
      { count: 0, month: 'Oct' },
      { count: 0, month: 'Nov' },
      { count: 0, month: 'Dec' },
    ])
  })

  test('should contains values if the player did attend tournaments this year', ({ assert }) => {
    const player = PlayerFactory.build({
      tournaments: [
        ...TournamentFactory.buildList(100, {
          startDate: new Date('2026-01-01'),
        }),
        ...TournamentFactory.buildList(50, {
          startDate: new Date('2026-02-01'),
        }),
        ...TournamentFactory.buildList(25, {
          startDate: new Date('2026-03-01'),
        }),
        ...TournamentFactory.buildList(17, {
          startDate: new Date('2026-04-01'),
        }),
        ...TournamentFactory.buildList(71, {
          startDate: new Date('2026-05-01'),
        }),
        ...TournamentFactory.buildList(35, {
          startDate: new Date('2026-06-01'),
        }),
        ...TournamentFactory.buildList(70, {
          startDate: new Date('2026-07-01'),
        }),
        ...TournamentFactory.buildList(0, {
          startDate: new Date('2026-08-01'),
        }),
        ...TournamentFactory.buildList(1, {
          startDate: new Date('2026-09-01'),
        }),
        ...TournamentFactory.buildList(2, {
          startDate: new Date('2026-10-01'),
        }),
        ...TournamentFactory.buildList(4, {
          startDate: new Date('2026-11-01'),
        }),
        ...TournamentFactory.buildList(8, {
          startDate: new Date('2026-12-01'),
        }),
      ],
    })

    assert.deepEqual(player.tournamentsByMonth(), [
      { count: 100, month: 'Jan' },
      { count: 50, month: 'Feb' },
      { count: 25, month: 'Mar' },
      { count: 17, month: 'Apr' },
      { count: 71, month: 'May' },
      { count: 35, month: 'Jun' },
      { count: 70, month: 'Jul' },
      { count: 0, month: 'Aug' },
      { count: 1, month: 'Sep' },
      { count: 2, month: 'Oct' },
      { count: 4, month: 'Nov' },
      { count: 8, month: 'Dec' },
    ])
  })
})

test.group('Player - uniqueOpponentsFaced', () => {
  test('should return empty list if no opponents are faced', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.uniqueOpponentsFaced(), new Set())
  })

  test('should return unique opponent player IDs', ({ assert }) => {
    const playerId = asPlayerId('1')
    const opponent1Id = asPlayerId('2')
    const opponent2Id = asPlayerId('3')

    const set1 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponent1Id,
          new SetPlayer({
            playerId: opponent1Id,
            seed: SeedFactory.build(),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
    })

    const set2 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponent2Id,
          new SetPlayer({
            playerId: opponent2Id,
            seed: SeedFactory.build(),
            score: 1,
            isDisqualified: false,
          }),
        ],
      ]),
    })

    const set3 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponent1Id,
          new SetPlayer({
            playerId: opponent1Id,
            seed: SeedFactory.build(),
            score: 1,
            isDisqualified: false,
          }),
        ],
      ]),
    })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [set1, set2, set3],
            }),
          ],
        }),
      ],
    })

    const result = player.uniqueOpponentsFaced()
    assert.equal(result.size, 2)
    assert.include(result, opponent1Id)
    assert.include(result, opponent2Id)
  })
})

test.group('Player - worstMatchups', () => {
  test('should return empty list if there are no matchups', ({ assert }) => {
    const player = PlayerFactory.build()
    assert.deepEqual(player.worstMatchups(3), [])
  })

  test('should aggregate losses, sort by lossCount descending, and respect limit', ({ assert }) => {
    const playerId = asPlayerId('1')
    const marthPlayerId = asPlayerId('marth-player')
    const foxPlayerId = asPlayerId('fox-player')
    const falcoPlayerId = asPlayerId('falco-player')

    const charMarth = CharacterFactory.build({ name: 'Marth' })
    const charFox = CharacterFactory.build({ name: 'Fox' })
    const charFalco = CharacterFactory.build({ name: 'Falco' })

    const setMarth = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 1,
            isDisqualified: false,
          }),
        ],
        [
          marthPlayerId,
          new SetPlayer({
            playerId: marthPlayerId,
            seed: SeedFactory.build(),
            score: 1,
            isDisqualified: false,
          }),
        ],
      ]),
      games: [
        GameFactory.build({
          orderNum: 1,
          winnerId: playerId,
          selections: [
            new GameSelection(playerId, charFox),
            new GameSelection(marthPlayerId, charMarth),
          ],
        }),
        GameFactory.build({
          orderNum: 2,
          winnerId: marthPlayerId,
          selections: [
            new GameSelection(playerId, charFox),
            new GameSelection(marthPlayerId, charMarth),
          ],
        }),
      ],
    })

    const setFox = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 0,
            isDisqualified: false,
          }),
        ],
        [
          foxPlayerId,
          new SetPlayer({
            playerId: foxPlayerId,
            seed: SeedFactory.build(),
            score: 3,
            isDisqualified: false,
          }),
        ],
      ]),
      games: [
        GameFactory.build({
          orderNum: 1,
          winnerId: foxPlayerId,
          selections: [
            new GameSelection(playerId, charMarth),
            new GameSelection(foxPlayerId, charFox),
          ],
        }),
        GameFactory.build({
          orderNum: 2,
          winnerId: foxPlayerId,
          selections: [
            new GameSelection(playerId, charMarth),
            new GameSelection(foxPlayerId, charFox),
          ],
        }),
        GameFactory.build({
          orderNum: 3,
          winnerId: foxPlayerId,
          selections: [
            new GameSelection(playerId, charMarth),
            new GameSelection(foxPlayerId, charFox),
          ],
        }),
      ],
    })

    const setFalco = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: SeedFactory.build(),
            score: 0,
            isDisqualified: false,
          }),
        ],
        [
          falcoPlayerId,
          new SetPlayer({
            playerId: falcoPlayerId,
            seed: SeedFactory.build(),
            score: 2,
            isDisqualified: false,
          }),
        ],
      ]),
      games: [
        GameFactory.build({
          orderNum: 1,
          winnerId: falcoPlayerId,
          selections: [
            new GameSelection(playerId, charMarth),
            new GameSelection(falcoPlayerId, charFalco),
          ],
        }),
        GameFactory.build({
          orderNum: 2,
          winnerId: falcoPlayerId,
          selections: [
            new GameSelection(playerId, charMarth),
            new GameSelection(falcoPlayerId, charFalco),
          ],
        }),
      ],
    })

    const player = PlayerFactory.build({
      id: playerId,
      tournaments: [
        TournamentFactory.build({
          events: [
            EventFactory.build({
              sets: [setMarth, setFox, setFalco],
            }),
          ],
        }),
      ],
    })

    const result = player.worstMatchups(2)
    assert.lengthOf(result, 2)

    assert.deepEqual(result, [
      {
        character: charFox,
        count: 3,
        lossCount: 3,
        looseRate: 1.0,
      },
      {
        character: charFalco,
        count: 2,
        lossCount: 2,
        looseRate: 1.0,
      },
    ])
  })
})
