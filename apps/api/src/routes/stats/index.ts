import { Elysia } from 'elysia'
import { statsResponseSchema } from '#stats/model'
import { StatsService, statsService } from '#stats/service'

export const createStatsModule = (service: StatsService = statsService) =>
  new Elysia({ prefix: '/stats', normalize: 'typebox' })
    .model({ 'Stats.StatsResponse': statsResponseSchema })
    .get('', {
      response: { 200: 'Stats.StatsResponse' },
    }, () => service.recapCounts())

export const statsModule = createStatsModule()
