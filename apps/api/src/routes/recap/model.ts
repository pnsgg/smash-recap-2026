import { t, type UnwrapSchema } from 'elysia'

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
export type PlayerRecapParams = UnwrapSchema<typeof playerRecapParamsSchema>

export const playerRecapQuerySchema = t.Object({
  videogameId: t.Optional(t.String()),
})
export type PlayerRecapQuery = UnwrapSchema<typeof playerRecapQuerySchema>

export const tournamentOrganizerRecapParamsSchema = t.Object({
  slug: t.String(),
})
export type TournamentOrganizerRecapParams = UnwrapSchema<typeof tournamentOrganizerRecapParamsSchema>

const headToHeadSchema = t.Nullable(
  t.Object({
    opponentPlayerId: t.String(),
    prefix: t.Nullable(t.String()),
    gamerTag: t.Nullable(t.String()),
    avatarUrl: t.Nullable(t.String()),
    playerWonSet: t.Number(),
    opponentWonSet: t.Number(),
    totalSets: t.Number(),
    winRate: t.Number(),
  })
)

const characterImageFields = {
  renderUrl: t.Nullable(t.String()),
  stockIconUrl: t.Nullable(t.String()),
}

/** The character a beaten opponent played most against the player, when start.gg has it. */
const beatenCharacterFields = {
  characterName: t.Nullable(t.String()),
  stockIconUrl: t.Nullable(t.String()),
}

export const playerRecapResponseSchema = t.Object({
  id: t.String(),
  prefix: t.Nullable(t.String()),
  gamerTag: t.String(),
  avatarUrl: t.Nullable(t.String()),
  totalTournaments: t.Number(),
  totalSets: t.Number(),
  /** Sets won and lost, without DQs. */
  setRecord: t.Object({ won: t.Number(), lost: t.Number() }),
  dayOfWeekActivity: t.Array(t.Object({ day: t.String(), count: t.Number() })),
  tournamentsByMonth: t.Array(t.Object({ month: t.String(), count: t.Number() })),
  cleanSweeps: t.Number(),
  reverseSweeps: t.Object({ won: t.Number(), lost: t.Number() }),
  decidingGameSets: t.Object({ count: t.Number(), winCount: t.Number(), winRate: t.Number() }),
  totalDisqualifications: t.Number(),
  bestPerformances: t.Array(
    t.Object({
      tournamentName: t.String(),
      tournamentImageUrl: t.Nullable(t.String()),
      spr: t.Number(),
    })
  ),
  /** Completed singles events, smallest share of the bracket (placement ÷ entrants) first, then the bigger event. */
  bestFinishes: t.Array(
    t.Object({
      tournamentName: t.String(),
      tournamentImageUrl: t.Nullable(t.String()),
      eventName: t.String(),
      /** UltRank's tier for the event (SP, P+, P, S+ … D), or null when UltRank does not rank it. */
      ultrankTier: t.Nullable(t.String()),
      placement: t.Number(),
      entrants: t.Number(),
      /** Placement ÷ entrants: 0.01 is the top 1% of the bracket. */
      topShare: t.Number(),
      /** Players beaten in the event, best event seed first. */
      wins: t.Array(t.Object({ name: t.String(), seed: t.Nullable(t.Number()), ...beatenCharacterFields })),
    })
  ),
  /** The opponents beaten the most sets against in singles events, most first. */
  mostBeaten: t.Array(t.Object({ name: t.String(), count: t.Number(), ...beatenCharacterFields })),
  worstPerformance: t.Nullable(
    t.Object({
      tournamentName: t.String(),
      tournamentImageUrl: t.Nullable(t.String()),
      spr: t.Number(),
    })
  ),
  mostPlayedCharacters: t.Array(
    t.Object({
      characterId: t.String(),
      characterName: t.String(),
      ...characterImageFields,
      count: t.Number(),
    })
  ),
  highestUpset: t.Nullable(
    t.Object({
      tournamentName: t.String(),
      tournamentImageUrl: t.Nullable(t.String()),
      eventName: t.String(),
      factor: t.Number(),
      playerSeed: t.Nullable(t.Number()),
      /** The player beaten. Name and avatar come from their profile and may be missing. */
      opponent: t.Nullable(
        t.Object({
          opponentPlayerId: t.String(),
          seed: t.Number(),
          prefix: t.Nullable(t.String()),
          gamerTag: t.Nullable(t.String()),
          avatarUrl: t.Nullable(t.String()),
        })
      ),
    })
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
      ...characterImageFields,
      count: t.Number(),
      lossCount: t.Number(),
      looseRate: t.Number(),
    })
  ),
  nemesis: headToHeadSchema,
  rival: headToHeadSchema,
  eventTypeBreakdown: t.Record(t.String(), t.Number()),
  seriesPlayed: t.Array(
    t.Object({
      name: t.String(),
      count: t.Number(),
      tournamentNames: t.Array(t.String()),
      imageUrl: t.Nullable(t.String()),
    })
  ),
  skippedEventCount: t.Number(),
  /** Published rankings whose period overlaps the recap's year, as start.gg orders them. */
  rankings: t.Array(
    t.Object({
      rank: t.Number(),
      previousRank: t.Nullable(t.Number()),
      seriesName: t.String(),
      title: t.String(),
      imageUrl: t.Nullable(t.String()),
    })
  ),
})
export type PlayerRecapResponse = UnwrapSchema<typeof playerRecapResponseSchema>

export const tournamentOrganizerRecapResponseSchema = t.Object({
  id: t.String(),
  gamerTag: t.String(),
  avatarUrl: t.Nullable(t.String()),
  totalTournaments: t.Number(),
  biggestTournaments: t.Array(
    t.Object({
      tournamentName: t.String(),
      tournamentImageUrl: t.Nullable(t.String()),
      attendees: t.Number(),
    })
  ),
  gamesOrganized: t.Array(
    t.Object({
      videogameId: t.String(),
      videogameName: t.String(),
      imageUrl: t.Nullable(t.String()),
      count: t.Number(),
    })
  ),
  dayOfWeekActivity: t.Array(t.Object({ day: t.String(), count: t.Number() })),
  tournamentsByMonth: t.Array(t.Object({ month: t.String(), count: t.Number() })),
  eventTypeBreakdown: t.Array(t.Object({ type: t.Number(), count: t.Number() })),
  seriesOrganized: t.Array(
    t.Object({
      name: t.String(),
      count: t.Number(),
      tournamentNames: t.Array(t.String()),
      imageUrl: t.Nullable(t.String()),
    })
  ),
})
export type TournamentOrganizerRecapResponse = UnwrapSchema<typeof tournamentOrganizerRecapResponseSchema>

export const playerSummaryResponseSchema = t.Object({
  id: t.String(),
  prefix: t.Nullable(t.String()),
  gamerTag: t.String(),
  totalTournaments: t.Number(),
  totalSets: t.Number(),
})
export type PlayerSummaryResponse = UnwrapSchema<typeof playerSummaryResponseSchema>

export const tournamentOrganizerSummaryResponseSchema = t.Object({
  id: t.String(),
  gamerTag: t.String(),
  totalTournaments: t.Number(),
})
export type TournamentOrganizerSummaryResponse = UnwrapSchema<typeof tournamentOrganizerSummaryResponseSchema>
