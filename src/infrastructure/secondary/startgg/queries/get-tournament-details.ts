import { graphql } from 'gql.tada'

export const getTournamentDetails = graphql(`
  query GetTournamentDetails($id: ID!) {
    tournament(id: $id) {
      id
      name
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
