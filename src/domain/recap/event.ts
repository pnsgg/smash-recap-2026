import type { EventId } from '#/domain/shared-kernel/ids'
import type { Participant } from '#/domain/recap/participant'
import type { Set } from '#/domain/recap/set'

export class Event {
  constructor(
    public readonly id: EventId,
    public readonly name: string,
    public readonly participants: Participant[],
    public readonly sets: Set[],
  ) {}

  getFinalRankingUpTo(upTo: number): Participant[] {
    return [...this.participants]
      .sort((p1, p2) => p1.seed.finalPlacement - p2.seed.finalPlacement)
      .slice(0, upTo)
  }
}
