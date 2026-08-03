import { describe, expect, test } from 'vitest'
import { SetFactory } from '#tests/factories/set-factory'
import { SetPlayer } from '#/domain/recap/set'
import { Seed } from '#/domain/recap/seed'
import { BracketType } from '#/domain/recap/bracket-type'
import { asPlayerId } from '#/domain/shared-kernel/ids'

describe('Set', () => {
  describe('upsetFactor & isUpset', () => {
    describe.each([
      {
        bracket: BracketType.SINGLE_ELIMINATION,
        upsetCases: [
          { winnerSeed: 8, loserSeed: 2, expectedFactor: 2, isUpset: true },
          { winnerSeed: 2, loserSeed: 8, expectedFactor: -2, isUpset: false },
          { winnerSeed: 8, loserSeed: 5, expectedFactor: 0, isUpset: false },
        ],
      },
      {
        bracket: BracketType.DOUBLE_ELIMINATION,
        upsetCases: [
          { winnerSeed: 8, loserSeed: 2, expectedFactor: 4, isUpset: true },
          { winnerSeed: 2, loserSeed: 8, expectedFactor: -4, isUpset: false },
          { winnerSeed: 8, loserSeed: 7, expectedFactor: 0, isUpset: false },
        ],
      },
    ])('$bracket bracket calculations', ({ bracket, upsetCases }) => {
      test.each(upsetCases)(
        'winner seed $winnerSeed vs loser seed $loserSeed results in upset=$isUpset, factor=$expectedFactor',
        ({ winnerSeed, loserSeed, expectedFactor, isUpset }) => {
          const p1Id = asPlayerId('player-1')
          const p2Id = asPlayerId('player-2')

          const player1 = new SetPlayer({
            playerId: p1Id,
            seed: new Seed(winnerSeed, 5),
            score: 2,
            isDisqualified: false,
          })
          const player2 = new SetPlayer({
            playerId: p2Id,
            seed: new Seed(loserSeed, 5),
            score: 0,
            isDisqualified: false,
          })

          const set = SetFactory.merge({
            competitors: new Map([
              [p1Id, player1],
              [p2Id, player2],
            ]),
            winnerId: p1Id,
          }).make()

          expect(set.isUpset(bracket)).toBe(isUpset)
          expect(set.upsetFactor(bracket)).toBe(expectedFactor)
        },
      )
    })

    describe('unsupported bracket types', () => {
      test('returns null upsetFactor and false isUpset', () => {
        const p1Id = asPlayerId('player-1')
        const p2Id = asPlayerId('player-2')

        const player1 = new SetPlayer({
          playerId: p1Id,
          seed: new Seed(8, 5),
          score: 2,
          isDisqualified: false,
        })
        const player2 = new SetPlayer({
          playerId: p2Id,
          seed: new Seed(2, 5),
          score: 0,
          isDisqualified: false,
        })

        const set = SetFactory.merge({
          competitors: new Map([
            [p1Id, player1],
            [p2Id, player2],
          ]),
          winnerId: p1Id,
        }).make()

        expect(set.isUpset(BracketType.SWISS)).toBe(false)
        expect(set.upsetFactor(BracketType.SWISS)).toBeNull()
      })
    })
  })

  describe('isCleanSweep', () => {
    test('isCleanSweep checks correctly', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(8, 5),
        score: 2,
        isDisqualified: false,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
      }).make()

      expect(set.isCleanSweep()).toBe(true)

      const player2WithOne = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 1,
        isDisqualified: false,
      })
      const setNotSweep = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2WithOne],
        ]),
        winnerId: p1Id,
      }).make()
      expect(setNotSweep.isCleanSweep()).toBe(false)
    })
  })

  describe('isDecidingGameSet', () => {
    test('isDecidingGameSet checks correctly', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(8, 5),
        score: 2,
        isDisqualified: false,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 1,
        isDisqualified: false,
      })

      const decidingSet = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
      }).make()
      expect(decidingSet.isDecidingGameSet()).toBe(true)

      const player2Zero = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })
      const regularSet = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2Zero],
        ]),
        winnerId: p1Id,
      }).make()
      expect(regularSet.isDecidingGameSet()).toBe(false)
    })

    test('returns false if there are fewer than 2 competitors', () => {
      const p1Id = asPlayerId('player-1')
      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(8, 5),
        score: 2,
        isDisqualified: false,
      })
      const set = SetFactory.merge({
        competitors: new Map([[p1Id, player1]]),
      }).make()

      expect(set.isDecidingGameSet()).toBe(false)
    })

    test('returns false if a competitor is disqualified', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')
      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(8, 5),
        score: 2,
        isDisqualified: true,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 1,
        isDisqualified: false,
      })
      const set = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
      }).make()

      expect(set.isDecidingGameSet()).toBe(false)
    })
  })

  describe('isPlayerDisqualified', () => {
    test('isPlayerDisqualified checks correctly', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(8, 5),
        score: 0,
        isDisqualified: true,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p2Id,
      }).make()

      expect(set.isPlayerDisqualified(p1Id)).toBe(true)
      expect(set.isPlayerDisqualified(p2Id)).toBe(false)
    })

    test('returns false if player is not a competitor', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')
      const unknownPlayerId = asPlayerId('player-unknown')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(8, 5),
        score: 2,
        isDisqualified: false,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.merge({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
      }).make()

      expect(set.isPlayerDisqualified(unknownPlayerId)).toBe(false)
    })
  })
})
