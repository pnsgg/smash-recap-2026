import { graphql } from '#/graphql'

export const getTournamentsOrganized = graphql(`
  query GetTournamentOrganized($slug: String!, $page: Int, $perPage: Int) {
    user(slug: $slug) {
      tournaments(
        query: {
          page: $page
          perPage: $perPage
          filter: { past: true, upcoming: false, tournamentView: "admin" }
        }
      ) {
        pageInfo {
          totalPages
        }
        nodes {
          id
          startAt
        }
      }
    }
  }
`)
