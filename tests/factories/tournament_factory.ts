import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Address } from '#recap/domain/address'
import type { Event } from '#recap/domain/event'
import { Tournament } from '#recap/domain/tournament'
import { asTournamentId } from '#shared/domain/ids'
import type { TournamentId } from '#shared/domain/ids'
import { AddressFactory } from './address_factory.js'

type TournamentOverrides = {
  id?: TournamentId
  name?: string
  address?: Address | null
  events?: Event[]
  startDate?: Date
  numAttendees?: number | null
}

export const TournamentFactory = Factory.define<Tournament, any, Tournament, TournamentOverrides>(
  ({ sequence, params }) => {
    const id = params.id ?? asTournamentId(sequence.toString())
    const name = params.name ?? `${faker.company.name()} Open`
    const address = params.address === undefined ? AddressFactory.build() : params.address
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
  }
)
