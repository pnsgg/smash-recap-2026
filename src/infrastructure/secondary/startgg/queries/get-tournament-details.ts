import { graphql } from '#/graphql'

export const getTournamentDetails = graphql(`
  query GetTournamentDetails($id: ID!) {
    tournament(id: $id) {
      id
      name
      slug
      shortSlug
      startAt
      owner {
        id
        name
        slug
      }
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
