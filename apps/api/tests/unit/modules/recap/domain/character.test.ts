import { CharacterFactory } from '#tests/factories/character_factory'
import { describe, expect, test } from 'bun:test'
import { Character } from '#recap/domain/character'
import { asCharacterId } from '#shared/ids'

describe('Character - constructor', () => {
  test('factory generates valid instances', () => {
    const character = CharacterFactory.build()
    expect(character).toBeInstanceOf(Character)
  })

  test('initializes correctly with id and name', () => {
    const character = new Character(asCharacterId('char-1'), 'Fox')
    expect(character.id).toBe(asCharacterId('char-1'))
    expect(character.name).toBe('Fox')
  })

  test.each(['', '   '])('throws error if name is empty or whitespace - "%s"', (invalidName) => {
    expect(() => new Character(asCharacterId('char-1'), invalidName)).toThrow(
      'Invalid parameter name'
    )
  })
})
