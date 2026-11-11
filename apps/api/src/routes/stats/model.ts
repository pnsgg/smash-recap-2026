import { t, type UnwrapSchema } from 'elysia'

const recapCountsSchema = t.Object({
  players: t.Number({ description: 'Player recaps (one per player and game)' }),
  organizers: t.Number({ description: 'Tournament organizer recaps' }),
})
export type RecapCounts = UnwrapSchema<typeof recapCountsSchema>

export const statsResponseSchema = t.Object({
  season: t.Object(recapCountsSchema.properties, { description: 'Distinct recaps served this season' }),
  cached: t.Object(recapCountsSchema.properties, {
    description: 'Recaps in the cache now: those computed within the cache lifetime (24 hours)',
  }),
})
export type StatsResponse = UnwrapSchema<typeof statsResponseSchema>
