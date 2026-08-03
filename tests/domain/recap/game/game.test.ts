import { describe, expect, test } from 'vitest'
import { GameFactory } from '#tests/factories/game-factory'
import { CharacterFactory } from '#tests/factories/character-factory'
import { GameSelection } from '#/domain/recap/game'
import { asPlayerId } from '#/domain/shared-kernel/ids'

describe('Game', () => {
  test.todo('initialization')

  describe('getPlayerCharacter', () => {
    test('returns character if player has a selection', () => {
      const playerId = asPlayerId('1')
      const character = CharacterFactory.merge({ name: 'Fox' }).make()
      const game = GameFactory.merge({
        selections: [new GameSelection(playerId, character)],
      }).make()

      expect(game.getPlayerCharacter(playerId)).toBe(character)
    })

    test('returns null if player does not have a selection', () => {
      const playerId = asPlayerId('1')
      const game = GameFactory.merge({
        selections: [],
      }).make()

      expect(game.getPlayerCharacter(playerId)).toBeNull()
    })
  })

  describe('getStageActivity', () => {
    test('returns null if stage is null', () => {
      const playerId = asPlayerId('1')
      const game = GameFactory.merge({
        stage: null,
      }).make()

      expect(game.getStageActivity(playerId)).toBeNull()
    })

    test('returns null if winnerId is null', () => {
      const playerId = asPlayerId('1')
      const game = GameFactory.merge({
        winnerId: null,
      }).make()

      expect(game.getStageActivity(playerId)).toBeNull()
    })

    test('returns stage activity with won true if winnerId matches playerId', () => {
      const playerId = asPlayerId('1')
      const game = GameFactory.merge({
        winnerId: playerId,
      }).make()

      const result = game.getStageActivity(playerId)
      expect(result).not.toBeNull()
      expect(result!.won).toBe(true)
      expect(result!.stage).toBe(game.stage)
    })

    test('returns stage activity with won false if winnerId does not match playerId', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')
      const game = GameFactory.merge({
        winnerId: opponentId,
      }).make()

      const result = game.getStageActivity(playerId)
      expect(result).not.toBeNull()
      expect(result!.won).toBe(false)
      expect(result!.stage).toBe(game.stage)
    })
  })

  describe('getPlayerLossAgainstCharacter', () => {
    test('returns null if winnerId is null', () => {
      const playerId = asPlayerId('1')
      const game = GameFactory.merge({
        winnerId: null,
      }).make()

      expect(game.getPlayerLossAgainstCharacter(playerId)).toBeNull()
    })

    test('returns null if player has no selection', () => {
      const playerId = asPlayerId('1')
      const game = GameFactory.merge({
        winnerId: playerId,
        selections: [],
      }).make()

      expect(game.getPlayerLossAgainstCharacter(playerId)).toBeNull()
    })

    test('returns null if opponent has no selection', () => {
      const playerId = asPlayerId('1')
      const selection = new GameSelection(playerId, CharacterFactory.make())
      const game = GameFactory.merge({
        winnerId: playerId,
        selections: [selection],
      }).make()

      expect(game.getPlayerLossAgainstCharacter(playerId)).toBeNull()
    })

    test('returns opponent character and lost true if player lost the game', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')
      const charOpponent = CharacterFactory.merge({ name: 'Marth' }).make()

      const game = GameFactory.merge({
        winnerId: opponentId,
        selections: [
          new GameSelection(playerId, CharacterFactory.make()),
          new GameSelection(opponentId, charOpponent),
        ],
      }).make()

      const result = game.getPlayerLossAgainstCharacter(playerId)
      expect(result).not.toBeNull()
      expect(result!.lost).toBe(true)
      expect(result!.opponentCharacter).toBe(charOpponent)
    })

    test('returns opponent character and lost false if player won the game', () => {
      const playerId = asPlayerId('1')
      const opponentId = asPlayerId('2')
      const charOpponent = CharacterFactory.merge({ name: 'Marth' }).make()

      const game = GameFactory.merge({
        winnerId: playerId,
        selections: [
          new GameSelection(playerId, CharacterFactory.make()),
          new GameSelection(opponentId, charOpponent),
        ],
      }).make()

      const result = game.getPlayerLossAgainstCharacter(playerId)
      expect(result).not.toBeNull()
      expect(result!.lost).toBe(false)
      expect(result!.opponentCharacter).toBe(charOpponent)
    })
  })
})
