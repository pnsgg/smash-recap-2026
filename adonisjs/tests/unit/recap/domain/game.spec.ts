import { CharacterFactory } from '#tests/factories/character_factory'
import { GameFactory } from '#tests/factories/game_factory'
import { test } from '@japa/runner'
import { GameSelection } from '#recap/domain/game'
import { asEntrantId, asPlayerId } from '#shared/domain/ids'

test.group('Game - constructor', () => {
  test('initializes correctly with valid orderNum', ({ assert }) => {
    assert.doesNotThrow(() => GameFactory.build({ orderNum: 1 }))
  })

  test('throws error if orderNum is zero or negative - "{$self}"')
    .with([0, -1])
    .run(({ assert }, orderNum) => {
      assert.throws(() => GameFactory.build({ orderNum }), 'Invalid parameter order num')
    })
})

test.group('Game - getPlayerCharacter', () => {
  test('returns character if player has a selection', ({ assert }) => {
    const playerId = asPlayerId('1')
    const character = CharacterFactory.build({ name: 'Fox' })
    const game = GameFactory.build({
      selections: [new GameSelection(playerId, character)],
    })

    assert.equal(game.getPlayerCharacter(playerId), character)
  })

  test('returns null if player does not have a selection', ({ assert }) => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      selections: [],
    })

    assert.isNull(game.getPlayerCharacter(playerId))
  })
})

test.group('Game - getPlayerLossAgainstCharacter', () => {
  test('returns null if winnerId is null', ({ assert }) => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: null,
    })

    assert.isNull(game.getPlayerLossAgainstCharacter(playerId))
  })

  test('returns null if player has no selection', ({ assert }) => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: playerId,
      selections: [],
    })

    assert.isNull(game.getPlayerLossAgainstCharacter(playerId))
  })

  test('returns null if opponent has no selection', ({ assert }) => {
    const playerId = asPlayerId('1')
    const selection = new GameSelection(playerId, CharacterFactory.build())
    const game = GameFactory.build({
      winnerId: playerId,
      selections: [selection],
    })

    assert.isNull(game.getPlayerLossAgainstCharacter(playerId))
  })
})

test.group('Game - getPlayerLossAgainstCharacter (1v1)', () => {
  test('returns opponent character and lost=true if player lost the game', ({ assert }) => {
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
    assert.isNotNull(result)
    assert.equal(result!.lost, true)
    assert.equal(result!.opponentCharacter, charOpponent)
  })

  test('returns opponent character and lost=false if player won the game', ({ assert }) => {
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
    assert.isNotNull(result)
    assert.equal(result!.lost, false)
    assert.equal(result!.opponentCharacter, charOpponent)
  })
})

test.group('Game - getPlayerLossAgainstCharacter (Teams)', () => {
  test('returns opponent character and lost=true if player lost the game, ignoring teammate character', ({
    assert,
  }) => {
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
    assert.isNotNull(result)
    assert.equal(result!.lost, true)
    assert.equal(result!.opponentCharacter, charOpponent)
  })

  test('returns opponent character and lost=false if player won the game, ignoring teammate character', ({
    assert,
  }) => {
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
    assert.isNotNull(result)
    assert.equal(result!.lost, false)
    assert.equal(result!.opponentCharacter, charOpponent)
  })
})

test.group('Game - getStageActivity', () => {
  test('returns null if stage is null', ({ assert }) => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      stage: null,
    })

    assert.isNull(game.getStageActivity(playerId))
  })

  test('returns null if winnerId is null', ({ assert }) => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: null,
    })

    assert.isNull(game.getStageActivity(playerId))
  })

  test('returns stage activity with won true if winnerId matches playerId', ({ assert }) => {
    const playerId = asPlayerId('1')
    const game = GameFactory.build({
      winnerId: playerId,
    })

    const result = game.getStageActivity(playerId)
    assert.isNotNull(result)
    assert.equal(result!.won, true)
    assert.equal(result!.stage, game.stage)
  })

  test('returns stage activity with won false if winnerId does not match playerId', ({
    assert,
  }) => {
    const playerId = asPlayerId('1')
    const opponentId = asPlayerId('2')
    const game = GameFactory.build({
      winnerId: opponentId,
    })

    const result = game.getStageActivity(playerId)
    assert.isNotNull(result)
    assert.equal(result!.won, false)
    assert.equal(result!.stage, game.stage)
  })
})
