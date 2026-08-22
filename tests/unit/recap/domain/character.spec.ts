import { CharacterFactory } from '#tests/factories/character_factory'
import { test } from '@japa/runner'
import { Character } from '#recap/domain/character'
import { asCharacterId } from '#shared/domain/ids'

test.group('Character - constructor', () => {
  test('factory generates valid instances', ({ assert }) => {
    const character = CharacterFactory.build()
    assert.instanceOf(character, Character)
    assert.equal(typeof character.id, 'string')
    assert.equal(typeof character.name, 'string')
  })

  test('initializes correctly with id and name', ({ assert }) => {
    const character = new Character(asCharacterId('char-123'), 'Fox')
    assert.equal(character.id, 'char-123')
    assert.equal(character.name, 'Fox')
  })

  test('throws error if name is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, invalidName) => {
      assert.throws(
        () => new Character(asCharacterId('char-123'), invalidName),
        'Invalid parameter name'
      )
    })
})
