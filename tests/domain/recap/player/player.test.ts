import { SetPlayer } from '#/domain/recap/set'
import { asPlayerId } from '#/domain/shared-kernel/ids'
import { EventFactory } from '#tests/factories/event-factory.ts'
import { PlayerFactory } from '#tests/factories/player-factory.ts'
import { SeedFactory } from '#tests/factories/seed-factory.ts'
import { SetFactory } from '#tests/factories/set-factory.ts'
import { TournamentFactory } from '#tests/factories/tournament-factory.ts'
import { CharacterFactory } from '#tests/factories/character-factory.ts'
import { GameFactory } from '#tests/factories/game-factory.ts'
import { GameSelection } from '#/domain/recap/game'
import { StageFactory } from '#tests/factories/stage-factory.ts'
import { BracketType } from '#/domain/recap/bracket-type'
import { EventType } from '#/domain/recap/event-type'
import { describe, expect, test } from 'vitest'

describe('Player', () => {
  describe('constructor', () => {
    test('initializes correctly with valid gamerTag', () => {
      expect(() => PlayerFactory.build()).not.toThrow()
    })

    test('throws error if gamerTag is empty or whitespace', () => {
      expect(() => PlayerFactory.build({ gamerTag: '' })).toThrow(
        'Invalid parameter gamer tag',
      )
      expect(() => PlayerFactory.build({ gamerTag: '   ' })).toThrow(
        'Invalid parameter gamer tag',
      )
    })
  })

  describe('equals', () => {
    test('returns true if player IDs are the same', () => {
      const p1 = PlayerFactory.build({ id: asPlayerId('1') })
      const p2 = PlayerFactory.build({ id: asPlayerId('1') })
      expect(p1.equals(p2)).toBe(true)
    })

    test('returns false if player IDs are different', () => {
      const p1 = PlayerFactory.build({ id: asPlayerId('1') })
      const p2 = PlayerFactory.build({ id: asPlayerId('2') })
      expect(p1.equals(p2)).toBe(false)
    })
  })

  describe('mostPlayedCharacters', () => {
    test('should return empty list if player did not play any games or characters', () => {
      const player = PlayerFactory.build()
      expect(player.mostPlayedCharacters(3)).toEqual([])
    })

    test('should count, sort, and limit character usage', () => {
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
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ character: charFox, count: 3 })
      expect(result[1]).toEqual({ character: charMarth, count: 2 })
    })
  })

  describe('highestUpset', () => {
    test('should return null if there are no tournaments or sets played', () => {
      const player = PlayerFactory.build()
      expect(player.highestUpset()).toBeNull()
    })

    test('should return null if player won no sets or achieved no upsets', () => {
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

      expect(player.highestUpset()).toBeNull()
    })

    test('should return the set with the highest upset factor', () => {
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
      expect(upset).not.toBeNull()
      expect(upset?.set.id).toEqual(expectedSet.id)
      expect(upset?.factor).toBe(2)
    })
  })

  describe('encounteredCharacters', () => {
    test('should return empty list if there are no opponent characters encountered', () => {
      const player = PlayerFactory.build()
      expect(player.encounteredCharacters()).toEqual(new Set())
    })

    test('should return unique characters played by opponents', () => {
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
      expect(characters).toHaveLength(2)
      const names = Array.from(characters.keys()).map((c) => c.name)
      expect(names).toContain('Fox')
      expect(names).toContain('Falco')
    })
  })

  describe('stageActivity', () => {
    test('should return empty list if there is no stage activity', () => {
      const player = PlayerFactory.build()
      expect(player.stageActivity()).toEqual([])
    })

    test('should aggregate stage usage counts and win rates, excluding DQ sets', () => {
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
      expect(result).toHaveLength(2)

      const bfStats = result.find((r) => r.stage.name === 'Battlefield')
      expect(bfStats).toBeDefined()
      expect(bfStats?.count).toBe(2)
      expect(bfStats?.winRate).toBe(0.5)

      const fdStats = result.find((r) => r.stage.name === 'Final Destination')
      expect(fdStats).toBeDefined()
      expect(fdStats?.count).toBe(1)
      expect(fdStats?.winRate).toBe(1.0)
    })
  })
  describe('worstMatchups', () => {
    test('should return empty list if there are no matchups', () => {
      const player = PlayerFactory.build()
      expect(player.worstMatchups(3)).toEqual([])
    })

    test('should aggregate losses, sort by lossCount descending, and respect limit', () => {
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
      expect(result).toHaveLength(2)

      expect(result).toEqual([
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

  describe('uniqueOpponentsFaced', () => {
    test('should return empty list if no opponents are faced', () => {
      const player = PlayerFactory.build()
      expect(player.uniqueOpponentsFaced()).toEqual(new Set())
    })

    test('should return unique opponent player IDs', () => {
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
      expect(result).toHaveLength(2)
      expect(result).toContain(opponent1Id)
      expect(result).toContain(opponent2Id)
    })
  })

  describe('dayOfWeekActivity', () => {
    test('should not contains values if the player did not attend any tournaments this year', () => {
      const player = PlayerFactory.build()

      expect(player.dayOfWeekActivity()).toEqual([
        { count: 0, day: 'Sun' },
        { count: 0, day: 'Mon' },
        { count: 0, day: 'Tue' },
        { count: 0, day: 'Wed' },
        { count: 0, day: 'Thu' },
        { count: 0, day: 'Fri' },
        { count: 0, day: 'Sat' },
      ])
    })

    test('should contains values if the player did attend tournaments this year', () => {
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

      expect(player.dayOfWeekActivity()).toEqual([
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

  describe('tournamentsByMonth', () => {
    test('should not contains values if the player did not attend any tournaments this year', () => {
      const player = PlayerFactory.build()

      expect(player.tournamentsByMonth()).toEqual([
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

    test('should contains values if the player did attend tournaments this year', () => {
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

      expect(player.tournamentsByMonth()).toEqual([
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

  describe('cleanSweeps', () => {
    test('should be 0 if the player did not attend any tournament this year', () => {
      const player = PlayerFactory.build()

      expect(player.cleanSweeps()).toBe(0)
    })

    test('should count clean sweeps', () => {
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
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId: opponentId,
                      score: 0,
                      seed: SeedFactory.build(),
                    }),
                  ),
                winnerId: playerId,
              }),
            }),
          ],
        }),
      })

      expect(player.cleanSweeps()).toBe(20)
    })
  })

  describe('reverseSweeps', () => {
    test('should return 0 won and lost if player did not attend any tournament', () => {
      const player = PlayerFactory.build()
      expect(player.reverseSweeps()).toEqual({ won: 0, lost: 0 })
    })

    test('should count won and lost reverse sweeps correctly', () => {
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

      // Set 1: player won reverse sweep
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

      // Set 2: player lost reverse sweep (opponent won reverse sweep)
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

      // Set 3: player lost but NOT a reverse sweep
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

      expect(player.reverseSweeps()).toEqual({ won: 1, lost: 1 })
    })
  })

  describe('totalDisqualifications', () => {
    test('should be 0 if the player did not attend any tournaments this year', () => {
      const player = PlayerFactory.build()

      expect(player.totalDisqualifications()).toBe(0)
    })

    test('should be 0 if the opponent is the one who DQed', () => {
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
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: true,
                      playerId: opponentId,
                      score: 0,
                      seed: SeedFactory.build(),
                    }),
                  ),
                winnerId: playerId,
              }),
            }),
          ],
        }),
      })

      expect(player.totalDisqualifications()).toBe(0)
    })

    test('should count DQs if the player is the one who DQed', () => {
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
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId: opponentId,
                      score: 0,
                      seed: SeedFactory.build(),
                    }),
                  ),
                winnerId: playerId,
              }),
            }),
          ],
        }),
      })

      expect(player.totalDisqualifications()).toBe(50)
    })
  })

  describe('totalSets', () => {
    test('should count total number of sets player by the player', () => {
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
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId: opponentId,
                      score: 2,
                      seed: SeedFactory.build(),
                    }),
                  ),
                winnerId: playerId,
              }),
            }),
          ],
        }),
      })

      expect(player.totalSets()).toBe(50)
    })
  })

  describe('headToHead', () => {
    test('should return empty list if player played no sets', () => {
      const player = PlayerFactory.build()
      expect(player.headToHead(10)).toEqual([])
    })

    test('should aggregate wins and losses against opponents and sort properly', () => {
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
      expect(resultTotal).toHaveLength(2)
      expect(resultTotal[0]).toEqual({
        opponentPlayerId: opponent1Id,
        playerWonSet: 1,
        opponentWonSet: 2,
        totalSets: 3,
        winRate: 1 / 3,
      })
      expect(resultTotal[1]).toEqual({
        opponentPlayerId: opponent2Id,
        playerWonSet: 2,
        opponentWonSet: 0,
        totalSets: 2,
        winRate: 1.0,
      })

      const resultWinRate = player.headToHead(10, 'winRate')
      expect(resultWinRate[0].opponentPlayerId).toBe(opponent2Id)
      expect(resultWinRate[1].opponentPlayerId).toBe(opponent1Id)

      const resultDiff = player.headToHead(10, 'diff')
      expect(resultDiff[0].opponentPlayerId).toBe(opponent2Id)
      expect(resultDiff[1].opponentPlayerId).toBe(opponent1Id)
    })
  })

  describe('decidingGameSets', () => {
    test('should return 0 count and win rate if player played no sets', () => {
      const player = PlayerFactory.build()
      expect(player.decidingGameSets()).toEqual({
        count: 0,
        winCount: 0,
        winRate: 0,
      })
    })

    test('should count deciding game sets and calculate win rate correctly', () => {
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

      expect(player.decidingGameSets()).toEqual({
        count: 2,
        winCount: 1,
        winRate: 0.5,
      })
    })
  })

  describe('bestPerformances and worstPerformance', () => {
    test('bestPerformances returns empty list if player has no tournaments with valid SPR', () => {
      const player = PlayerFactory.build()
      expect(player.bestPerformances(5)).toEqual([])
    })

    test('worstPerformance returns null if player has no tournaments with valid SPR', () => {
      const player = PlayerFactory.build()
      expect(player.worstPerformance()).toBeNull()
    })

    test('returns correct sorted performances based on SPR', () => {
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
      expect(best).toHaveLength(2)
      expect(best[0]).toEqual({ tournament: t2, spr: 5 })
      expect(best[1]).toEqual({ tournament: t1, spr: 2 })

      t1.getPlayerSPR = () => 3
      t2.getPlayerSPR = () => 1
      t3.getPlayerSPR = () => 4

      const worst = player.worstPerformance()
      expect(worst).not.toBeNull()
      expect(worst?.tournament).toBe(t2)
      expect(worst?.spr).toBe(1)
    })
  })

  describe('eventTypeBreakdown', () => {
    test('returns empty counts if player played no tournaments', () => {
      const player = PlayerFactory.build()
      expect(player.eventTypeBreakdown()).toEqual({
        [EventType.SINGLES]: 0,
        [EventType.TEAMS]: 0,
      })
    })

    test('correctly counts singles and teams events', () => {
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

      expect(player.eventTypeBreakdown()).toEqual({
        [EventType.SINGLES]: 3,
        [EventType.TEAMS]: 2,
      })
    })
  })
})
