export enum BracketType {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS',
  EXHIBITION = 'EXHIBITION',
  CUSTOM_SCHEDULE = 'CUSTOM_SCHEDULE',
  MATCHMAKING = 'MATCHMAKING',
  ELIMINATION_ROUNDS = 'ELIMINATION_ROUNDS',
  RACE = 'RACE',
  CIRCUIT = 'CIRCUIT',
}

export class BracketTypeHelper {
  static fromString(value: string | null | undefined): BracketType {
    if (!value || !(value in BracketType)) {
      throw new Error(`Invalid BracketType: ${value}`)
    }

    return BracketType[value as keyof typeof BracketType]
  }

  static toString(type: BracketType): string {
    return type
  }
}
