import { cors } from '@elysia/cors'
import { Elysia } from 'elysia'
import { envPlugin } from '#env'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'
import { statsModule } from '#stats/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule).use(statsModule)

export const app = new Elysia({ normalize: 'typebox' })
  .use(envPlugin)
  .use(cors())
  .get('/health', () => ({ status: 'ok' }))
  .use(apiV1)

export type App = typeof app
