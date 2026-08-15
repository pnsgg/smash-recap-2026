import { describe, expect, test } from 'vitest'
import { SetFactory } from '#tests/factories/set-factory'
import { SetPlayer } from '#/domain/recap/set'
import { Seed } from '#/domain/recap/seed'
import { BracketType } from '#/domain/recap/bracket-type'
import { asPlayerId } from '#/domain/shared-kernel/ids'
import { CharacterFactory } from '#tests/factories/character-factory'
import { GameFactory } from '#tests/factories/game-factory'
import { GameSelection } from '#/domain/recap/game'

describe('Set', () => {
  describe('constructor', () => {
    test('initializes Set correctly with valid attributes', () => {
      expect(() => SetFactory.build()).not.toThrow()
    })

    test('throws error if fullRoundText is empty or whitespace', () => {
      expect(() => SetFactory.build({ fullRoundText: '' as any })).toThrow(
        'Invalid parameter full round text',
      )
      expect(() => SetFactory.build({ fullRoundText: '   ' as any })).toThrow(
        'Invalid parameter full round text',
      )
    })

    test('SetPlayer throws error if score is negative', () => {
      const pId = asPlayerId('player-1')
      expect(
        () =>
          new SetPlayer({
            playerId: pId,
            seed: new Seed(1, 5),
            score: -1,
            isDisqualified: false,
          }),
      ).toThrow('Invalid parameter score')
    })

    test('sorts games automatically by orderNum', () => {
      const game1 = GameFactory.build({ orderNum: 1 })
      const game2 = GameFactory.build({ orderNum: 2 })
      const game3 = GameFactory.build({ orderNum: 3 })

      const set = SetFactory.build({
        games: [game3, game1, game2],
      })

      expect(set.games).toEqual([game1, game2, game3])
    })
  })

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

          const set = SetFactory.build({
            bracketType: bracket,
            competitors: new Map([
              [p1Id, player1],
              [p2Id, player2],
            ]),
            winnerId: p1Id,
          })

          expect(set.isUpset()).toBe(isUpset)
          expect(set.upsetFactor()).toBe(expectedFactor)
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

        const set = SetFactory.build({
          bracketType: BracketType.SWISS,
          competitors: new Map([
            [p1Id, player1],
            [p2Id, player2],
          ]),
          winnerId: p1Id,
        })

        expect(set.isUpset()).toBe(false)
        expect(set.upsetFactor()).toBeNull()
      })
    })

    describe('disqualified competitors', () => {
      test('returns null upsetFactor and false isUpset when a competitor is disqualified', () => {
        const p1Id = asPlayerId('player-1')
        const p2Id = asPlayerId('player-2')

        const player1 = new SetPlayer({
          playerId: p1Id,
          seed: new Seed(8, 5),
          score: 0,
          isDisqualified: false,
        })
        const player2 = new SetPlayer({
          playerId: p2Id,
          seed: new Seed(2, 5),
          score: 0,
          isDisqualified: true,
        })

        const set = SetFactory.build({
          competitors: new Map([
            [p1Id, player1],
            [p2Id, player2],
          ]),
          winnerId: p1Id,
        })

        expect(set.isUpset()).toBe(false)
        expect(set.upsetFactor()).toBeNull()
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

      const set = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
      })

      expect(set.isCleanSweep()).toBe(true)

      const player2WithOne = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 1,
        isDisqualified: false,
      })
      const setNotSweep = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2WithOne],
        ]),
        winnerId: p1Id,
      })
      expect(setNotSweep.isCleanSweep()).toBe(false)
    })
  })

  describe('reverse sweeps', () => {
    test('detects reverse sweeps correctly', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(1, 5),
        score: 3,
        isDisqualified: false,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 2,
        isDisqualified: false,
      })

      // Bo5 Reverse Sweep won by p1
      const bo5SweepSet = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
        games: [
          GameFactory.build({ orderNum: 1, winnerId: p2Id }),
          GameFactory.build({ orderNum: 2, winnerId: p2Id }),
          GameFactory.build({ orderNum: 3, winnerId: p1Id }),
          GameFactory.build({ orderNum: 4, winnerId: p1Id }),
          GameFactory.build({ orderNum: 5, winnerId: p1Id }),
        ],
      })

      expect(bo5SweepSet.isReverseSweepWon(p1Id)).toBe(true)
      expect(bo5SweepSet.isReverseSweepWon(p2Id)).toBe(false)
      expect(bo5SweepSet.isReverseSweepLost(p1Id)).toBe(false)
      expect(bo5SweepSet.isReverseSweepLost(p2Id)).toBe(true)

      // Bo5 standard win (not reverse sweep)
      const bo5StandardSet = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
        games: [
          GameFactory.build({ orderNum: 1, winnerId: p2Id }),
          GameFactory.build({ orderNum: 2, winnerId: p1Id }),
          GameFactory.build({ orderNum: 3, winnerId: p2Id }),
          GameFactory.build({ orderNum: 4, winnerId: p1Id }),
          GameFactory.build({ orderNum: 5, winnerId: p1Id }),
        ],
      })

      expect(bo5StandardSet.isReverseSweepWon(p1Id)).toBe(false)
      expect(bo5StandardSet.isReverseSweepLost(p2Id)).toBe(false)

      // Bo3 Reverse Sweep won by p1
      const bo3SweepSet = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
        games: [
          GameFactory.build({ orderNum: 1, winnerId: p2Id }),
          GameFactory.build({ orderNum: 2, winnerId: p1Id }),
          GameFactory.build({ orderNum: 3, winnerId: p1Id }),
        ],
      })

      expect(bo3SweepSet.isReverseSweepWon(p1Id)).toBe(true)
      expect(bo3SweepSet.isReverseSweepLost(p2Id)).toBe(true)
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

      const decidingSet = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p1Id,
      })
      expect(decidingSet.isDecidingGameSet()).toBe(true)

      const player2Zero = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })
      const regularSet = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2Zero],
        ]),
        winnerId: p1Id,
      })
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
      const set = SetFactory.build({
        competitors: new Map([[p1Id, player1]]),
      })

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
      const set = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
      })

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

      const set = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
        winnerId: p2Id,
      })

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

      const set = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
      })

      expect(set.isPlayerDisqualified(unknownPlayerId)).toBe(false)
    })
  })

  describe('getPlayerCharacters', () => {
    test('returns all characters played by the player across games', () => {
      const playerId = asPlayerId('player-1')
      const fox = CharacterFactory.build({ name: 'Fox' })
      const marth = CharacterFactory.build({ name: 'Marth' })

      const game1 = GameFactory.build({
        orderNum: 1,
        selections: [new GameSelection(playerId, fox)],
      })
      const game2 = GameFactory.build({
        orderNum: 2,
        selections: [new GameSelection(playerId, marth)],
      })

      const set = SetFactory.build({
        games: [game1, game2],
      })

      const characters = set.getPlayerCharacters(playerId)
      expect(characters).toHaveLength(2)
      expect(characters).toContain(fox)
      expect(characters).toContain(marth)
    })

    test('returns empty array if no characters are found', () => {
      const playerId = asPlayerId('player-1')
      const game1 = GameFactory.build({ orderNum: 1, selections: [] })

      const set = SetFactory.build({
        games: [game1],
      })

      expect(set.getPlayerCharacters(playerId)).toEqual([])
    })
  })

  describe('getOpponentCharacters', () => {
    test('returns empty array if player is not in competitors', () => {
      const playerId = asPlayerId('player-1')
      const set = SetFactory.build({
        competitors: new Map(),
      })

      expect(set.getOpponentCharacters(playerId)).toEqual([])
    })

    test('returns empty array if there is no opponent competitor', () => {
      const playerId = asPlayerId('player-1')
      const player = new SetPlayer({
        playerId,
        seed: new Seed(1, 5),
        score: 0,
        isDisqualified: false,
      })
      const set = SetFactory.build({
        competitors: new Map([[playerId, player]]),
      })

      expect(set.getOpponentCharacters(playerId)).toEqual([])
    })

    test('returns all characters played by the opponent player across games', () => {
      const playerId = asPlayerId('player-1')
      const opponentId = asPlayerId('player-2')
      const fox = CharacterFactory.build({ name: 'Fox' })
      const marth = CharacterFactory.build({ name: 'Marth' })

      const player = new SetPlayer({
        playerId,
        seed: new Seed(1, 5),
        score: 0,
        isDisqualified: false,
      })
      const opponent = new SetPlayer({
        playerId: opponentId,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const game1 = GameFactory.build({
        orderNum: 1,
        selections: [new GameSelection(opponentId, fox)],
      })
      const game2 = GameFactory.build({
        orderNum: 2,
        selections: [new GameSelection(opponentId, marth)],
      })

      const set = SetFactory.build({
        competitors: new Map([
          [playerId, player],
          [opponentId, opponent],
        ]),
        games: [game1, game2],
      })

      const characters = set.getOpponentCharacters(playerId)
      expect(characters).toHaveLength(2)
      expect(characters).toContain(fox)
      expect(characters).toContain(marth)
    })
  })

  describe('getStageActivity', () => {
    test('returns empty array if player is not in competitors', () => {
      const playerId = asPlayerId('player-1')
      const set = SetFactory.build({
        competitors: new Map(),
      })

      expect(set.getStageActivity(playerId)).toEqual([])
    })

    test('returns empty array if a competitor is disqualified', () => {
      const playerId = asPlayerId('player-1')
      const opponentId = asPlayerId('player-2')

      const player = new SetPlayer({
        playerId,
        seed: new Seed(1, 5),
        score: 0,
        isDisqualified: true,
      })
      const opponent = new SetPlayer({
        playerId: opponentId,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.build({
        competitors: new Map([
          [playerId, player],
          [opponentId, opponent],
        ]),
      })

      expect(set.getStageActivity(playerId)).toEqual([])
    })

    test('returns stage activity outcomes for the player from games', () => {
      const playerId = asPlayerId('player-1')
      const opponentId = asPlayerId('player-2')

      const player = new SetPlayer({
        playerId,
        seed: new Seed(1, 5),
        score: 2,
        isDisqualified: false,
      })
      const opponent = new SetPlayer({
        playerId: opponentId,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const game1 = GameFactory.build({
        orderNum: 1,
        winnerId: playerId,
      })
      const game2 = GameFactory.build({
        orderNum: 2,
        winnerId: opponentId,
      })
      const game3 = GameFactory.build({
        orderNum: 3,
        winnerId: playerId,
        stage: null,
      })

      const set = SetFactory.build({
        competitors: new Map([
          [playerId, player],
          [opponentId, opponent],
        ]),
        games: [game1, game2, game3],
      })

      expect(set.getStageActivity(playerId)).toEqual([
        { stage: game1.stage, won: true },
        { stage: game2.stage, won: false },
      ])
    })
  })

  describe('getPlayerLossesAgainstCharacters', () => {
    test('returns empty array if player is not in competitors', () => {
      const playerId = asPlayerId('player-1')
      const set = SetFactory.build({
        competitors: new Map(),
      })

      expect(set.getPlayerLossesAgainstCharacters(playerId)).toEqual([])
    })

    test('returns empty array if a competitor is disqualified', () => {
      const playerId = asPlayerId('player-1')
      const opponentId = asPlayerId('player-2')

      const player = new SetPlayer({
        playerId,
        seed: new Seed(1, 5),
        score: 0,
        isDisqualified: true,
      })
      const opponent = new SetPlayer({
        playerId: opponentId,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.build({
        competitors: new Map([
          [playerId, player],
          [opponentId, opponent],
        ]),
      })

      expect(set.getPlayerLossesAgainstCharacters(playerId)).toEqual([])
    })

    test('returns records of player loss outcomes against opponent characters in the games', () => {
      const playerId = asPlayerId('player-1')
      const opponentId = asPlayerId('player-2')
      const fox = CharacterFactory.build({ name: 'Fox' })
      const marth = CharacterFactory.build({ name: 'Marth' })

      const player = new SetPlayer({
        playerId,
        seed: new Seed(1, 5),
        score: 2,
        isDisqualified: false,
      })
      const opponent = new SetPlayer({
        playerId: opponentId,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const game1 = GameFactory.build({
        orderNum: 1,
        winnerId: playerId,
        selections: [
          new GameSelection(playerId, CharacterFactory.build()),
          new GameSelection(opponentId, fox),
        ],
      })
      const game2 = GameFactory.build({
        orderNum: 2,
        winnerId: opponentId,
        selections: [
          new GameSelection(playerId, CharacterFactory.build()),
          new GameSelection(opponentId, marth),
        ],
      })
      const game3 = GameFactory.build({
        orderNum: 3,
        winnerId: opponentId,
        selections: [],
      })

      const set = SetFactory.build({
        competitors: new Map([
          [playerId, player],
          [opponentId, opponent],
        ]),
        games: [game1, game2, game3],
      })

      expect(set.getPlayerLossesAgainstCharacters(playerId)).toEqual([
        { opponentCharacter: fox, lost: false },
        { opponentCharacter: marth, lost: true },
      ])
    })
  })

  describe('getOpponentPlayerIds', () => {
    test('returns opponent player ids', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(1, 5),
        score: 0,
        isDisqualified: false,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
      })

      expect(set.getOpponentPlayerIds(p1Id)).toEqual([p2Id])
    })

    test('returns empty array if player is not a competitor', () => {
      const p1Id = asPlayerId('player-1')
      const p2Id = asPlayerId('player-2')
      const otherId = asPlayerId('player-3')

      const player1 = new SetPlayer({
        playerId: p1Id,
        seed: new Seed(1, 5),
        score: 0,
        isDisqualified: false,
      })
      const player2 = new SetPlayer({
        playerId: p2Id,
        seed: new Seed(2, 5),
        score: 0,
        isDisqualified: false,
      })

      const set = SetFactory.build({
        competitors: new Map([
          [p1Id, player1],
          [p2Id, player2],
        ]),
      })

      expect(set.getOpponentPlayerIds(otherId)).toEqual([])
    })
  })
})
