import { Factory } from './factory'
import { Seed } from '#/domain/recap/seed'

export const SeedFactory = Factory.define(
  ({ faker }) => ({
    initialSeed: faker.number.int({ min: 1, max: 32 }),
    finalPlacement: faker.number.int({ min: 1, max: 32 }),
  }),
  (attrs) => new Seed(attrs.initialSeed, attrs.finalPlacement),
).state('winner', () => ({ finalPlacement: 1 }))
