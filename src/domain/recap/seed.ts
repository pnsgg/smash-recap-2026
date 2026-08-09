import { BracketType } from '#/domain/recap/bracket-type'

export type SeedParams = {
  initialSeed: number
  finalPlacement: number
}

export class Seed {
  constructor(
    public readonly initialSeed: number,
    public readonly finalPlacement: number,
  ) {
    this.checkPreconditions({ initialSeed, finalPlacement })
  }

  private checkPreconditions(params: SeedParams) {
    if (params.initialSeed <= 0) {
      throw new Error(
        `Invalid parameter seed: ${params.initialSeed}. Value has to be strictly positive.`,
      )
    }
    if (params.finalPlacement <= 0) {
      throw new Error(
        `Invalid parameter final placement: ${params.finalPlacement}. Values has to be strictly positive.`,
      )
    }
  }
  /**
   * Computes the Rounds From Victory (RFV) for a given placement.
   *
   * Note: This calculation is only mathematically supported for DOUBLE_ELIMINATION and SINGLE_ELIMINATION brackets.
   *
   * Returns null if the bracket type does not support standard RFV calculations.
   */
  static roundsFromVictory(
    placement: number,
    bracket: BracketType,
  ): number | null {
    if (bracket === BracketType.SINGLE_ELIMINATION) {
      return Math.ceil(Math.log2(placement))
    }
    if (bracket === BracketType.DOUBLE_ELIMINATION) {
      if (placement === 1) return 0
      return (
        Math.floor(Math.log2(placement - 1)) +
        Math.ceil(Math.log2((2 / 3) * placement))
      )
    }
    return null
  }

  /**
   * Computes the Seeding Performance Rating (SPR) for this seed.
   *
   * Note: This calculation is only supported for DOUBLE_ELIMINATION and SINGLE_ELIMINATION brackets.
   */
  seedingPerformanceRating(bracket: BracketType): number | null {
    const expectedRFV = Seed.roundsFromVictory(this.initialSeed, bracket)
    const actualRFV = Seed.roundsFromVictory(this.finalPlacement, bracket)
    if (expectedRFV === null || actualRFV === null) return null
    return expectedRFV - actualRFV
  }

  /**
   * Computes the upset factor of a match between two seeds.
   * A positive number indicates the player upset the opponent.
   * Note: This calculation is only supported for DOUBLE_ELIMINATION and SINGLE_ELIMINATION brackets.
   */
  static upsetFactor(
    playerSeed: number,
    opponentSeed: number,
    bracket: BracketType,
  ): number | null {
    const playerRFV = Seed.roundsFromVictory(playerSeed, bracket)
    const opponentRFV = Seed.roundsFromVictory(opponentSeed, bracket)
    if (playerRFV === null || opponentRFV === null) return null
    return playerRFV - opponentRFV
  }
}
