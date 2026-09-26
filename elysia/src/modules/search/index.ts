import { Elysia } from 'elysia'
import { searchQuerySchema } from '#search/model'
import { PlayersSearchService, playersSearchService } from '#search/service'

export const createSearchModule = (service: PlayersSearchService = playersSearchService) =>
  new Elysia().get(
    '/players/search',
    ({ query }) => service.searchPlayerByGamerTag(query.gamertag),
    { query: searchQuerySchema }
  )

export const searchModule = createSearchModule()
