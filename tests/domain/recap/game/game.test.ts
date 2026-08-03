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
})
