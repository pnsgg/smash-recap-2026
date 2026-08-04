import type { GameId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Character } from '#/domain/recap/character'
import type { Stage } from '#/domain/recap/stage'

export class GameSelection {
  constructor(
    public readonly playerId: PlayerId,
    public readonly character: Character,
  ) {}
}

export class Game {
  public readonly id: GameId
  public readonly orderNum: number
  public readonly winnerId: PlayerId | null
  public readonly stage: Stage | null
  public readonly selections: GameSelection[]

  constructor(params: {
    id: GameId
    orderNum: number
    winnerId: PlayerId | null
    stage: Stage | null
    selections: GameSelection[]
  }) {
    if (params.orderNum <= 0) {
      throw new Error(
        `Invalid parameter order num: ${params.orderNum}. Value has to be strictly positive.`,
      )
    }

    this.id = params.id
    this.orderNum = params.orderNum
    this.winnerId = params.winnerId
    this.stage = params.stage
    this.selections = params.selections
  }

  /**
   * Retrieves the character selected by a specific player in this game.
   */
  getPlayerCharacter(playerId: PlayerId): Character | null {
    const selection = this.selections.find((s) => s.playerId === playerId)
    return selection ? selection.character : null
  }

  /**
   * Retrieves stage and game win information for a player.
   */
  getStageActivity(playerId: PlayerId): { stage: Stage; won: boolean } | null {
    if (!this.stage) return null
    if (this.winnerId === null) return null
    return {
      stage: this.stage,
      won: this.winnerId === playerId,
    }
  }

  /**
   * Analyzes if a player lost this game, returning the opponent's character and the outcome.
   */
  getPlayerLossAgainstCharacter(
    playerId: PlayerId,
  ): { opponentCharacter: Character; lost: boolean } | null {
    if (this.winnerId === null) return null
    const mySelection = this.selections.find((s) => s.playerId === playerId)
    if (!mySelection) return null
    const opponentSelection = this.selections.find(
      (s) => s.playerId !== playerId,
    )
    if (!opponentSelection) return null
    return {
      opponentCharacter: opponentSelection.character,
      lost: this.winnerId !== playerId,
    }
  }
}
