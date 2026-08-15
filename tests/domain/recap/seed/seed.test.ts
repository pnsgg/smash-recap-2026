import { Seed } from '#/domain/recap/seed'
import { BracketType } from '#/domain/recap/bracket-type'
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
    expect(() => SeedFactory.build()).not.toThrow()
  })

  describe('roundsFromVictory', () => {
    test('single elimination returns ceil(log2(placement))', () => {
      expect(Seed.roundsFromVictory(1, BracketType.SINGLE_ELIMINATION)).toBe(0)
      expect(Seed.roundsFromVictory(2, BracketType.SINGLE_ELIMINATION)).toBe(1)
      expect(Seed.roundsFromVictory(3, BracketType.SINGLE_ELIMINATION)).toBe(2)
      expect(Seed.roundsFromVictory(4, BracketType.SINGLE_ELIMINATION)).toBe(2)
      expect(Seed.roundsFromVictory(5, BracketType.SINGLE_ELIMINATION)).toBe(3)
    })

    test('double elimination returns correct RFV values', () => {
      expect(Seed.roundsFromVictory(1, BracketType.DOUBLE_ELIMINATION)).toBe(0)
      expect(Seed.roundsFromVictory(2, BracketType.DOUBLE_ELIMINATION)).toBe(1)
      expect(Seed.roundsFromVictory(3, BracketType.DOUBLE_ELIMINATION)).toBe(2)
      expect(Seed.roundsFromVictory(4, BracketType.DOUBLE_ELIMINATION)).toBe(3)
      expect(Seed.roundsFromVictory(5, BracketType.DOUBLE_ELIMINATION)).toBe(4)
      expect(Seed.roundsFromVictory(7, BracketType.DOUBLE_ELIMINATION)).toBe(5)
      expect(Seed.roundsFromVictory(9, BracketType.DOUBLE_ELIMINATION)).toBe(6)
    })

    test('other bracket types return null', () => {
      expect(Seed.roundsFromVictory(1, BracketType.ROUND_ROBIN)).toBeNull()
      expect(Seed.roundsFromVictory(5, BracketType.SWISS)).toBeNull()
    })
  })

  describe('seedingPerformanceRating', () => {
    test('calculates correct SPR', () => {
      const seed1 = new Seed(8, 5)
      expect(
        seed1.seedingPerformanceRating(BracketType.SINGLE_ELIMINATION),
      ).toBe(0)

      const seed2 = new Seed(8, 1)
      expect(
        seed2.seedingPerformanceRating(BracketType.SINGLE_ELIMINATION),
      ).toBe(3)

      const seed3 = new Seed(2, 5)
      expect(
        seed3.seedingPerformanceRating(BracketType.SINGLE_ELIMINATION),
      ).toBe(-2)
    })

    test('returns null for unsupported bracket types', () => {
      const seed = new Seed(4, 2)
      expect(seed.seedingPerformanceRating(BracketType.SWISS)).toBeNull()
    })
  })

  describe('upsetFactor', () => {
    test('calculates correct upset factor', () => {
      expect(Seed.upsetFactor(8, 2, BracketType.SINGLE_ELIMINATION)).toBe(2)
      expect(Seed.upsetFactor(2, 8, BracketType.SINGLE_ELIMINATION)).toBe(-2)
      expect(Seed.upsetFactor(4, 4, BracketType.SINGLE_ELIMINATION)).toBe(0)
    })

    test('returns null for unsupported bracket types', () => {
      expect(Seed.upsetFactor(2, 8, BracketType.SWISS)).toBeNull()
    })
  })
})
