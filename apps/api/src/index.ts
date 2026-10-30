import { stat } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { app } from './app'
import { env } from '#env'


const WEB_BUILD_DIR = resolve(Bun.env.WEB_BUILD_DIR ?? '../web/build')
const CLIENT_DIR = join(WEB_BUILD_DIR, 'client')
const SERVER_BUILD = join(WEB_BUILD_DIR, 'server', 'index.js')

type PageRenderer = { fetch: (request: Request) => Promise<Response> }

async function clientFile(pathname: string) {
  const path = resolve(CLIENT_DIR, `.${decodeURIComponent(pathname)}`)
  if (!path.startsWith(CLIENT_DIR + sep)) return null
  const info = await stat(path).catch(() => null)
  return info?.isFile() ? path : null
}

if (await Bun.file(SERVER_BUILD).exists()) {
  const { fetch: renderPage } = (await import(SERVER_BUILD)) as PageRenderer

  app.all('*', { detail: { hide: true } }, async ({ request }) => {
    const { pathname } = new URL(request.url)
    const file = request.method === 'GET' || request.method === 'HEAD' ? await clientFile(pathname) : null
    if (!file) return renderPage(request)
    const cacheControl = pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600'
    return new Response(Bun.file(file), { headers: { 'Cache-Control': cacheControl } })
  })
} else {
  console.log(`No web build at ${SERVER_BUILD}: serving the API only`)
}

app.listen(env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
