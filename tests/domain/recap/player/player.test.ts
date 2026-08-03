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
import { describe, expect, test } from 'vitest'

describe('Player', () => {
  describe('mostPlayedCharacters', () => {
    test('should return empty list if player did not play any games or characters', () => {
      const player = PlayerFactory.make()
      expect(player.mostPlayedCharacters(3)).toEqual([])
    })

    test('should count, sort, and limit character usage', () => {
      const playerId = asPlayerId('1')
      const charFox = CharacterFactory.merge({ name: 'Fox' }).make()
      const charMarth = CharacterFactory.merge({ name: 'Marth' }).make()
      const charFalco = CharacterFactory.merge({ name: 'Falco' }).make()

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: [
          TournamentFactory.merge({
            events: [
              EventFactory.merge({
                sets: [
                  SetFactory.merge({
                    competitors: new Map([
                      [
                        playerId,
                        new SetPlayer({
                          playerId,
                          seed: SeedFactory.make(),
                          score: 3,
                          isDisqualified: false,
                        }),
                      ],
                    ]),
                    games: [
                      GameFactory.merge({
                        selections: [new GameSelection(playerId, charFox)],
                      }).make(),
                      GameFactory.merge({
                        selections: [new GameSelection(playerId, charFox)],
                      }).make(),
                      GameFactory.merge({
                        selections: [new GameSelection(playerId, charFox)],
                      }).make(),
                      GameFactory.merge({
                        selections: [new GameSelection(playerId, charMarth)],
                      }).make(),
                      GameFactory.merge({
                        selections: [new GameSelection(playerId, charMarth)],
                      }).make(),
                      GameFactory.merge({
                        selections: [new GameSelection(playerId, charFalco)],
                      }).make(),
                    ],
                  }).make(),
                ],
              }).make(),
            ],
          }).make(),
        ],
      }).make()

      const result = player.mostPlayedCharacters(2)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ character: charFox, count: 3 })
      expect(result[1]).toEqual({ character: charMarth, count: 2 })
    })
  })

  describe('highestUpset', () => {
    test('should return null if there are no tournaments or sets played', () => {
      const player = PlayerFactory.make()
      expect(player.highestUpset()).toBeNull()
    })

    test('should return null if player won no sets or achieved no upsets', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: [
          TournamentFactory.merge({
            events: [
              EventFactory.merge({
                bracketType: BracketType.DOUBLE_ELIMINATION,
                sets: [
                  SetFactory.merge({
                    competitors: new Map([
                      [
                        playerId,
                        new SetPlayer({
                          playerId,
                          seed: SeedFactory.merge({
                            initialSeed: 1,
                            finalPlacement: 1,
                          }).make(),
                          score: 3,
                          isDisqualified: false,
                        }),
                      ],
                      [
                        opponentId,
                        new SetPlayer({
                          playerId: opponentId,
                          seed: SeedFactory.merge({
                            initialSeed: 2,
                            finalPlacement: 2,
                          }).make(),
                          score: 0,
                          isDisqualified: false,
                        }),
                      ],
                    ]),
                    winnerId: playerId,
                  }).make(),
                ],
              }).make(),
            ],
          }).make(),
        ],
      }).make()

      expect(player.highestUpset()).toBeNull()
    })

    test('should return the set with the highest upset factor', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const expectedSet = SetFactory.merge({
        competitors: new Map([
          [
            playerId,
            new SetPlayer({
              playerId,
              seed: SeedFactory.merge({
                initialSeed: 4,
                finalPlacement: 1,
              }).make(),
              score: 3,
              isDisqualified: false,
            }),
          ],
          [
            opponentId,
            new SetPlayer({
              playerId: opponentId,
              seed: SeedFactory.merge({
                initialSeed: 2,
                finalPlacement: 2,
              }).make(),
              score: 0,
              isDisqualified: false,
            }),
          ],
        ]),
        winnerId: playerId,
      }).make()

      const minorUpsetSet = SetFactory.merge({
        competitors: new Map([
          [
            playerId,
            new SetPlayer({
              playerId,
              seed: SeedFactory.merge({
                initialSeed: 3,
                finalPlacement: 1,
              }).make(),
              score: 3,
              isDisqualified: false,
            }),
          ],
          [
            opponentId,
            new SetPlayer({
              playerId: opponentId,
              seed: SeedFactory.merge({
                initialSeed: 2,
                finalPlacement: 2,
              }).make(),
              score: 0,
              isDisqualified: false,
            }),
          ],
        ]),
        winnerId: playerId,
      }).make()

      const event = EventFactory.merge({
        bracketType: BracketType.DOUBLE_ELIMINATION,
        sets: [minorUpsetSet, expectedSet],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event],
      }).make()

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: [tournament],
      }).make()

      const upset = player.highestUpset()
      expect(upset).not.toBeNull()
      expect(upset?.set.id).toEqual(expectedSet.id)
      expect(upset?.factor).toBe(2)
    })
  })

  describe('encounteredCharacters', () => {
    test('should return empty list if there are no opponent characters encountered', () => {
      const player = PlayerFactory.make()
      expect(player.encounteredCharacters()).toEqual([])
    })

    test('should return unique characters played by opponents', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const myChar = CharacterFactory.merge({ name: 'Marth' }).make()
      const charFox = CharacterFactory.merge({ name: 'Fox' }).make()
      const charFalco = CharacterFactory.merge({ name: 'Falco' }).make()

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: [
          TournamentFactory.merge({
            events: [
              EventFactory.merge({
                sets: [
                  SetFactory.merge({
                    competitors: new Map([
                      [
                        playerId,
                        new SetPlayer({
                          playerId,
                          seed: SeedFactory.make(),
                          score: 2,
                          isDisqualified: false,
                        }),
                      ],
                      [
                        opponentId,
                        new SetPlayer({
                          playerId: opponentId,
                          seed: SeedFactory.make(),
                          score: 1,
                          isDisqualified: false,
                        }),
                      ],
                    ]),
                    games: [
                      GameFactory.merge({
                        selections: [
                          new GameSelection(playerId, myChar),
                          new GameSelection(opponentId, charFox),
                        ],
                      }).make(),
                      GameFactory.merge({
                        selections: [
                          new GameSelection(playerId, myChar),
                          new GameSelection(opponentId, charFox),
                        ],
                      }).make(),
                      GameFactory.merge({
                        selections: [
                          new GameSelection(playerId, myChar),
                          new GameSelection(opponentId, charFalco),
                        ],
                      }).make(),
                    ],
                  }).make(),
                ],
              }).make(),
            ],
          }).make(),
        ],
      }).make()

      const result = player.encounteredCharacters()
      expect(result).toHaveLength(2)
      // Verify names of encountered characters
      const names = result.map((c) => c.name)
      expect(names).toContain('Fox')
      expect(names).toContain('Falco')
    })
  })

  describe('stageActivity', () => {
    test('should return empty list if there is no stage activity', () => {
      const player = PlayerFactory.make()
      expect(player.stageActivity()).toEqual([])
    })

    test('should aggregate stage usage counts and win rates, excluding DQ sets', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const stageBF = StageFactory.merge({ name: 'Battlefield' }).make()
      const stageFD = StageFactory.merge({ name: 'Final Destination' }).make()
      const stageSV = StageFactory.merge({ name: 'Smashville' }).make()

      const game1 = GameFactory.merge({
        stage: stageBF,
        winnerId: playerId,
      }).make()

      const game2 = GameFactory.merge({
        stage: stageBF,
        winnerId: opponentId,
      }).make()

      const game3 = GameFactory.merge({
        stage: stageFD,
        winnerId: playerId,
      }).make()

      const game4 = GameFactory.merge({
        stage: stageSV,
        winnerId: playerId,
      }).make()

      const validSet = SetFactory.merge({
        competitors: new Map([
          [
            playerId,
            new SetPlayer({
              playerId,
              seed: SeedFactory.make(),
              score: 2,
              isDisqualified: false,
            }),
          ],
          [
            opponentId,
            new SetPlayer({
              playerId: opponentId,
              seed: SeedFactory.make(),
              score: 1,
              isDisqualified: false,
            }),
          ],
        ]),
        games: [game1, game2, game3],
      }).make()

      const dqSet = SetFactory.merge({
        competitors: new Map([
          [
            playerId,
            new SetPlayer({
              playerId,
              seed: SeedFactory.make(),
              score: 1,
              isDisqualified: true,
            }),
          ],
          [
            opponentId,
            new SetPlayer({
              playerId: opponentId,
              seed: SeedFactory.make(),
              score: 0,
              isDisqualified: false,
            }),
          ],
        ]),
        games: [game4],
      }).make()

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: [
          TournamentFactory.merge({
            events: [
              EventFactory.merge({
                sets: [validSet, dqSet],
              }).make(),
            ],
          }).make(),
        ],
      }).make()

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
  test.todo('worstMatchups')
  test.todo('uniqueOpponentsFaced')

  describe('dayOfWeekActivity', () => {
    test('should not contains values if the player did not attend any tournaments this year', () => {
      const player = PlayerFactory.make()

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
      const player = PlayerFactory.merge({
        tournaments: [
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-25'),
          }).makeMany(100),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-26'),
          }).makeMany(1),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-28'),
          }).makeMany(5),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-29'),
          }).makeMany(3),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-30'),
          }).makeMany(2),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-31'),
          }).makeMany(9),
          ...TournamentFactory.merge({
            startDate: new Date('2026-08-03'),
          }).makeMany(6),
        ],
      }).make()

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
      const player = PlayerFactory.make()

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
      const player = PlayerFactory.merge({
        tournaments: [
          ...TournamentFactory.merge({
            startDate: new Date('2026-01-01'),
          }).makeMany(100),
          ...TournamentFactory.merge({
            startDate: new Date('2026-02-01'),
          }).makeMany(50),
          ...TournamentFactory.merge({
            startDate: new Date('2026-03-01'),
          }).makeMany(25),
          ...TournamentFactory.merge({
            startDate: new Date('2026-04-01'),
          }).makeMany(17),
          ...TournamentFactory.merge({
            startDate: new Date('2026-05-01'),
          }).makeMany(71),
          ...TournamentFactory.merge({
            startDate: new Date('2026-06-01'),
          }).makeMany(35),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-01'),
          }).makeMany(70),
          ...TournamentFactory.merge({
            startDate: new Date('2026-08-01'),
          }).makeMany(0),
          ...TournamentFactory.merge({
            startDate: new Date('2026-09-01'),
          }).makeMany(1),
          ...TournamentFactory.merge({
            startDate: new Date('2026-10-01'),
          }).makeMany(2),
          ...TournamentFactory.merge({
            startDate: new Date('2026-11-01'),
          }).makeMany(4),
          ...TournamentFactory.merge({
            startDate: new Date('2026-12-01'),
          }).makeMany(8),
        ],
      }).make()

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
      const player = PlayerFactory.make()

      expect(player.cleanSweeps()).toBe(0)
    })

    test('should count clean sweeps', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: TournamentFactory.merge({
          events: [
            EventFactory.merge({
              sets: SetFactory.merge({
                competitors: new Map()
                  .set(
                    playerId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId,
                      score: 3,
                      seed: SeedFactory.make(),
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId: opponentId,
                      score: 0,
                      seed: SeedFactory.make(),
                    }),
                  ),
                winnerId: playerId,
              }).makeMany(10),
            }).make(),
          ],
        }).makeMany(2),
      }).make()

      expect(player.cleanSweeps()).toBe(20)
    })
  })

  describe('totalDisqualifications', () => {
    test('should be 0 if the player did not attend any tournaments this year', () => {
      const player = PlayerFactory.make()

      expect(player.totalDisqualifications()).toBe(0)
    })

    test('should be 0 if the opponent is the one who DQed', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: TournamentFactory.merge({
          events: [
            EventFactory.merge({
              sets: SetFactory.merge({
                competitors: new Map()
                  .set(
                    playerId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId,
                      score: 0,
                      seed: SeedFactory.make(),
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: true,
                      playerId: opponentId,
                      score: 0,
                      seed: SeedFactory.make(),
                    }),
                  ),
                winnerId: playerId,
              }).makeMany(10),
            }).make(),
          ],
        }).makeMany(5),
      }).make()

      expect(player.totalDisqualifications()).toBe(0)
    })

    test('should count DQs if the player is the one who DQed', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: TournamentFactory.merge({
          events: [
            EventFactory.merge({
              sets: SetFactory.merge({
                competitors: new Map()
                  .set(
                    playerId,
                    new SetPlayer({
                      isDisqualified: true,
                      playerId,
                      score: 0,
                      seed: SeedFactory.make(),
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId: opponentId,
                      score: 0,
                      seed: SeedFactory.make(),
                    }),
                  ),
                winnerId: playerId,
              }).makeMany(10),
            }).make(),
          ],
        }).makeMany(5),
      }).make()

      expect(player.totalDisqualifications()).toBe(50)
    })
  })

  describe('totalSets', () => {
    test('should count total number of sets player by the player', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')

      const player = PlayerFactory.merge({
        id: playerId,
        tournaments: TournamentFactory.merge({
          events: [
            EventFactory.merge({
              sets: SetFactory.merge({
                competitors: new Map()
                  .set(
                    playerId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId,
                      score: 3,
                      seed: SeedFactory.make(),
                    }),
                  )
                  .set(
                    opponentId,
                    new SetPlayer({
                      isDisqualified: false,
                      playerId: opponentId,
                      score: 2,
                      seed: SeedFactory.make(),
                    }),
                  ),
                winnerId: playerId,
              }).makeMany(10),
            }).make(),
          ],
        }).makeMany(5),
      }).make()

      expect(player.totalSets()).toBe(50)
    })
  })
})
