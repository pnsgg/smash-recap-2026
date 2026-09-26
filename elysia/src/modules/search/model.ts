import { t } from 'elysia'

export const searchQuerySchema = t.Object({
  gamertag: t.String({ minLength: 1 }),
})
export type SearchQuery = typeof searchQuerySchema.static
