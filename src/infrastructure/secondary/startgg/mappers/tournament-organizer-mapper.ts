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
import { BracketTypeHelper } from '#/domain/recap/bracket-type'

export type TournamentDetailsResult = Exclude<
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

        const bracketType = BracketTypeHelper.fromString(
          e.phaseGroups?.[0]?.bracketType,
        )

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

    const rawTournamentId = raw.id?.toString()
    if (!rawTournamentId) throw new Error('Tournament ID is missing')

    const rawTournamentName = raw.name
    if (!rawTournamentName) throw new Error('Tournament name is missing')

    const rawTournamentSlug = raw.slug
    if (!rawTournamentSlug) throw new Error('Tournament slug is missing')

    const rawTournamentStartAt = raw.startAt
    if (rawTournamentStartAt === null)
      throw new Error('Tournament startAt is missing')

    const rawTournamentOwner = raw.owner
    if (!rawTournamentOwner) throw new Error('Tournament owner is missing')

    const rawTournamentOwnerId = rawTournamentOwner.id?.toString()
    if (!rawTournamentOwnerId) throw new Error('Tournament owner ID is missing')

    const rawTournamentOwnerName = rawTournamentOwner.name

    const rawTournamentOwnerSlug = rawTournamentOwner.slug
    if (!rawTournamentOwnerSlug)
      throw new Error('Tournament owner slug is missing')

    return new Tournament({
      id: asTournamentId(rawTournamentId),
      name: rawTournamentName,
      address: null,
      startDate: new Date(rawTournamentStartAt * 1000),
      events,
      numAttendees: raw.numAttendees ?? 0,
      slug: rawTournamentSlug,
      shortSlug: raw.shortSlug,
      owner: {
        id: rawTournamentOwnerId,
        name: rawTournamentOwnerName,
        slug: rawTournamentOwnerSlug,
      },
    })
  })

  return new TournamentOrganizer({ id: slug, gamerTag, tournaments })
}
