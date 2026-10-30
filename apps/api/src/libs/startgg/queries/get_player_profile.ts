import { graphql } from '#/graphql'

export const getPlayerProfile = graphql(`
  query GetPlayerProfile($playerId: ID!) {
    player(id: $playerId) {
      prefix
      gamerTag
      user {
        images(type: "profile") {
          url
        }
      }
    }
  }
`)
