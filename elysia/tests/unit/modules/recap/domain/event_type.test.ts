import { describe, expect, test } from 'bun:test'
import { EventType, EventTypeHelper } from '#recap/domain/event_type'

describe('EventTypeHelper - fromNumber', () => {
  test.each([
    { num: 1, expected: EventType.SINGLES },
    { num: 5, expected: EventType.TEAMS },
  ])('maps valid numbers to EventType enum values - $num', ({ num, expected }) => {
    expect(EventTypeHelper.fromNumber(num)).toBe(expected)
  })

  test.each([0, 2, 999, Number.NaN])(
    'throws error for invalid number values - %p',
    (invalidVal) => {
      expect(() => EventTypeHelper.fromNumber(invalidVal)).toThrow(
        `Invalid EventType: ${invalidVal}`
      )
    }
  )
})

describe('EventTypeHelper - toNumber', () => {
  test.each([
    { enumVal: EventType.SINGLES, expected: 1 },
    { enumVal: EventType.TEAMS, expected: 5 },
  ])('returns correct number value for EventType enum - $expected', ({ enumVal, expected }) => {
    expect(EventTypeHelper.toNumber(enumVal)).toBe(expected)
  })
})

describe('EventTypeHelper - toString', () => {
  test.each([
    { enumVal: EventType.SINGLES, expected: 'SINGLES' },
    { enumVal: EventType.TEAMS, expected: 'TEAMS' },
  ])('returns correct string representation for EventType enum - $expected', ({ enumVal, expected }) => {
    expect(EventTypeHelper.toString(enumVal)).toBe(expected)
  })
})
