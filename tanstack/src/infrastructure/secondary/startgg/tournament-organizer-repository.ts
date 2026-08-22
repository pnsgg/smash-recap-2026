import type { ITournamentOrganizerRepository } from '#/domain/ports/tournament-organizer-repository'
import type { TournamentOrganizer } from '#/domain/recap/tournament-organizer'
import type { UserSlug } from '#/domain/shared-kernel/ids'
import type { IStartggClient } from './startgg-client'
import { getTournamentsOrganized } from './queries/get-tournaments-organised'
import { getTournamentDetails } from './queries/get-tournament-details'
import { getPlayerUserId } from './queries/get-player-user-id'
import { mapTournamentOrganizer } from './mappers/tournament-organizer-mapper'
import type { ResultOf } from 'gql.tada'

type TournamentDetailsResult = Exclude<
  ResultOf<typeof getTournamentDetails>['tournament'],
  null | undefined
>

export class StartggTournamentOrganizerRepository implements ITournamentOrganizerRepository {
  constructor(private readonly fetcher: IStartggClient) {}

  /**
   * Fetches a tournament organizer's yearly recap.
   * Runs in 3 phases:
   * - Phase 0: Resolves gamerTag from the slug.
   * - Phase 1: Paginates through organized tournaments to collect IDs for the target year.
   * - Phase 2: Fetches full tournament details in parallel for each collected ID.
   *
   * @param slug The start.gg user slug (e.g. "user/abc123")
   * @param year The target year for the recap
   */
  async getTournamentOrganizerRecap(
    slug: UserSlug,
    year: Date,
  ): Promise<TournamentOrganizer> {
    // Phase 0 — resolve gamerTag from slug
    const { data: userData } = await this.fetcher.fetch(getPlayerUserId, {
      slug,
    })
    const gamerTag = userData.user?.player?.gamerTag

    if (!gamerTag) throw new Error('Gamer tag is missing')

    // Phase 1 — paginate to collect all tournament IDs for the target year
    const tournamentIds = await this.fetchTournamentIdsForYear(slug, year)

    // Phase 2 — fetch full details for each tournament in parallel
    const detailResponses = await Promise.all(
      tournamentIds.map((id) =>
        this.fetcher.fetch(getTournamentDetails, { id }),
      ),
    )

    const rawTournaments = detailResponses
      .map((r) => r.data.tournament)
      .filter((t): t is TournamentDetailsResult => t !== null)

    return mapTournamentOrganizer(slug, gamerTag, rawTournaments)
  }

  /**
   * Paginates through the user's organized tournaments, collecting IDs
   * that fall within the target year. Stops early when it encounters older tournaments.
   */
  private async fetchTournamentIdsForYear(
    slug: UserSlug,
    year: Date,
  ): Promise<string[]> {
    const targetYear = year.getFullYear()
    const ids: string[] = []
    let page = 1
    const perPage = 25

    for (;;) {
      const { data } = await this.fetcher.fetch(getTournamentsOrganized, {
        slug,
        page,
        perPage,
      })

      const tournaments = data.user?.tournaments
      if (
        !tournaments ||
        !tournaments.nodes ||
        tournaments.nodes.length === 0
      ) {
        break
      }

      const nodes = tournaments.nodes
      const totalPages = tournaments.pageInfo?.totalPages ?? 1

      for (const node of nodes) {
        if (!node || !node.id) continue
        const tournamentYear = new Date(
          (node.startAt as number) * 1000,
        ).getFullYear()
        if (tournamentYear === targetYear) {
          ids.push(node.id.toString())
        }
      }

      // Stop early if we've hit tournaments from a previous year
      const hasOldTournaments = nodes.some((n) => {
        if (!n) return false
        return new Date((n.startAt as number) * 1000).getFullYear() < targetYear
      })

      if (hasOldTournaments || page >= totalPages) {
        break
      }

      page++
    }

    return ids
  }
}
