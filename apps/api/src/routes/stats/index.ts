import { Elysia } from 'elysia'
import { statsResponseSchema } from '#stats/model'
import { StatsService, statsService } from '#stats/service'

export const createStatsModule = (service: StatsService = statsService) =>
  new Elysia({ prefix: '/stats', tags: ['Stats'], normalize: 'typebox' })
    .model({ 'Stats.StatsResponse': statsResponseSchema })
    .get('', {
      response: { 200: 'Stats.StatsResponse' },
      detail: {
        summary: 'Recaps generated',
        description: 'Player and tournament organizer recaps served this season, and those in the cache now.',
      },
    }, () => service.recapCounts())

export const statsModule = createStatsModule()
