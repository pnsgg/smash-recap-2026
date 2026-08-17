import { graphql } from '#/graphql'

export const getPlayerEventIds = graphql(`
  query GetPlayerEventIds(
    $slug: String!
    $page: Int!
    $videogameIds: [ID]!
    $eventType: Int
  ) {
    user(slug: $slug) {
      events(
        query: {
          filter: { videogameId: $videogameIds, eventType: $eventType }
          sortBy: "startAt DESC"
          page: $page
        }
      ) {
        pageInfo {
          totalPages
        }
        nodes {
          id
          startAt
        }
      }
    }
  }
`)
