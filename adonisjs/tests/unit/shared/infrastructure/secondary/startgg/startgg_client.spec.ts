import { mock } from 'node:test'
import { test } from '@japa/runner'
import { parse } from 'graphql'
import type { TadaDocumentNode } from '#shared/infrastructure/secondary/startgg/graphql'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'

test.group('StartggClient', (group) => {
  let client: StartggClient

  group.each.setup(() => {
    client = new StartggClient()
  })

  group.each.teardown(() => {
    mock.restoreAll()
  })

  test('successfully fetches data via GET request with correct query params', async ({
    assert,
  }) => {
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      { name: string }
    >
    const mockVariables = { name: 'World' }
    const mockResponseData = { data: { hello: 'Hello World' } }

    const mockFetch = mock.fn(async () => ({
      ok: true,
      json: async () => mockResponseData,
    }))
    mock.method(global, 'fetch', mockFetch)

    const result = await client.fetch(mockDocument, mockVariables)

    assert.equal(mockFetch.mock.calls.length, 1)
    const [calledUrl, calledInit] = mockFetch.mock.calls[0].arguments as unknown as [
      string,
      RequestInit,
    ]

    const url = new URL(calledUrl)
    assert.equal(url.origin, 'https://www.start.gg')
    assert.equal(url.pathname, '/api/-/gql')
    assert.include(url.searchParams.get('query'), 'query TestQuery {\n  hello\n}')
    assert.deepEqual(JSON.parse(url.searchParams.get('variables') || '{}'), mockVariables)

    assert.equal(calledInit.method, 'GET')
    assert.equal(calledInit.credentials, 'omit')
    assert.equal(calledInit.mode, 'cors')
    assert.deepEqual(result, mockResponseData)
  })

  test('merges custom RequestInit options', async ({ assert }) => {
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    const mockFetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({ data: { hello: 'yes' } }),
    }))
    mock.method(global, 'fetch', mockFetch)

    await client.fetch(mockDocument, {}, { headers: { 'X-Test': 'true' } })

    const [, calledInit] = mockFetch.mock.calls[0].arguments as unknown as [string, RequestInit]
    assert.deepEqual(calledInit.headers, { 'X-Test': 'true' })
    assert.equal(calledInit.credentials, 'omit')
  })

  test('throws error if response is not ok', async ({ assert }) => {
    const mockDocument = parse('query TestQuery { hello }') as TadaDocumentNode<
      { hello: string },
      Record<string, never>
    >

    const mockFetch = mock.fn(async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    }))
    mock.method(global, 'fetch', mockFetch)

    await assert.rejects(
      async () => await client.fetch(mockDocument, {}),
      'Start.gg API Error: 500 - Internal Server Error'
    )
  })
})
