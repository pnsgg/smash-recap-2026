import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Character } from '#/domain/recap/character'
import { asCharacterId } from '#/domain/shared-kernel/ids'
import type { CharacterId } from '#/domain/shared-kernel/ids'

type CharacterOverrides = {
  id?: CharacterId
  name?: string
}

export const CharacterFactory = Factory.define<
  Character,
  any,
  Character,
  CharacterOverrides
>(({ sequence, params }) => {
  const id = params.id ?? asCharacterId(sequence.toString())
  const name = params.name ?? faker.person.firstName()
  return new Character(id, name)
})
