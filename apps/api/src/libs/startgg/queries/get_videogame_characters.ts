import { graphql } from '#/graphql'

/** Every character of a game with its pictures, in one request instead of on every game selection. */
export const getVideogameCharacters = graphql(`
  query GetVideogameCharacters($videogameId: ID!) {
    videogame(id: $videogameId) {
      characters {
        id
        images {
          url
          type
        }
      }
    }
  }
`)
