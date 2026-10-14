import type { TadaDocumentNode } from '#/graphql'
import { print } from 'graphql'

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
    const query = print(document).replace(/\s+/g, ' ').trim()
    const url = `https://www.start.gg/api/-/gql?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(
      JSON.stringify(variables)
    )}`

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        mode: 'cors',
        ...init,
      })

      if (response.status === 429) {
        if (attempt === MAX_RETRIES) throw new Error('Start.gg rate limit exceeded after retries')
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Start.gg API Error: ${response.status} - ${errorText}`)
      }

      return (await response.json()) as { data: TResult }
    }

    throw new Error('Start.gg fetch failed: unreachable')
  }
}
