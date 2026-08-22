import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Tournament } from '#/domain/recap/tournament'
import { AddressFactory } from './address-factory'
import type { Event } from '#/domain/recap/event'
import type { Address } from '#/domain/recap/address'
import { asTournamentId } from '#/domain/shared-kernel/ids'
import type { TournamentId } from '#/domain/shared-kernel/ids'

type TournamentOverrides = {
  id?: TournamentId
  name?: string
  address?: Address | null
  events?: Event[]
  startDate?: Date
  numAttendees?: number | null
}

export const TournamentFactory = Factory.define<
  Tournament,
  any,
  Tournament,
  TournamentOverrides
>(({ sequence, params }) => {
  const id = params.id ?? asTournamentId(sequence.toString())
  const name = params.name ?? `${faker.company.name()} Open`
  const address =
    params.address === undefined ? AddressFactory.build() : params.address
  const events = params.events ?? ([] as Event[])
  const startDate = params.startDate ?? faker.date.past()
  const numAttendees =
    params.numAttendees === undefined
      ? faker.number.int({ min: 50, max: 500 })
      : params.numAttendees

  return new Tournament({
    id,
    name,
    address,
    events,
    startDate,
    numAttendees,
  })
})
