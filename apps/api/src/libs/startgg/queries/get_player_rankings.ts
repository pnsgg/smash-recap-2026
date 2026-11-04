import { graphql } from '#/graphql'

export const getPlayerRankings = graphql(`
  query GetPlayerRankings($playerId: ID!, $videogameId: ID!) {
    player(id: $playerId) {
      rankings(limit: 20, videogameId: $videogameId) {
        rank
        previousRank
        iteration {
          title
          startAt
          endAt
          series {
            name
            images(type: "icon") {
              url
            }
          }
        }
      }
    }
  }
`)
