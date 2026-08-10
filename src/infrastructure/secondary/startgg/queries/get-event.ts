import { graphql } from 'gql.tada'

export const getEvent = graphql(`
  query GetEvent($eventId: ID!, $userId: ID!) {
    event(id: $eventId) {
      id
      name
      isOnline
      type
      videogame {
        id
        name
      }
      tournament {
        id
        name
        startAt
        city
        addrState
        countryCode
        lat
        lng
      }
      phases {
        phaseOrder
        phaseGroups(query: { page: 1, perPage: 50 }) {
          nodes {
            id
            bracketType
          }
        }
      }
      userEntrant(userId: $userId) {
        id
        name
        isDisqualified
        initialSeedNum
        players {
          id
        }
        standing {
          placement
        }
        paginatedSets(filters: { hideEmpty: true }) {
          nodes {
            id
            round
            fullRoundText
            completedAt
            winnerId
            phaseGroup {
              bracketType
            }
            slots(includeByes: false) {
              entrant {
                id
                name
                isDisqualified
                players {
                  id
                }
                standing {
                  placement
                }
              }
              seed {
                seedNum
              }
              standing {
                stats {
                  score {
                    value
                  }
                }
              }
            }
            games {
              id
              orderNum
              winnerId
              stage {
                id
                name
              }
              selections {
                entrant {
                  id
                }
                character {
                  id
                  name
                }
                selectionType
              }
            }
          }
        }
      }
    }
  }
`)
