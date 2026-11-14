import { Elysia } from 'elysia'
import { searchQuerySchema, searchResponseSchema } from '#search/model'
import { presentSearchResults } from '#search/presenter'
import { PlayersSearchService, playersSearchService } from '#search/service'

export const createSearchModule = (service: PlayersSearchService = playersSearchService) =>
  new Elysia({ normalize: 'typebox' })
    .model({ 'Search.SearchResponse': searchResponseSchema })
    .get('/players/search', {
      query: searchQuerySchema,
      response: { 200: 'Search.SearchResponse' },
    }, async ({ query }) =>
      presentSearchResults(await service.searchPlayerByGamerTag(query.gamertag)))

export const searchModule = createSearchModule()
