import type { GameId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Character } from '#/domain/recap/character'
import type { Stage } from '#/domain/recap/stage'

export type GameSelectionParams = {
  playerId: PlayerId
  character: Character
}

/**
 * Represents a character selection in a game.
 *
 * Difference between playerId and entrantId:
 * - playerId: Identifies the specific individual player who selected and played the character.
 *   Used for player-specific stats (e.g. "what characters did this player play?").
 * - entrantId: Identifies the entrant team (or single player registration) in the bracket.
 *   In 1v1 events, entrantId maps 1-to-1 with playerId.
 *   In team events (like 2v2 doubles), multiple selections will share the same entrantId (the team ID)
 *   but have different playerIds. This allows us to distinguish teammates from opponents.
 */
export class GameSelection {
  constructor(
    public readonly playerId: PlayerId,
    public readonly character: Character,
    public readonly entrantId?: string,
  ) {}
}

export type GameParams = {
  id: GameId
  orderNum: number
  winnerId: PlayerId | null
  stage: Stage | null
  selections: GameSelection[]
}

export class Game {
  public readonly id: GameId
  public readonly orderNum: number
  public readonly winnerId: PlayerId | null
  public readonly stage: Stage | null
  public readonly selections: GameSelection[]

  constructor(params: GameParams) {
    this.checkPreconditions(params)

    this.id = params.id
    this.orderNum = params.orderNum
    this.winnerId = params.winnerId
    this.stage = params.stage
    this.selections = params.selections
  }

  private checkPreconditions(params: GameParams) {
    if (params.orderNum <= 0) {
      throw new Error(
        `Invalid parameter order num: ${params.orderNum}. Value has to be strictly positive.`,
      )
    }
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

    const opponentSelection = this.selections.find((s) => {
      if (s.entrantId && mySelection.entrantId) {
        return s.entrantId !== mySelection.entrantId
      }
      return s.playerId !== playerId
    })
    if (!opponentSelection) return null

    return {
      opponentCharacter: opponentSelection.character,
      lost: this.winnerId !== playerId,
    }
  }
}
