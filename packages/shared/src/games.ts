/**
 * The games a player recap can be made for: Melee, Brawl and Ultimate, and both Rivals of Aether.
 * `id` is the start.gg videogame ID the recap API takes as `videogameId`; `short` is the name
 * players use. Organiser recaps are not per game: they count every game a TO ran.
 */
export const GAMES = [
  { id: '1', name: 'Super Smash Bros. Melee', short: 'Melee', series: 'Super Smash Bros.' },
  { id: '5', name: 'Super Smash Bros. Brawl', short: 'Brawl', series: 'Super Smash Bros.' },
  { id: '1386', name: 'Super Smash Bros. Ultimate', short: 'Ultimate', series: 'Super Smash Bros.' },
  { id: '24', name: 'Rivals of Aether', short: 'Rivals of Aether', series: 'Rivals of Aether' },
  { id: '53945', name: 'Rivals of Aether II', short: 'Rivals of Aether II', series: 'Rivals of Aether' },
] as const

export type Game = (typeof GAMES)[number]
export type GameId = Game['id']

/** The recap API's default when no `videogameId` is given (apps/api/src/routes/recap/index.ts). */
export const DEFAULT_GAME: Game = GAMES.find((game) => game.id === '1386')!

/** The supported game with this start.gg videogame ID, or undefined. */
export const findGame = (id: string | null | undefined): Game | undefined => GAMES.find((game) => game.id === id)
