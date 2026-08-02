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
  constructor(
    public readonly id: GameId,
    public readonly orderNum: number,
    public readonly winnerId: PlayerId | null,
    public readonly stage: Stage | null,
    public readonly selections: GameSelection[],
  ) {}
}
