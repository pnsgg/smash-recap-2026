import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { StartggClient } from '#/infrastructure/secondary/startgg/startgg-client'
import { parse } from 'graphql'
import type { TadaDocumentNode } from '#/graphql'

describe('StartggClient', () => {
  let client: StartggClient

  beforeEach(() => {
    client = new StartggClient()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('successfully fetches data via GET request with correct query params', async () => {
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      { name: string }
    >
    const mockVariables = { name: 'World' }
    const mockResponseData = { data: { hello: 'Hello World' } }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await client.fetch(mockDocument, mockVariables)

    expect(mockFetch).toHaveBeenCalledOnce()
    const [calledUrl, calledInit] = mockFetch.mock.calls[0] as [
      string,
      RequestInit,
    ]

    const url = new URL(calledUrl)
    expect(url.origin).toBe('https://www.start.gg')
    expect(url.pathname).toBe('/api/-/gql')
    expect(url.searchParams.get('query')).toContain(
      'query TestQuery {\n  hello\n}',
    )
    expect(JSON.parse(url.searchParams.get('variables') || '{}')).toEqual(
      mockVariables,
    )

    expect(calledInit.method).toBe('GET')
    expect(calledInit.credentials).toBe('omit')
    expect(calledInit.mode).toBe('cors')
    expect(result).toEqual(mockResponseData)
  })

  test('merges custom RequestInit options', async () => {
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { hello: 'yes' } }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await client.fetch(mockDocument, {}, { headers: { 'X-Test': 'true' } })

    const [, calledInit] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(calledInit.headers).toEqual({ 'X-Test': 'true' })
    expect(calledInit.credentials).toBe('omit')
  })

  test('throws error if response is not ok', async () => {
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(client.fetch(mockDocument, {})).rejects.toThrow(
      'Start.gg API Error: 500 - Internal Server Error',
    )
  })
})
