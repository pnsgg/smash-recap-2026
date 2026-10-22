import { graphql } from '#/graphql'

export const getTournamentDetails = graphql(`
  query GetTournamentDetails($id: ID!) {
    tournament(id: $id) {
      id
      name
      startAt
      timezone
      numAttendees
      events {
        id
        name
        type
        videogame {
          id
          name
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
