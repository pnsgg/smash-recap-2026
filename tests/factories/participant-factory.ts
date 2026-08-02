import { Participant } from '#/domain/recap/participant'
import { Seed } from '#/domain/recap/seed'
import { asParticipantId, asPlayerId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'

export const ParticipantFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    playerId: faker.number.int().toString(),
    name: faker.internet.displayName(),
    initialSeed: faker.number.int({ min: 1, max: 256 }),
    finalPlacement: faker.number.int({ min: 1, max: 256 }),
  }),
  ({ id, playerId, name, initialSeed, finalPlacement }) =>
    new Participant(
      asParticipantId(id),
      asPlayerId(playerId),
      name,
      new Seed(initialSeed, finalPlacement),
    ),
)
