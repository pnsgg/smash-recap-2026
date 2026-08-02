import type { SetId, EventId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Game } from '#/domain/recap/game'
import { Seed } from '#/domain/recap/seed'
import type { BracketType } from '#/domain/recap/bracket-type'

export class SetPlayer {
  public readonly playerId: PlayerId
  public readonly seed: Seed
  public readonly score: number
  public readonly isDisqualified: boolean

  constructor(params: {
    playerId: PlayerId
    seed: Seed
    score: number
    isDisqualified: boolean
  }) {
    this.playerId = params.playerId
    this.seed = params.seed
    this.score = params.score
    this.isDisqualified = params.isDisqualified
  }
}

export class Set {
  public readonly id: SetId
  public readonly eventId: EventId
  public readonly competitors: Map<PlayerId, SetPlayer>
  public readonly winnerId: PlayerId
  public readonly round: number
  public readonly fullRoundText: string
  public readonly games: Game[]
  public readonly completedAt: Date | null

  constructor(params: {
    id: SetId
    eventId: EventId
    competitors: Map<PlayerId, SetPlayer>
    winnerId: PlayerId
    round: number
    fullRoundText: string
    games: Game[]
    completedAt: Date | null
  }) {
    this.id = params.id
    this.eventId = params.eventId
    this.competitors = params.competitors
    this.winnerId = params.winnerId
    this.round = params.round
    this.fullRoundText = params.fullRoundText
    this.games = params.games
    this.completedAt = params.completedAt
  }

  /**
   * Checks if this set was an upset based on competitor seeding.
   */
  isUpset(bracket: BracketType): boolean {
    const uf = this.upsetFactor(bracket)
    return uf !== null && uf > 0
  }

  /**
   * Computes the upset factor of this set.
   * Returns a positive number if it was an upset, a negative number if it was expected, or null if unsupported.
   */
  upsetFactor(bracket: BracketType): number | null {
    const winner = this.competitors.get(this.winnerId)
    const loser = Array.from(this.competitors.values()).find(
      (c) => c.playerId !== this.winnerId,
    )
    if (!winner || !loser) return null
    return Seed.upsetFactor(
      winner.seed.initialSeed,
      loser.seed.initialSeed,
      bracket,
    )
  }
}
