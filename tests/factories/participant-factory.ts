import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Participant } from '#/domain/recap/participant'
import { Seed } from '#/domain/recap/seed'
import { asParticipantId, asPlayerId } from '#/domain/shared-kernel/ids'
import type { ParticipantId, PlayerId } from '#/domain/shared-kernel/ids'

type ParticipantOverrides = {
  id?: ParticipantId
  playerId?: PlayerId
  name?: string
  seed?: Seed
}

export const ParticipantFactory = Factory.define<
  Participant,
  any,
  Participant,
  ParticipantOverrides
>(({ sequence, params }) => {
  const id = params.id ?? asParticipantId(sequence.toString())
  const playerId = params.playerId ?? asPlayerId(faker.number.int().toString())
  const name = params.name ?? faker.internet.displayName()
  const seed =
    params.seed ??
    new Seed(
      faker.number.int({ min: 1, max: 256 }),
      faker.number.int({ min: 1, max: 256 }),
    )

  return new Participant({
    id,
    playerId,
    name,
    seed,
  })
})
