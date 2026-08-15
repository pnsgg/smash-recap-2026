import { Tournament } from '#/domain/recap/tournament'
import { Event } from '#/domain/recap/event'
import { Videogame } from '#/domain/recap/videogame'
import { TournamentOrganizer } from '#/domain/recap/tournament-organizer'
import { EventType } from '#/domain/recap/event-type'
import {
  asTournamentId,
  asEventId,
  asVideogameId,
} from '#/domain/shared-kernel/ids'
import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { ResultOf } from 'gql.tada'
import type { getTournamentDetails } from '../queries/get-tournament-details'
import { mapBracketType } from './utils'

type TournamentDetailsResult = Exclude<
  ResultOf<typeof getTournamentDetails>['tournament'],
  null | undefined
>

export function mapTournamentOrganizer(
  slug: UserSlug,
  gamerTag: string,
  rawTournaments: TournamentDetailsResult[],
): TournamentOrganizer {
  const tournaments = rawTournaments.map((raw) => {
    const events = (raw.events ?? [])
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .filter((e) => e.phaseGroups !== null && e.phaseGroups.length > 0)
      .map((e) => {
        const videogame = new Videogame(
          asVideogameId(e.videogame?.id?.toString() ?? '0'),
          e.videogame?.name ?? 'Unknown',
        )

        const bracketType = mapBracketType(e.phaseGroups?.[0]?.bracketType)

        const rawEventType = e.type
        if (rawEventType === null) {
          throw new Error('Cannot map event. Reason: Event type is missing')
        }
        let eventType: EventType
        if (rawEventType === 1) {
          eventType = EventType.SINGLES
        } else if (rawEventType === 2 || rawEventType === 5) {
          eventType = EventType.TEAMS
        } else {
          throw new Error(
            `Cannot map event. Reason: Unsupported event type code: ${rawEventType}`,
          )
        }

        return new Event({
          id: asEventId(e.id?.toString() ?? ''),
          name: e.name ?? 'Unknown Event',
          videogame,
          isOnline: e.isOnline ?? false,
          eventType,
          lastBracketType: bracketType,
          participants: [],
          sets: [],
          numEntrants: e.numEntrants ?? 0,
        })
      })

    return new Tournament({
      id: asTournamentId(raw.id?.toString() ?? ''),
      name: raw.name ?? 'Unknown Tournament',
      address: null,
      startDate: new Date(),
      events,
      numAttendees: raw.numAttendees ?? 0,
    })
  })

  return new TournamentOrganizer({ id: slug, gamerTag, tournaments })
}
