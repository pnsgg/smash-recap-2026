import { SeedFactory } from '#tests/factories/seed_factory'
import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { Seed } from '#recap/domain/seed'

test.group('Seed - constructor', () => {
  test(
    'cannot have negative or zeroes as initial values - placement: {placement}, participants: {participants}'
  )
    .with([
      { placement: -1, participants: 10 },
      { placement: 10, participants: -1 },
      { placement: 0, participants: 1 },
      { placement: 1, participants: 0 },
    ])
    .run(({ assert }, { placement, participants }) => {
      assert.throws(() => new Seed(placement, participants))
    })

  test('accepts valid values without throwing', ({ assert }) => {
    assert.doesNotThrow(() => SeedFactory.build())
  })
})

test.group('Seed - roundsFromVictory', () => {
  test(
    'single elimination returns ceil(log2(placement)) - placement: {placement}, expected: {expected}'
  )
    .with([
      { placement: 1, expected: 0 },
      { placement: 2, expected: 1 },
      { placement: 3, expected: 2 },
      { placement: 4, expected: 2 },
      { placement: 5, expected: 3 },
    ])
    .run(({ assert }, { placement, expected }) => {
      assert.equal(Seed.roundsFromVictory(placement, BracketType.SINGLE_ELIMINATION), expected)
    })

  test(
    'double elimination returns correct RFV values - placement: {placement}, expected: {expected}'
  )
    .with([
      { placement: 1, expected: 0 },
      { placement: 2, expected: 1 },
      { placement: 3, expected: 2 },
      { placement: 4, expected: 3 },
      { placement: 5, expected: 4 },
      { placement: 7, expected: 5 },
      { placement: 9, expected: 6 },
    ])
    .run(({ assert }, { placement, expected }) => {
      assert.equal(Seed.roundsFromVictory(placement, BracketType.DOUBLE_ELIMINATION), expected)
    })

  test('other bracket types return null - type: {type}')
    .with([
      { placement: 1, type: BracketType.ROUND_ROBIN },
      { placement: 5, type: BracketType.SWISS },
    ])
    .run(({ assert }, { placement, type }) => {
      assert.isNull(Seed.roundsFromVictory(placement, type))
    })
})

test.group('Seed - seedingPerformanceRating', () => {
  test('calculates correct SPR - seed: {seed}, placement: {placement}, expected: {expected}')
    .with([
      { seed: 8, placement: 5, expected: 0 },
      { seed: 8, placement: 1, expected: 3 },
      { seed: 2, placement: 5, expected: -2 },
    ])
    .run(({ assert }, { seed, placement, expected }) => {
      const s = new Seed(seed, placement)
      assert.equal(s.seedingPerformanceRating(BracketType.SINGLE_ELIMINATION), expected)
    })

  test('returns null for unsupported bracket types', ({ assert }) => {
    const seed = new Seed(4, 2)
    assert.isNull(seed.seedingPerformanceRating(BracketType.SWISS))
  })
})

test.group('Seed - upsetFactor', () => {
  test('calculates correct upset factor - seed1: {seed1}, seed2: {seed2}, expected: {expected}')
    .with([
      { seed1: 8, seed2: 2, expected: 2 },
      { seed1: 2, seed2: 8, expected: -2 },
      { seed1: 4, seed2: 4, expected: 0 },
    ])
    .run(({ assert }, { seed1, seed2, expected }) => {
      assert.equal(Seed.upsetFactor(seed1, seed2, BracketType.SINGLE_ELIMINATION), expected)
    })

  test('returns null for unsupported bracket types', ({ assert }) => {
    assert.isNull(Seed.upsetFactor(2, 8, BracketType.SWISS))
  })
})
