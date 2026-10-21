import { Elysia } from 'elysia'
import { searchQuerySchema, searchResponseSchema } from '#search/model'
import { presentSearchResults } from '#search/presenter'
import { PlayersSearchService, playersSearchService } from '#search/service'

export const createSearchModule = (service: PlayersSearchService = playersSearchService) =>
  new Elysia({ tags: ['Search'], normalize: 'typebox' })
    .model({ 'Search.SearchResponse': searchResponseSchema })
    .get('/players/search', {
      query: searchQuerySchema,
      response: { 200: 'Search.SearchResponse' },
      detail: {
        summary: 'Search players by gamertag',
        description:
          'Searches start.gg for players matching the given gamertag, ranked by number of events attended.',
      },
    }, async ({ query }) =>
      presentSearchResults(await service.searchPlayerByGamerTag(query.gamertag)))

export const searchModule = createSearchModule()
