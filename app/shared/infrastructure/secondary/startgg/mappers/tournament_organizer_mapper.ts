import type { ResultOf } from 'gql.tada'
import { BracketTypeHelper } from '#recap/domain/bracket_type'
import { Event } from '#recap/domain/event'
import { EventType } from '#recap/domain/event_type'
import { Tournament } from '#recap/domain/tournament'
import { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import { Videogame } from '#recap/domain/videogame'
import { asEventId, asTournamentId, asVideogameId } from '#shared/domain/ids'
import type { UserSlug } from '#shared/domain/ids'
import type { getTournamentDetails } from '#shared/infrastructure/secondary/startgg/queries/get_tournament_details'

export type TournamentDetailsResult = Exclude<
  ResultOf<typeof getTournamentDetails>['tournament'],
  null | undefined
>

export function mapTournamentOrganizer(
  slug: UserSlug,
  gamerTag: string,
  rawTournaments: TournamentDetailsResult[]
): TournamentOrganizer {
  const tournaments = rawTournaments.map((raw) => {
    const events = (raw.events ?? [])
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .filter((e) => e.phaseGroups !== null && e.phaseGroups.length > 0)
      .map((e) => {
        const videogame = new Videogame(
          asVideogameId(e.videogame?.id?.toString() ?? '0'),
          e.videogame?.name ?? 'Unknown'
        )

        const bracketType = BracketTypeHelper.fromString(e.phaseGroups?.[0]?.bracketType)

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
          throw new Error(`Cannot map event. Reason: Unsupported event type code: ${rawEventType}`)
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
