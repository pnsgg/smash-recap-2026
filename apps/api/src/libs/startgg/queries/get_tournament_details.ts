import { graphql } from '#/graphql'

export const getTournamentDetails = graphql(`
  query GetTournamentDetails($id: ID!) {
    tournament(id: $id) {
      id
      name
      startAt
      timezone
      numAttendees
      images(type: "profile") {
        url
      }
      events {
        id
        name
        type
        videogame {
          id
          name
          images(type: "primary") {
            url
          }
        }
        isOnline
        numEntrants
        phaseGroups {
          bracketType
        }
      }
    }
  }
`)
