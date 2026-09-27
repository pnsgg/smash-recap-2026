import { VideogameFactory } from '#tests/factories/videogame_factory'
import { describe, expect, test } from 'bun:test'
import { Videogame } from '#recap/domain/videogame'
import { asVideogameId } from '#shared/ids'

describe('Videogame - constructor', () => {
  test('factory generates valid instances', () => {
    const game = VideogameFactory.build()
    expect(game).toBeInstanceOf(Videogame)
  })

  test('initializes correctly with id and name', () => {
    const game = new Videogame(asVideogameId('game-1'), 'Super Smash Bros. Melee')
    expect(game.id).toBe(asVideogameId('game-1'))
    expect(game.name).toBe('Super Smash Bros. Melee')
  })

  test.each(['', '   '])('throws error if name is empty or whitespace - "%s"', (invalidName) => {
    expect(() => new Videogame(asVideogameId('game-1'), invalidName)).toThrow(
      'Invalid parameter name'
    )
  })
})
