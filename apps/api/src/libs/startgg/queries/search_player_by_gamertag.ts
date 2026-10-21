import { graphql } from '#/graphql'

export const searchPlayerByGamerTag = graphql(`
  query SearchPlayerByGamerTag($query: PlayerQuery!) {
    players(query: $query) {
      nodes {
        id
        prefix
        gamerTag
        user {
          slug
          location {
            country
          }
          images(type: "profile") {
            url
          }
          events(query: { sortBy: "startAt DESC" }) {
            pageInfo {
              total
            }
          }
        }
      }
    }
  }
`)
