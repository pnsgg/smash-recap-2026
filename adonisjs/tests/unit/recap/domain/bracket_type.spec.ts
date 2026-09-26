import { test } from '@japa/runner'
import { BracketType, BracketTypeHelper } from '#recap/domain/bracket_type'

test.group('BracketTypeHelper - fromString', () => {
  test('maps valid strings to BracketType enum values - "{string}"')
    .with([
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
    ])
    .run(({ assert }, { string, enumVal }) => {
      assert.equal(BracketTypeHelper.fromString(string), enumVal)
    })

  test('throws error for invalid string values', ({ assert }) => {
    assert.throws(
      () => BracketTypeHelper.fromString('INVALID_TYPE'),
      'Invalid BracketType: INVALID_TYPE'
    )
  })

  test('throws error for empty string, null, or undefined')
    .with(['', null, undefined])
    .run(({ assert }, invalidVal) => {
      assert.throws(
        () => BracketTypeHelper.fromString(invalidVal),
        `Invalid BracketType: ${invalidVal}`
      )
    })
})

test.group('BracketTypeHelper - toString', () => {
  test('returns correct string value for enum - "{string}"')
    .with([
      { string: 'SINGLE_ELIMINATION', enumVal: BracketType.SINGLE_ELIMINATION },
      { string: 'DOUBLE_ELIMINATION', enumVal: BracketType.DOUBLE_ELIMINATION },
    ])
    .run(({ assert }, { string, enumVal }) => {
      assert.equal(BracketTypeHelper.toString(enumVal), string)
    })
})
