import { staticPlugin } from '@elysia/static'
import { app } from './app'
import { env } from '#env'

const STATIC_DIR = Bun.env.STATIC_DIR ?? '../web/dist'

app
  .use(staticPlugin({ assets: STATIC_DIR, prefix: '' }))
  .get('*', { detail: { hide: true } }, () => Bun.file(`${STATIC_DIR}/index.html`))
  .listen(env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
