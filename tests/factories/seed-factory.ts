import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Seed } from '#/domain/recap/seed'

type SeedOverrides = {
  initialSeed?: number
  finalPlacement?: number
}

export const SeedFactory = Factory.define<Seed, any, Seed, SeedOverrides>(
  ({ params }) => {
    const initialSeed =
      params.initialSeed ?? faker.number.int({ min: 1, max: 32 })
    const finalPlacement =
      params.finalPlacement ?? faker.number.int({ min: 1, max: 32 })
    return new Seed(initialSeed, finalPlacement)
  },
)
