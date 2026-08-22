import type { UserSlug } from '#shared/domain/ids'
import type { TournamentOrganizer } from '#recap/domain/tournament-organizer'

export interface ITournamentOrganizerRepository {
  /**
   * Fetches the tournament organizer recap stats for a given user and year.
   * @param slug The user slug
   * @param year The target year
   */
  getTournamentOrganizerRecap: (slug: UserSlug, year: Date) => Promise<TournamentOrganizer>
}
