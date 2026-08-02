import { Character } from '#/domain/recap/character'
import { asCharacterId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'

export const CharacterFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.person.firstName(),
  }),
  ({ id, name }) => new Character(asCharacterId(id), name),
)
