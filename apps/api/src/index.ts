import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { envPlugin } from '#config/env'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule)

const app = new Elysia()
  .use(envPlugin)
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Smash Recap API',
          version: '0.0.1',
          description:
            'Yearly recap stats for Smash players and tournament organizers, sourced from start.gg.',
        },
        tags: [
          { name: 'Recap', description: 'Player and tournament organizer yearly recap stats' },
          { name: 'Search', description: 'Player search' },
        ],
      },
    })
  )
  .get('/health', () => ({ status: 'ok' }), { detail: { hide: true } })
  .use(apiV1)
  .listen(envPlugin.decorator.env.PORT)

export type App = typeof app

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
