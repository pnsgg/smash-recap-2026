import { describe, expect, test } from 'bun:test'
import { tierOfScore, ultrankTier } from '#libs/ultrank/tiers'

describe('UltRank tiers', () => {
  test('a score takes the highest tier it reaches', () => {
    expect(tierOfScore(19_584)).toBe('SP')
    expect(tierOfScore(17_000)).toBe('SP')
    expect(tierOfScore(16_999)).toBe('P+')
    expect(tierOfScore(11_434)).toBe('P')
    expect(tierOfScore(8_502)).toBe('S+')
    expect(tierOfScore(3_297)).toBe('A')
    expect(tierOfScore(500)).toBe('C')
    expect(tierOfScore(499)).toBe('D')
    expect(tierOfScore(64)).toBe('D')
  })

  test("a start.gg event slug is looked up by UltRank's tournament/event key", () => {
    const scores = { 'kagaribi-15/singles': 19_584, 'chandelan-3/1v1': 167 }
    expect(ultrankTier('tournament/kagaribi-15/event/singles', scores)).toBe('SP')
    expect(ultrankTier('tournament/chandelan-3/event/1v1', scores)).toBe('D')
  })

  test('an event UltRank does not rank, or without a slug, has no tier', () => {
    const scores = { 'kagaribi-15/singles': 19_584 }
    expect(ultrankTier('tournament/kagaribi-15/event/doubles', scores)).toBeNull()
    expect(ultrankTier(null, scores)).toBeNull()
  })

  test('the imported season holds known events', () => {
    expect(ultrankTier('tournament/15-kagaribi-15/event/singles')).toBe('SP')
    expect(ultrankTier('tournament/s-factor-x3/event/smash-bros-ultimate-singles')).toBe('S+')
  })
})
