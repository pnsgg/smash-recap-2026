import { Tournament } from '#/domain/recap/tournament'
import { asTournamentId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'
import { AddressFactory } from './address-factory'
import type { Event } from '#/domain/recap/event'

export const TournamentFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.company.name() + ' Open',
    address: AddressFactory.make(),
    events: [] as Event[],
    startDate: faker.date.past(),
    numAttendees: faker.number.int({ min: 50, max: 500 }),
  }),
  ({ id, name, address, events, startDate, numAttendees }) =>
    new Tournament({
      id: asTournamentId(id),
      name,
      address,
      events,
      startDate,
      numAttendees,
    }),
)
