import { Seed } from '#/domain/recap/seed'
import { SeedFactory } from '#tests/factories/seed-factory'
import { expect, test, describe } from 'vitest'

describe('Seed', () => {
  test('cannot have a negative or zeroes as initial values', () => {
    expect(() => new Seed(-1, 10)).toThrow()
    expect(() => new Seed(10, -1)).toThrow()
    expect(() => new Seed(0, 1)).toThrow()
    expect(() => new Seed(1, 0)).toThrow()
  })

  test('accepts valid values without throwing', () => {
    expect(() => SeedFactory.make()).not.toThrow()
  })
})
