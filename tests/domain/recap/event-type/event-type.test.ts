import { describe, expect, test } from 'vitest'
import { EventType, EventTypeHelper } from '#/domain/recap/event-type'

describe('EventTypeHelper', () => {
  describe('fromNumber', () => {
    test('maps valid numbers to EventType enum values', () => {
      expect(EventTypeHelper.fromNumber(1)).toBe(EventType.SINGLES)
      expect(EventTypeHelper.fromNumber(5)).toBe(EventType.TEAMS)
    })

    test('throws error for invalid number values', () => {
      expect(() => EventTypeHelper.fromNumber(0)).toThrow(
        'Invalid EventType: 0',
      )
      expect(() => EventTypeHelper.fromNumber(2)).toThrow(
        'Invalid EventType: 2',
      )
      expect(() => EventTypeHelper.fromNumber(999)).toThrow(
        'Invalid EventType: 999',
      )
      expect(() => EventTypeHelper.fromNumber(NaN)).toThrow(
        'Invalid EventType: NaN',
      )
    })
  })

  describe('toNumber', () => {
    test('returns correct number value for EventType enum', () => {
      expect(EventTypeHelper.toNumber(EventType.SINGLES)).toBe(1)
      expect(EventTypeHelper.toNumber(EventType.TEAMS)).toBe(5)
    })
  })

  describe('toString', () => {
    test('returns correct string representation for EventType enum', () => {
      expect(EventTypeHelper.toString(EventType.SINGLES)).toBe('SINGLES')
      expect(EventTypeHelper.toString(EventType.TEAMS)).toBe('TEAMS')
    })
  })
})
