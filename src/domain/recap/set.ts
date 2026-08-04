import type { SetId, EventId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Game } from '#/domain/recap/game'
import { Seed } from '#/domain/recap/seed'
import type { BracketType } from '#/domain/recap/bracket-type'
import type { Character } from '#/domain/recap/character'
import type { Stage } from '#/domain/recap/stage'

export type SetPlayerParams = {
  playerId: PlayerId
  seed: Seed
  score: number
  isDisqualified: boolean
}

export class SetPlayer {
  public readonly playerId: PlayerId
  public readonly seed: Seed
  public readonly score: number
  public readonly isDisqualified: boolean

  constructor(params: SetPlayerParams) {
    this.checkPreconditions(params)
    this.playerId = params.playerId
    this.seed = params.seed
    this.score = params.score
    this.isDisqualified = params.isDisqualified
  }

  private checkPreconditions(params: SetPlayerParams) {
    if (params.score < 0) {
      throw new Error(
        `Invalid parameter score: ${params.score}. Value must be non-negative.`,
      )
    }
  }
}

export type SetParams = {
  id: SetId
  eventId: EventId
  competitors: Map<PlayerId, SetPlayer>
  winnerId: PlayerId
  round: number
  fullRoundText: string
  games: Game[]
  completedAt: Date | null
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

  constructor(params: SetParams) {
    this.checkPreconditions(params)

    this.id = params.id
    this.eventId = params.eventId
    this.competitors = params.competitors
    this.winnerId = params.winnerId
    this.round = params.round
    this.fullRoundText = params.fullRoundText
    this.games = params.games
    this.completedAt = params.completedAt
  }

  private checkPreconditions(params: SetParams) {
    if (!params.fullRoundText || params.fullRoundText.trim() === '') {
      throw new Error(
        `Invalid parameter full round text: ${params.fullRoundText}. Value cannot be empty.`,
      )
    }
    const orderNums = params.games.map((g) => g.orderNum).sort((a, b) => a - b)
    for (let i = 0; i < orderNums.length; i++) {
      if (orderNums[i] !== i + 1) {
        throw new Error(
          `Invalid parameter games: order numbers must start at 1 and be sequential without gaps.`,
        )
      }
    }
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

  /**
   * Checks if this set was won with a clean sweep (opponent score was exactly 0).
   * Excludes disqualified sets.
   */
  isCleanSweep(): boolean {
    const winner = this.competitors.get(this.winnerId)
    const loser = Array.from(this.competitors.values()).find(
      (c) => c.playerId !== this.winnerId,
    )
    if (!winner || !loser) return false
    return !winner.isDisqualified && !loser.isDisqualified && loser.score === 0
  }

  /**
   * Checks if this set went to the deciding game (score difference is exactly 1).
   * Excludes disqualified sets.
   */
  isDecidingGameSet(): boolean {
    const competitors = Array.from(this.competitors.values())
    if (competitors.length < 2) return false
    const c1 = competitors[0]
    const c2 = competitors[1]
    if (c1.isDisqualified || c2.isDisqualified) return false
    return Math.abs(c1.score - c2.score) === 1
  }

  /**
   * Checks if the specified player was disqualified in this set.
   */
  isPlayerDisqualified(playerId: PlayerId): boolean {
    const competitor = this.competitors.get(playerId)
    return competitor ? competitor.isDisqualified : false
  }

  /**
   * Retrieves characters played by a player in this set.
   */
  getPlayerCharacters(playerId: PlayerId): Character[] {
    const characters: Character[] = []
    for (const game of this.games) {
      const char = game.getPlayerCharacter(playerId)
      if (char) {
        characters.push(char)
      }
    }
    return characters
  }

  getOpponentCharacters(playerId: PlayerId): Character[] {
    if (!this.competitors.has(playerId)) return []
    const opponentId = Array.from(this.competitors.keys()).find(
      (id) => id !== playerId,
    )
    if (!opponentId) return []
    return this.getPlayerCharacters(opponentId)
  }

  /**
   * Retrieves stage activity outcome for a player in this set's games.
   * Excludes disqualified sets.
   */
  getStageActivity(playerId: PlayerId): { stage: Stage; won: boolean }[] {
    if (!this.competitors.has(playerId)) return []
    const isDq = Array.from(this.competitors.values()).some(
      (c) => c.isDisqualified,
    )
    if (isDq) return []

    const activity: { stage: Stage; won: boolean }[] = []
    for (const game of this.games) {
      const act = game.getStageActivity(playerId)
      if (act) {
        activity.push(act)
      }
    }
    return activity
  }

  /**
   * Retrieves player loss records against opponent characters in this set.
   * Excludes disqualified sets.
   */
  getPlayerLossesAgainstCharacters(
    playerId: PlayerId,
  ): { opponentCharacter: Character; lost: boolean }[] {
    if (!this.competitors.has(playerId)) return []
    const isDq = Array.from(this.competitors.values()).some(
      (c) => c.isDisqualified,
    )
    if (isDq) return []

    const records: { opponentCharacter: Character; lost: boolean }[] = []
    for (const game of this.games) {
      const record = game.getPlayerLossAgainstCharacter(playerId)
      if (record) {
        records.push(record)
      }
    }
    return records
  }

  /**
   * Retrieves player IDs of opponents faced in this set.
   */
  getOpponentPlayerIds(playerId: PlayerId): PlayerId[] {
    if (!this.competitors.has(playerId)) return []
    return Array.from(this.competitors.keys()).filter((id) => id !== playerId)
  }
}
