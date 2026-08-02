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
  }),
  ({ id, name, address, events, startDate }) =>
    new Tournament({
      id: asTournamentId(id),
      name,
      address,
      events,
      startDate,
    }),
)
