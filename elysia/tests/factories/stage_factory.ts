import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Stage } from '#recap/domain/stage'
import { asStageId } from '#shared/ids'

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

export const StageFactory = Factory.define<Stage>(({ sequence }) => {
  return new Stage(asStageId(sequence.toString()), faker.helpers.arrayElement(SMASH_STAGES))
})
