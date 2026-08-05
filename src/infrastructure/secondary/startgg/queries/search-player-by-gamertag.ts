import { graphql } from 'gql.tada'

export const searchPlayerByGamerTag = graphql(`
  query SearchPlayerByGamerTag($query: PlayerQuery!) {
    players(query: $query) {
      nodes {
        prefix
        gamerTag
        user {
          id
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
