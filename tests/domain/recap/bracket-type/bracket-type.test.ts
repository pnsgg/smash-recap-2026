import { describe, expect, test } from 'vitest'
import { BracketType, BracketTypeHelper } from '#/domain/recap/bracket-type'

describe('BracketTypeHelper', () => {
  describe('fromString', () => {
    test('maps valid strings to BracketType enum values', () => {
      expect(BracketTypeHelper.fromString('SINGLE_ELIMINATION')).toBe(
        BracketType.SINGLE_ELIMINATION,
      )
      expect(BracketTypeHelper.fromString('DOUBLE_ELIMINATION')).toBe(
        BracketType.DOUBLE_ELIMINATION,
      )
      expect(BracketTypeHelper.fromString('ROUND_ROBIN')).toBe(
        BracketType.ROUND_ROBIN,
      )
      expect(BracketTypeHelper.fromString('SWISS')).toBe(BracketType.SWISS)
      expect(BracketTypeHelper.fromString('EXHIBITION')).toBe(
        BracketType.EXHIBITION,
      )
      expect(BracketTypeHelper.fromString('CUSTOM_SCHEDULE')).toBe(
        BracketType.CUSTOM_SCHEDULE,
      )
      expect(BracketTypeHelper.fromString('MATCHMAKING')).toBe(
        BracketType.MATCHMAKING,
      )
      expect(BracketTypeHelper.fromString('ELIMINATION_ROUNDS')).toBe(
        BracketType.ELIMINATION_ROUNDS,
      )
      expect(BracketTypeHelper.fromString('RACE')).toBe(BracketType.RACE)
      expect(BracketTypeHelper.fromString('CIRCUIT')).toBe(BracketType.CIRCUIT)
    })

    test('throws error for invalid string values', () => {
      expect(() => BracketTypeHelper.fromString('INVALID_TYPE')).toThrow(
        'Invalid BracketType: INVALID_TYPE',
      )
    })

    test('throws error for empty string, null, or undefined', () => {
      expect(() => BracketTypeHelper.fromString('')).toThrow(
        'Invalid BracketType: ',
      )
      expect(() => BracketTypeHelper.fromString(null)).toThrow(
        'Invalid BracketType: null',
      )
      expect(() => BracketTypeHelper.fromString(undefined)).toThrow(
        'Invalid BracketType: undefined',
      )
    })
  })

  describe('toString', () => {
    test('returns correct string value for enum', () => {
      expect(BracketTypeHelper.toString(BracketType.SINGLE_ELIMINATION)).toBe(
        'SINGLE_ELIMINATION',
      )
      expect(BracketTypeHelper.toString(BracketType.DOUBLE_ELIMINATION)).toBe(
        'DOUBLE_ELIMINATION',
      )
    })
  })
})
