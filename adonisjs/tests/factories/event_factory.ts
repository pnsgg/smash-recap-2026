import { VideogameFactory } from '#tests/factories/videogame_factory'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { BracketType } from '#recap/domain/bracket_type'
import { Event } from '#recap/domain/event'
import { EventType } from '#recap/domain/event_type'
import type { Participant } from '#recap/domain/participant'
import type { Set } from '#recap/domain/set'
import type { Videogame } from '#recap/domain/videogame'
import { asEventId } from '#shared/domain/ids'
import type { EventId } from '#shared/domain/ids'

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
      params.eventType ?? (faker.helpers.arrayElement(Object.values(EventType)) as EventType)
    const lastBracketType =
      params.lastBracketType ?? faker.helpers.arrayElement(Object.values(BracketType))
    const participants = params.participants ?? ([] as Participant[])
    const sets = params.sets ?? ([] as Set[])
    const numEntrants = params.numEntrants ?? faker.number.int({ min: 10, max: 100 })

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
  }
)
