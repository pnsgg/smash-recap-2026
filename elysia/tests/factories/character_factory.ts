import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Character } from '#recap/domain/character'
import { asCharacterId } from '#shared/ids'
import type { CharacterId } from '#shared/ids'

type CharacterOverrides = {
  id?: CharacterId
  name?: string
}

export const CharacterFactory = Factory.define<Character, any, Character, CharacterOverrides>(
  ({ sequence, params }) => {
    const id = params.id ?? asCharacterId(sequence.toString())
    const name = params.name ?? faker.person.firstName()
    return new Character(id, name)
  }
)
