import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { Tournament } from '#/domain/recap/tournament'
import type { Videogame } from '#/domain/recap/videogame'
import { EventType, EventTypeHelper } from './event-type'

export type TournamentOrganizerParams = {
  id: UserSlug
  gamerTag: string
  tournaments: Tournament[]
}

export class TournamentOrganizer {
  public readonly id: UserSlug
  public readonly gamerTag: string
  public readonly tournaments: Tournament[]

  constructor(params: TournamentOrganizerParams) {
    this.id = params.id
    this.gamerTag = params.gamerTag
    this.tournaments = params.tournaments
  }

  /**
   * Returns the total number of tournaments organized.
   */
  totalTournaments(): number {
    return this.tournaments.length
  }

  /**
   * Lists the largest tournaments by their attendee counts.
   */
  biggestTournaments(
    limit: number,
  ): { tournament: Tournament; attendees: number }[] {
    return this.tournaments
      .map((t) => ({
        tournament: t,
        attendees: t.numAttendees,
      }))
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, limit)
  }

  /**
   * Lists all unique videogames for which tournaments/events were organized, sorted by frequency.
   */
  gamesOrganized(): { videogame: Videogame; count: number }[] {
    const counts = new Map<string, { videogame: Videogame; count: number }>()
    for (const t of this.tournaments) {
      for (const e of t.events) {
        const key = e.videogame.name
        const existing = counts.get(key)
        if (existing) {
          existing.count++
        } else {
          counts.set(key, { videogame: e.videogame, count: 1 })
        }
      }
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count)
  }

  /**
   * Computes the tournament activity breakdown by day of the week.
   */
  dayOfWeekActivity(): { day: string; count: number }[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activityMap = new Map<string, number>(dayNames.map((d) => [d, 0]))

    for (const tournament of this.tournaments) {
      const day = dayNames[tournament.startDate.getDay()]
      activityMap.set(day, (activityMap.get(day) || 0) + 1)
    }

    return dayNames.map((day) => ({
      day,
      count: activityMap.get(day) || 0,
    }))
  }

  /**
   * Groups the TO's tournaments by their starting month and returns the counts.
   */
  tournamentsByMonth(): { month: string; count: number }[] {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const activityMap = new Map<string, number>(monthNames.map((m) => [m, 0]))

    for (const tournament of this.tournaments) {
      const month = monthNames[tournament.startDate.getMonth()]
      activityMap.set(month, (activityMap.get(month) || 0) + 1)
    }

    return monthNames.map((month) => ({
      month,
      count: activityMap.get(month) || 0,
    }))
  }

  eventTypeBreakdown(): { type: EventType; count: number }[] {
    const counts: Record<EventType, number> = {
      [EventType.SINGLES]: 0,
      [EventType.TEAMS]: 0,
    }

    for (const tournament of this.tournaments) {
      for (const event of tournament.events) {
        counts[event.eventType]++
      }
    }

    return Object.entries(counts).map(([type, count]) => ({
      type: EventTypeHelper.fromNumber(Number(type)),
      count,
    }))
  }
}
