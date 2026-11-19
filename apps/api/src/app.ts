import { cors } from '@elysia/cors'
import { Elysia } from 'elysia'
import { envPlugin } from '#env'
import { REQUEST_ID_HEADER, wideEventPlugin } from '#plugins/wide_event'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'
import { statsModule } from '#stats/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule).use(statsModule)

export const app = new Elysia({ normalize: 'typebox' })
  .use(wideEventPlugin)
  .use(envPlugin)
  .use(cors({ exposeHeaders: [REQUEST_ID_HEADER] }))
  .get('/health', () => ({ status: 'ok' }))
  .use(apiV1)

export type App = typeof app
