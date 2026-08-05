import type { TadaDocumentNode } from '#/graphql'
import { print } from 'graphql'

export interface IStartggClient {
  fetch: <TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    variables: TVariables,
    init?: RequestInit,
  ) => Promise<{
    data: TResult
  }>
}

export class StartggClient implements IStartggClient {
  async fetch<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    variables: TVariables,
    init?: RequestInit,
  ) {
    const query = print(document)
    const url = `https://www.start.gg/api/-/gql?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(
      JSON.stringify(variables),
    )}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      mode: 'cors',
      ...init,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Start.gg API Error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return result as {
      data: TResult
    }
  }
}
