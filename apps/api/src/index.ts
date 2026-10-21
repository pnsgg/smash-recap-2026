import { staticPlugin } from '@elysia/static'
import { app } from './app'
import { env } from '#config/env'

// Serves the web app's build output so a single deployed image handles both
// the API and the frontend, same-origin (no CORS/API URL to wire up).
const STATIC_DIR = Bun.env.STATIC_DIR ?? '../web/dist'

app
  .use(staticPlugin({ assets: STATIC_DIR, prefix: '' }))
  // @elysiajs/static's own `indexHTML` fallback only covers directory-index
  // requests, not arbitrary client-side routes (e.g. /user/foo) that don't
  // exist on disk — so the SPA fallback is handled explicitly here instead.
  .get('*', { detail: { hide: true } }, () => Bun.file(`${STATIC_DIR}/index.html`))
  .listen(env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
