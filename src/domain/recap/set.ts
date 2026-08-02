import type { SetId, EventId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Game } from '#/domain/recap/game'
import type { Seed } from '#/domain/recap/seed'

export class SetPlayer {
  constructor(
    public readonly playerId: PlayerId,
    public readonly seed: Seed,
    public readonly score: number,
    public readonly isDisqualified: boolean,
  ) {}
}

export class Set {
  constructor(
    public readonly id: SetId,
    public readonly eventId: EventId,
    public readonly player1: SetPlayer,
    public readonly player2: SetPlayer,
    public readonly winnerId: PlayerId,
    public readonly round: number,
    public readonly fullRoundText: string,
    public readonly games: Game[],
    public readonly completedAt: Date | null,
  ) {}
}
