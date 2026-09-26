import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Participant } from '#recap/domain/participant'
import { Seed } from '#recap/domain/seed'
import { asParticipantId, asPlayerId } from '#shared/ids'
import type { ParticipantId, PlayerId } from '#shared/ids'

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
    new Seed(faker.number.int({ min: 1, max: 256 }), faker.number.int({ min: 1, max: 256 }))

  return new Participant({
    id,
    playerId,
    name,
    seed,
  })
})
