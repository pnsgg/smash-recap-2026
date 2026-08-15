import { describe, expect, test } from 'vitest'
import { Character } from '#/domain/recap/character'
import { asCharacterId } from '#/domain/shared-kernel/ids'
import { CharacterFactory } from '#tests/factories/character-factory'

describe('Character', () => {
  describe('constructor', () => {
    test('initializes correctly with id and name', () => {
      const character = new Character(asCharacterId('char-123'), 'Fox')
      expect(character.id).toBe('char-123')
      expect(character.name).toBe('Fox')
    })

    test('throws error if name is empty or whitespace', () => {
      expect(() => new Character(asCharacterId('char-123'), '')).toThrow(
        'Invalid parameter name',
      )
      expect(() => new Character(asCharacterId('char-123'), '   ')).toThrow(
        'Invalid parameter name',
      )
    })
  })

  test('factory generates valid instances', () => {
    const character = CharacterFactory.build()
    expect(character).toBeInstanceOf(Character)
    expect(typeof character.id).toBe('string')
    expect(typeof character.name).toBe('string')
  })
})
