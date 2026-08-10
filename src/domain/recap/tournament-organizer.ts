import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { Tournament } from '#/domain/recap/tournament'
import type { Videogame } from '#/domain/recap/videogame'
import type { BracketType } from '#/domain/recap/bracket-type'

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
   * Distribution of bracket types across the events in all organized tournaments.
   */
  eventTypeDistribution(): { type: BracketType; count: number }[] {
    const counts = new Map<BracketType, number>()
    for (const t of this.tournaments) {
      for (const e of t.events) {
        counts.set(e.lastBracketType, (counts.get(e.lastBracketType) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }
}
