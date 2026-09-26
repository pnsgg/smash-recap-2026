import { SeedFactory } from '#tests/factories/seed_factory'
import { describe, expect, test } from 'bun:test'
import { BracketType } from '#recap/domain/bracket_type'
import { Seed } from '#recap/domain/seed'

describe('Seed - constructor', () => {
  test.each([
    { placement: -1, participants: 10 },
    { placement: 10, participants: -1 },
    { placement: 0, participants: 1 },
    { placement: 1, participants: 0 },
  ])(
    'cannot have negative or zeroes as initial values - placement: $placement, participants: $participants',
    ({ placement, participants }) => {
      expect(() => new Seed(placement, participants)).toThrow()
    }
  )

  test('accepts valid values without throwing', () => {
    expect(() => SeedFactory.build()).not.toThrow()
  })
})

describe('Seed - roundsFromVictory', () => {
  test.each([
    { placement: 1, expected: 0 },
    { placement: 2, expected: 1 },
    { placement: 3, expected: 2 },
    { placement: 4, expected: 2 },
    { placement: 5, expected: 3 },
  ])(
    'single elimination returns ceil(log2(placement)) - placement: $placement, expected: $expected',
    ({ placement, expected }) => {
      expect(Seed.roundsFromVictory(placement, BracketType.SINGLE_ELIMINATION)).toBe(expected)
    }
  )

  test.each([
    { placement: 1, expected: 0 },
    { placement: 2, expected: 1 },
    { placement: 3, expected: 2 },
    { placement: 4, expected: 3 },
    { placement: 5, expected: 4 },
    { placement: 7, expected: 5 },
    { placement: 9, expected: 6 },
  ])(
    'double elimination returns correct RFV values - placement: $placement, expected: $expected',
    ({ placement, expected }) => {
      expect(Seed.roundsFromVictory(placement, BracketType.DOUBLE_ELIMINATION)).toBe(expected)
    }
  )

  test.each([
    { placement: 1, type: BracketType.ROUND_ROBIN },
    { placement: 5, type: BracketType.SWISS },
  ])('other bracket types return null - type: $type', ({ placement, type }) => {
    expect(Seed.roundsFromVictory(placement, type)).toBeNull()
  })
})

describe('Seed - seedingPerformanceRating', () => {
  test.each([
    { seed: 8, placement: 5, expected: 0 },
    { seed: 8, placement: 1, expected: 3 },
    { seed: 2, placement: 5, expected: -2 },
  ])(
    'calculates correct SPR - seed: $seed, placement: $placement, expected: $expected',
    ({ seed, placement, expected }) => {
      const s = new Seed(seed, placement)
      expect(s.seedingPerformanceRating(BracketType.SINGLE_ELIMINATION)).toBe(expected)
    }
  )

  test('returns null for unsupported bracket types', () => {
    const seed = new Seed(4, 2)
    expect(seed.seedingPerformanceRating(BracketType.SWISS)).toBeNull()
  })
})

describe('Seed - upsetFactor', () => {
  test.each([
    { seed1: 8, seed2: 2, expected: 2 },
    { seed1: 2, seed2: 8, expected: -2 },
    { seed1: 4, seed2: 4, expected: 0 },
  ])(
    'calculates correct upset factor - seed1: $seed1, seed2: $seed2, expected: $expected',
    ({ seed1, seed2, expected }) => {
      expect(Seed.upsetFactor(seed1, seed2, BracketType.SINGLE_ELIMINATION)).toBe(expected)
    }
  )

  test('returns null for unsupported bracket types', () => {
    expect(Seed.upsetFactor(2, 8, BracketType.SWISS)).toBeNull()
  })
})
