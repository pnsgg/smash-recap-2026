import type { TadaDocumentNode } from '#/graphql'
import type { IFetcher } from '#/infrastructure/secondary/startgg/fetcher'
import { parse, print } from 'graphql'

type AnyResult = Record<string, unknown>
type AnyVariables = Record<string, unknown>

export class InMemoryFetcher implements IFetcher {
  private readonly handlers = new Map<
    string,
    (variables: AnyVariables) => AnyResult
  >()

  /**
   * Registers a response handler for a given GraphQL document.
   * @param document The GraphQL document to match
   * @param handler A function receiving the query variables and returning the data
   */
  register<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    handler: (variables: TVariables) => TResult,
  ): this {
    const key = print(parse(print(document)))
    this.handlers.set(key, handler as (variables: AnyVariables) => AnyResult)
    return this
  }

  async fetch<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    variables: TVariables,
  ): Promise<{ data: TResult }> {
    const key = print(parse(print(document)))
    const handler = this.handlers.get(key)

    if (!handler) {
      throw new Error(
        `InMemoryFetcher: No handler registered for query:\n${key}`,
      )
    }

    return { data: handler(variables as AnyVariables) as TResult }
  }
}
