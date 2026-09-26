import { test } from '@japa/runner'
import { EventType, EventTypeHelper } from '#recap/domain/event_type'

test.group('EventTypeHelper - fromNumber', () => {
  test('maps valid numbers to EventType enum values - {num}')
    .with([
      { num: 1, expected: EventType.SINGLES },
      { num: 5, expected: EventType.TEAMS },
    ])
    .run(({ assert }, { num, expected }) => {
      assert.equal(EventTypeHelper.fromNumber(num), expected)
    })

  test('throws error for invalid number values - "{$self}"')
    .with([0, 2, 999, Number.NaN])
    .run(({ assert }, invalidVal) => {
      assert.throws(
        () => EventTypeHelper.fromNumber(invalidVal),
        `Invalid EventType: ${invalidVal}`
      )
    })
})

test.group('EventTypeHelper - toNumber', () => {
  test('returns correct number value for EventType enum - {expected}')
    .with([
      { enumVal: EventType.SINGLES, expected: 1 },
      { enumVal: EventType.TEAMS, expected: 5 },
    ])
    .run(({ assert }, { enumVal, expected }) => {
      assert.equal(EventTypeHelper.toNumber(enumVal), expected)
    })
})

test.group('EventTypeHelper - toString', () => {
  test('returns correct string representation for EventType enum - {expected}')
    .with([
      { enumVal: EventType.SINGLES, expected: 'SINGLES' },
      { enumVal: EventType.TEAMS, expected: 'TEAMS' },
    ])
    .run(({ assert }, { enumVal, expected }) => {
      assert.equal(EventTypeHelper.toString(enumVal), expected)
    })
})
