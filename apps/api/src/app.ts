import { cors } from '@elysia/cors'
import { openapi } from '@elysia/openapi'
import { Elysia } from 'elysia'
import { envPlugin } from '#env'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'
import { statsModule } from '#stats/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule).use(statsModule)

export const app = new Elysia({ normalize: 'typebox' })
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
          { name: 'Stats', description: 'Recaps made this season' },
        ],
      },
    })
  )
  .get('/health', { detail: { hide: true } }, () => ({ status: 'ok' }))
  .use(apiV1)

export type App = typeof app
