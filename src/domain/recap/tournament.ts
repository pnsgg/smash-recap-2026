import type { TournamentId } from '#/domain/shared-kernel/ids'
import type { Event } from '#/domain/recap/event'
import type { Address } from '#/domain/recap/address'

export class Tournament {
  constructor(
    public readonly id: TournamentId,
    public readonly name: string,
    public readonly address: Address | null,
    public readonly events: Event[],
  ) {}
}
