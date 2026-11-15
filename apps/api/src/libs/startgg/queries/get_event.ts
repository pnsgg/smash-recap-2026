import { graphql } from '#/graphql'

export const getEvent = graphql(`
  query GetEvent($eventId: ID!, $userId: ID!, $setsPage: Int!, $setsPerPage: Int!) {
    event(id: $eventId) {
      id
      slug
      name
      isOnline
      type
      numEntrants
      state
      videogame {
        id
        name
      }
      tournament {
        id
        name
        startAt
        timezone
        city
        addrState
        countryCode
        lat
        lng
        images(type: "profile") {
          url
        }
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
        paginatedSets(page: $setsPage, perPage: $setsPerPage, filters: { hideEmpty: true }) {
          pageInfo {
            totalPages
          }
          nodes {
            id
            round
            fullRoundText
            bestOf
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
                initialSeedNum
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
                participant {
                  player {
                    id
                  }
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
