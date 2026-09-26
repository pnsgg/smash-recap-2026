import type TournamentOrganizerRecapTransformer from '#transformers/tournament_organizer_recap_transformer'
import TournamentOrganizerRecapService from '#recap/application/tournament_organizer_recap_service'
import type { EventType } from '#recap/domain/event_type'
import { Tournament } from '#recap/domain/tournament'
import { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import { Videogame } from '#recap/domain/videogame'
import { asUserSlug } from '#shared/domain/ids'
import type { UserSlug } from '#shared/domain/ids'
import { asTournamentId, asVideogameId } from '#shared/domain/ids'

type MockTournamentOrganizerData = ReturnType<TournamentOrganizerRecapTransformer['toObject']>

const LICANE_DATA: MockTournamentOrganizerData = {
  id: asUserSlug('541f04fd'),
  gamerTag: 'Licane',
  totalTournaments: 94,
  biggestTournaments: [
    { tournamentName: 'Le Parthenon #6', attendees: 189 },
    { tournamentName: "F'Air-Play #3 - TLS x AMOS Toulouse", attendees: 131 },
    { tournamentName: 'ChandeLAN 3 - 2026', attendees: 123 },
    { tournamentName: "F'Air-Play #2 - TLS x AMOS Toulouse", attendees: 109 },
    { tournamentName: 'PNS KanD.I. — Janvier 2026', attendees: 68 },
  ],
  gamesOrganized: [
    { videogameId: asVideogameId('1386'), videogameName: 'Super Smash Bros. Ultimate', count: 131 },
    { videogameId: asVideogameId('1'), videogameName: 'Super Smash Bros. Melee', count: 25 },
    { videogameId: asVideogameId('53945'), videogameName: 'Rivals of Aether II', count: 16 },
    { videogameId: asVideogameId('5724'), videogameName: 'Mario Kart 7', count: 3 },
    { videogameId: asVideogameId('43868'), videogameName: 'Street Fighter 6', count: 2 },
    { videogameId: asVideogameId('102537'), videogameName: 'Mario Kart World', count: 2 },
    { videogameId: asVideogameId('29'), videogameName: 'Super Smash Bros. for 3DS', count: 1 },
    { videogameId: asVideogameId('24'), videogameName: 'Rivals of Aether', count: 1 },
    { videogameId: asVideogameId('2165'), videogameName: 'Mario Kart 8 Deluxe', count: 1 },
    { videogameId: asVideogameId('48707'), videogameName: 'Other', count: 1 },
    { videogameId: asVideogameId('64423'), videogameName: '2XKO', count: 1 },
    {
      videogameId: asVideogameId('73221'),
      videogameName: 'Fatal Fury: City of the Wolves',
      count: 1,
    },
    { videogameId: asVideogameId('11936'), videogameName: "The King of Fighters '98", count: 1 },
    { videogameId: asVideogameId('36963'), videogameName: 'The King of Fighters XV', count: 1 },
    {
      videogameId: asVideogameId('33921'),
      videogameName: 'Garfield Kart: Furious Racing',
      count: 1,
    },
    { videogameId: asVideogameId('54347'), videogameName: 'Pokémon Showdown', count: 1 },
    { videogameId: asVideogameId('25'), videogameName: 'Clash Royale', count: 1 },
    { videogameId: asVideogameId('33945'), videogameName: 'Guilty Gear: Strive', count: 1 },
    { videogameId: asVideogameId('49783'), videogameName: 'TEKKEN 8', count: 1 },
  ],
  dayOfWeekActivity: [
    { day: 'Sun', count: 94 },
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
  ],
  tournamentsByMonth: [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
    { month: 'Jun', count: 0 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 94 },
    { month: 'Sep', count: 0 },
    { month: 'Oct', count: 0 },
    { month: 'Nov', count: 0 },
    { month: 'Dec', count: 0 },
  ],
  eventTypeBreakdown: [
    { type: 1, count: 183 },
    { type: 5, count: 9 },
  ],
}

const ROUXCHOV_DATA: MockTournamentOrganizerData = {
  id: asUserSlug('89723908'),
  gamerTag: 'RouxChov',
  totalTournaments: 19,
  biggestTournaments: [
    { tournamentName: 'PNS KanD.I. — Janvier 2026', attendees: 68 },
    { tournamentName: 'PNS KanD.I. — Février 2026', attendees: 56 },
    { tournamentName: 'PNS KanD.I. — Mars 2026', attendees: 44 },
    { tournamentName: 'ANNULÉ / PNS KanD.I. — Avril 2026', attendees: 39 },
    { tournamentName: 'PriD.I. Juin 2026 — Jules & Julies x PNS', attendees: 38 },
  ],
  gamesOrganized: [
    { videogameId: asVideogameId('1386'), videogameName: 'Super Smash Bros. Ultimate', count: 33 },
    { videogameId: asVideogameId('5724'), videogameName: 'Mario Kart 7', count: 2 },
    { videogameId: asVideogameId('29'), videogameName: 'Super Smash Bros. for 3DS', count: 1 },
    { videogameId: asVideogameId('24'), videogameName: 'Rivals of Aether', count: 1 },
    { videogameId: asVideogameId('2165'), videogameName: 'Mario Kart 8 Deluxe', count: 1 },
    { videogameId: asVideogameId('48707'), videogameName: 'Other', count: 1 },
    {
      videogameId: asVideogameId('33921'),
      videogameName: 'Garfield Kart: Furious Racing',
      count: 1,
    },
    { videogameId: asVideogameId('54347'), videogameName: 'Pokémon Showdown', count: 1 },
    { videogameId: asVideogameId('53945'), videogameName: 'Rivals of Aether II', count: 1 },
  ],
  dayOfWeekActivity: [
    { day: 'Sun', count: 19 },
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
  ],
  tournamentsByMonth: [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
    { month: 'Jun', count: 0 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 19 },
    { month: 'Sep', count: 0 },
    { month: 'Oct', count: 0 },
    { month: 'Nov', count: 0 },
    { month: 'Dec', count: 0 },
  ],
  eventTypeBreakdown: [
    { type: 1, count: 38 },
    { type: 5, count: 4 },
  ],
}

class FakeTournamentOrganizer extends TournamentOrganizer {
  constructor(private mockData: MockTournamentOrganizerData) {
    super({
      id: asUserSlug(mockData.id),
      gamerTag: mockData.gamerTag,
      tournaments: [],
    })
  }

  override totalTournaments(): number {
    return this.mockData.totalTournaments
  }

  override biggestTournaments(limit: number = 5): { tournament: Tournament; attendees: number }[] {
    return this.mockData.biggestTournaments.slice(0, limit).map((t) => ({
      tournament: new Tournament({
        id: asTournamentId(`tournament-${t.tournamentName}`),
        name: t.tournamentName,
        address: null,
        events: [],
        startDate: new Date(),
        numAttendees: t.attendees,
      }),
      attendees: t.attendees,
    }))
  }

  override gamesOrganized(): { videogame: Videogame; count: number }[] {
    return this.mockData.gamesOrganized.map((g) => ({
      videogame: new Videogame(asVideogameId(g.videogameId), g.videogameName),
      count: g.count,
    }))
  }

  override dayOfWeekActivity(): { day: string; count: number }[] {
    return this.mockData.dayOfWeekActivity
  }

  override tournamentsByMonth(): { month: string; count: number }[] {
    return this.mockData.tournamentsByMonth
  }

  override eventTypeBreakdown(): { type: EventType; count: number }[] {
    return this.mockData.eventTypeBreakdown.map((e) => ({
      type: e.type as EventType,
      count: e.count,
    }))
  }
}

export class FakeTournamentOrganizerRecapService extends TournamentOrganizerRecapService {
  constructor() {
    super(null as unknown as any)
  }

  async getRecap(slug: UserSlug, _year: Date): Promise<TournamentOrganizer> {
    let data = LICANE_DATA
    if (slug.includes('89723908')) {
      data = ROUXCHOV_DATA
    } else if (slug.includes('541f04fd')) {
      data = LICANE_DATA
    } else {
      data = { ...LICANE_DATA, id: slug }
    }
    return new FakeTournamentOrganizer(data)
  }
}
