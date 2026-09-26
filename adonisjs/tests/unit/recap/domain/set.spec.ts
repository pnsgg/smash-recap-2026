import { CharacterFactory } from '#tests/factories/character_factory'
import { GameFactory } from '#tests/factories/game_factory'
import { SetFactory } from '#tests/factories/set_factory'
import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { GameSelection } from '#recap/domain/game'
import { Seed } from '#recap/domain/seed'
import { SetPlayer } from '#recap/domain/set'
import { asPlayerId } from '#shared/domain/ids'

test.group('Set - constructor', () => {
  test('initializes Set correctly with valid attributes', ({ assert }) => {
    assert.doesNotThrow(() => SetFactory.build())
  })

  test('throws error if fullRoundText is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, invalidText) => {
      assert.throws(
        () => SetFactory.build({ fullRoundText: invalidText }),
        'Invalid parameter full round text'
      )
    })

  test('SetPlayer throws error if score is negative', ({ assert }) => {
    const pId = asPlayerId('player-1')
    assert.throws(
      () =>
        new SetPlayer({
          playerId: pId,
          seed: new Seed(1, 5),
          score: -1,
          isDisqualified: false,
        }),
      'Invalid parameter score'
    )
  })

  test('sorts games automatically by orderNum', ({ assert }) => {
    const game1 = GameFactory.build({ orderNum: 1 })
    const game2 = GameFactory.build({ orderNum: 2 })
    const game3 = GameFactory.build({ orderNum: 3 })

    const set = SetFactory.build({
      games: [game3, game1, game2],
    })

    assert.deepEqual(set.games, [game1, game2, game3])
  })
})

test.group('Set - getOpponentCharacters', () => {
  test('returns empty array if player is not in competitors', ({ assert }) => {
    const playerId = asPlayerId('player-1')
    const set = SetFactory.build({
      competitors: new Map(),
    })

    assert.deepEqual(set.getOpponentCharacters(playerId), [])
  })

  test('returns empty array if there is no opponent competitor', ({ assert }) => {
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

    assert.deepEqual(set.getOpponentCharacters(playerId), [])
  })

  test('returns all characters played by the opponent player across games', ({ assert }) => {
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
    assert.lengthOf(characters, 2)
    assert.include(characters, fox)
    assert.include(characters, marth)
  })
})

test.group('Set - getOpponentPlayerIds', () => {
  test('returns opponent player ids', ({ assert }) => {
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

    assert.deepEqual(set.getOpponentPlayerIds(p1Id), [p2Id])
  })

  test('returns empty array if player is not a competitor', ({ assert }) => {
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

    assert.deepEqual(set.getOpponentPlayerIds(otherId), [])
  })
})

test.group('Set - getPlayerCharacters', () => {
  test('returns all characters played by the player across games', ({ assert }) => {
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
    assert.lengthOf(characters, 2)
    assert.include(characters, fox)
    assert.include(characters, marth)
  })

  test('returns empty array if no characters are found', ({ assert }) => {
    const playerId = asPlayerId('player-1')
    const game1 = GameFactory.build({ orderNum: 1, selections: [] })

    const set = SetFactory.build({
      games: [game1],
    })

    assert.deepEqual(set.getPlayerCharacters(playerId), [])
  })
})

test.group('Set - getPlayerLossesAgainstCharacters', () => {
  test('returns empty array if player is not in competitors', ({ assert }) => {
    const playerId = asPlayerId('player-1')
    const set = SetFactory.build({
      competitors: new Map(),
    })

    assert.deepEqual(set.getPlayerLossesAgainstCharacters(playerId), [])
  })

  test('returns empty array if a competitor is disqualified', ({ assert }) => {
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

    assert.deepEqual(set.getPlayerLossesAgainstCharacters(playerId), [])
  })

  test('returns records of player loss outcomes against opponent characters in the games', ({
    assert,
  }) => {
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

    assert.deepEqual(set.getPlayerLossesAgainstCharacters(playerId), [
      { opponentCharacter: fox, lost: false },
      { opponentCharacter: marth, lost: true },
    ])
  })
})

test.group('Set - getStageActivity', () => {
  test('returns empty array if player is not in competitors', ({ assert }) => {
    const playerId = asPlayerId('player-1')
    const set = SetFactory.build({
      competitors: new Map(),
    })

    assert.deepEqual(set.getStageActivity(playerId), [])
  })

  test('returns empty array if a competitor is disqualified', ({ assert }) => {
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

    assert.deepEqual(set.getStageActivity(playerId), [])
  })

  test('returns stage activity outcomes for the player from games', ({ assert }) => {
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

    assert.deepEqual(set.getStageActivity(playerId), [
      { stage: game1.stage, won: true },
      { stage: game2.stage, won: false },
    ])
  })
})

test.group('Set - isCleanSweep', () => {
  test('isCleanSweep checks correctly', ({ assert }) => {
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

    assert.equal(set.isCleanSweep(), true)

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
    assert.equal(setNotSweep.isCleanSweep(), false)
  })
})

test.group('Set - isDecidingGameSet', () => {
  test('isDecidingGameSet checks correctly', ({ assert }) => {
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
    assert.equal(decidingSet.isDecidingGameSet(), true)

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
    assert.equal(regularSet.isDecidingGameSet(), false)
  })

  test('returns false if there are fewer than 2 competitors', ({ assert }) => {
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

    assert.equal(set.isDecidingGameSet(), false)
  })

  test('returns false if a competitor is disqualified', ({ assert }) => {
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

    assert.equal(set.isDecidingGameSet(), false)
  })
})

test.group('Set - isPlayerDisqualified', () => {
  test('isPlayerDisqualified checks correctly', ({ assert }) => {
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

    assert.equal(set.isPlayerDisqualified(p1Id), true)
    assert.equal(set.isPlayerDisqualified(p2Id), false)
  })

  test('returns false if player is not a competitor', ({ assert }) => {
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

    assert.equal(set.isPlayerDisqualified(unknownPlayerId), false)
  })
})

test.group('Set - reverse sweeps', () => {
  test('detects reverse sweeps correctly', ({ assert }) => {
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

    assert.equal(bo5SweepSet.isReverseSweepWon(p1Id), true)
    assert.equal(bo5SweepSet.isReverseSweepWon(p2Id), false)
    assert.equal(bo5SweepSet.isReverseSweepLost(p1Id), false)
    assert.equal(bo5SweepSet.isReverseSweepLost(p2Id), true)

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

    assert.equal(bo5StandardSet.isReverseSweepWon(p1Id), false)
    assert.equal(bo5StandardSet.isReverseSweepLost(p2Id), false)

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

    assert.equal(bo3SweepSet.isReverseSweepWon(p1Id), true)
    assert.equal(bo3SweepSet.isReverseSweepLost(p2Id), true)
  })
})

test.group('Set - upsetFactor & isUpset', () => {
  test(
    'bracket upset calculations - bracket: {bracket}, winnerSeed: {winnerSeed}, loserSeed: {loserSeed}'
  )
    .with([
      {
        bracket: BracketType.SINGLE_ELIMINATION,
        winnerSeed: 8,
        loserSeed: 2,
        expectedFactor: 2,
        isUpset: true,
      },
      {
        bracket: BracketType.SINGLE_ELIMINATION,
        winnerSeed: 2,
        loserSeed: 8,
        expectedFactor: -2,
        isUpset: false,
      },
      {
        bracket: BracketType.SINGLE_ELIMINATION,
        winnerSeed: 8,
        loserSeed: 5,
        expectedFactor: 0,
        isUpset: false,
      },
      {
        bracket: BracketType.DOUBLE_ELIMINATION,
        winnerSeed: 8,
        loserSeed: 2,
        expectedFactor: 4,
        isUpset: true,
      },
      {
        bracket: BracketType.DOUBLE_ELIMINATION,
        winnerSeed: 2,
        loserSeed: 8,
        expectedFactor: -4,
        isUpset: false,
      },
      {
        bracket: BracketType.DOUBLE_ELIMINATION,
        winnerSeed: 8,
        loserSeed: 7,
        expectedFactor: 0,
        isUpset: false,
      },
    ])
    .run(({ assert }, { bracket, winnerSeed, loserSeed, expectedFactor, isUpset }) => {
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

      assert.equal(set.isUpset(), isUpset)
      assert.equal(set.upsetFactor(), expectedFactor)
    })

  test('returns null upsetFactor and false isUpset for unsupported bracket types', ({ assert }) => {
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

    assert.equal(set.isUpset(), false)
    assert.isNull(set.upsetFactor())
  })

  test('returns null upsetFactor and false isUpset when a competitor is disqualified', ({
    assert,
  }) => {
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

    assert.equal(set.isUpset(), false)
    assert.isNull(set.upsetFactor())
  })
})
