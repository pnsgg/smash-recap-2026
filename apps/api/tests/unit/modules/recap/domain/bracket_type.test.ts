import { describe, expect, test } from 'bun:test'
import { BracketType, BracketTypeHelper } from '#recap/domain/bracket_type'

describe('BracketTypeHelper - fromString', () => {
  test.each([
    { string: 'SINGLE_ELIMINATION', enumVal: BracketType.SINGLE_ELIMINATION },
    { string: 'DOUBLE_ELIMINATION', enumVal: BracketType.DOUBLE_ELIMINATION },
    { string: 'ROUND_ROBIN', enumVal: BracketType.ROUND_ROBIN },
    { string: 'SWISS', enumVal: BracketType.SWISS },
    { string: 'EXHIBITION', enumVal: BracketType.EXHIBITION },
    { string: 'CUSTOM_SCHEDULE', enumVal: BracketType.CUSTOM_SCHEDULE },
    { string: 'MATCHMAKING', enumVal: BracketType.MATCHMAKING },
    { string: 'ELIMINATION_ROUNDS', enumVal: BracketType.ELIMINATION_ROUNDS },
    { string: 'RACE', enumVal: BracketType.RACE },
    { string: 'CIRCUIT', enumVal: BracketType.CIRCUIT },
  ])('maps valid strings to BracketType enum values - $string', ({ string, enumVal }) => {
    expect(BracketTypeHelper.fromString(string)).toBe(enumVal)
  })

  test('throws error for invalid string values', () => {
    expect(() => BracketTypeHelper.fromString('INVALID_TYPE')).toThrow('Invalid BracketType: INVALID_TYPE')
  })

  test.each([undefined, null, ''])('throws error for empty string, null, or undefined - %p', (invalidVal) => {
    expect(() => BracketTypeHelper.fromString(invalidVal)).toThrow(`Invalid BracketType: ${invalidVal}`)
  })
})

describe('BracketTypeHelper - toString', () => {
  test.each([
    { string: 'SINGLE_ELIMINATION', enumVal: BracketType.SINGLE_ELIMINATION },
    { string: 'DOUBLE_ELIMINATION', enumVal: BracketType.DOUBLE_ELIMINATION },
  ])('returns correct string value for enum - $string', ({ string, enumVal }) => {
    expect(BracketTypeHelper.toString(enumVal)).toBe(string)
  })
})
