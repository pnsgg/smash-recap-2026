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
    this.id = params.id
    this.orderNum = params.orderNum
    this.winnerId = params.winnerId
    this.stage = params.stage
    this.selections = params.selections
  }
}
