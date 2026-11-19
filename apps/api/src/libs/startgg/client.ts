import type { TadaDocumentNode } from '#/graphql'
import { type OperationDefinitionNode, print } from 'graphql'
import { annotate, increment } from '#plugins/wide_event'

const MAX_RETRIES = 3

export interface StartggClientInterface {
  fetch: <TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    variables: TVariables,
    init?: RequestInit
  ) => Promise<{
    data: TResult
  }>
}

export class StartggClient implements StartggClientInterface {
  async fetch<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    variables: TVariables,
    init?: RequestInit
  ) {
    const operation =
      document.definitions.find((d): d is OperationDefinitionNode => d.kind === 'OperationDefinition')?.name?.value ??
      'anonymous'
    const query = print(document).replace(/\s+/g, ' ').trim()
    const url = `https://www.start.gg/api/-/gql?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(
      JSON.stringify(variables)
    )}`

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const started = performance.now()
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        mode: 'cors',
        ...init,
      }).catch((error: unknown) => {
        increment('startgg', 'network_error_count')
        throw error
      })
      increment('startgg', 'request_count')
      increment('startgg', 'summed_fetch_ms', Math.round(performance.now() - started))
      increment('startgg_operations', operation)

      if (response.status === 429) {
        increment('startgg', 'rate_limited_count')
        if (attempt === MAX_RETRIES) throw new Error('Start.gg rate limit exceeded after retries')
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      if (!response.ok) {
        increment('startgg', 'error_count')
        annotate({ startgg: { last_error_status: response.status, last_error_operation: operation } })
        const errorText = await response.text()
        throw new Error(`Start.gg API Error: ${response.status} - ${errorText}`)
      }

      const body = (await response.json()) as { data: TResult; errors?: unknown[] }
      if (body.errors?.length) increment('startgg', 'graphql_error_count')
      return body
    }

    throw new Error('Start.gg fetch failed: unreachable')
  }
}
