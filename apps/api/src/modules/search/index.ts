import { Elysia } from 'elysia'
import { searchQuerySchema } from '#search/model'
import { PlayersSearchService, playersSearchService } from '#search/service'

export const createSearchModule = (service: PlayersSearchService = playersSearchService) =>
  new Elysia({ tags: ['Search'] }).get(
    '/players/search',
    ({ query }) => service.searchPlayerByGamerTag(query.gamertag),
    {
      query: searchQuerySchema,
      detail: {
        summary: 'Search players by gamertag',
        description:
          'Searches start.gg for players matching the given gamertag, ranked by number of events attended.',
      },
    }
  )

export const searchModule = createSearchModule()
