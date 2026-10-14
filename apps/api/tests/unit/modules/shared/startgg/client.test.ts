import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { parse } from 'graphql'
import type { TadaDocumentNode } from '#shared/startgg/graphql'
import { StartggClient } from '#shared/startgg/client'

describe('StartggClient', () => {
  afterEach(() => {
    ;(globalThis.fetch as unknown as { mockRestore?: () => void }).mockRestore?.()
  })

  test('successfully fetches data via GET request with correct query params', async () => {
    const client = new StartggClient()
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      { name: string }
    >
    const mockVariables = { name: 'World' }
    const mockResponseData = { data: { hello: 'Hello World' } }

    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async () => ({
      ok: true,
      json: async () => mockResponseData,
    })) as unknown as typeof fetch)

    const result = await client.fetch(mockDocument, mockVariables)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit]

    const url = new URL(calledUrl)
    expect(url.origin).toBe('https://www.start.gg')
    expect(url.pathname).toBe('/api/-/gql')
    expect(url.searchParams.get('query')).toContain('query TestQuery { hello }')
    expect(JSON.parse(url.searchParams.get('variables') || '{}')).toEqual(mockVariables)

    expect(calledInit.method).toBe('GET')
    expect(calledInit.credentials).toBe('omit')
    expect(calledInit.mode).toBe('cors')
    expect(result).toEqual(mockResponseData)
  })

  test('merges custom RequestInit options', async () => {
    const client = new StartggClient()
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async () => ({
      ok: true,
      json: async () => ({ data: { hello: 'yes' } }),
    })) as unknown as typeof fetch)

    await client.fetch(mockDocument, {}, { headers: { 'X-Test': 'true' } })

    const [, calledInit] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit]
    expect(calledInit.headers).toEqual({ 'X-Test': 'true' })
    expect(calledInit.credentials).toBe('omit')
  })

  test('throws error if response is not ok', async () => {
    const client = new StartggClient()
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    spyOn(globalThis, 'fetch').mockImplementation((async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })) as unknown as typeof fetch)

    expect(client.fetch(mockDocument, {})).rejects.toThrow(
      'Start.gg API Error: 500 - Internal Server Error'
    )
  })

  test('retries on 429 and succeeds on next attempt', async () => {
    const client = new StartggClient()
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >
    const mockResponseData = { data: { hello: 'ok' } }

    let calls = 0
    spyOn(globalThis, 'fetch').mockImplementation((async () => {
      calls++
      if (calls === 1) return { ok: false, status: 429, headers: new Headers() }
      return { ok: true, json: async () => mockResponseData }
    }) as unknown as typeof fetch)

    spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => { fn(); return 0 }) as unknown as typeof setTimeout)

    const result = await client.fetch(mockDocument, {})
    expect(calls).toBe(2)
    expect(result).toEqual(mockResponseData)
  })

  test('throws after exhausting all retries on persistent 429', async () => {
    const client = new StartggClient()
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    spyOn(globalThis, 'fetch').mockImplementation((async () => ({
      ok: false,
      status: 429,
      headers: new Headers(),
    })) as unknown as typeof fetch)

    spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => { fn(); return 0 }) as unknown as typeof setTimeout)

    await expect(client.fetch(mockDocument, {})).rejects.toThrow(
      'Start.gg rate limit exceeded after retries'
    )
  })

  test('respects Retry-After header on 429', async () => {
    const client = new StartggClient()
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    let calls = 0
    spyOn(globalThis, 'fetch').mockImplementation((async () => {
      calls++
      if (calls === 1) return { ok: false, status: 429, headers: new Headers({ 'Retry-After': '2' }) }
      return { ok: true, json: async () => ({ data: { hello: 'ok' } }) }
    }) as unknown as typeof fetch)

    const delays: number[] = []
    spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms: number) => {
      delays.push(ms)
      fn()
      return 0
    }) as unknown as typeof setTimeout)

    await client.fetch(mockDocument, {})
    expect(delays[0]).toBe(2000)
  })
})
