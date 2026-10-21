import { cors } from '@elysia/cors'
import { openapi } from '@elysia/openapi'
import { Elysia } from 'elysia'
import { envPlugin } from '#env'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule)

export const app = new Elysia()
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
  .get('/health', { detail: { hide: true } }, () => ({ status: 'ok' }))
  .use(apiV1)

// Eden Treaty clients (apps/web, via packages/shared) only need the API
// surface above, not the static/SPA-fallback routes below — keeping this
// type-only import from forcing those Bun-specific handlers to be
// type-checked in projects that don't have Bun's ambient types configured.
export type App = typeof app
