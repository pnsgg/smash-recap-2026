import { describe, expect, test } from 'vitest'
import { Videogame } from '#/domain/recap/videogame'
import { asVideogameId } from '#/domain/shared-kernel/ids'
import { VideogameFactory } from '#tests/factories/videogame-factory'

describe('Videogame', () => {
  test('initializes correctly with id and name', () => {
    const game = new Videogame(
      asVideogameId('game-1'),
      'Super Smash Bros. Melee',
    )
    expect(game.id).toBe('game-1')
    expect(game.name).toBe('Super Smash Bros. Melee')
  })

  test('factory generates valid instances', () => {
    const game = VideogameFactory.make()
    expect(game).toBeInstanceOf(Videogame)
    expect(typeof game.id).toBe('string')
    expect(typeof game.name).toBe('string')
  })
})
