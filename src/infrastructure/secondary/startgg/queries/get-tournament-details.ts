import { graphql } from 'gql.tada'

export const getTournamentDetails = graphql(`
  query GetTournamentDetails($id: ID!) {
    tournament(id: $id) {
      id
      name
      numAttendees
      events {
        id
        videogame {
          id
          name
        }
        isOnline
        isTeams
        isSingleBracket
        isFFA
        type
        numEntrants
      }
    }
  }
`)
