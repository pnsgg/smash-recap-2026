import { VideogameFactory } from '#tests/factories/videogame_factory'
import { test } from '@japa/runner'
import { Videogame } from '#recap/domain/videogame'
import { asVideogameId } from '#shared/domain/ids'

test.group('Videogame - constructor', () => {
  test('factory generates valid instances', ({ assert }) => {
    const game = VideogameFactory.build()
    assert.instanceOf(game, Videogame)
  })

  test('initializes correctly with id and name', ({ assert }) => {
    const game = new Videogame(asVideogameId('game-1'), 'Super Smash Bros. Melee')
    assert.equal(game.id, 'game-1')
    assert.equal(game.name, 'Super Smash Bros. Melee')
  })

  test('throws error if name is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, invalidName) => {
      assert.throws(
        () => new Videogame(asVideogameId('game-1'), invalidName),
        'Invalid parameter name'
      )
    })
})
