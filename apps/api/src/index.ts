import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { staticPlugin } from '@elysiajs/static'
import { Elysia } from 'elysia'
import { envPlugin } from '#config/env'
import { recapModule } from '#recap/index'
import { searchModule } from '#search/index'

const apiV1 = new Elysia({ prefix: '/api/v1' }).use(recapModule).use(searchModule)

const api = new Elysia()
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

// Eden Treaty clients (apps/web, via packages/shared) only need the API
// surface above, not the static/SPA-fallback routes below — keeping this
// type-only import from forcing those Bun-specific handlers to be
// type-checked in projects that don't have Bun's ambient types configured.
export type App = typeof api

// Serves the web app's build output so a single deployed image handles both
// the API and the frontend, same-origin (no CORS/API URL to wire up).
const STATIC_DIR = process.env.STATIC_DIR ?? '../web/dist'

const app = api
  .use(staticPlugin({ assets: STATIC_DIR, prefix: '' }))
  // @elysiajs/static's own `indexHTML` fallback only covers directory-index
  // requests, not arbitrary client-side routes (e.g. /user/foo) that don't
  // exist on disk — so the SPA fallback is handled explicitly here instead.
  .get('*', () => Bun.file(`${STATIC_DIR}/index.html`), { detail: { hide: true } })
  .listen(envPlugin.decorator.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
