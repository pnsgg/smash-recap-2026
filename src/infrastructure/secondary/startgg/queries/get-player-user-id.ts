import { graphql } from 'gql.tada'

export const getPlayerUserId = graphql(`
  query GetPlayerUserId($slug: String!) {
    user(slug: $slug) {
      id
      player {
        prefix
        gamerTag
      }
    }
  }
`)
