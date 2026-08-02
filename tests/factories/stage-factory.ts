import { Stage } from '#/domain/recap/stage'
import { asStageId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'

const SMASH_STAGES = [
  'Battlefield',
  'Final Destination',
  'Town and City',
  'Smashville',
  'Pokémon Stadium 2',
  'Small Battlefield',
  'Hollow Bastion',
  "Yoshi's Story",
  'Lylat Cruise',
]

export const StageFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.helpers.arrayElement(SMASH_STAGES),
  }),
  ({ id, name }) => new Stage(asStageId(id), name),
)
