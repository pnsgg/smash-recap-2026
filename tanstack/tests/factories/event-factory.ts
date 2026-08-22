import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Event } from '#/domain/recap/event'
import type { Participant } from '#/domain/recap/participant'
import type { Set } from '#/domain/recap/set'
import { asEventId } from '#/domain/shared-kernel/ids'
import type { EventId } from '#/domain/shared-kernel/ids'
import { BracketType } from '#/domain/recap/bracket-type'
import { EventType } from '#/domain/recap/event-type'
import { VideogameFactory } from './videogame-factory'
import type { Videogame } from '#/domain/recap/videogame'

type EventOverrides = {
  id?: EventId
  name?: string
  videogame?: Videogame
  isOnline?: boolean
  eventType?: EventType
  lastBracketType?: BracketType
  participants?: Participant[]
  sets?: Set[]
  numEntrants?: number
}

export const EventFactory = Factory.define<Event, any, Event, EventOverrides>(
  ({ sequence, params }) => {
    const id = params.id ?? asEventId(sequence.toString())
    const name = params.name ?? faker.company.buzzNoun()
    const videogame = params.videogame ?? VideogameFactory.build()
    const isOnline = params.isOnline ?? faker.datatype.boolean()
    const eventType =
      params.eventType ??
      (faker.helpers.arrayElement(Object.values(EventType)) as EventType)
    const lastBracketType =
      params.lastBracketType ??
      faker.helpers.arrayElement(Object.values(BracketType))
    const participants = params.participants ?? ([] as Participant[])
    const sets = params.sets ?? ([] as Set[])
    const numEntrants =
      params.numEntrants ?? faker.number.int({ min: 10, max: 100 })

    return new Event({
      id,
      name,
      videogame,
      isOnline,
      eventType,
      lastBracketType,
      participants,
      sets,
      numEntrants,
    })
  },
)
