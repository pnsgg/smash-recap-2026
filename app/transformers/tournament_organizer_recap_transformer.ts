import { BaseTransformer } from '@adonisjs/core/transformers'
import type { TournamentOrganizer } from '#recap/domain/tournament_organizer'

export default class TournamentOrganizerRecapTransformer extends BaseTransformer<TournamentOrganizer> {
  toObject() {
    return {
      id: this.resource.id,
      gamerTag: this.resource.gamerTag,
      totalTournaments: this.resource.totalTournaments(),
      biggestTournaments: this.resource.biggestTournaments(5).map((t) => ({
        tournamentName: t.tournament.name,
        attendees: t.attendees,
      })),
      gamesOrganized: this.resource.gamesOrganized().map((g) => ({
        videogameId: g.videogame.id,
        videogameName: g.videogame.name,
        count: g.count,
      })),
      dayOfWeekActivity: this.resource.dayOfWeekActivity(),
      tournamentsByMonth: this.resource.tournamentsByMonth(),
      eventTypeBreakdown: this.resource.eventTypeBreakdown().map((e) => ({
        type: e.type,
        count: e.count,
      })),
    }
  }
}
