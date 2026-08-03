import { SetPlayer } from '#/domain/recap/set'
import { asPlayerId } from '#/domain/shared-kernel/ids'
import { EventFactory } from '#tests/factories/event-factory.ts'
import { PlayerFactory } from '#tests/factories/player-factory.ts'
import { SeedFactory } from '#tests/factories/seed-factory.ts'
import { SetFactory } from '#tests/factories/set-factory.ts'
import { TournamentFactory } from '#tests/factories/tournament-factory.ts'
import { describe, expect, test } from 'vitest'

describe('Player', () => {
  test.todo('mostPlayedCharacters')
  test.todo('highestUpset')
  test.todo('encounteredCharacters')
  test.todo('stageActivity')
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
    test("should count total number of sets player by the player", () => {
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
