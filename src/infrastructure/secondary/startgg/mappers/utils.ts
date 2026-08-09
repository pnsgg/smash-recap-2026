import { BracketType } from '#/domain/recap/bracket-type'

/**
 * Maps a raw start.gg bracket type string to our domain BracketType enum.
 * Throws exception if the type is unknown.
 */
export function mapBracketType(type: string | null | undefined): BracketType {
  switch (type) {
    case 'SINGLE_ELIMINATION':
      return BracketType.SINGLE_ELIMINATION
    case 'DOUBLE_ELIMINATION':
      return BracketType.DOUBLE_ELIMINATION
    case 'ROUND_ROBIN':
      return BracketType.ROUND_ROBIN
    case 'SWISS':
      return BracketType.SWISS
    case 'EXHIBITION':
      return BracketType.EXHIBITION
    case 'CUSTOM_SCHEDULE':
      return BracketType.CUSTOM_SCHEDULE
    case 'MATCHMAKING':
      return BracketType.MATCHMAKING
    case 'ELIMINATION_ROUNDS':
      return BracketType.ELIMINATION_ROUNDS
    case 'RACE':
      return BracketType.RACE
    case 'CIRCUIT':
      return BracketType.CIRCUIT
    default:
      throw new Error(`Unsupported or missing bracket type: ${type}`)
  }
}
