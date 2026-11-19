import { AsyncLocalStorage } from 'node:async_hooks'
import { Elysia } from 'elysia'
import { type LogFields, logger } from '#libs/logger'

type WideEvent = LogFields & { request_id: string }
type Group = Record<string, unknown>

const storage = new AsyncLocalStorage<WideEvent>()
const startedAt = new WeakMap<WideEvent, number>()
const emitted = new WeakSet<WideEvent>()

export const REQUEST_ID_HEADER = 'x-request-id'
const VALID_REQUEST_ID = /^[\w.:-]{1,128}$/
const QUIET_PATHS = new Set(['/health'])

export function annotate(fields: LogFields) {
  const event = storage.getStore()
  if (!event) return
  for (const [key, value] of Object.entries(fields)) {
    const current = event[key]
    event[key] = isGroup(current) && isGroup(value) ? { ...current, ...value } : value
  }
}

export function increment(group: string, field: string, by = 1) {
  const event = storage.getStore()
  if (!event) return
  const target = (isGroup(event[group]) ? event[group] : (event[group] = {})) as Group
  target[field] = (typeof target[field] === 'number' ? target[field] : 0) + by
}

export function append(group: string, field: string, value: unknown, cap = 10) {
  const event = storage.getStore()
  if (!event) return
  const target = (isGroup(event[group]) ? event[group] : (event[group] = {})) as Group
  const list = Array.isArray(target[field]) ? (target[field] as unknown[]) : (target[field] = [])
  if (list.length < cap) list.push(value)
  increment(group, `${field}_count`)
}

const isGroup = (value: unknown): value is Group =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const elapsedMs = (event: WideEvent) => {
  const started = startedAt.get(event)
  return started === undefined ? undefined : Math.round((performance.now() - started) * 100) / 100
}

function emit(event: WideEvent, statusCode: number | null) {
  if (emitted.has(event)) return
  emitted.add(event)
  if (statusCode !== null && statusCode < 500 && isGroup(event.error)) delete event.error.stack

  const http = event.http as Group
  const quiet = QUIET_PATHS.has(http.path as string) || http.kind === 'static'
  if (statusCode !== null && statusCode < 400 && quiet) return
  if (statusCode !== null && statusCode >= 500) logger.error(event)
  else logger.info(event)
}

const kindOf = (path: string) => (path.startsWith('/api/') ? 'api' : 'page')

export const wideEventPlugin = new Elysia({ name: 'wide-event' })
  .onRequest(({ request, set }) => {
    const url = new URL(request.url)
    const incoming = request.headers.get(REQUEST_ID_HEADER)
    const requestId = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : crypto.randomUUID()
    const event: WideEvent = {
      request_id: requestId,
      http: {
        method: request.method,
        path: url.pathname,
        query: url.search ? Object.fromEntries(url.searchParams) : undefined,
        kind: kindOf(url.pathname),
        user_agent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
    }
    startedAt.set(event, performance.now())
    storage.enterWith(event)
    set.headers[REQUEST_ID_HEADER] = requestId

    request.signal.addEventListener('abort', () => {
      Object.assign(event, { outcome: 'aborted', duration_ms: elapsedMs(event) })
      emit(event, null)
    }, { once: true })
  })
  .onBeforeHandle('global', ({ route, path }) => {
    annotate({ http: { route: route || path } })
  })
  .onError('global', ({ error }) => {
    const failure = error instanceof Error ? error : null
    const code = (error as { code?: unknown } | null)?.code
    annotate({
      error: {
        type: failure?.constructor.name ?? typeof error,
        code: typeof code === 'string' ? code : undefined,
        message: failure?.message ?? String(error),
        stack: failure?.stack,
      },
    })
  })
  .onAfterResponse('global', ({ set, responseValue }) => {
    const event = storage.getStore()
    if (!event) return
    const statusCode =
      responseValue instanceof Response ? responseValue.status : typeof set.status === 'number' ? set.status : 200
    annotate({
      http: { status_code: statusCode },
      outcome: statusCode >= 400 ? 'error' : 'success',
      duration_ms: elapsedMs(event),
    })
    emit(event, statusCode)
  })
