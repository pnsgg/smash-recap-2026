import type { TournamentId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Event } from '#/domain/recap/event'
import type { Address } from '#/domain/recap/address'
import type { Set } from '#/domain/recap/set'
import type { Stage } from '#/domain/recap/stage'
import type { Character } from '#/domain/recap/character'

export type TournamentParams = {
  id: TournamentId
  name: string
  address: Address | null
  events: Event[]
  startDate: Date
}

export class Tournament {
  public readonly id: TournamentId
  public readonly name: string
  public readonly address: Address | null
  public readonly events: Event[]
  public readonly startDate: Date

  constructor(params: TournamentParams) {
    this.checkPreconditions(params)
    this.id = params.id
    this.name = params.name
    this.address = params.address
    this.events = params.events
    this.startDate = params.startDate
  }

  private checkPreconditions(params: TournamentParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(
        `Invalid parameter name: ${params.name}. Value cannot be empty.`,
      )
    }
  }

  /**
   * Computes the Seeding Performance Rating (SPR) of a player for this tournament.
   * Returns the maximum SPR achieved in any of the tournament's events, or null if none.
   */
  getPlayerSPR(playerId: PlayerId): number | null {
    let maxSpr: number | null = null
    for (const event of this.events) {
      const spr = event.getPlayerSPR(playerId)
      if (spr !== null) {
        if (maxSpr === null || spr > maxSpr) {
          maxSpr = spr
        }
      }
    }
    return maxSpr
  }

  /**
   * Finds the player's highest upset (win against a higher seeded player) in this tournament.
   */
  getPlayerHighestUpset(
    playerId: PlayerId,
  ): { set: Set; event: Event; factor: number } | null {
    let bestUpset: { set: Set; event: Event; factor: number } | null = null
    for (const event of this.events) {
      const upset = event.getPlayerHighestUpset(playerId)
      if (upset) {
        if (bestUpset === null || upset.factor > bestUpset.factor) {
          bestUpset = { set: upset.set, event, factor: upset.factor }
        }
      }
    }
    return bestUpset
  }

  /**
   * Aggregates stage activity outcomes for a player in this tournament.
   */
  getStageActivity(playerId: PlayerId): { stage: Stage; won: boolean }[] {
    return this.events.flatMap((event) => event.getStageActivity(playerId))
  }

  /**
   * Counts total sets played by a player in this tournament.
   */
  getPlayerSetsCount(playerId: PlayerId): number {
    return this.events.reduce(
      (sum, event) => sum + event.getPlayerSetsCount(playerId),
      0,
    )
  }

  /**
   * Aggregates losses against characters for a player in this tournament.
   */
  getPlayerLossesAgainstCharacters(
    playerId: PlayerId,
  ): { opponentCharacter: Character; lost: boolean }[] {
    return this.events.flatMap((event) =>
      event.getPlayerLossesAgainstCharacters(playerId),
    )
  }

  /**
   * Aggregates opponent player IDs faced in this tournament.
   */
  getOpponentPlayerIds(playerId: PlayerId): PlayerId[] {
    return this.events.flatMap((event) => event.getOpponentPlayerIds(playerId))
  }
}
