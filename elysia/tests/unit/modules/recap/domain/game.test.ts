import { CharacterFactory } from '#tests/factories/character_factory'
import { GameFactory } from '#tests/factories/game_factory'
import { describe, expect, test } from 'bun:test'
import { GameSelection } from '#recap/domain/game'
import { asEntrantId, asPlayerId } from '#shared/ids'

describe('Game - constructor', () => {
  test('initializes correctly with valid orderNum', () => {
    expect(() => GameFactory.build({ orderNum: 1 })).not.toThrow()
  })

  test.each([0, -1])('throws error if orderNum is zero or negative - %p', (orderNum) => {
    expect(() => GameFactory.build({ orderNum })).toThrow('Invalid parameter order num')
  })
})

describe('Game - getPlayerCharacter', () => {
  test('returns character if player has a selection', () => {
    const playerId = asPlayerId('1')
    const character = CharacterFactory.build({ name: 'Fox' })
    const game = GameFactory.build({
      selections: [new GameSelection(playerId, character)],
    })

    expect(game.getPlayerCharacter(playerId)).toBe(character)
  })

  test('returns null if player does not have a selection', () => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      selections: [],
    })

    expect(game.getPlayerCharacter(playerId)).toBeNull()
  })
})

describe('Game - getPlayerLossAgainstCharacter', () => {
  test('returns null if winnerId is null', () => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: null,
    })

    expect(game.getPlayerLossAgainstCharacter(playerId)).toBeNull()
  })

  test('returns null if player has no selection', () => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: playerId,
      selections: [],
    })

    expect(game.getPlayerLossAgainstCharacter(playerId)).toBeNull()
  })

  test('returns null if opponent has no selection', () => {
    const playerId = asPlayerId('1')
    const selection = new GameSelection(playerId, CharacterFactory.build())
    const game = GameFactory.build({
      winnerId: playerId,
      selections: [selection],
    })

    expect(game.getPlayerLossAgainstCharacter(playerId)).toBeNull()
  })
})

describe('Game - getPlayerLossAgainstCharacter (1v1)', () => {
  test('returns opponent character and lost=true if player lost the game', () => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')
    const charOpponent = CharacterFactory.build({ name: 'Marth' })

    const game = GameFactory.build({
      winnerId: opponentId,
      selections: [
        new GameSelection(playerId, CharacterFactory.build()),
        new GameSelection(opponentId, charOpponent),
      ],
    })

    const result = game.getPlayerLossAgainstCharacter(playerId)
    expect(result).not.toBeNull()
    expect(result!.lost).toBe(true)
    expect(result!.opponentCharacter).toBe(charOpponent)
  })

  test('returns opponent character and lost=false if player won the game', () => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')
    const charOpponent = CharacterFactory.build({ name: 'Marth' })

    const game = GameFactory.build({
      winnerId: playerId,
      selections: [
        new GameSelection(playerId, CharacterFactory.build()),
        new GameSelection(opponentId, charOpponent),
      ],
    })

    const result = game.getPlayerLossAgainstCharacter(playerId)
    expect(result).not.toBeNull()
    expect(result!.lost).toBe(false)
    expect(result!.opponentCharacter).toBe(charOpponent)
  })
})

describe('Game - getPlayerLossAgainstCharacter (Teams)', () => {
  test('returns opponent character and lost=true if player lost the game, ignoring teammate character', () => {
    const playerId = asPlayerId('1')
    const teammateId = asPlayerId('2')
    const opponentId1 = asPlayerId('3')
    const opponentId2 = asPlayerId('4')
    const myEntrantId = asEntrantId('team-1')
    const opponentEntrantId = asEntrantId('team-2')

    const charOpponent = CharacterFactory.build({ name: 'Fox' })

    const game = GameFactory.build({
      winnerId: opponentId1,
      selections: [
        new GameSelection(playerId, CharacterFactory.build(), myEntrantId),
        new GameSelection(teammateId, CharacterFactory.build(), myEntrantId),
        new GameSelection(opponentId1, charOpponent, opponentEntrantId),
        new GameSelection(opponentId2, CharacterFactory.build(), opponentEntrantId),
      ],
    })

    const result = game.getPlayerLossAgainstCharacter(playerId)
    expect(result).not.toBeNull()
    expect(result!.lost).toBe(true)
    expect(result!.opponentCharacter).toBe(charOpponent)
  })

  test('returns opponent character and lost=false if player won the game, ignoring teammate character', () => {
    const playerId = asPlayerId('1')
    const teammateId = asPlayerId('2')
    const opponentId1 = asPlayerId('3')
    const opponentId2 = asPlayerId('4')
    const myEntrantId = asEntrantId('team-1')
    const opponentEntrantId = asEntrantId('team-2')

    const charOpponent = CharacterFactory.build({ name: 'Fox' })

    const game = GameFactory.build({
      winnerId: playerId,
      selections: [
        new GameSelection(playerId, CharacterFactory.build(), myEntrantId),
        new GameSelection(teammateId, CharacterFactory.build(), myEntrantId),
        new GameSelection(opponentId1, charOpponent, opponentEntrantId),
        new GameSelection(opponentId2, CharacterFactory.build(), opponentEntrantId),
      ],
    })

    const result = game.getPlayerLossAgainstCharacter(playerId)
    expect(result).not.toBeNull()
    expect(result!.lost).toBe(false)
    expect(result!.opponentCharacter).toBe(charOpponent)
  })
})

describe('Game - getStageActivity', () => {
  test('returns null if stage is null', () => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      stage: null,
    })

    expect(game.getStageActivity(playerId)).toBeNull()
  })

  test('returns null if winnerId is null', () => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: null,
    })

    expect(game.getStageActivity(playerId)).toBeNull()
  })

  test('returns stage activity with won true if winnerId matches playerId', () => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: playerId,
    })

    const result = game.getStageActivity(playerId)
    expect(result).not.toBeNull()
    expect(result!.won).toBe(true)
    expect(result!.stage).toBe(game.stage!)
  })

  test('returns stage activity with won false if winnerId does not match playerId', () => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')
    const game = GameFactory.build({
      winnerId: opponentId,
    })

    const result = game.getStageActivity(playerId)
    expect(result).not.toBeNull()
    expect(result!.won).toBe(false)
    expect(result!.stage).toBe(game.stage!)
  })
})
