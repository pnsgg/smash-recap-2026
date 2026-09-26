import { graphql } from '#/graphql'

export const getPlayerUserId = graphql(`
  query GetPlayerUserId($slug: String!) {
    user(slug: $slug) {
      id
      player {
        id
        prefix
        gamerTag
      }
    }
  }
`)
