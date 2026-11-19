import { Elysia } from 'elysia'
import { searchQuerySchema, searchResponseSchema } from '#search/model'
import { presentSearchResults } from '#search/presenter'
import { PlayersSearchService, playersSearchService } from '#search/service'
import { annotate } from '#plugins/wide_event'

export const createSearchModule = (service: PlayersSearchService = playersSearchService) =>
  new Elysia({ normalize: 'typebox' })
    .model({ 'Search.SearchResponse': searchResponseSchema })
    .get('/players/search', {
      query: searchQuerySchema,
      response: { 200: 'Search.SearchResponse' },
    }, async ({ query }) => {
      const results = await service.searchPlayerByGamerTag(query.gamertag)
      annotate({ search: { gamertag: query.gamertag, result_count: results.length } })
      return presentSearchResults(results)
    })

export const searchModule = createSearchModule()
