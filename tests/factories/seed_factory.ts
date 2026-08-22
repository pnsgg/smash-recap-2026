import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Seed } from '#recap/domain/seed'

type SeedOverrides = {
  initialSeed?: number
  finalPlacement?: number
}

export const SeedFactory = Factory.define<Seed, any, Seed, SeedOverrides>(({ params }) => {
  const initialSeed = params.initialSeed ?? faker.number.int({ min: 1, max: 32 })
  const finalPlacement = params.finalPlacement ?? faker.number.int({ min: 1, max: 32 })
  return new Seed(initialSeed, finalPlacement)
})
