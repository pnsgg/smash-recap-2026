import { graphql } from '#/graphql'

export const getPlayerUserId = graphql(`
  query GetPlayerUserId($slug: String!) {
    user(slug: $slug) {
      id
      images(type: "profile") {
        url
      }
      player {
        id
        prefix
        gamerTag
      }
    }
  }
`)
