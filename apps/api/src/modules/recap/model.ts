import { t } from 'elysia'

export class UserNotFoundError extends Error {
  constructor(public readonly slug: string) {
    super(`No start.gg user found for slug: ${slug}`)
    this.name = 'UserNotFoundError'
  }
}

export const notFoundResponseSchema = t.Object({
  error: t.Literal('not_found'),
  message: t.String(),
})

export const playerRecapParamsSchema = t.Object({
  slug: t.String(),
})
export type PlayerRecapParams = typeof playerRecapParamsSchema.static

export const playerRecapQuerySchema = t.Object({
  videogameId: t.Optional(t.String()),
})
export type PlayerRecapQuery = typeof playerRecapQuerySchema.static

export const tournamentOrganizerRecapParamsSchema = t.Object({
  slug: t.String(),
})
export type TournamentOrganizerRecapParams = typeof tournamentOrganizerRecapParamsSchema.static

const nemesisSchema = t.Nullable(
  t.Object({
    opponentPlayerId: t.String(),
    playerWonSet: t.Number(),
    opponentWonSet: t.Number(),
    totalSets: t.Number(),
    winRate: t.Number(),
  })
)

export const playerRecapResponseSchema = t.Object({
  id: t.String(),
  prefix: t.Nullable(t.String()),
  gamerTag: t.String(),
  totalTournaments: t.Number(),
  totalSets: t.Number(),
  dayOfWeekActivity: t.Array(t.Object({ day: t.String(), count: t.Number() })),
  tournamentsByMonth: t.Array(t.Object({ month: t.String(), count: t.Number() })),
  cleanSweeps: t.Number(),
  reverseSweeps: t.Object({ won: t.Number(), lost: t.Number() }),
  decidingGameSets: t.Object({ count: t.Number(), winCount: t.Number(), winRate: t.Number() }),
  totalDisqualifications: t.Number(),
  bestPerformances: t.Array(t.Object({ tournamentName: t.String(), spr: t.Number() })),
  worstPerformance: t.Nullable(t.Object({ tournamentName: t.String(), spr: t.Number() })),
  mostPlayedCharacters: t.Array(
    t.Object({ characterId: t.String(), characterName: t.String(), count: t.Number() })
  ),
  highestUpset: t.Nullable(
    t.Object({ tournamentName: t.String(), eventName: t.String(), factor: t.Number() })
  ),
  stageActivity: t.Array(
    t.Object({
      stageId: t.String(),
      stageName: t.String(),
      count: t.Number(),
      winRate: t.Number(),
    })
  ),
  worstMatchups: t.Array(
    t.Object({
      characterId: t.String(),
      characterName: t.String(),
      count: t.Number(),
      lossCount: t.Number(),
      looseRate: t.Number(),
    })
  ),
  nemesis: nemesisSchema,
  eventTypeBreakdown: t.Record(t.String(), t.Number()),
  seriesPlayed: t.Array(
    t.Object({ name: t.String(), count: t.Number(), tournamentNames: t.Array(t.String()) })
  ),
  skippedEventCount: t.Number(),
})
export type PlayerRecapResponse = typeof playerRecapResponseSchema.static

export const tournamentOrganizerRecapResponseSchema = t.Object({
  id: t.String(),
  gamerTag: t.String(),
  totalTournaments: t.Number(),
  biggestTournaments: t.Array(t.Object({ tournamentName: t.String(), attendees: t.Number() })),
  gamesOrganized: t.Array(
    t.Object({ videogameId: t.String(), videogameName: t.String(), count: t.Number() })
  ),
  dayOfWeekActivity: t.Array(t.Object({ day: t.String(), count: t.Number() })),
  tournamentsByMonth: t.Array(t.Object({ month: t.String(), count: t.Number() })),
  eventTypeBreakdown: t.Array(t.Object({ type: t.Number(), count: t.Number() })),
  seriesOrganized: t.Array(
    t.Object({ name: t.String(), count: t.Number(), tournamentNames: t.Array(t.String()) })
  ),
})
export type TournamentOrganizerRecapResponse = typeof tournamentOrganizerRecapResponseSchema.static
