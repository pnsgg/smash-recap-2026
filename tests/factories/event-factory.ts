import { Event } from '#/domain/recap/event'
import type { Participant } from '#/domain/recap/participant'
import { asEventId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'
import { ParticipantFactory } from './participant-factory'

export const EventFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.company.buzzNoun(),
    participants: [] as Participant[],
  }),
  ({ id, name, participants }) => new Event(asEventId(id), name, participants),
).state('withParticipants', (attrs) => ({
  ...attrs,
  participants: ParticipantFactory.makeMany(5),
}))

export const EventFactoryWithNoParticipants = EventFactory
