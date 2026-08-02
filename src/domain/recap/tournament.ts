import type { TournamentId } from '#/domain/shared-kernel/ids'
import type { Event } from '#/domain/recap/event'

export class Tournament {
  constructor(
    public readonly id: TournamentId,
    public readonly name: string,
    public readonly events: Event[],
  ) {}
}
