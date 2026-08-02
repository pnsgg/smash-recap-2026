import { describe, expect, test } from 'vitest'
import { Character } from '#/domain/recap/character'
import { asCharacterId } from '#/domain/shared-kernel/ids'
import { CharacterFactory } from '#tests/factories/character-factory'

describe('Character', () => {
  test('initializes correctly with id and name', () => {
    const character = new Character(asCharacterId('char-123'), 'Fox')
    expect(character.id).toBe('char-123')
    expect(character.name).toBe('Fox')
  })

  test('factory generates valid instances', () => {
    const character = CharacterFactory.make()
    expect(character).toBeInstanceOf(Character)
    expect(typeof character.id).toBe('string')
    expect(typeof character.name).toBe('string')
  })
})
