import { Elysia } from 'elysia'
import { envPlugin } from '#config/env'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule)

const app = new Elysia()
  .use(envPlugin)
  .get('/health', () => ({ status: 'ok' }))
  .use(apiV1)
  .listen(envPlugin.decorator.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
