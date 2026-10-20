import { t, type UnwrapSchema } from 'elysia'

export const searchQuerySchema = t.Object({
  gamertag: t.String({ minLength: 1 }),
})
export type SearchQuery = UnwrapSchema<typeof searchQuerySchema>

export const searchResponseSchema = t.Array(
  t.Object({
    id: t.String(),
    slug: t.String(),
    prefix: t.Nullable(t.String()),
    gamerTag: t.String(),
    country: t.Nullable(t.String()),
    profilePictureUrl: t.Nullable(t.String()),
    nbEvents: t.Number(),
  })
)
export type SearchResponse = UnwrapSchema<typeof searchResponseSchema>
